import { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import { InstallPreview } from "../components/InstallPreview.js";

export function Install() {
  const [targetPath, setTargetPath] = useState("");
  const [skills, setSkills] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [preview, setPreview] = useState<{ preview: string; skillCount: number; agentCount: number } | null>(null);
  const [installing, setInstalling] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [includeMemory, setIncludeMemory] = useState(false);
  const [wireMcp, setWireMcp] = useState(false);

  useEffect(() => {
    setWireMcp(includeMemory);
  }, [includeMemory]);

  useEffect(() => {
    api.skills.list().then(setSkills).catch(() => {});
    api.agents.list().then(setAgents).catch(() => {});
    api.install.history().then(setHistory).catch(() => {});
  }, []);

  const handlePreview = async () => {
    if (selectedSkills.length === 0 && selectedAgents.length === 0) return;
    const data = await api.install.preview(selectedSkills, selectedAgents);
    setPreview(data);
  };

  const handleInstall = async () => {
    if (!targetPath.trim()) return;
    setInstalling(true);
    try {
      const data = await api.install.run({
        targetPath: targetPath.trim(),
        skills: selectedSkills,
        agents: selectedAgents,
        codeStandards: {},
        includeMemory,
        wireMcp: includeMemory && wireMcp,
      });
      setResult(data);
      api.install.history().then(setHistory).catch(() => {});
    } finally {
      setInstalling(false);
    }
  };

  const toggleSkill = (slug: string) => {
    setSelectedSkills((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleAgent = (slug: string) => {
    setSelectedAgents((prev) =>
      prev.includes(slug) ? prev.filter((a) => a !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Install to Project</h1>
        <p className="text-[var(--muted)] mt-1">Select skills and agents, then install to a target project</p>
      </div>

      {/* Target path */}
      <div>
        <label className="block text-sm font-medium mb-1">Target project path</label>
        <input
          type="text"
          value={targetPath}
          onChange={(e) => setTargetPath(e.target.value)}
          placeholder="/path/to/your/project"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)]"
        />
      </div>

      {/* Skill selection */}
      <div>
        <h3 className="text-sm font-medium mb-2">Skills ({selectedSkills.length} selected)</h3>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {skills.map((s) => (
            <button
              key={s.slug}
              onClick={() => toggleSkill(s.slug)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                selectedSkills.includes(s.slug)
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {s.categoryIcon} {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Agent selection */}
      <div>
        <h3 className="text-sm font-medium mb-2">Agents ({selectedAgents.length} selected)</h3>
        <div className="flex flex-wrap gap-1.5">
          {agents.map((a) => (
            <button
              key={a.slug}
              onClick={() => toggleAgent(a.slug)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                selectedAgents.includes(a.slug)
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              &#x1F916; {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Memory vault option */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeMemory}
            onChange={(e) => setIncludeMemory(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium flex items-center gap-1.5">
              <span>📚</span> Include Memory Vault
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Copies <code className="font-mono">memory/</code> (decisions, patterns, preferences,
              sessions) and <code className="font-mono">scripts/link-index.sh</code> to the target
              project. Lets the agent build long-term context that survives across sessions.
            </p>
          </div>
        </label>

        <label className={`flex items-start gap-3 pl-7 ${includeMemory ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
          <input
            type="checkbox"
            checked={includeMemory && wireMcp}
            disabled={!includeMemory}
            onChange={(e) => setWireMcp(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] disabled:cursor-not-allowed"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium flex items-center gap-1.5">
              <span>🔌</span> Wire MCP memory server
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Writes a <code className="font-mono">.mcp.json</code> at the target root pointing
              at <code className="font-mono">@dojo/mcp-memory</code>, plus a session-boot block in
              <code className="font-mono"> copilot-instructions.md</code> so agents auto-load
              recent sessions and active decisions on startup.
            </p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={selectedSkills.length === 0 && selectedAgents.length === 0}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50"
        >
          Preview
        </button>
        <button
          onClick={handleInstall}
          disabled={installing || !targetPath.trim() || (selectedSkills.length === 0 && selectedAgents.length === 0)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {installing ? "Installing..." : "Install"}
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <InstallPreview
          preview={preview.preview}
          skillCount={preview.skillCount}
          agentCount={preview.agentCount}
        />
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <h3 className="text-sm font-semibold text-green-400">Installation Complete</h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            {result.result.copiedSkills.length} skills, {result.result.copiedAgents.length} agents
            {result.result.memoryCopied ? ", memory vault" : ""}
            {result.result.mcpConfigPath ? `, MCP config (${result.result.mcpConfigPath})` : ""}
            {" "}installed to {targetPath}
          </p>
          {result.result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-red-400">
              {result.result.errors.map((e: string, i: number) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--muted)] mb-2 uppercase tracking-wider">Install History</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs"
              >
                <div className="flex justify-between">
                  <span className="font-mono text-[var(--muted)]">{h.targetPath}</span>
                  <span className="text-[var(--muted)]">
                    {new Date(h.installedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-[var(--muted)] mt-1">
                  {h.skillsInstalled?.length || 0} skills, {h.agentsInstalled?.length || 0} agents — {h.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
