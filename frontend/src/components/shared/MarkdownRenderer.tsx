import React, {forwardRef} from 'react';
import {default as ReactMarkdown} from 'react-markdown';
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';
import {Box, Theme} from '@mui/material';
import {SxProps} from '@mui/system';
import type {Components} from 'react-markdown';

interface IMarkdownRendererProps {
  /**
   * The markdown content to render
   */
  content: string;

  /**
   * Optional class name for styling
   */
  className?: string;

  /**
   * Optional MUI sx props for styling
   */
  sx?: SxProps<Theme>;

  /**
   * Whether this renderer is used in a card/list preview
   * In preview mode, we'll use more compact styling and avoid DOM nesting issues
   */
  isPreview?: boolean;

  /**
   * Component to use for the root element
   * Use 'span' when MarkdownRenderer is inside a <p> or other text element
   * to prevent invalid DOM nesting
   */
  component?: React.ElementType;
}

interface MarkdownComponentProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// Extended sanitization schema to allow specific attributes and elements
const sanitizationSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'style', 'data-testid'],
    code: [...(defaultSchema.attributes?.code || []), 'className', 'inline']
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'div' // Allow div elements explicitly
  ]
};

/**
 * Renders markdown content with syntax highlighting and sanitization
 */
const MarkdownRenderer = forwardRef<HTMLElement, IMarkdownRendererProps>(({
  content,
  className,
  sx = {},
  isPreview = false,
  component = 'div'
}, ref) => {
  if (!content) {
    return null;
  }

  // Style configuration for the Box component
  const boxSxProps: SxProps<Theme> = {
    // Base styles for inline elements
    '& code': {
      backgroundColor: '#f0f0f0',
      borderRadius: '3px',
      padding: '0.2em 0.4em',
      fontFamily: 'monospace',
      fontSize: '0.9em'
    },
    '& pre': {
      backgroundColor: '#f6f8fa',
      borderRadius: '6px',
      padding: '16px',
      overflow: 'auto'
    },
    '& blockquote': {
      borderLeft: '4px solid #dfe2e5',
      paddingLeft: '1em',
      marginLeft: 0,
      color: '#6a737d'
    },
    // Headers
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: '24px',
      marginBottom: '16px',
      fontWeight: 600,
      lineHeight: 1.25
    },
    // Tables
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '1em 0'
    },
    '& th, & td': {
      border: '1px solid #dfe2e5',
      padding: '6px 13px'
    },
    '& th': {
      fontWeight: 600,
      backgroundColor: '#f6f8fa'
    },
    // Preview mode specific styling
    ...(isPreview && {
      // Use blocks with proper margins in preview mode
      '& .markdown-h1, & .markdown-h2, & .markdown-h3': {
        display: 'block',
        margin: '0.5em 0 0.3em',
      },
      '& .markdown-p': {
        display: 'block',
        margin: '0.3em 0',
      },
      '& img': {
        display: 'none', // Hide images in preview mode
      },
      // Ensure block elements are properly spaced
      '& .markdown-blockquote, & .markdown-pre, & .markdown-block-code': {
        display: 'block',
        margin: '1em 0',
      }
    }),
    ...sx
  };

  // Component overrides for ReactMarkdown
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mdComponents: Components = isPreview ? {
    // In preview mode, use spans and divs to avoid nesting violations
    p: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-p" data-testid="md-preview-p" {...props}>{children}</div>
    ),
    h1: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-h1" data-testid="md-preview-h1" style={{fontWeight: 'bold', fontSize: '1.5em'}} {...props}>{children}</div>
    ),
    h2: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-h2" data-testid="md-preview-h2" style={{fontWeight: 'bold', fontSize: '1.3em'}} {...props}>{children}</div>
    ),
    h3: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-h3" data-testid="md-preview-h3" style={{fontWeight: 'bold', fontSize: '1.1em'}} {...props}>{children}</div>
    ),
    ul: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-ul" data-testid="md-preview-ul" {...props}>{children}</div>
    ),
    ol: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-ol" data-testid="md-preview-ol" {...props}>{children}</div>
    ),
    li: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-li" data-testid="md-preview-li" style={{display: 'block', margin: '0.2em 0'}} {...props}>{children}</div>
    ),
    blockquote: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-blockquote" data-testid="md-preview-blockquote" style={{
        borderLeft: '4px solid #dfe2e5',
        paddingLeft: '1em',
        margin: '1em 0'
      }} {...props}>{children}</div>
    ),
    pre: ({children, ...props}: MarkdownComponentProps) => (
      <div className="markdown-pre" data-testid="md-preview-pre" style={{
        backgroundColor: '#f6f8fa',
        padding: '1em',
        borderRadius: '4px',
        overflow: 'auto',
        margin: '1em 0'
      }} {...props}>{children}</div>
    ),
    // Keep inline elements as spans
    a: ({children, href, ...props}: MarkdownComponentProps) => (
      <span className="markdown-a" data-testid="md-preview-a" style={{color: 'blue', textDecoration: 'underline'}} {...props}>{children}</span>
    ),
    code: ({inline, children, ...props}: MarkdownComponentProps) => (
      inline ? (
        <code className="markdown-inline-code" data-testid="md-preview-inline-code" {...props}>{children}</code>
      ) : (
        <div className="markdown-block-code" data-testid="md-preview-block-code" style={{
          display: 'block',
          background: '#f6f8fa',
          padding: '0.5em',
          margin: '1em 0'
        }} {...props}>{children}</div>
      )
    ),
    em: ({children, ...props}: MarkdownComponentProps) => (
      <span className="markdown-em" data-testid="md-preview-em" style={{fontStyle: 'italic'}} {...props}>{children}</span>
    ),
    strong: ({children, ...props}: MarkdownComponentProps) => (
      <span className="markdown-strong" data-testid="md-preview-strong" style={{fontWeight: 'bold'}} {...props}>{children}</span>
    )
  } : {
    // In full mode, use semantic HTML elements with proper test IDs
    p: ({children, ...props}: MarkdownComponentProps) => (
      <p className="markdown-p" data-testid="md-p" {...props}>{children}</p>
    ),
    h1: ({children, ...props}: MarkdownComponentProps) => (
      <h1 className="markdown-h1" data-testid="md-h1" {...props}>{children}</h1>
    ),
    h2: ({children, ...props}: MarkdownComponentProps) => (
      <h2 className="markdown-h2" data-testid="md-h2" {...props}>{children}</h2>
    ),
    h3: ({children, ...props}: MarkdownComponentProps) => (
      <h3 className="markdown-h3" data-testid="md-h3" {...props}>{children}</h3>
    ),
    a: ({children, href, ...props}: MarkdownComponentProps) => (
      <a className="markdown-a" data-testid="md-a" href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    ),
    ul: ({children, ...props}: MarkdownComponentProps) => (
      <ul className="markdown-ul" data-testid="md-ul" {...props}>{children}</ul>
    ),
    ol: ({children, ...props}: MarkdownComponentProps) => (
      <ol className="markdown-ol" data-testid="md-ol" {...props}>{children}</ol>
    ),
    li: ({children, ...props}: MarkdownComponentProps) => (
      <li className="markdown-li" data-testid="md-li" {...props}>{children}</li>
    ),
    pre: ({children, ...props}: MarkdownComponentProps) => (
      <pre className="markdown-pre" data-testid="md-pre" {...props}>{children}</pre>
    ),
    code: ({inline, children, ...props}: MarkdownComponentProps) => (
      inline ? (
        <code className="markdown-inline-code" data-testid="md-inline-code" {...props}>{children}</code>
      ) : (
        <pre className="markdown-block-code" data-testid="md-block-code">
          <code {...props}>{children}</code>
        </pre>
      )
    ),
    blockquote: ({children, ...props}: MarkdownComponentProps) => (
      <blockquote className="markdown-blockquote" data-testid="md-blockquote" {...props}>{children}</blockquote>
    ),
    em: ({children, ...props}: MarkdownComponentProps) => (
      <em className="markdown-em" data-testid="md-em" {...props}>{children}</em>
    ),
    strong: ({children, ...props}: MarkdownComponentProps) => (
      <strong className="markdown-strong" data-testid="md-strong" {...props}>{children}</strong>
    )
  };

  return (
    <Box
      component={component}
      ref={ref}
      className={`markdown-preview ${className || ''}`}
      data-testid="markdown-renderer"
      sx={boxSxProps}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizationSchema], rehypeHighlight]}
        components={mdComponents}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
});

// Display name for DevTools
MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
