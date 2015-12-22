var gulp = require('gulp');
var fs = require('fs');

var Constant = require('../Constant.js');
var FileUtil = require('../util/FileUtil.js');
var browserSync = require('./browserSync.js');
var fileDevManager = require('./fileDevManager.js');
var makeToES5 = require('./toES5.js');


var readFiles = FileUtil.readFiles;
var browserWatch = browserSync.browserWatch;
var reload = browserSync.reload;
var staticPath = Constant.staticPath;
var rootFolder = Constant.rootFolder;
var rootPath = Constant.rootPath;
var onlyCopyPath = Constant.onlyCopyPath;
var browserifyPath = Constant.browserifyPath;
var rmainFile = Constant.rmainFile;
var jsOutputPath = Constant.jsOutputPath;
var isBrowserSync = Constant.isBrowserSync;
var watchPath = Constant.watchPath;
var watchFolders = Constant.watchFolders;
var staticFolder = Constant.staticFolder;


var toES5 = makeToES5(browserifyPath, jsOutputPath);

//把一些不需要browserify管理模块的进行简单的文件拷贝
var copyFolders = Constant.jsCopyFolders;
gulp.task('watch.copyFiles', function(){
	copyFolders.forEach(function(copyFolder){
		watchFolders.forEach(function(folder){
			var tmp = watchPath[folder];	
			var srcFolder = folder+"/"+tmp.staticPath+browserifyPath+copyFolder,
				destFolder = folder+"/"+tmp.staticPath+jsOutputPath+copyFolder;
			
			gulp.src(srcFolder+'/*.js')
				.pipe(gulp.dest(destFolder));
		});
	});
	
});

gulp.task('watch', ['watch.copyFiles'], function(){
	var rpath = new RegExp(['(?:', (process.cwd()+"/").replace(/\\/g, '\\/'),')(.+)'].join(''));
	var allToES5Queue = {priority: [], normal: []};
	
	//监听多个文件夹的变化，去更新依赖、被依赖的文件并判断是否刷新浏览器
	while(watchFolders.length){
		var tmp = watchFolders.pop();
		var path = watchPath[tmp].path;
		gulp.watch(path+'**/*.js', doModify);
		readFiles(path, fileDevManager.build);
		
		//监听css和html
		gulp.watch(tmp+"/*.html").on('change', reload);
		gulp.watch(tmp+"/"+watchPath[tmp].staticPath+Constant.staticPath.css+"**/*.css").on('change', reload);
	}
	
	isBrowserSync&&browserWatch();
	
	function doModify(modify){
		
		var path = modify.path;
		
		if(!fs.existsSync(path)){
			return console.log(path, " does not exists !");
		}
		if(fs.lstatSync(path).isDirectory()){
			return console.log(path+" is dir");
		}
		
		path = path.replace(/\\/g, "/");
		
		try{
			var tmp = path.match(rpath)[1];
		}catch(e){
			console.log('路径配置有误！');
			console.log(e);
		}
		
		var folder = (tmp.match(/.+\//) || [])[0];
		var project = folder.split('/').shift();
		var currentFolder = watchPath[project];
		var folderIdx = (onlyCopyPath || []).map(function(item){return currentFolder.path+item}).indexOf( folder );
		if(folderIdx != -1){
			console.log('only copy ', tmp);
			
			return gulp.src(tmp)
				.pipe(gulp.dest(project+"/"+currentFolder.staticPath+jsOutputPath+onlyCopyPath[folderIdx]));
		}
		
		if(modify.type === 'added'){
			fileDevManager.update(tmp);
			fileDevManager.updateMap();
		}
		
		var maps = fileDevManager.get();
		var devBy = (maps[tmp] || {devBy: []}).devBy || [];
		
		//获取编译队列
		var queue = getToES5Queue(devBy.concat(tmp), allToES5Queue);
		queue.priority = queue.priority.filter(function(item, idx){
			return queue.priority.indexOf(item)===idx;
		});
		queue.normal = queue.normal.filter(function(item, idx){
			return queue.normal.indexOf(item)===idx;
		});
		
		function getToES5Queue(devBy, queue){
			return devBy.reduce(function(queue, item){
				var ret = typeof rmainFile !== 'function' ? rmainFile.test(item) : !!rmainFile(item);
				var list = ret ? queue.priority : queue.normal;
				list.unshift(item);
				getToES5Queue((maps[item] || {}).devBy || [], queue);
				return queue;
			}, queue);
		}
		
		afterToES5(queue.priority, {
			resolve: function(file){
				reload();
				afterToES5(queue.normal);
				console.log(file, 'is done,', (new Date()).toLocaleString());
			}
		});
		
		function afterToES5(queue, promise){
			while(queue.length){
				toES5(queue.shift(), promise);
			}
		}
		
		var updateList = queue.priority.concat(queue.normal).concat(tmp);
		
		updateList.filter(function(a, b){
			return updateList.indexOf(a)===b;
		}).forEach(function(i){
			fileDevManager.update(i, rootPath+browserifyPath);
		});
		
		fileDevManager.updateMap();
		var devMap = fileDevManager.get()[tmp];
		console.log(tmp, devMap ? devMap : tmp+"'s dependency is wrong!");
		return false;
	}
});


