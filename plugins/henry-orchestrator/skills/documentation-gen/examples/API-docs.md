# API Documentation

Complete API reference for the DataProcessor library.

## Table of Contents

- [DataProcessor Class](#dataprocessor-class)
- [Plugin System](#plugin-system)
- [Validator Class](#validator-class)
- [Cache Classes](#cache-classes)
- [Exceptions](#exceptions)
- [Type Definitions](#type-definitions)

## DataProcessor Class

Main class for data processing operations.

### Constructor

#### `DataProcessor(config?)`

Creates a new DataProcessor instance.

**Parameters:**

- `config` (ProcessorConfig, optional): Configuration options
  - `workers` (number, optional): Number of parallel workers. Default: 1
  - `cache_size` (number, optional): Cache size in MB. Default: 100
  - `plugins` (Array<PluginConfig>, optional): Plugin configurations
  - `encoding` (string, optional): Default file encoding. Default: 'utf-8'

**Example:**

```python
from dataprocessor import DataProcessor

# Basic initialization
processor = DataProcessor()

# With configuration
processor = DataProcessor({
    'workers': 4,
    'cache_size': 500,
    'encoding': 'utf-8'
})
```

**Since:** v1.0.0

---

### Methods

#### `load(path, **options)`

Loads data from a file or URL.

**Parameters:**

- `path` (str): File path or URL to load from
- `**options` (dict, optional): Loading options
  - `delimiter` (str): CSV delimiter. Default: ','
  - `encoding` (str): File encoding. Default: 'utf-8'
  - `parallel` (bool): Use parallel loading. Default: False
  - `chunksize` (int): Chunk size for large files
  - `headers` (dict): HTTP headers for URL loading

**Returns:** `DataFrame` - Loaded data as DataFrame

**Raises:**

- `FileNotFoundError` - When file does not exist
- `InvalidFormatError` - When file format is not supported
- `NetworkError` - When URL cannot be fetched

**Example:**

```python
# Load CSV file
data = processor.load('data.csv')

# Load with custom delimiter
data = processor.load('data.csv', delimiter=';')

# Load from URL
data = processor.load('https://example.com/data.json')

# Load large file in parallel
data = processor.load('large.csv', parallel=True, chunksize=10000)
```

**Supported Formats:**

- CSV (.csv)
- JSON (.json)
- Parquet (.parquet) - requires `dataprocessor[parquet]`
- Excel (.xlsx) - requires `dataprocessor[excel]`

**Since:** v1.0.0

---

#### `clean(data, **options)`

Cleans and validates data.

**Parameters:**

- `data` (DataFrame): Data to clean
- `**options` (dict, optional): Cleaning options
  - `remove_nulls` (bool): Remove rows with null values. Default: False
  - `remove_duplicates` (bool): Remove duplicate rows. Default: False
  - `fill_nulls` (any): Value to fill nulls with
  - `custom_rules` (dict): Custom validation rules per column

**Returns:** `DataFrame` - Cleaned data

**Raises:**

- `ValidationError` - When data fails validation

**Example:**

```python
# Remove nulls and duplicates
cleaned = processor.clean(data, remove_nulls=True, remove_duplicates=True)

# Fill nulls with default value
cleaned = processor.clean(data, fill_nulls=0)

# Custom validation rules
cleaned = processor.clean(data, custom_rules={
    'age': lambda x: x >= 0 and x <= 150,
    'email': lambda x: '@' in x and '.' in x
})
```

**Since:** v1.0.0

---

#### `transform(data, operations)`

Applies transformations to data.

**Parameters:**

- `data` (DataFrame): Data to transform
- `operations` (list): List of operations to apply
  - Each operation can be:
    - `str`: Built-in operation name ('normalize', 'dedupe', 'sort')
    - `dict`: Operation with parameters
      - `operation` (str): Operation name
      - Additional parameters specific to operation

**Returns:** `DataFrame` - Transformed data

**Raises:**

- `InvalidOperationError` - When operation is not recognized
- `TransformError` - When transformation fails

**Example:**

```python
# Built-in operations
result = processor.transform(data, operations=['normalize', 'dedupe'])

# Operations with parameters
result = processor.transform(data, operations=[
    {'operation': 'filter', 'column': 'age', 'min': 18, 'max': 65},
    {'operation': 'sort', 'column': 'name', 'ascending': True},
    'normalize'
])
```

**Built-in Operations:**

- `normalize`: Normalize numeric columns to 0-1 range
- `dedupe`: Remove duplicate rows
- `sort`: Sort by column
- `filter`: Filter rows by conditions
- `aggregate`: Aggregate data by groups

**Since:** v1.0.0

---

#### `save(data, path, **options)`

Saves data to a file.

**Parameters:**

- `data` (DataFrame): Data to save
- `path` (str): Output file path
- `**options` (dict, optional): Save options
  - `format` (str): Output format ('csv', 'json', 'parquet')
  - `encoding` (str): File encoding. Default: 'utf-8'
  - `compression` (str): Compression method ('gzip', 'bz2', 'zip')
  - `index` (bool): Include index in output. Default: False

**Returns:** `None`

**Raises:**

- `PermissionError` - When file cannot be written
- `InvalidFormatError` - When format is not supported

**Example:**

```python
# Save as CSV
processor.save(data, 'output.csv')

# Save as JSON with compression
processor.save(data, 'output.json.gz', compression='gzip')

# Save as Parquet
processor.save(data, 'output.parquet', format='parquet')
```

**Since:** v1.0.0

---

#### `register_plugin(name, plugin)`

Registers a custom plugin.

**Parameters:**

- `name` (str): Plugin name
- `plugin` (Plugin): Plugin instance

**Returns:** `None`

**Raises:**

- `PluginError` - When plugin is invalid

**Example:**

```python
from dataprocessor import Plugin

class CustomPlugin(Plugin):
    def transform(self, data, **options):
        # Custom transformation logic
        return data

processor.register_plugin('custom', CustomPlugin())
```

**See Also:**

- [Plugin System](#plugin-system)

**Since:** v1.2.0

---

### Class Methods

#### `DataProcessor.from_config(config_path)`

Creates a DataProcessor instance from a configuration file.

**Parameters:**

- `config_path` (str): Path to configuration file (YAML or JSON)

**Returns:** `DataProcessor` - Configured instance

**Raises:**

- `FileNotFoundError` - When config file does not exist
- `ConfigError` - When config is invalid

**Example:**

```python
processor = DataProcessor.from_config('config.yaml')
```

**Since:** v1.1.0

---

## Plugin System

Extensible plugin system for custom transformations.

### Plugin Base Class

#### `Plugin()`

Base class for creating custom plugins.

**Methods to Override:**

##### `transform(data, **options)`

Transform data with custom logic.

**Parameters:**

- `data` (DataFrame): Input data
- `**options`: Plugin-specific options

**Returns:** `DataFrame` - Transformed data

**Example:**

```python
from dataprocessor import Plugin

class UpperCasePlugin(Plugin):
    """Convert column values to uppercase."""

    def transform(self, data, column):
        """
        Convert specified column to uppercase.

        Args:
            data: Input DataFrame
            column: Column name to transform

        Returns:
            DataFrame with uppercase values
        """
        data[column] = data[column].str.upper()
        return data

# Register and use
processor.register_plugin('uppercase', UpperCasePlugin())
result = processor.transform(data, operations=[
    {'operation': 'uppercase', 'column': 'name'}
])
```

**Since:** v1.2.0

---

## Validator Class

Data validation utilities.

### Constructor

#### `Validator(rules)`

Creates a validator with custom rules.

**Parameters:**

- `rules` (dict): Validation rules per column
  - Key: Column name
  - Value: Validation function or Rule object

**Example:**

```python
from dataprocessor import Validator

validator = Validator({
    'age': lambda x: x >= 0,
    'email': lambda x: '@' in x
})
```

**Since:** v1.3.0

---

### Methods

#### `validate(data)`

Validates data against rules.

**Parameters:**

- `data` (DataFrame): Data to validate

**Returns:** `ValidationResult` - Validation result with errors

**Example:**

```python
result = validator.validate(data)
if result.is_valid:
    print("Data is valid")
else:
    print(f"Found {len(result.errors)} errors")
    for error in result.errors:
        print(f"Row {error.row}: {error.message}")
```

**Since:** v1.3.0

---

## Cache Classes

Caching implementations for performance optimization.

### MemoryCache

In-memory LRU cache.

#### `MemoryCache(max_size=100, ttl=None)`

**Parameters:**

- `max_size` (int): Maximum cache size in MB. Default: 100
- `ttl` (int, optional): Time-to-live in seconds

**Example:**

```python
from dataprocessor import MemoryCache

cache = MemoryCache(max_size=500, ttl=3600)
```

**Since:** v1.4.0

---

### FileCache

Disk-based cache for persistence.

#### `FileCache(cache_dir, max_size=1000)`

**Parameters:**

- `cache_dir` (str): Directory for cache files
- `max_size` (int): Maximum cache size in MB. Default: 1000

**Example:**

```python
from dataprocessor import FileCache

cache = FileCache('./cache', max_size=2000)
```

**Since:** v1.4.0

---

## Exceptions

Custom exception classes.

### ProcessorError

Base exception for all processor errors.

```python
class ProcessorError(Exception):
    """Base exception for DataProcessor."""
```

### FileNotFoundError

Raised when file cannot be found.

```python
try:
    data = processor.load('missing.csv')
except FileNotFoundError as e:
    print(f"File not found: {e}")
```

### InvalidFormatError

Raised when file format is not supported.

```python
try:
    data = processor.load('file.xyz')
except InvalidFormatError as e:
    print(f"Unsupported format: {e}")
```

### ValidationError

Raised when data validation fails.

```python
try:
    cleaned = processor.clean(data, custom_rules={'age': lambda x: x > 0})
except ValidationError as e:
    print(f"Validation failed: {e}")
```

### TransformError

Raised when transformation fails.

```python
try:
    result = processor.transform(data, operations=['invalid_op'])
except TransformError as e:
    print(f"Transform failed: {e}")
```

---

## Type Definitions

### ProcessorConfig

Configuration for DataProcessor.

```python
class ProcessorConfig(TypedDict, total=False):
    workers: int
    cache_size: int
    plugins: List[PluginConfig]
    encoding: str
```

### PluginConfig

Configuration for a plugin.

```python
class PluginConfig(TypedDict):
    name: str
    path: str
    options: dict
```

### ValidationResult

Result of validation operation.

```python
class ValidationResult:
    is_valid: bool
    errors: List[ValidationError]
    warnings: List[str]
```

---

## Constants

### DEFAULT_ENCODING

Default file encoding.

**Type:** `str`

**Value:** `'utf-8'`

### SUPPORTED_FORMATS

Supported file formats.

**Type:** `List[str]`

**Value:** `['csv', 'json', 'parquet', 'excel']`

### DEFAULT_WORKERS

Default number of workers.

**Type:** `int`

**Value:** `1`

---

## See Also

- [User Guide](guide.md)
- [Examples](../examples/)
- [Plugin Development](plugin-dev.md)
