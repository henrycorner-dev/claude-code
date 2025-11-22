# Docstring Styles

Language-specific docstring formats and conventions for documentation extraction.

## Python

### Google Style (Recommended)

```python
def function_name(param1, param2, param3=None):
    """Brief summary of function in one line.

    More detailed description of the function. Can span
    multiple lines and include additional context.

    Args:
        param1 (str): Description of param1.
        param2 (int): Description of param2.
        param3 (list, optional): Description of param3. Defaults to None.

    Returns:
        dict: Description of return value.
            Keys:
                'key1' (str): Description of key1.
                'key2' (int): Description of key2.

    Raises:
        ValueError: Description of when this error is raised.
        TypeError: Description of when this error is raised.

    Example:
        >>> result = function_name('hello', 42)
        >>> print(result)
        {'key1': 'hello', 'key2': 42}

    Note:
        Additional notes about the function.

    See Also:
        other_function: Related function.
    """
    pass


class ClassName:
    """Brief summary of class.

    Longer description of the class and its purpose.

    Attributes:
        attr1 (str): Description of attr1.
        attr2 (int): Description of attr2.

    Example:
        >>> obj = ClassName('value', 42)
        >>> obj.method()
    """

    def __init__(self, param1, param2):
        """Initialize the class.

        Args:
            param1 (str): Description of param1.
            param2 (int): Description of param2.
        """
        self.attr1 = param1
        self.attr2 = param2
```

### NumPy Style

```python
def function_name(param1, param2, param3=None):
    """
    Brief summary of function.

    More detailed description of the function. Can span
    multiple lines.

    Parameters
    ----------
    param1 : str
        Description of param1.
    param2 : int
        Description of param2.
    param3 : list, optional
        Description of param3 (default is None).

    Returns
    -------
    dict
        Description of return value.

        Keys
        ----
        key1 : str
            Description of key1.
        key2 : int
            Description of key2.

    Raises
    ------
    ValueError
        Description of when this error is raised.
    TypeError
        Description of when this error is raised.

    Examples
    --------
    >>> result = function_name('hello', 42)
    >>> print(result)
    {'key1': 'hello', 'key2': 42}

    Notes
    -----
    Additional notes about the function.

    See Also
    --------
    other_function : Related function.
    """
    pass
```

### Sphinx Style

```python
def function_name(param1, param2, param3=None):
    """Brief summary of function.

    More detailed description of the function.

    :param param1: Description of param1.
    :type param1: str
    :param param2: Description of param2.
    :type param2: int
    :param param3: Description of param3.
    :type param3: list, optional
    :returns: Description of return value.
    :rtype: dict
    :raises ValueError: Description of when this error is raised.
    :raises TypeError: Description of when this error is raised.

    Example::

        >>> result = function_name('hello', 42)
        >>> print(result)
        {'key1': 'hello', 'key2': 42}

    .. note::
        Additional notes about the function.

    .. seealso:: :func:`other_function`
    """
    pass
```

### Extracting Python Docstrings

```python
import ast
import inspect

def extract_docstrings(file_path):
    """Extract docstrings from Python file.

    Args:
        file_path (str): Path to Python file.

    Returns:
        dict: Mapping of function/class names to docstrings.
    """
    with open(file_path, 'r') as f:
        tree = ast.parse(f.read())

    docstrings = {}

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            docstring = ast.get_docstring(node)
            if docstring:
                docstrings[node.name] = docstring

    return docstrings
```

## JavaScript/TypeScript

### JSDoc (Standard)

