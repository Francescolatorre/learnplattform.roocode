import pytest
from utils.markdown_utils import markdown_to_safe_html

class TestMarkdownUtils:
    def test_basic_markdown_rendering(self):
        """Test that basic markdown elements are rendered correctly"""
        markdown_text = """
# Heading 1
## Heading 2

This is a **bold** text and *italic* text.

- List item 1
- List item 2
"""
        html = markdown_to_safe_html(markdown_text)

        # Check for rendered HTML elements
        assert '<h1>Heading 1</h1>' in html
        assert '<h2>Heading 2</h2>' in html
        assert '<strong>bold</strong>' in html
        assert '<em>italic</em>' in html
        assert '<ul>' in html
        assert '<li>List item 1</li>' in html

    def test_code_block_rendering(self):
        """Test that code blocks are rendered with syntax highlighting"""
        markdown_text = """
```python
def hello_world():
    return "Hello, World!"
