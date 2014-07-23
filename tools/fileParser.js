/**
 * Created with IntelliJ IDEA.
 * @version : 0-0-1
 * @author : butian.wth tiejun[at]tmall.com
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs');
var path = require('path');

//@todo 这里分成了两个表达式，是因为无法实现当require不存在时仍能匹配到name，如果对require部分使用？，存在时也不匹配！
var nameReg = /KISSY\.add\(\s*?["'](.*?)["']\s*?,/;
var requireReg = /KISSY\.add\(\s*?["'](.*?)["']\s*?,[\s\S]*(,\s*?{\s*?requires[\s\S]*?})\s*?\)/;

/*
 获取file 模块依赖等信息，根据字面分析，不做解析
 如果存在name使用文件指定name 否则使用相对路径
 @todo 支持一个文件多个模块形式
 @todo css 文件返回的moduleName可能有问题
 @return {moduleName:moduleInfo}
 */
module.exports.getModuleInfo = function (file,currentPackagePath,packageName) {

    packageName = packageName || path.basename(currentPackagePath);

    file = path.resolve(file);

    var content = fs.readFileSync(file).toString();
    //去掉注释
    content = content.replace(/(\/\*+(\w|\W)+?\*\/|\/\/.+)/g,'');
    var matched;
    var ret = {},
        moduleName = "",
        moduleInfo = {},
        modulePath = path.relative(currentPackagePath,file).replace("/src/","/");
    if(path.extname(file)===".js"){
        matched = nameReg.exec(content);
        if (matched && (moduleName = matched[1])) {
            matched = requireReg.exec(content);
            if (matched&& matched[2]) {
                moduleInfo = eval('(1' + matched[2] + ')');
            }
        }
    }

    moduleName = moduleName || packageName + "/"+modulePath.replace(/\.js$/,"");
    moduleInfo.path =  modulePath;
    ret[moduleName] = moduleInfo;

    return ret;
};
/*
    获取相对package的路径
    @return path {Array}
 */
module.exports.getModulePath = function (file, packageName) {
    var fileDirArr = file.split(path.sep);
    return fileDirArr.slice(fileDirArr.indexOf(packageName)).join("/");
};