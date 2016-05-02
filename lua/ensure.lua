if redis.call('SISMEMBER', KEYS[1], KEYS[2]) == 0 then
    redis.call('SADD', KEYS[1], KEYS[2])
    redis.call('HMSET', KEYS[2], unpack(ARGV))
end
return redis.call('HGETALL', KEYS[2])
