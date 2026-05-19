import { Link } from "react-router";

const CATEGORY_ACCENT: Record<string, string> = {
  "core-kata": "border-l-indigo-500",
  "flow-waza": "border-l-cyan-500",
  "practical-kumite": "border-l-red-500",
  "meta-do": "border-l-amber-500",
  uncategorized: "border-l-gray-500",
};

interface SkillCardProps {
  skill: {
    slug: string;
    name: string;
    description: string;
    category: string;
    categoryIcon: string;
    categoryLabel: string;
    tags: string[];
  };
  selected: boolean;
  onToggle: () => void;
}

export function SkillCard({ skill, selected, onToggle }: SkillCardProps) {
  const accent = CATEGORY_ACCENT[skill.category] || CATEGORY_ACCENT.uncategorized;

  return (
    <div
      className={`group relative rounded-xl border-l-4 ${accent} border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "ring-2 ring-[var(--primary)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link to={`/skills/${skill.slug}`} className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
            {skill.name}
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{skill.description}</p>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-[var(--primary)] border-[var(--primary)] text-white"
              : "border-[var(--border)] hover:border-[var(--primary)]"
          }`}
          aria-label={selected ? "Deselect skill" : "Select skill"}
        >
          {selected && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)]">
          {skill.categoryIcon} {skill.categoryLabel}
        </span>
        {skill.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs text-[var(--muted)]">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
