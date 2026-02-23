import { useState } from "react";
import { Settings as SettingsIcon, Users, Trash2, Shield } from "lucide-react";
import { useOrg } from "@/contexts/OrgContext";

const roleLabels: Record<string, string> = { owner: "Owner", admin: "Admin", member: "Member", viewer: "Viewer" };
const roleColors: Record<string, string> = {
  owner: "text-claw-gold",
  admin: "text-claw-ember",
  member: "text-foreground",
  viewer: "text-muted-foreground",
};

const ConsoleSettings = () => {
  const { currentOrg, currentRole, members, removeMember, updateMemberRole } = useOrg();
  const [joinOrgId, setJoinOrgId] = useState("");
  const isAdmin = currentRole === "owner" || currentRole === "admin";

  if (!currentOrg) {
    return (
      <div className="glass-panel p-12 text-center">
        <SettingsIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <p className="text-muted-foreground">Create an organization first.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Organization &amp; project configuration</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* General */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-claw-ember" /> General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Organization Name</label>
              <input value={currentOrg.name} readOnly
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Organization ID</label>
              <input value={currentOrg.id} readOnly
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground font-mono focus:outline-none" />
              <p className="text-xs text-muted-foreground mt-1">Share this ID to invite members.</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Your Role</label>
              <span className={`text-sm font-medium capitalize ${roleColors[currentRole || "viewer"]}`}>
                {roleLabels[currentRole || "viewer"]}
              </span>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-claw-ember" /> Members ({members.length})
          </h3>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/20 group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-claw-ember" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{member.user_id.slice(0, 8)}...</p>
                    <span className={`text-xs capitalize ${roleColors[member.role]}`}>{roleLabels[member.role]}</span>
                  </div>
                </div>
                {isAdmin && member.role !== "owner" && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.id, e.target.value)}
                      className="px-2 py-1 rounded bg-input border border-border text-xs text-foreground focus:outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button onClick={() => removeMember(member.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Attribution */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Attribution</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nano Claw Swarms is built on the{" "}
            <a href="https://github.com/kyegomez/swarms" target="_blank" rel="noopener noreferrer" className="text-claw-ember hover:underline">
              Swarms multi-agent orchestration framework
            </a>{" "}
            by Kye Gomez, licensed under Apache License 2.0.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsoleSettings;
