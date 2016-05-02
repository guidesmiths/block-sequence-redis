# block-sequence-redis
A redis implementation of block-sequence

## Usage
```js
var bsr = require('block-sequence-redis')
var config = { host: localhost, port: 6379 }
bsr(config, function(err, driver) {
    if (err) throw err
})
```
See https://github.com/NodeRedis/node_redis for all connection parameters


