var fs = require('fs');
var path = require('path');
var Async = require('./Promise.js').Async;

function readAllFiles(judge){
	
	return function readFiles(dir){
		var list = fs.readdirSync(dir);
		var results = [];
		list.forEach(function(file){
			var tmp = path.resolve(dir, file);
			var stat = fs.statSync(tmp);
			if (stat && stat.isDirectory()){
				results = results.concat(readFiles(tmp));
			}else{
				if(judge(tmp)){
					results.push(tmp);
				}

				
			} 
		});
		return results;
	}
}

//递归遍历当前文件夹下的所有文件
var dirFiles = readAllFiles(function(){return true});

var readFilesWithSuffix = function(suffix){
	return readAllFiles(function(filename){
		return new RegExp('\.'+suffix+'$').test(filename);
	});
}

//遍历当前文件夹下的文件
function readFiles(dir, done){
	var results = [];
	fs.readdir(dir, function(err, list){
		if (err) throw err;
		var pending = list.length;
		list.forEach(function(file){
			var tmp = path.resolve(dir, file);
			fs.stat(tmp, function(err, stat) {
				--pending;
				if (stat && !stat.isDirectory()){
					results.push(file);
				}
				if (!pending) {
					done(results, dir);
				}
			});
		});
	});
}

function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
    	files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.existsSync(curPath)&&fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else if(fs.existsSync(curPath)){ // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function readFolders(path){
	var folders = [];
	if(fs.existsSync(path)){
		files = fs.readdirSync(path);
		files.forEach(function(file){
			var curPath = (/\/$/.test(path) ? path : path + "/") + file;
			if(fs.existsSync(curPath)&&fs.statSync(curPath).isDirectory()){
				folders.push(curPath);
				folders = folders.concat(readFolders(curPath));
			}
		});
		
	}
	return folders;
}

function readFilesWithFolders(folders, done){
	
	var async = Async.apply(null, folders.map(function(i, idx){return idx}));
	async.fire(function(){
		
		var args = [].slice.call(arguments);
		var results = args.reduce(function(ret, item){
			ret = ret.concat(item[0]);
			return ret;
		}, []);
		console.log(results.length);
	});
	for(var i=0, len=folders.length; i<len; i++){
		readFiles(folders[i], function(i, results){
			console.log(i, results.length);
			async.done(i, results);
		}.bind(null, i))
	}
}

module.exports = {
	dirFiles: dirFiles,
	readFiles: readFiles,
	readFolders: readFolders,
	readFilesWithFolders: readFilesWithFolders,
	readFilesWithSuffix: readFilesWithSuffix,
	deleteFolderRecursive: deleteFolderRecursive,
	readFile: fs.readFile,
	readFileSync: fs.readFileSync,
};