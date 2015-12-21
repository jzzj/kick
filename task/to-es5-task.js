var gulp = require('gulp');
var Constant = require('../Constant.js');
var FileUtil = require('../util/FileUtil.js');
var makeToES5 = require('./toES5.js');
var readFiles = FileUtil.readFiles;
var rootPath = Constant.rootPath;
var browserifyPath = Constant.browserifyPath;
var jsOutputPath = Constant.jsOutputPath;
var toES5 = makeToES5(browserifyPath, jsOutputPath);

gulp.task('to-es5', function(){
	readFiles(rootPath+browserifyPath, toBrowserify);
});

var rfile = /(.+)\./;
function toBrowserify(results){
	//遍历browserifyPath下的所有文件去进行browserify
	for(var i=0, file, len=results.length; i<len; i++){
		file = results[i];
		
		toES5(rootPath+browserifyPath+file);
	}
}

