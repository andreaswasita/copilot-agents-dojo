import { Link } from "react-router";

interface SelectionTrayProps {
  skillCount: number;
  agentCount: number;
  onClear: () => void;
}

export function SelectionTray({ skillCount, agentCount, onClear }: SelectionTrayProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[var(--text)]">
            {skillCount} skills, {agentCount} agents selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Clear
          </button>
          <Link
            to="/install"
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
          >
            Install &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
