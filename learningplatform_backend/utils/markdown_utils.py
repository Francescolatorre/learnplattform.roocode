import logging
import markdown
import bleach
from django.utils.safestring import mark_safe

logger = logging.getLogger(__name__)


def markdown_to_safe_html(md_text):
    """
    Convert markdown to HTML and sanitize it to prevent XSS attacks.

    Args:
        md_text (str): Markdown text to be converted

    Returns:
        str: Sanitized HTML string marked as safe for Django templates
    """
    if not md_text:
        return ""

    try:
        # Convert markdown to HTML with extensions
        html = markdown.markdown(
            md_text,
            extensions=[
                "extra",  # Tables, footnotes, etc.
                "codehilite",  # Code syntax highlighting
                "fenced_code",  # GitHub-style fenced code blocks
            ],
        )

        # Sanitize HTML
        allowed_tags = [
            "p",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "a",
            "ul",
            "ol",
            "li",
            "blockquote",
            "code",
            "pre",
            "strong",
            "em",
            "img",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "hr",
            "br",
            "div",
            "span",
        ]
        allowed_attrs = {
            "a": ["href", "title", "target", "rel"],
            "img": ["src", "alt", "title", "width", "height"],
            "code": ["class"],
            "pre": ["class"],
            "th": ["align", "scope"],
            "td": ["align"],
            "div": ["class"],
            "span": ["class"],
        }

        sanitized_html = bleach.clean(html, tags=allowed_tags, attributes=allowed_attrs)

        return mark_safe(sanitized_html)
    except Exception as e:
        logger.error("Error converting markdown to HTML: %s", str(e))
        return md_text
