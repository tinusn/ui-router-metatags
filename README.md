# ui-router-metatags
Metatags support for the AngularUI Router

Heavily inspired by [tf-metatags](https://github.com/thiagofesta/tf-metatags) and [angular-ui-router-title](https://github.com/nonplus/angular-ui-router-title).

**Note that you still need a service like prerender.io to actually make these tags visible to search engines!**

## Installation
```sh
$ npm install ui-router-metatags
or
$ bower install ui-router-metatags
```

## Documentation
**See the sample app for a complete example, otherwise, read below**

Include the script in your index file

```html
<script src="node_modules/ui-router-metatags/dist/ui-router-metatags.min.js"></script>
```

Include it in your module declaration and in your run block

```javascript
angular.module('myApp', ['ui.router', 'ui.router.metatags']);

function runBlock($rootScope, MetaTags) {
	$rootScope.MetaTags = MetaTags;
}

angular
	.module('myApp')
	.run(['$rootScope', 'MetaTags', runBlock]);
```

Add the tags to your index file

```html
<title ng-bind="MetaTags.title">Default title</title>
<meta name="description" content="{{MetaTags.description}}">
<meta name="keywords" content="{{MetaTags.keywords}}">
<meta ng-repeat="(key, value) in MetaTags.properties" property="{{key}}" content="{{value}}" >
<meta name="prerender-status-code" content="{{MetaTags.prerender.statusCode}}">
<meta name="prerender-header" ng-if="MetaTags.prerender.header" content="{{MetaTags.prerender.header}}">
```

Then configure defaults

```javascript
function configure(UIRouterMetatagsProvider) {
    UIRouterMetatagsProvider
        .setTitlePrefix('prefix - ')
        .setTitleSuffix(' | MyApp')
        .setDefaultTitle('MyApp')
        .setDefaultDescription('description')
        .setDefaultKeywords('keywords')
        .setStaticProperties({
                'fb:app_id': 'your fb app id',
                'og:site_name': 'your site name'
            })
        .setOGURL(true);
}

angular
    .module('myApp')
    .config(['UIRouterMetatagsProvider', configure]);
```

(Static properties are added to all pages and the "setOGURL" method ensures that a 'og:url' property is added to all pages.)

And finally decorate the routes with metatags in the route configs like so:

```javascript
function configureRoutes($stateProvider) {
    $stateProvider
        .state('frontpage', {
            url: '/',
            metaTags: {
                title: 'Frontpage',
                description: 'This is the frontpage',
                keywords: 'lots of interresting keywords',
                properties: {
                    'og:title': 'Frontpage'
                }
            }
        })
        .state('blogposts', {
            url: '/blog/:category',
            resolve: {
                /* @ngInject */
                posts: function(myService, $stateParams) {
                    return myService.getPosts($stateParams.category);
                }
            },
            metaTags: {
                prerender: {
                    /* @ngInject */
                    statusCode: function(posts) {
                        return posts.length > 0 ? 200 : 302;
                    },
                    /* @ngInject */
                    header: function(posts) {
                        return posts.length > 0 ? null : 'Location: http://example.com/posts';
                    }
                }
            }
        })
        .state('blogpost', {
            url: '/post/:id',
            resolve: {
                /* @ngInject */
                blogpost: function(myService, $stateParams) {
                    return myService.getPost($stateParams.id);
                }
            },
            metaTags: {
                /* @ngInject */
                title: function(blogpost) {
                    return blogpost.title;
                },
                description: 'The most interresting post {{blogpost.title}}'
            }
        });

}
angular
    .module('myApp')
    .config(['$stateProvider', configureRoutes]);
```

Note that all tags can be either a simple string, a resolve function or a interpolated string (where the properties available are the ones you resolve in your route).


## Log statement
Please note that any routes without metatags will cause a debug log statement, so remember to disable debug logging in production. Example of such a log statement:

```javascript
MetaTags - route: "app.dashboard" does not contain any metatags
```

## To develop
Install nodejs and the following packages globally:
* gulp
* tsd

then run:
* npm install
* tsd reinstall --save --overwrite

Then finally, run "gulp"