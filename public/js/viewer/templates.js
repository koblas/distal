/*
 *  Currently not used, but the idea is to have
 *  templates loaded by RequireJS rather than via
 *  the on-demand approach.  Fundamentally it's a 
 *  performance tradeoff.   But ideally, you could 
 *  preprocess the lot of templates into one pretty
 *  compact file.
 */
define([
    "underscore",
    "text!tmpl/layout.html",
    "text!tmpl/commit.html",
    "text!tmpl/user.html",
    "text!tmpl/repo.html"
], function(_) {
    var tmpl = {};

    _.map([
        'layout', 'user', 'commit', 'repo'
    ], function(key) {
        var t = require("text!tmpl/" + key + ".html");
        tmpl[key] = t;
    });

    return tmpl;
});
