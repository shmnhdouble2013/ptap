var argv    = require('optimist').argv;
var http    = require('http');
var qs      = require('querystring');
var colors  = require('colors');
var program = require('commander');
var Buffer  = require('buffer').Buffer;
var cvs     = require('../lib/cvs');
var conf    = require('../lib/conf');
var log     = require('../lib/log');
var checkMod = require('../tools/checkOnlineExists');
var path = require('path');

//var HOST = 'http://10.235.165.89:9878';
var HOST = 'http://10.125.7.249:9999/ptap-php-server/';

var PUBLISH_API = {
    daily  : HOST + '?cmd=cdn&',
    prepub : HOST + '?cmd=cdn&',
    online : HOST + '?cmd=cdn&'
};
var QUERYLOG_API = HOST + '?cmd=log&';

var _requestUrl;

/*
 * 发布与服务端的命令交互
 */
function requestIntractive(info, loading){
    loading.end();
    switch(info.type){
        case 'SUCCESS':
            console.log('[ok]'.info, info.msg);
            process.exit();
            break;

        case 'ERROR':
            console.log('[error]'.error, info.msg);
            process.exit();
            break;

        case 'WARN':
            console.log('[warn]'.warn, info.msg);
            process.exit();
            break;

        case 'CONFIRM':
            program.prompt(info.msg + ' ', function(input){
                if(input.toUpperCase() == 'Y'){
                    http.get(_requestUrl+'&confirm=y', handlerResponse).on('error', requestErrorHanlder);
                }
            });
            break;
    }
}


function handlerPubRes(res, loading){
    var buffers = [];
    res.on('data', function(chunk){
        buffers.push(chunk);
    });
    res.on('end', function(){
        var res = Buffer.concat(buffers).toString();
        log.record(res, log.INFO);
        try{
            requestIntractive(JSON.parse(res), loading);
        }catch (e){
            loading.end();
            requestErrorHanlder({message:"发布接口返回错误，JSON error"});
        }
    });
}

function requestErrorHanlder(e){
    console.log('[error]'.error, 'request error'+ e?"("+ e.message+")":"");
    process.exit();
}


var _publish = function(dir, env, ver, msg, force, ignoreCopy){
    log.record(arguments, log.INFO);

    env = env || 'daily';
    ver = ver || '';
    msg = msg || '';
    force = force || false;

    //服务端所支持的版本简写
    if('=' === ver || '' === ver){
        ver = 'last';
    }

    if('+' === ver){
        ver = 'plus';
    }

    //线上发布不允许使用和上次一样的版本
    if('online' === env && 'last' === ver){
        console.log('[error]', '线上发布不允许覆盖，请重新指定版本号');
        return;
    }

    //检查本地代码是否为最新
    cvs.beforeAsync({
        path: dir,
        force: force,
        success: function(){
            console.log('[ok]'.info, '本地代码为最新版本!');

            //获取svn地址
            cvs.getRepositoryURL(dir, function(url){
                cvs.getRevision(dir, function(rv){
                    var pubUrl = PUBLISH_API[env] + qs.stringify({
                        publisher   : getUsername(),
                        source      : url,
                        environment : env,
                        version     : ver,
                        revision    : rv,
                        message     : msg,
                        ignoreCopy  : ignoreCopy ? 'y' : 'n'
                    });
                    _requestUrl = pubUrl;
                    
                    
                    checkMod.check(dir, function(allowPub){
                        if(allowPub){
                            var timer = cmdLoading();
                            log.record('request:' + pubUrl, log.INFO);
                            console.log('[info]'.silly, '发布中，请耐心等待:');
                            http.get(pubUrl, function(res){
                                handlerPubRes(res, timer);
                            }).on('error', requestErrorHanlder);
                        }else{
                            console.log('[error]'.error, '发布失败！有依赖模块未发布到线上，请发布后再发布seed！');
                            process.exit(0);
                        }
                    });

                });
            }, function(err){
                console.log('[error]'.error, err);
            });
        },
        error: function(err){
            console.log('[error]'.error, err);
        }
    });
};

/**
 * cdn -e -v <dir>
 *
 * dir 要发布的目录
 *
 * -e 要发布到的环境，取值：dail pre online，默认是daily
 * -v 指定发布的版本号
 * -m 发布日志
 */
module.exports.publish = function(){
    var dir = path.resolve(argv._.length > 1 ? argv._[1] : '.');
    _publish(dir, argv.e, argv.v, argv.m, argv.f, argv.p);
}

function getUsername(){
    return (conf.load()).username || '';
}


function cmdLoading(str, spot) {
    spot = spot || '>';

    timer = setInterval(function(){
        process.stdout.write(spot);
    }, 800);

    timer.cancel = timer.end  = function(){
        process.stdout.write('\n');
        clearInterval(this);
    }
    return timer;
}
