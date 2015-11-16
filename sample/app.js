angular.module('myApp', [
	'ui.router',
	'ui.router.metatags',
]);

function configure($urlRouterProvider, $stateProvider, UIRouterMetatagsProvider) {
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

	$urlRouterProvider.otherwise('/');

    $stateProvider
		.state('app', {
			abstract: true,
			template: '<h1>angular-ui-router sample</h1><div ui-view></div><h2>Resolved tags in MetaTags</h2><pre>title: {{MetaTags.title | json}}</pre><pre>keywords: {{MetaTags.keywords | json}}</pre><pre>description: {{MetaTags.description | json}}</pre><pre>properties: {{MetaTags.properties | json}}</pre><pre>prerender: {{MetaTags.prerender | json}}</pre>',
		})
        .state('app.frontpage', {
            url: '/',
			template: "<h1>frontpage</h1><a ui-sref=\"app.posts({category: 'test'})\">blog posts</a>",
            metaTags: {
                title: 'Frontpage',
                description: 'This is the frontpage',
                keywords: 'lots of interresting keywords',
                properties: {
                    'og:title': 'Frontpage'
                }
            }
        })
        .state('app.posts', {
            url: '/blog/:category',
			template: '<h1>blog posts</h1><ul><li ng-repeat="post in posts"><a ui-sref="app.post({id: post.id})">{{post.title}}</a></li></ul><a ui-sref="app.frontpage">back to the frontpage</a>',
			controller: function ($scope, posts) {
				$scope.posts = posts;
			},
            resolve: {
                /* @ngInject */
                posts: function (myService, $stateParams) {
                    return myService.getPosts($stateParams.category);
                }
            },
            metaTags: {
				title: 'Blog posts',
                prerender: {
                    /* @ngInject */
                    statusCode: function (posts) {
                        return posts.length > 0 ? 200 : 302;
                    },
                    /* @ngInject */
                    header: function (posts) {
                        return posts.length > 0 ? null : 'Location: http://example.com/posts';
                    }
                }
            }
        })
        .state('app.post', {
            url: '/post/:id',
			template: '<h1>{{post.title}}</h1><p>{{post.description}}</p><a ui-sref="app.frontpage">back to the frontpage</a>',
			controller: function ($scope, post) {
				$scope.post = post;
			},
            resolve: {
                /* @ngInject */
                post: function (myService, $stateParams) {
                    return myService.getPost($stateParams.id);
                }
            },
            metaTags: {
                title: function (post) {
                    return post.title;
                },
                description: 'The most interresting post {{post.title}}'
            }
        });
}

angular
	.module('myApp')
	.config(['$urlRouterProvider', '$stateProvider', 'UIRouterMetatagsProvider', configure]);

function runBlock($rootScope, MetaTags) {
	$rootScope.MetaTags = MetaTags;
}

angular
	.module('myApp')
	.run(['$rootScope', 'MetaTags', runBlock]);

function myService() {
	var service = {
		getPosts: getPosts,
		getPost: getPost
	};

	var samplePost = {
		id: 1,
		title: 'sample blog post',
		content: 'lorem ipsum'
	};

	function getPosts(category) {
		return [samplePost];
	}

	function getPost(id) {
		return samplePost;
	}

	return service;
}

angular
	.module('myApp')
	.service('myService', myService);




