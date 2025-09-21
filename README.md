# Pragmatic Time Tracker

This Single Page App (SPA) acts as a template of a pragmatic frontend architecture with sane software
design patterns.

It is specifically for SPA's, which for most frontend applications are a good fit. Backend rendering
for performance optimization is en vogue but mainly needed for SEO purposes which many applications
don't need. The example application is a time tracker, a familiar domain while also complex enough to
act as a real world example.

It is also a testbed for my to keep my dependecies as up-to-date as possible while still maintaining
compatibility with each other. Something that is not standard in the fast paced front-end word.

## Requirements

1. [Node.js](https://nodejs.org/).
2. [Pnpm](https://pnpm.io/).

## Installation

```shell
pnpm install
```

## Development

```shell
pnpm dev        # run a dev server
```

## Test

```shell
pnpm test                # run unit tests
pnpm test file/path.ts   # run file unit tests
pnpm test:cov            # with coverage
pnpm test:ui             # with an ui
```

## Build

```shell
pnpm build      # build for production
pnpm preview    # locally preview production build
```

## Formatting, linting and type checking

```shell
pnpm format file/path.ts # format file
pnpm format:all          # format all files
pnpm lint file/path.ts   # lint file and fix when possible
pnpm lint:all            # lint all files and fix when possible
pnpm fix                 # format and lint all
pnpm check               # check types, e.g.: tsc --noEmit
```
