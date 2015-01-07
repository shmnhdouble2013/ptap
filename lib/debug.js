
var argv    = require('optimist').argv,
    colors  = require('colors');

module.exports = function(){
    if(argv.d){
        for(var i = 0, len = arguments.length; i < len; i++){
            console.log('[debug]'.blue, arguments[i])
        }
    }
}