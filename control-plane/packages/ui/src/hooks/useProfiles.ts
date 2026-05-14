import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api.js";

export function useProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.profiles.list();
      setProfiles(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, refetch: fetchProfiles };
}
