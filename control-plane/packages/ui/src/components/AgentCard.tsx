import { Link } from "react-router";

interface AgentCardProps {
  agent: {
    slug: string;
    name: string;
    description: string;
    agentType: string;
    activation: string;
  };
  selected: boolean;
  onToggle: () => void;
}

export function AgentCard({ agent, selected, onToggle }: AgentCardProps) {
  return (
    <div
      className={`group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "ring-2 ring-[var(--primary)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link to={`/agents/${agent.slug}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">&#x1F916;</span>
            <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              {agent.name}
            </h3>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{agent.description}</p>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-[var(--primary)] border-[var(--primary)] text-white"
              : "border-[var(--border)] hover:border-[var(--primary)]"
          }`}
        >
          {selected && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)]">
          {agent.agentType}
        </span>
        <span className="text-xs text-[var(--muted)]">{agent.activation}</span>
      </div>
    </div>
  );
}
