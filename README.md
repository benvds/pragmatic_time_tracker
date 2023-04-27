# Pragmatic Time Tracker

This is a combination of a Single Page App (SPA) starter template and an example of a pragmatic
frontend architecture with sane software design patterns. It deviates in some places from popular
practices seen as "best practice".

It is specifically for SPA's, which is something different than the Next.js-es of the world. It uses
React, Typescript and Vite(est). The example application is a time tracker, a concept complex enough
to act as a real world example while also being familiar.

It is also a testbed for my to keep my dependecies as up-to-date as possible while still maintaining
compatibility with each other. Something that is not standard in the fast paced front-end word.

> This is my starter template. There are many like it, but this one is mine.
> My starter template is my best friend. It is my life. I must master it as I must master my life.

## Requirements

1. [Node.js](https://nodejs.org/). Use a version manager like [asdf](https://asdf-vm.com/) or [rtx](https://github.com/jdxcode/rtx)
2. [Pnpm](https://pnpm.io/). See [why](https://pnpm.io/motivation).

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
pnpm lint       # format then lint
pnpm lint:format
pnpm lint:fix   # lint code, fix when possible
pnpm typecheck  # tsc --noEmit
```
