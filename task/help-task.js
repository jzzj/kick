var gulp = require('gulp');

gulp.task('help', help);
gulp.task('--help', help);
gulp.task('-h', help);
gulp.task('h', help);

var fs = require('fs');
var iconv = require('iconv-lite');

var helpDoc = fs.readFileSync('task/help.md');
var doc = iconv.decode(helpDoc, 'UTF-8');

function help(){
	console.log(doc);
}