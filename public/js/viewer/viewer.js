require([
  // Global
  "app",

  // Libs
  "jquery",
  "underscore",
  "backbone",
  
  // Modules
  "models",
  // NOT USED - "templates",

  // Extras
  "distal",
  "bootstrap"
],

function (app, $, _, Backbone, Models) {
    var App = {};

    //
    // This needs to be promoted to the "Window" level since we currently don't have
    // a way to register "namespaces" in Distal
    // 
    window.App = App;

    // Defining the application router, you can attach sub routers here.
    var AppView = Backbone.Distal.View.extend({
        templateName:  'main_template',

        id: 'main',

        el: '#main'
    });

    /*
     *  Top portion of the view where we have a search box
     *  and the Individual users.
     */
    App.UserInputView = Backbone.Distal.View.extend({
        events: {
            'submit' : 'submit'
        },

        submit: function(evt) {
            App.router.go("org", this.$(".org").val());
            return false;
        }
    });

    /*
     *  This could be a default view - since there are no events tied to it
     *     {{view class="container-fluid well" templateName="user_template" }}
     */
    App.UserView = Backbone.Distal.View.extend({
        templateName:  'user_template',
    });

    /*
     *  Show the list of repositories
     */
    App.RepoView = Backbone.Distal.View.extend({
        templateName:  'repo_template',

        initialize: function() {
            App.router.repos.on('reset', this.render, this);
        },

        count: function() {
            var len = App.router.repos.length;
            return len == 0 ? false : (len + "");
        }
    });

    /*
     *  Handle the click on a user
     */
    App.UserItemView = Backbone.Distal.View.extend({
        events: {
            click : 'changeUser'
        },

        active: function() {
            return App.router.repos.user == this.model.get('login');
        },

        changeUser: function(evt) {
            var org = App.router.users.org;
            var name = this.model.get("login");

            this.$el.parent().find('.btn-primary').removeClass('btn-primary').addClass('btn-info');
            this.$('button').removeClass('btn-info').addClass('btn-primary');
            this.render();

            App.router.go("org", org, "user", name);
        }
    });

    /*
     *  Handle the click on a repository
     */
    App.RepoItemView = Backbone.Distal.View.extend({
        events: {
            click: "showCommits"
        },

        initialize: function() {
            this.on('pre_render', this.preRender, this);
        },

        preRender: function() {
            if (App.router.commits.repo == this.model.get('name'))
                this.className = 'active';
        },
    
        showCommits: function(ev) {
            var model = this.model;
            var org = App.router.users.org;
            var user = App.router.repos.user;

            this.className = 'active';
            this.$el.parent().find('.active').removeClass('active');
            this.render();

            // Easily create a URL.
            App.router.go("org", org, "user", user, "repo", model.get("name"));

            return false;
        },
    });

    /* 
     *  Backbone core of the App.
     */
    var Router = Backbone.Router.extend({
        routes: {
          "": "index",
          "org/:name": "org",
          "org/:org/user/:name": "user",
          "org/:org/user/:user/repo/:name": "repo"
        },

        index: function() {
            var view = this.useLayout();
          
            // Reset to initial state.
            this.users.reset();
            this.repos.reset();
            this.commits.reset();
        },

        org: function(org) {
            // Set the organization.
            this.users.org = org;

            var view = this.useLayout();

            // Reset to initial state.
            this.repos.reset();
            this.commits.reset();

            // Fetch the data.
            this.users.fetch();
        },

        user: function(org, name) {
            this.users.org = org;

            var view = this.useLayout();

            // Reset to initial state.
            this.commits.reset();

            this.commits.user = null;
            this.commits.repo = null;
        
            // Set the user name.
            this.repos.user = name;

            // Fetch the data
            this.users.fetch();
            this.repos.fetch();
        },

        repo: function(org, user, name) {
            this.users.org = org;

            var view = this.useLayout();

            // Reset to initial state.
            this.commits.reset();

            // Set the user name.
            this.repos.user = user;
            // Set the repo name
            this.commits.user = user;
            this.commits.repo = name;

            // Fetch the data
            this.users.fetch();
            this.repos.fetch();
            this.commits.fetch();
        },

        // Shortcut for building a url.
        go: function() {
          return this.navigate(_.toArray(arguments).join("/"), true);
        },

        initialize: function() {
            // Set up the users.
            this.users = new Models.User.Collection();
            // Set the repos.
            this.repos = new Models.Repo.Collection();
            // Set up the commits.
            this.commits = new Models.Commit.Collection();
        },

        useLayout: function(name) {
            //
            // If already using this Layout, then don't re-inject into the DOM.
            if (this.layout) 
                return this.layout;

            this.layout = new AppView();
            this.layout.render();

            return this.layout;
        }
    });

    // Treat the jQuery ready function as the entry point to the application.
    // Inside this function, kick-off all initialization, everything up to this
    // point should be definitions.
    $(function() {
        // Define your master router on the application namespace and trigger all
        // navigation from this instance.
        App.router = new Router();

        // Trigger the initial route and enable HTML5 History API support
        Backbone.history.start({ hashChange: true });
    });

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router. If the link has a `data-bypass`
  // attribute, bypass the delegation completely.
  $(document).on("click", "a:not([data-bypass])", function(evt) {
    // Get the anchor href and protcol
    var href = $(this).attr("href");
    var protocol = this.protocol + "//";

    // Ensure the protocol is not part of URL, meaning it's relative.
    if (href && href.slice(0, protocol.length) !== protocol &&
        href.indexOf("javascript:") !== 0) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events. The Router's internal `navigate` method
      // calls this anyways.
      Backbone.history.navigate(href, true);
    }
  });
});
