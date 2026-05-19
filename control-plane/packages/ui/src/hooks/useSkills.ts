import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api.js";

export function useSkills(filters?: { category?: string; search?: string; tag?: string }) {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.search) params.search = filters.search;
      if (filters?.tag) params.tag = filters.tag;
      const data = await api.skills.list(Object.keys(params).length > 0 ? params : undefined);
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.search, filters?.tag]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { skills, loading, error, refetch: fetchSkills };
}

export function useSkill(slug: string) {
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.skills
      .get(slug)
      .then(setSkill)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { skill, loading, error };
}

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    api.skills.tags().then(setTags).catch(() => {});
  }, []);
  return tags;
}
