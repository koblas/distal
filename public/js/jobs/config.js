// Set the require.js configuration for your application.
require.config({
    deps: ["main"],

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
        "backbone-localstorage": "../vendor/backbone-localstorage",
        handlebars: "../vendor/handlebars",
        showdown: "../vendor/showdown",
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
        showdown: {
            exports: 'Showdown'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        "backbone-localstorage": {
            deps: ['backbone'],
            exports: 'Store'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});
