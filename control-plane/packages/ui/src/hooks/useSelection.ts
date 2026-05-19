import { useState, useCallback, useMemo } from "react";

interface Selection {
  skills: Set<string>;
  agents: Set<string>;
}

export function useSelection() {
  const [selection, setSelection] = useState<Selection>({
    skills: new Set(),
    agents: new Set(),
  });

  const toggleSkill = useCallback((slug: string) => {
    setSelection((prev) => {
      const next = new Set(prev.skills);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return { ...prev, skills: next };
    });
  }, []);

  const toggleAgent = useCallback((slug: string) => {
    setSelection((prev) => {
      const next = new Set(prev.agents);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return { ...prev, agents: next };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ skills: new Set(), agents: new Set() });
  }, []);

  const loadFromProfile = useCallback((skills: string[], agents: string[]) => {
    setSelection({
      skills: new Set(skills),
      agents: new Set(agents),
    });
  }, []);

  const totalSelected = useMemo(
    () => selection.skills.size + selection.agents.size,
    [selection.skills.size, selection.agents.size]
  );

  return {
    selectedSkills: selection.skills,
    selectedAgents: selection.agents,
    toggleSkill,
    toggleAgent,
    clearSelection,
    loadFromProfile,
    totalSelected,
    skillSlugs: [...selection.skills],
    agentSlugs: [...selection.agents],
  };
}
