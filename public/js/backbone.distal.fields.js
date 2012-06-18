(function() {

    Backbone.Distal.TextField = Backbone.Distal.View.extend({
        classNames: ['liveview-text-field'],
        tagName: "input",

        attributeBindings: ['type', 'value', 'size', 'placeholder', 'disabled', 'maxlength'],

        value: "",
        type: "text",
        size: null,

        placeholder: null,
        disabled: false,
        maxlength: null,
    });


    Backbone.Distal.Checkbox = Backbone.Distal.View.extend({
        classNames: ['liveview-checkbox'],

        tagName: 'input',

        attributeBindings: ['type', 'checked', 'disabled'],

        type: "checkbox",
        checked: false,
        disabled: false,

            /*
        initialize: function() {
            if (this.title !== '' || this.title !== undefined) {
                this.tagName = undefined;
                this.attributeBindings = [];
                this.defaultTemplate = '<label><input type="checkbox" checked="checked" disabled="disabled">{{title}}</label>';
            }
        },
            */

        /*
        events: {
            'click' : 'change'
        },

        change: function() {
            this.checked = this.$el.val();
            // TODO - should this fire an event?
        }
        */
    });

    Backbone.Distal.Button = Backbone.Distal.View.extend({
        classNames: ['liveview-button'],

        tagName: 'button',

        attributeBindings: ['type', 'checked', 'disabled'],

        checked: false,
        disabled: false,

        /*
        events: {
            'click' : 'change'
        },

        change: function() {
            this.checked = this.$el.val();
            // TODO - should this fire an event?
        }
        */
    });

    window.Df = {};

    window.Df.Button = Backbone.Distal.Button;
    window.Df.Checkbox = Backbone.Distal.Checkbox;
    window.Df.TextField = Backbone.Distal.TextField;

})();
