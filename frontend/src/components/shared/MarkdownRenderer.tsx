import React, {forwardRef} from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';
import {Box, Theme} from '@mui/material';
import {SxProps} from '@mui/system';

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

  // Use different components based on whether this is in preview mode
  // This helps avoid invalid DOM nesting like <p> inside <p>
  const components = isPreview ? {
    // In preview mode, use spans to avoid nesting violations
    p: ({node, ...props}) => <span className="markdown-p" {...props} />,
    h1: ({node, ...props}) => <span className="markdown-h1" style={{fontWeight: 'bold', fontSize: '1.5em'}} {...props} />,
    h2: ({node, ...props}) => <span className="markdown-h2" style={{fontWeight: 'bold', fontSize: '1.3em'}} {...props} />,
    h3: ({node, ...props}) => <span className="markdown-h3" style={{fontWeight: 'bold', fontSize: '1.1em'}} {...props} />,
    ul: ({node, ...props}) => <span className="markdown-ul" {...props} />,
    ol: ({node, ...props}) => <span className="markdown-ol" {...props} />,
    li: ({node, ...props}) => <span className="markdown-li" style={{display: 'block', margin: '0.2em 0'}} {...props} />,
    a: ({node, ...props}) => <span className="markdown-a" style={{color: 'blue', textDecoration: 'underline'}} {...props} />,
    code: ({node, inline, ...props}) =>
      inline
        ? <code className="markdown-inline-code" {...props} />
        : <span className="markdown-block-code" style={{display: 'block', background: '#f6f8fa', padding: '0.5em'}} {...props} />
  } : {
    // In full mode, use normal HTML elements
    a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="markdown-a" {...props} />,
    h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
    h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
    h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
    p: ({node, ...props}) => <p className="markdown-p" {...props} />,
    ul: ({node, ...props}) => <ul className="markdown-ul" {...props} />,
    ol: ({node, ...props}) => <ol className="markdown-ol" {...props} />,
    li: ({node, ...props}) => <li className="markdown-li" {...props} />,
    pre: ({node, ...props}) => <pre className="markdown-pre" {...props} />,
    code: ({node, inline, ...props}) =>
      inline
        ? <code className="markdown-inline-code" {...props} />
        : <code className="markdown-block-code" {...props} />
  };

  return (
    <Box
      component={component}
      ref={ref}
      className={`markdown-preview ${className || ''}`}
      sx={{
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
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          marginTop: '24px',
          marginBottom: '16px',
          fontWeight: 600,
          lineHeight: 1.25
        },
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
        // Preview mode styling
        ...(isPreview && {
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
          }
        }),
        ...sx
      }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // GitHub Flavored Markdown support
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
});

// Display name for DevTools
MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
