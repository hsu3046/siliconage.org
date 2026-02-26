<div align="center">
<img width="1200" height="475" alt="The Silicon Age" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![D3.js](https://img.shields.io/badge/D3.js-7-F9A03C?logo=d3.js&logoColor=white)](https://d3js.org/)
</div>

---

## 🇰🇷 Summary

**Silicon Age**는 트랜지스터부터 AI까지, 기술의 역사를 인터랙티브 네트워크 그래프로 시각화하는 오픈소스 웹 애플리케이션입니다. 기업·인물·기술 간의 숨겨진 연결고리를 탐색하세요.

## 🇺🇸 Summary

**Silicon Age** is an open-source interactive visualization of computing and AI history — from the transistor to modern AI. Explore the hidden connections between companies, people, and technologies through a force-directed knowledge graph.

## 🇯🇵 Summary

**Silicon Age**は、トランジスタからAIまでの技術史をインタラクティブなネットワークグラフで可視化するオープンソースWebアプリです。企業・人物・技術の隠れた「つながり」を探索できます。

---

## Features

- **🗺️ Map View** — D3.js force-directed graph with 200+ entities and their relationships
- **📅 History View** — Chronological timeline from 1947 to present
- **🃏 Card View** — Filterable, sortable card grid for all entities
- **🔗 Links View** — Relationship explorer tracing origins and impact
- **🤖 AI Deep Dive** — Gemini-powered analysis with Google Search grounding (BYOK)
- **🌐 i18n** — English, Korean, Japanese
- **📱 Responsive** — Desktop and mobile support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5.8 |
| Visualization | D3.js 7, Recharts |
| Styling | Tailwind CSS 3 |
| AI | Google Gemini API (optional, BYOK) |
| Build | Vite 6 |
| Routing | React Router 7 |
| Deploy | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/hsu3046/siliconage.org.git
cd siliconage.org

# Install dependencies
npm install

# Run development server (localhost:3000)
npm run dev
```

### API Key (Optional)

The app works fully without an API key using pre-generated static cache. To enable real-time AI analysis:

1. Get a free API key at [Google AI Studio](https://ai.google.dev/)
2. Open the app → click **About** → expand **API Key Settings**
3. Enter your key — it's stored locally in your browser only

Or for development scripts, create a `.env` file:
```bash
cp .env.example .env
# Edit .env with your key
```

## Scripts

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run preview          # Preview production build
npm run generate-cache   # Generate AI content static cache
npm run i18n:sync-all    # Full i18n sync (extract + translate)
```

## Architecture

```
├── App.tsx             # Root component, global state management
├── components/         # React components
│   ├── MapView.tsx     # D3.js force-directed graph
│   ├── HistoryView.tsx # Chronological timeline
│   ├── CardView.tsx    # Filterable card grid
│   ├── LinksView.tsx   # Relationship explorer
│   ├── DetailPanel.tsx # Node detail sidebar
│   └── AboutModal.tsx  # About page with API key settings
├── constants.ts        # All historical data (entities, links, eras)
├── services/
│   ├── geminiService.ts   # Gemini API integration (BYOK)
│   └── staticCache.ts     # Pre-generated AI responses
├── locales/            # i18n translations (en, ko, ja)
├── hooks/              # Custom React hooks
├── utils/              # Utilities (ranking, i18n, etc.)
└── scripts/            # Build-time scripts (cache gen, i18n)
```

## How Data Works

All entities are defined in `constants.ts` using builder functions:

```typescript
createCompany('apple', 'Apple', 1976, CompanyRole.PLATFORM, '...', { ... });
createTech('transformer', 'Transformer', 2017, TechRole.L0_THEORY_PHYSICS, '...');
createPerson('steve_jobs', 'Steve Jobs', 1955, PersonRole.VISIONARY, '...', { ... });

linkCreates('steve_jobs', 'apple', 'Co-founded Apple in a garage', 1976);
linkPowers('transformer', 'gpt', 'Foundation architecture for GPT');
```

## Contributing

Contributions are welcome! Here are some ways to help:

- **Add entities** — New companies, people, or technologies to `constants.ts`
- **Improve translations** — Update files in `locales/`
- **Fix bugs** — Check the Issues tab
- **Suggest features** — Open a Discussion

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- Built with AI collaboration (Gemini, Claude)
- Historical data curated from public sources
- Inspired by the curiosity of "How did we get here?"

---

<div align="center">
  <sub>© 2025 The Silicon Age Project</sub>
</div>
