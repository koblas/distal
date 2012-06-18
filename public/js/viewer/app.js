define([
  // Libs
  "jquery",
  "underscore",
  "backbone",
  "distal"
],

function($, _, Backbone) {
    return {
        // Create a custom object with a nested Views object
        module: function(additionalProps) {
            return _.extend({ Views: {} }, additionalProps);
        },

        // Keep active application instances namespaced under an app object.
        app: _.extend({}, Backbone.Events)
    };
});
