// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkArticleMeta   from "./src/plugins/remark-reading-time.mjs";
//remarkReadingTime --> ./src/plugins/remark-reading-time.mjs';


// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Ma documentation',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/DOUKSIEH/astrostarlightdoc' }],
			customCss: ['./src/styles/custom.css'],
			// Définit l'anglais comme langue par défaut pour ce site.
			// defaultLocale: 'fr',
			// locales: {
			// 	// Docs en français dans `src/content/docs/fr/`
			// 	fr: {
			// 	label: 'English',
			// 	},
			// 	// Docs en anglais dans `src/content/docs/en/`
			// 	en: {
			// 	label: 'English',
			// 	},
			// 	// Docs en chinois simplifié dans `src/content/docs/zh-cn/`
			// 	'zh-cn': {
			// 	label: '简体中文',
			// 	lang: 'zh-CN',
			// 	},
			// 	// Docs en arabe dans `src/content/docs/ar/`
			// 	ar: {
			// 	label: 'العربية',
			// 	dir: 'rtl',
			// 	},
			// },
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						// { label: 'Example Guide', slug: 'guides/example' },
						{ label: 'Signer le commit', slug: 'guides/signcommit' },
						{ label: 'Guide Talos linux', slug: 'guides/talos' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],

		}),
	],
	markdown: {
    	remarkPlugins: [remarkArticleMeta],
 	 },
});
