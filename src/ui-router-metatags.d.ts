declare namespace uiroutermetatags {
	interface IMetaTags {
		title?: string;
		description?: string;
		keywords?: string;
		properties?: {};
	}

	interface IProvider {
		setTitlePrefix(prefix: string): IProvider;
		setTitleSuffix(suffix: string): IProvider;
		setDefaultTitle(title: string): IProvider;
		setDefaultDescription(description: string): IProvider;
		setDefaultKeywords(keywords: string): IProvider;
	}

	interface IService {
		prefix: string;
		suffix: string;
		defaultTitle: string;
		defaultDescription: string;
		defaultKeywords: string;
	}

}