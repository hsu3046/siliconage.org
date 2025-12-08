# Label Generation Rules
이 문서는 Node의 종류와 Node와 Node 사이의 관계에 따라 생성되는 관계 문장의 규칙을 정의합니다.
이 관계 문장은, History View / Links View / Detail Panel 등에 사용됩니다.

- 1. Company
- 2. Person to Company
- 3. Person to Technology
- 4. Company to Company
- 5. Person to Person
- 6. Company to Technology
- 7. Technology to Company
- 8. Technology to Technology


## 1. Company (회사)
회사 노드는 유일하게 **설립 연도(Year)**를 문장에 포함합니다.

### 기본 포맷
> **{Company Name} was founded in {Year}**

### 예시
*   **Apple was founded in 1976**
*   **Google was founded in 1998**

---

## 2. Person to Company (인물 → 회사)
인물 노드의 서브타이틀은 **연도(Year)를 포함하지 않으며**, 타겟 노드와의 **관계(LinkType)** 및 인물의 **역할(PersonRole)**에 따라 동사가 결정됩니다.

### 기본 포맷
> **{Person Name} {Verb} {Target Name}**

### 규칙 상세 (Person → Company)
| Link Type | Person Role | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **CREATES** | *All Roles* | **founded** | **Steve Jobs founded Apple** |
| **CONTRIBUTES** | `LEADER` | **served at** | **Tim Cook served at Apple** |
| **CONTRIBUTES** | `INVESTOR` | **invested in** | **Masayoshi Son invested in Alibaba** |
| **CONTRIBUTES** | *Others* <br>(Visionary, Builder, Theorist) | **significantly impacted** | **Steve Wozniak significantly impacted Apple** |
| **POWERS** | *All Roles* | *(N/A)* | *Link 성립 안 함* |
| **ENGAGES** | *All Roles* | *(N/A)* | *Link 성립 안 함* |

---

## 3. Person to Technology (인물 → 기술)

인물이 기술에 관여했을 때 생성되는 문장 규칙입니다. **연도(Year)는 포함하지 않습니다.**
목적어인 **[기술 종류]**는 효율적인 규칙 적용을 위해 아래 4가지 그룹으로 분류하여 적용합니다.

> **📂 Tech Group 정의**
> *   **Group A (Physical):** Hardware, Manufacturing, Robotics, Telecom (물리적 기술)
> *   **Group B (Software):** OS, Languages, AI, Crypto (소프트웨어/지능)
> *   **Group C (Service):** Social Media, Search, Platforms (서비스/플랫폼)
> *   **Group D (Abstract):** Theories, Protocols, Standards (이론/표준)

> **📂 Tech Group ↔ TechCategoryL1 매핑표**
> | Tech Group | TechCategoryL1 값 |
> | :--- | :--- |
> | **Group A** | `Hardware & Infrastructure` |
> | **Group B** | `System Software`, `AI & Physical Systems` |
> | **Group C** | `Digital Services & Platforms`, `Network & Connectivity` |
> | **Group D** | `Fundamental Concepts` |

> **⚠️ N/A 케이스 Fallback 규칙**
> 요약표에서 `(N/A)`로 표시된 조합이 발생할 경우, 아래 기본 동사를 사용:
> - **CREATES (N/A)** → `"created"`
> - **CONTRIBUTES (N/A)** → `"contributed to"`
> - **POWERS (N/A)** → `"powers"`
> - **ENGAGES (N/A)** → `"engaged with"`


### 기본 포맷
> **{Person Name} {Verb} {Tech Name}**

### 3-1. Role: VISIONARY (창업가, 비전가)
*성격: 무언가를 처음 시작하거나, 세상에 없던 개념을 제시하고 출시함.*

| Link Type | Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **CREATES** | Group A, B (Hard/Soft) | **pioneered** | **Steve Jobs pioneered iPhone** |
| **CREATES** | Group C (Service) | **launched** | **Mark Zuckerberg launched Facebook** |
| **CREATES** | Group D (Abstract) | **envisioned** | **Tim Berners-Lee envisioned WWW** |
| **CONTRIBUTES** | *All Groups* | **championed** | **Elon Musk championed Mars Colonization** |

### 3-2. Role: THEORIST (이론가, 학자)
*성격: 원천 기술을 발명하거나, 이론적 토대를 정립함.*

