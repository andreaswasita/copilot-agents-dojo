import { useState, useMemo } from "react";
import { useMemory, useMemoryGraph, useMemoryTags, MEMORY_TYPE_META } from "../hooks/useMemory.js";
import { MemoryCard } from "../components/MemoryCard.js";
import { MemoryGraph } from "../components/MemoryGraph.js";
import { MemoryScaffold } from "../components/MemoryScaffold.js";
import { useNavigate } from "react-router";

const TYPE_TABS = [
  { value: null as string | null, label: "All", icon: "📚", color: "var(--primary)" },
  { value: "decision", label: "Decisions", icon: "🧭", color: "#06b6d4" },
  { value: "pattern", label: "Patterns", icon: "🧩", color: "#6366f1" },
  { value: "preference", label: "Preferences", icon: "⭐", color: "#f59e0b" },
  { value: "session", label: "Sessions", icon: "📝", color: "#ef4444" },
];

export function MemoryBrowser() {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "graph">("list");
  const [type, setType] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [showScaffold, setShowScaffold] = useState(false);

  const filters = useMemo(
    () => ({
      type: type || undefined,
      search: search || undefined,
      tag: tag || undefined,
    }),
    [type, search, tag]
  );

  const { entries, loading, refetch } = useMemory(filters);
  const tags = useMemoryTags();
  const { graph, loading: graphLoading } = useMemoryGraph();

  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.type] = (counts[e.type] || 0) + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>📚</span> Memory Vault
          </h1>
          <p className="text-[var(--muted)] mt-1">
            Decisions, patterns, preferences, and session summaries — connected by wiki-style links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === "list" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("graph")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === "graph" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"
              }`}
            >
              Graph
            </button>
          </div>
          <button
            onClick={() => setShowScaffold((s) => !s)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
          >
            {showScaffold ? "Close" : "+ New entry"}
          </button>
        </div>
      </div>

      {showScaffold && (
        <MemoryScaffold
          onCancel={() => setShowScaffold(false)}
          onCreated={(slug) => {
            setShowScaffold(false);
            refetch();
            navigate(`/memory/${slug}`);
          }}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map((t) => {
          const active = type === t.value;
          const count = t.value === null ? entries.length : counts[t.value] || 0;
          return (
            <button
              key={t.label}
              onClick={() => setType(t.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
              style={{
                backgroundColor: active ? `${t.color}20` : "transparent",
                borderColor: active ? t.color : "var(--border)",
                color: active ? t.color : "var(--muted)",
              }}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)]"
        />
        {tags.length > 0 && (
          <select
            value={tag || ""}
            onChange={(e) => setTag(e.target.value || null)}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        )}
      </div>

      {view === "graph" ? (
        graphLoading ? (
          <div className="text-center py-12 text-[var(--muted)]">Loading graph...</div>
        ) : (
          <MemoryGraph graph={graph} height={620} />
        )
      ) : loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading memory entries...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          No memory entries match your filters.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <MemoryCard key={entry.slug} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
