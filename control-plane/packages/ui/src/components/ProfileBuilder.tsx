import { useState } from "react";
import { api } from "../lib/api.js";

interface ProfileBuilderProps {
  existingSkills: { slug: string; name: string }[];
  existingAgents: { slug: string; name: string }[];
  onCreated: () => void;
}

export function ProfileBuilder({ existingSkills, existingAgents, onCreated }: ProfileBuilderProps) {
  const [name, setName] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggleSkill = (slug: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const toggleAgent = (slug: string) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.profiles.create({
        name: name.trim(),
        skills: [...selectedSkills],
        agents: [...selectedAgents],
        instructions: {},
      });
      setName("");
      setSelectedSkills(new Set());
      setSelectedAgents(new Set());
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
      <h3 className="text-lg font-semibold">Create New Profile</h3>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Profile name..."
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)]"
      />

      <div>
        <h4 className="text-sm font-medium text-[var(--muted)] mb-2">Skills ({selectedSkills.size})</h4>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {existingSkills.map((s) => (
            <button
              key={s.slug}
              onClick={() => toggleSkill(s.slug)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                selectedSkills.has(s.slug)
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-[var(--muted)] mb-2">Agents ({selectedAgents.size})</h4>
        <div className="flex flex-wrap gap-1.5">
          {existingAgents.map((a) => (
            <button
              key={a.slug}
              onClick={() => toggleAgent(a.slug)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                selectedAgents.has(a.slug)
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Saving..." : "Create Profile"}
      </button>
    </div>
  );
}
