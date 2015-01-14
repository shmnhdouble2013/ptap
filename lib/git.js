/**
 * @author 水木年华double
 * @Date  201407
 */

var exec = require('child_process').exec;

exports.getRepositoryURL = function(path, callback, errCallback){
    errCallback = errCallback || function(err){
        console.log('[error] ' + err);
    };

    //log.record('execute svn info --xml ' + path, log.DEBUG);
    exec('git --git-dir='+path+"/.git"+" remote show origin", function(err, stdout, stderr){

        err && errCallback && errCallback(err);

        if(stdout){
            var results = stdout.match(/URL:\s(.+)\s/i);
            if(results){
                callback(results[1]);
            }
        }
    });
};