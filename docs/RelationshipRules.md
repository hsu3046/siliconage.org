# Silicon Age: Graph Relationship Rules (Unified)

This document defines the strict rules for connecting nodes in the Silicon Age graph.
These rules ensure a clean, logical, and user-friendly visualization of the tech ecosystem.

---

## 1. Core Principles (대원칙)

1.  **Single Connection (단일 연결):**
    - 두 노드 사이에는 가장 대표적이고 강력한 관계 **하나만** 연결한다. (중복 연결 금지)
2.  **Directionality (방향성):**
    - 화살표는 항상 **[주체/원인/하위] $\rightarrow$ [대상/결과/상위]** 방향으로 흐른다.
3.  **Semantic Naming (의미론적 명칭):**
    - 관계의 명칭은 개발 용어가 아닌 **'동사(Verb)'** 중심의 직관적인 단어를 사용한다.

---

## 2. Relationship Definitions (4대 관계)

| Type | Name | Meaning | Direction | Example |
| :--- | :--- | :--- | :--- | :--- |
| **CREATED** | **창조 / 출시** | "~가 ~를 만들었다/낳았다" | Creator $\rightarrow$ Creation | Founder $\rightarrow$ Company |
| **PART_OF** | **소속 / 분야** | "~는 ~의 일원/멤버다" | Member $\rightarrow$ Group | Employee $\rightarrow$ Company |
| **BASED_ON** | **기반 / 사용** | "~는 ~를 기반으로 한다/쓴다" | User $\rightarrow$ Infra | Product $\rightarrow$ Core Tech |
| **TRIGGERED**| **촉발 / 영향** | "~가 ~의 원인/계기가 되었다" | Cause $\rightarrow$ Effect | Investor $\rightarrow$ Company |

---

## 3. Detailed Rules by Source Node (상세 규칙)

### 🏢 1. COMPANY (기업)
*기업은 제품을 만들고, 인프라를 쓰며, 산업에 속하고, 사건을 일으킨다.*

- **$\rightarrow$ 🛠️ Product / Proprietary Tech (자사 제품)**
  - **Relation:** `CREATED`
  - **Logic:** 기업이 직접 만들었거나 소유한 독점 제품/기술.
  - *Ex: OpenAI $\rightarrow$ GPT-4, Apple $\rightarrow$ iPhone*

- **$\rightarrow$ 🛠️ Industry / Category (산업 분야)**
  - **Relation:** `PART_OF`
  - **Logic:** 기술 노드가 거대한 산업군(Category)일 때.
  - *Ex: Meta $\rightarrow$ SNS, NVIDIA $\rightarrow$ AI, TSMC $\rightarrow$ Semiconductor*

- **$\rightarrow$ 🛠️ External Tech / Infra (타사 인프라)**
  - **Relation:** `BASED_ON`
  - **Logic:** 기업이 만든 게 아니라 가져다 쓰는 핵심 인프라/기술.
  - *Ex: Netflix $\rightarrow$ AWS, Samsung $\rightarrow$ Android*

- **$\rightarrow$ 🏢 Company (Partner / Supply Chain)**
  - **Relation:** `BASED_ON`
  - **Logic:** 부품 공급사나 제조 파트너.
  - *Ex: Apple $\rightarrow$ Foxconn (제조), Qualcomm $\rightarrow$ TSMC (파운드리)*

- **$\rightarrow$ 🏢 Company (Parent Company)**
  - **Relation:** `PART_OF`
  - **Logic:** 인수합병 되었거나 지주회사의 자회사일 때.
  - *Ex: YouTube $\rightarrow$ Google, Instagram $\rightarrow$ Meta*

- **$\rightarrow$ 📜 Episode (Event)**
  - **Relation:** `TRIGGERED` (주동자) or `PART_OF` (참여자)
  - **Logic:** 사건을 직접 일으켰으면 Triggered, 휩쓸렸으면 Part Of.
  - *Ex: Samsung $\rightarrow$ Galaxy Launch (Triggered), Pets.com $\rightarrow$ Dot-com Bubble (Part Of)*

---

### 🧑‍💻 2. PERSON (인물)
*사람은 창조하고, 속하며, 영감을 준다.*

- **$\rightarrow$ 🏢 Company (Founder)**
  - **Relation:** `CREATED`
  - **Logic:** 창업자(Co-founder)인 경우. (가장 우선순위 높음)
  - *Ex: Jensen Huang $\rightarrow$ NVIDIA*

- **$\rightarrow$ 🏢 Company (Employee / CEO)**
  - **Relation:** `PART_OF`
  - **Logic:** 창업자가 아닌 전문경영인, 임원, 핵심 개발자.
  - *Ex: Tim Cook $\rightarrow$ Apple*

- **$\rightarrow$ 🏢 Company (Investor / External)**
  - **Relation:** `TRIGGERED`
  - **Logic:** 투자자, 규제자, 경쟁자로서 기업에 영향을 줌.
  - *Ex: Masayoshi Son $\rightarrow$ Uber (Investment)*

- **$\rightarrow$ 🛠️ Technology (Inventor)**
  - **Relation:** `CREATED`
  - **Logic:** 기술/이론을 직접 고안함.
  - *Ex: Satoshi Nakamoto $\rightarrow$ Bitcoin*

---

### 🛠️ 3. TECHNOLOGY (기술)
*기술은 다른 기술의 기반이 되거나, 진화를 촉발한다.*

- **$\rightarrow$ 🛠️ Technology (Dependency)**
  - **Relation:** `BASED_ON`
  - **Logic:** 기술 B가 없으면 A가 작동하지 않는 종속 관계.
  - *Ex: Android $\rightarrow$ Linux Kernel, GitHub $\rightarrow$ Git*

- **$\rightarrow$ 🛠️ Technology (Evolution / Inspiration)**
  - **Relation:** `TRIGGERED`
  - **Logic:** 직접적인 코드는 공유하지 않으나, 개념적 영감을 줌.
  - *Ex: Bitcoin $\rightarrow$ Ethereum, RNN $\rightarrow$ Transformer*

---

### 📜 4. EPISODE (사건)
*사건은 변화를 촉발한다.*

- **$\rightarrow$ 🏢 Company / 📜 Episode**
  - **Relation:** `TRIGGERED`
  - **Logic:** 사건의 결과로 회사가 설립되거나, 다른 사건이 터짐.
  - *Ex: 9/11 Terror $\rightarrow$ Palantir (Founding), Lehman Collapse $\rightarrow$ Financial Crisis*

---

## 4. Cheat Sheet (요약표)

| Source | Target | Relation | Meaning |
| :--- | :--- | :--- | :--- |
| **Company** | **Own Product** | `CREATED` | Made it |
| **Company** | **Industry** | `PART_OF` | Member of |
| **Company** | **Infra/Partner** | `BASED_ON` | Uses it |
| **Founder** | **Company** | `CREATED` | Founded it |
| **Employee** | **Company** | `PART_OF` | Works at |
| **Investor** | **Company** | `TRIGGERED` | Funded it |
| **Tech** | **Core Tech** | `BASED_ON` | Built on |
| **Tech** | **Next Gen Tech** | `TRIGGERED` | Inspired it |