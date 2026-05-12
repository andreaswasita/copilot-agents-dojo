import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api.js";

export interface MemoryEntry {
  id: string;
  slug: string;
  type: string;
  title: string;
  date: string | null;
  status: string | null;
  tags: string[];
  frontmatter: Record<string, unknown>;
  markdown: string;
  filePath: string;
}

export interface MemoryDetail extends MemoryEntry {
  backlinks: string[];
  forwardLinks: string[];
}

export interface MemoryGraph {
  nodes: { id: string; type: string; title: string }[];
  edges: { source: string; target: string }[];
}

export function useMemory(filters: { type?: string; search?: string; tag?: string }) {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(() => {
    setLoading(true);
    api.memory
      .list(filters)
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.search, filters.tag]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, error, refetch: fetchEntries };
}

export function useMemoryEntry(slug: string | undefined) {
  const [entry, setEntry] = useState<MemoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.memory
      .get(slug)
      .then(setEntry)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { entry, loading, error };
}

export function useMemoryGraph() {
  const [graph, setGraph] = useState<MemoryGraph>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.memory
      .graph()
      .then(setGraph)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { graph, loading, error };
}

export function useMemoryTags() {
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    api.memory
      .tags()
      .then(setTags)
      .catch(() => {});
  }, []);
  return tags;
}

export const MEMORY_TYPE_META: Record<
  string,
  { label: string; icon: string; color: string; folder: string; bg: string; border: string }
> = {
  decision: {
    label: "Decision",
    icon: "🧭",
    color: "#06b6d4",
    folder: "decisions",
    bg: "rgba(6, 182, 212, 0.1)",
    border: "rgba(6, 182, 212, 0.4)",
  },
  pattern: {
    label: "Pattern",
    icon: "🧩",
    color: "#6366f1",
    folder: "patterns",
    bg: "rgba(99, 102, 241, 0.1)",
    border: "rgba(99, 102, 241, 0.4)",
  },
  preference: {
    label: "Preference",
    icon: "⭐",
    color: "#f59e0b",
    folder: "preferences",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.4)",
  },
  session: {
    label: "Session",
    icon: "📝",
    color: "#ef4444",
    folder: "sessions",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.4)",
  },
};
