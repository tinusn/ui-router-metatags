declare namespace uiroutermetatags {
	interface IMetaTags {
		title?: string;
		description?: string;
		keywords?: string;
		properties?: {};
	}

	interface IProvider {
		setTitlePrefix(prefix: string): void;
		setTitleSuffix(suffix: string): void;
		setDefaultTitle(title: string): void;
	}

	interface IService {
		prefix: string;
		suffix: string;
		defaultTitle: string;
	}

}