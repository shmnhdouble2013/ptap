/**
 * Created with IntelliJ IDEA.
 * @version : 0-0-1
 * @author : butian.wth
 * To change this template use File | Settings | File Templates.
 */
var colors  = require('colors');
var fs = require('fs');
var path = require('path');
var configTemplate = require('../tools/configTemplate.js');
var cfgReg = /(\/\/cmd:ptap[\w\W]*?[[S|KISSY].config\(){[^)]*}(\))/g;
var jsonStringify = require('../tools/jsonStringify.js');
var _ = require('underscore');
var buildcfg = require('../commands/buildcfg');

function writeInSeed(seedPath, content, isFirst) {
    try{
        fs.writeFileSync(seedPath, content);
        console.log('[info]'.info,'seed文件写入成功');
    }catch(err){
        console.log(err);
    }
}

function writeInConfig(cfgPath, configRet) {
    //输出config.json文件
    try{
        fs.writeFileSync(cfgPath, configRet);
        console.log('[info]'.info,'包配置文件更新成功');
    }catch(err){
        console.log(err);
    }
}

function updatePackageVersion(packagesObj, currentPackageName, version){
    var pathTmp;
    for (var key in packagesObj) {
        if (key.indexOf(currentPackageName) >= 0) {
            pathTmp = packagesObj[key].path;
            packagesObj[key].path = pathTmp.split(currentPackageName)[0] + currentPackageName + '/' + version + '/';
        }
    }
    return packagesObj;
}

/*function cleanEmptyObj(o){
    for(var key in o){
        if(_.isEmpty(o[key])){
            delete o[key]
        }
    }
    return o;
}*/

module.exports = function (config) {
    //console.log(config.isTML);
    config.seedPath = path.resolve(config.seedPath);
    var content;
    var packagesObj = config.configRet.packages;
    if (fs.existsSync(config.seedPath)) {
        content = fs.readFileSync(config.seedPath).toString();
        //console.log(config.configRetStr);
        //更新package里面的版本
        if(!config.isMUI){
            config.configRet.packages = updatePackageVersion(packagesObj, config.currentPackageName, config.version);
        }
        //console.log(config.configRet);
        //console.log(config.configRet);
        config.configRetStr = jsonStringify(config.configRet, 4);
        content = content.replace(cfgReg, '$1' + config.configRetStr + '$2');
        //console.log(config.configRetStr);
        writeInConfig(config.cfgPath, config.configRetStr);
        writeInSeed(config.seedPath, content);
        config.callback && config.callback()
    } else {
        configTemplate.initPackageConfig(config.currentPackageName, config.currentPath, config.version, function (ret) {
            //console.log(ret.packages);
            config.configRet.packages = ret.packages;
            config.configRetStr = jsonStringify(config.configRet, 4);
            //console.log(config.configRet);
            content = '//cmd:ptap\r\nKISSY.config(' + config.configRetStr + ');';
            writeInConfig(config.cfgPath, config.configRetStr);
            writeInSeed(config.seedPath, content);
            //buildcfg(config.currentPath, config.version);
            config.callback && config.callback()
        });
    }
}