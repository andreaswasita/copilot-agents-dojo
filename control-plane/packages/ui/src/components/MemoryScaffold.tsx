import { useState } from "react";
import { api } from "../lib/api.js";
import { MEMORY_TYPE_META } from "../hooks/useMemory.js";

interface MemoryScaffoldProps {
  onCreated?: (slug: string) => void;
  onCancel?: () => void;
}

const TYPES = ["decision", "pattern", "preference", "session"] as const;

export function MemoryScaffold({ onCreated, onCancel }: MemoryScaffoldProps) {
  const [type, setType] = useState<typeof TYPES[number]>("decision");
  const [slugSuffix, setSlugSuffix] = useState("");
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugValid = /^[a-z0-9][a-z0-9-]*$/.test(slugSuffix);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!slugValid || !title.trim()) {
      setError("Slug must be lowercase-with-hyphens and title required");
      return;
    }
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const result = await api.memory.scaffold({
        type,
        slugSuffix,
        title: title.trim(),
        tags,
        status: status || undefined,
      });
      onCreated?.(result.slug);
    } catch (err: any) {
      setError(err.message || "Failed to create memory entry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4"
    >
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
          New Memory Entry
        </h3>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Type</label>
        <div className="grid grid-cols-4 gap-2">
          {TYPES.map((t) => {
            const meta = MEMORY_TYPE_META[t];
            const active = t === type;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="text-xs font-medium px-3 py-2 rounded-lg border transition-all"
                style={{
                  backgroundColor: active ? meta.bg : "transparent",
                  borderColor: active ? meta.color : "var(--border)",
                  color: active ? meta.color : "var(--muted)",
                }}
              >
                <div className="text-base">{meta.icon}</div>
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What this entry is about"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
            Slug suffix
            <span className="text-[10px] ml-1 normal-case">(lowercase-hyphen)</span>
          </label>
          <input
            type="text"
            value={slugSuffix}
            onChange={(e) => setSlugSuffix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="my-decision-name"
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-[var(--bg)] text-[var(--text)] font-mono ${
              slugSuffix && !slugValid ? "border-red-400" : "border-[var(--border)]"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="api, validation"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Status (optional)</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="accepted / active / draft"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
          />
        </div>
      </div>

      {error && <div className="text-xs text-red-400">{error}</div>}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !slugValid || !title.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create entry"}
        </button>
      </div>
    </form>
  );
}
