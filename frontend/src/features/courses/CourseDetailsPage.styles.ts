const markdownStyles = {
    content: {
        '& h1': { fontSize: '2rem', marginTop: '1.5rem', marginBottom: '1rem' },
        '& h2': { fontSize: '1.75rem', marginTop: '1.25rem', marginBottom: '0.75rem' },
        '& h3': { fontSize: '1.5rem', marginTop: '1rem', marginBottom: '0.5rem' },
        '& p': { marginBottom: '1rem' },
        '& ul, & ol': { paddingLeft: '2rem', marginBottom: '1rem' },
        '& li': { marginBottom: '0.5rem' },
        '& a': { color: '#1976d2', textDecoration: 'none' },
        '& a:hover': { textDecoration: 'underline' },
        '& blockquote': {
            borderLeft: '4px solid #e0e0e0',
            paddingLeft: '1rem',
            fontStyle: 'italic',
            color: '#616161',
            margin: '1rem 0'
        },
        '& img': { maxWidth: '100%', height: 'auto' },
        '& code': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            padding: '0.2em 0.4em',
            borderRadius: '3px',
            fontFamily: 'monospace'
        },
        '& table': {
            borderCollapse: 'collapse',
            width: '100%',
            marginBottom: '1rem'
        },
        '& th, & td': {
            border: '1px solid #e0e0e0',
            padding: '0.5rem'
        },
        '& th': { backgroundColor: '#f5f5f5' }
    }
};

export default markdownStyles;