| Link Type | Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **CREATES** | Group A, B (Hard/Soft) | **invented** | **William Shockley invented Transistor** |
| **CREATES** | Group D (Abstract) | **formulated** | **Claude Shannon formulated Information Theory** |
| **CREATES** | Group D (Specific) | **theorized** | **Alan Turing theorized Turing Machine** |
| **CONTRIBUTES** | *All Groups* | **advanced** | **Geoffrey Hinton advanced Deep Learning** |

### 3-3. Role: BUILDER (엔지니어, 설계자)
*성격: 실제로 손을 움직여 만들고, 코드를 짜고, 설계함.*

| Link Type | Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **CREATES** | Group A (Physical) | **engineered** | **Steve Wozniak engineered Apple I** |
| **CREATES** | Group B (Software) | **built** | **Linus Torvalds built Linux Kernel** |
| **CREATES** | Group C (Service) | **architected** | **Jack Dorsey architected Twitter** |
| **CREATES** | Group D (Abstract) | **drafted** | **Vint Cerf drafted TCP/IP** |
| **CONTRIBUTES** | *All Groups* | **developed** | **Dennis Ritchie developed C Language** |

### 3-4. Role: LEADER (경영자, 임원)
*성격: 프로젝트를 총괄 지휘하거나, 이미 있는 기술을 확장시킴.*

| Link Type | Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **CREATES** | *All Groups* | **spearheaded** | **Satya Nadella spearheaded Azure** |
| **CONTRIBUTES** | Group C (Service) | **directed** | **Sundar Pichai directed Google Chrome** |
| **CONTRIBUTES** | Group A (Physical) | **scaled** | **Tim Cook scaled iPhone Supply Chain** |
| **CONTRIBUTES** | *Others* | **oversaw** | **Sheryl Sandberg oversaw Ad Business** |

### 3-5. Role: INVESTOR (투자자)
*성격: 자금을 대어 기술의 탄생을 돕거나 성장을 지원함.*

| Link Type | Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **CREATES** | *All Groups* | **seed-funded** | **Paul Graham seed-funded Airbnb** |
| **CONTRIBUTES** | *All Groups* | **backed** | **Peter Thiel backed Facebook** |
| **CONTRIBUTES** | *Alternative* | **funded** | **Masayoshi Son funded AI Robotics** |

## 3-6. 요약 (Verb Matrix)

구현 시 참고할 동사 매핑 테이블입니다.

| Role \ Link | CREATES (Hard/Soft) | CREATES (Service) | CREATES (Theory) | CONTRIBUTES |
| :--- | :--- | :--- | :--- | :--- |
| **VISIONARY** | pioneered | launched | envisioned | championed |
| **THEORIST** | invented | (N/A) | formulated / theorized | advanced |
| **BUILDER** | engineered / built | architected | drafted | developed |
| **LEADER** | spearheaded | spearheaded | (N/A) | scaled / oversaw |
| **INVESTOR** | seed-funded | seed-funded | (N/A) | backed / funded |


---

## 4. Company to Company (기업 → 기업)

기업 간의 관계를 설명하는 문장입니다. **연도(Year)는 포함하지 않습니다.**

### 기본 포맷
> **{Source Company} {Verb} {Target Company}**

### 4-1. Link Type: CREATES (설립, 분사)
*상황: 모회사가 자회사를 설립하거나, 연구소를 세운 경우.*

| Source Category | Target Category | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| *All* | `ACADEMY_LAB` | **established** | **AT&T established Bell Labs** |
| *All* | *All* | **spun off** | **Fairchild spun off Intel** (역사적 맥락에 따라 established/spun off 혼용) |

### 4-2. Link Type: POWERS (공급망, 인프라)
*상황: B2B 기업이 고객사에게 핵심 부품이나 인프라를 공급하는 경우.*

| Source Category | Target Category | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| `MANUFACTURING_SUPPLY` | `CONSUMER_DEVICE` | **manufactures chips for** | **TSMC manufactures chips for Apple** |
| `MANUFACTURING_SUPPLY` | `SEMICONDUCTOR` | **supplies equipment to** | **ASML supplies equipment to Samsung** |
| `INFRA_TELECOM` | *All* | **provides infrastructure to** | **Cisco provides infrastructure to AT&T** |
| *Default* | *All* | **powers** | **Microsoft powers OpenAI** (Cloud/Compute 관점) |

### 4-3. Link Type: CONTRIBUTES (투자, 인수)
*상황: 벤처 캐피탈의 투자 혹은 거대 기업의 전략적 인수/투자.*

