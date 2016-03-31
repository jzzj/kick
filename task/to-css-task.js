var gulp = require('gulp');
var fs = require('fs');
var Constant = require('../Constant.js');
var FileUtil = require('../util/FileUtil.js');
var toCss = require('./toCss.js');
var readFilesWithSuffix = FileUtil.readFilesWithSuffix;
var project = Constant.project;

var cssSourceSuffix = Constant.cssSourceSuffix;

gulp.task('to-css',/*project*/ function(){
    var projects = Constant.useProject ? [project] : (Constant.initProjects || [project]).concat(Constant.specifiedProject ? [project] : []);
    projects = projects.filter(function(item, idx){
        return projects.indexOf(item) === idx;
    });
    
	projects.forEach(function(project){
		if(!fs.existsSync(project)){
			return console.log(project, "does not exists !");
		}
		var files = readFilesWithSuffix(cssSourceSuffix)(project+"/");
		complieCss(files, project);
	});
	
});

function complieCss(results, project){
	if(!Array.isArray(results)){
		results = [results];
	}

	var rproject = new RegExp("("+project+".+$)");
	//遍历项目下的所有文件去进行css编译
	results.forEach(function(item){
		toCss(item.match(rproject)[0]);
	});
}