const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  skills: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/skills${qs}`);
    },
    get: (slug: string) => request<any>(`/skills/${slug}`),
    tags: () => request<string[]>("/skills/tags"),
    scan: () => request<any>("/skills/scan", { method: "POST" }),
  },
  agents: {
    list: () => request<any[]>("/agents"),
    get: (slug: string) => request<any>(`/agents/${slug}`),
  },
  profiles: {
    list: () => request<any[]>("/profiles"),
    get: (id: string) => request<any>(`/profiles/${id}`),
    create: (data: any) => request<any>("/profiles", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/profiles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/profiles/${id}`, { method: "DELETE" }),
  },
  install: {
    run: (data: any) => request<any>("/install", { method: "POST", body: JSON.stringify(data) }),
    preview: (skills: string[], agents: string[]) =>
      request<any>(`/install/preview?skills=${skills.join(",")}&agents=${agents.join(",")}`),
    history: () => request<any[]>("/install/history"),
  },
  meta: {
    categories: () => request<any>("/categories"),
    presets: () => request<any[]>("/presets"),
    stats: () => request<any>("/stats"),
  },
  memory: {
    list: (params?: { type?: string; search?: string; tag?: string }) => {
      const clean = Object.entries(params ?? {}).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
      ) as [string, string][];
      const qs = clean.length > 0 ? "?" + new URLSearchParams(clean).toString() : "";
      return request<any[]>(`/memory${qs}`);
    },
    get: (slug: string) => request<any>(`/memory/${slug}`),
    graph: () => request<{ nodes: any[]; edges: any[] }>("/memory/graph"),
    tags: () => request<string[]>("/memory/tags"),
    scan: () => request<any>("/memory/scan", { method: "POST" }),
    scaffold: (data: any) =>
      request<any>("/memory/scaffold", { method: "POST", body: JSON.stringify(data) }),
  },
};
