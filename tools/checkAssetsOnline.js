//
//  Usage:
//    node checkAssetsOnline.js
//

(function(){var e={};var p,k;p=this;if(p!=null){k=p.async}e.noConflict=function(){p.async=k;return e};function r(v){var w=false;return function(){if(w){throw new Error("Callback was already called.")}w=true;v.apply(p,arguments)}}var s=function(v,x){if(v.forEach){return v.forEach(x)}for(var w=0;w<v.length;w+=1){x(v[w],w,v)}};var a=function(v,x){if(v.map){return v.map(x)}var w=[];s(v,function(y,A,z){w.push(x(y,A,z))});return w};var u=function(v,x,w){if(v.reduce){return v.reduce(x,w)}s(v,function(y,A,z){w=x(w,y,A,z)});return w};var c=function(x){if(Object.keys){return Object.keys(x)}var w=[];for(var v in x){if(x.hasOwnProperty(v)){w.push(v)}}return w};if(typeof process==="undefined"||!(process.nextTick)){if(typeof setImmediate==="function"){e.setImmediate=setImmediate;e.nextTick=setImmediate}else{e.setImmediate=e.nextTick;e.nextTick=function(v){setTimeout(v,0)}}}else{e.nextTick=process.nextTick;if(typeof setImmediate!=="undefined"){e.setImmediate=setImmediate}else{e.setImmediate=e.nextTick}}e.each=function(v,x,y){y=y||function(){};if(!v.length){return y()}var w=0;s(v,function(z){x(z,r(function(A){if(A){y(A);y=function(){}}else{w+=1;if(w>=v.length){y(null)}}}))})};e.forEach=e.each;e.eachSeries=function(v,y,z){z=z||function(){};if(!v.length){return z()}var x=0;var w=function(){y(v[x],function(A){if(A){z(A);z=function(){}}else{x+=1;if(x>=v.length){z(null)}else{w()}}})};w()};e.forEachSeries=e.eachSeries;e.eachLimit=function(v,w,y,z){var x=g(w);x.apply(null,[v,y,z])};e.forEachLimit=e.eachLimit;var g=function(v){return function(w,A,C){C=C||function(){};if(!w.length||v<=0){return C()}var z=0;var x=0;var y=0;(function B(){if(z>=w.length){return C()}while(y<v&&x<w.length){x+=1;y+=1;A(w[x-1],function(D){if(D){C(D);C=function(){}}else{z+=1;y-=1;if(z>=w.length){C()}else{B()}}})}})()}};var q=function(v){return function(){var w=Array.prototype.slice.call(arguments);return v.apply(null,[e.each].concat(w))}};var o=function(v,w){return function(){var x=Array.prototype.slice.call(arguments);return w.apply(null,[g(v)].concat(x))}};var m=function(v){return function(){var w=Array.prototype.slice.call(arguments);return v.apply(null,[e.eachSeries].concat(w))}};var h=function(y,v,x,z){var w=[];v=a(v,function(A,B){return{index:B,value:A}});y(v,function(A,B){x(A.value,function(D,C){w[A.index]=C;B(D)})},function(A){z(A,w)})};e.map=q(h);e.mapSeries=m(h);e.mapLimit=function(v,w,x,y){return d(w)(v,x,y)};var d=function(v){return o(v,h)};e.reduce=function(v,w,x,y){e.eachSeries(v,function(z,A){x(w,z,function(C,B){w=B;A(C)})},function(z){y(z,w)})};e.inject=e.reduce;e.foldl=e.reduce;e.reduceRight=function(v,w,x,z){var y=a(v,function(A){return A}).reverse();e.reduce(y,w,x,z)};e.foldr=e.reduceRight;var t=function(y,v,x,z){var w=[];v=a(v,function(A,B){return{index:B,value:A}});y(v,function(A,B){x(A.value,function(C){if(C){w.push(A)}B()})},function(A){z(a(w.sort(function(C,B){return C.index-B.index}),function(B){return B.value}))})};e.filter=q(t);e.filterSeries=m(t);e.select=e.filter;e.selectSeries=e.filterSeries;var l=function(y,v,x,z){var w=[];v=a(v,function(A,B){return{index:B,value:A}});y(v,function(A,B){x(A.value,function(C){if(!C){w.push(A)}B()})},function(A){z(a(w.sort(function(C,B){return C.index-B.index}),function(B){return B.value}))})};e.reject=q(l);e.rejectSeries=m(l);var f=function(x,v,w,y){x(v,function(z,A){w(z,function(B){if(B){y(z);y=function(){}}else{A()}})},function(z){y()})};e.detect=q(f);e.detectSeries=m(f);e.some=function(v,w,x){e.each(v,function(y,z){w(y,function(A){if(A){x(true);x=function(){}}z()})},function(y){x(false)})};e.any=e.some;e.every=function(v,w,x){e.each(v,function(y,z){w(y,function(A){if(!A){x(false);x=function(){}}z()})},function(y){x(true)})};e.all=e.every;e.sortBy=function(v,w,x){e.map(v,function(y,z){w(y,function(A,B){if(A){z(A)}else{z(null,{value:y,criteria:B})}})},function(A,y){if(A){return x(A)}else{var z=function(E,D){var C=E.criteria,B=D.criteria;return C<B?-1:C>B?1:0};x(null,a(y.sort(z),function(B){return B.value}))}})};e.auto=function(C,B){B=B||function(){};var z=c(C);if(!z.length){return B(null)}var w={};var y=[];var v=function(D){y.unshift(D)};var x=function(E){for(var D=0;D<y.length;D+=1){if(y[D]===E){y.splice(D,1);return}}};var A=function(){s(y.slice(0),function(D){D()})};v(function(){if(c(w).length===z.length){B(null,w);B=function(){}}});s(z,function(E){var D=(C[E] instanceof Function)?[C[E]]:C[E];var I=function(L){var J=Array.prototype.slice.call(arguments,1);if(J.length<=1){J=J[0]}if(L){var K={};s(c(w),function(M){K[M]=w[M]});K[E]=J;B(L,K);B=function(){}}else{w[E]=J;e.setImmediate(A)}};var G=D.slice(0,Math.abs(D.length-1))||[];var F=function(){return u(G,function(K,J){return(K&&w.hasOwnProperty(J))},true)&&!w.hasOwnProperty(E)};if(F()){D[D.length-1](I,w)}else{var H=function(){if(F()){x(H);D[D.length-1](I,w)}};v(H)}})};e.waterfall=function(y,x){x=x||function(){};if(y.constructor!==Array){var v=new Error("First argument to waterfall must be an array of functions");return x(v)}if(!y.length){return x()}var w=function(z){return function(C){if(C){x.apply(null,arguments);x=function(){}}else{var A=Array.prototype.slice.call(arguments,1);var B=z.next();if(B){A.push(w(B))}else{A.push(x)}e.setImmediate(function(){z.apply(null,A)})}}};w(e.iterator(y))()};var b=function(w,y,x){x=x||function(){};if(y.constructor===Array){w.map(y,function(z,A){if(z){z(function(C){var B=Array.prototype.slice.call(arguments,1);if(B.length<=1){B=B[0]}A.call(null,C,B)})}},x)}else{var v={};w.each(c(y),function(z,A){y[z](function(C){var B=Array.prototype.slice.call(arguments,1);if(B.length<=1){B=B[0]}v[z]=B;A(C)})},function(z){x(z,v)})}};e.parallel=function(w,v){b({map:e.map,each:e.each},w,v)};e.parallelLimit=function(x,v,w){b({map:d(v),each:g(v)},x,w)};e.series=function(x,w){w=w||function(){};if(x.constructor===Array){e.mapSeries(x,function(y,z){if(y){y(function(B){var A=Array.prototype.slice.call(arguments,1);if(A.length<=1){A=A[0]}z.call(null,B,A)})}},w)}else{var v={};e.eachSeries(c(x),function(y,z){x[y](function(B){var A=Array.prototype.slice.call(arguments,1);if(A.length<=1){A=A[0]}v[y]=A;z(B)})},function(y){w(y,v)})}};e.iterator=function(w){var v=function(x){var y=function(){if(w.length){w[x].apply(null,arguments)}return y.next()};y.next=function(){return(x<w.length-1)?v(x+1):null};return y};return v(0)};e.apply=function(w){var v=Array.prototype.slice.call(arguments,1);return function(){return w.apply(null,v.concat(Array.prototype.slice.call(arguments)))}};var n=function(y,v,w,z){var x=[];y(v,function(B,A){w(B,function(C,D){x=x.concat(D||[]);A(C)})},function(A){z(A,x)})};e.concat=q(n);e.concatSeries=m(n);e.whilst=function(x,v,w){if(x()){v(function(y){if(y){return w(y)}e.whilst(x,v,w)})}else{w()}};e.doWhilst=function(v,x,w){v(function(y){if(y){return w(y)}if(x()){e.doWhilst(v,x,w)}else{w()}})};e.until=function(x,v,w){if(!x()){v(function(y){if(y){return w(y)}e.until(x,v,w)})}else{w()}};e.doUntil=function(v,x,w){v(function(y){if(y){return w(y)}if(!x()){e.doUntil(v,x,w)}else{w()}})};e.queue=function(z,x){if(x===undefined){x=1}function v(B,A,D,C){if(A.constructor!==Array){A=[A]}s(A,function(E){var F={data:E,callback:typeof C==="function"?C:null};if(D){B.tasks.unshift(F)}else{B.tasks.push(F)}if(B.saturated&&B.tasks.length===x){B.saturated()}e.setImmediate(B.process)})}var w=0;var y={tasks:[],concurrency:x,saturated:null,empty:null,drain:null,push:function(A,B){v(y,A,false,B)},unshift:function(A,B){v(y,A,true,B)},process:function(){if(w<y.concurrency&&y.tasks.length){var B=y.tasks.shift();if(y.empty&&y.tasks.length===0){y.empty()}w+=1;var C=function(){w-=1;if(B.callback){B.callback.apply(B,arguments)}if(y.drain&&y.tasks.length+w===0){y.drain()}y.process()};var A=r(C);z(B.data,A)}},length:function(){return y.tasks.length},running:function(){return w}};return y};e.cargo=function(z,y){var v=false,A=[];var w={tasks:A,payload:y,saturated:null,empty:null,drain:null,push:function(B,C){if(B.constructor!==Array){B=[B]}s(B,function(D){A.push({data:D,callback:typeof C==="function"?C:null});if(w.saturated&&A.length===y){w.saturated()}});e.setImmediate(w.process)},process:function x(){if(v){return}if(A.length===0){if(w.drain){w.drain()}return}var B=typeof y==="number"?A.splice(0,y):A.splice(0);var C=a(B,function(D){return D.data});if(w.empty){w.empty()}v=true;z(C,function(){v=false;var D=arguments;s(B,function(E){if(E.callback){E.callback.apply(null,D)}});x()})},length:function(){return A.length},running:function(){return v}};return w};var i=function(v){return function(x){var w=Array.prototype.slice.call(arguments,1);x.apply(null,w.concat([function(z){var y=Array.prototype.slice.call(arguments,1);if(typeof console!=="undefined"){if(z){if(console.error){console.error(z)}}else{if(console[v]){s(y,function(A){console[v](A)})}}}}]))}};e.log=i("log");e.dir=i("dir");e.memoize=function(z,x){var w={};var y={};x=x||function(A){return A};var v=function(){var A=Array.prototype.slice.call(arguments);var C=A.pop();var B=x.apply(null,A);if(B in w){C.apply(null,w[B])}else{if(B in y){y[B].push(C)}else{y[B]=[C];z.apply(null,A.concat([function(){w[B]=arguments;var F=y[B];delete y[B];for(var E=0,D=F.length;E<D;E++){F[E].apply(null,arguments)}}]))}}};v.memo=w;v.unmemoized=z;return v};e.unmemoize=function(v){return function(){return(v.unmemoized||v).apply(null,arguments)}};e.times=function(y,x,z){var v=[];for(var w=0;w<y;w++){v.push(w)}return e.map(v,x,z)};e.timesSeries=function(y,x,z){var v=[];for(var w=0;w<y;w++){v.push(w)}return e.mapSeries(v,x,z)};e.compose=function(){var v=Array.prototype.reverse.call(arguments);return function(){var x=this;var w=Array.prototype.slice.call(arguments);var y=w.pop();e.reduce(v,w,function(A,B,z){B.apply(x,A.concat([function(){var D=arguments[0];var C=Array.prototype.slice.call(arguments,1);z(D,C)}]))},function(A,z){y.apply(x,[A].concat(z))})}};var j=function(y,w){var x=function(){var A=this;var z=Array.prototype.slice.call(arguments);var B=z.pop();return y(w,function(D,C){D.apply(A,z.concat([C]))},B)};if(arguments.length>2){var v=Array.prototype.slice.call(arguments,2);return x.apply(this,v)}else{return x}};e.applyEach=q(j);e.applyEachSeries=m(j);e.forever=function(w,x){function v(y){if(y){if(x){return x(y)}throw y}w(v)}v()};p.async=e}());

