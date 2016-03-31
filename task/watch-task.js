var gulp = require('gulp');
var fs = require('fs');

var Constant = require('../Constant.js');
var FileUtil = require('../util/FileUtil.js');
var browserSync = require('./browserSync.js');
var fileDepManager = require('./fileDepManager.js');
var makeToES5 = require('./toES5.js');
var toCss = require('./toCss.js');


var readFilesWithSuffix = FileUtil.readFilesWithSuffix;
var browserWatch = browserSync.browserWatch;
var reload = browserSync.reload;
var jsSourceSuffix = Constant.jsSourceSuffix;
var cssSourceSuffix = Constant.cssSourceSuffix;
/*
var rootPath = Constant.rootPath;
var outputPath = Constant.outputPath;
var onlyCopyPath = Constant.onlyCopyPath;
var browserifyPath = Constant.browserifyPath;
var jsOutputPath = Constant.jsOutputPath;
*/

var rmainFile = Constant.rmainFile;
var isBrowserSync = Constant.isBrowserSync;
var watchProjects = Constant.watchProjects;
var projects = Constant.projects;

var toES5 = makeToES5();
/*
function copyFiles(folders, type){
	folders.forEach(function(copyFolder){
		watchProjects.forEach(function(folder){
			var tmp = projects[folder];	
			var srcFolder = folder+"/"+tmp.staticPath+browserifyPath+copyFolder,
				destFolder = folder+"/"+tmp.staticPath+jsOutputPath+copyFolder;
			
			gulp.src(srcFolder+'/*.js')
				.pipe(gulp.dest(destFolder));
		});
	});
}

//进行简单的文件拷贝
var copyFolders = Constant.jsCopyFolders;
gulp.task('watch.copyFiles', function(){
	copyFiles(Constant.jsExcludePath, 'js');
	copyFiles(Constant.cssExcludePath, 'css');
	copyFiles(Constant.imgExcludePath, 'img');
});
*/

function copyFiles(source, destination, project){
	return gulp.src(project+"/"+source)
		.on('end', function(){
			reload();
		})
		.pipe(gulp.dest(destination));
}

gulp.task('watch', /*['watch.copyFiles'], */function(){
	var rpath = new RegExp(['(?:', (process.cwd()+"/").replace(/\\/g, '\\/'),')(.+)'].join(''));
	
	
	//监听多个文件夹的变化，去更新依赖、被依赖的文件并判断是否刷新浏览器
	while(watchProjects.length){
		var tmp = watchProjects.pop();
		var path = tmp+"/";
		gulp.watch(path+'**/*.'+jsSourceSuffix, doWatch(doModify));

		var files = readFilesWithSuffix(jsSourceSuffix)(path);
		//console.log(files);
		fileDepManager.build(files, path);
		
		gulp.watch(path+"**/*."+cssSourceSuffix, doWatch(function(modify, path, file){
			toCss(file);
		}));

		var current = projects[tmp];
		if(current&&current.copy&&Array.isArray(current.copy)){
			current.copy.forEach(function(item){
				if(item.source&&item.destination){
					gulp.watch(tmp+"/"+item.source, copyFiles.bind(null, item.source, item.destination, tmp));
				}
			});
		}


		//监听css和html
		gulp.watch(path+"**/*.html").on('change', reload);
		gulp.watch(path+"**/*.css").on('change', reload);

	}
	
	isBrowserSync&&browserWatch();

	function doWatch(callback){
		return function(modify){
			var path = modify.path;
		
			path = path.replace(/\\/g, "/");
			
			try{
				var tmp = path.match(rpath)[1];
			}catch(e){
				console.log('路径配置有误！');
				console.log(e);
			}
			
			if(modify.type === "deleted"){
				if(callback === doModify){
					fileDepManager.remove(tmp);	//使用doModify方法需要调用这句代码！
				}
				console.log(tmp, 'has been deleted.');
				return;
			}
			
			if(!fs.existsSync(modify.path)){
				return console.log(modify.path, " does not exists !");
			}
			if(fs.lstatSync(modify.path).isDirectory()){
				return console.log(modify.path+" is dir");
			}
			callback(modify, path, tmp);
		}
	}

	function doBundle(modify, path, tmp){
		toES5(tmp);
	}
	
	function doModify(modify, path, tmp){
		var allToES5Queue = {priority: [], normal: []};
		
		if(['added', 'renamed'].indexOf(modify.type)!=-1){
			fileDepManager.update(tmp);
			fileDepManager.updateMap();
		}
		
		var maps = fileDepManager.get();
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
				console.log(file, 'has been complied at', (new Date()).toLocaleString());
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
			fileDepManager.update(i);
		});
		
		fileDepManager.updateMap();
		var devMap = fileDepManager.get()[tmp];
		console.log(tmp, devMap ? devMap : tmp+" has no dependencies!");
		return false;
	}
});


