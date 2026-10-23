/**
 * Lightweight, robust Markdown to HTML converter for FootballPredict Editorial Articles.
 * Handles headings, tables, blockquotes, lists, links, inline code, bold, italic, and paragraphs.
 */

export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const htmlParts: string[] = [];

  let inTable = false;
  let tableHeaderParsed = false;
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;

  const closeOpenLists = () => {
    if (inUl) {
      htmlParts.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      htmlParts.push('</ol>');
      inOl = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      htmlParts.push('</blockquote>');
      inBlockquote = false;
    }
  };

  const closeTable = () => {
    if (inTable) {
      htmlParts.push('</tbody></table></div>');
      inTable = false;
      tableHeaderParsed = false;
    }
  };

  const formatInline = (text: string): string => {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f8fafc; font-weight: 700;">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em style="color: #cbd5e1;">$1</em>')
      // Inline code / formulas
      .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #93c5fd;">$1</code>')
      // Markdown links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #60a5fa; font-weight: 600; text-decoration: underline; text-underline-offset: 3px;">$1</a>')
      // Display Math $$ ... $$
      .replace(/\$\$([\s\S]*?)\$\$/g, '<div style="background: rgba(0,0,0,0.3); border-left: 3px solid #3b82f6; padding: 0.75rem 1rem; margin: 1rem 0; font-family: monospace; font-size: 0.95em; color: #93c5fd; border-radius: 4px; overflow-x: auto;">$1</div>');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Empty line resets paragraphs/lists
    if (!line) {
      closeOpenLists();
      closeBlockquote();
      closeTable();
      continue;
    }

    // Markdown Table handling
    if (line.startsWith('|') && line.endsWith('|')) {
      closeOpenLists();
      closeBlockquote();

      // Check if separator line: |---|---|
      if (line.includes('---')) {
        continue;
      }

      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => formatInline(c.trim()));

      if (!inTable) {
        inTable = true;
        tableHeaderParsed = true;
        htmlParts.push(
          '<div style="overflow-x: auto; margin: 1.5rem 0;"><table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;"><thead><tr style="background: rgba(255,255,255,0.04); border-bottom: 2px solid rgba(255,255,255,0.12); color: #f8fafc;">' +
            cells.map((c) => `<th style="padding: 0.65rem 0.85rem; text-align: left; font-weight: 800;">${c}</th>`).join('') +
            '</tr></thead><tbody>'
        );
      } else {
        htmlParts.push(
          '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">' +
            cells.map((c) => `<td style="padding: 0.6rem 0.85rem; color: #cbd5e1;">${c}</td>`).join('') +
            '</tr>'
        );
      }
      continue;
    } else {
      closeTable();
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeOpenLists();
      const quoteText = formatInline(line.replace(/^>\s*/, ''));
      if (!inBlockquote) {
        inBlockquote = true;
        htmlParts.push(
          '<blockquote style="border-left: 4px solid #3b82f6; background: rgba(59,130,246,0.08); margin: 1.25rem 0; padding: 0.85rem 1.2rem; border-radius: 0 8px 8px 0; color: #93c5fd; font-style: italic; font-size: 0.95rem; line-height: 1.6;">'
        );
      }
      htmlParts.push(`<p style="margin: 0.3rem 0;">${quoteText}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    // Headings
    if (line.startsWith('#### ')) {
      closeOpenLists();
      htmlParts.push(
        `<h4 style="font-size: 1.05rem; font-weight: 800; color: #cbd5e1; margin: 1.5rem 0 0.5rem 0;">${formatInline(line.replace(/^####\s*/, ''))}</h4>`
      );
      continue;
    }

    if (line.startsWith('### ')) {
      closeOpenLists();
      htmlParts.push(
        `<h3 style="font-size: 1.2rem; font-weight: 800; color: #93c5fd; margin: 1.75rem 0 0.6rem 0;">${formatInline(line.replace(/^###\s*/, ''))}</h3>`
      );
      continue;
    }

    if (line.startsWith('## ')) {
      closeOpenLists();
      htmlParts.push(
        `<h2 style="font-size: 1.45rem; font-weight: 900; color: #f8fafc; margin: 2.25rem 0 0.85rem 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; letter-spacing: -0.01em;">${formatInline(line.replace(/^##\s*/, ''))}</h2>`
      );
      continue;
    }

    if (line.startsWith('# ')) {
      closeOpenLists();
      htmlParts.push(
        `<h1 style="font-size: 1.75rem; font-weight: 900; color: #f8fafc; margin: 2rem 0 1rem 0;">${formatInline(line.replace(/^#\s*/, ''))}</h1>`
      );
      continue;
    }

    // Horizontal Rule
    if (line === '---' || line === '***') {
      closeOpenLists();
      htmlParts.push('<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 2rem 0;" />');
      continue;
    }

    // Unordered List (- item or * item)
    if (line.match(/^[-*]\s+/)) {
      if (inOl) {
        htmlParts.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        inUl = true;
        htmlParts.push('<ul style="margin: 0.8rem 0 1.2rem 1.4rem; padding: 0; color: #cbd5e1; line-height: 1.75;">');
      }
      const itemText = formatInline(line.replace(/^[-*]\s+/, ''));
      htmlParts.push(`<li style="margin-bottom: 0.4rem;">${itemText}</li>`);
      continue;
    }

    // Ordered List (1. item)
    if (line.match(/^\d+\.\s+/)) {
      if (inUl) {
        htmlParts.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        inOl = true;
        htmlParts.push('<ol style="margin: 0.8rem 0 1.2rem 1.4rem; padding: 0; color: #cbd5e1; line-height: 1.75;">');
      }
      const itemText = formatInline(line.replace(/^\d+\.\s+/, ''));
      htmlParts.push(`<li style="margin-bottom: 0.4rem;">${itemText}</li>`);
      continue;
    }

    // Close any lists if regular paragraph encountered
    closeOpenLists();

    // Regular Paragraph
    htmlParts.push(
      `<p style="margin: 0 0 1.15rem 0; color: #cbd5e1; font-size: 0.96rem; line-height: 1.75;">${formatInline(line)}</p>`
    );
  }

  closeOpenLists();
  closeBlockquote();
  closeTable();

  return htmlParts.join('\n');
}
