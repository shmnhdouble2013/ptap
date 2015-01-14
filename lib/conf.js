var path = require('path'),
    fs   = require('fs'),
    util = require('./util');

var CONFIG_FILE = util.getUserHome() + '.ptaprc',
    _config;

var _parseConf = function(){
    if(fs.existsSync(CONFIG_FILE)){
        var file = fs.readFileSync(CONFIG_FILE);
        _config = JSON.parse(file);
    }else{
        _config = {};
    }
    return _config;
};

var _saveConf = function(conf){
    conf = conf || _config;

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(conf));

    //console.log(CONFIG_FILE+'--0777')
    //fs.chmodSync(CONFIG_FILE,0777);
};

module.exports = {
    load: function(){
        return _parseConf();
    },
    save: _saveConf
};
