import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Theme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { SxProps } from '@mui/system';
import React, { useState } from 'react';

import MarkdownRenderer from './MarkdownRenderer';

interface IMarkdownEditorProps {
  /**
   * The current markdown content
   */
  value: string;

  /**
   * Callback when content changes
   */
  onChange: (value: string) => void;

  /**
   * Optional label for the editor
   */
  label?: string;

  /**
   * Optional placeholder text
   */
  placeholder?: string;

  /**
   * Optional id for the input field
   * This is important for test selectors
   */
  id?: string;

  /**
   * Minimum number of rows for the editor
   * @default 8
   */
  minRows?: number;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Error message text
   */
  helperText?: string;

  /**
   * Optional MUI sx props for styling
   */
  sx?: SxProps<Theme>;

  /**
   * Whether the component is in a disabled state
   */
  disabled?: boolean;
}

/**
 * Markdown editor component with Write/Preview tabs
 */
const MarkdownEditor: React.FC<IMarkdownEditorProps> = ({
  id,
  value,
  onChange,
  label,
  placeholder = 'Enter Markdown content here...',
  minRows = 8,
  error = false,
  helperText,
  sx = {},
  disabled = false,
}) => {
  const [currentTab, setCurrentTab] = useState<'write' | 'preview'>('write');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'write' | 'preview') => {
    setCurrentTab(newValue);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  return (
    <Box sx={{ width: '100%', ...sx }} data-testid="markdown-editor" className="markdown-editor">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {label && (
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            {label}
          </Typography>
        )}
        <Tooltip title="Markdown Help">
          <IconButton
            size="small"
            onClick={() => setShowHelp(true)}
            aria-label="Markdown Help"
            data-testid="markdown-help-button"
            className="markdown-help-button"
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper variant="outlined" sx={{ mb: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="Markdown editor tabs"
            data-testid="markdown-editor-tabs"
          >
            <Tab label="Write" value="write" disabled={disabled} data-testid="markdown-write-tab" />
            <Tab label="Preview" value="preview" data-testid="markdown-preview-tab" />
          </Tabs>
        </Box>

        {currentTab === 'write' ? (
          <TextField
            id={id}
            fullWidth
            multiline
            minRows={minRows}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            variant="outlined"
            error={error}
            helperText={helperText}
            disabled={disabled}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              },
            }}
            name="markdown-content"
            inputProps={{
              'data-testid': 'markdown-editor-textarea',
              className: 'markdown-editor-textarea',
            }}
          />
        ) : (
          <Box
            sx={{ p: 2, minHeight: `${minRows * 1.5}em` }}
            data-testid="markdown-preview-container"
            className="markdown-preview-container"
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No content to preview
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Markdown Help Dialog */}
      <Dialog
        open={showHelp}
        onClose={handleCloseHelp}
        maxWidth="md"
        aria-labelledby="markdown-help-dialog-title"
        data-testid="markdown-help-dialog"
        className="markdown-help-dialog"
      >
        <DialogTitle id="markdown-help-dialog-title">Markdown Reference</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" data-testid="markdown-help-headers">
            Headers
          </Typography>
          <Box
            component="pre"
            sx={{ backgroundColor: '#f6f8fa', p: 1, borderRadius: 1, mb: 2 }}
            data-testid="markdown-help-headers-example"
          >
            # Heading 1{'\n'}
            ## Heading 2{'\n'}
            ### Heading 3
          </Box>

          <Typography variant="subtitle2" data-testid="markdown-help-emphasis">
            Emphasis
          </Typography>
          <Box
            component="pre"
            sx={{ backgroundColor: '#f6f8fa', p: 1, borderRadius: 1, mb: 2 }}
            data-testid="markdown-help-emphasis-example"
          >
            *italic* or _italic_{'\n'}
            **bold** or __bold__{'\n'}
            **_bold and italic_**
          </Box>

          <Typography variant="subtitle2" data-testid="markdown-help-lists">
            Lists
          </Typography>
          <Box
            component="pre"
            sx={{ backgroundColor: '#f6f8fa', p: 1, borderRadius: 1, mb: 2 }}
            data-testid="markdown-help-lists-example"
          >
            - Item 1{'\n'}- Item 2{'\n'}
            {'  '}- Subitem{'\n\n'}
            1. Numbered Item 1{'\n'}
            2. Numbered Item 2
          </Box>

          <Typography variant="subtitle2" data-testid="markdown-help-links">
            Links
          </Typography>
          <Box
            component="pre"
            sx={{ backgroundColor: '#f6f8fa', p: 1, borderRadius: 1, mb: 2 }}
            data-testid="markdown-help-links-example"
          >
            [Link text](https://example.com)
          </Box>

          <Typography variant="subtitle2" data-testid="markdown-help-images">
            Images
          </Typography>
          <Box
            component="pre"
            sx={{ backgroundColor: '#f6f8fa', p: 1, borderRadius: 1, mb: 2 }}
            data-testid="markdown-help-images-example"
          >
            ![Alt text](https://example.com/image.jpg)
          </Box>

          <Typography variant="subtitle2" data-testid="markdown-help-code">
            Code
          </Typography>
          <Box
            component="pre"
            sx={{ backgroundColor: '#f6f8fa', p: 1, borderRadius: 1, mb: 2 }}
            data-testid="markdown-help-code-example"
          >
            `inline code`{'\n\n'}
            ```{'\n'}
            {/* Code block */}
            function example() {'{'}
            return &apos;Hello World&apos;;
            {'}'}
            {'\n'}
            ```
          </Box>

          <Typography variant="subtitle2" data-testid="markdown-help-tables">
            Tables
          </Typography>
          <Box
            component="pre"
            sx={{ backgroundColor: '#f6f8fa', p: 1, borderRadius: 1, mb: 2 }}
            data-testid="markdown-help-tables-example"
          >
            | Header 1 | Header 2 |{'\n'}| -------- | -------- |{'\n'}| Cell 1 | Cell 2 |{'\n'}|
            Cell 3 | Cell 4 |
          </Box>

          <Typography variant="subtitle2" data-testid="markdown-help-blockquotes">
            Blockquotes
          </Typography>
          <Box
            component="pre"
            sx={{ backgroundColor: '#f6f8fa', p: 1, borderRadius: 1, mb: 2 }}
            data-testid="markdown-help-blockquotes-example"
          >
            {'> This is a blockquote'}
            {'\n'}
            {'> It can span multiple lines'}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHelp} data-testid="markdown-help-close-button">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarkdownEditor;
