var args = process.argv; //获取传入参数

var isBrowserSync = true;
var config = require('./config.json');
for(var i in config){
	exports[i] = config[i];
}
var project = config.defaultProject;
var useProject = true;
var specifiedProject = false;
var watchProjects = config.defaultWatchProjects;

while(args.length){
	switch(args.shift()){
        case "-p":
		case "--project":
			project = args.shift();
			specifiedProject = true;
		break;
		case "-i":
		case "--init":
			useProject = false;
		break;
		case "-nbs":
		case "--noBrowserSync":
			isBrowserSync = false;
		break;
		case "-wf":
		case "--watchFolder":
			watchProjects.push(args.shift());
		break;
	}
}

var fs = require('fs');
console.log(project, "project");

if(!fs.existsSync(project)){ //判断文件夹是否存在
	return console.log(project+"不存在！");
}

for(var i=0; i<watchProjects.length; i++){
	if(!fs.existsSync(watchProjects[i])){
		console.log(watchProjects[i], "doesn't exists!");
		watchProjects.splice(i, 1);
		i--;
	}
}


exports.project = project;

exports.watchProjects = watchProjects;
//优先编译并会刷新浏览器的文件匹配 => function/reg
exports.rmainFile = /page/;

exports.browserProxy = config.browserProxy+project;
exports.isBrowserSync = isBrowserSync;
exports.specifiedProject = specifiedProject;
exports.useProject = useProject;
