// Require class for int64 storing
var Int64 = require(process.env.LIB_COV ? '../../../lib-cov/int64' : '../../../lib/int64.js');

// Construct int64 value
var value = new Int64(0xFFFFFFFF, 0xFFFFFFFF);

// Export
module.exports = value;
