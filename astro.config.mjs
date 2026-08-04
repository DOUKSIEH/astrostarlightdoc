// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkArticleMeta   from "./src/plugins/remark-reading-time.mjs";
//remarkReadingTime --> ./src/plugins/remark-reading-time.mjs';


// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'DevSecOps & Cloud-Native — Notes de production',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/DOUKSIEH/astrostarlightdoc' }],
			customCss: ['./src/styles/custom.css'],
			// Définit l'anglais comme langue par défaut pour ce site.
			defaultLocale: 'fr',
			locales: {
				root: {
				label: 'Français',
				lang: 'fr',
				},
			},
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
			// sidebar: [
			// 	{
			// 		label: 'Guides',
			// 		items: [
			// 			// Each item here is one entry in the navigation menu.
			// 			// { label: 'Example Guide', slug: 'guides/example' },
			// 			{ label: 'Signer le commit', slug: 'guides/signcommit' },
			// 			{ label: 'Guide Talos linux', slug: 'guides/talos' },
			// 			{ label: 'Guide cilium & hubble', slug: 'guides/cilium-hubble' },
			// 			{ label: 'Kubernetes - CloudNativePG', slug: 'guides/cnpg-provisionner' },
			// 			{ label: 'Kubernetes - Odoo', slug: 'guides/odoo-k8s' },
	        //             { label: 'Guide Odoo - addons' , slug: 'guides/addons-odoo' },
			// 			{ label: 'Infrastructure (Proxmox) - Talos-odoo19-k8s (en cours...)', slug: 'guides/infrastructure-odoo'},
			// 			{ label: 'Guide Ceph & RADOS Gateway (S3) sur Proxmox VE 9', slug: 'guides/ceph-rgw'},
			// 			{ label: 'Guide de Diagnostic : Incident Mémoire & Java OutOfMemory', slug: 'guides/java-cg'},
			// 			{ label: 'Guide : Gestion d\'Incident', slug: 'guides/incident'}, 
			// 			{ label: 'Guide : Restauration après un Ransomware', slug: 'guides/restore'}, 
			// 			{ label: 'Guide : Kubernetes et etcd', slug: 'guides/kube-etcd'}, 
			// 			{ label: 'Guide : Loki + Stockage S3 (Ceph RGW)', slug: 'guides/loki-s3-rgw'}, 
			// 			{ label: 'Guide : DevSecOps - CALMS', slug: 'guides/entretien'}, 
			// 		],
			// 	},
			// 	{
			// 		label: 'Reference',
			// 		autogenerate: { directory: 'reference' }, 
			// 	},
			// ],
			// expressiveCode: {
			// // 	langs: {
			// 	// Liste exhaustive des langages pour stopper les avertissements [WARN]
			// 	shiki: {
			// 	langs: [
			// 		'javascript',
			// 		'typescript',
			// 		'shell',
			// 		'bash',
			// 		'yaml',
			// 		'json',
			// 		'python',
			// 		'markdown',
			// 		'docker',
			// 		'terraform',
			// 		'sql',
			// 		// --- Vos langages spécifiques détectés dans les logs ---
			// 		'gitignore',
			// 		'jinja2',
			// 		'promql',
			// 		'logql',
			// 		'lucene',
			// 		'suricata',
			// 		'sudoers',
			// 		'fstab',
			// 		'sshconfig',
			// 		'sshd_config',
			// 		'pam'
			// 	],
			// 	},
			// },
			sidebar: [
				{
					label: "Guides",
					items: [
					{
						label: "DevSecOps",
						items: [
						{ label: "Frameworks ITIL 4 et CALMS", slug: "guides/devsecops/itil" },
						{ label: "Audit de Maturité  DevSecOps - CALMS", slug: "guides/devsecops/calms" },
						// { label: "Audit de Maturité DevOps", slug: "guides/devsecops/audit-devops" },
						// { label: "Préparation entretien poste", slug: "guides/devsecops/preparation" },
						// { label: "Compréhension du Besoin", slug: "guides/devsecops/entretien-laposte" },
						],
					},
					{
						label: "Incident & Troubleshooting",
						items: [
						{ label: "Gestion d'incident", slug: "guides/incident/incident" },
						{ label: "Diagnostic Java OutOfMemory", slug: "guides/incident/java-cg" },
						{ label: "Signer ses commits Git", slug: "guides/incident/signcommit" },
						],
					},
					{
						label: "Kubernetes",
						items: [
						{ label: "Odoo sur Kubernetes", slug: "guides/kubernetes/odoo-k8s" },
						{ label: "CloudNativePG Provisioning", slug: "guides/kubernetes/cnpg-provisionner" },
						{ label: "Kubernetes et Etcd", slug: "guides/kubernetes/kube-etcd" },
						{ label: "Gestion des addons Odoo", slug: "guides/kubernetes/addons-odoo" },
						{ label: "OpenShift vs Talos", slug: "guides/kubernetes/openshift-talos" },
						{ label: "Talos longhorn", slug: "guides/kubernetes/talos-longhorn" },
						{ label: "Docker...", slug: "guides/kubernetes/docker" },
						// { label: "K8S - Outils & Méthodes", slug: "guides/kubernetes/k8s-outils" },
						],
					},
					{
						label: "Iac",
						items: [
						{ label: "Packer & Golden Image Odoo 19", slug: "guides/iac/odoo-packer" },
						{ label: "Guide Ansible", slug: "guides/iac/ansible" },
						{ label: "Guide Terraform", slug: "guides/iac/terraform" },
						{ label: "Installation AWX Operator - Talos", slug: "guides/iac/awx" },
						],
					},
					{
						label: "Security",
						items: [
						{ label: "Gestion des secrets avec HashiCorp Vault", slug: "guides/security/vault" },
						{ label: "IAM - Keycloak & authentik", slug: "guides/security/keycloak-authentik" },
						{ label: "IBM WEBSEAL", slug: "guides/security/ibm-webseal" },
						{ label: "SIEM - Graylog · Wazuh · Suricata", slug: "guides/security/siem" },
						{ label: "Comprendre et exploiter SBOM", slug: "guides/security/sbom" },
						{ label: "Sécurité de la Supply Chain", slug: "guides/security/supply-chain" },

						],
					},
					{
						label: "Systèmes & Réseaux",
						items: [
						{ label: "Les réseaux...", slug: "guides/sysnet/reseaux" },
						{ label: "Linux Administration Système", slug: "guides/sysnet/adminsys" },
						],
					},
					{
						label: "Cloud",
						items: [
						{ label: "Guide Openstack", slug: "guides/cloud/openstack" },
						{ label: "Guide AWS", slug: "guides/cloud/aws" },
						{ label: "Guide AWS", slug: "guides/cloud/aws-saa-c03" },
						// { label: "Infrastructure Proxmox + Talos + Odoo", slug: "guides/linux/infrastructure-odoo" },
						],
					},
					{
						label: "Linux & Talos",
						items: [
						{ label: "Guide Talos Linux", slug: "guides/linux/talos" },
						{ label: "Infrastructure Proxmox + Talos + Odoo", slug: "guides/linux/infrastructure-odoo" },
						],
					},
					{
						label: "Observability",
						items: [
						{ label: "Guide Observabilité", slug: "guides/observability/observabilite" },
						{ label: "Guide Observabilité HD", slug: "guides/observability/observabilite-hd" },
						{ label: "Prometheus - Grafana - Thanos", slug: "guides/observability/prometheus-thanos" },
						{ label: "Cilium & Hubble", slug: "guides/observability/cilium-hubble" },
						{ label: "Loki avec stockage S3 (Ceph RGW)", slug: "guides/observability/loki-s3-rgw" },
						],
					},
					{
						label: "CI/CD",
						items: [
						{ label: "Git & Git Flow", slug: "guides/cicd/git" },
						],
					},
					{
						label: "IA",
						items: [
						{ label: "Comprendre l'IA", slug: "guides/ia/ia" },
						{ label: "Agentique - gestion d'incidents", slug: "guides/ia/agent-incident" },
						],
					},
					{
						label: "Storage & Backup",
						items: [
						{ label: "Ceph RGW (S3) sur Proxmox", slug: "guides/storage/ceph-rgw" },
						{ label: "Restauration après un ransomware", slug: "guides/storage/restore" },
						],
					},
					],
				},
				{
					label: "Reference",
					items: [
					{ label: "Références Talos", slug: "reference/talos" },
					],
				},
			],

		}),
	],
	 // ✅ AJOUTE ÇA
	vite: {
		server: {
		allowedHosts: [
			'testiculate-corrina-airily.ngrok-free.dev',
			// ou plus pratique si l’URL change souvent :
			// '.ngrok-free.dev',
		],
		},
	},
	markdown: {
    	remarkPlugins: [remarkArticleMeta],
 	 },
});
