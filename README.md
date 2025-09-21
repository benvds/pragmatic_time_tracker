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
pnpm i
```

## Development

```shell
pnpm dev        # run a dev server
```

## Test

```shell
pnpm test       # run unit tests
pnpm test:cov   # with coverage
pnpm test:ui    # with an ui
```

## Build

```shell
pnpm build      # build for production
pnpm preview    # locally preview production build
```

## Formatting, linting and typechecking

```shell
pnpm format:all # format all code
pnpm lint       # lint the code
pnpm lint:fix   # lint the code and fix whenever possible
pnpm fix        # format then lint and fix whenever possible
pnpm check      # check types, e.g.: tsc --noEmit
```
