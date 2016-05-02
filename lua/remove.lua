redis.call('SREM', KEYS[1], KEYS[2])
redis.call('DEL', KEYS[2])
