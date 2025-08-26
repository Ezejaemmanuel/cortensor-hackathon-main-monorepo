'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import { CheckIcon, CopyIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MarkdownRendererProps {
  content: string
  className?: string
}

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  inline?: boolean
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, inline }) => {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') || 'text'
  const codeString = String(children).replace(/\n$/, '')
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inline) {
    return (
      <code className="px-2 py-1 font-mono text-sm rounded-md border bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
        {children}
      </code>
    )
  }

  return (
    <div className="overflow-hidden relative my-4 rounded-lg border shadow-sm group border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center px-4 py-2 border-b bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <span className="font-mono text-xs tracking-wide uppercase text-slate-600 dark:text-slate-400">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="p-0 w-7 h-7 opacity-70 transition-all duration-200 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <CopyIcon className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'rgb(15 23 42)',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          showLineNumbers={codeString.split('\n').length > 5}
          lineNumberStyle={{
            color: 'rgb(100 116 139)',
            paddingRight: '1rem',
            minWidth: '2.5rem',
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={cn('max-w-none prose prose-slate dark:prose-invert prose-sm sm:prose-base lg:prose-lg', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Enhanced Headings with better typography
          h1: ({ children }) => (
            <h1 className="pb-3 mt-6 mb-4 text-2xl sm:text-3xl font-bold leading-tight border-b text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-3 text-xl sm:text-2xl font-semibold leading-tight text-slate-800 dark:text-slate-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-lg sm:text-xl font-semibold leading-tight text-slate-800 dark:text-slate-200">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-3 mb-2 text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300">
              {children}
            </h4>
          ),
          
          // Enhanced Paragraphs with better spacing
          p: ({ children }) => (
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-6 sm:leading-7 text-slate-700 dark:text-slate-300">
              {children}
            </p>
          ),
          
          // Enhanced Lists with better styling
          ul: ({ children }) => (
            <ul className="pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 sm:space-y-2 text-slate-700 dark:text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 sm:space-y-2 text-slate-700 dark:text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-2">
              <span className="absolute top-0 -left-5 sm:-left-6 text-slate-400 dark:text-slate-500">•</span>
              {children}
            </li>
          ),
          
          // Code blocks and inline code
          code: ({ children, className, ...props }) => {
            const inline = !className
            return (
              <CodeBlock 
                className={className} 
                inline={inline}
              >
                {children}
              </CodeBlock>
            )
          },
          
          // Enhanced Links with better styling
          a: ({ children, href }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex gap-1 items-center text-blue-600 underline transition-colors duration-200 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 decoration-blue-600/30 hover:decoration-blue-600"
            >
              {children}
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          ),
          
          // Enhanced Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="py-3 sm:py-4 pr-3 sm:pr-4 pl-4 sm:pl-6 my-4 sm:my-6 rounded-r-lg border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-800/50">
              <div className="italic font-medium text-slate-600 dark:text-slate-400">
                {children}
              </div>
            </blockquote>
          ),
          
          // Enhanced Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 sm:my-6 rounded-lg border shadow-sm border-slate-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 sm:px-6 py-2 sm:py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600 dark:text-slate-400">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 sm:px-6 py-2 sm:py-4 text-sm whitespace-nowrap border-t text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
              {children}
            </td>
          ),
          
          // Enhanced Horizontal rule
          hr: () => (
            <hr className="my-6 sm:my-8 h-px bg-gradient-to-r from-transparent to-transparent border-0 via-slate-300 dark:via-slate-600" />
          ),
          
          // Enhanced Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 dark:text-slate-300">
              {children}
            </em>
          ),
          
          // Enhanced task lists
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                  {...props}
                />
              )
            }
            return <input type={type} {...props} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer