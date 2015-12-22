var gulp = require('gulp');
var Constant = require('../Constant.js');
var FileUtil = require('../util/FileUtil.js');
var makeToES5 = require('./toES5.js');
var readFiles = FileUtil.readFiles;
var rootFolder = Constant.rootFolder;
var browserifyPath = Constant.browserifyPath;
var jsOutputPath = Constant.jsOutputPath;
var toES5 = makeToES5(browserifyPath, jsOutputPath);
var watchPath = Constant.watchPath[rootFolder].path;

gulp.task('to-es5', function(){
	readFiles(watchPath, toBrowserify);
});

var rfile = /(.+)\./;
function toBrowserify(results){
	//遍历browserifyPath下的所有文件去进行browserify
	results.forEach(function(item){
		toES5(watchPath+item);
	});
}

