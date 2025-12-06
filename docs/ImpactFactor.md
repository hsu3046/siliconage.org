# Impact Factor 3.0 Algorithm

The **Impact Factor** is a proprietary metric designed for *The Silicon Age* project. Version 3.0 introduces "Role-Based Weighting" to better reflect the qualitative differences between entities (e.g., a theoretical inventor vs. a CEO, or a platform vs. backend infrastructure).

---

## 1. Base Score (Base Mass)

Each node starts with a base score determined by its Importance level:

| Importance | Base Score | 설명 |
|:-----------|:-----------|:-----|
| 1 (핵심) | 20 | Core entities (iPhone, Google, Steve Jobs) |
| 2 (중요) | 10 | Important but secondary entities |
| 3 (일반) | 5 | Supporting entities |

---

## 2. Role-Based Modulation

Unlike V2, which treated all companies or people equally, V3 applies multipliers based on their specific role in the ecosystem.

### Company Roles

| Role | Multiplier | 설명 |
|:-----|:-----------|:-----|
| **PLATFORM** | **1.2×** | 소비자 영향력 상향 (Google, Apple, Microsoft) |
| **LAB** | **1.1×** | 혁신 원천 상향 (OpenAI, DARPA, Bell Labs) |
| **INFRA** | **0.85×** | 공급망 억제 (TSMC, ASML) - 인프라 회사 독점 방지 |
| **SERVICE** | **0.8×** | 서비스 억제 |

### Person Roles

| Role | Multiplier | 설명 |
|:-----|:-----------|:-----|
| **THEORIST** | **1.8×** | 발명가/학자 대폭 상향 (Turing, Hinton, LeCun) |
| **BUILDER** | **1.2×** | 엔지니어 상향 (Wozniak, Ritchie) |
| **VISIONARY** | **0.85×** | 창업자/CEO 억제 (창업자가 #1 독점 방지) |

### Tech Roles

| Role | Multiplier | 설명 |
|:-----|:-----------|:-----|
| **STANDARD** | **1.4×** | 표준/프로토콜 최고 상향 (HTTP, x86, TCP/IP) |
| **CORE** | **1.15×** | 핵심 기술 상향 (Transformer, PageRank) |
| **PRODUCT** | **0.9×** | 제품 억제 (iPhone, ChatGPT) |

### Episode Roles

| Role | Multiplier | 설명 |
|:-----|:-----------|:-----|
| **MILESTONE** | **1.5×** | 이정표 상향 (Dartmouth, ChatGPT Launch) |
| **CRISIS** | **0.8×** | 위기 억제 |
| **DEAL** | **0.6×** | 거래 억제 (M&A, 투자) |

---

## 3. Link Weights & Score Propagation

Scores propagate through the network based on link types. The algorithm runs **3 iterations**.

| Link Type | Flow Direction | Base Weight | Logic |
|:----------|:---------------|:------------|:------|
| **CREATED** | Target → Source | **0.7×** | 창작물이 창작자에게 점수 전달 (가장 높음) |
| **BASED_ON** | Source → Target | **0.3×** | 사용자가 공급자에게 점수 전달 |
| **INFLUENCED** | Target → Source | **0.3×** | 결과가 원인에게 점수 전달 |
| **PART_OF** | Source → Target | **0.2×** | 멤버가 그룹에게 점수 전달 |

---

## 4. The Math

The score $S$ for node $i$ at iteration $t$ is calculated as:

$$S_i^{(t)} = S_i^{(0)} + \sum_{j \in neighbors} (S_j^{(t-1)} \times Weight_{link} \times Multiplier_{Role})$$

### Example Calculations

**Infra Dampening:**
- ASML receives score from TSMC via BASED_ON
- ASML is `INFRA` (0.85×), Link is BASED_ON (0.3)
- Total transfer = `0.3 × 0.85 × S_TSMC` = **0.255 × S_TSMC**

**Theorist Boost:**
- Turing receives score from Turing Machine via CREATED
- Turing is `THEORIST` (1.8×), Link is CREATED (0.7)
- Total transfer = `0.7 × 1.8 × S_Machine` = **1.26 × S_Machine**

**Standard Boost:**
- HTTP receives score from WWW via BASED_ON
- HTTP is `STANDARD` (1.4×), Link is BASED_ON (0.3)
- Total transfer = `0.3 × 1.4 × S_WWW` = **0.42 × S_WWW**

---

## 5. Visual Radius Calculation

Final visual radius is calculated from the score:

```
radius = √(score) × 2.2
```

**Minimum Constraints:**
- Company nodes: min 35px
- Other nodes: min 8px

---

## 6. Company Zone Radius

Company "gravitational zone" is calculated based on their creations and members:

```
zoneRadius = 110 + √(totalChildScore) × 5.5
```

Where `totalChildScore` = sum of scores from:
- Nodes the company CREATED
- Nodes that are PART_OF the company

---

## 7. Design Philosophy

| Goal | Implementation |
|:-----|:---------------|
| 🔬 **이론가/발명가 상향** | THEORIST 1.8×로 Turing, Hinton 등이 상위권 |
| 🏗️ **인프라 독점 방지** | INFRA 0.85×로 TSMC, ASML 억제 |
| 📜 **표준의 장기적 영향력** | STANDARD 1.4×로 HTTP, x86 등 강조 |
| 👔 **창업자 독점 방지** | VISIONARY 0.85×로 창업자가 #1 독점 방지 |
| 💰 **투자/거래 억제** | DEAL 0.6×로 M&A/투자 이벤트 과대 점수 방지 |

---

## Related Files

- `utils/ranking.ts` - Algorithm implementation
- `types.ts` - Role enum definitions
- `constants.ts` - Node data with role assignments
