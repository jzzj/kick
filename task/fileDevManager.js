/** �����ļ�������������
*	1����ÿ�θ����ļ�ʱӦ�ü�����������Ƿ��б仯
*   2����ʼ���γ������gulpִ��ʱĿ¼�ľ���·��
*/
var fs = require('fs');
var fileDevManager = (function(){
	var FileDevMaps = [],
	
	updateFileDevMaps = (function(rimports, rmodule){
		
		/**
		* ���ݴ�����ļ���ǰ׺�͵�ǰ�����ļ���·��������ȷ��ǰ׺�������ļ���·��
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
				if(!prefix){
					var ret = results.match(rfolderFile);
					results = ret[2];
					prefix = ret[1];
				}
				results = [results];
			}
			
			//results.length=8;
			/**
			* ÿ���ļ���Ӧ���ļ�������·��ǰ׺ => Ϊ�˵õ������ļ�����ȷ·����
			*/
			
			results.forEach(function(tmp){
				var ret = filePathManager.getCurrentFilePathWithPrefix(tmp);
				if(ret){
					
					FileDevMaps[tmp] = mapDev(tmp, ret.prefix);
				}else{
					filePathManager.setPathWithFile(tmp, prefix+tmp.match(rprefix)[0]);
					
					FileDevMaps[prefix+tmp] = mapDev(prefix+tmp, prefix);
				}
			});
			//console.log(filePathManager.getFullMap())
			function mapDev(tmp, oprefix){
				//tmp = tmp.replace(rprevs, '');
				
				if(!fs.existsSync(tmp)){
					console.log('can\'t find the ', tmp);
					return [];
				}
				
				return (fs.readFileSync(tmp, "utf-8").match(rimports) || [])
					.map(function(i){
						var ret = i.match(rmodule),
							module = ret[1] + ".js";
						
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
	
	build = function(){
		updateFileDevMaps.apply(null, arguments);
		updateDevsMap();
		//console.dir(FileDevMaps)
		//console.log(FileDevMaps['service/accountInfoService.js'])
		//console.log(FileDevMaps['service/tokenService.js'])
		//console.log(FileDevMaps['app.js'])
		//console.log(FileDevMaps['directive/multiSelectDirective.js'])
		console.log('map is ready!');
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
				//console.log(FileDevMaps[k],k)
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
		get: getFileDevMaps
	};
})();

module.exports = fileDevManager;