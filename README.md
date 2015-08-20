# ui-router-metatags
Metatags support for the AngularUI Router

Heavily inspired by [tf-metatags](https://github.com/thiagofesta/tf-metatags) and [angular-ui-router-title](https://github.com/nonplus/angular-ui-router-title).

## Installation
Download [ui-router-metatags.min.js](https://raw.githubusercontent.com/tinusn/ui-router-metatags/master/dist/ui-router-metatags.min.js) and include it on your page

```html
<script src="vendor/ui-router-metatags.min.js"></script>
```

Include it in your module declaration

```javascript
angular.module('myApp', ['ui.router', 'ui.router.metatags']);
```

Add the MetaTags service to your page

```html
<title ng-bind="MetaTags.title">Your default title</title>
<meta name="description" content="{{MetaTags.description}}">
<meta name="keywords" content="{{MetaTags.keywords}}">
<meta ng-repeat="(key, value) in MetaTags.properties" property="{{key}}" content="{{value}}" >
```

Then configure defaults

```javascript
function configure(UIRouterMetatagsProvider) {
    UIRouterMetatagsProvider.setTitleSuffix(' | MyApp');
    UIRouterMetatagsProvider.setDefaultTitle('MyApp');
}

angular
    .module('myApp')
    .config(configure);
```

And finally decorate the routes with metatags like so:

```javascript
function configureRoutes($stateProvider) {
    $stateProvider
        .state('frontpage', {
            url: '/',
            templateUrl: 'components/frontpage/frontpage.html',
            controller: 'FrontpageController',
            controllerAs: 'vm',
            metaTags: {
                title: 'Frontpage',
                description: 'This is the frontpage',
                keywords: 'lots of interresting keywords',
                properties: {
                    'og:title': 'Frontpage',
                    'twitter:title': 'Frontpage'
                }
            }
        });
}
angular
    .module('myApp')
    .config(configureRoutes);
```


## Log statement
Please note that any routes without metatags will cause a debug log statement, so remember to disable debug logging in production. Example of such a log statement:

```javascript
MetaTags - route: "app.dashboard" does not contain any metatags
```

## To build
To develop install nodejs and the following packages globally:
* gulp
* tsd

then run:
* npm install
* tsd reinstall --save --overwrite

To build, run "gulp"