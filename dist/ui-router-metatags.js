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
    uiroutermetatags.UIRouterMetatags = UIRouterMetatags;
    appModule.provider('UIRouterMetatags', UIRouterMetatags);
    var MetaTags = (function () {
        /* @ngInject */
        function MetaTags($log, UIRouterMetatags, $interpolate, $injector, $state, $location) {
            this.$log = $log;
            this.UIRouterMetatags = UIRouterMetatags;
            this.$interpolate = $interpolate;
            this.$injector = $injector;
            this.$state = $state;
            this.$location = $location;
        }
        MetaTags.$inject = ["$log", "UIRouterMetatags", "$interpolate", "$injector", "$state", "$location"];
        MetaTags.prototype.update = function (tags) {
            var _this = this;
            this.properties = this.UIRouterMetatags.staticProperties;
            if (this.UIRouterMetatags.enableOGURL) {
                this.properties['og:url'] = this.$location.absUrl();
            }
            if (tags) {
                this.title = tags.title ? this.UIRouterMetatags.prefix + (this.getValue(tags.title) || '') + this.UIRouterMetatags.suffix : this.UIRouterMetatags.defaultTitle;
                this.description = tags.description ? this.getValue(tags.description) : this.UIRouterMetatags.defaultDescription;
                this.keywords = tags.keywords ? this.getValue(tags.keywords) : this.UIRouterMetatags.defaultKeywords;
                angular.forEach(tags.properties, function (value, key) {
                    _this.properties[key] = _this.getValue(value);
                });
            }
            else {
                this.title = this.UIRouterMetatags.defaultTitle;
                this.description = this.UIRouterMetatags.defaultDescription;
                this.keywords = this.UIRouterMetatags.defaultKeywords;
            }
        };
        MetaTags.prototype.getValue = function (tag) {
            return Array.isArray(tag) ? this.$injector.invoke(tag, this, this.$state.$current.locals.globals) : this.$interpolate(tag)(this.$state.$current.locals.globals);
        };
        return MetaTags;
    })();
    uiroutermetatags.MetaTags = MetaTags;
    appModule.service('MetaTags', MetaTags);
    /* @ngInject */
    function runBlock($log, $rootScope, MetaTags) {
        $rootScope.MetaTags = MetaTags;
        $rootScope.$on("$stateChangeSuccess", stateChangeSuccess);
        function stateChangeSuccess(event, toState) {
            if (!toState.metaTags) {
                $log.debug("MetaTags - route: \"" + toState.name + "\" does not contain any metatags");
            }
            MetaTags.update(toState.metaTags);
        }
        ;
    }
    runBlock.$inject = ["$log", "$rootScope", "MetaTags"];
    appModule.run(runBlock);
})(uiroutermetatags || (uiroutermetatags = {}));

//# sourceMappingURL=ui-router-metatags.js.map