```javascript
/**
 * Brief summary of function.
 *
 * More detailed description of the function.
 *
 * @param {string} param1 - Description of param1.
 * @param {number} param2 - Description of param2.
 * @param {Object} [options] - Optional configuration.
 * @param {boolean} [options.flag=false] - Description of flag.
 * @param {string} [options.mode='default'] - Description of mode.
 * @returns {Promise<Object>} Description of return value.
 * @throws {Error} Description of when error is thrown.
 *
 * @example
 * const result = await functionName('hello', 42);
 * console.log(result);
 *
 * @example
 * const result = await functionName('hello', 42, {
 *   flag: true,
 *   mode: 'advanced'
 * });
 *
 * @see {@link otherFunction}
 * @since 1.2.0
 */
function functionName(param1, param2, options = {}) {
  // implementation
}

/**
 * Brief summary of class.
 *
 * @class
 * @classdesc Detailed description of the class.
 *
 * @param {string} param1 - Description of param1.
 * @param {number} param2 - Description of param2.
 *
 * @property {string} prop1 - Description of prop1.
 * @property {number} prop2 - Description of prop2.
 *
 * @example
 * const obj = new ClassName('value', 42);
 * obj.method();
 */
class ClassName {
  constructor(param1, param2) {
    this.prop1 = param1;
    this.prop2 = param2;
  }

  /**
   * Brief summary of method.
   *
   * @returns {string} Description of return value.
   */
  method() {
    return this.prop1;
  }
}
```

### TypeScript with JSDoc

```typescript
/**
 * Brief summary of function.
 *
 * @param param1 - Description of param1.
 * @param param2 - Description of param2.
 * @param options - Optional configuration.
 * @returns Description of return value.
 * @throws {Error} Description of when error is thrown.
 *
 * @example
 * ```typescript
 * const result = await functionName('hello', 42);
 * ```
 */
async function functionName(
  param1: string,
  param2: number,
  options?: { flag?: boolean; mode?: string }
): Promise<ResultType> {
  // implementation
}

/**
 * Brief summary of interface.
 */
interface ConfigOptions {
  /** Description of property1. */
  property1: string;

  /** Description of property2. */
  property2?: number;

  /**
   * Description of nested object.
   */
  nested?: {
    /** Description of nested property. */
    value: string;
  };
}
```

### Extracting JSDoc

```javascript
/**
 * Extract JSDoc comments from JavaScript file.
 *
 * @param {string} filePath - Path to JavaScript file.
 * @returns {Object} Mapping of function names to JSDoc.
 */
function extractJSDoc(filePath) {
  const fs = require('fs');
  const content = fs.readFileSync(filePath, 'utf8');

  // Regex to match JSDoc comments and following function/class
  const jsdocRegex = /\/\*\*[\s\S]*?\*\/\s*(function|class|const|let|var)\s+(\w+)/g;

  const docs = {};
  let match;

  while ((match = jsdocRegex.exec(content)) !== null) {
    const [fullMatch, type, name] = match;
    const docComment = fullMatch.match(/\/\*\*[\s\S]*?\*\//)[0];
    docs[name] = docComment;
  }

  return docs;
}
```

## Go

### Go Standard

```go
// Package packagename provides functionality for X.
//
// Longer description of the package and its purpose.
// Can span multiple lines.
package packagename

// FunctionName performs a specific task.
//
// More detailed description of what the function does.
// Can include implementation details.
//
// Parameters:
//   - param1: Description of param1
//   - param2: Description of param2
//
// Returns an error if the operation fails.
//
// Example:
//
//	result, err := FunctionName("hello", 42)
//	if err != nil {
//	    log.Fatal(err)
//	}
//	fmt.Println(result)
func FunctionName(param1 string, param2 int) (string, error) {
    // implementation
}

// StructName represents a specific entity.
//
// Longer description of the struct and its purpose.
type StructName struct {
    // Field1 is a description of field1.
    Field1 string

    // Field2 is a description of field2.
    Field2 int
}

// Method performs an operation on StructName.
//
// Returns an error if the operation fails.
func (s *StructName) Method() error {
    // implementation
}
```

### Extracting Go Docs

```bash
# Use go doc to extract documentation
go doc packagename
go doc packagename.FunctionName
go doc packagename.StructName

# Generate documentation
godoc -http=:6060
```

