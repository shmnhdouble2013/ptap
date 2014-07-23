/**
 * @file if 工具集入口
 * @author huangjia@pinganfang.com
 * @Date  201407
 */

var sync = require('./if-sync.js');
var serv = require('./if-server.js');

exports.ifSync = sync.ifSync;
exports.ifInit = sync.ifInit;
exports.ifServer = serv.ifServer;