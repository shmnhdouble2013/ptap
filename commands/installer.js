
var path = require('path'),
    fs   = require('fs'),
    program = require('commander'),
    conf  = require('../lib/conf');

function enterUsername(){
    var msg = '请输入git帐号：';
    program.prompt(msg + ' ', function(usr){
        if(usr.length){
            enterPassword(usr);
        }else{
            enterUsername();
        }
    });
}

function enterPassword(usr){
    var msg = '请输入密码：';

    program.prompt(msg + ' ', function(pwd){
        if(pwd.length){
            saveUser(usr, pwd);
        }else{
            enterPassword();
        }
    });
}

function saveUser(username, password){
    var user = {
        "username": username,
        "password": password,
        "inittime": new Date().getTime()
    };

    conf.save(user);

    console.log('初始化完成！当前用户：'+username);
    process.exit(0);
}

module.exports.install = function(){

    var config = conf.load();

    if(config.username && config.password){
        var msg = "当前git用户："+config.username+"，是否要重新初始化？(Y/N)";
        program.prompt(msg + ' ', function(input){
            if(input.toUpperCase() == 'Y'){
                enterUsername();
            }else{
                process.exit();
            }
        });
    }else{
        console.log("请按下面的步骤进行初始化");
        enterUsername();
    }
}


