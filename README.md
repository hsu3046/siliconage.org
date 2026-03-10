# 🧬 The Silicon Age

## Tagline-en

Technology didn't evolve in isolation — every breakthrough was caused by something before it.
The Silicon Age connects 100 years of digital history into a visual web of cause and effect, so you can see *why* things happened, not just *what* happened.

## Tagline-ko

기술은 혼자 발전하지 않았습니다 — 모든 혁신에는 그 전에 일어난 원인이 있었습니다.
The Silicon Age는 100년 디지털 역사를 점과 점의 나열이 아닌, 인과관계와 영향력의 시각적 네트워크로 연결합니다. '무엇이' 일어났는지가 아니라, '왜' 일어났는지를 직관적으로 탐구하세요.

## Tagline-ja

テクノロジーは孤立して進化したのではありません——すべてのブレイクスルーには、その前に起きた原因がありました。
The Silicon Ageは100年のデジタル史を断片的な情報の羅列ではなく、因果関係と影響力のビジュアルネットワークとしてつなぎます。「何が」起きたかではなく、「なぜ」起きたかを直感的に探求してください。

---

## Summary-en

We learn tech history as isolated facts — the transistor, the internet, the iPhone, ChatGPT — as if each one appeared out of thin air. But in reality, every innovation was triggered by a chain of causes, rivalries, and collaborations stretching back decades. The Silicon Age makes those invisible threads visible. It maps 200+ companies, pioneers, and technologies across a century of digital evolution into an interactive knowledge graph where you can *see* the cause-and-effect relationships, trace how one invention made another possible, and discover why certain breakthroughs happened exactly when they did. Navigate a force-directed galaxy map, scroll a living timeline, or let AI unpack any connection in depth. This isn't a list of facts — it's history you can finally *see*.

## Summary-ko

우리는 기술의 역사를 단편적으로 배웁니다 — 트랜지스터, 인터넷, 아이폰, ChatGPT — 마치 각각이 갑자기 하늘에서 떨어진 것처럼요. 하지만 현실에서 모든 혁신은 수십 년에 걸친 인과관계, 경쟁, 협력의 사슬 위에서 탄생했습니다. The Silicon Age는 그 보이지 않던 연결 고리를 눈에 보이게 만듭니다. 100년 디지털 역사 속 200개 이상의 기업·인물·기술을 인터랙티브 지식 그래프 위에 펼쳐, 하나의 발명이 어떻게 다음 혁신을 가능하게 했는지, 왜 특정 기술이 바로 그 시점에 등장했는지를 시각적으로 탐구할 수 있습니다. 포스 그래프로 전체 지형을 조망하고, 타임라인으로 역사의 흐름을 따라가고, AI로 궁금한 관계를 깊이 파고들어 보세요. 사실의 나열이 아닌, 드디어 *보이는* 역사입니다.

## Summary-ja

私たちはテクノロジーの歴史を断片的に学んできました——トランジスタ、インターネット、iPhone、ChatGPT——まるでそれぞれが突然現れたかのように。しかし現実では、すべてのイノベーションは数十年にわたる因果関係、競争、協力の連鎖の上に生まれたものです。The Silicon Ageは、その見えなかったつながりを可視化します。100年のデジタル史における200以上の企業・人物・技術をインタラクティブなナレッジグラフに展開し、一つの発明がどのように次の革新を可能にしたか、なぜ特定の技術がまさにその時に登場したかを視覚的に探求できます。フォースグラフで全体像を俯瞰し、タイムラインで歴史の流れを辿り、AIで気になるつながりを深掘りしてください。事実の羅列ではなく、ようやく*見える*歴史です。

---

## ✨ What It Does

