var uiroutermetatags;
(function (uiroutermetatags) {
    var appModule = angular.module('ui.router.metatags', ['ui.router']);
    var UIRouterMetatags = (function () {
        /* @ngInject */
        function UIRouterMetatags() {
            this.prefix = '';
            this.suffix = '';
            this.defaultTitle = '';
        }
        UIRouterMetatags.prototype.setTitlePrefix = function (prefix) {
            this.prefix = prefix;
        };
        UIRouterMetatags.prototype.setTitleSuffix = function (suffix) {
            this.suffix = suffix;
        };
        UIRouterMetatags.prototype.setDefaultTitle = function (title) {
            this.defaultTitle = title;
        };
        UIRouterMetatags.prototype.$get = function () {
            return {
                prefix: this.prefix,
                suffix: this.suffix,
                defaultTitle: this.defaultTitle
            };
        };
        return UIRouterMetatags;
    })();
    uiroutermetatags.UIRouterMetatags = UIRouterMetatags;
    appModule.provider('UIRouterMetatags', UIRouterMetatags);
    var MetaTags = (function () {
        /* @ngInject */
        function MetaTags(UIRouterMetatags) {
            this.UIRouterMetatags = UIRouterMetatags;
        }
        MetaTags.$inject = ["UIRouterMetatags"];
        MetaTags.prototype.update = function (tags) {
            if (tags) {
                this.title = tags.title ? this.UIRouterMetatags.prefix + (tags.title || '') + this.UIRouterMetatags.suffix : this.UIRouterMetatags.defaultTitle;
                this.description = tags.description || '';
                this.keywords = tags.keywords || '';
                this.properties = tags.properties || {};
            }
            else {
                this.title = this.UIRouterMetatags.defaultTitle;
                this.description = '';
                this.keywords = '';
                this.properties = {};
            }
        };
        return MetaTags;
    })();
    uiroutermetatags.MetaTags = MetaTags;
    appModule.service('MetaTags', MetaTags);
    /* @ngInject */
    function runBlock($log, $rootScope, $state, MetaTags) {
        $rootScope.MetaTags = MetaTags;
        $rootScope.$on("$stateChangeSuccess", function () {
            if (!$state.current.metaTags) {
                $log.debug("MetaTags - route: \"" + $state.current.name + "\" does not contain any metatags");
            }
            MetaTags.update($state.current.metaTags);
        });
    }
    runBlock.$inject = ["$log", "$rootScope", "$state", "MetaTags"];
    appModule.run(runBlock);
})(uiroutermetatags || (uiroutermetatags = {}));

//# sourceMappingURL=ui-router-metatags.js.map