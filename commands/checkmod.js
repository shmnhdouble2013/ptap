/**
 * Created with IntelliJ IDEA.
 * @version : 0-0-1 
 * @author 水木年华double
 * @Date  201407
 * To change this template use File | Settings | File Templates.
 */

var exec = require('child_process').exec;
var colors = require('colors');

module.exports = function(){
    console.log('[info]'.grey, '正在升级，请耐心等待20~60秒...');

    var sudo = '';
    if(process.platform.match(/darwin/i)) sudo = 'sudo ';

    exec(sudo+'npm install ptap --registry=http://registry.npmjs.org/ -g', function (err, stdout, stderr) {
        if(err){
            console.log('[error]'.red, 'ptap升级失败，原因：');
            console.log(err);
        }else{
            console.log(stdout);
            console.log('[ok]'.green, 'ptap升级成功！请重新执行刚才的命令。');
        }
        process.exit();
    });
}