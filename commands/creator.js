
/**
 * init dir js
 * @author 水木年华double
 * @Date  201407
 */

var colors = require('colors');
var path = require('path');
var util = require('../lib/util');
var program = require('commander');
var argv = require('optimist').argv;
var fs = require('fs-extra');
var debug = require('../lib/debug');

var os = require('os');

module.exports = {
    run: function(){
        var dirname = argv._[1] || '.',
            dir = path.resolve(dirname);

        if(!fs.existsSync(dir)){
            console.log('[info]'.grey, '创建'+dirname+'目录');
            fs.mkdirSync(dir);
        }else{
            console.log('[info]'.grey, dir+'目录已存在');
        }

        try{
            console.log('[info]'.grey, '创建src目录');
            fs.mkdirSync(path.join(dir, 'src'));

            console.log('[info]'.grey, '创建build目录');
            fs.mkdirSync(path.join(dir, 'build'));

            console.log('[info]'.grey, '创建README.md文件');
            fs.writeFileSync(path.join(dir, 'README.md'), '# 项目标题', 'utf-8');

            console.log('[info]'.grey, '创建build脚本文件：build.bat|build.command|build.sh');
            var batFile = path.join(dir, 'build.bat');
            var cmdFile = path.join(dir, 'build.command');
            var shFile = path.join(dir, 'build.sh');

            fs.writeFileSync(batFile, 'cd %~dp0\nnode build.js\nptap build -c');
            fs.writeFileSync(cmdFile, '#!/bin/sh\ncd "$(dirname $0)"\nptap build -c');
            fs.writeFileSync(shFile, '#!/bin/sh\ncd "$(dirname $0)"\nptap build -c');

            var platform = os.platform();
            if(platform.indexOf('win32') == -1){
                fs.chmodSync(cmdFile, 0755);
                fs.chmodSync(shFile, 0755);
            }

            console.log('[info]'.grey, '创建.gitignore文件');
            var gitignore = path.join(dir, '.gitignore');
            var igrs = [
                '.svn',
                '.git',
                '.ptap*',
                'node_modules',
                '.DS_Store',
                '.mdb',
                '.ldb',
                '.sln',
                '.project',
                '.settings',
                '.idea',
                '.swf',
                '*.iml',
                '.idea',
                '.ipr',
                '.iws',
                '*.diff',
                '*.patch',
                '*.bak',
                'Thumbs.db',
                '*.swp',
                '*.swo',
                '*.pyc',
                '*.pyo'
            ];

            fs.writeFileSync( gitignore, igrs.join('\n') );
            console.log('[ok]'.green, '目录初始化成功！');

        }catch(e){
            console.log('[error]'.red, '创建失败，原因：');
            console.log(e);
        }
    }
}