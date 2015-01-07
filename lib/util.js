
/**
 * 公共函数库
 * @author huangjia@pinganfang.com
 * @Date  201407
 */
var http = require('http');
 
exports.name = 'util';

/**
 * 获取用户HOME目录
 *
 * 比如：
 * Mac: /Users/xianyu/
 * Win: C:/Users/xianyu/
 */
exports.getUserHome = function(){
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/';
};

/**
 * 对比两个版本新旧
 * @param a
 * @param b
 * @return ret {Number} 如果a>b 返回1，a==b 返回0 ，a<b 返回 -1
 */
exports.compareVersion = function(a, b){
    var len;

    a = a.split(".").join("");
    b = b.split(".").join("");

    len = a.length;

    for(var i=0;i<len;i++){
        if(a[i]<b[i]){
            return -1;
            break;
        }else if(a[i]>b[i]){
            return 1;
            break;
        }
    }

    return 0;
};

// 新版gitlab API中 获取json文件，会被转义，主要是换行和双引号，这里兼容下，再转义回来
var jsonTrans = function(jsonStr){
	if(typeof JSON.parse(jsonStr) === 'string'){
		jsonStr = JSON.parse(jsonStr);
	}
	return jsonStr;
};

/**
 * 获取远程json对象
 * @param url
 * @param callback
 * @return ret {Object} json对象
 */
exports.getJsonRemote = function(url, callback){
	var jsonData = '';

	http.get(url, function(res) {
		res.setEncoding('utf8');

		res.on('data', function(data){
			jsonData += data;
		});

		res.on('end', function(){
			// 兼容转换
			jsonData = jsonTrans(jsonData);
			callback(JSON.parse(jsonData));			
		});

	}).on('error', function(e) {
		console.log("Got " + url + " error: " + e.message);
		callback(null);
	});

};
