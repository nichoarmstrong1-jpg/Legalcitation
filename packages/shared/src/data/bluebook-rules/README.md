# Bluebook Rule Data

Each .md file contains the FULL text of the relevant Bluebook rules, organized as:
1. Bluepages section (practitioner rules, B-prefixed)
2. White Pages section (full academic rules, R-prefixed)

The system uses these files in two ways:
1. As LLM context — the raw text is injected into Claude's system prompt per citation type
2. As rule engine source — structured patterns inform TypeScript validation rules

## Format
- H1: Type name and rule numbers
- H2: "Bluepages" and "White Pages" sections
- H3: Individual rule numbers
- Code blocks: citation examples
- Blockquotes: exceptions and special notes
