var gulp = require('gulp');
//同步刷新浏览器
var Constant = require('../Constant.js');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
var browserProxy = Constant.browserProxy;
var rootFolder = Constant.rootFolder;
var rootPath = Constant.rootPath;

gulp.task('browser-sync', browserWatch);
function browserWatch(){
	browserSync.init({
		/*静态服务器*/
		/*
		server: {
            baseDir: "./"
        }
		*/
        /*代理*/
		proxy: browserProxy
    });
    
}

module.exports.browserWatch = browserWatch;
module.exports.reload = reload;