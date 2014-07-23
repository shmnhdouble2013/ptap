/**
 * Created with IntelliJ IDEA.
 * User: xiaohao
 * Date: 13-3-26
 * Time: 下午9:53
 * To change this template use File | Settings | File Templates.
 */

module.exports = function(data, space) {
    var seen = [];
    return JSON.stringify(data, function (key, val) {
        if (!val || typeof val !== 'object') {
            return val;
        }
        if (seen.indexOf(val) !== -1) {
            return '[Circular]';
        }
        seen.push(val);
        return val;
    }, space);
};