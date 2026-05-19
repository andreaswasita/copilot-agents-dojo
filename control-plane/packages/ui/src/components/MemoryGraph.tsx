import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import ForceGraph2D from "react-force-graph-2d";
import { MEMORY_TYPE_META, type MemoryGraph as MemoryGraphData } from "../hooks/useMemory.js";

interface MemoryGraphProps {
  graph: MemoryGraphData;
  height?: number;
}

interface EnrichedNode {
  id: string;
  type: string;
  title: string;
  color: string;
  val: number;
  x?: number;
  y?: number;
}

export function MemoryGraph({ graph, height = 600 }: MemoryGraphProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [width, setWidth] = useState(800);
  const [hovered, setHovered] = useState<EnrichedNode | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    };
    update();
    window.addEventListener("resize", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  const inboundCount: Record<string, number> = {};
  for (const e of graph.edges) {
    inboundCount[e.target] = (inboundCount[e.target] || 0) + 1;
  }

  const nodes: EnrichedNode[] = graph.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    color: MEMORY_TYPE_META[n.type]?.color ?? "#9ca3af",
    val: 1 + (inboundCount[n.id] || 0) * 2,
  }));

  const links = graph.edges.map((e) => ({ source: e.source, target: e.target }));

  const linkColor = isDarkMode ? "rgba(156, 163, 175, 0.4)" : "rgba(120, 113, 108, 0.5)";
  const labelColor = isDarkMode ? "#fafaf9" : "#1c1917";

  return (
    <div ref={containerRef} className="relative rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden">
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center text-[var(--muted)]" style={{ height }}>
          No memory entries yet — scaffold one to start the graph.
        </div>
      ) : (
        <>
          <ForceGraph2D
            ref={fgRef}
            graphData={{ nodes, links }}
            width={width}
            height={height}
            backgroundColor="rgba(0,0,0,0)"
            nodeRelSize={6}
            nodeColor={(n: any) => n.color}
            nodeVal={(n: any) => n.val}
            linkColor={() => linkColor}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            linkWidth={1}
            cooldownTicks={120}
            onNodeHover={(n: any) => setHovered(n || null)}
            onNodeClick={(n: any) => navigate(`/memory/${n.id}`)}
            nodeCanvasObjectMode={() => "after"}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              if (globalScale < 1.4 && node !== hovered) return;
              const fontSize = 11 / globalScale;
              ctx.font = `${fontSize}px system-ui, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = labelColor;
              const radius = Math.sqrt(node.val) * 6 + 2;
              ctx.fillText(node.title, node.x, node.y + radius + 1);
            }}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 text-xs">
            {Object.entries(MEMORY_TYPE_META).map(([key, meta]) => (
              <span
                key={key}
                className="flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-sm"
                style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.label}
              </span>
            ))}
          </div>
          {hovered && (
            <div
              className="absolute bottom-3 left-3 right-3 max-w-md p-3 rounded-lg border bg-[var(--surface)]/95 backdrop-blur-sm text-xs shadow-lg"
              style={{ borderColor: hovered.color }}
            >
              <div className="font-semibold text-[var(--text)]">{hovered.title}</div>
              <div className="text-[var(--muted)] mt-1 font-mono">{hovered.id}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
