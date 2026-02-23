import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AgentConfig {
  id: string;
  name: string;
  system_prompt: string;
  model_provider: string;
  model_name: string;
  temperature: number;
  max_loops: number;
}

interface WorkflowStep {
  agent_id: string;
  order: number;
}

async function callLLM(
  apiKey: string,
  provider: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  temperature: number
): Promise<{ content: string; tokens: number }> {
  let url: string;
  let headers: Record<string, string>;
  let body: any;

  if (provider === "openai") {
    url = "https://api.openai.com/v1/chat/completions";
    headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    body = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature,
    };
  } else if (provider === "anthropic") {
    url = "https://api.anthropic.com/v1/messages";
    headers = {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    };
    body = {
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      temperature,
    };
  } else if (provider === "groq") {
    url = "https://api.groq.com/openai/v1/chat/completions";
    headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    body = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature,
    };
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`${provider} API error (${resp.status}): ${errText}`);
  }

  const data = await resp.json();

  if (provider === "anthropic") {
    return {
      content: data.content?.[0]?.text || "",
      tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
  }

  return {
    content: data.choices?.[0]?.message?.content || "",
    tokens: data.usage?.total_tokens || 0,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { workflow_id, input } = await req.json();
    if (!workflow_id || !input) throw new Error("workflow_id and input are required");

    // Fetch workflow
    const { data: workflow, error: wfError } = await userClient
      .from("workflows")
      .select("*")
      .eq("id", workflow_id)
      .single();
    if (wfError || !workflow) throw new Error("Workflow not found");

    // Create run
    const { data: run, error: runError } = await supabase
      .from("runs")
      .insert({
        user_id: user.id,
        workflow_id,
        workflow_name: workflow.name,
        status: "running",
        input,
      })
      .select()
      .single();
    if (runError) throw runError;

    // Log start
    await supabase.from("logs").insert({
      user_id: user.id,
      level: "info",
      message: `Run started for workflow "${workflow.name}"`,
      workflow_name: workflow.name,
      run_id: run.id,
    });

    // Fetch agents for this workflow
    const steps = (workflow.steps as WorkflowStep[]) || [];
    const agentIds = [...new Set(steps.map((s) => s.agent_id))];
    const { data: agents } = await userClient
      .from("agents")
      .select("*")
      .in("id", agentIds);

    if (!agents || agents.length === 0) {
      await supabase.from("runs").update({ status: "failed", error: "No agents found", completed_at: new Date().toISOString() }).eq("id", run.id);
      throw new Error("No agents found for this workflow");
    }

    const agentMap = new Map(agents.map((a: any) => [a.id, a as AgentConfig]));

    // Fetch API key for the first agent's provider
    const providers = [...new Set(agents.map((a: any) => a.model_provider))];
    const apiKeyMap = new Map<string, string>();
    for (const provider of providers) {
      const { data: keyData } = await userClient
        .from("provider_keys")
        .select("encrypted_key")
        .eq("provider", provider)
        .limit(1)
        .single();
      if (keyData) {
        apiKeyMap.set(provider, keyData.encrypted_key);
      }
    }

    // Check all providers have keys
    for (const provider of providers) {
      if (!apiKeyMap.has(provider)) {
        await supabase.from("runs").update({
          status: "failed",
          error: `No API key found for provider: ${provider}. Add one in Secrets.`,
          completed_at: new Date().toISOString(),
        }).eq("id", run.id);
        return new Response(JSON.stringify({ error: `No API key for ${provider}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Execute workflow
    let totalTokens = 0;
    const events: any[] = [];
    let currentInput = input;

    try {
      if (workflow.workflow_type === "sequential") {
        // Sequential: pass output of each agent to the next
        for (const step of steps.sort((a, b) => a.order - b.order)) {
          const agent = agentMap.get(step.agent_id);
          if (!agent) continue;

          const apiKey = apiKeyMap.get(agent.model_provider)!;
          const result = await callLLM(apiKey, agent.model_provider, agent.model_name, agent.system_prompt, currentInput, agent.temperature);

          totalTokens += result.tokens;
          currentInput = result.content;

          const event = { agent_name: agent.name, content: result.content, tokens: result.tokens };
          events.push(event);

          // Insert event for realtime
          await supabase.from("run_events").insert({
            run_id: run.id,
            event_type: "chunk",
            agent_name: agent.name,
            data: event,
          });

          await supabase.from("logs").insert({
            user_id: user.id,
            level: "info",
            message: `Agent "${agent.name}" completed (${result.tokens} tokens)`,
            agent_name: agent.name,
            run_id: run.id,
          });
        }
      } else if (workflow.workflow_type === "concurrent") {
        // Concurrent: run all agents in parallel with same input
        const promises = steps.map(async (step) => {
          const agent = agentMap.get(step.agent_id);
          if (!agent) return null;
          const apiKey = apiKeyMap.get(agent.model_provider)!;
          const result = await callLLM(apiKey, agent.model_provider, agent.model_name, agent.system_prompt, input, agent.temperature);
          return { agent, result };
        });

        const results = await Promise.all(promises);
        for (const r of results) {
          if (!r) continue;
          totalTokens += r.result.tokens;
          const event = { agent_name: r.agent.name, content: r.result.content, tokens: r.result.tokens };
          events.push(event);
          currentInput += `\n\n[${r.agent.name}]: ${r.result.content}`;

          await supabase.from("run_events").insert({
            run_id: run.id,
            event_type: "chunk",
            agent_name: r.agent.name,
            data: event,
          });
        }
      } else if (workflow.workflow_type === "hierarchical") {
        // Hierarchical: first agent is director, rest are workers
        const sortedSteps = steps.sort((a, b) => a.order - b.order);
        const directorStep = sortedSteps[0];
        const workerSteps = sortedSteps.slice(1);
        const director = agentMap.get(directorStep.agent_id);

        if (!director) throw new Error("Director agent not found");

        // Director creates sub-tasks
        const directorKey = apiKeyMap.get(director.model_provider)!;
        const directorPrompt = `You are a director agent. Given the following task, break it down into ${workerSteps.length} sub-tasks, one for each worker. Return ONLY a JSON array of strings, each being a sub-task.\n\nTask: ${input}`;
        const directorResult = await callLLM(directorKey, director.model_provider, director.model_name, director.system_prompt, directorPrompt, director.temperature);
        totalTokens += directorResult.tokens;

        events.push({ agent_name: director.name, content: directorResult.content, tokens: directorResult.tokens, role: "director" });
        await supabase.from("run_events").insert({ run_id: run.id, event_type: "chunk", agent_name: director.name, data: events[events.length - 1] });

        // Parse sub-tasks
        let subTasks: string[];
        try {
          const match = directorResult.content.match(/\[[\s\S]*\]/);
          subTasks = match ? JSON.parse(match[0]) : [input];
        } catch {
          subTasks = workerSteps.map(() => input);
        }

        // Workers execute sub-tasks
        const workerPromises = workerSteps.map(async (step, idx) => {
          const agent = agentMap.get(step.agent_id);
          if (!agent) return null;
          const task = subTasks[idx] || input;
          const apiKey = apiKeyMap.get(agent.model_provider)!;
          const result = await callLLM(apiKey, agent.model_provider, agent.model_name, agent.system_prompt, task, agent.temperature);
          return { agent, result, task };
        });

        const workerResults = await Promise.all(workerPromises);
        for (const r of workerResults) {
          if (!r) continue;
          totalTokens += r.result.tokens;
          const event = { agent_name: r.agent.name, content: r.result.content, tokens: r.result.tokens, role: "worker", task: r.task };
          events.push(event);
          currentInput += `\n\n[${r.agent.name}]: ${r.result.content}`;
          await supabase.from("run_events").insert({ run_id: run.id, event_type: "chunk", agent_name: r.agent.name, data: event });
        }
      }

      // Update run as succeeded
      await supabase.from("runs").update({
        status: "succeeded",
        output: currentInput,
        events,
        tokens_used: totalTokens,
        completed_at: new Date().toISOString(),
      }).eq("id", run.id);

      await supabase.from("logs").insert({
        user_id: user.id,
        level: "info",
        message: `Run completed successfully (${totalTokens} tokens)`,
        run_id: run.id,
      });

      return new Response(JSON.stringify({ run_id: run.id, status: "succeeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (execError: any) {
      await supabase.from("runs").update({
        status: "failed",
        error: execError.message,
        events,
        tokens_used: totalTokens,
        completed_at: new Date().toISOString(),
      }).eq("id", run.id);

      await supabase.from("logs").insert({
        user_id: user.id,
        level: "error",
        message: `Run failed: ${execError.message}`,
        run_id: run.id,
      });

      return new Response(JSON.stringify({ run_id: run.id, status: "failed", error: execError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e: any) {
    console.error("run-workflow error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
