import { useAgents } from "../hooks/useAgents.js";
import { useSelection } from "../hooks/useSelection.js";
import { AgentCard } from "../components/AgentCard.js";
import { SelectionTray } from "../components/SelectionTray.js";

export function AgentBrowser() {
  const { agents, loading } = useAgents();
  const selection = useSelection();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-[var(--muted)] mt-1">Browse available coding agents</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">No agents found</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.slug}
              agent={agent}
              selected={selection.selectedAgents.has(agent.slug)}
              onToggle={() => selection.toggleAgent(agent.slug)}
            />
          ))}
        </div>
      )}

      {selection.totalSelected > 0 && (
        <SelectionTray
          skillCount={selection.selectedSkills.size}
          agentCount={selection.selectedAgents.size}
          onClear={selection.clearSelection}
        />
      )}
    </div>
  );
}
