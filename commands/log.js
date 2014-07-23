var http    = require('http');
var path    = require('path');
var argv    = require('optimist').argv;
var qs      = require('querystring');
var Buffer  = require('buffer').Buffer;
var cvs     = require('../lib/cvs');
var log     = require('../lib/log');

var HOST = 'http://10.125.7.249:9999/ptap-php-server/';
var QUERYLOG_API = HOST + '?cmd=log&';
var isVBE = false;

var _show = function(publisher, dir, env, vbe, logId, lmt){
    log.record(arguments, log.INFO);

    cvs.getRepositoryURL(dir, function(url){
        var queryUrl = QUERYLOG_API + qs.stringify({
            publisher   : publisher,
            source      : url,
            environment : env,
            verbose     : vbe,
            logid       : logId,
            limit       : lmt
        });
        isVBE = vbe;
        log.record('request:' + queryUrl, log.INFO);
        http.get(queryUrl, handlerLogRes).on('error', requestErrorHanlder);
    }, function(err){
        console.log('[error]'.error, err);
    });
}

module.exports = function(){
    var dir = path.resolve(argv._.length > 1 ? argv._[1] : '.');
    var env = argv.e || '';
    var logid = argv.logid || argv.i || '';
    var verbose = argv.verbose || argv.b || logid ? 1 : 0;
    var limit = argv.l || (logid ? 1: 10 );
    var publisher = argv.publisher || '';

    _show(publisher, dir, env, verbose, logid, limit);
};


function handlerLogRes(res){
    var buffers = [];
    res.on('data', function(chunk){
        buffers.push(chunk);
    });
    res.on('end', function(){
        var res = Buffer.concat(buffers).toString();
        log.record(res, log.INFO);
        
        try{
            var result = JSON.parse(res);
            showLogInfo(result);
        }catch(e){
            console.log('[error]'.error, '解析在线log信息出错！请联系仙羽解决');
        }
    });
}

function requestErrorHanlder(e){
    console.log('[error]'.error, 'request error');
    process.exit();
}

var envMap = {
    'daily'  : '日常',
    'prepub' : '预发',
    'online' : '线上'
};

function showLogInfo(info){
    if(info.type == 'SUCCESS'){
        info.list.forEach(function(item){
            //item.logid, item.appName, item.message, item.pubtime, item.publisher, item.environment, item.branchName, item.version, item.root, item.revision

            console.log([
                item.logid,
                item.root.substr(1),
                item.version,
                'r' + item.revision,
                envMap[item.environment] + '(' + item.environment + ')',
                item.publisher,
                item.pubtime
            ].join('  |  '));

            if(item.files){
                //跳过文件路径前面的一段
                var skiplen = item.root.length + item.version.length + 1;
                item.files.forEach(function(file){
                    console.log(file.filename.substr(skiplen) + ' (r' + file.revision + ')');
                });
                console.log('');
            }

            if(item.message){
                console.log(item.message);
                console.log('');
            }
        });
    }else{
        console.log('日志查询失败');
    }

    process.exit();
}
