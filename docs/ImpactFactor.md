
# Impact Factor 3.0 Algorithm

The **Impact Factor** is a proprietary metric designed for *The Silicon Age* project. Version 3.0 introduces "Role-Based Weighting" to better reflect the qualitative differences between entities (e.g., a theoretical inventor vs. a CEO, or a platform vs. backend infrastructure).

---

## 1. Role-Based Modulation

Unlike V2, which treated all companies or people equally, V3 applies multipliers based on their specific role in the ecosystem.

### Roles & Multipliers

#### Companies
| Role | Multiplier | Rationale |
| :--- | :--- | :--- |
| **PLATFORM** | **1.2x** | Direct consumer impact (Google, Apple). |
| **LAB** | **1.1x** | Innovation engines (OpenAI, Bell Labs). |
| **INFRA** | **0.7x** | Backend suppliers (TSMC, ASML). Dampened to prevent supply chain score explosion. |

#### People
| Role | Multiplier | Rationale |
| :--- | :--- | :--- |
| **THEORIST** | **1.5x** | Originators of ideas (Turing, Hinton). Heavily boosted. |
| **BUILDER** | **1.2x** | Key engineers (Wozniak, Ritchie). |
| **VISIONARY** | **1.0x** | Business leaders/Founders (Jobs, Gates). |

#### Technology
| Role | Multiplier | Rationale |
| :--- | :--- | :--- |
| **PRODUCT** | **1.3x** | Final consumer products (iPhone). Boosted. |
| **CORE** | **1.0x** | Underlying tech (Transformer). |

#### Episodes
| Role | Multiplier | Rationale |
| :--- | :--- | :--- |
| **MILESTONE** | **1.5x** | Historical breakthroughs. |
| **DEAL** | **0.6x** | Financial transactions. Dampened. |

---

## 2. Link Weights

| Link Type | Direction | Base Weight | Logic |
| :--- | :--- | :--- | :--- |
| **MAKER** | Reverse | **0.7** | Greatly increased to reward creators. |
| **DEPENDENCY** | Forward | **0.3** | Reduced to balance backend companies. |
| **INFLUENCE** | Reverse | **0.3** | Standard academic influence. |
| **BELONGING** | Forward | **0.2** | Structural contribution. |

---

## 3. The Math

The score $S$ for node $i$ at iteration $t$ is calculated as:

$$ S_i^{(t)} = S_i^{(0)} + \sum_{j \in neighbors} (S_j^{(t-1)} \times Weight_{link} \times Multiplier_{Role_i}) $$

*   **Infra Example:** ASML receives score from TSMC via Dependency. ASML is `INFRA` (0.7x). Link is Dependency (0.3). Total transfer = $0.21 \times S_{TSMC}$.
*   **Theorist Example:** Turing receives score from Turing Machine via Maker. Turing is `THEORIST` (1.5x). Link is Maker (0.7). Total transfer = $1.05 \times S_{Machine}$.

This ensures that original thinkers and end-user products stand out, while critical but invisible infrastructure remains important but not dominant.
