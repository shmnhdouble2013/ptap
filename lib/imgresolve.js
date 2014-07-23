var fs = require('fs'),
    path = require('path'),
    colors = require('colors');

var argv = require('optimist').argv;

var Analyzer = {
    urlArrReg: /url\s*\(\s*(?!(?:[\"\']*)http(?:s*):\/\/).+?\s*\)/ig,
    urlReg: /url\((.+?)\)/i,
    pkgName: '',
    version: '',
    group: 'tm',
    getRelativeUrl: function(str){
        var res = str.match(this.urlReg);
        return res[1];
    },
    getResolveUrl: function(rel){
        var ab = path.resolve(this.pkgPath, this.pkgName, rel);
        var arr = ab.split(this.pkgName);
        var file = arr[1];
        return 'url('+path.normalize(this.onlineUrl+file).replace('\\', '/') + ')';
    },
    process: function(content){

        this.version = argv.v;

        if(this.version){
            var input = content;
            var urls = input.match(this.urlArrReg);

            this.pkgPath = path.resolve('./');
            var pArr = this.pkgPath.split(path.sep);
            this.pkgName = pArr[pArr.length-1];


            this.onlineUrl = path.normalize('/'+this.group+'/'+this.pkgName+'/'+this.version+'/').replace('\\', '/');

            if(urls && urls.length){
                console.log('[info]'.grey+'图片需要替换相对路径，映射到线上地址:'+this.onlineUrl);

                urls.forEach(function(url){
                    if(url.indexOf('data:') == -1){
                        var rel = Analyzer.getRelativeUrl(url);
                        var res = Analyzer.getResolveUrl(rel);
                        console.log('[resolve]'.yellow+url+'==>'+res);
                        input = input.replace(url, res);
                    }
                });

                return input;
            }
        }
    }
};

/**
 *
 * @param file 文件路径
 */
module.exports = function(content){
   return Analyzer.process(content)||content;
}