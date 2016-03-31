/** 所有文件的依赖管理器
*	1、在每次更新文件时应该坚持依赖对象是否有变化
*   2、初始化形成相对于gulp执行时目录的绝对路径
*/
var fs = require('fs');
var fileDevManager = (function(){
	var FileDevMaps = [],
	
	updateFileDevMaps = (function(rimports, rmodule){
		
		/**
		* 根据传入的文件夹前缀和当前依赖文件的路径返回正确的前缀和依赖文件的路径
		*/
		var rfolderFile = /(.+\/)(.+)$/,
			filePathManager = (function(){
			var rprevs = /\.\.\//g;
			var rstripFile = /(.+\/).+?\/$|^.+?\/$/;
			var rfolders = /(?:\.\/)(.+\/)(.+)$/;
			var rcurrentPath = /^\.\//;
			var pathCache = {};
			return {
				getCurrentFilePathWithPrefix: function (file, prefix){
					
					if(!prefix || pathCache[file]){
						return pathCache[file];
					}
					
					var prevs = file.match(rprevs);
					var tmp = file;
					
					if(prevs){
						while(prevs.length && prefix){
							prefix = prefix.replace(rstripFile, '$1');
							file = file.replace(prevs.pop(), '');
						}
						
					}
					
					var ret = file.match(rfolders);
					if(ret){
						prefix = prefix + ret[1];
						file = ret[2];
					}else{
						file = file.replace(rcurrentPath, '');
					}
					ret = (prefix+file).match(rfolderFile);
					return this.setPathWithFile(ret[2], ret[1]);
				},
				setPathWithFile: function(file, path){
					return pathCache[path+file] = {
						file: file,
						prefix: path
					};
				},
				getFullMap: function(){
					return pathCache;
				}
			};
		})(),
			rprefix = /(.+\/|)/;
		
		return function(results, prefix){
			if(!Array.isArray(results)){
				results = [results];
			}
			
			//results.length=8;
			/**
			* 每个文件对应该文件的所在路径前缀 => 为了得到依赖文件的正确路径！
			*/

			results.forEach(function(tmp){
				var ret = filePathManager.getCurrentFilePathWithPrefix(tmp);
				if(ret){
					FileDevMaps[tmp] = mapDev(tmp, ret.prefix);
				}else{
					var reg;
					if(prefix){
						reg = new RegExp("("+prefix+".+\/)(.+)$");
					}else{
						reg = rfolderFile;
					}
					var ret = tmp.match(reg);
					if(ret){
						var file = ret[2],
							path = ret[1];
						filePathManager.setPathWithFile(file, path);
						
						FileDevMaps[path+file] = mapDev(path+file, path);
					}else{
						console.log(tmp, 'file is not right.');
					}
				}
			});
			//console.log(filePathManager.getFullMap())
			function mapDev(tmp, oprefix){
				//tmp = tmp.replace(rprevs, '');
				
				if(!fs.existsSync(tmp)){
					console.log('can\'t find the', tmp);
					return [];
				}
				
				return (fs.readFileSync(tmp, "utf-8").match(rimports) || [])
					.map(function(i){
						var ret = i.match(rmodule),
							module = ret[1];
						
						var prefix = filePathManager.getCurrentFilePathWithPrefix(tmp).prefix;
						var file = filePathManager.getCurrentFilePathWithPrefix(module, prefix).file;
						
						prefix = filePathManager.getCurrentFilePathWithPrefix(module, oprefix).prefix;
						//console.log(module, file, oprefix, prefix)
						FileDevMaps[prefix+file] = mapDev(prefix+file, prefix);
						
						//return module;
						return prefix+file;
					});
			}
		}
	})(/(?:import.*?\.+?\/)(.+?)(?:'|")/g, /(?:'|")(.+?)(?:'|")/, /.+\/|/),
	
	getFileDevMaps = function(){
		return FileDevMaps;
	},
	
	remove = function(item){
		var map = FileDevMaps[item];
		if(map){
			map.devs.forEach(function(item){
				var tmp = FileDevMaps[item].devBy;
				tmp.splice(tmp.indexOf(item), 1);
			});
			delete FileDevMaps[item];
		}
		return FileDevMaps;
	},
	
	build = function(){
		updateFileDevMaps.apply(null, arguments);
		updateDevsMap();
		console.log('map is ready!');
		//console.log(FileDevMaps);
	},
	
	updateDevsMap = function(){
		for(var key in FileDevMaps){
			FileDevMaps[key] = mapBy(key, FileDevMaps[key]);
		}
		function mapBy(key, map){
			var devBy;
			var devs = [];
			if('devs' in Object(map)){
				devs = map.devs;
				devBy = map.devBy;
			}else{
				devs = map;
				devBy = [];
			}
			for(var k in FileDevMaps){
				var current = FileDevMaps[k];
				var cdevs = current.devs;
				var tmpArr;
				if(cdevs){
					tmpArr = cdevs;
				}else {
					tmpArr = current;
				}
				tmpArr.indexOf(key)!=-1 && devBy.push(k);
			}
			var map = {
				devs: devs,
				devBy: devBy
			};
			return map;
		};
	}
	
	return {
		update: updateFileDevMaps,
		updateMap: updateDevsMap,
		build: build,
		remove: remove,
		get: getFileDevMaps
	};
})();

module.exports = fileDevManager;