require('./to-es5-task.js');
require('./to-css-task.js');
var gulp = require('gulp');
var Constant = require('../Constant.js');

//inner usage
gulp.task('__c__', function(){
    Constant.useProject = false;
});

function copyFiles(source, destination){
    return gulp.src(source)
        .pipe(gulp.dest(destination));
}

gulp.task('init', ['__c__', 'to-es5', 'to-css'], function(){
    var projects = Constant.useProject ? [project] : (Constant.initProjects || [project]).concat(Constant.specifiedProject ? [project] : []);
    projects = projects.filter(function(item, idx){
        return projects.indexOf(item) === idx;
    });

    projects.forEach(function(project){
        var current = Constant.projects[project];

        if(current&&current.copy&&Array.isArray(current.copy)){
            current.copy.forEach(function(item){
                if(item.source&&item.destination){
                    copyFiles(project+"/"+item.source, item.destination);
                }
            });
        }
    });
});
