import { useParams, Link } from "react-router";
import { useSkill } from "../hooks/useSkills.js";
import { MarkdownViewer } from "../components/MarkdownViewer.js";

export function SkillDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { skill, loading, error } = useSkill(slug!);

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading...</div>;
  if (error || !skill) return <div className="text-center py-12 text-red-400">Skill not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/skills" className="text-sm text-[var(--primary)] hover:underline">
          &larr; Back to Skills
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="text-3xl font-bold">{skill.name}</h1>
          <p className="text-[var(--muted)] mt-2">{skill.description}</p>
          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <MarkdownViewer content={skill.markdown} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--muted)]">Category:</span>{" "}
                <span>{skill.categoryIcon} {skill.categoryLabel}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Slug:</span>{" "}
                <code className="text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded">{skill.slug}</code>
              </div>
              <div>
                <span className="text-[var(--muted)]">Path:</span>{" "}
                <code className="text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded break-all">{skill.filePath}</code>
              </div>
            </div>
          </div>

          {skill.tags.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {skill.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg)] text-[var(--muted)]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skill.fileInventory?.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Files</h3>
              <ul className="text-xs space-y-1 text-[var(--muted)]">
                {skill.fileInventory.map((f: string) => (
                  <li key={f} className="font-mono">{f}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
