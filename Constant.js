//路径统一管理
var args = process.argv; //获取传入参数

var isBrowserSync = true;
var config = require('./config.json');
for(var i in config){
	exports[i] = config[i];
}
var staticFolder = config.staticFolder;
var rootFolder = config.defaultFolder;
var watchFolders = config.defaultWatchFolders;
while(args.length){
	switch(args.shift()){
        case "-fd":
		case "--folder":
			rootFolder = args.shift();
		break;
		case "-nbs":
		case "--noBrowserSync":
			isBrowserSync = false;
		break;
		case "-sf":
		case "--staticFolder":
			staticFolder = args.shift() || "";
		break;
		case "-wf":
		case "--watchFolder":
			watchFolders.push(args.shift());
		break;
	}
}

var fs = require('fs');
console.log(rootFolder, "文件夹");
if(!fs.existsSync(rootFolder)){ //判断文件夹是否存在
	return console.log(rootFolder+"不存在！");
}
for(var i=0; i<watchFolders.length; i++){
	if(!fs.existsSync(watchFolders[i])){
		console.log(watchFolders[i], "doesn't exists!");
		watchFolders.splice(i, 1);
		i--;
	}
}

exports.rootFolder = rootFolder;

exports.rootPath = rootFolder+"/"+staticFolder;

exports.rootHtmlPath = rootFolder+"/";
exports.watchFolders = watchFolders;
exports.commonHtml = rootFolder+"/common";
exports.onlyCopyPath = ['lib/', 'ui/'];
exports.staticPath = config.staticPath;
//优先编译并会刷新浏览器的文件匹配 => function/reg
exports.rmainFile = /es6\/[^\\\/]+$/;

exports.browserProxy = config.browserProxy+rootFolder;
exports.isBrowserSync = isBrowserSync;
