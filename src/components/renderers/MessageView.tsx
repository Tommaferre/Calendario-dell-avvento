import type { MessageContent } from '../../content/types.ts';

export function MessageView({ content }: { content: MessageContent }) {
  return <div className="prose">{content.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>;
}
