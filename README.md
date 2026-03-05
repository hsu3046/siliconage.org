<div align="center">
<img width="1200" height="475" alt="The Silicon Age" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![D3.js](https://img.shields.io/badge/D3.js-7-F9A03C?logo=d3.js&logoColor=white)](https://d3js.org/)
</div>

---

## 🇰🇷 Summary

**Silicon Age**는 1947년 최초의 트랜지스터 발명부터 오늘날의 생성형 AI까지, **80년에 걸친 컴퓨팅 혁명의 역사**를 인터랙티브 네트워크 그래프로 시각화하는 오픈소스 웹 애플리케이션입니다. 200개 이상의 기업·인물·기술 노드와 그들 사이의 관계를 D3.js 기반 포스 그래프, 타임라인, 카드 뷰 등 다양한 시점에서 탐색할 수 있으며, Gemini AI를 활용한 딥 다이브 분석으로 각 노드의 맥락과 영향력을 깊이 있게 이해할 수 있습니다. "우리는 어떻게 여기까지 왔는가?"라는 질문에 대한 시각적 답을 찾아보세요.

## 🇺🇸 Summary

**Silicon Age** is an open-source interactive web application that maps **the entire arc of the computing revolution** — from the invention of the transistor in 1947 to the rise of generative AI today. With over 200 entities spanning companies, pioneers, and breakthrough technologies, it weaves their stories into a dynamic, explorable knowledge graph powered by D3.js. Switch between a force-directed map, chronological timeline, filterable card grid, and relationship explorer to uncover the hidden connections that shaped our digital world. Optional Gemini AI integration offers on-demand deep dives into any node's history and impact. Discover the answer to: *"How did we get here?"*

## 🇯🇵 Summary

**Silicon Age**は、1947年のトランジスタ発明から現在の生成AIに至るまで、**コンピューティング革命の80年の歴史**をインタラクティブなナレッジグラフで可視化するオープンソースWebアプリです。200以上の企業・人物・技術ノードとその関係性を、D3.jsフォースグラフ、タイムライン、カードビュー、リンクエクスプローラーなど多彩なビューで探索できます。Gemini AIによるディープダイブ分析機能も搭載し、各ノードの文脈と影響力を深く理解できます。「私たちはどうやってここまで来たのか？」——その答えを、ぜひ探してみてください。

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

This project is licensed under the [GNU General Public License v3.0](LICENSE).  
Copyright © 2025 [KnowAI](https://knowai.space). See [LICENSE](LICENSE) for details.

## Acknowledgments

- Built with AI collaboration (Gemini, Claude)
- Historical data curated from public sources
- Inspired by the curiosity of "How did we get here?"

---

<div align="center">
  <sub>© 2025 <a href="https://knowai.space">KnowAI</a> — Licensed under GNU GPL v3</sub>
</div>
