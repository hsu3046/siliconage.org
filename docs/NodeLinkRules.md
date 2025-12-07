# Silicon Valley Graph Database Protocols

이 문서는 실리콘밸리의 역사와 기술 생태계를 시각화하기 위한 노드(Node) 정의 및 연결(Link) 규칙을 기술합니다.

---

## 1. 노드 정의 (Node Definitions)

그래프는 **인물(Person), 회사(Company), 기술(Technology)** 3가지 핵심 노드로 구성됩니다.

### A. 인물 (Person)
역사를 만든 주체입니다.
*   **Role (`PersonRole`)**:
    *   `VISIONARY`: 창업자, CEO (예: Steve Jobs, Elon Musk)
    *   `THEORIST`: 이론가, 원천 기술 발명가 (예: Alan Turing, Geoffrey Hinton)
    *   `BUILDER`: 엔지니어, 해커 (예: Wozniak, Linus Torvalds)
    *   `LEADER`: 전문 경영인 (예: Tim Cook, Satya Nadella)
    *   `INVESTOR`: 벤처 캐피탈리스트 (예: Don Valentine)

### B. 회사 (Company)
자본과 기술이 모이는 조직입니다.
*   **Role (`CompanyRole`)**:
    *   `PLATFORM`: 거대 플랫폼 기업 (Google, Apple)
    *   `LAB`: 연구 중심 조직 (Bell Labs, OpenAI)
    *   `INFRA`: 하드웨어/공급망 (TSMC, Nvidia)
    *   `SERVICE`: 서비스/앱 (Uber, Netflix)
    *   `PRODUCT`: 하드웨어 제품 제조 (Tesla, DJI)
*   **ID Naming Convention**:
    *   서비스/제품명과 회사명이 같을 경우, 회사 ID에 `_co`를 붙입니다.
    *   예: 서비스 `spotify` (L3 Tech) ↔ 회사 `spotify_co` (Company)

### C. 기술 (Technology)
인물과 회사가 만들어낸 결과물이며, 다른 기술의 기반이 됩니다.
*   **Role (`TechRole`) - 계층 구조(Stack)**:
    *   `L0_THEORY_PHYSICS`: 물리 법칙, 수학적 이론 (Transistor, AI Theory)
    *   `L1_CORE_HARDWARE`: 반도체, 통신 프로토콜, 핵심 모델 (CPU, TCP/IP, Transformer)
    *   `L2_RUNTIME_PLATFORM`: OS, 언어, 클라우드, 프레임워크 (Linux, AWS, PyTorch)
    *   `L3_END_APPLICATION`: 최종 사용자 제품, 앱, 서비스 (iPhone, ChatGPT, Excel)

---

## 2. 연결 프로토콜 (The Silicon Protocol)

노드 간의 연결은 **중복을 피하고(No Triangles)**, **흐름(Flow)**을 명확히 하기 위해 아래 규칙을 엄격히 따릅니다.

### 🔗 Logic Matrix

| Source (출발) | Link Type | Target (도착) | 설명 및 조건 |
| :--- | :---: | :--- | :--- |
| **Person** | **Creates** | **Company** | **[창업]** 회사를 설립한 경우. (가장 우선순위 높음) |
| **Person** | **Creates** | **Tech** | **[발명]** 회사가 없거나, 이론/오픈소스 등 개인의 기여가 절대적인 경우. |
| **Person** | **Contributes** | **Company** | **[경영/투자]** CEO, 임원, 개인 자격의 엔젤 투자. |
| **Person** | **Contributes** | **Person** | **[멘토링]** 스승과 제자, 멘토와 멘티 관계. |
| | | | |
| **Company** | **Creates** | **Tech** | **[출시]** 회사가 제품/서비스/기술을 만듦. |
| **Company** | **Contributes** | **Company** | **[투자/계보]** VC의 투자, 인재 배출(Mafia), 스핀오프. |
| **Company** | **Engages** | **Company** | **[경쟁/동맹]** 라이벌(⚔️) 혹은 전략적 파트너(💖). |
| | | | |
| **Tech** | **Powers** | **Tech** | **[기반]** 하위 기술이 상위 기술을 구동. (L0→L1→L2→L3) |
| **Tech** | **Contributes** | **Tech** | **[진화]** 기술적 영향, 개념적 발전. |
| **Tech** | **Powers** | **Company** | **[인프라]** 회사가 생존하기 위해 필수적인 인프라/장비. |
| **Tech** | **Engages** | **Tech** | **[표준경쟁]** 기술 표준이나 플랫폼 간의 경쟁. |

---

## 3. 상세 규칙 및 예외 (Detailed Rules)

### 원칙 1: 창조의 흐름 (Flow of Creation)
*   **사람 → 회사 → 기술** 순서로 연결합니다.
*   *Bad:* Steve Jobs → iPhone (직접 연결 지양)
*   *Good:* Steve Jobs → Creates → Apple → Creates → iPhone

### 원칙 2: 기술 스택의 유연성 (Flexible Stack)
*   기본적으로 **L0 → L1 → L2 → L3** 순서를 따릅니다.
*   단, **중간 단계가 생략된 경우(Jump)** 연결을 허용합니다. (예: L0 Theory → L2 Algo)
*   **시간 역행 금지:** 미래의 기술이 과거의 기술을 Power 할 수 없습니다.

### 원칙 3: 공급망의 간접 연결 (Indirect Supply Chain)
*   회사끼리 직접 `Powers`로 연결하기보다, **핵심 기술(장비/인프라)**을 통해 연결합니다.
*   *Bad:* ASML → Powers → TSMC
*   *Good:* ASML → Creates → EUV(Tech) → Powers → TSMC

### 원칙 4: 투자와 자본 (Investment Logic)
*   **VC(법인)의 투자:** `VC Company` → Contributes → `Target Company`
*   **개인의 투자:** `Person` → Contributes → `Target Company`

### 원칙 5: 경쟁과 협력 (Rivalry & Partnership)
*   **Engages**는 기본적으로 경쟁(Rivalry)을 의미합니다.
*   협력 관계일 경우, 함수에 `LinkIcon.HEART`를 명시하거나 주석을 달아 구분합니다.

---

## 4. 데이터 예시 (Example Data)

```typescript
// 1. Person -> Company
linkCreates('elon_musk', 'spacex');

// 2. Company -> Tech
linkCreates('spacex', 'starship');

// 3. Tech -> Tech (Stack)
linkPowers('nvidia_h100', 'chatgpt'); // L1 -> L3 (Direct Power)

// 4. Tech -> Company (Infrastructure)
linkPowers('euv', 'tsmc'); // EUV Tech powers TSMC Factory

// 5. Company -> Company (Investment/Mafia)
linkContributes('paypal_co', 'sequoia'); // Roelof Botha (Mafia connection)
linkContributes('sequoia', 'apple'); // Investment

// 6. Rivals
linkEngages('google', 'microsoft');