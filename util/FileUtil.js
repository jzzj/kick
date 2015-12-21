var fs = require('fs');
var path = require('path');
var Async = require('./Promise.js').Async;

//递归遍历当前文件夹下的所有文件
var dirFiles = (function(){
	var results = [], pending = 0;
	return function readFiles(dir, done){
		
		fs.readdir(dir, function(err, list){
			if (err) throw err;
			pending = list.length+pending;
			list.forEach(function(file){
				var tmp = path.resolve(dir, file);
				fs.stat(tmp, function(err, stat) {
					--pending;
					if (stat && stat.isDirectory()){
						pending++;
						readFiles(tmp, done);
						pending--;
					}else{
						results.push(tmp);
						if (!pending) done(results);
					}
				});
			});
		});
	}
}());

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
	readFilesWithFolders: readFilesWithFolders,
	readFile: fs.readFile,
	readFileSync: fs.readFileSync,
};