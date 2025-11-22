"""
XSS (Cross-Site Scripting) Prevention Examples
Demonstrates output encoding for different contexts
"""

import html
import json
from urllib.parse import quote, quote_plus
import re


def escape_html(text: str) -> str:
    """
    Escape HTML special characters
    Use for inserting untrusted data into HTML body
    """
    return html.escape(text, quote=True)


def escape_html_attribute(text: str) -> str:
    """
    Escape for HTML attribute values
    Always use quotes around attributes
    """
    # html.escape with quote=True escapes both " and '
    return html.escape(text, quote=True)


def escape_javascript_string(text: str) -> str:
    """
    Escape for JavaScript string context
    Use within quoted strings in JS
    """
    # Escape special characters for JS
    escape_map = {
        '\\': '\\\\',
        '"': '\\"',
        "'": "\\'",
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
        '\b': '\\b',
        '\f': '\\f',
        '<': '\\x3C',  # Prevent </script> injection
        '>': '\\x3E',
        '&': '\\x26',
    }

    result = []
    for char in text:
        if char in escape_map:
            result.append(escape_map[char])
        elif ord(char) < 32 or ord(char) > 126:
            # Escape control characters and non-ASCII
            result.append(f'\\u{ord(char):04x}')
        else:
            result.append(char)

    return ''.join(result)


def json_encode_for_javascript(data: any) -> str:
    """
    Safely encode data as JSON for JavaScript context
    Prevents XSS in JSON data
    """
    # Use json.dumps with ensure_ascii=True to escape unicode
    json_str = json.dumps(data, ensure_ascii=True)

    # Replace HTML special chars to prevent context breaking
    json_str = json_str.replace('<', '\\u003c')
    json_str = json_str.replace('>', '\\u003e')
    json_str = json_str.replace('&', '\\u0026')

    return json_str


def escape_url_parameter(text: str) -> str:
    """
    Escape for URL parameter values
    """
    return quote(text, safe='')


def escape_url_path(text: str) -> str:
    """
    Escape for URL path segments
    """
    return quote(text, safe='')


def escape_css(text: str) -> str:
    """
    Escape for CSS context
    WARNING: Very limited - prefer whitelisting
    """
    # CSS escaping is complex; best to avoid user input in CSS
    # This is a basic implementation
    escaped = []
    for char in text:
        if char.isalnum():
            escaped.append(char)
        else:
            escaped.append(f'\\{ord(char):x} ')

    return ''.join(escaped)


# Flask template examples
class FlaskXSSExamples:
    """
    Examples for Flask/Jinja2 templates
    Jinja2 auto-escapes by default, but context matters
    """

    @staticmethod
    def html_context_example(user_input: str) -> str:
        """
        HTML body context
        Jinja2: {{ user_input }} (auto-escaped)
        """
        template = f"<div>Hello, {escape_html(user_input)}!</div>"
        return template

    @staticmethod
    def attribute_context_example(user_input: str) -> str:
        """
        HTML attribute context
        Must use quotes around attribute value
        """
        safe_input = escape_html_attribute(user_input)
        template = f'<div class="user-content" data-name="{safe_input}"></div>'
        return template

    @staticmethod
    def javascript_context_example(user_input: str) -> str:
        """
        JavaScript string context
        """
        safe_input = escape_javascript_string(user_input)
        template = f"""
        <script>
            var userName = "{safe_input}";
            console.log(userName);
        </script>
        """
        return template

    @staticmethod
    def json_context_example(user_data: dict) -> str:
        """
        Embedding JSON in JavaScript
        """
        safe_json = json_encode_for_javascript(user_data)
        template = f"""
        <script>
            var userData = {safe_json};
        </script>
        """
        return template

    @staticmethod
    def url_context_example(user_input: str) -> str:
        """
        URL parameter context
        """
        safe_input = escape_url_parameter(user_input)
        template = f'<a href="/search?q={safe_input}">Search</a>'
        return template

    @staticmethod
    def dangerous_examples():
        """
        DANGEROUS patterns to avoid
        """
        user_input = "<script>alert('XSS')</script>"

        # INSECURE: Using |safe or Markup bypasses escaping
        # template = f"<div>{Markup(user_input)}</div>"  # DON'T DO THIS

        # INSECURE: innerHTML in JavaScript
        dangerous_js = f"""
        <script>
            document.getElementById('content').innerHTML = "{user_input}";
        </script>
        """

        # INSECURE: eval or Function constructor
        dangerous_eval = f"""
        <script>
            eval("{user_input}");
        </script>
        """


