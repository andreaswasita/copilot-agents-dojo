import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { MarkdownViewer } from "./MarkdownViewer.js";

interface Commit {
  sha: string;
  date: string;
  author: string;
  message: string;
  sessionId: string | null;
}

interface TimeMachineProps {
  slug: string;
  currentMarkdown: string;
  onClose: () => void;
  onRestored: () => void;
}

export function TimeMachine({ slug, currentMarkdown, onClose, onRestored }: TimeMachineProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedSha, setSelectedSha] = useState<string | null>(null);
  const [selectedMarkdown, setSelectedMarkdown] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingList(true);
    api.memory
      .history(slug, 100)
      .then((res) => {
        setCommits(res.commits);
        if (res.commits.length > 0) setSelectedSha(res.commits[0].sha);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingList(false));
  }, [slug]);

  useEffect(() => {
    if (!selectedSha) return;
    setLoadingDetail(true);
    setError(null);
    api.memory
      .historyAtSha(slug, selectedSha)
      .then((res) => setSelectedMarkdown(res.markdown))
      .catch((err: Error) => {
        setError(err.message);
        setSelectedMarkdown("");
      })
      .finally(() => setLoadingDetail(false));
  }, [slug, selectedSha]);

  const handleRestore = async () => {
    if (!selectedSha) return;
    if (!confirm(`Restore ${slug} to ${selectedSha.slice(0, 8)}? This will overwrite current content and create a commit.`)) {
      return;
    }
    setRestoring(true);
    setError(null);
    try {
      await api.memory.restore(slug, selectedSha, true);
      onRestored();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>🕰</span> Time Machine
            </h2>
            <p className="text-xs text-[var(--muted)] font-mono">{slug}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-[260px_1fr_1fr] flex-1 overflow-hidden">
          {/* Timeline */}
          <div className="border-r border-[var(--border)] overflow-y-auto bg-[var(--surface)]">
            <div className="p-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Commits ({commits.length})
            </div>
            {loadingList ? (
              <div className="p-3 text-xs text-[var(--muted)]">Loading…</div>
            ) : commits.length === 0 ? (
              <div className="p-3 text-xs text-[var(--muted)]">No git history found.</div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {commits.map((c) => {
                  const active = c.sha === selectedSha;
                  return (
                    <li key={c.sha}>
                      <button
                        onClick={() => setSelectedSha(c.sha)}
                        className={`w-full text-left p-3 hover:bg-[var(--bg)] transition-colors ${
                          active ? "bg-[var(--bg)] border-l-2 border-l-[var(--primary)]" : ""
                        }`}
                      >
                        <div className="font-mono text-xs text-[var(--primary)]">
                          {c.sha.slice(0, 8)}
                        </div>
                        <div className="text-xs text-[var(--text)] mt-1 line-clamp-2">
                          {c.message}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-1 flex items-center gap-2">
                          <span>{new Date(c.date).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className="truncate">{c.author}</span>
                        </div>
                        {c.sessionId && (
                          <div className="text-[10px] text-[var(--muted)] mt-0.5 font-mono">
                            session: {c.sessionId}
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Selected version */}
          <div className="border-r border-[var(--border)] overflow-y-auto p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              At {selectedSha?.slice(0, 8) ?? "—"}
            </div>
            {loadingDetail ? (
              <div className="text-xs text-[var(--muted)]">Loading…</div>
            ) : error ? (
              <div className="text-xs text-red-400">{error}</div>
            ) : (
              <MarkdownViewer content={selectedMarkdown} />
            )}
          </div>

          {/* Current version */}
          <div className="overflow-y-auto p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Current
            </div>
            <MarkdownViewer content={currentMarkdown} />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="text-xs text-[var(--muted)]">
            {selectedSha ? (
              <>
                Selected: <span className="font-mono">{selectedSha.slice(0, 8)}</span>
              </>
            ) : (
              "Select a commit to preview."
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
            >
              Cancel
            </button>
            <button
              onClick={handleRestore}
              disabled={!selectedSha || restoring || loadingDetail}
              className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50"
            >
              {restoring ? "Restoring…" : "Restore this version"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
