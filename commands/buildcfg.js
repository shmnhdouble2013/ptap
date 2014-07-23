/**
 * ptap buildcfg cmd
 * @author huangjia@pinganfang.com
 * @Date  201407
 */
var colors = require('colors');
var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;
var _ = require('underscore');
var fileParser = require('../tools/fileParser.js');
var getSeedLastVersion = require('../tools/getSeedLastVersion.js');
var modifySeedConfig = require('../tools/modifySeedConfig.js');
var Walker = require('iwalk');

exports.name = 'buildcfg';

/*function getBasedir(dirPath) {
 var dirPathArr = dirPath.split(path.sep);
 var dirPathArrLen = dirPathArr.length;
 return dirPathArr[dirPathArrLen - 1]
 }*/
function getPackageCfg(dirPath) {
    var info = {};
    if (fs.existsSync(dirPath + path.sep + "package.json")) {
        try {
            info = JSON.parse(fs.readFileSync(fileName).toString());
        } catch (e) {
        }
    }
    return info;
}


var buildcfg = function (configure, version0,callback) {
    // 用户输入的路径
    var dirFromCommander = path.resolve(argv._.length > 1 ? argv._[1] : '.');

    // 用户输入的版本号
    var versionFromCommander = argv.v || '1.0.0';

    // 第一次执行的时候其实会执行两遍config.json
    if (!versionFromCommander && typeof version === 'string') {
        versionFromCommander = version0;
    }

    //如果是函数，则作为buildcfg的回调函数执行
    if (typeof version0 === 'function') {
        callback = version0;
    }

    var currentPath = configure || dirFromCommander,
        currentPackagePath;

    // packName 默认为js里ADD的 packageName
    var currentPackageName;
    var currentSubModule = '';
    var configFileDir;
    var isMUI = false;
    var currentSourcePath = currentPath.indexOf("/src")===-1?currentPath+path.sep+"src":currentPath;
    var seedPath,cfgPath;

    currentPackagePath = currentPath = path.resolve(currentPath);


    //判断是否在MUI目录下进行的操作
    if (currentPath.indexOf('mui' + path.sep) >= 0) {
        //configFileDir = currentPath.split('mui')[0] + 'mui' + path.sep + 'seed' + path.sep +'src' + path.sep;
        configFileDir = currentPath.split('mui')[0] + 'mui' + path.sep;
        isMUI = true;
    } else {
        configFileDir = currentSourcePath;
    }
    //MUI目录和其他包处理是不一样的，MUI生成的配置需要写到seed目录下
    cfgPath = configFileDir + path.sep + 'config.json';
    seedPath = configFileDir + path.sep + 'seed.js';


    if (isMUI) {
     	console.log("[info]".info, "Mui Seed 已经改为自动构建，请不要手动构建seed。下面生成的代码，只保证module部分正确，并且只用于特殊情况下生成单个组件的配置，请不要提交到seed。");
     	//return;
        currentSubModule = path.basename(currentPath);
        currentPackageName = 'mui';
        currentPackagePath = path.resolve(currentPath+"/../");
    }


    //如果没有配置取上次版本
    var version = versionFromCommander || getPackageCfg(currentPath).version || "1.0.0";


    //初始化walker
    var walker = new Walker({
            filterDir: ['.svn', 'node_modules', 'demo', 'tests', 'css', 'docs', 'test', 'build']
        }
    );
    var moduleInfo;
    var configRet = {
        modules: {}
    };

    //console.log(currentPath);
    //DONE:增加配置信息合并的功能
    walker.walk(currentSourcePath, function (fileName, isDirectory) {
        if (!isDirectory) {
            var extName = path.extname(fileName);
            if (extName === '.js' || extName === ".css") {

                moduleInfo = fileParser.getModuleInfo(fileName,currentPackagePath);


                if (moduleInfo) {
                    _.each(moduleInfo, function (mod, i) {
                        //console.log(mod,i);
                        if(!currentPackageName && extName === ".js"){
                            // 如果不存在packageName 使用moudleName的第一个
                            currentPackageName = i.split("/")[0];
                            // @todo 需要重新处理下css的moduleName，configRet.modules
                            // 不过对于非MUI情况，css Module会被删除，所以就不处理了
                        }


                        if (isMUI) {
                            mod.path = mod.path.replace(currentSubModule, 'mui/' + currentSubModule + '/' + version);
                        } else {
                            delete mod.path;
                        }
                        if (_.isEmpty(mod)) {
                            delete moduleInfo[i];
                        }
                    });
                    configRet.modules = _.extend(configRet.modules, moduleInfo);
                }
            }
        }
    });


    //输出config集合
    //@todo: 迁移配置文件读取逻辑到前面 by tiejun
    walker.on('end', function () {

        //configRet.packages.push(packageFileContent.package);
        //获取原来config.json里的内容
        var originConfig;
        try {
            originConfig = fs.readFileSync(cfgPath).toString();
            originConfig = JSON.parse(originConfig);
        } catch (e) {
            originConfig = {
                modules: {},
                packages: {}
            };
            console.log("[warn]".warn,"can't read default config");
        }
        //在原有配置文件的基础上进行合并
        configRet.packages = originConfig.packages;
        if(originConfig.version){
            configRet.version = originConfig.version;
        }
        if (originConfig.modules && configRet.modules) {

            // 删除原有配置文件
            if (currentSubModule || isMUI) {
                _.each(originConfig.modules, function (mod, name) {
                    if (new RegExp("^" + currentPackageName + "/" + currentSubModule + "($|/)").test(name)) {
                        delete originConfig.modules[name];
                    }
                });
            } else {
                originConfig.modules = {};
            }
            //console.log(configRet.modules);
            configRet.modules = _.extend(originConfig.modules, configRet.modules);
            // 更新seed
            /*if (isMUI && configRet.modules["mui/seed"]) {
                getSeedLastVersion(function (version) {
                    if (version) {
                        version = version.split(".");
                        version[2] = parseInt(version[2]) + 1;
                        version = version.join(".");
                        configRet.modules["mui/seed"].path = "mui/seed/" + version + "/seed.js";
                        configRet.version = version;
                        console.log("[info]".info, "mui/seed 本次版本为", version.underline);
                    }else{
                        console.log("[warn]".warn,"mui/seed 版本未更新，请手动更新(线上version+0.0.1)")
                    }
                    wirteConfig();
                });
            } else {*/
                wirteConfig();
            //}

        }
    });

    // write cfg file
    function wirteConfig() {
        modifySeedConfig({
                //SEED版本升级的方式
                seedHandleType : argv.seed || null,
                //是否进行包下文件的全量更新
                isBuildAll : !!argv.all || false,
                //包的版本号
                version : version,
                //buildcfg功能完成后的回调函数
                callback : callback,
                //当前的执行buildcfg的路径
                currentPath : currentPath,
                //是否在mui下执行buildcfg
                isMUI : isMUI,
                //config.js所在的目录
                configFileDir : configFileDir,
                //config.js所在的路径
                cfgPath : cfgPath,
                //seed文件的路径
                seedPath : seedPath,
                //当前的包名
                currentPackageName: currentPackageName,
                //当前的子包名
                currentSubModule : currentSubModule,
                configRet:configRet
            });
    }
};

module.exports = buildcfg;