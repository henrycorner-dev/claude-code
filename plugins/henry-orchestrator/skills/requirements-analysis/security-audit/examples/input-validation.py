"""
Input Validation Examples
Demonstrates secure input validation patterns
"""

import re
from typing import Any, Optional


class ValidationError(Exception):
    """Custom validation exception"""
    pass


def validate_username(username: str) -> str:
    """
    Validate username format
    - Only alphanumeric and underscore
    - Length 3-20 characters
    """
    if not isinstance(username, str):
        raise ValidationError("Username must be a string")

    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        raise ValidationError(
            "Username must be 3-20 alphanumeric characters or underscore"
        )

    return username


def validate_email(email: str) -> str:
    """
    Validate email format
    - Basic email pattern
    - RFC 5321 length limit (254 chars)
    """
    if not isinstance(email, str):
        raise ValidationError("Email must be a string")

    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format")

    if len(email) > 254:
        raise ValidationError("Email too long")

    return email.lower()


def validate_phone(phone: str) -> str:
    """
    Validate US phone number
    - Accepts formats: (123) 456-7890, 123-456-7890, 1234567890
    - Returns normalized format
    """
    if not isinstance(phone, str):
        raise ValidationError("Phone must be a string")

    # Remove common formatting characters
    digits = re.sub(r'[^\d]', '', phone)

    # Check for 10 digits
    if not re.match(r'^\d{10}$', digits):
        raise ValidationError("Phone must be 10 digits")

    # Return formatted
    return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"


def validate_url(url: str, allowed_schemes: set = {'http', 'https'}) -> str:
    """
    Validate URL format
    - Only allow specific schemes
    - No credentials in URL
    """
    if not isinstance(url, str):
        raise ValidationError("URL must be a string")

    from urllib.parse import urlparse

    try:
        parsed = urlparse(url)
    except Exception:
        raise ValidationError("Invalid URL format")

    if parsed.scheme not in allowed_schemes:
        raise ValidationError(f"Scheme must be one of: {allowed_schemes}")

    if parsed.username or parsed.password:
        raise ValidationError("Credentials not allowed in URL")

    if not parsed.netloc:
        raise ValidationError("URL must have a domain")

    return url


def validate_integer(
    value: Any,
    min_val: Optional[int] = None,
    max_val: Optional[int] = None
) -> int:
    """
    Validate integer with optional range
    """
    try:
        int_val = int(value)
    except (TypeError, ValueError):
        raise ValidationError("Must be an integer")

    if min_val is not None and int_val < min_val:
        raise ValidationError(f"Must be at least {min_val}")

    if max_val is not None and int_val > max_val:
        raise ValidationError(f"Must be at most {max_val}")

    return int_val


def validate_enum(value: str, allowed_values: set) -> str:
    """
    Validate value against whitelist
    """
    if value not in allowed_values:
        raise ValidationError(f"Must be one of: {', '.join(allowed_values)}")

    return value


def validate_date(date_str: str, format: str = '%Y-%m-%d') -> str:
    """
    Validate date format
    """
    from datetime import datetime

    try:
        datetime.strptime(date_str, format)
    except ValueError:
        raise ValidationError(f"Date must be in format {format}")

    return date_str


def validate_credit_card(card_number: str) -> bool:
    """
    Validate credit card using Luhn algorithm
    WARNING: This only validates format, not authenticity
    """
    if not isinstance(card_number, str):
        return False

    # Remove spaces and dashes
    digits = re.sub(r'[^\d]', '', card_number)

    # Check length (13-19 digits for most cards)
    if not 13 <= len(digits) <= 19:
        return False

    # Luhn algorithm
    def luhn_check(number):
        digits = [int(d) for d in number]
        checksum = 0

        # Process from right to left
        for i, digit in enumerate(reversed(digits)):
            if i % 2 == 1:  # Every second digit
                digit *= 2
                if digit > 9:
                    digit -= 9
            checksum += digit

        return checksum % 10 == 0

    return luhn_check(digits)


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal
    - Remove path separators
    - Remove null bytes
    - Limit length
    """
    if not isinstance(filename, str):
        raise ValidationError("Filename must be a string")

    # Remove null bytes
    filename = filename.replace('\x00', '')

    # Remove path separators
    filename = filename.replace('/', '').replace('\\', '')

    # Remove leading dots (hidden files)
    filename = filename.lstrip('.')

    # Limit length
    if len(filename) > 255:
        filename = filename[:255]

    if not filename:
        raise ValidationError("Invalid filename")

    return filename


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Check password strength
    Returns (is_valid, message)
    """
    if len(password) < 12:
        return False, "Password must be at least 12 characters"

    if not re.search(r'[A-Z]', password):
        return False, "Password must contain uppercase letter"

    if not re.search(r'[a-z]', password):
        return False, "Password must contain lowercase letter"

    if not re.search(r'[0-9]', password):
        return False, "Password must contain digit"

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain special character"

    # Check for common patterns
    common_patterns = ['123456', 'password', 'qwerty', 'abc123']
    if any(pattern in password.lower() for pattern in common_patterns):
        return False, "Password contains common pattern"

    return True, "Password is strong"


# Example usage
if __name__ == '__main__':
    # Test username validation
    try:
        valid_username = validate_username("john_doe123")
        print(f"Valid username: {valid_username}")
    except ValidationError as e:
        print(f"Invalid: {e}")

    try:
        validate_username("invalid@user")  # Contains @
    except ValidationError as e:
        print(f"Caught invalid username: {e}")

    # Test email validation
    try:
        valid_email = validate_email("user@example.com")
        print(f"Valid email: {valid_email}")
    except ValidationError as e:
        print(f"Invalid: {e}")

    # Test phone validation
    try:
        valid_phone = validate_phone("(123) 456-7890")
        print(f"Valid phone: {valid_phone}")
    except ValidationError as e:
        print(f"Invalid: {e}")

    # Test integer validation
    try:
        age = validate_integer("25", min_val=0, max_val=150)
        print(f"Valid age: {age}")
    except ValidationError as e:
        print(f"Invalid: {e}")

    # Test password strength
    is_valid, message = validate_password_strength("MyP@ssw0rd123!")
    print(f"Password validation: {is_valid} - {message}")
