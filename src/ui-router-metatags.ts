/**
 * Metatags for angular-ui-router
 */
namespace uiroutermetatags {
	const appModule = angular.module('ui.router.metatags', ['ui.router']);

	export interface IMetaTags {
		title?: string | Function;
		description?: string | Function;
		keywords?: string | Function;
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
		setStaticProperties(properties: {}): IProvider;
		setOGURL(enabled: boolean): IProvider;
	}

	export interface IService {
		update(tags: IMetaTags): void;
		prerender: uiroutermetatags.Prerender;
	}

	export interface IConfig {
		prefix: string;
		suffix: string;
		defaultTitle: string;
		defaultDescription: string;
		defaultKeywords: string;
		staticProperties: {};
		enableOGURL: boolean;
	}

	class UIRouterMetatags implements angular.IServiceProvider, uiroutermetatags.IProvider {
		prefix: string = '';
		suffix: string = '';
		defaultTitle: string = '';
		defaultDescription: string = '';
		defaultKeywords: string = '';
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
			this.defaultTitle = title
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
		properties: {};
		prerender: uiroutermetatags.Prerender = {};
		
		/* @ngInject */
		constructor(public $log: angular.ILogService, public UIRouterMetatags: uiroutermetatags.IConfig, public $interpolate: angular.IInterpolateService, public $injector: angular.auto.IInjectorService, public $state: any, public $location: angular.ILocationService, public $window) {
		}

		update(tags: uiroutermetatags.IMetaTags) {
			try {
				this.properties = angular.extend({}, this.UIRouterMetatags.staticProperties);

				if (this.UIRouterMetatags.enableOGURL) {
					this.properties['og:url'] = this.$location.absUrl();
				}

				if (tags) {
					this.title = tags.title ? this.UIRouterMetatags.prefix + (this.getValue('title', tags.title) || '') + this.UIRouterMetatags.suffix : this.UIRouterMetatags.defaultTitle;
					this.description = tags.description ? this.getValue('description', tags.description) : this.UIRouterMetatags.defaultDescription;
					this.keywords = tags.keywords ? this.getValue('keywords', tags.keywords) : this.UIRouterMetatags.defaultKeywords;
					angular.forEach(tags.properties, (value, key) => {
						var v = this.getValue(key, value);
						if (v) {
							this.properties[key] = v;
						}
					});
				} else {
					this.title = this.UIRouterMetatags.defaultTitle;
					this.description = this.UIRouterMetatags.defaultDescription;
					this.keywords = this.UIRouterMetatags.defaultKeywords;
				}
				if (tags && tags.prerender) {
					this.prerender.statusCode = tags.prerender.statusCode ? this.getValue('prerender.statusCode', tags.prerender.statusCode) : 200;
					this.prerender.header = tags.prerender.header ? this.getValue('rerender.header', tags.prerender.header) : null;
				} else {
					this.prerender.statusCode = 200;
					this.prerender.header = null;
				}

				this.$window.prerenderReady = true;
			} catch (err) {
				this.$log.error('error occured when extracting metatags:', err);
			}
		}

		getValue(tagType: string, tag) {
			try {
				if (!tag) {
					return null;
				} else if (typeof tag === 'number') {
					return tag;
				} else if (typeof tag === 'string' && tag.trim().length === 0) {
					return null;
				} else if (angular.isFunction(tag) || Array.isArray(tag)) {
					return this.$injector.invoke(tag, this, this.$state.$current.locals.globals);
				} else {
					return this.$interpolate(tag)(this.$state.$current.locals.globals);
				}
			} catch (err) {
				this.$log.error('error occured when trying to get the value of tag:', tagType, err);
				return null;
			}
		}
	}

	appModule.service('MetaTags', MetaTags);
	
	/* @ngInject */
	function runBlock($log: angular.ILogService, $rootScope: any, MetaTags: uiroutermetatags.IService, $window: angular.IWindowService) {
		$rootScope.MetaTags = MetaTags;

		$rootScope.$on('$stateChangeStart', stateChangeStart);
        $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);
        $rootScope.$on('$stateChangeError', stateChangeError);
        $rootScope.$on('$stateNotFound', stateNotFound);

		function stateChangeStart(event: angular.IAngularEvent, toState: angular.ui.IState, toParams: any, from: angular.ui.IState, fromParams: any) {
            $window.prerenderReady = false;
		}

		function stateChangeSuccess(event: angular.IAngularEvent, toState: any) {
			if (!toState.metaTags) {
				$log.debug(`MetaTags - route: "${toState.name}" does not contain any metatags`);
			}
			MetaTags.update(toState.metaTags);
		}

		function stateChangeError(event: angular.IAngularEvent, toState: angular.ui.IState, toParams: any, fromState: angular.ui.IState, fromParams: any, error: any) {
			MetaTags.prerender.statusCode = 500;
			$window.prerenderReady = true;
		}

		function stateNotFound(event: angular.IAngularEvent, unfoundState: angular.ui.IState, fromState: angular.ui.IState) {
			MetaTags.prerender.statusCode = 404;
			$window.prerenderReady = true;
		}
	}

	appModule.run(runBlock);
}

declare module angular.ui {
    interface IState {
		metaTags?: uiroutermetatags.IMetaTags;
	}
}

interface Window {
	prerenderReady?: boolean;
}