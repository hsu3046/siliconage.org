# AI Deep Dive 기능 문서

## 개요

DetailPanel에서 노드 선택 시 AI 생성 분석 텍스트를 자동으로 표시합니다.

---

## 텍스트 생성 로직

**파일:** `services/geminiService.ts`

`fetchNodeDetails(node)` 함수 호출 시 3단계 캐시 전략:

| 순서 | 캐시 위치 | 설명 |
|------|----------|------|
| **1** | `STATIC_CACHE[node.id]` | 서버사이드 하드코딩 캐시 (가장 빠름) |
| **2** | `localStorage.getItem(cacheKey)` | 브라우저 로컬스토리지 캐시 |
| **3** | **Gemini API 호출** | 실시간 생성 (fallback) |

---

## Gemini API 설정 (v1.2.0 업데이트)

| 항목 | 설정 |
|------|------|
| **모델** | `gemini-2.0-flash-001` |
| **Google Search Grounding** | ✅ 활성화 (최신 정보 반영) |
| **Response Format** | JSON Schema (summary, significance, keyFacts) |

### 프롬프트에 포함되는 컨텍스트

```
Entity: "{node.label}"
Category: {node.category}
Year: {node.year}
Description: {node.description}
Role: {node.role}
Industry: {node.companyCategories}
Tech Category: {node.techCategoryL1}
Market Cap: {node.marketCap?.current}
```

---

## 저장 장소

| 저장소 | 파일/위치 | 설명 |
|--------|----------|------|
| **Static Cache** | `services/staticCache.ts` | 현재 비어있음 (API 호출로 대체) |
| **Local Storage** | 브라우저 `localStorage` | API 호출 결과 캐싱 (키: `silicon_age_ai_cache_{nodeId}`) |
| **Component State** | `DetailPanel.tsx` `aiData` state | UI 렌더링용 |

---

## AI Response 구조

```typescript
interface AIResponse {
  summary: string;        // 2문장 요약
  significance: string;   // 중요성 설명
  keyFacts: string[];     // 3-5개 핵심 사실
}
```

---

## 흐름 다이어그램

```
사용자 노드 선택
        ↓
DetailPanel.loadAiData()
        ↓
fetchNodeDetails(node)
        ↓
┌─────────────────────────────────────┐
│ 1. STATIC_CACHE 확인                │
│    → 있으면 즉시 반환               │
├─────────────────────────────────────┤
│ 2. localStorage 확인                │
│    → 있으면 반환                    │
├─────────────────────────────────────┤
│ 3. Gemini 2.0-flash API 호출        │
│    (Google Search Grounding 활성화) │
│    → 결과를 localStorage에 저장     │
└─────────────────────────────────────┘
        ↓
setAiData(result)
        ↓
UI 렌더링
```

---

## 관련 파일

- `components/DetailPanel.tsx` - AI Deep Dive UI 렌더링
- `services/geminiService.ts` - API 호출 및 캐시 로직
- `services/staticCache.ts` - 하드코딩된 캐시 데이터
- `types.ts` - `AIResponse` 인터페이스 정의

