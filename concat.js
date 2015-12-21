/**
* 默认输出在 js/css目录下
*/
var options = process.argv.map(function(arg){return arg;});

var Constant = require('./Constant');

var rootFolder = Constant.rootFolder;
var rootPath = Constant.rootPath;
var rootHtmlPath = Constant.rootHtmlPath;
var commonHtml = Constant.commonHtml;
var pathMap = Constant.pathMap;

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var fs = require('fs');
var path = require('path');
var iconv = require('iconv-lite');  

var fileType, concatList, outputFile, outputFolder, isReplace = true;

var results;
function readFiles(dir){
	results = [];
	fs.readdir(dir, function(err, list){
		if (err) throw err;
		var pending = list.length;
		list.forEach(function(file){
			var tmp = path.resolve(dir, file);
			fs.stat(tmp, function(err, stat) {
				--pending;
				if (stat && !stat.isDirectory()){// && (/login/.test(tmp) || /accountinfo/.test(tmp))
					results.push(file);
				}
				if (!pending) {
					console.log(results);
					//rl.close();
					while(options.length){
						switch((options.shift() || "").toLowerCase()){
							case '-t':
							case '--type':
								fileType = /js/.test(options.shift()) ? 'js' : 'css';
								console.log('文件类型：'+ fileType);
							break;
							case '-r':
							case '--replace':
								isReplace = !/false|n(o)?/.test(options.shift());
								console.log('是否进行替换html引用：'+ isReplace);
							break;
							case '-f':
							case '--file':
							case '--files':
								concatList = options || [];
								console.log('文件列表：'+ concatList);
							return doConcat(concatList, outputFile, '', fileType);
							case '-of':
							case 'outputfolder':
								outputFolder = options.shift();
								console.log('输出文件目录：'+outputFolder);
							break;
							case '-o':
							case '--output':
								outputFile = options.shift();
								console.log('输出文件：'+ outputFile);
							break;
						}
					}
					/*
					rl.question("请输入要合并的（js/css）：", function(answer) {
						keepAsking();
					});
					*/
				}
			});
		});
	});
}

readFiles(rootHtmlPath);

var gulp = require('gulp');
var concat = require('gulp-concat');
var rjstag = /<(script)[^<]*(?:>(.*)<\/\1>|\s+\/>)/;	//这种正则不会匹配<! 注释方式的引用！
var rcsstag = /<link[^<]*href=\/?>/;
var regCache = {};
var staticPath = 'static/'

function doConcat(list, concatFile, folder, suffix){
	rl.close();
	var generateFile = concatFile || (+new Date()) + '.' + suffix;
	concatFile = suffix === 'js' ? '<script type="text/javascript" src="'+staticPath+suffix+'/'+generateFile+'"></script>' : '<link rel="stylesheet" href="'+staticPath+suffix+'/'+generateFile+'"/>';
	
	var srcList = list.map(function(i){
		return rootHtmlPath + i;
	});
	
	//results.length = 1;
	var len=list.length;
	if(isReplace){
		results.forEach(function(html){
			var data = fs.readFileSync(rootHtmlPath + html, "utf-8"); 
			
			data = data.replace(getReg(list[0], suffix), concatFile);
			for(var i=1; i<len; i++){
				data = data.replace(getReg(list[i], suffix), '');
			}
			//console.log(data);
			
			fs.writeFileSync(rootHtmlPath + html, iconv.encode(data, 'utf-8')); 
		});
	}
	var finalName = generateFile.replace(/.+\//, '');
	
	if(srcList.length>1){
		gulp.watch(srcList, function(){
			watchThese();
		});
	}
	
	function watchThese(){
		var task = gulp.src(srcList);
		if(srcList.length>1){
			task = task.pipe(concat(finalName));                          //- 合并后的文件名
		}
		console.log(rootPath , outputFolder, finalName)
		task.pipe(gulp.dest(rootPath + outputFolder));
		console.log('concat ok.');
	}
	
	watchThese();
	
	console.log('监听：', srcList);
	
	function getReg(file, suffix){
		var reg = regCache[file];
		if(reg){
			return reg;
		}else{
			switch(suffix){
				case 'css':
					reg = new RegExp('<link[^<]*href\\s*=\\s*[\'"]'+(file.replace(/\./g,'\\.'))+'[\'"][^<]*?\\/?>');
				break;
				case 'js':
				default:
					reg = new RegExp('<script[^<]*src\\s*=\\s*[\'"]'+(file.replace(/\./g,'\\.'))+'[\'"][^<]*>.*?<\/script>');
				break;
			}
			regCache[file] = reg;
		}
		return reg;
	}
}

function keepAsking(suffix){
	var concatList = [];
	(function doAsk(suffix, folder){
		rl.question("请输入要合并的文件：", function(answer) {
			answer = (answer || "").trim();
			if(!answer || /^\s*n(o)?\s*$/i.test(answer)){
				if(concatList.length <= 1){
					return rl.close();
				}
				rl.question("请输入合并后的文件名（默认按时间戳生成）：", function(answer) {
					doConcat(concatList, answer, folder, suffix)
					rl.close();
				});
			}else{
				console.log("已输入：", answer);
				concatList = concatList.concat(answer.match(/\S+/g));
				doAsk(suffix, folder);
			}
			
		});
	}(suffix, rootPath + suffix + '/'));
}