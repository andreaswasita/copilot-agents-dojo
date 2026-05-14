import { Link, useLocation } from "react-router";
import { ThemeToggle } from "./ThemeToggle.js";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/skills", label: "Skills", icon: "🥋" },
  { path: "/agents", label: "Agents", icon: "🤖" },
  { path: "/memory", label: "Memory", icon: "📚" },
  { path: "/profiles", label: "Profiles", icon: "📋" },
  { path: "/install", label: "Install", icon: "📦" },
];

export function DojoHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🥋</span>
            <span className="text-xl font-bold text-[var(--primary)]">
              Dojo <span className="text-[var(--muted)] font-normal text-sm">Control Plane</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