var path = require('path'),
    fs   = require('fs'),
    http = require('http'),
    Url  = require('url'),
    Buffer  = require('buffer').Buffer,
//应用目录下可能有多个assetshubs
    assetshubs,
//最终错误结果
    errorTips = [];

function _checkModulesExist(gconfig, appconfig){

    gconfig = gconfig || {};
    appconfig = appconfig || {};

    var modules = merge(gconfig.modules, appconfig.modules);
    var packages = merge(gconfig.packages, appconfig.packages);

    var urls = [];
    var allowPub = true;

    //@todo 没有modules情况
    for(var i in modules){
        if( i!=="mui/seed" ){
            var modPath = i.split('/');
            var pkgName;
            if(modPath.length > 1){
                pkgName = modPath[0];
            }else{
                pkgName = 'default';
            }

            var pkg = packages[pkgName];
            if(!pkg){
                pkg = packages['default'];
            }

            if(modules[i].path){
                urls.push(Url.resolve(pkg.path, modules[i].path));
            }else{
                var modfile = i.replace(pkgName+'/', '') + '.js';
                urls.push(Url.resolve(pkg.path, modfile));
            }
        }
    }

    console.log('开始检测...');

    async.eachLimit(urls, 5, function(url, callback){
        var meta = Url.parse(url);
        http.get({
            hostname: meta.hostname,
            port: meta.port,
            path: meta.path,
            agent: false
        }, function(res){
            if(res.statusCode != 200){
                errorTips.push(res.statusCode + ' ' + url);
                allowPub = false;
            }else{
                console.log(res.statusCode + ' ' + url);
            }
            callback();
        });
    }, function(err){
        if(errorTips.length){
            showResult();
        }else{
            console.log('检测通过！');
        }
    });
}

