# 0.0.3
Added the possibility to have static tags and to set the 'og:url' property by default.

```javascript
function configure(UIRouterMetatagsProvider) {
    UIRouterMetatagsProvider
        .setTitlePrefix('prefix - ')
        .setTitleSuffix(' | MyApp');
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
    .config(configure);
```

# 0.0.2
Tags can now resolve properties resolved by ui-router

Example:

```javascript
function configureRoutes($stateProvider) {
    $stateProvider
        .state('blogpost', {
            url: '/post/:id',
            resolve: {
                /* @ngInject */
                blogpost: function(myService, $stateParams) {
                    return myService.getPost($stateParams.id);
                }
            }
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
    .config(configureRoutes);
```

# 0.0.1
Initial version