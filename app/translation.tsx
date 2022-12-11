import * as React from "react";

export const supportedLanguages = ["fr", "en", "ru"] as const;
export type Lang = typeof supportedLanguages[number];

const translations = {
	newList: {
		fr: "Nouvelle liste",
		en: "New list",
		ru: "Новый список",
	},
	add: {
		fr: "Ajouter…",
		en: "Add…",
		ru: "Добавить…",
	},
	clearList: {
		fr: "Nettoyer la liste",
		en: "Clean up list",
		ru: "Очистить список",
	},
	recentlyDeleted: {
		fr: "Supprimés récemment",
		en: "Recently deleted",
		ru: "Удаленные",
	},
	back: {
		fr: "Retour",
		en: "Back",
		ru: "Обратно",
	},
	locale: {
		fr: "fr-FR",
		en: "en-US",
		ru: "ru-RU",
	},
	date: {
		fr: "le %s",
		en: "on %s",
		ru: "%s",
	},
	flag: {
		fr: "🇫🇷",
		en: "🇬🇧",
		ru: "🇷🇺",
	},
} as const;
type TranslationKey = keyof (typeof translations)

export const flag = (lang: Lang): string => translations.flag[lang];

const context = React.createContext<[Lang, (l: Lang) => void]>(["fr", () => {}]);

type ProviderProps = {
	children: React.ReactNode;
};

const getSavedLanguage = (): Lang | null => {
	return null;
}

export const LangProvider = ({ children }: ProviderProps) => {
	const langState = React.useState<Lang>(getSavedLanguage() || "fr");
	const [, setLang] = langState;
	React.useEffect(() => {
		const savedLanguage = localStorage.getItem("lang");
		if (savedLanguage && supportedLanguages.includes(savedLanguage as Lang)) {
			setLang(savedLanguage as Lang);
		}
	}, [setLang]);
	return <context.Provider value={langState}>{children}</context.Provider>;
};


export const useTranslate = () => {
	const [lang] = React.useContext(context);
	return {
		lang,
		t: (key: TranslationKey): string => translations[key][lang],
	}
}

export const useSetLanguage = () => {
	const [, setLanguage] = React.useContext(context);
	return (lang: Lang) => {
		setLanguage(lang);
		localStorage.setItem("lang", lang);
	};
}
