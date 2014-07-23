/**
 * Created with IntelliJ IDEA.
 * @version : 0-0-1
 * @author : butian.wth
 * To change this template use File | Settings | File Templates.
 */

var path = require('path');
var colors = require('colors');
var cvs = require('../lib/cvs.js');

exports.initPackageConfig = function (packageName, currentPath, version, callback) {
    if (!version) {
        version = '1.0.0';
    }

    var ret = {
        "packages": {},
        "modules": {
        }
    };
    //console.log(ret);

    cvs.getRelativePath(currentPath, function(dir){
        ret.packages[packageName] = {
            "path": "http://static.pinganfang.com/" + dir + "/" + version + "/",
            "ignorePackageNameInUri": true,
            "debug": true
        };
        callback && callback(ret);
    }, function(){
        console.log(arguments)
        console.log('[error]'.error,'get relative path form root return failure');
    })
}


exports.initSeedConfig = function (packageName, dir, version) {
    var config = exports.initPackageConfig(packageName, dir, version);
    config = JSON.stringify(config);
    return 'KISSY.config(' + config + ');';
};