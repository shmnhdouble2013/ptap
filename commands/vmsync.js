require('colors');

var path = require('path');
var program = require('commander');
var argv    = require('optimist').argv;
var fs = require('fs');

var scp = require('../lib/scp');

var watch = require('../lib/watch');
var opt = {
    host: '',
    directory: '',
    username: ''
};

var isSending = false;

module.exports = function(){


    var dir = path.resolve(argv._.length > 2 ? argv._[1] : '.');

    var host = argv._.length > 2 ? argv._[2] : argv._[1];


    if(!dir || !host) {
        console.log('请指定本地目录和远程目录！');
        process.exit(0);
    }

    var scheme = host.split('@');

    var user = scheme[0];
    var scheme2 = scheme[1].split(':');

    opt.username = user;
    opt.host = scheme2[0];
    opt.directory = scheme2[1];

    watch(dir, function(filename){
        if(!isSending){
            console.log('[info]'.grey, filename+' modified!')

            isSending = true;


            var src  = filename;
            var dest = filename.replace(dir, '');

            var options = {
                file: src,
                user: opt.username,
                host: opt.host,
                port: '22',
                path: opt.directory + dest
            };

            scp.send(options, function (err, stdout, stderr) {
                if (err){
                    console.log(err);
                }else{
                    console.log('File transferred.');
                }

                isSending = false;
            });
        }

    });


    console.log('[listening]'.green, '本地目录：'+dir+'的中的文件改动，将自动上传到服务器上的'+opt.directory+'目录');

}