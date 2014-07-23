var exec = require('child_process').exec;
var conf = require('./conf');
var user = conf.load();
var log  = require('../lib/log');

exports.name = 'svn';

function _attachUserInfo(){
    return ' --username ' + user.username + ' --password ' + user.password;
}

/**
 * 前置检查
 *
 * @param {String} args
 * @param {Object} options.error
 */
exports.beforeAsync = function(options){
    var error = function(err){
        if(options.error){
            options.error(err);
        }else{
            console.log('[error] ' + err);
        }
    };

    log.record('execute svn status ' + options.path, log.DEBUG);
    exec('svn status ' + options.path + _attachUserInfo(), function(err, stdout, stderr){
        if(err){
            return error(err);
        }

        //didn't execute svn add, the current path is not under version control
        if(stderr){
            return error(stderr.trim());
        }

        if(stdout && !options.force){
            return error('some modfifies that didn\'commit, please check your local code first\n\nsvn status results\n' + stdout);
        }

        //update local code
        log.record('execute svn up ' + options.path, log.DEBUG);
        exec('svn up ' + options.path, function(err, stdout, stderr){
            if(err){
                return error(err);
            }

            if(stderr){
                return error(err);
            }

            stdout = stdout.trim();

            // 判断是否有冲突需要解决
            // http://i18n-zh.googlecode.com/svn/www/svnbook-1.4/svn.ref.svn.c.update.html
            var result = stdout.match(/^C/gm) || [];
            if(!result.length){
                //判定是否有冲突
                options.success();
            }else{
                options.error('文件存在冲突，请先解决！');
            }
        });
    });
};

/**
 * 获取svn仓库URL
 */
exports.getRepositoryURL = function(path, callback, errCallback){
    errCallback = errCallback || function(err){
        console.log('[error] ' + err);
    };

    log.record('execute svn info --xml ' + path, log.DEBUG);
    exec('svn info --xml ' + path + _attachUserInfo(), function(err, stdout, stderr){

        err && errCallback && errCallback(err);
        if(stdout){
            var results = stdout.match(/<url>(.+)<\/url>/i);
            if(results){
                callback(results[1]);
            }
        }
    });
};

/**
 * 获取revision
 */
exports.getRevision = function(path, callback, errCallback){

    errCallback = errCallback || function(err){
        console.log('[error] ' + err);
    };

    log.record('execute svn info --xml ' + path, log.DEBUG);
    exec('svn info --xml ' + path + _attachUserInfo(), function(err, stdout, stderr){
        err && errCallback && errCallback(err);
        if(stdout){
            var results = stdout.match(/<commit\s+revision="(\d+?)"/i);
            if(results){
                callback(results[1]);
            }
        }
    });
}
