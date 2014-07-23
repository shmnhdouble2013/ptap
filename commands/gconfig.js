/**
 * @author huangjia@pinganfang.com
 * @Date  201407
 */

var colors = require('colors');
var fs = require('fs');
var path = require('path');
var util = require('../lib/util.js');
var getSeedLastVersion = require('../tools/getSeedLastVersion.js');
var program = require('commander');
var http = require('http');
var Buffer  = require('buffer').Buffer;

function isPHPEnv(dir,callback){
    var ret = false;
    fs.readdir(dir+"/../",function(err,files){
        files.some(function(file,idx){
            if(path.extname(file)===".php"){
                return ret=true;
            }
        });

        callback(ret);
    });
}

// 对比两个seed版本，vOld < vNew
var seedInfoContrast = function(vOld, vNew, callback){
	var seedInfoUrl = '';
	util.getJsonRemote(seedInfoUrl, function(seedInfo){
		var result = null;
		if(seedInfo){
			result = _seedInfoContrast(seedInfo, vOld, vNew);
		}
		callback(result);
	});
};

var _seedInfoContrast =  function(seedInfo, vOld, vNew){
	var oldModuleInfo,
		newModuleInfo,
		addList = [],
		changeList = [],
		delList = [];
	for(var i = 0; i < seedInfo.length; i++){
		if(seedInfo[i].v === vNew){
			newModuleInfo = seedInfo[i].m;
		}else if(seedInfo[i].v === vOld){
			oldModuleInfo = seedInfo[i].m;
			break;
		}
	}
	for(var newM in newModuleInfo){
		if(oldModuleInfo[newM]){
			if(oldModuleInfo[newM] !== newModuleInfo[newM]){
				changeList.push({
					name: newM,
					vOld: oldModuleInfo[newM],
					vNew: newModuleInfo[newM]
				});
			}
		}else{
			addList.push({
				name: newM,
				v: newModuleInfo[newM]
			});
		}
	}
	for(var oldM in oldModuleInfo){
		if(!newModuleInfo[newM]){
			delList.push({
				name: newM
			});
		}
	}
	return {
		change: changeList,
		add: addList,
		del: delList
	};
};

module.exports = {
    init: function(){
        var dir = path.resolve(process.argv.length > 3 ? process.argv[3] : '.');
        var self = this;

        isPHPEnv(dir,function(php){

            dir  = dir + path.sep +  (php?"gconfig.json":"gconfig.vm");

            if(fs.existsSync(dir)){
                self.check(dir);
            }else{
                self.update(dir, function(){
                    process.exit();
                });
            }

        });


    },
    check : function(file){
        var self = this;
        fs.readFile(file, function (err, data) {
            if (err) throw err;
            var data;
            try{
                data = JSON.parse(data);
            }catch (e){
                console.log("[error]".error,e);
            }

            console.log("[info]".info,"本地gconfig当前版本为：",data.version);

            getSeedLastVersion(function(version){
                console.log("[info]".info,"线上gconfig最新版本为：",version);
                switch (util.compareVersion(version,data.version)){
                    case -1:
                        program.prompt('比线上版本还新!!？是否恢复gconfig 文件（Y/N） ', function(ok){
                            if(ok.toUpperCase()==="Y"){
                                self.update(file,version,function(){
                                    process.exit(0);
                                });
                            }else{
                                process.exit(0);
                            }
                        });
                        break;
                    case 1:
                    	seedInfoContrast(data.version, version, function(result){
                    		if(result){
                    			// change
                    			if(result.change && result.change.length > 0){
									console.log("[info]".info,"变更的组件有：");
									for(var i = 0; i < result.change.length; i++){
										var c = result.change[i];
										console.log("[info]".info, c.name + ': ' + c.vOld + ' -> ' + c.vNew);
									}
                    			}else{
									console.log("[info]".info,"没有变更的组件！");
                    			}
                    			// add
                    			if(result.add && result.add.length > 0){
									console.log("[info]".info,"新增的组件有：");
									for(var i = 0; i < result.add.length; i++){
										var a = result.add[i];
										console.log("[info]".info, a.name + ': ' + a.v);
									}
                    			}else{
									console.log("[info]".info,"没有新增的组件！");
                    			}
                    			// old
                    			if(result.del && result.del.length > 0){
									console.log("[info]".info,"删除的组件有：");
									for(var i = 0; i < result.del.length; i++){
										var d = result.del[i];
										console.log("[info]".info, d.name);
									}
                    			}else{
									console.log("[info]".info,"没有删除的组件！");
                    			}
                    			console.log("[info]".info,"更多详情请查看：");
                    		}
							program.prompt('是否升级gconfig 文件（Y/N） ', function(ok){
								if(ok.toUpperCase()==="Y"){
									self.update(file,version,function(){
										process.exit(0);
									});
								}else{
									process.exit(0);
								}
							});
                   	});
                        break;
                    case 0:
                        console.log("[info]".info,"恭喜你本地版本已是最新版!");
                        break;
                }
            });
        });

    },
    update : function(file,version,callback){
        var self = this;
            //api = 'http://g.tbcdn.cn/mui/seed/'+version+'/config.json';

        // 如果不指定version，使用最新version
        if(!version || typeof version === "function"){
            return getSeedLastVersion(function(ver){
                console.log("[info]".info,"线上gconfig最新版本为：",ver);
                self.update(file,ver,version||callback);
            });
        }
        callback = callback || function(){};

		self.getApiUrl(version, function(url){
			http.get(url, function(res){
				var statusCode = res.statusCode;
				if(res.statusCode === 200){
					var buffers = [];
					res.on('data', function(chunk){
						buffers.push(chunk);
					});
					res.on('end', function(){
						var res = Buffer.concat(buffers).toString(),
							ret;
						try{
							ret = JSON.parse(res);
						}catch (e){
							console.log("[error]".error,"线上gconfig 文件格式错误，有可能发布还没生效，请稍后重试or联系相关人员解决！");
							callback();
						}
						if(ret.version === version){
							fs.writeFile(file,res,function(){
								console.log("[info]".info,"本地gcofig升级成功！版本为：",version);
								callback();
							});
						}else{
							console.log("[error]".error,"线上gconfig 文件版本不正确，有可能发布还没生效，请稍后重试or联系相关人员解决！");
							callback();
						}
					});
				}else{
					console.log("[warn]".warn,"获取线上文件失败，状态码："+statusCode+"！请稍后重试！");
					callback();
				}

			});		
		});
        console.log("[info]".info, "下载最新gconfig ...");

    },
    getApiUrl: function(version, callback){
    	var url = 'http://git.ipo.com/api/v3/projects/2260/repository/commits/{commitId}/blob?filepath=build/config.json&private_token=Sy5j5DA3ULw1keCja1Pp',
    		gitCommitUrl = 'http://git.ipo.com/api/v3/projects/2260/repository/commits/?ref_name=publish/' + version + '&private_token=Sy5j5DA3ULw1keCja1Pp';
    	
    	util.getJsonRemote(gitCommitUrl, function(data){
    		var commitId = data[0]['id'];
    		url = url.replace('{commitId}', commitId);
    		callback(url);
    	});
    }
};