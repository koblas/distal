(function() {
    var _id = 1000;
    function nextId() {
        _id += 1;
        return "distal_" + _id;
    }

    var templateCache = {};

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

        if (root instanceof Backbone.Model) {
            var val = getPath(root.attributes, path, false);
            if (val)
                return val;
        }
        if (root instanceof Backbone.View && root.model !== undefined) {
            var val = getPath(root.model.attributes, path, false);
            if (val)
                return val;
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

    Backbone.Distal = {
        configure: function(opts) {
            _.extend(this, opts);
        },

        //
        //  Fetch a template
        //
        fetch: function(name) {
            return $('#' + tname).html();
        }
    };

    Backbone.Distal.View = Backbone.View.extend({
        templateName: null,
        layoutName: null,

        template: null,

        _childTemplate: null,

        get: function(x) { return getPath(this.model, x, true); },

        super: function() {
            if (this.options.templateName)
                this.templateName = this.options.templateName;
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
                if (item === null || item === undefined) return;
                if (item instanceof Handlebars.SafeString) item = item.toString();
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
                    isRenderData: true,
                    buffer: buffer
                };
            
            var html = this._render(buffer, options);

            if (!this.el) {
                console.log("append", this.el, html);
                this.$el.append(html);
            } else {
                if (this.$el.get(0).tagName == 'BODY') {
                    var $el = $(html);
                    var $body = $(document.body);
                    document.body.innerHTML = $el.html();
                    var b = $el.get(0);
                    _.map(b.attributes, function(idx, attr) {
                        $body.attr(idx.name, idx.value);
                    });
                } else {
                    this.$el.replaceWith(html);
                }
            }

            this._bindViews();
        },

        _bindViews: function() {
            this.setElement($('[data-distal-id=' + this._distal_id + ']'));
            _.each(this._childViews, function(view) {
                view._bindViews();
            });
        },

        /* ViewHelper _render function */
        _render: function(buffer, options) {
            this.preRender();

            var context = this.options.bindingContext || this._context || this;

            var data = {
                view: this,
                buffer: buffer,
                isRenderData: true,
            };

            var elem = this.makeElement(context, {data:data});

            if (!this._template) {
                var template = this.template;

                if (!template) {
                    var tname = this.templateName || this.layoutName;

                    if (tname) 
                        template = Backbone.Distal.fetch(tname);
                }

                if (!template) 
                    template = this.defaultTemplate;

                if (template) {
                    var tmpl;

                    if ((tmpl = templateCache[template]) === undefined) {
                        templateCache[template] = tmpl = Backbone.Distal.Handlebars.compile(template);
                    }
                    this._template = tmpl;
                }
            }

            // var data = this.serializeData();
            // data._view = this;
            if (this._template) {
                var h = this._template(context, {data:data});
                elem.append(h);
            }

            if (!this._distal_id)
                this._distal_id = nextId();
            elem.attr({ 'data-distal-id' : this._distal_id });

            if (options.data.view)
                options.data.view._childViews.push(this);

            if (this._childTemplate) {
                _.map(this._childTemplate, function(tmpl) {
                    var buffer = [];
                    var d2 = {
                        buffer: buffer,
                        view: data.view,
                        isRenderData: true
                    };
                    var v = tmpl(context, { data: d2, view:this });
                    elem.append(v);

                    /*
                    _.each(this.packBuffer(buffer), function(item) {
                        elem.append(item);
                    });
                    */
                }, this);
            }

            return elem.wrap('<div></div>').parent().html();
        }
    });

    Backbone.Distal.CollectionView = Backbone.Distal.View.extend({
        initialize: function() {
            this.super();

            if (this.collection) {
                this.collection.on('reset', this.render, this);
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

            var context = this.options.bindingContext || this._context || this;

            var data = {
                view: this,
                buffer: buffer,
                isRenderData: true,
            };

            var elem = this.makeElement(context, {data:data});

            if (!this._template) {
                var template = this.template;

                if (!template) {
                    var tname = this.templateName || this.layoutName;

                    if (tname) 
                        template = Backbone.Distal.fetch(tname);
                }

                if (!template) 
                    template = this.defaultTemplate;

                if (template) {
                    var tmpl;

                    if ((tmpl = templateCache[template]) === undefined) {
                        templateCache[template] = tmpl = Backbone.Distal.Handlebars.compile(template);
                    }
                    this._template = tmpl;
                }
            }

            // var data = this.serializeData();
            // data._view = this;
            if (this._template) {
                var h = this._template(context, {data:data});
                elem.append(h);
            }

            if (!this._distal_id)
                this._distal_id = nextId();
            elem.attr({ 'data-distal-id' : this._distal_id });

            if (options.data.view)
                options.data.view._childViews.push(this);

            if (this._childTemplate) {
                tmpl = this._childTemplate[0];

                this.collection.each(function (obj) {
                    var buffer = [];
                    var d2 = {
                        buffer: buffer,
                        view: data.view,
                        isRenderData: true
                    };
                    var v = tmpl(obj, { data: d2 });
                    elem.append(v);
                }, this);
            }

            if (this.itemView) {
                this.collection.each(function (obj) {
                    var v = new this.itemView({model: obj});

                    var e = v._render(buffer, options);

                    elem.append(e);

                    if (options.data.view)
                        options.data.view._childViews.push(v);
                }, this);
            }

            return elem.wrap('<div></div>').parent().html();
        }
    })

    //
    //  Layout
    //
    Backbone.Distal.LayoutViewHelper = function() {
        this.initialize.apply(this, arguments);
    };

    _.extend(Backbone.Distal.LayoutViewHelper.prototype, {
        initialize: function(id) {
            this.id = id;
            this.view = null;
        },

        ///
        //  Show a specific view 
        //
        //  For example - The following two statement are the same
        //    layout.main.show(new Backbone.Distal.View({ templateName: 'item_list' }));
        //    layout.main.show('item_list');
        //
        //
        show: function(view, options) {
            options = options || {};

            if (_.isString(view)) {
                var vclass = Backbone.Distal.View.extend(options);
                view = new vclass({ templateName: view });
            }

            if (view !== this.view) {
                // TODO - remove references to view
            }

            if (view == null || view == undefined)
                view = this.view;

            if (view == null) {
                this.view = null;
                return;
            }

            var $el = $(this.id);

            $el.html("<div></div>");
            view.setElement($el.children().get(0));
            view.render();

            this.view = view;
        },

        hide: function() {
            if (this.view && this.view.$el)
                this.view.$el.remove();
        }
    });

    Backbone.Distal.LayoutView = Backbone.Distal.View.extend({
        _regions: null,

        initialize: function(regions) {
            this._regions = regions || this.regions || {};

            _.map(this._regions, function(name, value) {
                this[value] = new Backbone.Distal.LayoutViewHelper(name);
            }, this);

            this.super();
        }
    });

    // Handlebars exentsions...
    //
    Backbone.Distal.Handlebars = Handlebars;

    // Handlebars.JavaScriptCompiler.prototype.namespace = "FrogFood.Handlebars";

    /*
    Handlebars.JavaScriptCompiler.prototype.appendToBuffer = function(string) {
        return "data.buffer.push("+string+");";
    };
    */

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
               viewOptions._childTemplate = [fn];
            }
            viewOptions._parentView = currentView;

            var view = new newView(viewOptions);

            return new Handlebars.SafeString(view._render(options.data.buffer, viewOptions));
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

            return new Handlebars.SafeString(view._render(options.data.buffer, viewOptions));
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

        if (typeof path == "function") {
            context = path.call(this);
        } else {
            context = path;
        }

        if (!context || Handlebars.Utils.isEmpty(context)) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('each', function(context, options) {
        var fn = options.fn, inverse = options.inverse;
        var path = getPath(this, context, true);

        if (typeof path == "function") {
            context = path.call(this);
        } else {
            context = path;
        }

        var ret = "";

        if (context && context.length > 0) {
            for(var i=0, j=context.length; i<j; i++) {
                ret = ret + fn(context[i]);
            }
        } else {
            ret = inverse(this);
        }
        return ret;
    });
})();
