var gulp = require('gulp'),
    uglify = require('gulp-uglify'),	//uglify是一款javascript代码优化工具，可以解析，压缩和丑化javascript。
    jshint = require('gulp-jshint'),	//jshint是一个侦测javascript代码中错误和潜在问题的工具。
    concat = require('gulp-concat');	//合并文件

var fs = require('fs');
var useref = require('gulp-useref');
var imagemin = require('gulp-imagemin');
var minifyCss = require('gulp-minify-css');                     //- 压缩CSS为一行；
var rev = require('gulp-rev');                                  //- 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');               //- 路径替换
var Promise = require('../util/Promise.js').Promise;
var FileUtil = require('../util/FileUtil.js');
var readFilesWithSuffix = FileUtil.readFilesWithSuffix;
var deleteFolderRecursive = FileUtil.deleteFolderRecursive;

var Constant = require('../Constant.js');
var runSequence = require('run-sequence').use(gulp);
var jsSourceSuffix = Constant.jsSourceSuffix;
var cssSourceSuffix = Constant.cssSourceSuffix;
var htmlSourceSuffix = Constant.htmlSourceSuffix;
var project = Constant.project;

var pathMap = Constant.pathMap,
    buildPath = pathMap.rootBuild,
    revPath = pathMap.rootRev,
    publicProjects = Constant.publicProjects || [];

function replaceContents(files){
    
    return gulp.src(files)
    .pipe(modify(version))
    //.pipe(modify(swapStuff))
    .pipe(gulp.dest('aa'));
}

var through2 = require('through2');
function modify(modifier) {  
  return through2.obj(function(file, encoding, done) {
    var content = modifier(String(file.contents));
    file.contents = new Buffer(content);
    this.push(file);
    done();
  });
}

function version(data) {  
  return data.replace(/('|")__JSKZ__MAP__('|")/, '{a:1}');
}

gulp.task('complie', function(){
    replaceContents(project+'**/router.js');
});

//拷贝源码
function copySource(project, excludes, promise){
    
    return gulp.src([project+"/**"].concat(excludes), {base: project})
        .pipe(gulp.dest(buildPath+project));
}

//copy public projects
function copyPublic(project){
    publicProjects.filter(function(){
        return publicProjects.indexOf(project)===-1;
    }).forEach(function(item){
        return gulp.src([item+"/**", '!**/*.map', '!**/*.'+jsSourceSuffix, '!**/*.'+cssSourceSuffix], {base: item})
            .pipe(gulp.dest(buildPath+item));
    })
    
}

//process css
function processCss(project){
    return gulp.src(project+'/**/*.css', {base: project})                                //- 需要处理的css文件，放到一个字符串里
        //.pipe(concat('wap.min.css'))                          //- 合并后的文件名
        .pipe(minifyCss())                                      //- 压缩处理成一行
        .pipe(rev())                                            //- 文件名加MD5后缀
        .pipe(gulp.dest(buildPath+project))             //- 输出文件本地
        .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest(revPath+project+'/css'));              //- 将 rev-manifest.json 保存到 rev 目录内
}

//process js
function processJs(project){
    return gulp.src(project+'/**/*.js')
        //.pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(buildPath+project))
        .pipe(rev.manifest())
        .pipe(gulp.dest(revPath+project+'/js'));
}

//process img
function processImg(project){
    return gulp.src([project+'/**/*.jpg',project+'/**/*.png',project+'/**/*.gif',project+'/**/*.icon',project+'/**/*.tif'])
        .pipe(imagemin())
        //.pipe(gulp.dest(project))
        .pipe(rev())
        .pipe(gulp.dest(buildPath+project))
        .pipe(rev.manifest())
        .on('end', function(){
            runSequence('build:revImages');
        })
        .pipe(gulp.dest(revPath+project+'/image'));
}

//process rev html refs
function revControllPath(project){
    var isPublic = publicProjects.indexOf(project)!==-1;
    var jsons = [
        revPath+project+'/js/*.json',
        revPath+project+'/css/*.json',
        revPath+project+'/restore/*.json',
        buildPath+( isPublic ? "" : project+"/" )+'**/*.'+htmlSourceSuffix
    ];
    function isDoRev(file){

        if(fs.existsSync(file)){
            //console.log(fs.readFileSync(file, "utf-8"), jsons)
            return gulp.src(jsons)                                 
                .pipe(revCollector())                       
                .pipe(gulp.dest(buildPath+(isPublic ? "" : project))); 
        }else{
            setTimeout(isDoRev.bind(null, file), 500);
        }
    }
    //console.log(jsons);
    isDoRev(revPath+project+'/js/rev-manifest.json');  
}

//process rev img refs
function revImgRef(project){
    var isPublic = publicProjects.indexOf(project)!==-1,
        prefix = buildPath+( isPublic ? "" : project+"/" ),
        arr = [prefix+'**/*.html', prefix+'**/*.css', prefix+'**/*.js', prefix+'**/*.'+htmlSourceSuffix];

    arr = arr.filter(function(item, idx){
        return arr.indexOf(item) === idx;
    })

    var jsons = [revPath+project+'/image/*.json'].concat(arr);
    function isDoRev(file){

        if(fs.existsSync(file)){
            //console.log(fs.readFileSync(file, "utf-8"), jsons)
            return gulp.src(jsons)                                 
                .pipe(revCollector())              
                .on('end', function(){
                    runSequence('build:revOthers');
                })         
                .pipe(gulp.dest(buildPath+(isPublic ? "" : project))); 
        }else{
            setTimeout(isDoRev.bind(null, file), 500);
        }
    }
    //console.log(jsons);
    isDoRev(revPath+project+'/image/rev-manifest.json');    
}

//restore static refs
function restore(project, suffix){
    var assets = useref.assets({
        searchPath: buildPath,
        transformPath: function (filePath) {
            return filePath.replace(new RegExp('\.'+cssSourceSuffix+'$'), '.css');
        }
    });

    return gulp.src(buildPath+project+'/**/*.'+suffix)
        .pipe(assets)
        .pipe(rev()) 
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(buildPath+project))
        .pipe(rev.manifest())
        .pipe(gulp.dest(revPath+project+'/restore'));;
}

gulp.task('clean', function () {
    deleteFolderRecursive(buildPath+project);
    deleteFolderRecursive(revPath+project);
});

gulp.task('build:js', function(){
    processJs(project);
});

gulp.task('build:css', function(){
    processCss(project);
});

gulp.task('build:image', function(){
    processImg(project);
});

gulp.task('build:cpstatic', function(){
    return copySource(project, ['!**/*.map', '!**/*.'+jsSourceSuffix, '!**/*.'+cssSourceSuffix]);
});

gulp.task('build:restore', function(){
    return restore(project, htmlSourceSuffix);
})

gulp.task('build:copyPublic', function(){
    return copyPublic(project);
});

gulp.task('build:static', ['build:css', 'build:js', 'build:image']);
gulp.task('build:cp', ['build:copyPublic', "build:cpstatic"])

gulp.task('build:revImages', function(){
    return revImgRef(project);
});

gulp.task('build:revOthers', function(){
    return revControllPath(project);
});

gulp.task('build', ['clean', 'to-es5', 'to-css'], function(){
    return runSequence('build:cp', 'build:restore', 'build:static');
});
