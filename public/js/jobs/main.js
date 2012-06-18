require([
  // Libs
  "jquery",
  "underscore",
  "backbone",
  "backbone-localstorage",
  "showdown",
  "dataset",
  
  // Extras
  "distal",
  "bootstrap"
],

function ($, _, Backbone, Store, Showdown, Dataset) {
    // The dataset just stuffs everything into a global variable
    //  pretend that it's well behaved.
    //
    Dataset = mydata;

    var layout = new Backbone.Distal.LayoutView({
                        allJobRegion: "#alljobcontent",
                        experimentalRegion: "#experimentalcontent",
                        menuHeaderRegion: "#menuheader",
                        menuDropdownRegion: "#menudropdown",
                        contentRegion: "#content",
                        tab1: "#tab01",
                        tab2: "#tab02",
                        tab3: "#tab03",
                        tab4: "#tab04",
                        tab5: "#tab05",
                    });

/*
 *   Models
 */
var Job = Backbone.Model.extend({});

var Jobs = Backbone.Collection.extend({
  model: Job,
  localStorage: new Store("backbone-jobs"),
  
  initialize: function(jobs){
    _.each(jobs, function(job,number) {
    });
    
    this.on('add', function(job){
      if( ! job.get('uuid') ){
        var error =  Error("Job must have a uuid defined before being added to the collection");
        error.name = "NoUuidError";
        throw error;
      }
    });
  }
});

var PageTopModel = Backbone.Model.extend({});

/*
 *   Views
 */

var ExperimentalItemView = Backbone.Distal.View.extend({
    templateName: "experimental-template",
    className: "row-fluid",
});

var ExperimentalView = Backbone.Distal.CollectionView.extend({
    itemView: ExperimentalItemView
});

var MenuDropdownView = Backbone.Distal.View.extend({
    templateName: "menudropdown-template",

    cities: function() { return Dataset.cities },
    title: function() { return Dataset.titletags },
    description: function() { return Dataset.descriptiontags }
});

var AllJobView = Backbone.Distal.View.extend({
    templateName: "alljobs-template",
});

var AllJobsView = Backbone.Distal.CollectionView.extend({
    itemView: AllJobView
});

var AllJobDescriptionView = Backbone.Distal.View.extend({
    templateName: "alljobs-description-template",
});

var AllJobsDescriptionView = Backbone.Distal.CollectionView.extend({
    itemView: AllJobDescriptionView
});

var PageJobView = Backbone.Distal.View.extend({
    templateName: "pagejob-template",
});

var PageJobsView = Backbone.Distal.CollectionView.extend({
    itemView: PageJobView,
    templateName: "pagetop-template"
});

var MenuHeaderView = Backbone.Distal.View.extend({
  templateName: "menuheader-template"
});

var DocumentationView = Backbone.Distal.View.extend({
    templateName: "documentation-template",
});

var NoDataView = Backbone.Distal.View.extend({
    templateName: "nodata-template",
});

var SubTextView = Backbone.Distal.View.extend({
    templateName: "subtext-template",
});

var ApplicationRouter = Backbone.Router.extend({
    initialize: function(options) {
        this.options = options;
    },
    
    routes: {
        "": "tab01",
        "tab01": "tab01",
        "tab02": "tab02",
        "tab03": "tab03",
        "tab04": "tab04",
        "tab05": "tab05",
        "city/:query": "cities",
        "title/:query": "titles",
        "description/:query": "descriptions",
        "*else": "notFound"
    },
    
    /*
     * Change the active element in the topbar 
     */
    setActiveEntry: function(url) {
        // Unmark all entries
        $('li').removeClass('active');

        // Mark active entry
        $("li a[href='" + url + "']").parents('li').addClass('active');
    },
    
    tab01: function() {
        this.setActiveEntry('#tab01');
        
        var mypagetop = new PageTopModel({menuheader: 'Select a City or Tag from the Dropdowns'}); 

        layout.menuHeaderRegion.show(new MenuHeaderView({model: mypagetop}));
        layout.menuDropdownRegion.show(new MenuDropdownView({}));
        layout.contentRegion.show(new NoDataView({}));
    },
    
    tab02: function() {
        this.setActiveEntry('#tab02');

        var mypagetop = new PageTopModel({menuheader: 'Complete List of Jobs'}); 

        layout.menuHeaderRegion.show(new MenuHeaderView({model: mypagetop}));
        layout.menuDropdownRegion.show(new NoDataView({}));
        layout.contentRegion.show(new AllJobsView({collection: this.options.jls}));
    },
    
    tab03: function() {
        this.setActiveEntry('#tab03');

        var mypagetop = new PageTopModel({menuheader: 'Complete List of Jobs with Descriptions'}); 

        layout.menuHeaderRegion.show(new MenuHeaderView({model: mypagetop}));
        layout.menuDropdownRegion.show(new NoDataView({}));
        layout.contentRegion.show(new AllJobsDescriptionView({collection: this.options.jls}));
    },

    tab04: function() {
        this.setActiveEntry('#tab04');
        
        var mypagetop = new PageTopModel({menuheader: 'Experimental Section'}); 

        layout.menuHeaderRegion.show(new MenuHeaderView({model: mypagetop}));
        layout.menuDropdownRegion.show(new SubTextView({}));
        layout.contentRegion.show(new ExperimentalView({collection: this.options.jls}));
        
    },
    
    tab05: function() {
        this.setActiveEntry('#tab05');
        
        var mypagetop = new PageTopModel({menuheader: 'Details about the Project'}); 

        layout.menuHeaderRegion.show(new MenuHeaderView({model: mypagetop}));
        layout.menuDropdownRegion.show(new SubTextView({}));
        layout.contentRegion.show(new DocumentationView({}));
    },    
    
    cities: function(params) {
        var subset = cityFilter(this.options.jls, params);

        var mypagetop = new PageTopModel({menuheader: params}); 

        layout.menuHeaderRegion.show(new MenuHeaderView({model: mypagetop}));
        layout.menuDropdownRegion.show(new MenuDropdownView({}));
        layout.contentRegion.show(new PageJobsView({collection: subset, model: mypagetop}));
    },
    
    titles: function(params) {
        
        var subset = tagTitleFilter(this.options.jls,params);
        
        var mypagetop = new PageTopModel({menuheader: params}); 

        layout.menuHeaderRegion.show(new MenuHeaderView({model: mypagetop}));
        layout.menuDropdownRegion.show(new MenuDropdownView({}));
        layout.contentRegion.show(new PageJobsView({collection: subset, model: mypagetop}));
    },
    
    descriptions: function(params) {
        var subset = tagDescriptionFilter(this.options.jls,params);
        
        var mypagetop = new PageTopModel({menuheader: params}); 

        layout.menuHeaderRegion.show(new MenuHeaderView({model: mypagetop}));
        layout.menuDropdownRegion.show(new MenuDropdownView({}));
        layout.contentRegion.show(new PageJobsView({collection: subset, model: mypagetop}));
    },
    
    notFound: function() {
        this.switchView(this.notFoundView);
    }
});

// this takes in a collection and returns a subset of the collection 
// with only models that match the specific city
function cityFilter(collection,city) {
    var sendback = new Backbone.Collection();
    
    collection.map(function(model) {
        if (model.attributes.city == city)
            sendback.push(model);
    });

    return sendback;
}

// this takes in a collection and returns a subset of the collection 
// with only models that match the specific title tag
function tagTitleFilter(collection,tag) {
    var sendback = new Backbone.Collection();
    
    collection.map(function(model) {
        if (model.attributes.titletags == tag)
            sendback.push(model);
    });

    return sendback;
}

// this takes in a collection and returns a subset of the collection 
// with only models that match the specific description tag
function tagDescriptionFilter(collection,tag) {
    var sendback = new Backbone.Collection();

    collection.map(function(model) {
        if (model.attributes.descriptiontags == tag)
            sendback.push(model);
    });

    return sendback;
}
 
    var myjobs = Dataset.data;
    var qls = [];

    var converter = new Showdown.converter();
  
    _.each(myjobs, function(job) {
        qls.push(new Job({uuid: job.uuid, title: job.title, url: job.url, 
                        description: converter.makeHtml(job.description), city: job.options.city, 
                        titletags: job.options.titletags[0],
                        descriptiontags: job.options.descriptiontags[0]}));
    });
  
    var jls = new Jobs(qls);
  
    var myoptions = {};
    myoptions.el = $('#content');
    myoptions.jls = jls;
  
    var router = new ApplicationRouter(myoptions);
    Backbone.history.start();
  
    jls.add(new Job({
        uuid: 15132,
        title: 'Sample Title for a job you may be advertising',
        description: 'Explain to the people why the job you are advertising for is so cool',
        url: 'http://documentcloud.github.com/backbone/',
        city: 'buenos aires',
        titletags: 'sample',
        descriptiontags: 'advertising'
    }));
});