## Rust

### Rust Standard (Rustdoc)

```rust
//! Module-level documentation.
//!
//! This is a longer description of the module.
//! It can span multiple lines.

/// Brief summary of function.
///
/// More detailed description of what the function does.
/// Can include multiple paragraphs.
///
/// # Arguments
///
/// * `param1` - Description of param1
/// * `param2` - Description of param2
///
/// # Returns
///
/// Description of return value.
///
/// # Errors
///
/// Returns `Error` in the following cases:
/// * `Error::InvalidInput` - When input is invalid
/// * `Error::NetworkError` - When network request fails
///
/// # Examples
///
/// ```
/// let result = function_name("hello", 42)?;
/// println!("{:?}", result);
/// ```
///
/// # Panics
///
/// This function panics if param2 is negative.
///
/// # Safety
///
/// (For unsafe functions) Safety requirements.
pub fn function_name(param1: &str, param2: i32) -> Result<String, Error> {
    // implementation
}

/// Brief summary of struct.
///
/// Longer description of the struct.
///
/// # Examples
///
/// ```
/// let obj = StructName::new("value");
/// obj.method();
/// ```
pub struct StructName {
    /// Description of field1.
    pub field1: String,

    /// Description of field2.
    field2: i32,
}

impl StructName {
    /// Creates a new instance of StructName.
    ///
    /// # Arguments
    ///
    /// * `value` - Initial value for field1
    ///
    /// # Examples
    ///
    /// ```
    /// let obj = StructName::new("value");
    /// ```
    pub fn new(value: &str) -> Self {
        // implementation
    }
}
```

### Extracting Rust Docs

```bash
# Generate documentation
cargo doc --open

# Test documentation examples
cargo test --doc
```

## Java

### Javadoc

```java
/**
 * Brief summary of class.
 * <p>
 * More detailed description of the class. Can include
 * HTML formatting.
 * </p>
 *
 * @author Author Name
 * @version 1.0
 * @since 1.0
 */
public class ClassName {
    /**
     * Description of field.
     */
    private String field1;

    /**
     * Brief summary of constructor.
     *
     * @param param1 Description of param1.
     * @param param2 Description of param2.
     * @throws IllegalArgumentException if param1 is null.
     */
    public ClassName(String param1, int param2) {
        // implementation
    }

    /**
     * Brief summary of method.
     * <p>
     * More detailed description of what the method does.
     * </p>
     *
     * @param param1 Description of param1.
     * @param param2 Description of param2.
     * @return Description of return value.
     * @throws IOException if file cannot be read.
     * @throws IllegalArgumentException if param1 is invalid.
     * @see #otherMethod()
     * @since 1.2
     * @deprecated Use {@link #newMethod()} instead.
     */
    public String methodName(String param1, int param2)
            throws IOException, IllegalArgumentException {
        // implementation
    }
}
```

## Ruby

### RDoc/YARD

```ruby
# Brief summary of class.
#
# Longer description of the class and its purpose.
#
# @example Basic usage
#   obj = ClassName.new('value', 42)
#   obj.method
#
# @example Advanced usage
#   obj = ClassName.new('value', 42, flag: true)
#   result = obj.method
#
# @author Author Name
# @since 1.0.0
class ClassName
  # @return [String] Description of attr1
  attr_reader :attr1

  # Initialize a new instance.
  #
  # @param param1 [String] Description of param1
  # @param param2 [Integer] Description of param2
  # @param options [Hash] Optional configuration
  # @option options [Boolean] :flag Description of flag
  #
  # @raise [ArgumentError] if param1 is nil
  def initialize(param1, param2, options = {})
    @attr1 = param1
    @attr2 = param2
  end

  # Brief summary of method.
  #
  # Longer description of what the method does.
  #
  # @param param [String] Description of param
  # @return [String] Description of return value
  # @raise [StandardError] if operation fails
  #
  # @example
  #   obj.method('input')
  #   # => "output"
  #
  # @see #other_method
  # @since 1.2.0
  def method(param)
    # implementation
  end
