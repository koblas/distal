distal
======

View Abstraction for Backbone.JS

Inspired by EmberJS building a better view abstraction for BackboneJS. 


Example
-------

Image a template that looked like this and some JavaScript that follows.  Instead of doing the
whole process of defining the template wiring it up doing a bunch of creation we can do 
something as simple as focus on what we want to accomplish.

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
  * Backbone.Layout - 
  * Backbone.Marionette - 
  
