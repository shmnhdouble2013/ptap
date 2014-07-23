var path = require('path'),
    fs   = require('fs'),
    http = require('http'),
    Url  = require('url'),
    async = require('async'),
    argv = require('optimist').argv,
    Buffer  = require('buffer').Buffer;

var THREAD_NUM = 8;

function _checkModulesExist(cfg, callback){
    var modules = cfg.modules,
        packages = cfg.packages;
    var urls = [];
    var allowPub = true;
    for(var i in modules){
        if( i!=="mui/seed" ){
            var modPath = i.split('/');
            var pkgName;
            if(modPath.length > 1){
                pkgName = modPath[0];
            }else{
                pkgName = 'default';
            }

            var pkg = packages[pkgName];
            if(!pkg) pkg = packages['default'];

            if(modules[i].path){
                urls.push(Url.resolve(pkg.path, modules[i].path));
            }else{
                var modfile = i.replace(pkgName+'/', '') + '.js';
                urls.push(Url.resolve(pkg.path, modfile));
            }
        }
    }
    
    async.eachLimit(urls, THREAD_NUM, function(url, cb){
        var meta = Url.parse(url);
        http.get({
            hostname: meta.hostname,
            port: meta.port,
            path: meta.path,
            agent: false
        }, function(res){
            if(res.statusCode !== 200){
                console.log('[error]'.error, res.statusCode, url);
                allowPub = false;
            }else{
                console.log('[ok]'.info, res.statusCode, url);
            }
            cb(null);
        });
    }, function(){
        if(allowPub) console.log('[ok]'.info, '依赖模块在线性检测通过！');
        callback && callback(allowPub);
        process.exit(0);
    });
}

module.exports = {

    check: function(callback){

        var p = path.resolve();
        
        var seedPath = path.join(p, 'src/config.json');

        var isSeedJs = false;
        if(!fs.existsSync(seedPath)){
            seedPath = path.join(p, 'src/seed.js');
            if(!fs.existsSync(seedPath)){
                console.log("当前src目录下不存在config.json或seed.js");
                process.exit(0);
            }else{
                isSeedJs = true;
            }
        }

        var seedContent = fs.readFileSync(seedPath, 'utf-8');


        var cfg;
        if(isSeedJs){
            var moduleReg = /KISSY.config\(({[\s\S]*?})\);/;
            var result = seedContent.match(moduleReg);

            if(!result){
                console.log('[error]'.error, '没找到在seed中找到模块依赖关系！');
                callback && callback();
                return;
            }else{
                cfg = JSON.parse(result[1]);
            }
        }else{
            cfg = JSON.parse(seedContent);
        }
        console.log('[info]'.warn, '依赖模块在线性检测：');
        _checkModulesExist(cfg, callback);
    }
}