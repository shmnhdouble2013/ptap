/**
 * Created with IntelliJ IDEA.
 * @version : 0-0-1
 * @author 水木年华double
 * @Date  201407
 * @desc : 检测线上版本与本地版本是否匹配，并给出提示信息引导升级
 */

var exec = require('child_process').exec,
    program = require('commander'),
    pjson = require('../package.json'),
    update = require('./update.js'),
    conf  = require('../lib/conf');

module.exports = function (fn) {
    //get local config
    var config = conf.load();

//    console.log('===check version===');
    var nowTime = new Date().getTime(),
        stepTime = 0.5 * 24 * 3600 * 1000;  // 每12小时检测一次

    var checkversionTime = config.inittime || 0,
        isCheckversion = (nowTime - checkversionTime) > stepTime,
        callback = fn;

    //console.log(isCheckversion + '==' +'---'+checkversionTime);
    if (isCheckversion) {
        try{
            config.inittime = nowTime;
            conf.save(config);
        }catch(e){

        }

        exec('ptap version', function (err, stdout) {
            if (stdout) {
                var curVer = stdout.replace(/\s/ig, ''),
                    localVer = pjson.version;

                if (matchVersion(localVer, curVer)) {
                    callback();
                } else {
                    program.prompt(localVer + '与线上版本(' + curVer + ')不一致,是否进行升级(y/n)  ', function (input) {
                        if (input.toUpperCase() == 'Y') {
                            update();
                        } else {
                            callback();
                        }
                    });
                }
            }
        });
    } else {
        callback();
    }

    /**
     * 版本匹配
     * @param localVer
     * @param curVer
     */
    function matchVersion(localVer, curVer) {
        return localVer >= curVer;
    }

};