var argv    = require('optimist').argv;
var http    = require('http');
var qs      = require('querystring');
var colors  = require('colors');
var program = require('commander');
var Buffer  = require('buffer').Buffer;
var cvs     = require('../lib/cvs');
var debug   = require('../lib/debug');
var conf    = require('../lib/conf');

var MKBRANCH_API = 'http://10.125.7.249:9999/?cmd=branch&';
var LISTBRANCH_API = 'http://10.125.7.249:9999/?cmd=branch&action=list&';

var _alias;

module.exports.mkbranch = function(){
    debug(arguments);

    var dir = argv._[1] || '.';

    var name = argv.name;
    var alias = _alias = argv.alias;

    if(!name){
        console.log('[error]'.error, '请通过 --name 指定分支名（英文）');
        process.exit();
    }
    if(!alias){
        console.log('[error]'.error, '请通过 --alias 指定分支别名（中文）');
        process.exit();
    }

    cvs.getRepositoryURL(dir, function(url){
        var queryUrl = MKBRANCH_API + qs.stringify({
            publisher: conf.load().username,
            source: url,
            name: name,
            alias: alias
        });
        debug('request:'+queryUrl);
        http.get(queryUrl, handlerRes).on('error', requestErrorHanlder);
    }, function(err){
        console.log('[error]'.error, err);
    });
}

function handlerRes(res){
    var buffers = [];
    res.on('data', function(chunk){
        buffers.push(chunk);
    });
    res.on('end', function(){
        var res = Buffer.concat(buffers).toString();
        var data = JSON.parse(res);
        if(data.type == 'SUCCESS'){
            console.log('[ok]'.info, '分支', ('['+_alias+']').verbose, '创建成功!');
            console.log('分支地址: ', data.url);
        }else{
            console.log('[error]'.error, '分支创建失败，原因：', data.msg);
        }
    });
}

function requestErrorHanlder(e){
    console.log('[error]'.error, 'request error');
    process.exit();
}

