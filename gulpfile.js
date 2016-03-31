var gulp = require('gulp');

require('./task/help-task.js');
require('./task/build-task.js');
require('./task/watch-task.js');
require('./task/init-task.js');


module.exports.gulp = gulp;