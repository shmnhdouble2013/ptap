/**
 * version control
 *
 * support svn, git...
 */

var svn = require('./svn');
var git = require('./git');
exports.name = 'cvs';

exports.beforeAsync = svn.beforeAsync;
exports.getRepositoryURL = svn.getRepositoryURL;
exports.getRevision = svn.getRevision;


/*
    ��ȡ���root��·��
 */
exports.getRelativePath =  function(path, callback, errCallback){
    git.getRepositoryURL(path, function(path){
          var rPath = path.match(/:(.*)\.git$/i);
        if(rPath){
            callback(rPath[1]);
        }else{
            errCallback();
        }
    }, errCallback);
};
