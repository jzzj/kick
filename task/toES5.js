var gulp = require('gulp');
//browserify��watch���� --����������build����������£��磺uglify��rev��MD5, etc.
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');

//es6����ת��Ϊes5
var makeToES5 = function(inputPath, outputPath){
	var rfolderFile = /(.+\/)(.+)$/;
	return function(file, promise){
		
		var ret = file.match(rfolderFile);
		
		var outputFile = ret[2];
		var jsOutputPath = ret[1].replace("/"+inputPath, '/'+outputPath);
		
		try{
			return browserify({entries: file, extensions: ['.js'], debug: false})
				.transform(babelify)
				.bundle()
				//catch error
				.on('error', function(err){
					console.log(err.message);
					//this.emit('end');
				})
				.on('end', function(){
					promise&&promise.resolve(file);
				})
				.pipe(source(outputFile))
				.pipe(gulp.dest(jsOutputPath));
		}catch(e){
			console.error("ERROR:"+e);
		}
	}
};

module.exports = makeToES5;