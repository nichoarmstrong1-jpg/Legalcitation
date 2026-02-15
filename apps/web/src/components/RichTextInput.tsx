import { useRef, useCallback, useEffect } from 'react';

interface RichTextInputProps {
  value: string;
  onChange: (plainText: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  minHeight?: string;
}

const ALLOWED_TAGS = new Set(['B', 'STRONG', 'EM', 'I', 'U', 'BR', 'P', 'DIV', 'SPAN']);

/**
 * Sanitize pasted HTML: preserve paragraph structure and italic/underline
 * formatting while stripping Word artifacts and dangerous content.
 */
function sanitizePastedHtml(html: string): string {
  // Remove script, style, head blocks entirely
  let cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Parse into a temporary DOM element
  const temp = document.createElement('div');
  temp.innerHTML = cleaned;

  // Walk the DOM tree and clean each element
  const walker = document.createTreeWalker(temp, NodeFilter.SHOW_ELEMENT);
  const toRemove: Element[] = [];
  const toProcess: Element[] = [];

  while (walker.nextNode()) {
    const el = walker.currentNode as Element;
    toProcess.push(el);
  }

  for (const el of toProcess) {
    const tagName = el.tagName.toUpperCase();

    // Remove dangerous tags entirely
    if (['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE'].includes(tagName)) {
      toRemove.push(el);
      continue;
    }

    // Convert Word-specific italic styles to <em>
    const style = el.getAttribute('style') || '';
    const className = el.getAttribute('class') || '';

    const isItalic =
      /font-style:\s*italic/i.test(style) ||
      /mso-bidi-font-style:\s*italic/i.test(style) ||
      /MsoItalic/i.test(className);

    const isUnderline =
      /text-decoration:\s*[^;"]*underline/i.test(style);

    // Strip all attributes from the element
    while (el.attributes.length > 0) {
      el.removeAttribute(el.attributes[0].name);
    }

    // Wrap content in formatting tags if Word styles indicated formatting
    if (isItalic && tagName === 'SPAN') {
      const em = document.createElement('em');
      while (el.firstChild) {
        em.appendChild(el.firstChild);
      }
      el.appendChild(em);
    } else if (isUnderline && tagName === 'SPAN') {
      const u = document.createElement('u');
      while (el.firstChild) {
        u.appendChild(el.firstChild);
      }
      el.appendChild(u);
    }

    // Replace disallowed tags with their children
    if (!ALLOWED_TAGS.has(tagName)) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        toRemove.push(el);
      }
    }
  }

  for (const el of toRemove) {
    el.parentNode?.removeChild(el);
  }

  return temp.innerHTML;
}

/**
 * Extract plain text from HTML, preserving line breaks for paragraphs.
 */
function htmlToPlain(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Replace block elements with newlines
  for (const el of Array.from(temp.querySelectorAll('p, div, br'))) {
    if (el.tagName === 'BR') {
      el.replaceWith('\n');
    } else {
      el.insertAdjacentText('afterend', '\n');
    }
  }

  let text = temp.textContent || '';
  // Clean up excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

/**
 * Rich text input component using contentEditable.
 * Renders italic/underline formatting natively instead of showing * markers.
 * Sanitizes Word paste to preserve formatting and paragraph structure.
 */
export function RichTextInput({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  onKeyDown,
  minHeight = '200px',
}: RichTextInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external value to editor (only when value changes externally)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;

    // Convert plain text value to HTML for display
    const currentPlain = htmlToPlain(editor.innerHTML);
    if (currentPlain !== value) {
      // Preserve simple text — convert newlines to <br>
      const htmlValue = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      editor.innerHTML = htmlValue;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    isInternalUpdate.current = true;
    const plainText = htmlToPlain(editor.innerHTML);
    onChange(plainText);
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const html = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');

    if (html) {
      const sanitized = sanitizePastedHtml(html);
      document.execCommand('insertHTML', false, sanitized);
    } else if (plain) {
      // Convert plain text newlines to <br> for the editor
      const escaped = plain
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, escaped);
    }

    // Trigger onChange after paste
    requestAnimationFrame(() => {
      handleInput();
    });
  }, [handleInput]);

  const isEmpty = !value || !value.trim();

  return (
    <div className="relative">
      {/* Placeholder overlay */}
      {isEmpty && placeholder && (
        <div
          className="absolute inset-0 pointer-events-none font-serif text-surface-400 p-4 whitespace-pre-wrap leading-relaxed"
          style={{ minHeight }}
        >
          {placeholder}
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={onKeyDown}
        className={`w-full outline-none font-serif leading-relaxed p-4 ${className}`}
        style={{ minHeight }}
        suppressContentEditableWarning
      />
    </div>
  );
}
