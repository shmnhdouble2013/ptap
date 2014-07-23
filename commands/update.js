require('colors');

var spawn = require('child_process').spawn;
var path = require('path');

var CWD = process.cwd();

var cmd;
var args = ['update', 'ptap', '-g', '--registry=http://registry.npm.taobao.net'];

var isWin = process.platform === "win32";
var tip;
if (isWin) {
    cmd = 'npm.cmd';
}else{
    cmd = 'sudo';
    args.unshift('npm');
    tip = '[info]'.grey+'开始升级，请按提示操作，可能需要输入sudo密码';
}

module.exports = function(callback){
    if(tip) console.log(tip);

    var npm  = spawn(cmd, args, {
        env: process.env,
        cwd: CWD,
        stdio: [
            process.stdin,
            process.stdout,
            process.stderr,
        ]
    });

    npm.on('exit', function (code, signal){
        if(callback) callback();
        process.exit(code);
    });
}