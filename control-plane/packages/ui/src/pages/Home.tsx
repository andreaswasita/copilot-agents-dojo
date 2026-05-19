import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";

interface Stats {
  skillCount: number;
  agentCount: number;
  profileCount: number;
  categories: number;
  memoryCount?: number;
}

export function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, { icon: string; label: string }>>({});
  const [memoryCount, setMemoryCount] = useState(0);

  useEffect(() => {
    api.meta.stats().then(setStats).catch(() => {});
    api.meta.presets().then(setPresets).catch(() => {});
    api.meta.categories().then(setCategories).catch(() => {});
    api.memory.list().then((m) => setMemoryCount(m.length)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold">
          <span className="text-[var(--primary)]">🥋</span> Dojo Control Plane
        </h1>
        <p className="text-[var(--muted)] mt-2 text-lg" style={{ fontFamily: "var(--font-family-jp)" }}>
          道場 — The Way of Copilot Mastery
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Skills", value: stats.skillCount, icon: "🥋", link: "/skills" },
            { label: "Agents", value: stats.agentCount, icon: "🤖", link: "/agents" },
            { label: "Memory", value: memoryCount, icon: "📚", link: "/memory" },
            { label: "Profiles", value: stats.profileCount, icon: "📋", link: "/profiles" },
            { label: "Categories", value: stats.categories, icon: "📊", link: "/skills" },
          ].map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="text-3xl font-bold mt-2">{stat.value}</div>
              <div className="text-sm text-[var(--muted)]">{stat.label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categories).map(([key, { icon, label }]) => (
            <Link
              key={key}
              to={`/skills?category=${key}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="text-2xl">{icon}</div>
              <div className="text-sm font-medium mt-2">{label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Start Presets</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <Link
              key={preset.id}
              to="/install"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold">{preset.name}</h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {preset.skills?.length || 0} skills, {preset.agents?.length || 0} agents
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
