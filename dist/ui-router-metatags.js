/**
 * Metatags for angular-ui-router
 */
var uiroutermetatags;
(function (uiroutermetatags) {
    runBlockTransitions.$inject = ["$log", "MetaTags", "$window", "$transitions"];
    var appModule = angular.module('ui.router.metatags', ['ui.router']);
    var UIRouterMetatags = (function () {
        /* @ngInject */
        function UIRouterMetatags() {
            this.prefix = '';
            this.suffix = '';
            this.defaultTitle = '';
            this.defaultDescription = '';
            this.defaultKeywords = '';
            this.defaultRobots = '';
            this.staticProperties = {};
            this.enableOGURL = false;
        }
        UIRouterMetatags.prototype.setTitlePrefix = function (prefix) {
            this.prefix = prefix;
            return this;
        };
        UIRouterMetatags.prototype.setTitleSuffix = function (suffix) {
            this.suffix = suffix;
            return this;
        };
        UIRouterMetatags.prototype.setDefaultTitle = function (title) {
            this.defaultTitle = title;
            return this;
        };
        UIRouterMetatags.prototype.setDefaultDescription = function (description) {
            this.defaultDescription = description;
            return this;
        };
        UIRouterMetatags.prototype.setDefaultKeywords = function (keywords) {
            this.defaultKeywords = keywords;
            return this;
        };
        UIRouterMetatags.prototype.setDefaultRobots = function (robots) {
            this.defaultRobots = robots;
            return this;
        };
        UIRouterMetatags.prototype.setStaticProperties = function (properties) {
            this.staticProperties = properties;
            return this;
        };
        UIRouterMetatags.prototype.setOGURL = function (enabled) {
            this.enableOGURL = enabled;
            return this;
        };
        UIRouterMetatags.prototype.$get = function () {
            return {
                prefix: this.prefix,
                suffix: this.suffix,
                defaultTitle: this.defaultTitle,
                defaultDescription: this.defaultDescription,
                defaultKeywords: this.defaultKeywords,
                defaultRobots: this.defaultRobots,
                staticProperties: this.staticProperties,
                enableOGURL: this.enableOGURL
            };
        };
        return UIRouterMetatags;
    }());
    appModule.provider('UIRouterMetatags', UIRouterMetatags);
    var MetaTags = (function () {
        /* @ngInject */
        MetaTags.$inject = ["$log", "UIRouterMetatags", "$interpolate", "$injector", "$state", "$location", "$window", "$uiRouterGlobals"];
        function MetaTags($log, UIRouterMetatags, $interpolate, $injector, $state, $location, $window, $uiRouterGlobals) {
            this.$log = $log;
            this.UIRouterMetatags = UIRouterMetatags;
            this.$interpolate = $interpolate;
            this.$injector = $injector;
            this.$state = $state;
            this.$location = $location;
            this.$window = $window;
            this.$uiRouterGlobals = $uiRouterGlobals;
            this.prerender = {};
        }
        MetaTags.prototype.update = function (tags, transition) {
            var _this = this;
            try {
                /*
                    This hack is used to resolve the lack of "this.$state.$current.locals.globals".
                    Here the resolved object is builded with all previews resolved data
                */
                var resolved = {};
                var tokens = transition.getResolveTokens();
                tokens.forEach(function (token) { return resolved[token] = transition.injector().get(token); });
                this.properties = angular.extend({}, this.UIRouterMetatags.staticProperties);
                if (this.UIRouterMetatags.enableOGURL) {
                    this.properties['og:url'] = this.$location.absUrl();
                }
                if (tags) {
                    this.title = tags.title ? this.UIRouterMetatags.prefix + (this.getValue('title', tags.title, resolved) || '') + this.UIRouterMetatags.suffix : this.UIRouterMetatags.defaultTitle;
                    this.description = tags.description ? this.getValue('description', tags.description, resolved) : this.UIRouterMetatags.defaultDescription;
                    this.keywords = tags.keywords ? this.getValue('keywords', tags.keywords, resolved) : this.UIRouterMetatags.defaultKeywords;
                    this.robots = tags.robots ? this.getValue('robots', tags.robots, resolved) : this.UIRouterMetatags.defaultRobots;
                    angular.forEach(tags.properties, function (value, key) {
                        var v = _this.getValue(key, value, resolved);
                        if (v) {
                            _this.properties[key] = v;
                        }
                    });
                }
                else {
                    this.title = this.UIRouterMetatags.defaultTitle;
                    this.description = this.UIRouterMetatags.defaultDescription;
                    this.keywords = this.UIRouterMetatags.defaultKeywords;
                    this.robots = this.UIRouterMetatags.defaultRobots;
                }
                if (tags && tags.prerender) {
                    this.prerender.statusCode = tags.prerender.statusCode ? this.getValue('prerender.statusCode', tags.prerender.statusCode, resolved) : 200;
                    this.prerender.header = tags.prerender.header ? this.getValue('rerender.header', tags.prerender.header, resolved) : null;
                }
                else {
                    this.prerender.statusCode = 200;
                    this.prerender.header = null;
                }
                this.$window.prerenderReady = true;
            }
            catch (err) {
                this.$log.error('error occured when extracting metatags:', err);
            }
        };
        MetaTags.prototype.getValue = function (tagType, tag, resolved) {
            try {
                if (!tag) {
                    return null;
                }
                else if (typeof tag === 'number') {
                    return tag;
                }
                else if (typeof tag === 'string' && tag.trim().length === 0) {
                    return null;
                }
                else if (angular.isFunction(tag) || Array.isArray(tag)) {
                    return this.$injector.invoke(tag, this, resolved);
                }
                else {
                    return this.$interpolate(tag)(resolved);
                }
            }
            catch (err) {
                this.$log.error('error occured when trying to get the value of tag:', tagType, err);
                return null;
            }
        };
        return MetaTags;
    }());
    appModule.service('MetaTags', MetaTags);
    /* @ngInject */
    function runBlockTransitions($log, MetaTags, $window, $transitions) {
        $transitions.onStart({}, onStart);
        $transitions.onSuccess({}, onSuccess);
        $transitions.onError({}, onError);
        function onStart(transition) {
            $window.prerenderReady = false;
        }
        function onSuccess(transition) {
            var toState = transition.$to();
            var fromState = transition.$from();
            if (!toState.metaTags) {
                $log.debug("MetaTags - route: \"" + toState.name + "\" does not contain any metatags");
            }
            MetaTags.update(toState.metaTags, transition);
        }
        function onError(transition) {
            MetaTags.prerender.statusCode = 500;
            $window.prerenderReady = true;
        }
    }
    appModule.run(runBlockTransitions);
})(uiroutermetatags || (uiroutermetatags = {}));

//# sourceMappingURL=ui-router-metatags.js.map
