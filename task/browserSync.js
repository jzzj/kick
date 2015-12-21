var gulp = require('gulp');
//ͬ��ˢ�������
var Constant = require('../Constant.js');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
var browserProxy = Constant.browserProxy;
var rootFolder = Constant.rootFolder;
var rootPath = Constant.rootPath;

gulp.task('browser-sync', browserWatch);
function browserWatch(){
	browserSync.init({
		/*��̬������*/
		/*
		server: {
            baseDir: "./"
        }
		*/
        /*����*/
		proxy: browserProxy
    });
    
}

module.exports.browserWatch = browserWatch;
module.exports.reload = reload;