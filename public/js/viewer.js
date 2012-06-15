(function() {
    var app = {}, App = app;

    window.App = app;

    // Defining the application router, you can attach sub routers here.
    var AppView = Backbone.Distal.View.extend({
        templateName:  'main_template',

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
            app.router.go("org", this.$(".org").val());
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
            this.super();
            app.router.repos.on('reset', this.render, this);
        },

        count: function() {
            var len = app.router.repos.length;
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

        preRender: function() {
            if (App.router.repos.user == this.model.get('login'))
                this.className = 'active';
        },

        changeUser: function(evt) {
            var org = app.router.users.org;
            var name = this.model.get("login");

            app.router.go("org", org, "user", name);
        }
    });

    /*
     *  Handle the click on a repository
     */
    App.RepoItemView = Backbone.Distal.View.extend({
        events: {
            click: "showCommits"
        },

        preRender: function() {
            if (App.router.commits.repo == this.model.get('name'))
                this.className = 'active';
        },
    
        showCommits: function(ev) {
            var model = this.model;
            var org = app.router.users.org;
            var user = app.router.repos.user;

            this.className = 'active';
            this.render();

            // Easily create a URL.
            app.router.go("org", org, "user", user, "repo", model.get("name"));

            return false;
        },
    });

    /* 
     *  Backbone core of the app.
     */
    var Router = Backbone.Router.extend({
        routes: {
          "": "index",
          "org/:name": "org",
          "org/:org/user/:name": "user",
          "org/:org/user/:user/repo/:name": "repo"
        },

        index: function() {
            var view = new AppView();
            view.render();
          
            // Reset to initial state.
            this.users.reset();
            this.repos.reset();
            this.commits.reset();
        },

        org: function(name) {
            var view = new AppView();
            view.render();

            this.users.org = name;

            // Reset to initial state.
            this.repos.reset();
            this.commits.reset();

            // Set the organization.
            this.users.org = name;

            // Fetch the data.
            this.users.fetch();
        },

        user: function(org, name) {
            var view = new AppView();
            view.render();

            // Reset to initial state.
            this.commits.reset();

            this.commits.user = null;
            this.commits.repo = null;
        
            // Set the organization.
            this.users.org = org;
            // Set the user name.
            this.repos.user = name;

            // Fetch the data
            this.users.fetch();
            this.repos.fetch();
        },

        repo: function(org, user, name) {
            var view = new AppView();
            view.render();

            // Reset to initial state.
            this.commits.reset();

            // Set the organization.
            this.users.org = org;
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
            this.users = new User.Collection();
            // Set the repos.
            this.repos = new Repo.Collection();
            // Set up the commits.
            this.commits = new Commit.Collection();

            App.userList = this.users;
        },

    useLayout: function(name) {
      // If already using this Layout, then don't re-inject into the DOM.
      if (this.layout) {
        return this.layout;
      }

      // Create a new Layout.
      this.layout = new Backbone.Layout({
        template: name,
        className: "layout " + name,
        id: "layout"
      });

      // Insert into the DOM.
      $("#main").html(this.layout.el);

      // Render the layout.
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
        app.router = new Router();

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

})();
