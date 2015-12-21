var gulp = require('gulp'),
    uglify = require('gulp-uglify'),	//uglify��һ��javascript�����Ż����ߣ����Խ�����ѹ���ͳ�javascript��
    jshint = require('gulp-jshint'),	//jshint��һ�����javascript�����д����Ǳ������Ĺ��ߡ�
    concat = require('gulp-concat');	//�ϲ��ļ�

var minifyCss = require('gulp-minify-css');                     //- ѹ��CSSΪһ�У�
var rev = require('gulp-rev');                                  //- ���ļ�����MD5��׺
var revCollector = require('gulp-rev-collector');               //- ·���滻

// var imagemin = require('gulp-imagemin');						//ͼƬѹ��
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
    gulp.src([cssPath+'/*.css'])    							//- ��Ҫ�����css�ļ����ŵ�һ���ַ���������
        //.pipe(concat('wap.min.css'))                          //- �ϲ�����ļ���
        .pipe(minifyCss())                                      //- ѹ�������һ��
        .pipe(rev())                                            //- �ļ�����MD5��׺
        .pipe(gulp.dest(pathMap.rootBuild+cssPath))             //- ����ļ�����
        .pipe(rev.manifest())                                   //- ����һ��rev-manifest.json
        .pipe(gulp.dest(pathMap.rootRev+cssPath));              //- �� rev-manifest.json ���浽 rev Ŀ¼��
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
	
	gulp.src(jsons)   //- ��ȡ rev-manifest.json �ļ��Լ���Ҫ����css���滻���ļ�
        .pipe(revCollector())                                   //- ִ���ļ���css�����滻
        .pipe(gulp.dest(pathMap.rootBuild+rootHtmlPath));       //- �滻����ļ������Ŀ¼
}

gulp.task('build', ['css', 'js', 'js.copyFiles', 'css.copyFiles', 'images', 'common-html', 'copyFiles']);
