import { useState, useEffect } from "react";
import { api } from "../lib/api.js";

export function useAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.agents
      .list()
      .then(setAgents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading, error };
}

export function useAgent(slug: string) {
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.agents
      .get(slug)
      .then(setAgent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { agent, loading, error };
}
