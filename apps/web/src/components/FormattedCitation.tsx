import type { FormattingDirective } from '@legalcitation/shared';

type FormatStyle = 'italics' | 'underline';

interface FormattedCitationProps {
  text: string;
  formatStyle: FormatStyle;
  className?: string;
  directives?: FormattingDirective[];
}

export function FormattedCitation({ text, formatStyle, className, directives }: FormattedCitationProps) {
  // When directives are provided, use position-based mixed-style rendering
  if (directives && directives.length > 0) {
    return (
      <span className={className}>
        {renderWithDirectives(text, directives)}
      </span>
    );
  }

  // Default: existing *marker* + formatStyle system
  const parts = text.split(/(\*[^*]+\*)/);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          const content = part.slice(1, -1);
          return formatStyle === 'italics'
            ? <em key={i} className="font-serif">{content}</em>
            : <u key={i}>{content}</u>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function renderWithDirectives(text: string, directives: FormattingDirective[]): React.ReactNode[] {
  const sorted = [...directives].sort((a, b) => a.start - b.start);
  const nodes: React.ReactNode[] = [];
  let lastEnd = 0;

  for (let i = 0; i < sorted.length; i++) {
    const directive = sorted[i];

    // Add any text before this directive as plain text
    if (directive.start > lastEnd) {
      nodes.push(<span key={`gap-${i}`}>{text.slice(lastEnd, directive.start)}</span>);
    }

    const segment = text.slice(directive.start, directive.end);

    switch (directive.style) {
      case 'italic':
        nodes.push(<em key={`d-${i}`} className="font-serif">{segment}</em>);
        break;
      case 'small_caps':
        nodes.push(
          <span key={`d-${i}`} style={{ fontVariant: 'small-caps' }}>{segment}</span>
        );
        break;
      case 'roman':
        nodes.push(<span key={`d-${i}`}>{segment}</span>);
        break;
    }

    lastEnd = directive.end;
  }

  // Add any remaining text after the last directive
  if (lastEnd < text.length) {
    nodes.push(<span key="tail">{text.slice(lastEnd)}</span>);
  }

  return nodes;
}
