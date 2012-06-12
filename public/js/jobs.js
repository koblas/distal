$(function(){

///  
///
///  Original code...
///
///
/*
var MyApp = new Backbone.Marionette.Application();

MyApp.addInitializer(function(options){
  
  var allJobsView = new AllJobsView({collection: options.jls});
  var experimentalView = new ExperimentalView({collection: options.mls});
      
  MyApp.allJobRegion.show(allJobsView);
  MyApp.experimentalRegion.show(experimentalView);
});

MyApp.addRegions({
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
*/

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

var MiniLayout = Backbone.Model.extend({});

var MiniLayouts = Backbone.Collection.extend({
  model: MiniLayout,
});

var PageTopModel = Backbone.Model.extend({});

/*
 *   Views
 */

var ExperimentalItemView = Backbone.LiveView.extend({
  template: "#experimental-template",
  className: "row-fluid",
});

var ExperimentalView = Backbone.LiveView.extend({
  itemView: ExperimentalItemView
});

var MenuDropdownView = Backbone.LiveView.extend({
  template: "#menudropdown-template",
  
  serializeData: function(){
    var citytitledescription = {
        "city": mydata.cities,
        "title": mydata.titletags,
        "description": mydata.descriptiontags
    };
    return(citytitledescription);
  }
});

var AllJobView = Backbone.LiveView.extend({
  template: "#alljobs-template",
});

var AllJobsView = Backbone.LiveView.extend({
  itemView: AllJobView
});

var AllJobDescriptionView = Backbone.LiveView.extend({
  template: "#alljobs-description-template",
});

var AllJobsDescriptionView = Backbone.LiveView.extend({
  itemView: AllJobDescriptionView
});

var PageJobView = Backbone.LiveView.extend({
  template: "#pagejob-template",
});

var PageJobsView = Backbone.LiveView.extend({
  itemView: PageJobView,
  template: "#pagetop-template",
  
  appendHtml: function(collectionView, itemView){
        collectionView.$("#megustobackbone").append(itemView.el);
  }
});

var MenuHeaderView = Backbone.LiveView.extend({
  template: "#menuheader-template",
});

var DocumentationView = Backbone.LiveView.extend({
  template: "#documentation-template",
});

var NoDataView = Backbone.LiveView.extend({
  template: "#nodata-template",
});

var SubTextView = Backbone.LiveView.extend({
  template: "#subtext-template",
});

var ContentView = Backbone.View.extend({
        // Initialize with the template-id
        initialize: function(view) {
            this.view = view;
        },
    
        //Get the template content and render it into a new div-element
        render: function() {
            var template = $(this.view).html();
            $(this.el).html(template);
            return this;
        }
});
    
/*
Backbone.Marionette.TemplateCache.compileTemplate = function(template) {
    return Handlebars.compile(template);
}
*/

var ApplicationRouter = Backbone.Router.extend({
    initialize: function(options) {
        this.options = options;
        
        this.tab01View = new ContentView('#tab01');
        this.tab02View = new ContentView('#tab02');
        this.tab03View = new ContentView('#tab03');
        this.tab04View = new ContentView('#tab04');
        this.tab05View = new ContentView('#tab05');
        this.notFoundView = new ContentView('#not-found');
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

        var view = new MenuHeaderView({model: mypagetop});
        $('#menuheader').html(view.render());

        /*
        MyApp.menuheaderView = new MenuHeaderView({model: mypagetop});
        MyApp.menuHeaderRegion.show(MyApp.menuheaderView);
        
        MyApp.menuDropdownView = new MenuDropdownView({});
        MyApp.menuDropdownRegion.show(MyApp.menuDropdownView);
        
        MyApp.noDataView = new NoDataView({});
        MyApp.contentRegion.show(MyApp.noDataView);        
        */
    },
    
    tab02: function() {
        this.setActiveEntry('#tab02');

        var mypagetop = new PageTopModel({menuheader: 'Complete List of Jobs'}); 

        var view = new MenuHeaderView({model: mypagetop});
        $('#menuheader').html(view.render());

        /*
        MyApp.menuheaderView = new MenuHeaderView({model: mypagetop});
        MyApp.menuHeaderRegion.show(MyApp.menuheaderView);
        
        MyApp.noDataView = new NoDataView({});
        MyApp.menuDropdownRegion.show(MyApp.noDataView);
        
        MyApp.tab04View  = new AllJobsView({collection: this.options.jls});
        MyApp.contentRegion.show(MyApp.tab04View);           
        */
    },
    
    tab03: function() {
        this.setActiveEntry('#tab03');

        var mypagetop = new PageTopModel({menuheader: 'Complete List of Jobs with Descriptions'}); 
        MyApp.menuheaderView = new MenuHeaderView({model: mypagetop});
        MyApp.menuHeaderRegion.show(MyApp.menuheaderView);
        
        MyApp.noDataView = new NoDataView({});
        MyApp.menuDropdownRegion.show(MyApp.noDataView);
        
        MyApp.tab04View  = new AllJobsDescriptionView({collection: this.options.jls});
        MyApp.contentRegion.show(MyApp.tab04View);
    },

    tab04: function() {
        this.setActiveEntry('#tab04');
        
        var mypagetop = new PageTopModel({menuheader: 'Experimental Section'}); 
        MyApp.menuheaderView = new MenuHeaderView({model: mypagetop});
        MyApp.menuHeaderRegion.show(MyApp.menuheaderView);
        
        MyApp.subtextView = new SubTextView({});
        MyApp.menuDropdownRegion.show(MyApp.subtextView);
        
        MyApp.tab05View  = new ExperimentalView({collection: this.options.jls});
        MyApp.contentRegion.show(MyApp.tab05View);        
        
    },
    
    tab05: function() {
        this.setActiveEntry('#tab05');
        
        var mypagetop = new PageTopModel({menuheader: 'Details about the Project'}); 
        MyApp.menuheaderView = new MenuHeaderView({model: mypagetop});
        MyApp.menuHeaderRegion.show(MyApp.menuheaderView);
        
        MyApp.subtextView = new SubTextView({});
        MyApp.menuDropdownRegion.show(MyApp.subtextView);
        
        MyApp.tab05View  = new DocumentationView({});
        MyApp.contentRegion.show(MyApp.tab05View);
    },    
    
    cities: function(params) {
        
        var subset = cityFilter(this.options.jls,params);
        
        var mypagetop = new PageTopModel({menuheader: params}); 
        MyApp.menuheaderView = new MenuHeaderView({model: mypagetop});
        MyApp.menuHeaderRegion.show(MyApp.menuheaderView);
        
        MyApp.menuDropdownView = new MenuDropdownView({});
        MyApp.menuDropdownRegion.show(MyApp.menuDropdownView);
        
        MyApp.citiesView  = new PageJobsView({collection: subset, model: mypagetop});
        MyApp.contentRegion.show(MyApp.citiesView);
    },
    
    titles: function(params) {
        
        var subset = tagTitleFilter(this.options.jls,params);
        
        var mypagetop = new PageTopModel({menuheader: params}); 

        /*
        MyApp.menuheaderView = new MenuHeaderView({model: mypagetop});
        MyApp.menuHeaderRegion.show(MyApp.menuheaderView);
        
        MyApp.menuDropdownView = new MenuDropdownView({});
        MyApp.menuDropdownRegion.show(MyApp.menuDropdownView);
        
        MyApp.titlesView  = new PageJobsView({collection: subset, model: mypagetop});
        MyApp.contentRegion.show(MyApp.titlesView);
        */
    },
    
    descriptions: function(params) {
        
        var subset = tagDescriptionFilter(this.options.jls,params);
        
        var mypagetop = new PageTopModel({menuheader: params}); 
        MyApp.menuheaderView = new MenuHeaderView({model: mypagetop});
        MyApp.menuHeaderRegion.show(MyApp.menuheaderView);
        
        MyApp.menuDropdownView = new MenuDropdownView({});
        MyApp.menuDropdownRegion.show(MyApp.menuDropdownView);
        
        MyApp.descriptionsView  = new PageJobsView({collection: subset, model: mypagetop});
        MyApp.contentRegion.show(MyApp.descriptionsView);
    },
    
    notFound: function() {
        this.switchView(this.notFoundView);
    }
});

// this takes in a collection and returns a subset of the collection 
// with only models that match the specific city
function cityFilter(collection,city) {
    
    var sendback = new Backbone.Collection();
    
    for (i = 0; i < collection.length; i++) {
        var model = collection.at(i);
        if(model.attributes.city == city) {
            sendback.push(model);
        }
    }
    return sendback;
}

// this takes in a collection and returns a subset of the collection 
// with only models that match the specific title tag
function tagTitleFilter(collection,tag) {
    
    var sendback = new Backbone.Collection();
    
    for (i = 0; i < collection.length; i++) {
        var model = collection.at(i);
        if(model.attributes.titletags == tag) {
            sendback.push(model);
        }
    }
    return sendback;
}

// this takes in a collection and returns a subset of the collection 
// with only models that match the specific description tag
function tagDescriptionFilter(collection,tag) {
    
    var sendback = new Backbone.Collection();
    
    for (i = 0; i < collection.length; i++) {
        var model = collection.at(i);
        if(model.attributes.descriptiontags == tag) {
            sendback.push(model);
        }
    }
    return sendback;
}
 
  var myjobs = mydata.data;
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
  // MyApp.start({jls: jls});
  
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
