/**
 * Created with IntelliJ IDEA.
 * @author huangjia@pinganfang.com
 * @Date  201407
 * @version: 1-0-0
 */

var argv = require('optimist').argv;
var path = require('path');
var ispriter = require('../tools/ispriter/ispriter.js');

/**
 * 用户输入的路径
 */
var dirFromCommander = path.resolve(argv._.length > 1 ? argv._[1] : '.');
var config = {
    "input": {
        "cssRoot": dirFromCommander
    }
};
module.exports = function(){
    try{
        var canvas = require('canvas');
        ispriter.merge(config);
    } catch (e){
        console.log('请安装node-canvas');
    }
}