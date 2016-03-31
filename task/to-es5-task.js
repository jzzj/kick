var gulp = require('gulp');
var fs = require('fs');
var Constant = require('../Constant.js');
var FileUtil = require('../util/FileUtil.js');
var makeToES5 = require('./toES5.js');
var readFilesWithSuffix = FileUtil.readFilesWithSuffix;
var project = Constant.project;
var toES5 = makeToES5();

var jsSourceSuffix = Constant.jsSourceSuffix;

gulp.task('to-es5',/*project*/ function(){
    var projects = Constant.useProject ? [project] : (Constant.initProjects || [project]).concat(Constant.specifiedProject ? [project] : []);
    projects = projects.filter(function(item, idx){
        return projects.indexOf(item) === idx;
    });
	projects.forEach(function(project){
		if(!fs.existsSync(project)){
			return console.log(project, "does not exists !");
		}
		var files = readFilesWithSuffix(jsSourceSuffix)(project+"/");
		toBrowserify(files, project);
	});
	
});

function toBrowserify(results, project){
	if(!Array.isArray(results)){
		results = [results];
	}
	var rproject = new RegExp("("+project+".+$)");
	//遍历项目下的所有文件去进行browserify
	results.forEach(function(item){
		toES5(item.match(rproject)[0]);
	});
}