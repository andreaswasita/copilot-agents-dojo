import { useParams, Link } from "react-router";
import { useAgent } from "../hooks/useAgents.js";
import { MarkdownViewer } from "../components/MarkdownViewer.js";

export function AgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { agent, loading, error } = useAgent(slug!);

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading...</div>;
  if (error || !agent) return <div className="text-center py-12 text-red-400">Agent not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/agents" className="text-sm text-[var(--primary)] hover:underline">
        &larr; Back to Agents
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>&#x1F916;</span> {agent.name}
          </h1>
          <p className="text-[var(--muted)] mt-2">{agent.description}</p>
          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <MarkdownViewer content={agent.markdown} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
              Details
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--muted)]">Type:</span> <span>{agent.agentType}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Activation:</span>{" "}
                <span>{agent.activation}</span>
              </div>
              {agent.applyTo?.length > 0 && (
                <div>
                  <span className="text-[var(--muted)]">Applies to:</span>
                  <ul className="mt-1 space-y-0.5">
                    {agent.applyTo.map((pattern: string) => (
                      <li key={pattern} className="font-mono text-xs text-[var(--muted)]">
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