# React examples
class ReactXSSExamples:
    """
    Examples for React
    React escapes by default for JSX text content
    """

    @staticmethod
    def safe_text_content():
        """
        React safely renders text content
        """
        code = """
        function UserGreeting({ name }) {
            // Safe: React auto-escapes
            return <div>Hello, {name}!</div>;
        }
        """
        return code

    @staticmethod
    def unsafe_dangerously_set_html():
        """
        DANGEROUS: dangerouslySetInnerHTML bypasses protection
        """
        code = """
        function UnsafeComponent({ htmlContent }) {
            // DANGEROUS: User input rendered as HTML
            return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
        }
        """
        return code

    @staticmethod
    def safe_sanitized_html():
        """
        Safe: Use DOMPurify to sanitize HTML before rendering
        """
        code = """
        import DOMPurify from 'dompurify';

        function SafeComponent({ htmlContent }) {
            const sanitized = DOMPurify.sanitize(htmlContent);
            return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
        }
        """
        return code

    @staticmethod
    def safe_url_attribute():
        """
        Safe: Validate URL before using in href
        """
        code = """
        function SafeLink({ url, text }) {
            // Validate URL scheme
            const isValidUrl = (url) => {
                try {
                    const parsed = new URL(url);
                    return ['http:', 'https:'].includes(parsed.protocol);
                } catch {
                    return false;
                }
            };

            if (!isValidUrl(url)) {
                return <span>{text}</span>;
            }

            return <a href={url}>{text}</a>;
        }
        """
        return code


# Content Security Policy
class CSPExamples:
    """
    Content Security Policy headers for defense in depth
    """

    @staticmethod
    def strict_csp() -> dict:
        """
        Strict CSP that blocks inline scripts
        """
        return {
            'Content-Security-Policy': (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self'; "
                "img-src 'self' data:; "
                "font-src 'self'; "
                "connect-src 'self'; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self';"
            )
        }

    @staticmethod
    def csp_with_nonce(nonce: str) -> dict:
        """
        CSP using nonce for inline scripts
        """
        return {
            'Content-Security-Policy': (
                f"default-src 'self'; "
                f"script-src 'self' 'nonce-{nonce}'; "
                f"style-src 'self' 'nonce-{nonce}'; "
                f"img-src 'self' data:; "
                f"font-src 'self'; "
                f"connect-src 'self'; "
                f"frame-ancestors 'none';"
            )
        }


# Input sanitization (whitelist approach)
def sanitize_html_whitelist(html_content: str) -> str:
    """
    Sanitize HTML using whitelist approach
    Only allow safe tags and attributes
    For production, use libraries like bleach
    """
    # Simple example - use bleach library in production
    import re

    # Whitelist of allowed tags
    allowed_tags = {'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'}

    # Remove all tags except allowed ones
    def replace_tag(match):
        tag = match.group(1).lower()
        if tag in allowed_tags:
            return match.group(0)
        return ''

    # Remove script and style tags completely
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)

    # Filter tags
    html_content = re.sub(r'<(/?)(\w+)[^>]*>', replace_tag, html_content)

    return html_content


# Better: Use bleach library
def sanitize_html_with_bleach(html_content: str) -> str:
    """
    Sanitize HTML using bleach library
    This is the recommended approach
    """
    try:
        import bleach

        allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote']
        allowed_attributes = {
            'a': ['href', 'title'],
        }
        allowed_protocols = ['http', 'https', 'mailto']

        clean = bleach.clean(
            html_content,
            tags=allowed_tags,
            attributes=allowed_attributes,
            protocols=allowed_protocols,
            strip=True
        )

        return clean
    except ImportError:
        # Fallback if bleach not installed
        return escape_html(html_content)


# Example usage
if __name__ == '__main__':
    # Test cases
    malicious_input = "<script>alert('XSS')</script>"

    print("HTML Context:")
    print(escape_html(malicious_input))
    print()

    print("Attribute Context:")
    print(f'<div data-content="{escape_html_attribute(malicious_input)}"></div>')
    print()

    print("JavaScript Context:")
    print(f'var data = "{escape_javascript_string(malicious_input)}";')
    print()

    print("JSON Context:")
    user_data = {'name': malicious_input, 'role': 'user'}
    print(f'var userData = {json_encode_for_javascript(user_data)};')
    print()

    print("URL Context:")
    print(f'/search?q={escape_url_parameter(malicious_input)}')
    print()

    # Test HTML sanitization
    html_with_script = '<p>Hello</p><script>alert("XSS")</script><p>World</p>'
    print("Sanitized HTML:")
    print(sanitize_html_whitelist(html_with_script))
