import { MarkdownViewer } from "./MarkdownViewer.js";

interface InstallPreviewProps {
  preview: string;
  skillCount: number;
  agentCount: number;
}

export function InstallPreview({ preview, skillCount, agentCount }: InstallPreviewProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
          Preview: copilot-instructions.md
        </h3>
        <span className="text-xs text-[var(--muted)]">
          {skillCount} skills, {agentCount} agents
        </span>
      </div>
      <div className="max-h-96 overflow-y-auto border border-[var(--border)] rounded-lg p-4 bg-[var(--bg)]">
        <MarkdownViewer content={preview} />
      </div>
    </div>
  );
}
