# PTap

发布工具集。


## 安装

#### 一、安装grunt命令行工具

    npm install -g grunt-cli

    ps: mac 系统 可能需要sudo权限
        
#### 二、安装grunt
首先在你的项目根目录下创建一个名为package.json的文件，并且设置name、version和devDependencies等字段，例如：

    {
      "name": "your-project-name",
      "version": "1.0.0",
      "devDependencies": {
        "grunt": "~0.4.2"
      }
    }
    
然后在项目根目录下执行

    npm install --save-dev grunt

#### 三、安装grunt-ptap插件
同样在项目根目录下执行

    npm install --save-dev grunt-ptap
		  

## 使用

#### 一、添加Gruntfile.js
在项目根目录下创建Gruntfile.js，进行插件加载和配置
    
    module.exports = function(grunt){

        //读取package.json
        var pkg = require('./package.json');                
            
        //配置任务
        grunt.initConfig({
            ptap:{
                buildcfg: {
                    options: {
                        name: pkg.name, //包名
                        version: pkg.version //版本
                    },
                    src: ['src/**/*.js']
                },
                build: {
                    options: {
                        compress: true
                    }
                }
            }
        });
        
        //加载grunt-ptap插件
        grunt.loadNpmTasks('grunt-ptap');
        		
        //注册一个默认任务
        grunt.registerTask('default', ['ptap']);        
    }

#### 二、执行构建

在项目根目录下执行

    grunt
    
这样就完成了seed文件生成、文件压缩等构建工作。

更多grunt使用手册请参考[Grunt官方文档](http://gruntjs.com/getting-started)。


## grunt-ptap配置

#### buildcfg

buildcfg任务用于生成包的配置文件，配置文件用于让脚本在use的时候告诉kissy应当去加载哪个模块，配置项：

* name : 包名，模块的前缀，例如: haofang，建议使用 仓库名(应用名字)
* version : 发布版本号，建议从package.json中读取
* baseurl : 包的url前缀(资源库域名)，默认是 http://static.**.com/

#### build  

build任务用于进行ascii化、文件压缩、文件编译等源码处理工作，配置项：  

* compress: 是否进行压缩，默认为true  