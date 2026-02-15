type FormatStyle = 'italics' | 'underline';

interface FormattedCitationProps {
  text: string;
  formatStyle: FormatStyle;
  className?: string;
}

export function FormattedCitation({ text, formatStyle, className }: FormattedCitationProps) {
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
