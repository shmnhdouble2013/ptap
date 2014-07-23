require('colors');

var fs = require('fs');
var argv    = require('optimist').argv;

var DAILY_BLACK_LIST = [
        'http://static.pinganfang.com'
    ],
    DAILY_REG = new RegExp( DAILY_BLACK_LIST.join('|') );


var DEBUGCODE = [
        'console.',
        'debug'
    ],
    DEBUGCODE_REG = new RegExp( DEBUGCODE.join('|'), 'i' );

module.exports = {
    containDailyUrl: function(content){
        return DAILY_REG.test(content);
    },
    containDebugCode: function(content){
        return DEBUGCODE_REG.test(content);
    }
}