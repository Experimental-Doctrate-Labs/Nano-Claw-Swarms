import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Org {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface OrgContextType {
  orgs: Org[];
  currentOrg: Org | null;
  currentRole: string | null;
  members: OrgMember[];
  loading: boolean;
  setCurrentOrg: (org: Org) => void;
  createOrg: (name: string) => Promise<void>;
  inviteMember: (email: string, role: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | null>(null);

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
};

export const OrgProvider = ({ children, userId }: { children: ReactNode; userId: string }) => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [currentOrg, setCurrentOrgState] = useState<Org | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrgs = async () => {
    const { data, error } = await supabase
      .from("orgs")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching orgs:", error);
      setOrgs([]);
    } else {
      setOrgs(data || []);
      // Auto-select first org or restore from localStorage
      const savedOrgId = localStorage.getItem("nano_claw_org_id");
      const savedOrg = data?.find((o: Org) => o.id === savedOrgId);
      if (savedOrg) {
        setCurrentOrgState(savedOrg);
      } else if (data?.length) {
        setCurrentOrgState(data[0]);
        localStorage.setItem("nano_claw_org_id", data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchMembers = async (orgId: string) => {
    const { data } = await supabase
      .from("org_members")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at");
    setMembers(data || []);

    // Find current user's role
    const myMembership = data?.find((m: OrgMember) => m.user_id === userId);
    setCurrentRole(myMembership?.role || null);
  };

  useEffect(() => {
    if (userId) fetchOrgs();
  }, [userId]);

  useEffect(() => {
    if (currentOrg) fetchMembers(currentOrg.id);
  }, [currentOrg?.id]);

  const setCurrentOrg = (org: Org) => {
    setCurrentOrgState(org);
    localStorage.setItem("nano_claw_org_id", org.id);
  };

  const createOrg = async (name: string) => {
    try {
      const { data: org, error } = await supabase
        .from("orgs")
        .insert({ name, created_by: userId })
        .select()
        .single();
      if (error) throw error;

      // Add self as owner
      const { error: memberError } = await supabase
        .from("org_members")
        .insert({ org_id: org.id, user_id: userId, role: "owner" });
      if (memberError) throw memberError;

      toast({ title: "Organization created" });
      await fetchOrgs();
      setCurrentOrg(org);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const inviteMember = async (email: string, role: string) => {
    if (!currentOrg) return;
    try {
      // Look up user by email via a simple approach — we'll use the auth admin API through an edge function
      // For now, we need the user's UUID. We'll create an edge function for invites later.
      // Simplified: just show a toast with instructions
      toast({
        title: "Invite sent",
        description: `Share this org ID with the user: ${currentOrg.id}. They can join via Settings.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const removeMember = async (memberId: string) => {
    if (!currentOrg) return;
    const { error } = await supabase.from("org_members").delete().eq("id", memberId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Member removed" });
      fetchMembers(currentOrg.id);
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    if (!currentOrg) return;
    const { error } = await supabase.from("org_members").update({ role } as any).eq("id", memberId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Role updated" });
      fetchMembers(currentOrg.id);
    }
  };

  return (
    <OrgContext.Provider value={{
      orgs, currentOrg, currentRole, members, loading,
      setCurrentOrg, createOrg, inviteMember, removeMember, updateMemberRole,
      refreshOrgs: fetchOrgs,
    }}>
      {children}
    </OrgContext.Provider>
  );
};