- **Visualizes the entire computing universe** — 200+ entities rendered as a force-directed galaxy map using D3.js, revealing clusters and hidden connections at a glance.
- **Traces history on a living timeline** — Scroll from 1947 to the present, watching eras unfold and pivotal moments light up in chronological order.
- **Filters and sorts with a card grid** — Browse companies, people, and technologies through a searchable, filterable card view organized by era, category, and influence.
- **Explores relationships in depth** — A dedicated link explorer traces origin chains, rivalry webs, and technology lineages between any two nodes.
- **Delivers AI-powered deep dives** — Optional Gemini AI integration generates on-demand analysis of any entity's history, rivals, and lasting impact — grounded with Google Search.
- **Speaks three languages natively** — Full English, Korean, and Japanese interfaces with culturally adapted content, not just machine translations.
- **Works beautifully on any screen** — Responsive design optimized for both desktop exploration and mobile browsing.

---

## 🚀 Try It Now

👉 **[Live Demo](https://siliconage.org)**

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Language | TypeScript 5.8 (Strict) |
| Visualization | D3.js 7, Recharts |
| Styling | Tailwind CSS 3 |
| AI Integration | Google Gemini API (BYOK, Optional) |
| Routing | React Router 7 |
| Build | Vite 6 |
| Analytics | Vercel Analytics, Speed Insights |
| Deploy | Vercel |

---

## 📦 Installation

```bash
git clone https://github.com/hsu3046/siliconage.org.git
cd siliconage.org
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### API Key (Optional)

The app works fully without an API key — all AI content is pre-cached as static data. To enable real-time Gemini analysis:

1. Get a free key at [Google AI Studio](https://ai.google.dev/)
2. In the app, click **About** → expand **API Key Settings** → paste your key
3. Your key stays in your browser's local storage only — never sent to our servers

For build-time scripts:

```bash
cp .env.example .env
# Edit .env with your VITE_GOOGLE_API_KEY
```

---

## 📁 Project Structure

```
├── App.tsx                 # Root component, global state & routing
├── constants.ts            # All historical data (entities, links, eras)
├── types.ts                # TypeScript type definitions
├── index.tsx               # Entry point
├── index.css               # Global styles & Tailwind directives
├── components/
│   ├── MapView.tsx         # D3.js force-directed graph
│   ├── HistoryView.tsx     # Chronological timeline
│   ├── CardView.tsx        # Filterable card grid
│   ├── LinksView.tsx       # Relationship explorer
│   ├── DetailPanel.tsx     # Node detail sidebar
│   ├── AboutModal.tsx      # About page & API key settings
│   ├── ChangeLog.tsx       # Version changelog
│   ├── Tutorial.tsx        # Interactive onboarding
│   ├── WelcomeModal.tsx    # First-visit welcome
│   ├── Logo.tsx            # Animated logo component
│   ├── SEOHead.tsx         # Dynamic SEO meta tags
│   └── debug/              # Debug & diagnostic tools
├── services/
│   ├── geminiService.ts    # Gemini API integration (BYOK)
│   └── staticCache.ts      # Pre-generated AI response cache
├── hooks/                  # Custom React hooks
├── utils/                  # Utilities (ranking, i18n, formatting)
├── locales/                # i18n translations (en, ko, ja)
├── scripts/                # Build-time scripts (cache gen, i18n sync)
├── config/                 # App configuration
├── public/                 # Static assets
└── docs/                   # Internal documentation
```

---

## 🗺 Roadmap

- [ ] Search with natural language queries
- [ ] Interactive "What-if" scenario mode
- [ ] Community-contributed entity submissions
- [ ] Graph comparison mode (side-by-side era comparison)
- [ ] Shareable deep-link to any node or view state
- [ ] Offline PWA support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

**Some great ways to contribute:**

- 📊 **Add entities** — New companies, people, or technologies to `constants.ts`
- 🌐 **Improve translations** — Refine content in `locales/`
- 🐛 **Fix bugs** — Check the [Issues](https://github.com/hsu3046/siliconage.org/issues) tab
- 💡 **Suggest features** — Open a [Discussion](https://github.com/hsu3046/siliconage.org/discussions)

---

## 📄 License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).  
Copyright © 2026 [KnowAI](https://knowai.space). See [LICENSE](LICENSE) for details.

---

*Built by [KnowAI](https://knowai.space) · © 2026 KnowAI*
