/**
 * @author huangjia@pinganfang.com
 * @Date  201407
 */


var colors = require('colors');
var path = require('path');
var util = require('../lib/util');
var program = require('commander');
var argv    = require('optimist').argv;
var fs = require('fs-extra');
var debug = require('../lib/debug');
var async = require('async');
var startTimer;
var buildcfg = require('../commands/buildcfg');
var exec = require('child_process').exec;
var imgresolve = require('../lib/imgresolve');
var watch = require('../lib/watch');
var isWatch = false, watchPath;

var JSChecker = require('../lib/jschecker');


var compressList = function(list, cb){
    var compressor = require('node-minify');
    var native2ascii = require('native2ascii').native2ascii;
    var iconv = require('iconv-lite');


    function n2a(file){
        var ext = path.extname(file);

        var output = native2ascii(fs.readFileSync(file).toString());

        //对于 css 文件，还需要将 \uxxxx 中的 u 去掉（css 只认识\xxxx）
        if(ext === ".css"){
            output = output.replace(/\\u/g,"\\");
        }

        fs.writeFileSync(file, output);
    }

    Date.prototype.format = function(format){
        var o = {
            "M+" : this.getMonth()+1, //month
            "d+" : this.getDate(),    //day
            "h+" : this.getHours(),   //hour
            "m+" : this.getMinutes(), //minute
            "s+" : this.getSeconds(), //second
            "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
            "S" : this.getMilliseconds() //millisecond
        }

        if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
            (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)if(new RegExp("("+ k +")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length==1 ? o[k] :
                    ("00"+ o[k]).substr((""+ o[k]).length));
        return format;
    }

    function comment(file){
        if(argv.t){
            var content = fs.readFileSync(file);
            var dstring = (new Date()).format("yyyy-MM-dd h:mm:ss");
            content = '/* build '+ dstring +' */\r\n' + content;
            fs.writeFileSync(file, content, 'utf-8');
        }
    }

    async.eachLimit(list, 16, function(file, next){
        var ext = path.extname(file);

        var fileContent = fs.readFileSync(file, 'binary');
        var jschardet = require("jschardet");

        var isGBK = jschardet.detect(fileContent).encoding === 'GB2312';
        if(isGBK){
            var str = iconv.decode(fs.readFileSync(file, 'binary'), 'gbk');
            fs.writeFileSync(file, iconv.encode(str, 'utf-8'));
        }

        if(argv.c){
            if('.js' === ext){

                if(JSChecker.containDailyUrl(file)){
                    console.log('[error]'.red, path.basename(file)+': 文件中含有测试环境地址，请检查！');
                    process.exit(0);
                }else{
                    // Using UglifyJS for JS
                    new compressor.minify({
                        type: 'uglifyjs',
                        fileIn: file,
                        fileOut: file,
                        callback: function(err){
                            if(err){
                                console.log('[error]'.red, path.basename(file)+': 压缩出错，详细信息：');
                                console.log(err);
                                process.exit(0);
                            }else{
                                console.log('[info]'.grey, path.basename(file)+': ascii化成功！');
                                n2a(file);
                                comment(file);
                                console.log('[info]'.grey, path.basename(file)+': 压缩成功！');
                                next();
                            }
                        }
                    });
                }

            }else if('.css' === ext){
                // Using Sqwish for CSS
                new compressor.minify({
                    type: 'yui-css',
                    fileIn: file,
                    fileOut: file,
                    callback: function(err){
                        if(err){
                            console.log('[error]'.red, path.basename(file)+': 压缩出错，详细信息：');
                            console.log(err);
                            process.exit(0);
                        }else{
                            console.log('[info]'.grey, path.basename(file)+': ascii化成功！');
                            n2a(file);
                            imgresolve(file);
                            comment(file);
                            console.log('[info]'.grey, path.basename(file)+': 压缩成功！');
                            next();
                        }
                    }
                });
            }
        }else if(argv.a){
            console.log('[info]'.grey, path.basename(file)+': ascii化成功！');
            n2a(file);
            comment(file);
            if('.css' === ext){
                imgresolve(file);
            }
        }
    }, function(err){
        if(err){
            console.log('[error]'.error, '压缩出错，详细信息：');
            console.log(err);
        }else{
            var btw = ((+new Date)-startTimer)/1000;
            console.log('[ok]'.green, '全部文件处理完成！耗时：'+btw+'秒');
            if(isWatch) console.log('[info]'.grey, '监听目录文件改动：'+watchPath);
        }
        cb && cb(err);
    });
}


var walkPath = function(p, cb){
    console.log('[info]'.grey, '开始处理build目录中的js和css文件：');

    var Walker = require('../lib/walker');
    var walker = Walker(p);

    var walkResult = [];
    //不遍历隐藏文件
    walker.filterDir(function(dir, stat) {
        if (/^\./.test(dir)) {
            return false
        }
        return true
    });
    //只压缩js和css
    walker.on("file", function (file, stat) {
        var ext = path.extname(file).toLowerCase();
        if('.js' === ext || '.css' === ext){
            walkResult.push(file);
        }
    }).on('error', function(er, entry) {
        console.log('遍历出错：' + er + ' On entry ' + entry)
    }).on('end', function() {
        debug('All files traversed.');
        cb(walkResult);
    });
}

var deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};



module.exports = function(){
    startTimer = +new Date();

    var dir = path.resolve(argv._.length > 1 ? argv._[1] : '.');

    var srcPath = path.join(dir, 'src');
    if(!fs.existsSync(srcPath)){
        console.log('[error]'.error, '当前目录下不存在src目录！');
        process.exit();
    }


    var build = function(cb){
        var buildPath = path.join(dir, 'build');
        deleteFolderRecursive(buildPath);

        console.log('[info]'.grey, '正在拷贝src目录中的文件到build目录...');
        fs.copy(srcPath, buildPath, function(){
            console.log('[ok]'.green, '拷贝完成！');
            if(argv.c || argv.a){
                walkPath(buildPath, function(list){
                    compressList(list, cb);
                });
            }
        });
    };


    var _buildcfg = function(cb){
        if(argv.b){
            buildcfg(dir, function(){
                build(cb);
            });
        }else{
            build(cb);
        }
    }

    if(argv.w){
        var wp = argv.w;
        var paths = wp !== true ? wp.split(','): '';
        watchPath = [];
        if(paths.length){
            paths.forEach(function(item){
                watchPath.push(path.resolve(dir, item));
            });
        }else{
            watchPath = srcPath;
        }

        isWatch = true;
        _buildcfg(function(){
            watch(watchPath, function(filename){
                console.log('[ok]'.green, filename+' changed.');
                console.log('[info]'.grey, '开始重新构建：');
                _buildcfg();
            });
        });
    }else{
        _buildcfg();
    }
}