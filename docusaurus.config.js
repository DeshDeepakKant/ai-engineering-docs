// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '2026 Production AI Engineering Hub',
  tagline: 'Production-Grade Notes, Architecture Diagrams & Code Walkthroughs (CampusX & Krish Naik)',
  favicon: 'img/favicon.ico',

  url: 'https://ai-engineering-hub.local',
  baseUrl: '/',

  organizationName: 'anya',
  projectName: 'ai-engineering-docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: '🤖 AI Engineering 2026',
        items: [
          {
            to: '/docs/roadmap',
            position: 'left',
            label: 'Curriculum Roadmap',
          },
          {
            type: 'docSidebar',
            sidebarId: 'courseSidebar',
            position: 'left',
            label: 'All Course Notes',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Core Backend & Orchestration',
            items: [
              { label: 'Module 1: Backend & Docker', to: '/docs/category/module-1-production-backend--docker' },
              { label: 'Module 2: LCEL & Local LLMs', to: '/docs/category/module-2-lcel-local-llms--tool-calling' },
              { label: 'Module 3: Advanced RAG & Memory', to: '/docs/category/module-3-advanced-rag--memory' },
              { label: 'Module 4: Agentic AI & LangGraph', to: '/docs/category/module-4-agentic-ai--langgraph' },
            ],
          },
          {
            title: 'Advanced Agentic & Production AI',
            items: [
              { label: 'Module 5: MCP & Claude Code', to: '/docs/category/module-5-mcp--claude-code' },
              { label: 'Module 6: LLM Evaluation', to: '/docs/category/module-6-llm-evaluation--observability' },
              { label: 'Module 7: Cloud AI & Fine-Tuning', to: '/docs/category/module-7-cloud-ai--lora-fine-tuning' },
            ],
          },
          {
            title: 'Curators & Sources',
            items: [
              { label: 'CampusX (Nitish Singh)', href: 'https://www.youtube.com/@CampusX-official' },
              { label: 'Krish Naik', href: 'https://www.youtube.com/@krishnaik06' },
            ],
          },
        ],
        copyright: `2026 Production AI Engineering Roadmap & Master Notes. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['python', 'bash', 'json', 'yaml', 'docker'],
      },
    }),
};

export default config;
