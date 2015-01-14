
/**
 * build核心文件
 * 水木年华double
 * 20141115
 */

require('colors');

var path = require('path'),
    util = require('../lib/util'),
    program = require('commander'),
    argv    = require('optimist').argv,
    fs = require('fs'),
    fsutil = require('../lib/fsutil'),
    Walk = require('walk'),
    jschardet = require('jschardet'),
    iconv = require('iconv-lite'),
    native2ascii = require('native2ascii').native2ascii,
    debug = require('../lib/debug'),
    async = require('async'),
    buildcfg = require('../commands/buildcfg'),
    exec = require('child_process').exec,
    watch = require('../lib/watch'),
    ps, watchPath, isBuilding, startTimer;


Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            return format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
}

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

/**
 * 递归删除文件夹文件
 */
var deleteFolderRecursive = function(path) {
    var files = [];

    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file, index){
            var curPath = path + "/" + file;

            if(fs.statSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/**
 * ascii css js
 */
function n2a(content, isCss){
    var output = native2ascii(content);

    //对于 css 文件，还需要将 \uxxxx 中的 u 去掉（css 只认识\xxxx）
    if(isCss){
        output = output.replace(/\\u/g, "\\");
    }

    return output;
}


// 输出 出错报警信息
function echoWaring(){
    if(echoWaring.warnings.length){
        console.log('[warn]'.yellow, '以下文件中含有不规范的daily环境代码，请移除：');
        echoWaring.warnings.forEach(function(warn){
            console.log('|--'+warn);
        });
    }

    if(echoWaring.debugcode_warnings.length){
        console.log('[warn]'.yellow, '以下文件中可能含有调试代码，请检查：');
        echoWaring.debugcode_warnings.forEach(function(warn){
            console.log('|--'+warn);
        });
    }
}
echoWaring.warnings = [];
echoWaring.debugcode_warnings = [];


// 输出具体文件出错信息 终止进程
function errHanding(f, err){
    console.log('[error]'.red, f+': 压缩出错，详细信息：');
    console.log(err);
    process.exit(1);
}


/**
 * 开始构建代码
 */
module.exports = function(){
    var dir = path.resolve(argv._.length > 1 ? argv._[1] : '.');

    startTimer = +new Date();

    var srcPath = path.join(dir, 'src');
    if(!fs.existsSync(srcPath)){
        console.log('[error]'.error, '当前目录下不存在src目录！');
        process.exit(1);
    }

    var destPath = path.join(dir, 'build');
    deleteFolderRecursive(destPath);

    var filterReg = /\b(temp|tmp|DS_Store|\.svn|\.soy|\.html|\.htm|\.md|\.idea|\.iml|\.dump|\.less|\.log)\b$/i;
    var options = {
        followLinks: false
    };

    var walker = Walk.walk(srcPath, options);
    var dstring = (new Date()).format("yyyy-MM-dd h:mm:ss");

    function build(callback){

        walker.on("file", function (root, fileStats, next) {

            var filename = fileStats.name;

            if(filterReg.test(filename)){
                next();
                return;
            }

            var file = path.join(root, filename),
                fileContent = fs.readFileSync(file),
                extname = path.extname(filename),
                zIndex = file.indexOf(path.sep+'src'+path.sep),
                pathSlash = [file.substr(0, zIndex), file.substr(zIndex+5)],
                ofpath = pathSlash[1],
                destfile = path.join('build', ofpath),
                content;

            if(!argv.x || (argv.x && extname == argv.x)){

                if(extname == '.css' || extname == '.js'){

                    var encoding = jschardet.detect(fileContent).encoding;

                    if(!argv.o){

                        if(encoding == 'GB2312'){
                            var buf = iconv.decode(fileContent, 'gbk');
                            fileContent = iconv.encode(buf, 'utf-8');
                        }

                        content = fileContent.toString();

                        if(!argv.a){
                            switch(extname){
                                case '.css':

                                    var cleanCSS = require('clean-css'),
                                        options={
                                            relativeTo:root
                                        };

                                    try{
                                        //var cleanCSS = require('clean-css');
                                        content = cleanCSS.process(content,options);
                                    }catch(e){
                                        if(!argv.f) errHanding(file, e);
                                    }
                                    break;
                                case '.js':

                                    var JSChecker = require('../lib/jschecker');
                                    if(JSChecker.containDailyUrl(content)){
                                        echoWaring.warnings.push(ofpath);
                                    }

                                    if(JSChecker.containDebugCode(content)){
                                        echoWaring.debugcode_warnings.push(ofpath);
                                    }

                                    var UglifyJS = require("uglify-js");
                                    try{
                                        var ast = UglifyJS.parse(content);

                                        ast.figure_out_scope();
                                        ast.compute_char_frequency();
                                        ast.mangle_names();

                                        content = ast.print_to_string();

                                    }catch(e){
                                        if(!argv.f) errHanding(file, e);
                                    }

                                    break;
                                        default :;
                                    break;
                            }
                        }

                        content = n2a(content, extname == '.css');


                        if(argv.t && (extname == '.js' || extname == '.css') ){
                            content = '/* ptap build '+ dstring +' */\r\n' + content;
                        }


                        if(argv.v && extname == '.css'){//只针对css做版本替换
                            var imgresolve = require('../lib/imgresolve');
                            content = imgresolve(content);
                        }
                    }else{
                        content = fileContent.toString();
                    }

                }else{
                    content = fileContent;
                }

                console.log('[info]'.grey, ofpath+' 处理完成!');
            }

            fsutil.fwrite_p(destfile, content);

            next();
        });
        
        // 打印构建耗时    
        walker.on("end", function () {

            var btw = ((+new Date)-startTimer)/1000;

            console.log('[ok]'.green, '全部文件处理完成！耗时：'+btw+'秒');

            echoWaring();

            callback && callback();

            if(isBuilding){
                isBuilding = false;
            }
        });
    }

//
//    // 包配置构建
//    var buildcfg = require('./buildcfg');
//
//    if(argv.b){
//        buildcfg(dir, function(){
//            build(whetherWatch);
//        });
//    }else{
//        build(whetherWatch);
//    }
//
//    function whetherWatch(){
//        if(argv.w){
//            var wp = argv.w;
//
//            var paths = wp !== true ? wp.split(','): '';
//            watchPath = [];
//
//            if(paths.length){
//                paths.forEach(function(item){
//                    watchPath.push(path.resolve(dir, item));
//                });
//            }else{
//                watchPath = srcPath;
//            }
//
//            console.log('[watching]'.rainbow, watchPath);
//
//            watch(watchPath, function(filename){
//
//                if(!isBuilding){
//
//                    isBuilding = true;
//
//                    console.log('[change]'.cyan, filename+' changed.');
//                    console.log('[change]'.cyan, '开始重新构建：');
//
//                    var spawn = require('child_process').spawn;
//                    var cmd = process.argv.shift();
//
//                    ps = spawn(cmd, process.argv, {
//                        env: process.env,
//                        cwd: process.cwd(),
//                        stdio: [
//                            process.stdin,
//                            process.stdout,
//                            process.stderr
//                        ]
//                    });
//
//                    ps.on('exit', function (code, signal){
//                        process.exit(code);
//                    });
//                }
//            });
//        }
//    }

}