var gulp = require('gulp'),
    uglify = require('gulp-uglify'),	//uglify是一款javascript代码优化工具，可以解析，压缩和丑化javascript。
    jshint = require('gulp-jshint'),	//jshint是一个侦测javascript代码中错误和潜在问题的工具。
    concat = require('gulp-concat');	//合并文件

var minifyCss = require('gulp-minify-css');                     //- 压缩CSS为一行；
var rev = require('gulp-rev');                                  //- 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');               //- 路径替换

// var imagemin = require('gulp-imagemin');						//图片压缩
// var pngquant = require('imagemin-pngquant');

var Constant = require('../Constant.js');
var staticPath = Constant.staticPath;
var cssPath = staticPath.css;
var jsPath = staticPath.js;
var imagePath = staticPath.image;

var rootPath = Constant.rootPath;
var rootHtmlPath = Constant.rootHtmlPath;
var commonHtml = Constant.commonHtml;
var pathMap = Constant.pathMap;

var cssPath = rootPath+cssPath;
gulp.task('css', function() {
    gulp.src([cssPath+'/*.css'])    							//- 需要处理的css文件，放到一个字符串数组里
        //.pipe(concat('wap.min.css'))                          //- 合并后的文件名
        .pipe(minifyCss())                                      //- 压缩处理成一行
        .pipe(rev())                                            //- 文件名加MD5后缀
        .pipe(gulp.dest(pathMap.rootBuild+cssPath))             //- 输出文件本地
        .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest(pathMap.rootRev+cssPath));              //- 将 rev-manifest.json 保存到 rev 目录内
});

var jsPath = rootPath+jsPath;
gulp.task('js', function(){
	gulp.src(jsPath+'/*.js')
		.pipe(jshint.reporter('default'))
		.pipe(uglify())
		.pipe(rev())
        .pipe(gulp.dest(pathMap.rootBuild+jsPath))
        .pipe(rev.manifest())
        .pipe(gulp.dest(pathMap.rootRev+jsPath));
});

var jsCopyFolders = Constant.jsCopyFolders;
var jsOutputPath = Constant.jsOutputPath;
gulp.task('js.copyFiles', function(){
	jsCopyFolders.forEach(function(copyFolder){
		var folder = rootPath+jsOutputPath+copyFolder;
		gulp.src(folder+'/*.js')
			.pipe(jshint.reporter('default'))
			.pipe(uglify())
			.pipe(rev())
			.pipe(gulp.dest(pathMap.rootBuild+folder))
			.pipe(rev.manifest())
			.pipe(gulp.dest(pathMap.rootRev+folder));
		
	});
});

var cssCopyFolders = Constant.cssCopyFolders;
var cssOutputPath = Constant.cssOutputPath;
gulp.task('css.copyFiles', function(){
	cssCopyFolders.forEach(function(copyFolder){
		var folder = rootPath+cssOutputPath+copyFolder;
		gulp.src([folder+'/*.css'])
			.pipe(minifyCss())
			.pipe(rev())
			.pipe(gulp.dest(pathMap.rootBuild+folder))
			.pipe(rev.manifest())
			.pipe(gulp.dest(pathMap.rootRev+folder));
	});
});

var imagesPath = rootPath+imagePath;
gulp.task('images', function () {
    return gulp.src(imagesPath+'/*')
        .pipe(gulp.dest(pathMap.rootBuild+imagesPath))
});

var copyFolders = Constant.copyFolders;
gulp.task('copyFiles', function(){
	copyFolders.forEach(function(copyFolder){
		var folder = rootPath+copyFolder;
		return gulp.src(folder+'/*')
			.pipe(gulp.dest(pathMap.rootBuild+folder));
	});
});

gulp.task('common-html', function () {
    return gulp.src(commonHtml+'/*')
       
        .pipe(gulp.dest(pathMap.rootBuild+commonHtml))
});

gulp.task('rev', revControllPath);

function revControllPath(){
	var jsons = [];
	jsons.push(pathMap.rootRev+cssPath+'/*.json');
	cssCopyFolders.forEach(function(copyFolder){
		if(copyFolder){
			jsons.push(pathMap.rootRev+rootPath+cssOutputPath+copyFolder+'/*.json');
		}
	});
	jsons.push(pathMap.rootRev+jsPath+'/*.json');
	jsCopyFolders.forEach(function(copyFolder){
		if(copyFolder){
			jsons.push(pathMap.rootRev+rootPath+jsOutputPath+copyFolder+'/*.json');
		}
	});
	jsons.push(rootHtmlPath+'*.html');
	
	gulp.src(jsons)   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest(pathMap.rootBuild+rootHtmlPath));       //- 替换后的文件输出的目录
}

gulp.task('build', ['css', 'js', 'js.copyFiles', 'css.copyFiles', 'images', 'common-html', 'copyFiles']);