function showResult(){
    if(!showResult._count) showResult._count = 0;
    showResult._count++;
    if(showResult._count == assetshubs.length){
        console.log('以下文件未发布到线上，请仔细检查！');
        errorTips.forEach(function(r){
            console.log(r);
        });
        process.exit(1);
    }
}

function merge(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

/**
 * 递归遍历出当前应用目录下的assetshub目录
 * @param  {String} basepath 要遍历的根目录
 * @param  {String} needle   目录名中所带的字符串
 * @return {Array}
 */
function findPaths(basepath, needle){
    var dirs = fs.readdirSync(basepath);
    for(var i = 0, len = dirs.length; i < len; i++){
        var item = dirs[i];
        item = path.resolve(basepath, item);
        var stat = fs.statSync(item);
        if(stat.isDirectory()){
            if(~item.indexOf(needle)){
                if(!findPaths._dest) findPaths._dest = [];
                findPaths._dest.push(item);
            }else{
                findPaths(item, needle);
            }
        }
    }
    return findPaths._dest;
}

var args = process.argv;

if(args[2] == 'checkvm' || args[2] == 'checkcfg'){
    var root = path.resolve();
}else{
    var root = args[2] || path.resolve();
}


console.log('查找assetshub目录...');
assetshubs = findPaths(root, 'assetshub');

if(assetshubs && assetshubs.length){
    console.log('当前应用存在的assetshub目录：');
    console.log(assetshubs);
    for(var i = 0, len = assetshubs.length; i < len; i++){
        var p = assetshubs[i];

        var gconfigFile = path.join(p, 'gconfig.vm');
        var appconfigFile = path.join(p, 'appconfig.vm');

        var gconfig, appconfig;

        try{
            console.log('解析gconfig.vm文件...');
            if(fs.existsSync(gconfigFile)){
                gconfig =fs.readFileSync(gconfigFile, 'utf-8');
                gconfig = JSON.parse(gconfig);
            }else{
                console.log('木有gconfig.vm文件');
            }

            console.log('解析appconfig.vm文件...');
            if(fs.existsSync(appconfigFile)){
                appconfig =fs.readFileSync(appconfigFile, 'utf-8');
                appconfig = JSON.parse(appconfig);
            }else{
                console.log('木有appconfig.vm文件');
            }

        }catch(e){
            console.log('gconfig.vm或appconfig.vmjson格式解析错误，详细信息是:');
            console.log(e);
            process.exit(1);
        }

        _checkModulesExist(gconfig, appconfig);

    }
}else{
    console.log('当前应用下不存在assetshub目录，木有检测！');
}