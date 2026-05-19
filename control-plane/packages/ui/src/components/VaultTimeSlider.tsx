import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

interface Commit {
  sha: string;
  date: string;
  author: string;
  message: string;
}

interface VaultTimeSliderProps {
  onChange: (sha: string | null) => void;
  active: boolean;
  onToggle: (active: boolean) => void;
}

export function VaultTimeSlider({ onChange, active, onToggle }: VaultTimeSliderProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || commits.length > 0) return;
    setLoading(true);

    fetch("/api/memory")
      .then((r) => r.json())
      .then((entries: Array<{ slug: string }>) => {
        if (entries.length === 0) {
          setLoading(false);
          return;
        }
        return Promise.all(entries.slice(0, 10).map((e) => api.memory.history(e.slug, 50)));
      })
      .then((results) => {
        if (!results) return;
        const seen = new Map<string, Commit>();
        for (const r of results) {
          for (const c of r.commits) {
            if (!seen.has(c.sha)) {
              seen.set(c.sha, {
                sha: c.sha,
                date: c.date,
                author: c.author,
                message: c.message,
              });
            }
          }
        }
        const sorted = Array.from(seen.values()).sort((a, b) => a.date.localeCompare(b.date));
        setCommits(sorted);
        setIndex(sorted.length - 1);
      })
      .finally(() => setLoading(false));
  }, [active, commits.length]);

  useEffect(() => {
    if (!active || commits.length === 0) return;
    const c = commits[index];
    if (c) onChange(c.sha);
  }, [active, commits, index, onChange]);

  useEffect(() => {
    if (!active) onChange(null);
  }, [active, onChange]);

  const current = commits[index];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)]"
          />
          <span className="font-medium">🕰 Time Slider</span>
          <span className="text-xs text-[var(--muted)]">
            view vault state at a previous commit
          </span>
        </label>
        {active && current && (
          <div className="text-xs text-[var(--muted)] font-mono">
            {current.sha.slice(0, 8)} · {new Date(current.date).toLocaleString()}
          </div>
        )}
      </div>

      {active && (
        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="text-xs text-[var(--muted)]">Loading commits…</div>
          ) : commits.length === 0 ? (
            <div className="text-xs text-[var(--muted)]">No git history available.</div>
          ) : (
            <>
              <input
                type="range"
                min={0}
                max={commits.length - 1}
                value={index}
                onChange={(e) => setIndex(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                <span>{commits[0] ? new Date(commits[0].date).toLocaleDateString() : "—"}</span>
                <span>
                  {index + 1} / {commits.length}
                </span>
                <span>HEAD</span>
              </div>
              {current && (
                <div className="text-xs text-[var(--text)] mt-1 line-clamp-2">
                  {current.message}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
