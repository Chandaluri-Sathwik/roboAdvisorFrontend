import type { ReactNode } from 'react'

type MessageBlock =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'rule' }
  | { kind: 'code'; language: string; text: string }
  | { kind: 'table'; rows: string[][] }

type Props = { text: string }

/**
 * A small, safe Markdown renderer for assistant responses. It renders text
 * through React nodes (never dangerouslySetInnerHTML), so model output cannot
 * inject HTML into the page.
 */
export function FormattedMessage({ text }: Props) {
  const blocks = parseBlocks(text)

  return (
    <div className="formatted-message">
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          if (block.level === 1) return <h3 key={index}>{renderInline(block.text)}</h3>
          if (block.level === 2) return <h4 key={index}>{renderInline(block.text)}</h4>
          return <h5 key={index}>{renderInline(block.text)}</h5>
        }
        if (block.kind === 'paragraph') {
          return <p key={index}>{renderInline(block.text)}</p>
        }
        if (block.kind === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul'
          return <ListTag key={index}>{block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}</ListTag>
        }
        if (block.kind === 'quote') {
          return <blockquote key={index}>{renderInline(block.text)}</blockquote>
        }
        if (block.kind === 'rule') return <hr key={index} />
        if (block.kind === 'code') {
          return (
            <pre key={index} className="formatted-code">
              {block.language && <span className="formatted-code-language">{block.language}</span>}
              <code>{block.text}</code>
            </pre>
          )
        }
        return (
          <div className="formatted-table-wrap" key={index}>
            <table className="formatted-table">
              {block.rows.map((row, rowIndex) => {
                const Tag = rowIndex === 0 ? 'th' : 'td'
                return (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <Tag key={cellIndex}>{renderInline(cell)}</Tag>
                    ))}
                  </tr>
                )
              })}
            </table>
          </div>
        )
      })}
    </div>
  )
}

function parseBlocks(source: string): MessageBlock[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const blocks: MessageBlock[] = []
  let index = 0

  const isHeading = (line: string) => /^\s{0,3}#{1,6}\s+/.test(line)
  const isRule = (line: string) => /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)
  const listMatch = (line: string) => line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/)
  const isQuote = (line: string) => /^\s*>\s?/.test(line)
  const isTableSeparator = (line: string) =>
    /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index++
      continue
    }

    if (/^\s*```/.test(line)) {
      const language = line.replace(/^\s*```\s*/, '').trim()
      const codeLines: string[] = []
      index++
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        codeLines.push(lines[index++])
      }
      if (index < lines.length) index++
      blocks.push({ kind: 'code', language, text: codeLines.join('\n') })
      continue
    }

    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/)
    if (heading) {
      blocks.push({ kind: 'heading', level: Math.min(heading[1].length, 3), text: heading[2] })
      index++
      continue
    }

    if (isRule(line)) {
      blocks.push({ kind: 'rule' })
      index++
      continue
    }

    if (isQuote(line)) {
      const quoteLines: string[] = []
      while (index < lines.length && isQuote(lines[index])) {
        quoteLines.push(lines[index++].replace(/^\s*>\s?/, ''))
      }
      blocks.push({ kind: 'quote', text: quoteLines.join(' ') })
      continue
    }

    const currentListMatch = listMatch(line)
    if (currentListMatch) {
      const ordered = Boolean(currentListMatch[2])
      const items: string[] = []
      while (index < lines.length) {
        const match = listMatch(lines[index])
        if (match) {
          if (Boolean(match[2]) !== ordered) break
          items.push(match[3].trim())
          index++
          continue
        }
        if (!lines[index].trim() && index + 1 < lines.length && listMatch(lines[index + 1])
          && Boolean(listMatch(lines[index + 1])?.[2]) === ordered) {
          index++
          continue
        }
        break
      }
      blocks.push({ kind: 'list', ordered, items })
      continue
    }

    if (line.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const rows = [splitTableRow(line)]
      index += 2 // header and separator
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]))
        index++
      }
      blocks.push({ kind: 'table', rows })
      continue
    }

    const paragraphLines = [line.trim()]
    index++
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index]
      if (isHeading(next) || isRule(next) || isQuote(next) || listMatch(next)
        || /^\s*```/.test(next)
        || (next.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1]))) {
        break
      }
      paragraphLines.push(next.trim())
      index++
    }
    blocks.push({ kind: 'paragraph', text: paragraphLines.join(' ') })
  }

  return blocks
}

function splitTableRow(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
}

function renderInline(text: string): ReactNode[] {
  const tokenPattern = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\*(?!\s)[^*]+?\*|_(?!\s)[^_]+?_)/g
  const output: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) output.push(text.slice(lastIndex, match.index))
    const token = match[0]
    const tokenKey = key++

    if (token.startsWith('**') && token.endsWith('**')) {
      output.push(<strong key={tokenKey}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('__') && token.endsWith('__')) {
      output.push(<strong key={tokenKey}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      output.push(<del key={tokenKey}>{token.slice(2, -2)}</del>)
    } else if (token.startsWith('`') && token.endsWith('`')) {
      output.push(<code className="formatted-inline-code" key={tokenKey}>{token.slice(1, -1)}</code>)
    } else if (token.startsWith('*') && token.endsWith('*')) {
      output.push(<em key={tokenKey}>{token.slice(1, -1)}</em>)
    } else if (token.startsWith('_') && token.endsWith('_')) {
      output.push(<em key={tokenKey}>{token.slice(1, -1)}</em>)
    } else {
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)
      if (link) {
        output.push(<a href={link[2]} key={tokenKey} target="_blank" rel="noopener noreferrer">{link[1]}</a>)
      } else {
        output.push(token)
      }
    }
    lastIndex = tokenPattern.lastIndex
  }

  if (lastIndex < text.length) output.push(text.slice(lastIndex))
  return output
}
