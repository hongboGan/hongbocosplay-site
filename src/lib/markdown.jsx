// Minimal, dependency-free Markdown renderer for article bodies.
// Supports: ## and ### headings, "- " lists, "> " pull quotes, paragraphs,
// **bold**, *italic* and [text](url) links. Anything richer belongs in a component.
import { Link } from 'react-router-dom';

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text, keyPrefix) {
  return String(text)
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>;
      if (/^\*[^*]+\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>;

      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const [, label, href] = link;
        return href.startsWith('/') ? (
          <Link key={key} to={href}>
            {label}
          </Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        );
      }
      return <span key={key}>{part}</span>;
    });
}

export function Markdown({ text }) {
  const blocks = [];
  let list = null;

  const flush = () => {
    if (!list) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {list.map((item, i) => (
          <li key={i}>{renderInline(item, `li-${blocks.length}-${i}`)}</li>
        ))}
      </ul>
    );
    list = null;
  };

  String(text || '')
    .split('\n')
    .forEach((raw, idx) => {
      const line = raw.trim();
      if (!line) {
        flush();
        return;
      }
      if (line.startsWith('### ')) {
        flush();
        blocks.push(<h3 key={`h3-${idx}`}>{renderInline(line.slice(4), `h3-${idx}`)}</h3>);
        return;
      }
      if (line.startsWith('## ')) {
        flush();
        blocks.push(<h2 key={`h2-${idx}`}>{renderInline(line.slice(3), `h2-${idx}`)}</h2>);
        return;
      }
      if (line.startsWith('- ')) {
        list = list || [];
        list.push(line.slice(2));
        return;
      }
      if (line.startsWith('> ')) {
        flush();
        blocks.push(<blockquote key={`bq-${idx}`}>{renderInline(line.slice(2), `bq-${idx}`)}</blockquote>);
        return;
      }
      flush();
      blocks.push(<p key={`p-${idx}`}>{renderInline(line, `p-${idx}`)}</p>);
    });
  flush();

  return <div className="prose">{blocks}</div>;
}
