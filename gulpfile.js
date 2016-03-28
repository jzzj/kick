var gulp = require('gulp');

require('./task/build-task.js');
require('./task/watch-task.js');
require('./task/to-es5-task.js');


module.exports.gulp = gulp;