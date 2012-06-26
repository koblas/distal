(function() {
    Todos = {};

    window.Todos = Todos;

    Todos.Todo = Backbone.Model.extend({
        url: '/todo',

        defaults: {
            title: null,
            isDone: false
        }
    });

    Todos.TodoList = Backbone.Collection.extend({
        model: Todos.Todo
    })

    Todos.todoList = new Todos.TodoList();

    Todos.todoList.create({ title: 'Item #1' }, { silent: true })
    Todos.todoList.create({ title: 'Item #2' }), { silent: true }
    Todos.todoList.create({ title: 'Item Fizzle 3' }), { silent: true }

    Todos.StatsView = Backbone.Distal.View.extend({
        initialize: function() {
            this.remaining = 0;

            Todos.todoList.on('change', this.render, this);
            Todos.todoList.on('add', this.render, this);
            this.on('pre_render', this.preRender, this);
        },

        events: {
            'click button' : 'clear_completed'
        },

        preRender: function() {
            this.remaining = Todos.todoList.reduce(function(memo, todo) { 
                                                return memo + (todo.get('isDone') ? 0 : 1);
                                            }, 0);
        },

        clear_completed: function(evt) {
            // This is a funny, the .each() method will abort iteration on modification
            _.each(Todos.todoList.filter(function (todo) {
                return todo.get('isDone');
            }), function (todo) { todo.destroy(); });
        }
    });

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

    Todos.ItemView = Backbone.Distal.View.extend({
        events: {
            'change input' : 'checked'
        },

        initialize: function() {
            this.on('pre_render', this.preRender, this);
        },

        get: function(x) { return this.model.get(x); },

        preRender: function() {
            this.className = null;
            if (this.model.get('isDone'))
                this.className = 'is-done';
        },

        isDone: function() { 
            return this.model.get('isDone');
        },

        checked: function(evt) {
            var v = this.$('input').attr('checked');
            this.model.set({'isDone' : v === 'checked'});
        }
    });

    var AppView = Backbone.Distal.View.extend({
        templateName:  'app_template',

        el: '#app_body',

        events: {
            'change .mark-all-done' : 'all_done'
        },

        all_done: function(evt) {
            var v = $(evt.target).attr('checked');

            Todos.todoList.each(function (item) {
                item.set('isDone', v == 'checked', { silent: true });
            });
            Todos.todoList.trigger('change');
        }
    });

    var app = new AppView();
    app.render();
})();
