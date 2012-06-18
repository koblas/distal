define([
  // Libs
  "backbone",
  "underscore"
], function (Backbone, _) {
    var Commit = { }, Repo = { }, User = {};

    Commit.Model = Backbone.Model.extend({
        defaults: function() {
            return {
                commit: {}
            };
        }
    });

    Commit.Collection = Backbone.Collection.extend({
        model: Commit.Model,

        cache: true,

        url: function() {
            return "https://api.github.com/repos/" + this.user + "/" + this.repo + "/commits?callback=?";
        },

        parse: function(obj) {
            // Safety check ensuring only valid data is used
            if (obj.data.message !== "Not Found") {
                return obj.data;
            }

            return this.models;
        },

        initialize: function(models, options) {
            if (options) {
                this.user = options.user;
                this.repo = options.repo;
            }
        }
    });

    Repo.Collection = Backbone.Collection.extend({
        url: function() {
            return "https://api.github.com/users/" + this.user + "/repos?callback=?";
        },

        cache: true,

        parse: function(obj) {
            // Safety check ensuring only valid data is used
            if (obj.data.message !== "Not Found") {
                return obj.data;
            }

            return this.models;
        },

        initialize: function(models, options) {
            if (options) {
                this.user = options.user;
            }
        },

        comparator: function(repo) {
            return -new Date(repo.get("pushed_at"));
        }
    });

    User.Collection = Backbone.Collection.extend({
        url: function() {
            return "https://api.github.com/orgs/" + this.org + "/members?callback=?";
        },

        cache: true,

        parse: function(obj) {
            // Safety check ensuring only valid data is used
            if (obj.data.message !== "Not Found") {
                this.status = "valid";

                return obj.data;
            }

            this.status = "invalid";

            return this.models;
        },

        initialize: function(models, options) {
            if (options) {
                this.org = options.org;
            }
        }
    });

    return {
        Commit: Commit,
        Repo: Repo,
        User: User
    };
});
