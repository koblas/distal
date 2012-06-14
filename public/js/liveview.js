(function() {
    var _id = 1000;
    function nextId() {
        _id += 1;
        return "distal_" + _id;
    }

    function get(obj, keyName) {
        if (keyName === undefined && 'string' === typeof obj) {
            keyName = obj;
            obj = Ember;
        }

        if (!obj) return undefined;
            var ret = obj[keyName];
            if (ret===undefined && 'function'===typeof obj.unknownProperty) {
                ret = obj.unknownProperty(keyName);
        }
        return ret;
    };

    function getPath(root, path, _checkGlobal) {
        if (root == null) {
            root = window;
            _checkGlobal = false;
        }

        var idx = 0;
        var len = path.length;

        for (idx = 0; root && path && idx < len; idx = next + 1) {
            if ((next = path.indexOf('.', idx)) < 0)
                next = len;

            var key = path.slice(idx, next);
            root = get(root, key);
        }

        if (!root && _checkGlobal)
            root = getPath(window, path, false);
        return root;
    };

    Backbone.Distal = {};

    Backbone.Distal.View = Backbone.View.extend({
        templateName: null,
        layoutName: null,

        template: null,

        _childTemplate: null,

        super: function() {
            if (this.options.template)
                this.template = this.options.template;
            if (this.options._childTemplate)
                this._childTemplate = this.options._childTemplate;
            this._childViews = [];
        },

        initialize: function() {
            this.super();
        },

        serializeData: function(){
          var data;

          if (this.model) { 
            data = this.model.toJSON(); 
          }
          else if (this.collection) {
            data = { items: this.collection.toJSON() };
          }

          // data = this.mixinTemplateHelpers(data);

          return data;
        },

        makeElement: function() {
            var el = document.createElement(this.tagName);
            var $el = $(el);

            var attr = { 'class' : '' };
            var clist = [];

            if (this.id)
                attr['id'] = this.id;
            if (this.className)
                clist.push(this.className);
            if (this.classNames) {
                _.each(this.classNames, function(k) {
                    clist.push(k);
                });
            }
            if (clist.length != 0)
                attr['class'] = clist.join(' ');

            if (this.attributeBindings) {
                _.each(this.attributeBindings, function(k) {
                    if (this[k])
                        attr[k] = this[k];
                }, this);
            }
            $el.attr(attr);

            return $el;
        },

        // Combine string in a buffer...
        // 
        packBuffer: function(buffer) {
            var prevString = false;
            var result = [];

            _.each(buffer || [], function (item) {
                var isstr = (typeof item === "string");

                if (!prevString || !isstr) {
                    result.push(item);
                    prevString = isstr;
                } else {
                    result[result.length-1] = result[result.length-1] + item;
                }
            });

            return result;
        },

        preRender: function() {},

        /*
         * General render function that will get called by developers
         */
        render: function() {
            var buffer = [],
                options = {
                    data: {},
                    buffer: buffer
                };
            
            this._render(buffer, options);

            var result = this.packBuffer(buffer);

            if (!this.el)
                this.$el.append(result[0]);
            else
                this.$el.replaceWith(result[0]);

            this._bindViews();
        },

        _bindViews: function() {
            this.setElement($('[data-distal-id=' + this._distal_id + ']'));
            _.each(this._childViews, function(view) {
                view._bindViews();
            });
        },

        _render: function(buffer, options) {
            this.preRender();

            if (!this._template) {
                var template = this.template;

                if (!template) {
                    var tname = this.templateName || this.layoutName;

                    if (tname) 
                        template = $('#' + tname).html();
                }
                if (!template) 
                    template = this.defaultTemplate;

                if (template) {
                    this._template = Backbone.Distal.Handlebars.compile(template);
                } else {
                    this._template = this.makeElement;
                }
            }

            if (!this._template) 
                return;

            var context = this.options.bindingContext || this._context || this;

            var data = {
                view: this,
                buffer: buffer,
                isRenderData: true,
                // keywords: keywords
            };

            // var data = this.serializeData();
            // data._view = this;
            var h = this._template(context, {data:data});
            if (!(h instanceof $)) {
                h = $(h);
            }

            if (!this._distal_id)
                this._distal_id = nextId();
            h.attr({ 'data-distal-id' : this._distal_id });

            if (options.data.view)
                options.data.view._childViews.push(this);

            if (this._childTemplate) {
                _.map(this._childTemplate, function(tmpl) {
                    var buffer = [];
                    var d2 = {
                        buffer: buffer,
                        view: data.view
                    };
                    var v = tmpl(context, { data: d2, view:this });

                    _.each(this.packBuffer(buffer), function(item) {
                        h.append(item);
                    });
                }, this);
            }

            // return (h instanceof $) ? h.html() : h;

            if (h instanceof $)
                buffer.push(h.wrap('<div></div>').parent().html());
            else
                buffer.push(h);
        }
    });

    Backbone.Distal.CollectionView = Backbone.Distal.View.extend({
        initialize: function() {
            this.super();

            if (this.collection) {
                this.collection.on('add', this.render, this);
                this.collection.on('change', this.render, this);
                this.collection.on('remove', this.render, this);
            }
        },

        on_change: function() {
            // console.log("Backbone.Distal.CollectionView change event");
            this.rerender();
        },

        _render: function(buffer, options) {
            this.preRender();

            // console.log("collection render");

            var context = this.options.bindingContext || this._context || this;

            var data = {
                view: this,
                buffer: buffer,
                isRenderData: true,
                // keywords: keywords
            };

            this._template = this.makeElement;
            var h = this._template(context, {data:data});
            if (!(h instanceof $))
                h = $(h);

            if (!this._distal_id)
                this._distal_id = nextId();
            h.attr({ 'data-distal-id' : this._distal_id });

            if (options.data.view)
                options.data.view._childViews.push(this);

            if (this._childTemplate) {
                tmpl = this._childTemplate[0];

                this.collection.each(function (obj) {
                    var buffer = [];
                    var d2 = {
                        buffer: buffer,
                        view: data.view
                    };
                    var v = tmpl(obj, { data: d2 });
                    // console.log(buffer);

                    _.each(this.packBuffer(buffer), function(item) {
                        h.append(item);
                    });
                }, this);
            }

            if (h instanceof $)
                buffer.push(h.wrap('<div></div>').parent().html());
            else
                buffer.push(h);
        }
    })

    // Handlebars exentsions...
    //
    Backbone.Distal.Handlebars = Handlebars;

    // Handlebars.JavaScriptCompiler.prototype.namespace = "FrogFood.Handlebars";

    Handlebars.JavaScriptCompiler.prototype.appendToBuffer = function(string) {
        return "data.buffer.push("+string+");";
    };

    Backbone.Distal.Handlebars.compile = function(string) {
        var ast = Handlebars.parse(string);
        var options = { data: true, stringParams: true };
        var environment = new Handlebars.Compiler().compile(ast, options);
        var templateSpec = new Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);

        return Handlebars.template(templateSpec);
    };

    Handlebars.JavaScriptCompiler.prototype.appendEscaped = function() {
        /*
        var opcode = this.nextOpcode(1), extra = "";
        this.context.aliases.escapeExpression = 'this.escapeExpression';

        if (opcode[0] === 'appendContent') {
            extra = this.quotedString(opcode[1][0]);
            this.eat(opcode);
        }

        this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
        if (extra != '')
            this.source.push(extra);
        */
        this.source.push(this.appendToBuffer("Backbone.Distal.escapeIfNeeded(" + this.popStack() + ")"));
    };

    Backbone.Distal.escapeIfNeeded = function(val) {
        if (val instanceof $)
            return val;
        return Handlebars.Utils.escapeExpression(val);
    };

    var ViewHelper = {
        helper: function(thisContext, path, options) {
            var inverse = options.inverse,
                data = options.hash,
                view = data.view,
                fn = options.fn,
                hash = options.hash,
                newView;

            // console.log("ViewPath = ", path);
            if ('string' === typeof path) {
                newView = getPath(thisContext, path, true);
                // Ember.assert("Unable to find view at path '" + path + "'", !!newView);
            } else {
                newView = path;
            }

            // Ember.assert(Ember.String.fmt('You must pass a view class to the #view helper, not %@ (%@)', [path, newView]), Ember.View.detect(newView));

            newView = ViewHelper.viewClassFromHTMLOptions(newView, options, thisContext);
            var currentView = thisContext.view;
            var viewOptions = {
                templateData: options.data,
                model: data.model,
                view: options.data.view,
                collection: data.collection,
                data: options.data
            };

            viewOptions.templateData = options.data;

            if (fn) {
                // Ember.assert("You cannot provide a template block if you also specified a templateName", !get(viewOptions, 'templateName') && !get(newView.proto(), 'templateName'));
               viewOptions._childTemplate = [fn];
            }
            viewOptions._parentView = currentView;

            var view = new newView(viewOptions);
            // console.log(view);

            var h = view._render(options.data.buffer, viewOptions);
            // currentView.$el.append(view.render(view, viewOptions));
            return h;
        },

        viewClassFromHTMLOptions: function(viewClass, options, thisContext) {
            var hash = options.hash, data = options.data;
            var extensions = {}, classes = hash['class'], dup = false;

            if (hash.id) {
                extensions.id = hash.id;
                dup = true;
            }

            if (classes) {
                classes = classes.split(' ');
                extensions.classNames = classes;
                dup = true;
            }

            if (hash.classBinding) {
                extensions.classNameBindings = hash.classBinding.split(' ');
                dup = true;
            }

            if (hash.classNameBindings) {
                extensions.classNameBindings = hash.classNameBindings.split(' ');
                dup = true;
            }

            if (hash.attributeBindings) {
                // Ember.assert("Setting 'attributeBindings' via Handlebars is not allowed. Please subclass Ember.View and set it there instead.");
                extensions.attributeBindings = null;
                dup = true;
            }

            if (dup) {
                hash = _.extend({}, hash);
                delete hash.id;
                delete hash['class'];
                delete hash.classBinding;
            }

            // Look for bindings passed to the helper and, if they are
            // local, make them relative to the current context instead of the
            // view.
            var path, normalized;

            for (var prop in hash) {
                if (!hash.hasOwnProperty(prop)) 
                    continue;

                // Test if the property ends in "Binding"
                /*
                if (Ember.IS_BINDING.test(prop)) {
                    path = hash[prop];

                    normalized = Ember.Handlebars.normalizePath(null, path, data);
                    if (normalized.isKeyword) {
                        hash[prop] = 'templateData.keywords.'+path;
                    } else if (!Ember.isGlobalPath(path)) {
                        if (path === 'this') {
                            hash[prop] = 'bindingContext';
                        } else {
                            hash[prop] = 'bindingContext.'+path;
                        }
                    }
                }
                */
            }

            // Make the current template context available to the view
            // for the bindings set up above.
            extensions.bindingContext = thisContext;

            //console.log("HASH", hash);
            //console.log("EXT", extensions);

            // return viewClass.extend(hash, extensions);
            return viewClass.extend(_.extend({}, hash, extensions));
        }
    };

    Handlebars.registerHelper('view', function(path, options) {
        // console.log("VIEW", this, arguments.length, path, options);

        // If no path is provided, treat path param as options.
        if (path && path.data && path.data.isRenderData) {
            options = path;
            path = "Backbone.Distal.View";
        }

        return ViewHelper.helper(this, path, options);
    });

    // **************************************************************
    //
    
    Handlebars.registerHelper('collection', function(path, options) {
        // console.log("COLLECTION", this, arguments.length, path, options);

        // If no path is provided, treat path param as options.
        if (path && path.data && path.data.isRenderData) {
            options = path;
            path = "Backbone.Distal.CollectionView";
        }

        return CollectionHelper.helper(this, path, options);
    });

    var CollectionHelper = {
        helper: function(thisContext, path, options) {
            var inverse = options.inverse,
                data = options.hash,
                view = data.view,
                fn = options.fn,
                hash = options.hash,
                collection;

            if ('string' === typeof path) {
                collection = getPath(thisContext, path, true);
                // Ember.assert("Unable to find view at path '" + path + "'", !!newView);
            } else {
                collection = path;
            }

            newView = ViewHelper.viewClassFromHTMLOptions(Backbone.Distal.CollectionView, 
                                                            options, thisContext);

            var currentView = thisContext.view;
            var viewOptions = {
                view: options.data.view,
                templateData: options.data,
                data: options.data,
                collection: collection
            };

            viewOptions.templateData = options.data;

            if (fn) {
               viewOptions._childTemplate = [fn];
            }
            viewOptions._parentView = currentView;

            var view = new newView(viewOptions);

            return view._render(options.data.buffer, viewOptions);
        }
    };


    // **************************************************************
    var bind = function(property, options, preserveContext, shouldDisplay, valueNormalizer) {
        var data = options.data,
              fn = options.fn,
         inverse = options.inverse,
            view = data.view,
            ctx  = this,
            normalized;

        // normalized = Ember.Handlebars.normalizePath(ctx, property, data);
        var path = getPath(ctx, property, true);

        data.buffer.push(getPath(this, property, options));
    }

    Handlebars.registerHelper('if', function(context, options) {
        var path = getPath(this, context, true);

        context = path.call(this);

        if (!context || Handlebars.Utils.isEmpty(context)) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
   });
})();