| Source Category | Verb | Example Sentence |
| :--- | :--- | :--- |
| `VENTURE_CAPITAL` | **funded** | **SoftBank funded Alibaba** |
| `PLATFORM_INTERNET` | **acquired** | **Google acquired DeepMind** |
| `ENTERPRISE_SAAS` | **strategically backed** | **Microsoft strategically backed OpenAI** |
| *Default* | **invested in** | **Tencent invested in Tesla** |

### 4-4. Link Type: ENGAGES (경쟁 및 협력)
*상황: 시장에서의 라이벌 관계 또는 전략적 파트너십.*
*구분: 아이콘(`LinkIcon`) 속성으로 판단.*

| Icon Type | Verb | Example Sentence |
| :--- | :--- | :--- |
| `RIVALRY` (🥊) | **competes with** | **Apple competes with Samsung** |
| `HEART` (❤️) | **partners with** | **Apple partners with ARM Holdings** |
| *Default* | **engages with** | **Meta engages with TikTok** |

## 4-5. 요약 (Company Verb Matrix)

| Link Type | Sub-Condition | Verb | Context |
| :--- | :--- | :--- | :--- |
| **CREATES** | - | **established** | 자회사/연구소 설립 |
| **POWERS** | Source: Mfg/Supply | **manufactures for** | 제조/공급 |
| **POWERS** | Source: Infra | **supplies to** | 장비/인프라 제공 |
| **CONTRIBUTES** | Source: VC | **funded** | 자금 투자 |
| **CONTRIBUTES** | Source: Big Tech | **acquired** | 인수 합병 |
| **ENGAGES** | Icon: Rivalry | **competes with** | 경쟁 관계 |
| **ENGAGES** | Icon: Heart | **partners with** | 협력 관계 |


---


## 5. Person to Person (인물 → 인물)

인물 간의 관계는 **연도(Year)를 포함하지 않습니다.**
크게 **경쟁(Rival)**, **협력(Partner)**, 그리고 데이터상 존재하는 **멘토링(Influence)** 세 가지로 분류됩니다.

### 기본 포맷
> **{Source Person} {Verb} {Target Person}**

### 5-1. Link Type: ENGAGES (Icon: RIVALRY 🥊)
*상황: 세기의 라이벌, 이념 대립, 기술 표준 전쟁.*

| Source Role | Target Role | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| `VISIONARY` | `VISIONARY` | **clashed with** | **Steve Jobs clashed with Bill Gates** |
| `THEORIST` | `THEORIST` | **debated with** | **Yann LeCun debated with Elon Musk** |
| `LEADER` | `LEADER` | **rivaled** | **Tim Cook rivaled Mark Zuckerberg** |
| *Default* | *All* | **competed with** | **Samsung CEO competed with Apple CEO** |

### 5-2. Link Type: ENGAGES (Icon: HEART ❤️)
*상황: 공동 창업자, 영혼의 파트너, 전략적 제휴.*

| Source Role | Target Role | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| `VISIONARY` | `BUILDER` | **co-founded with** | **Steve Jobs co-founded with Steve Wozniak** |
| `BUILDER` | `VISIONARY` | **built alongside** | **Steve Wozniak built alongside Steve Jobs** |
| `THEORIST` | `THEORIST` | **collaborated with** | **Geoffrey Hinton collaborated with Yann LeCun** |
| *Default* | *All* | **partnered with** | **Microsoft CEO partnered with OpenAI CEO** |

### 5-3. Link Type: CONTRIBUTES (Mentorship & Lineage)
*참고: 데이터셋(`constants.ts`)의 `linkContributes` (예: Shockley -> Noyce)를 처리하기 위한 규칙입니다.*

| Source Role | Verb | Example Sentence |
| :--- | :--- | :--- |
| `INVESTOR` | **backed** | **Don Valentine backed Steve Jobs** |
| `THEORIST` | **taught** | **William Shockley taught Robert Noyce** |
| `LEADER` | **guided** | **Bill Campbell guided Steve Jobs** |
| *Default* | **mentored** | **Paul Graham mentored Sam Altman** |

---

## 5-4. 요약 (Person-to-Person Verb Matrix)

| Link Type | Icon/Condition | Verb | Context |
| :--- | :--- | :--- | :--- |
| **ENGAGES** | 🥊 Rivalry | **clashed with** / **competed with** | 라이벌 관계 |
| **ENGAGES** | ❤️ Heart | **partnered with** / **collaborated with** | 파트너십 |
| **CONTRIBUTES** | (Invest) | **backed** | 투자자 → 창업자 |
| **CONTRIBUTES** | (Teach) | **taught** / **mentored** | 스승 → 제자 |


