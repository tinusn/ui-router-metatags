declare namespace uiroutermetatags {
	interface IMetaTags {
		title?: string|Function;
		description?: string|Function;
		keywords?: string|Function;
		properties?: {
			[index: string]: string|Function;
		}
	}

	interface IProvider {
		setTitlePrefix(prefix: string): IProvider;
		setTitleSuffix(suffix: string): IProvider;
		setDefaultTitle(title: string): IProvider;
		setDefaultDescription(description: string): IProvider;
		setDefaultKeywords(keywords: string): IProvider;
		setStaticProperties(properties: {}): IProvider;
		setOGURL(enabled: boolean): IProvider;
	}

	interface IService {
		prefix: string;
		suffix: string;
		defaultTitle: string;
		defaultDescription: string;
		defaultKeywords: string;
		staticProperties: {};
		enableOGURL: boolean;
	}
}

declare module angular.ui {
    interface IState {
		metaTags?: uiroutermetatags.IMetaTags;
	}
}