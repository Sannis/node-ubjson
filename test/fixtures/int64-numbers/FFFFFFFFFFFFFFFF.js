// Require class for int64 storing
var Long = require('long');

// Construct int64 value
var value = new Long(0xFFFFFFFF, 0xFFFFFFFF);

// Export
module.exports = value;
