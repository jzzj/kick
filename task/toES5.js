var gulp = require('gulp');
//browserify的watch任务 --不进行所有build任务会做的事，如：uglify、rev、MD5, etc.
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
//var streamify = require('gulp-streamify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var Constant = require('../Constant.js');
var jsSourceSuffix = Constant.jsSourceSuffix;

//es6代码转换为es5
var makeToES5 = function(inputPath, outputPath){
	var rfolderFile = /(.+\/)(.+)$/;
	return function(file, promise){
		
		var ret = file.match(rfolderFile);
		
		var outputFile = ret[2].replace(new RegExp('\.'+jsSourceSuffix+'$'), '.js');
		var jsOutputPath = ret[1];//.replace("/"+inputPath, '/'+outputPath);
		
		try{
			var b = browserify({entries: file, extensions: ['.'+jsSourceSuffix], debug: !!promise})
				.transform("babelify", {sourceMaps: !promise})
				.bundle()
				.on('error', function(err){
					console.log(err.message);
					//this.emit('end');
				})
				.pipe(source(outputFile))
				//catch error
				
				.on('end', function(){
					promise&&promise.resolve(file);
				});
				
			if(!!promise){
				b = b.pipe(buffer())
					.pipe(sourcemaps.init({loadMaps: true}))
					.pipe(sourcemaps.write('./'));
			}
			return b.pipe(gulp.dest(jsOutputPath));
		}catch(e){
			console.error("ERROR:"+e);
		}
	}
};

module.exports = makeToES5;