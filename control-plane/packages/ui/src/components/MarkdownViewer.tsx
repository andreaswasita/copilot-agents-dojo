import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-[var(--text)] prose-p:text-[var(--text)] prose-code:text-[var(--primary)] prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--border)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