end
```

## PHP

### PHPDoc

```php
/**
 * Brief summary of class.
 *
 * Longer description of the class.
 *
 * @package PackageName
 * @author Author Name
 * @version 1.0.0
 * @since 1.0.0
 */
class ClassName
{
    /**
     * @var string Description of property
     */
    private $property1;

    /**
     * Brief summary of constructor.
     *
     * @param string $param1 Description of param1.
     * @param int $param2 Description of param2.
     * @throws InvalidArgumentException if param1 is empty.
     */
    public function __construct($param1, $param2)
    {
        $this->property1 = $param1;
    }

    /**
     * Brief summary of method.
     *
     * Longer description of what the method does.
     *
     * @param string $param1 Description of param1.
     * @param array $options Optional configuration.
     * @return string Description of return value.
     * @throws RuntimeException if operation fails.
     *
     * @example
     * $result = $obj->methodName('input');
     *
     * @see otherMethod()
     * @since 1.2.0
     */
    public function methodName($param1, array $options = [])
    {
        // implementation
    }
}
```

## C/C++

### Doxygen

```cpp
/**
 * @brief Brief summary of function.
 *
 * More detailed description of what the function does.
 * Can span multiple lines.
 *
 * @param param1 Description of param1.
 * @param param2 Description of param2.
 * @return Description of return value.
 * @throws std::runtime_error Description of when error is thrown.
 *
 * @code
 * int result = function_name("hello", 42);
 * std::cout << result << std::endl;
 * @endcode
 *
 * @see other_function()
 * @since 1.2.0
 */
int function_name(const char* param1, int param2);

/**
 * @brief Brief summary of class.
 *
 * Longer description of the class.
 *
 * @tparam T Template parameter description.
 */
template<typename T>
class ClassName {
public:
    /**
     * @brief Constructor.
     *
     * @param param1 Description of param1.
     */
    ClassName(T param1);

    /**
     * @brief Method description.
     *
     * @return Description of return value.
     */
    T get_value() const;

private:
    T value; ///< Description of member variable.
};
```

## Documentation Tags Reference

Common tags across languages:

| Tag | Purpose | Example |
|-----|---------|---------|
| `@param` / `@arg` | Parameter description | `@param name User's name` |
| `@return` / `@returns` | Return value | `@returns User object` |
| `@throws` / `@raise` | Exception/error | `@throws ValueError` |
| `@example` | Usage example | `@example result = func()` |
| `@see` / `@link` | Related items | `@see other_function` |
| `@since` | Version added | `@since 1.2.0` |
| `@deprecated` | Deprecation notice | `@deprecated Use new_func` |
| `@author` | Author name | `@author John Doe` |
| `@version` | Version | `@version 1.0.0` |
| `@note` | Additional notes | `@note This is important` |
| `@warning` | Warning | `@warning Experimental` |
| `@todo` | TODO item | `@todo Add validation` |

## Best Practices

1. **Be consistent**: Use one style throughout the project
2. **Write complete descriptions**: Don't just repeat the name
3. **Document all parameters**: Include types and descriptions
4. **Provide examples**: Show common usage patterns
5. **Document exceptions**: List all possible errors
6. **Keep it updated**: Update docs when code changes
7. **Use proper formatting**: Follow language conventions
8. **Link related items**: Cross-reference related functions
9. **Include version info**: Use `@since` for new features
10. **Mark deprecations**: Use `@deprecated` with alternatives

## Extraction Tools

- **Python**: `ast`, `inspect`, `pydoc`
- **JavaScript**: JSDoc parsers, TypeDoc
- **Go**: `go doc`, `godoc`
- **Rust**: `rustdoc`
- **Java**: `javadoc`
- **Ruby**: `rdoc`, `yard`
- **PHP**: phpDocumentor
- **C/C++**: Doxygen
