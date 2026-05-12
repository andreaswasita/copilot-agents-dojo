import { useParams, Link } from "react-router";
import { useMemoryEntry, MEMORY_TYPE_META } from "../hooks/useMemory.js";
import { MarkdownViewer } from "../components/MarkdownViewer.js";

export function MemoryDetail() {
  const params = useParams();
  const slug = params["*"] || "";
  const { entry, loading, error } = useMemoryEntry(slug);

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading...</div>;
  if (error || !entry)
    return <div className="text-center py-12 text-red-400">Memory entry not found</div>;

  const meta = MEMORY_TYPE_META[entry.type] || MEMORY_TYPE_META.decision;

  return (
    <div className="space-y-6">
      <Link to="/memory" className="text-sm text-[var(--primary)] hover:underline">
        &larr; Back to Memory Vault
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-3">
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
              <span className="text-xs text-[var(--muted)] font-mono">{entry.date}</span>
            )}
          </div>

          <h1 className="text-3xl font-bold">{entry.title}</h1>

          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <MarkdownViewer content={entry.markdown} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
              Frontmatter
            </h3>
            <dl className="space-y-2 text-sm">
              {Object.entries(entry.frontmatter)
                .filter(([k]) => !["title", "name"].includes(k))
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">{k}</dt>
                    <dd className="text-[var(--text)] break-words">
                      {Array.isArray(v) ? (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {(v as unknown[]).map((item, i) => (
                            <span
                              key={i}
                              className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)]"
                            >
                              {String(item)}
                            </span>
                          ))}
                        </div>
                      ) : v === null ? (
                        <span className="text-[var(--muted)] italic">null</span>
                      ) : typeof v === "object" ? (
                        <pre className="text-xs">{JSON.stringify(v, null, 2)}</pre>
                      ) : (
                        String(v)
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          {entry.tags.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.forwardLinks.length > 0 && (
            <LinkList
              title="Forward Links"
              icon="→"
              links={entry.forwardLinks}
              tone="forward"
            />
          )}

          {entry.backlinks.length > 0 && (
            <LinkList title="Backlinks" icon="←" links={entry.backlinks} tone="back" />
          )}

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
              File
            </h3>
            <code className="text-xs font-mono text-[var(--muted)] break-all">{entry.filePath}</code>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LinkList({
  title,
  icon,
  links,
  tone,
}: {
  title: string;
  icon: string;
  links: string[];
  tone: "forward" | "back";
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1">
        <span>{icon}</span> {title} ({links.length})
      </h3>
      <ul className="space-y-1.5">
        {links.map((target) => {
          const type = target.split("/")[0].replace(/s$/, "");
          const meta = MEMORY_TYPE_META[type];
          return (
            <li key={target}>
              <Link
                to={`/memory/${target}`}
                className="flex items-center gap-2 text-xs hover:text-[var(--primary)] transition-colors"
              >
                <span style={{ color: meta?.color ?? "var(--muted)" }}>{meta?.icon ?? "•"}</span>
                <span className="font-mono text-[var(--muted)] truncate">{target}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
