# DataProcessor

[![Build Status](https://img.shields.io/github/workflow/status/user/dataprocessor/CI)](https://github.com/user/dataprocessor/actions)
[![Coverage](https://img.shields.io/codecov/c/github/user/dataprocessor)](https://codecov.io/gh/user/dataprocessor)
[![PyPI version](https://img.shields.io/pypi/v/dataprocessor)](https://pypi.org/project/dataprocessor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Python library for efficient data processing and transformation with support for multiple data formats.

## Features

- Process CSV, JSON, and Parquet files with a unified API
- Built-in data validation and cleaning
- Parallel processing for large datasets
- Extensible plugin system for custom transformations
- Type-safe operations with Python 3.9+ type hints
- Zero-copy operations where possible for performance

## Installation

### Prerequisites

- Python 3.9 or higher
- pip 21.0 or higher

### Install from PyPI

```bash
pip install dataprocessor
```

### Install from source

```bash
git clone https://github.com/user/dataprocessor.git
cd dataprocessor
pip install -e .
```

### Optional dependencies

For Parquet support:
```bash
pip install dataprocessor[parquet]
```

For all features:
```bash
pip install dataprocessor[all]
```

## Quick Start

```python
from dataprocessor import DataProcessor

# Initialize processor
processor = DataProcessor()

# Load and process data
data = processor.load('data.csv')
cleaned = processor.clean(data, remove_nulls=True)
result = processor.transform(cleaned, operations=['normalize', 'dedupe'])

# Save result
processor.save(result, 'output.json')
```

## Usage

### Loading Data

```python
from dataprocessor import DataProcessor

processor = DataProcessor()

# Load CSV
data = processor.load('data.csv')

# Load with options
data = processor.load('data.csv', delimiter=';', encoding='utf-8')

# Load from URL
data = processor.load('https://example.com/data.json')
```

### Data Cleaning

```python
# Remove null values
cleaned = processor.clean(data, remove_nulls=True)

# Remove duplicates
cleaned = processor.clean(data, remove_duplicates=True)

# Custom cleaning
cleaned = processor.clean(data, custom_rules={
    'age': lambda x: x > 0 and x < 150,
    'email': lambda x: '@' in x
})
```

### Transformations

```python
# Apply transformations
result = processor.transform(data, operations=[
    'normalize',
    'dedupe',
    {'operation': 'filter', 'column': 'age', 'min': 18}
])

# Chain operations
result = (processor
    .load('data.csv')
    .clean(remove_nulls=True)
    .transform(operations=['normalize'])
    .save('output.json'))
```

### Parallel Processing

```python
# Process large files in parallel
processor = DataProcessor(workers=4)
result = processor.load('large_file.csv', parallel=True)
```

### Custom Plugins

```python
from dataprocessor import Plugin

class UpperCasePlugin(Plugin):
    def transform(self, data, column):
        data[column] = data[column].str.upper()
        return data

# Register and use plugin
processor.register_plugin('uppercase', UpperCasePlugin())
result = processor.transform(data, operations=[
    {'operation': 'uppercase', 'column': 'name'}
])
```

## Configuration

Configure DataProcessor with a config file:

```python
processor = DataProcessor.from_config('config.yaml')
```

Example `config.yaml`:

```yaml
workers: 4
cache_size: 1000
plugins:
  - name: custom_plugin
    path: ./plugins/custom.py
defaults:
  encoding: utf-8
  delimiter: ","
```

## API Reference

See [API Documentation](https://dataprocessor.readthedocs.io/en/latest/api.html) for complete reference.

### Core Classes

- **`DataProcessor`** - Main processing class
- **`Plugin`** - Base class for custom plugins
- **`Validator`** - Data validation utilities

### Key Methods

- **`load(path, **options)`** - Load data from file or URL
- **`clean(data, **options)`** - Clean and validate data
- **`transform(data, operations)`** - Apply transformations
- **`save(data, path, **options)`** - Save processed data

## Performance

Benchmarks on 1GB CSV file (10M rows):

| Operation | Time | Memory |
|-----------|------|--------|
| Load | 2.3s | 450MB |
| Clean | 1.1s | 500MB |
| Transform | 3.5s | 600MB |
| Save | 1.8s | 400MB |

With parallel processing (4 workers):
- 2.5x faster for I/O operations
- 3x faster for transformations

## Examples

More examples in the [examples/](examples/) directory:

- [Basic usage](examples/basic.py)
- [Advanced transformations](examples/advanced.py)
- [Custom plugins](examples/custom_plugin.py)
- [Working with large files](examples/large_files.py)

## Documentation

- [Full Documentation](https://dataprocessor.readthedocs.io/)
- [API Reference](https://dataprocessor.readthedocs.io/en/latest/api.html)
- [User Guide](https://dataprocessor.readthedocs.io/en/latest/guide.html)
- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Development

### Setup development environment

```bash
git clone https://github.com/user/dataprocessor.git
cd dataprocessor
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e ".[dev]"
```

### Run tests

```bash
pytest
pytest --cov=dataprocessor  # With coverage
```

### Code style

```bash
black .
flake8
mypy dataprocessor
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:

- Code of conduct
- Development setup
- Running tests
- Submitting pull requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [pandas](https://pandas.pydata.org/) for data manipulation
- Inspired by [dask](https://dask.org/) for parallel processing
- Uses [pyarrow](https://arrow.apache.org/docs/python/) for Parquet support

## Support

- **Issues**: [GitHub Issues](https://github.com/user/dataprocessor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/user/dataprocessor/discussions)
- **Email**: support@dataprocessor.io

## Citation

If you use DataProcessor in your research, please cite:

```bibtex
@software{dataprocessor,
  author = {Author Name},
  title = {DataProcessor: Efficient Data Processing for Python},
  year = {2025},
  url = {https://github.com/user/dataprocessor}
}
```
