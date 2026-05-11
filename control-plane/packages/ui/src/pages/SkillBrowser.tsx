import { useState, useEffect } from "react";
import { useSkills, useTags } from "../hooks/useSkills.js";
import { useSelection } from "../hooks/useSelection.js";
import { SkillCard } from "../components/SkillCard.js";
import { SearchBar } from "../components/SearchBar.js";
import { CategoryNav } from "../components/CategoryNav.js";
import { TagFilter } from "../components/TagFilter.js";
import { SelectionTray } from "../components/SelectionTray.js";
import { api } from "../lib/api.js";

export function SkillBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, { icon: string; label: string }>>({});

  const { skills, loading } = useSkills({
    search: search || undefined,
    category: category || undefined,
    tag: tag || undefined,
  });
  const tags = useTags();
  const selection = useSelection();

  useEffect(() => {
    api.meta.categories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skills Marketplace</h1>
        <p className="text-[var(--muted)] mt-1">Browse, search, and select skills for your project</p>
      </div>

      <div className="space-y-4">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryNav categories={categories} selected={category} onSelect={setCategory} />
        <TagFilter tags={tags} selected={tag} onSelect={setTag} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading skills...</div>
      ) : skills.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">No skills found</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.slug}
              skill={skill}
              selected={selection.selectedSkills.has(skill.slug)}
              onToggle={() => selection.toggleSkill(skill.slug)}
            />
          ))}
        </div>
      )}

      {selection.totalSelected > 0 && (
        <SelectionTray
          skillCount={selection.selectedSkills.size}
          agentCount={selection.selectedAgents.size}
          onClear={selection.clearSelection}
        />
      )}
    </div>
  );
}
