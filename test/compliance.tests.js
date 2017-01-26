var complianceTests = require('block-sequence-compliance-tests')
var BlockSequence = require('../index')

BlockSequence(function(err, blockSequence) {
    if (err) throw err
    complianceTests(blockSequence).onFinish(blockSequence.close)
})
