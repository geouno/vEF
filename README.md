# vEF

vEF is a browser-native framework for unifying data analysis and slides, with
interactivity and portability in mind.

## Vision

The goal is to make analytical presentations behave like software:

- You code your data processing to take structured input and return structured
  output.
- A runner harness executes them without caring about implementation language.
- A presentation layer turns results into interactive decks.

## Current Structure

```text
packages/
  vef/                  reusable presentation framework
  harness/              planned runtime layer
  create-vEF/           planned scaffolding tool

examples/
  efficient-frontier/   first example deck
```

## Future Features

- canonical JSON schemas for model input and output
- polyglot algorithm implementations behind a stable contract
- a harness that spawns processes and returns normalized results
- parity and validation tooling across implementations
- scaffolding for new decks, examples, and model integrations
- print-first presentation workflows with vector charts and reliable PDF export

## Run Efficient Frontier example

```bash
bun install
cd examples/efficient-frontier
bun run dev
```

Build:

```bash
cd examples/efficient-frontier
bun run build
```
