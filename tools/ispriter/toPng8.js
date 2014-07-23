/**
 * Created with IntelliJ IDEA.
 * @author: butian.wth
 * @version: 1-0-0
 * Date: 13-7-10
 * Time: 下午3:21
 */

var fs = require('fs');
var http = require('http');
var path = require("path");

function converToPng8(image, savePath, callback) {
    console.log('begion to conver file: %s', image);

    var options = {
        port: 80,
        path: '/api/shrink',
        method: 'POST',
        hostname: 'tinypng.org'
    };

    var downloadPic = function (url, savePath) {
        console.log('begion to download the transdered file of %s, url: %s', image, url);
        var file = fs.createWriteStream(savePath);
        http.get(url, function (res) {
            res.pipe(file);
            console.log('download file ok, source file: %s, save download file to: %s', image, savePath);
            callback();
        });
    };

    var req = http.request(options, function (res) {
        var statusCode = res.statusCode;

        if (statusCode == 200) {
            console.log('conver file "%s" ok!', image);
        } else {
            console.error('conver file "%s" faild!', image);
            return;
        }

        res.on('data', function (chunk) {
            var json = JSON.parse(chunk);
            downloadPic(json.output.url, savePath);
        });
    });

    req.on('error', function (e) {
        console.log('upload file "%s" error, error info: %s', image, e.message)
    });

    fs.readFile(image, function (err, data) {
        if (err) {
            console.log('read file "%s" error, error info: %s', image, err)
        }
        req.end(data);
    });
};

module.exports = function (filePath, outputPath, callback) {
    converToPng8(filePath, outputPath, callback);
}