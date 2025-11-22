# Multi-Agent Review Example

This example demonstrates synthesizing outputs from security, performance, and QA reviews into a unified action plan.

## Scenario

An e-commerce checkout feature needs review before launch. Three agents performed parallel reviews:
- **Security Engineer**: Identified vulnerabilities
- **Performance Engineer**: Analyzed performance metrics
- **QA Tester**: Evaluated test coverage

## Agent Outputs

See individual agent reports:
- [security-findings.md](security-findings.md) - Security vulnerabilities and recommendations
- [performance-findings.md](performance-findings.md) - Performance metrics and optimization opportunities
- [qa-findings.md](qa-findings.md) - Test coverage analysis and gaps

## Synthesis Process

### 1. Collect Findings

Run the collection script to aggregate agent outputs:

```bash
./collect-findings.sh
```

This generates `all-findings.json` with structured data from all agents.

### 2. Analyze and Prioritize

Use the analysis script to identify patterns:

```bash
./analyze-findings.sh
```

Output:
- Cross-cutting themes (e.g., authentication issues)
- Severity distribution
- Duplicate findings

### 3. Generate Synthesis Report

Run the synthesis script:

```bash
./synthesize-report.sh
```

This creates `synthesis-report.md` using the template.

## Synthesized Output

The final synthesis report includes:

- **Executive Summary**: 5 critical issues requiring immediate attention
- **Cross-Cutting Themes**: Authentication (security + QA), API performance
- **Prioritized Action Plan**: Phased approach with owners and deadlines
- **Success Metrics**: 0 critical vulnerabilities, LCP < 2.5s, coverage ≥ 80%

See [synthesis-report.md](synthesis-report.md) for the complete synthesized output.

## Key Learnings

1. **Deduplication matters**: Auth issues identified by both security and QA
2. **Prioritize by impact**: Critical security issues block launch
3. **Integrate recommendations**: Auth test suite addresses both security and QA gaps
4. **Define success clearly**: Measurable criteria prevent ambiguity

## Scripts Reference

- `collect-findings.sh` - Aggregates agent outputs into structured JSON
- `analyze-findings.sh` - Identifies patterns and duplicates
- `synthesize-report.sh` - Generates final synthesis report
- `config.json` - Configuration for synthesis process

## Usage

To run this example:

```bash
# 1. Review individual agent findings
cat security-findings.md
cat performance-findings.md
cat qa-findings.md

# 2. Run synthesis pipeline
./collect-findings.sh
./analyze-findings.sh
./synthesize-report.sh

# 3. Review synthesized output
cat synthesis-report.md
```

## Customization

Adapt this example for your project:

1. Replace agent findings with your actual outputs
2. Update `config.json` with your severity levels and priorities
3. Modify `synthesize-report.sh` template to match your format
4. Add additional agents (e.g., accessibility, SEO) to the pipeline

## Related Resources

- [../../references/synthesis-patterns.md](../../references/synthesis-patterns.md) - Detailed synthesis patterns
- [../../references/synthesis-templates.md](../../references/synthesis-templates.md) - Report templates
- [../../references/best-practices.md](../../references/best-practices.md) - Synthesis best practices
