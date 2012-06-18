// Set the require.js configuration for your application.
require.config({
    deps: ["viewer"],

    paths: {
        //
        // JavaScript folders
        text: "../vendor/text",
        libs: "../vendor",

        // Libraries
        jquery: "../vendor/jquery",
        underscore: "../vendor/underscore",
        backbone: "../vendor/backbone",
        "backbone.collectioncache": "../vendor/backbone.collectioncache",
        handlebars: "../vendor/handlebars",
        bootstrap: "../vendor/bootstrap",
        distal: "../backbone.distal"
    },

    shim: {
        underscore: {
            exports: '_'
        },
        distal: {
            deps: ['backbone', 'handlebars'],
            exports: "Backbone.Distal"
        },
        handlebars: {
            exports: 'Handlebars'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});
