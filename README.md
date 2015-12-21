gulp-watch作为开发时ES6 to ES5
gulp-to-es5将所有es6文件toES5	(非必要不建议使用！)
gulp-build会进行文件压缩、图片优化、加MD5戳
gulp-rev替换html中的引用路径


所有文件的配置路径在config.json中

推荐用法：
开发：
启动gulp-watch
gulp watch -wf test --folder test

命令参数：
--folder/-fd：指定打开的主项目、会拷贝ui/lib文件到js目录下
--noBrowserSync/-nbs: 指定是否启用同步刷新浏览器
--watchFolder/-wf： 指定观察的项目（可指定多个）

部署：
gulp build --folder test
gulp rev --folder rev