const CATEGORY_COLORS: Record<string, string> = {
  "core-kata": "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  "flow-waza": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "practical-kumite": "bg-red-500/10 text-red-400 border-red-500/30",
  "meta-do": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  uncategorized: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

interface CategoryNavProps {
  categories: Record<string, { icon: string; label: string }>;
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryNav({ categories, selected, onSelect }: CategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
          selected === null
            ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30"
            : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        All
      </button>
      {Object.entries(categories).map(([key, { icon, label }]) => (
        <button
          key={key}
          onClick={() => onSelect(key === selected ? null : key)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            key === selected
              ? CATEGORY_COLORS[key] || CATEGORY_COLORS.uncategorized
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}
