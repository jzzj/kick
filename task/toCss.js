var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

var Constant = require('../Constant.js');
var cssSourceSuffix = Constant.cssSourceSuffix;

var rfolderFile = /(.+\/)(.+)$/;

function toCss(file){
	var ret = file.match(rfolderFile);
	var outputFile = ret[2].replace(new RegExp('\.'+cssSourceSuffix+'$'), '.css');
	var outputPath = ret[1];
	
	gulp.src(file)
		.pipe(sourcemaps.init({loadMaps: true}))
		.on('error', function(err){
			console.log(err.message);
		})
	    .pipe(sass().on('error', sass.logError))
	    .pipe(rename(outputFile))
		.pipe(sourcemaps.write('./'))
	    .pipe(gulp.dest(outputPath));
}


module.exports = toCss;