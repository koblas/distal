distal
======

View Abstraction for Backbone.JS

Inspired by EmberJS building a better view abstraction for BackboneJS. 

There are three sample apps currently built, which I'm using as a test bed for how to approach things.

* Todo - Really a basic app, based on the EmberJS ToDo app trying to demonstrate good simple
abstractions for how things can plug together

* GithubViewer - Based on the Layoutmanager, while I'm not focusing on using layouts in my version it 
does try and give a good example of what an app might look like (uses RequireJS for parts).

* Jobs - Based on the Backbone.Marioneete Jobs app, this is more an exploration on how to do 
layouts.  As of this writing not 100% happy with what's there, but it's a framework to start from.  
Currently noticing long langs in startup and in render switching (probably means I've got a performance bug).

Test Server Usage
-----------------

It's a python/tornado server, so you'll need python and tornado installed.  Simple as:

    ./server.py
    # By default it run on 9000, if you want you can say --port=NNNN for a different port

If you need tornado you should be able to do a ``pip install tornado`` or ``easy_install tornado``, but if that fails, look http://www.tornadoweb.org/ for additonal help.

Example
-------

Image a template that looked like this and some JavaScript that follows.  Instead of doing the
whole process of defining the template wiring it up doing a bunch of creation we can do 
something as simple as focus on what we want to accomplish.

From the [index.html](distal/blob/master/public/index.html) file

```handlebars
    <script type="text/x-handlebars" id="app_template">
    {{view Todos.CreateTodoView id="new-todo" placeholder="What needs to be done?"}}

    <!-- Insert this after the CreateTodoView and before the collection. -->
    {{#view Todos.StatsView id="stats"}}
      <button class="sc-button">Clear Completed Todos</button>
    {{remaining}} remaining
    {{/view}}

    <label>
      {{view Lv.Checkbox class="mark-all-done"}}
      <span class="">Mark All as Done</span>
    </label>

    {{#collection Todos.todoList tagName="ul"}}
      {{#view Todos.ItemView model=this tagName="li"}}
        <div class="sc-checkbox">
          <label><input {{#if isDone }}checked="checked"{{/if}} type="checkbox">{{get title}}</label>
        </div>
      {{/view}}
    {{/collection}}
    </script>
```

--

From the [todo.js](distal/blob/master/public/js/todo.js) file

```JavaScript
    Todos.CreateTodoView = Backbone.Distal.TextField.extend({
        events: {
            'keydown' : 'create',
        },

        create: function(evt) {
            if (evt.keyCode != 13)
                return;

            var value = this.$el.val();

            if (value) {
                Todos.todoList.create({ title: value });
                this.$el.val('');
            }
        }
    });
```
   

Credits
-------

Some of these were inspiration, some were just learning and getting and idea of how to approach
different problems with Backbone.

  * EmberJS - http://emberjs.com/
  * Backbone.Layout - https://github.com/tbranyen/backbone.layoutmanager
  * Backbone.Marionette - https://github.com/derickbailey/backbone.marionette
  * EmberJS Todo - http://emberjs.com/examples/todos/ - Sample EmberJS Todo Application
  * Jobs App - https://github.com/stormabq/jobs - Michael Angerman's sample jobs app