---

## 6. Company to Technology (기업 → 기술)

기업이 기술/제품에 관여했을 때의 문장입니다. **연도(Year)는 포함하지 않습니다.**

### 기본 포맷
> **{Company Name} {Verb} {Tech Name}**

### 6-1. Link Type: CREATES (출시, 발명, 개발)
*상황: 제품 출시, 원천 기술 개발, 서비스 오픈.*

**A. Source: ACADEMY_LAB (연구소)**
*성격: 상업적 출시보다는 과학적/공학적 발명.*

| Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- |
| **Group A, D** (Physical/Theory) | **invented** | **Bell Labs invented Transistor** |
| **Group B** (Software/AI) | **developed** | **DeepMind developed AlphaGo** |
| *Default* | **created** | **Xerox PARC created Ethernet** |

**B. Source: CONSUMER_DEVICE (하드웨어 제조사)**
*성격: 대중에게 제품을 공개하고 판매함.*

| Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- |
| **Group A** (Hardware) | **introduced** | **Apple introduced iPhone** |
| **Group A** (Vehicle/Robot) | **unveiled** | **Tesla unveiled Model S** |
| *Default* | **launched** | **Sony launched Walkman** |

**C. Source: PLATFORM_INTERNET / ENTERPRISE_SAAS**
*성격: 소프트웨어 배포, 서비스 런칭.*

| Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- |
| **Group C** (Service) | **launched** | **Google launched Google Search** |
| **Group B** (Software/AI) | **released** | **Microsoft released Windows 95** |
| **Group B** (Open Source) | **open-sourced** | **Meta open-sourced PyTorch** |
| *Default* | **built** | **Amazon built AWS Cloud** |

**D. Source: MANUFACTURING_SUPPLY (제조/공급)**
*성격: 공정 기술 개발, 대량 생산.*

| Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- |
| **Group A** (Chip/Infra) | **commercialized** | **TSMC commercialized Foundry Model** |
| **Group A** (Equipment) | **engineered** | **ASML engineered EUV Lithography** |
| *Default* | **produced** | **Intel produced Microprocessor** |

---

### 6-2. Link Type: POWERS (구동, 가속)
*상황: 회사의 핵심 역량이 특정 기술을 구동하거나 가속화함.*

| Source Category | Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| `SEMICONDUCTOR` | **Group B** (AI) | **accelerates** | **NVIDIA accelerates ChatGPT** |
| `INFRA_TELECOM` | **Group A** (Network) | **powers** | **Cisco powers Internet Backbone** |
| *Default* | *All* | **drives** | **Google drives Transformer** |

---

### 6-3. Link Type: CONTRIBUTES (기여, 표준화)
*상황: 기술의 발전, 표준화, 혹은 생태계 확장에 기여함.*

| Tech Group | Verb | Example Sentence |
| :--- | :--- | :--- |
| **Group D** (Standard) | **standardized** | **Qualcomm standardized CDMA** |
| **Group C** (Platform) | **popularized** | **Netflix popularized Streaming** |
| *Default* | **advanced** | **Samsung advanced OLED** |

---

## 6-4. 요약 (Company-to-Tech Verb Matrix)

| Company Category | Link Type | Tech Type | Verb |
| :--- | :--- | :--- | :--- |
| **LAB** | CREATES | Physical | **invented** |
| **DEVICE** | CREATES | Hardware | **introduced** / **unveiled** |
| **PLATFORM** | CREATES | Service | **launched** |
| **PLATFORM** | CREATES | Software | **released** |
| **MFG/SUPPLY** | CREATES | Process | **commercialized** |
| **SEMICONDUCTOR**| POWERS | AI/Soft | **accelerates** |
| *All* | CONTRIBUTES | Standard | **standardized** |
| *All* | CONTRIBUTES | Service | **popularized** |


---

## 7. Technology to Company (기술 → 기업)

기술이 기업의 인프라나 핵심 역량으로 작용할 때의 문장입니다. **연도(Year)는 포함하지 않습니다.**

### 기본 포맷
> **{Tech Name} {Verb} {Company Name}**

### 7-1. Link Type: POWERS (구동, 기반, 인프라)
*상황: 기술이 회사의 서비스나 제조 공정의 핵심 동력이 됨.*

