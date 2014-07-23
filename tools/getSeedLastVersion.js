var http = require('http');
var Buffer  = require('buffer').Buffer;
var colors = require("colors");

function handlerPubRes(res, callback){
    var buffers = [];
    res.on('data', function(chunk){
        buffers.push(chunk);
    });
    res.on('end', function(){
        var res = Buffer.concat(buffers).toString(),
            ret = [];
        try{
            ret = JSON.parse(res);
        }catch (e){
            console.log("[warn]".warn,"get seed version fail(JSON error)");
        }
        if(ret[0]&&ret[0].name){
            callback(ret[0].name.split("/")[1]);
        } else {
            callback();
        }
    });
}
function getSeedLastVersion(callback){
    // gitlab api
    var api = 'http://gitlab.alibaba-inc.com/api/v3/projects/2260/repository/tags?private_token=zuUjBEiVm78TdjqdvsR4';
    http.get(api, function(res){
        handlerPubRes(res,callback);
    }).on('error', function(){
        console.log("[warn]".warn,"get seed version fail(REQ error)");
        callback();
    });
}

//getSeedLastVersion(function(version){console.log(version)});

module.exports = getSeedLastVersion;