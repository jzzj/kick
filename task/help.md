			     《gulp自动化构建流程帮助文档》

所有的任务配置路径在config.json中。

gulp任务按阶段分为3种：开发阶段、发布阶段和项目初始检出阶段

开发阶段：

	1、watch任务
		1.1、watch在启动时会将scss文件、es6进行编译生成对应的css、js文件在该目录下，原因如下：
			因为用到浏览器不能直接识别的语法静态资源文件需要编译，需分别存储源码和编译生成的代码，后者不提交到代码库。
			3种目录结构方式：
				1、以根目录进行区分。
					缺点：需复制整个项目目录文件，项目初次运行需拷贝大量文件，每次每个文件的修改都需要拷贝到目标目录。
					优点：结构清晰，跟源码一致。
				2、以源文件夹和编译文件夹区分。
					缺点：当目录结构复杂时，多出很多文件夹。
					优点：目录对应简单，指定目录编译
				3、以源文件和编译文件的后缀名区分。
					缺点：一个目录下有两个文件名相同，后缀名不同的文件。
					优点：文件对应简单，不会多出冗余文件，指定文件编译。

				--该项目采用第3种目录结构方式

		1.2、browserSync插件
			监听文件的变化同步刷新浏览器（解放F5..）

		1.3、sourcemap插件——暂时只有chrome浏览器支持该方式
			因为在浏览器中引用的文件是编译后生成的代码并非源码，对于开发者来说不方便调试，sourcemap会生成一个.map文件定位到源码文件，方便开发调试。

		1.4、js源码编译优化
			在依赖关系很复杂时，文件编译的速度会变慢，为了解决该问题，允许自定义编译文件的优先级顺序，该顺序在Constant.js中的rmainfile统一指定。


发布阶段：
	所有发布任务对应的都是编译后的文件。
	1、build任务
        build任务按项目来进行build，步骤如下：
        先将原项目代码拷贝到build目录下，再删除指定的源码文件，再进行代码的压缩、md5等，最后替换文件名

        build任务替换html的资源文件引用路径时，应该考虑到build一个资源文件项目时，也需要进行引用替换。


项目初始检出阶段：
	版本库中的源码只存储源代码，不保留编译出的代码。
	1、init任务
		1.1、根据config.json中配置的initProjects对指定项目进行初始化
			会进行源码的编译，讲es6、sass等源码编译生成浏览器可识别等代码。

			其中的依赖任务：
			1、to-es5任务
				进行js的源码编译
			2、to-css任务
				进行css的源码编译


config.json属性：
"projects": {							=>projects指定所有项目目录，对象的key代表项目名=>对应项目文件夹的名字，使用对象的方式方便后续扩展
	"events": {
  
	}
},
"pathMap": {							=>pathMap指定build任务生成的目录路径，rootBuild文编译后的代码目录，rootRev为md5戳的映射文件目录
	"rootBuild": "build/",
	"rootRev": "rev/"
},				
"browserProxy": "localhost/",			=>browserSync插件代理地址
"jsSourceSuffix": "es6",				=>js源码后缀名
"cssSourceSuffix": "scss",				=>css源码后缀名
"defaultProject": "events",				=>默认启动watch任务指定的项目
"defaultWatchProjects": ["events"],		=>默认监听的所有项目
"initProjects": ["events", "test"],		=>初始化的项目
"htmlSourceSuffix": "html"              =>静态页面的后缀名
"publicProjects": ["core"]    =>公用项目


																		更新时间：
																		2016/3/29 2:39:44
																		zangzhan@jiashuangkuaizi.com
