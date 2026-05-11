interface TagFilterProps {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, selected, onSelect }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, 20).map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag === selected ? null : tag)}
          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
            tag === selected
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
