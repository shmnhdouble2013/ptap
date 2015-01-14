/**
 * 日志模块
 * @author 水木年华double
 * @Date  201407
 */
var util = require('./util');
var fs   = require('fs');
var argv = require('optimist').argv;

exports.name = 'log';

var logs = [];

exports.ERR   = 'ERR';
exports.SQL   = 'SQL';
exports.INFO  = 'INFO';
exports.DEBUG = 'DEBUG';

/**
 * 记录一条日志
 *
 * @param {String} type 日志类型，比如 ERR、INFO、DEBUG、SQL
 */
exports.record = function(log, type){
    type = type || this.ERR;
    logs.push('[' + type +'] ' + log + ' [' + new Date() + ']');

    if(argv.d){
        console.log('[' + type + ']', log);
    }
};


//写入日志
process.on('exit', function(){
    if(!logs.length){
        return;
    }

    var file = util.getUserHome() + '.ptaplog';
    var fd = fs.openSync(file, 'a');

    if(fd){
        fs.writeSync(fd, logs.join("\n") + "\n");
    }else{
        console.log("cann't open file " + file + ' for writing');
    }

    fs.closeSync(fd);
});
