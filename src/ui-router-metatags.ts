namespace uiroutermetatags {
	const appModule = angular.module('ui.router.metatags', ['ui.router']);

	export class UIRouterMetatags implements angular.IServiceProvider, uiroutermetatags.IProvider {
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

		public $get(): uiroutermetatags.IService {
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

	export class MetaTags {
		title: string;
		keywords: string;
		description: string;
		properties: {};
		stdProperties: {};
		
		/* @ngInject */
		constructor(public $log: angular.ILogService, public UIRouterMetatags: uiroutermetatags.IService, public $interpolate: angular.IInterpolateService, public $injector: angular.auto.IInjectorService, public $state: any, public $location: angular.ILocationService) {
		}

		update(tags: uiroutermetatags.IMetaTags) {
			this.properties = this.UIRouterMetatags.staticProperties;
			
			if (this.UIRouterMetatags.enableOGURL) {
				this.properties['og:url'] = this.$location.absUrl();
			}

			if (tags) {
				this.title = tags.title ? this.UIRouterMetatags.prefix + (this.getValue(tags.title) || '') + this.UIRouterMetatags.suffix : this.UIRouterMetatags.defaultTitle;
				this.description = tags.description ? this.getValue(tags.description) : this.UIRouterMetatags.defaultDescription;
				this.keywords = tags.keywords ? this.getValue(tags.keywords) : this.UIRouterMetatags.defaultKeywords;
				angular.forEach(tags.properties, (value, key) => {
					var v = this.getValue(value);
					if (v && v.trim().length > 0) {
						this.properties[key] = v;
					}
				});
			} else {
				this.title = this.UIRouterMetatags.defaultTitle;
				this.description = this.UIRouterMetatags.defaultDescription;
				this.keywords = this.UIRouterMetatags.defaultKeywords;
			}
		}

		getValue(tag) {
			return Array.isArray(tag) ? this.$injector.invoke(tag, this, this.$state.$current.locals.globals) : this.$interpolate(tag)(this.$state.$current.locals.globals);
		}
	}

	appModule.service('MetaTags', MetaTags);
	
	/* @ngInject */
	function runBlock($log: angular.ILogService, $rootScope: any, MetaTags: uiroutermetatags.MetaTags) {
		$rootScope.MetaTags = MetaTags;

		$rootScope.$on("$stateChangeSuccess", stateChangeSuccess);

		function stateChangeSuccess(event: angular.IAngularEvent, toState: any) {
			if (!toState.metaTags) {
				$log.debug(`MetaTags - route: "${toState.name}" does not contain any metatags`);
			}
			MetaTags.update(toState.metaTags);
		};
	}

	appModule.run(runBlock);

}