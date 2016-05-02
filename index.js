var debug = require('debug')('block-sequence:redis')
var redis = require('redis')
var _ = require('lodash').runInContext()
var safeParse = require('safe-json-parse/callback')
var async = require('async')
var fs = require('fs')
var path = require('path')

module.exports = function init(config, cb) {

    if (arguments.length === 1) return init({}, arguments[0])

    var scripts = {}
    var store = redis.createClient(config);

    function ensure(options, cb) {

        if (options.name === null || options.name === undefined) return cb(new Error('name is required'))

        var name = options.name.toLowerCase()
        var value = options.value || 0
        var metadata = options.metadata || {}

        serialize({ name: name, value: value, metadata: metadata }, function(err, sequence) {
            if (err) return cb(err)
            run('ensure',
                ['block-sequence:index', 'block-sequence:sequence:' + name],
                _.chain(sequence).toPairs().flatten().value(),
                function(err, results) {
                    if (err) return cb(err)
                    deserialize(results, cb)
                })
        })
    }

    function allocate(options, cb) {

        var size = options.size || 1

        ensure(options, function(err, sequence) {
            if (err) return cb(err)
            run('allocate', ['block-sequence:sequence:' + sequence.name], [ size ], function(err, results) {
                if (err) return cb(err)
                deserialize(results, function(err, sequence) {
                    if (err) return cb(err)
                    cb(null, _.chain({ next: sequence.value - size + 1, remaining: size })
                              .defaultsDeep(sequence)
                              .omit(['value'])
                              .value()
                    )
                })
            })
        })
    }

    function run(script, keys, params, cb) {
        var args = [].concat(scripts[script], keys.length, keys, params)
        args.push(cb)
        debug('Running script: %s with sha: %s and arguments: %s', script, args[0], args.slice(1).join(', '))
        store.evalsha.apply(store, args)
    }

    function remove(options, cb) {
        debug('Removing %s', options.name)
        if (options.name === null || options.name === undefined) return cb(new Error('name is required'))
        run('remove', ['block-sequence:index', 'block-sequence:sequence:' + options.name.toLowerCase()], [], cb)
    }

    function loadScripts(cb) {
        fs.readdir(path.join(__dirname, 'lua'), function(err, files) {
            if (err) return cb(err)
            async.each(files, function(file, cb) {
                debug('Loading %s', file)
                fs.readFile(path.join(__dirname, 'lua', file), { encoding: 'utf-8' }, function(err, script) {
                    if (err) return cb(err)
                    store.script('load', script, function(err, sha) {
                        if (err) return cb(err)
                        scripts[path.basename(file, '.lua')] = sha
                        cb()
                    })
                })
            }, cb)
        }, cb)
    }

    function serialize(obj, cb) {
        cb(null, { name: obj.name, value: obj.value, metadata: JSON.stringify(obj.metadata) })
    }

    function deserialize(list, cb) {
        var obj = {}
        for (var i = 0; i < list.length; i += 2) {
            obj[list[i]] = list[i+1]
        }
        safeParse(obj.metadata, function(err, metadata) {
            cb(err, {
                name: obj.name,
                value: parseInt(obj.value, 10),
                metadata: metadata
            })
        })
    }

    function close(cb) {
        store.quit(cb)
    }

    loadScripts(function(err) {
        cb(err, {
            remove: remove,
            allocate: allocate,
            ensure: ensure,
            close: close
        })
    })
}

