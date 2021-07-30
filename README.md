# orion

[![Build](https://travis-ci.org/turizsolt/orion.svg?branch=master)](https://travis-ci.org/turizsolt/orion)
[![codecov.io](https://codecov.io/github/turizsolt/orion/coverage.svg?branch=master)](https://codecov.io/github/turizsolt/orion?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Initial preparations

```bash
yarn
```

You should create a config.json file in the root directory. If ssl set to false, key and cert are not important. If set to true, the files should also exists with the corresponding credentials.

```json
{
    "key": "config/server.key",
    "cert": "config/server.cert",
    "ssl": false
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
