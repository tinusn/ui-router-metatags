/**
 * Metatags for angular-ui-router
 */
namespace uiroutermetatags {
	const appModule = angular.module('ui.router.metatags', ['ui.router']);

	export interface IMetaTags {
		title?: string | Function;
		description?: string | Function;
		keywords?: string | Function;
		robots?: string | Function;
		properties?: {
			[index: string]: string | Function;
		},
		prerender?: Prerender;
	}

	export interface Prerender {
		statusCode?: number | Function,
		header?: string | Function
	}

	export interface IProvider {
		setTitlePrefix(prefix: string): IProvider;
		setTitleSuffix(suffix: string): IProvider;
		setDefaultTitle(title: string): IProvider;
		setDefaultDescription(description: string): IProvider;
		setDefaultKeywords(keywords: string): IProvider;
		setDefaultRobots(robots: string): IProvider;
		setStaticProperties(properties: {}): IProvider;
		setOGURL(enabled: boolean): IProvider;
	}

	export interface IService {
		update(tags: IMetaTags, transition: any): void;
		prerender: uiroutermetatags.Prerender;
	}

	export interface IConfig {
		prefix: string;
		suffix: string;
		defaultTitle: string;
		defaultDescription: string;
		defaultKeywords: string;
		defaultRobots: string;
		staticProperties: {};
		enableOGURL: boolean;
	}

	class UIRouterMetatags implements angular.IServiceProvider, uiroutermetatags.IProvider {
		prefix: string = '';
		suffix: string = '';
		defaultTitle: string = '';
		defaultDescription: string = '';
		defaultKeywords: string = '';
		defaultRobots: string = '';
		staticProperties: {} = {};
		enableOGURL: boolean = false;

		/* @ngInject */
		constructor() {

		}

		setTitlePrefix(prefix: string): UIRouterMetatags {
			this.prefix = prefix;
			return this;
		}

		setTitleSuffix(suffix: string): UIRouterMetatags {
			this.suffix = suffix;
			return this;
		}

		setDefaultTitle(title: string): UIRouterMetatags {
			this.defaultTitle = title;
			return this;
		}

		setDefaultDescription(description: string): UIRouterMetatags {
			this.defaultDescription = description;
			return this;
		}

		setDefaultKeywords(keywords: string): UIRouterMetatags {
			this.defaultKeywords = keywords;
			return this;
		}

		setDefaultRobots(robots: string): UIRouterMetatags {
			this.defaultRobots = robots;
			return this;
		}

		setStaticProperties(properties: {}): UIRouterMetatags {
			this.staticProperties = properties;
			return this;
		}

		setOGURL(enabled: boolean): UIRouterMetatags {
			this.enableOGURL = enabled;
			return this;
		}

		public $get(): uiroutermetatags.IConfig {
			return {
				prefix: this.prefix,
				suffix: this.suffix,
				defaultTitle: this.defaultTitle,
				defaultDescription: this.defaultDescription,
				defaultKeywords: this.defaultKeywords,
				defaultRobots: this.defaultRobots,
				staticProperties: this.staticProperties,
				enableOGURL: this.enableOGURL
			}
		}
	}

	appModule.provider('UIRouterMetatags', UIRouterMetatags);

	class MetaTags {
		title: string;
		keywords: string;
		description: string;
		robots: string;
		properties: {};
		prerender: uiroutermetatags.Prerender = {};
		
		/* @ngInject */
		constructor(public $log: angular.ILogService, public UIRouterMetatags: uiroutermetatags.IConfig, 
			public $interpolate: angular.IInterpolateService, public $injector: angular.auto.IInjectorService, 
			public $state: any, public $location: angular.ILocationService, public $window,
			public $uiRouterGlobals: any
		) {
		}

		update(tags: uiroutermetatags.IMetaTags, transition: any) {
			try {

				/* 
					This hack is used to resolve the lack of "this.$state.$current.locals.globals".
					Here the resolved object is builded with all previews resolved data
				*/
				var resolved = {}
				let tokens = transition.getResolveTokens();
				tokens.forEach(token => resolved[token] = transition.injector().get(token));

				this.properties = angular.extend({}, this.UIRouterMetatags.staticProperties);

				if (this.UIRouterMetatags.enableOGURL) {
					this.properties['og:url'] = this.$location.absUrl();
				}

				if (tags) {
					this.title = tags.title ? this.UIRouterMetatags.prefix + (this.getValue('title', tags.title, resolved) || '') + this.UIRouterMetatags.suffix : this.UIRouterMetatags.defaultTitle;
					this.description = tags.description ? this.getValue('description', tags.description, resolved) : this.UIRouterMetatags.defaultDescription;
					this.keywords = tags.keywords ? this.getValue('keywords', tags.keywords, resolved) : this.UIRouterMetatags.defaultKeywords;
					this.robots = tags.robots ? this.getValue('robots', tags.robots, resolved) : this.UIRouterMetatags.defaultRobots;
					angular.forEach(tags.properties, (value, key) => {
						var v = this.getValue(key, value, resolved);
						if (v) {
							this.properties[key] = v;
						}
					});
				} else {
					this.title = this.UIRouterMetatags.defaultTitle;
					this.description = this.UIRouterMetatags.defaultDescription;
					this.keywords = this.UIRouterMetatags.defaultKeywords;
					this.robots = this.UIRouterMetatags.defaultRobots;
				}
				if (tags && tags.prerender) {
					this.prerender.statusCode = tags.prerender.statusCode ? this.getValue('prerender.statusCode', tags.prerender.statusCode, resolved) : 200;
					this.prerender.header = tags.prerender.header ? this.getValue('rerender.header', tags.prerender.header, resolved) : null;
				} else {
					this.prerender.statusCode = 200;
					this.prerender.header = null;
				}

				this.$window.prerenderReady = true;
			} catch (err) {
				this.$log.error('error occured when extracting metatags:', err);
			}
		}

		getValue(tagType: string, tag, resolved: any) {
			try {
				if (!tag) {
					return null;
				} else if (typeof tag === 'number') {
					return tag;
				} else if (typeof tag === 'string' && tag.trim().length === 0) {
					return null;
				} else if (angular.isFunction(tag) || Array.isArray(tag)) {
					return this.$injector.invoke(tag, this, resolved);
				} else {
					return this.$interpolate(tag)(resolved);
				}
			} catch (err) {
				this.$log.error('error occured when trying to get the value of tag:', tagType, err);
				return null;
			}
		}
	}

	appModule.service('MetaTags', MetaTags);

	/* @ngInject */
	function runBlockTransitions($log: angular.ILogService, MetaTags: uiroutermetatags.IService, $window: angular.IWindowService, $transitions: any) {

		$transitions.onStart({}, onStart)
		$transitions.onSuccess({}, onSuccess)
		$transitions.onError({}, onError)


		function onStart(transition: any) {
			$window.prerenderReady = false;
		}

		function onSuccess(transition: any) {
			var toState = transition.$to()
			var fromState = transition.$from()
			
			if (!toState.metaTags) {
				$log.debug(`MetaTags - route: "${toState.name}" does not contain any metatags`);
			}

			MetaTags.update(toState.metaTags as uiroutermetatags.IMetaTags, transition);
		}

		function onError(transition: any) {
			MetaTags.prerender.statusCode = 500;
			$window.prerenderReady = true;
		}
	}
	
	appModule.run(runBlockTransitions);
}

declare module angular.ui {
    interface IState {
		metaTags?: uiroutermetatags.IMetaTags;
	}
}

interface Window {
	prerenderReady?: boolean;
}
