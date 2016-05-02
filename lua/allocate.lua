redis.call('HINCRBY', KEYS[1], 'value', ARGV[1])
return redis.call('HGETALL', KEYS[1])
