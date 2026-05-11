import { useEffect, useState } from "react";
import { useProfiles } from "../hooks/useProfiles.js";
import { ProfileBuilder } from "../components/ProfileBuilder.js";
import { api } from "../lib/api.js";

export function Profiles() {
  const { profiles, loading, refetch } = useProfiles();
  const [skills, setSkills] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    api.skills.list().then(setSkills).catch(() => {});
    api.agents.list().then(setAgents).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    await api.profiles.delete(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profiles</h1>
          <p className="text-[var(--muted)] mt-1">Manage skill & agent profiles</p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90"
        >
          {showBuilder ? "Cancel" : "+ New Profile"}
        </button>
      </div>

      {showBuilder && (
        <ProfileBuilder
          existingSkills={skills}
          existingAgents={agents}
          onCreated={() => {
            setShowBuilder(false);
            refetch();
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{profile.name}</h3>
                  {profile.isPreset && (
                    <span className="text-xs text-[var(--accent)] font-medium">Preset</span>
                  )}
                </div>
                {!profile.isPreset && (
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="text-xs text-[var(--muted)]">
                {profile.skills?.length || 0} skills, {profile.agents?.length || 0} agents
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
