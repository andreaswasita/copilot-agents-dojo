import { Link } from "react-router";
import { MEMORY_TYPE_META } from "../hooks/useMemory.js";
import type { MemoryEntry } from "../hooks/useMemory.js";

interface MemoryCardProps {
  entry: MemoryEntry;
}

export function MemoryCard({ entry }: MemoryCardProps) {
  const meta = MEMORY_TYPE_META[entry.type] || MEMORY_TYPE_META.decision;

  return (
    <Link
      to={`/memory/${entry.slug}`}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeftColor: meta.color, borderLeftWidth: "3px" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {meta.icon} {meta.label}
        </span>
        {entry.status && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)] capitalize">
            {entry.status}
          </span>
        )}
        {entry.date && (
          <span className="text-xs text-[var(--muted)] ml-auto font-mono">{entry.date}</span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
        {entry.title}
      </h3>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {entry.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)]"
            >
              #{tag}
            </span>
          ))}
          {entry.tags.length > 4 && (
            <span className="text-xs text-[var(--muted)]">+{entry.tags.length - 4}</span>
          )}
        </div>
      )}
    </Link>
  );
}
