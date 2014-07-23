var fs = require('fs');

var isWin = !!process.platform.match(/^win/);
var hostFile = isWin ? '' : '/etc/hosts';

/**
 * host文件的修改和查看
 *
 * 目前只支持mac
 *
 * ptap host hostname,hostname2 查看绑定情况
 * ptap host hostname,hostname2 ip 将ip绑定到指定的host
 * ptap host hostname -d 删除
 *
 * 如果要用此工具维护host，请注意它会改掉你现有的hosts，慎重
 * 此工具生成的格式：一行一个，不带任何注释
 *
 */
module.exports = function(){
    var argv = process.argv;
    var len = argv.length;

    if(len < 4){
        return;
    }

    var hostname = argv[3];
    var ip = len > 4 ? argv[4] : '';

    hostname = hostname.split(',');

    if(ip){
        writeHost(hostname, ip);
    }else{
        queryHost(hostname);
    }
};

function getHostsArr(callback){
    fs.readFile(hostFile, function(err, data){
        if(err){
            console.log('无法读取hosts文件，请确认文件位置或者权限');
            return;
        }

        data = data.toString();
        data = data.replace(/#.*/gm, '');       //移除掉注释
        data = data.split(/[\r\n]+/);

        callback(data);
    });
}

//一行一个的配置，这样方便调整，修改
//ip为 -d 则是删除
function writeHost(hostname, ip){
    if('-d' !== ip && !(ip + '.').match(/(\d+\.){4}/)){
        console.log('ip:' + ip + '看起来是个错误的值，请重新指定');
        return;
    }

    getHostsArr(function(data){
        //先读取现有的全部配置
        var map = {};
        data.forEach(function(line){
            line = line.trim();
            line = line.split(/\s+/);

            var ip = line.shift();
            line.forEach(function(host){
                map[host] = ip;
            });
        });

        if('-d' === ip){
            hostname.forEach(function(host){
                delete map[host];
            });
        }else{
            hostname.forEach(function(host){
                map[host] = ip;
            });
        }

        //转换为内容，重新写入
        var list = [];
        for(var host in map){
            list.push(map[host] + ' ' + host);
        }

        try{
            fs.writeFileSync(hostFile, list.join("\n"));
        }catch(e){
            console.log('写入host失败，请检查权限');
        }
    });
}

function queryHost(hostname){
    getHostsArr(function(data){
        var len = data.length;

        hostname.forEach(function(host){
            for(var i = 0; i < len; i++){
                var line = data[i].trim();

                if(-1 < line.indexOf(host)){
                    console.log(line);
                    return;
                }
            }

            console.log('[empty] ' + host);
        });
    });
}
