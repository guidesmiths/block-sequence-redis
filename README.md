# block-sequence-redis
A redis implementation of [block-sequence](https://www.npmjs.com/package/block-sequence).

[![NPM version](https://img.shields.io/npm/v/block-sequence-redis.svg?style=flat-square)](https://www.npmjs.com/package/block-sequence-redis)
[![NPM downloads](https://img.shields.io/npm/dm/block-sequence-redis.svg?style=flat-square)](https://www.npmjs.com/package/block-sequence-redis)
[![Build Status](https://img.shields.io/travis/guidesmiths/block-sequence-redis/master.svg)](https://travis-ci.org/guidesmiths/block-sequence-redis)
[![Code Climate](https://codeclimate.com/github/guidesmiths/block-sequence-redis/badges/gpa.svg)](https://codeclimate.com/github/guidesmiths/block-sequence-redis)
[![Test Coverage](https://codeclimate.com/github/guidesmiths/block-sequence-redis/badges/coverage.svg)](https://codeclimate.com/github/guidesmiths/block-sequence-redis/coverage)
[![Code Style](https://img.shields.io/badge/code%20style-imperative-brightgreen.svg)](https://github.com/guidesmiths/eslint-config-imperative)
[![Dependency Status](https://david-dm.org/guidesmiths/block-sequence-redis.svg)](https://david-dm.org/guidesmiths/block-sequence-redis)
[![devDependencies Status](https://david-dm.org/guidesmiths/block-sequence-redis/dev-status.svg)](https://david-dm.org/guidesmiths/block-sequence-redis?type=dev)

## Usage
```js
const BlockArray = require('block-sequence').BlockArray
const init = require('block-sequence-redis')

// Initialise the redis Block Sequence Driver
init({ host: '127.0.0.1' }, (err, driver) => {
    if (err) throw err

    // Ensure the sequence exists
    driver.ensure({ name: 'my-sequence' }, (err, sequence) => {
        if (err) throw err

        // Create a block array containing 1000 ids per block (defaults to 2 blocks)
        const idGenerator = new BlockArray({ block: { sequence: sequence, driver: driver, size: 1000 } })

        // Grab the next id
        idGenerator.next((err, id) => {
            if (err) throw err
            console.log(id)
        })
    })
})
```
See https://github.com/NodeRedis/node_redis for all connection parameters