**A. Tech Group: Hardware & Infrastructure (물리적 기반)**
*   *L1: Hardware / Components / Processors*
*   *뉘앙스: 공장을 돌리거나, 장비가 돌아가게 함.*

| Tech Name | Company Category | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **EUV Lithography** | `MANUFACTURING_SUPPLY` (TSMC) | **enables manufacturing at** | **EUV Lithography enables manufacturing at TSMC** |
| **NVIDIA H100** | `AI_INNOVATION` (OpenAI) | **accelerates** | **NVIDIA H100 accelerates OpenAI** |
| **Cisco Router** | `INFRA_TELECOM` (AT&T) | **forms the backbone of** | **Cisco Router forms the backbone of AT&T** |
| *Default* | *All* | **powers** | **Li-ion Battery powers Tesla** |

**B. Tech Group: Software & Platforms (소프트웨어 기반)**
*   *L1: System Software / Cloud / OS*
*   *뉘앙스: 서비스가 그 위에서 돌아감.*

| Tech Name | Company Category | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **AWS Cloud** | `MEDIA_CONTENT` (Netflix) | **runs** | **AWS Cloud runs Netflix** |
| **Android** | `CONSUMER_DEVICE` (Samsung) | **powers devices by** | **Android powers devices by Samsung** |
| **Oracle Database** | `ENTERPRISE_SAAS` (Salesforce)| **supports** | **Oracle Database supports Salesforce** |
| *Default* | *All* | **powers** | **Linux powers Google** |

**C. Tech Group: Security & Protocols (보안/통신)**
*   *L1: Fundamental Concepts / Network*
*   *뉘앙스: 회사의 거래나 통신을 안전하게 지킴.*

| Tech Name | Verb | Example Sentence |
| :--- | :--- | :--- |
| **SSL/TLS**, **RSA** | **secures** | **SSL/TLS secures PayPal** |
| **Zero Trust** | **protects** | **Zero Trust protects Salesforce** |
| **Optical Fiber** | **connects** | **Optical Fiber connects AT&T** |

### 7-2. Link Type: CONTRIBUTES (기여, 혁신)
*상황: 특정 기술이 회사의 성장이나 비즈니스 모델 전환에 결정적 기여를 함.*

| Tech Role | Verb | Example Sentence |
| :--- | :--- | :--- |
| `FOUNDATION` (Theory) | **laid the foundation for** | **Information Theory laid the foundation for Qualcomm** |
| `APPLICATION` (AI Model) | **revolutionized** | **Transformer revolutionized Google** |
| *Default* | **advanced** | **Flash Memory advanced Samsung** |

---

## 7-3. 요약 (Tech-to-Company Verb Matrix)

| Tech Type | Link Type | Verb | Context |
| :--- | :--- | :--- | :--- |
| **Hardware/Mfg** | POWERS | **enables manufacturing at** | 제조 장비 → 제조사 |
| **Chip/GPU** | POWERS | **accelerates** | AI 칩 → AI 기업 |
| **Cloud/OS** | POWERS | **runs** | 클라우드 → 서비스 기업 |
| **Security** | POWERS | **secures** | 보안 기술 → 핀테크/SaaS |
| **Network** | POWERS | **connects** | 통신망 → 통신사 |
| **Core Infra** | POWERS | **powers** | (일반적) 인프라 제공 |
| **Theory** | CONTRIBUTES| **laid the foundation for** | 이론 → 기업 |


---
## 8. Technology to Technology (기술 → 기술)

기술 간의 상호작용 및 발전사를 설명하는 문장입니다. **연도(Year)는 포함하지 않습니다.**
기술과 기술 간의 관계(**Technology to Technology**)는 크게 세 가지 맥락으로 나뉩니다:
1.  **계층적 구동 (The Stack)**: 하드웨어가 소프트웨어를, OS가 앱을 실행함.
2.  **진화와 파생 (Evolution)**: 구기술이 신기술의 토대가 됨.
3.  **기반 이론 (Foundation)**: 이론이 실제 구현 기술의 근간이 됨.

`LinkType`(`POWERS`, `CONTRIBUTES`)과 기술의 `Role`/`Category`를 조합하여 가장 직관적인 문장을 구성했습니다.

### 기본 포맷
> **{Source Tech} {Verb} {Target Tech}**

### 8-1. Link Type: POWERS (구동, 실행, 가속)
*상황: 기술 스택(Stack) 상에서 하위 기술이 상위 기술을 작동시킴.*

