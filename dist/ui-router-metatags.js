/**
 * Metatags for angular-ui-router
 */
var uiroutermetatags;
(function (uiroutermetatags) {
    var appModule = angular.module('ui.router.metatags', ['ui.router']);
    var UIRouterMetatags = (function () {
        /* @ngInject */
        function UIRouterMetatags() {
            this.prefix = '';
            this.suffix = '';
            this.defaultTitle = '';
            this.defaultDescription = '';
            this.defaultKeywords = '';
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
                staticProperties: this.staticProperties,
                enableOGURL: this.enableOGURL
            };
        };
        return UIRouterMetatags;
    })();
    appModule.provider('UIRouterMetatags', UIRouterMetatags);
    var MetaTags = (function () {
        /* @ngInject */
        function MetaTags($log, UIRouterMetatags, $interpolate, $injector, $state, $location, $window) {
            this.$log = $log;
            this.UIRouterMetatags = UIRouterMetatags;
            this.$interpolate = $interpolate;
            this.$injector = $injector;
            this.$state = $state;
            this.$location = $location;
            this.$window = $window;
            this.prerender = {};
        }
        MetaTags.$inject = ["$log", "UIRouterMetatags", "$interpolate", "$injector", "$state", "$location", "$window"];
        MetaTags.prototype.update = function (tags) {
            var _this = this;
            try {
                this.properties = angular.extend({}, this.UIRouterMetatags.staticProperties);
                if (this.UIRouterMetatags.enableOGURL) {
                    this.properties['og:url'] = this.$location.absUrl();
                }
                if (tags) {
                    this.title = tags.title ? this.UIRouterMetatags.prefix + (this.getValue('title', tags.title) || '') + this.UIRouterMetatags.suffix : this.UIRouterMetatags.defaultTitle;
                    this.description = tags.description ? this.getValue('description', tags.description) : this.UIRouterMetatags.defaultDescription;
                    this.keywords = tags.keywords ? this.getValue('keywords', tags.keywords) : this.UIRouterMetatags.defaultKeywords;
                    angular.forEach(tags.properties, function (value, key) {
                        var v = _this.getValue(key, value);
                        if (v) {
                            _this.properties[key] = v;
                        }
                    });
                }
                else {
                    this.title = this.UIRouterMetatags.defaultTitle;
                    this.description = this.UIRouterMetatags.defaultDescription;
                    this.keywords = this.UIRouterMetatags.defaultKeywords;
                }
                if (tags && tags.prerender) {
                    this.prerender.statusCode = tags.prerender.statusCode ? this.getValue('prerender.statusCode', tags.prerender.statusCode) : 200;
                    this.prerender.header = tags.prerender.header ? this.getValue('rerender.header', tags.prerender.header) : null;
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
        MetaTags.prototype.getValue = function (tagType, tag) {
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
                    return this.$injector.invoke(tag, this, this.$state.$current.locals.globals);
                }
                else {
                    return this.$interpolate(tag)(this.$state.$current.locals.globals);
                }
            }
            catch (err) {
                this.$log.error('error occured when trying to get the value of tag:', tagType, err);
                return null;
            }
        };
        return MetaTags;
    })();
    appModule.service('MetaTags', MetaTags);
    /* @ngInject */
    function runBlock($log, $rootScope, MetaTags, $window) {
        $rootScope.MetaTags = MetaTags;
        $rootScope.$on('$stateChangeStart', stateChangeStart);
        $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);
        $rootScope.$on('$stateChangeError', stateChangeError);
        $rootScope.$on('$stateNotFound', stateNotFound);
        function stateChangeStart(event, toState, toParams, from, fromParams) {
            $window.prerenderReady = false;
        }
        function stateChangeSuccess(event, toState) {
            if (!toState.metaTags) {
                $log.debug("MetaTags - route: \"" + toState.name + "\" does not contain any metatags");
            }
            MetaTags.update(toState.metaTags);
        }
        function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
            MetaTags.prerender.statusCode = 500;
            $window.prerenderReady = true;
        }
        function stateNotFound(event, unfoundState, fromState) {
            MetaTags.prerender.statusCode = 404;
            $window.prerenderReady = true;
        }
    }
    runBlock.$inject = ["$log", "$rootScope", "MetaTags", "$window"];
    appModule.run(runBlock);
})(uiroutermetatags || (uiroutermetatags = {}));

//# sourceMappingURL=ui-router-metatags.js.map
