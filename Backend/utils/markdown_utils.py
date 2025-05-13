"""
Markdown processing utilities for the Learning Platform.

This module provides utilities for processing and rendering markdown content
used throughout the platform, including course descriptions, task content,
and quiz questions.
"""

import logging
import re
from typing import Dict, Any, Tuple, List, Optional

import markdown
import bleach  # Updated import
from django.utils.safestring import mark_safe
from pygments import highlight
from pygments.formatters.html import HtmlFormatter
from pygments.lexers import get_lexer_by_name
from pygments.lexers.special import TextLexer

logger = logging.getLogger(__name__)

# Extend allowed HTML tags and attributes for rich content
EXTENDED_ALLOWED_TAGS = {
    "img",
    "code",
    "pre",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "div",
    "span",
    "p",
    "br",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "em",
    "strong",
    "small",
    "s",
    "cite",
    "q",
    "dfn",
    "abbr",
    "data",
    "time",
    "code",
    "var",
    "samp",
    "kbd",
    "sub",
    "sup",
    "i",
    "b",
    "u",
    "mark",
    "ruby",
    "rt",
    "rp",
    "bdi",
    "bdo",
    "span",
    "del",
    "ins",
}

EXTENDED_ALLOWED_ATTRS = {
    "img": ["src", "alt", "title", "class", "width", "height"],
    "code": ["class"],
    "pre": ["class"],
    "div": ["class"],
    "span": ["class"],
    "table": ["class"],
    "th": ["scope"],
    "td": ["colspan", "rowspan"],
    "a": ["href", "title", "class", "rel"],
    "abbr": ["title"],
    "time": ["datetime"],
}


def convert_markdown_to_html(
    content: str, extensions: Optional[List[str]] = None, strip_unsafe: bool = True
) -> str:
    """
    Convert markdown content to safe HTML.

    Args:
        content (str): The markdown content to convert
        extensions (Optional[List[str]]): Additional markdown extensions to enable
        strip_unsafe (bool): Whether to sanitize HTML output (default: True)

    Returns:
        str: The sanitized HTML output

    Raises:
        ValueError: If content is None or empty

    Example:
        >>> html = convert_markdown_to_html("**Bold** and *italic*")
        >>> print(html)
        '<p><strong>Bold</strong> and <em>italic</em></p>'
    """
    if not content:
        raise ValueError("Content cannot be empty")

    # Default extensions
    default_extensions = [
        "tables",
        "fenced_code",
        "footnotes",
        "attr_list",
        "def_list",
        "abbr",
    ]

    if extensions:
        default_extensions.extend(extensions)

    try:
        # Convert markdown to HTML
        html = markdown.markdown(content, extensions=default_extensions)

        # Optionally sanitize output
        if strip_unsafe:
            html = bleach.clean(  # Updated to use bleach.clean directly
                html,
                tags=EXTENDED_ALLOWED_TAGS,
                attributes=EXTENDED_ALLOWED_ATTRS,
                strip=True,
            )

        return mark_safe(html)
    except Exception as e:
        logger.error("Error converting markdown to HTML: %s", str(e))
        raise


def process_code_blocks(html: str, default_lang: str = "text") -> str:
    """
    Process and syntax highlight code blocks in HTML content.

    Args:
        html (str): HTML content containing code blocks
        default_lang (str): Default language for highlighting (default: "text")

    Returns:
        str: HTML with syntax highlighted code blocks

    Example:
        >>> html = '<pre><code class="language-python">print("Hello")</code></pre>'
        >>> highlighted = process_code_blocks(html)
    """
    code_block_pattern = re.compile(
        r'<pre><code(?:\s+class="language-([^"]+)")?>([^<]+)</code></pre>'
    )

    def replace_code_block(match):
        lang = match.group(1) or default_lang
        code = match.group(2)

        try:
            lexer = get_lexer_by_name(lang, stripall=True)
        except ValueError:
            lexer = TextLexer(stripall=True)

        formatter = HtmlFormatter(cssclass=f"highlight language-{lang}")
        highlighted = highlight(code, lexer, formatter)
        return highlighted

    return code_block_pattern.sub(replace_code_block, html)


def validate_markdown_content(
    content: str,
    max_length: Optional[int] = None,
    required_sections: Optional[List[str]] = None,
) -> Tuple[bool, List[str]]:
    """
    Validate markdown content against platform requirements.

    Checks:
    - Content is not empty
    - Content length is within limits
    - Required sections are present
    - Code blocks are properly formatted
    - Images have alt text

    Args:
        content (str): Markdown content to validate
        max_length (Optional[int]): Maximum allowed length
        required_sections (Optional[List[str]]): List of required section headers

    Returns:
        Tuple[bool, List[str]]: (is_valid, list_of_errors)
    """
    errors = []

    # Check content is not empty
    if not content:
        errors.append("Content cannot be empty")
        return False, errors

    # Check length limit
    if max_length and len(content) > max_length:
        errors.append(f"Content exceeds maximum length of {max_length} characters")

    # Check required sections
    if required_sections:
        for section in required_sections:
            pattern = rf"^#+\s*{re.escape(section)}\s*$"
            if not re.search(pattern, content, re.MULTILINE):
                errors.append(f"Missing required section: {section}")

    # Check code blocks
    code_blocks = re.finditer(r"```(\w+)?\n[^`]+```", content)
    for block in code_blocks:
        if not block.group(1):
            errors.append("Code block missing language specification")

    # Check images have alt text
    images = re.finditer(r"!\[(.*?)\]\((.*?)\)", content)
    for img in images:
        if not img.group(1):
            errors.append(f"Image missing alt text: {img.group(2)}")

    return len(errors) == 0, errors


def extract_metadata(content: str) -> Dict[str, Any]:
    """
    Extract YAML frontmatter metadata from markdown content.

    Args:
        content (str): Markdown content with optional YAML frontmatter

    Returns:
        Dict[str, Any]: Extracted metadata key-value pairs
    """
    try:
        import yaml

        # Look for YAML frontmatter between --- markers
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                try:
                    return yaml.safe_load(parts[1])
                except yaml.YAMLError as e:
                    logger.error("Error parsing YAML frontmatter: %s", str(e))

        return {}
    except ImportError:
        logger.warning("yaml package not installed, skipping frontmatter extraction")
        return {}