**A. Source: Hardware & Chips (L1)**
*뉘앙스: 물리적 장치가 소프트웨어나 시스템을 돌아가게 함.*

| Source Condition | Target Condition | Verb | Example Sentence |
| :--- | :--- | :--- | :--- |
| **GPU / AI Chip** | **AI / Model** | **accelerates** | **NVIDIA H100 accelerates GPT-4** |
| **Processor** | **OS / Software** | **executes** | **Microprocessor executes Unix** |
| *Default* | *All* | **powers** | **Li-ion Battery powers iPhone** |

**B. Source: Platform & OS (L2)**
*뉘앙스: 운영체제나 런타임 위에서 애플리케이션이 실행됨.*

| Source Condition | Verb | Example Sentence |
| :--- | :--- | :--- |
| `Operating Systems` (iOS, Android) | **runs** | **iOS runs iPhone** |
| `Cloud` (AWS) | **hosts** | **AWS Cloud hosts Netflix** |
| `Runtime` (Node, Java) | **enables** | **Java enables Android** |

**C. Source: Network & Security**
*뉘앙스: 통신망이 서비스를 연결하거나 보안 기술이 데이터를 보호함.*

| Source Condition | Verb | Example Sentence |
| :--- | :--- | :--- |
| `Network` (5G, Fiber) | **connects** | **Optical Fiber connects The Internet** |
| `Protocol` (TCP/IP) | **underpins** | **TCP/IP underpins World Wide Web** |
| `Security` (SSL, RSA) | **secures** | **RSA Encryption secures SSL/TLS** |

### 8-2. Link Type: CONTRIBUTES (진화, 기반, 핵심 요소)
*상황: 역사적 선행 기술이거나, 핵심 구성 요소로 포함됨.*

**A. Source: Theory & Foundation (L0)**
*뉘앙스: 이론이 실용 기술의 수학적/물리적 토대가 됨.*

| Source Role | Verb | Example Sentence |
| :--- | :--- | :--- |
| `FOUNDATION` | **forms the basis of** | **Information Theory forms the basis of CDMA** |
| *Default* | **made possible** | **Transistor made possible Integrated Circuit** |

**B. Source: AI Model & Algorithm**
*뉘앙스: 특정 알고리즘이나 모델 구조가 서비스의 핵심 엔진임.*

| Source Category | Verb | Example Sentence |
| :--- | :--- | :--- |
| `AI & Physical Systems` | **is the engine behind** | **Transformer is the engine behind ChatGPT** |
| `Fundamental Concepts` | **is used in** | **Backpropagation is used in Deep Learning** |

**C. Source: Manufacturing (제조 공정)**
*뉘앙스: 장비나 공정 기술이 칩/제품 생산을 가능하게 함.*

| Source Name | Verb | Example Sentence |
| :--- | :--- | :--- |
| **Lithography**, **EUV** | **enables creation of** | **EUV Lithography enables creation of 3nm Chips** |
| *Default* | **is essential for** | **Rare Earths is essential for EV Battery** |

**D. Evolution (Legacy -> Modern)**
*뉘앙스: 구버전 기술이 신버전으로 진화하거나 영감을 줌.*

| Relationship | Verb | Example Sentence |
| :--- | :--- | :--- |
| (Generic Evolution) | **paved the way for** | **Unix paved the way for Linux** |
| (Direct Ancestor) | **evolved into** | **GSM evolved into LTE** |

---

## 8-3. 요약 (Tech-to-Tech Verb Matrix)

| Link Type | Source Type | Target Type | Verb | Context |
| :--- | :--- | :--- | :--- | :--- |
| **POWERS** | GPU/AI Chip | AI | **accelerates** | AI 연산 가속 |
| **POWERS** | OS/Platform | App/Device | **runs** | 실행 환경 제공 |
| **POWERS** | Protocol | Service | **underpins** | 기반 프로토콜 |
| **POWERS** | Security | Tech | **secures** | 보안 적용 |
| **CONTRIBUTES**| Theory | Tech | **forms the basis of** | 이론적 토대 |
| **CONTRIBUTES**| AI Model | Service | **is the engine behind**| 핵심 알고리즘 |
| **CONTRIBUTES**| Mfg Process | Chip | **enables creation of**| 제조 가능케 함 |
| **CONTRIBUTES**| Old Tech | New Tech | **paved the way for** | 기술적 진화 |