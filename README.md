# condorcet

[![Build](https://travis-ci.org/turizsolt/condorcet.svg?branch=master)](https://travis-ci.org/turizsolt/condorcet)
[![codecov.io](https://codecov.io/github/turizsolt/condorcet/coverage.svg?branch=master)](https://codecov.io/github/turizsolt/condorcet?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Initial preparations

```bash
yarn
```

And copy this file to your project root:

```json
// /config.json
{
    "adminKey": "<YOUR ARBITRARY ADMIN PASSWORD>",
    "testServerAddress": "http://localhost",
    "testServerPort": "<PORT>"
}
```

## Testing and coverage report

```bash
yarn test
```

## Running server in developer mode

```bash
yarn start:dev
```

## Building

```bash
yarn build
```

