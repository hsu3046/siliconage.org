Here is the final implementation plan in English, formatted as a Markdown file.

--- START OF FILE IMPLEMENTATION_PLAN_DEBUG_MODE.md ---

# 🛠️ Debug Mode & Data Manager: Final Implementation Plan

## 1. Overview
This document outlines the specification for a **Developer-Only Admin Dashboard**.
The goal is to manage the complex graph data (`constants.ts`) efficiently within a local environment. It provides tools for **Data Integrity Verification**, **Deep Relationship Exploration**, and **Safe Data Editing** via code generation.

### Design Principles
1.  **Read-Only Source**: Never modify existing source files (`types.ts`, `constants.ts`) directly at runtime.
2.  **Dev Only**: Strictly excluded from production builds.
3.  **Human-Readable**: Replace complex graph visualizations with intuitive **Card Lists** and **Natural Language** sentences.

---

## 2. Architecture & Security

### 2.1 Access Control
*   **Route**: `/debug` (Registered only in development environment).
*   **Protection Strategy**:
    ```typescript
    // App.tsx
    { import.meta.env.DEV && <Route path="/debug" element={<DebugDashboard />} /> }
    ```
*   **Bundle Splitting**: The `DebugDashboard` and its sub-components must be imported using `React.lazy` to prevent increasing the production bundle size.

### 2.2 State Management
*   **In-Memory Database**: Upon page load, deep-copy `INITIAL_DATA` from `constants.ts` into a React Context or Local State.
*   **Workflow**: All CRUD operations happen in memory. The final output is generated as a **TypeScript code string** to be manually copied into the source file.

---

## 3. Core Features (Tabs)

The dashboard consists of 5 functional tabs.

### 3.1 Tab 1: 🚨 Integrity Checker (The Doctor)
Scans the entire dataset to detect logical errors and data corruption.

*   **Broken Links (Critical)**: Detects links pointing to non-existent Node IDs.
*   **Orphan Nodes (Warning)**: Detects nodes with zero incoming or outgoing connections.
*   **Logic Violations**:
    *   `Person` → `Person`: Cannot use `CREATES` or `POWERS`.
    *   `Person` → `Company`: Cannot use `POWERS`.
    *   `Technology` → `Person`: No relationship allowed.
*   **Duplicate Data**: Detects duplicate IDs or identical Source-Target link pairs.

### 3.2 Tab 2: 🔍 Node Browser (The Explorer)
A spreadsheet-like view to search and filter nodes.

*   **UI**: Sortable Data Table (Columns: ID, Label, Category, Year, Incoming Count, Outgoing Count).
*   **Features**:
    *   Text Search & Category/Role Filters.
    *   **Inspect**: Jumps to Tab 3 (Relationship Inspector).
    *   **Edit**: Opens the Data Manager (Tab 5) modal.

### 3.3 Tab 3: 🕸️ Relationship Inspector (Deep Dive)
**Core Feature.** Traces the "Origins" and "Impact" of a specific node up to a **Depth of 3**. Uses a simple Card UI instead of a graph.

#### **UI Layout (3-Column)**

| Section | Purpose | Display Example |
| :--- | :--- | :--- |
| **◀️ ORIGINS** | **Roots & Inspiration**<br>(Upstream/Incoming) | **[Depth 2] Alan Turing** (Theorized)<br>&nbsp;&nbsp;↳ **[Depth 1] AI Theory** (Forms basis of)<br>&nbsp;&nbsp;&nbsp;&nbsp;↳ **(Current Node)** |
| **🎯 FOCUS** | **Current Node Info**<br>(Raw Data View) | **ChatGPT** (2022)<br>- Desc: Chatbot by OpenAI...<br>- Status: ✅ Healthy |
| **IMPACT ▶️** | **Legacy & Usage**<br>(Downstream/Outgoing) | **(Current Node)**<br>&nbsp;&nbsp;↳ **[Depth 1] MS Copilot** (Powers)<br>&nbsp;&nbsp;&nbsp;&nbsp;↳ **[Depth 2] Coding Efficiency** (Increased) |

#### **Key Features**
*   **N-Degree Traversal**: Recursively fetches parents (Origins) and children (Impact).
*   **Smart Labeling**: Uses `labels.ts` logic to display relationships as sentences (e.g., *"Steve Jobs founded Apple"*).
*   **Safety Alerts**:
    *   🔄 **Cycle Detected**: Displays a red banner if a loop (A → B → C → A) is found.
    *   ⚠️ **Duplicate Link**: Warns if multiple links exist between the same two nodes.

### 3.4 Tab 4: 📊 Statistics Dashboard (Stats)
Visualizes data distribution to identify imbalances.

*   **Charts**:
    *   **Category/Role Distribution**: Pie/Bar charts to see if specific areas (e.g., Tech L1) are over/under-represented.
    *   **Timeline Histogram**: A bar chart by Year to identify "Missing Eras" where no data exists.

### 3.5 Tab 5: 📝 Data Manager (CRUD & Code Gen)
Handles data editing and final code export.

1.  **Form Editor (Modal)**:
    *   **Create/Edit Node**: Dynamic fields based on Category (Person vs Company vs Tech).
    *   **Manage Links**: Add/Remove links associated with the node via dropdowns.
2.  **Code Generator (The Save Button)**:
    *   Analyzes the current in-memory state.
    *   Generates a formatted **TypeScript string** matching the structure of `constants.ts` (e.g., `createCompany(...)`, `linkRival(...)`).
    *   **Action**: "Copy to Clipboard" button for easy transfer to the IDE.

---

## 4. Logic & Utility Specifications

Core logic should be separated from UI components.

### 4.1 `utils/debug/graphTraversal.ts`
*   `getUpstreamChain(nodeId, depth)`: Traces incoming links recursively.
*   `getDownstreamChain(nodeId, depth)`: Traces outgoing links recursively.
*   `detectCycles(nodes, links)`: Uses DFS (Depth-First Search) to find circular dependencies.

### 4.2 `utils/debug/codeGenerator.ts`
*   `generateCode(nodes, links)`: Converts the state object into a string.
    *   *Sorting Rule*: Nodes are sorted by `Tech` -> `Company` -> `Person`.
    *   *Sorting Rule*: Links are sorted by `Creates` -> `Powers` -> `Contributes` -> `Engages` for readability.

### 4.3 `utils/debug/validation.ts`
*   `validateGraph(nodes, links)`: Runs all integrity checks and returns an array of `Error` and `Warning` objects.

---

## 5. File Structure

```bash
src/
  components/
    debug/
      DebugDashboard.tsx          # Main Container (Tabs Layout)
      IntegrityChecker.tsx        # Tab 1: Validation List
      NodeBrowser.tsx             # Tab 2: Data Table
      StatsDashboard.tsx          # Tab 4: Charts
      DataManager.tsx             # Tab 5: CRUD & Code Gen
      
      inspector/                  # Tab 3: Relationship Inspector
        RelationshipView.tsx      # 3-Column Layout Container
        ChainCard.tsx             # Recursive Card Component
        NodeDetailPanel.tsx       # Center Focus View
        AlertBanner.tsx           # Cycle/Duplicate Warning
  utils/
    debug/
      validation.ts               # Integrity Check Logic
      graphTraversal.ts           # Deep Dive & Cycle Detection
      codeGenerator.ts            # String Builder for Export
```

---

## 6. Implementation Roadmap

1.  **Phase 1: Foundation (Read-Only)**
    *   Set up `/debug` route and Context for data loading.
    *   Implement `NodeBrowser` (Tab 2) to visualize raw data.

2.  **Phase 2: Deep Analysis**
    *   Implement `graphTraversal.ts` algorithms.
    *   Build `RelationshipInspector` (Tab 3) with Natural Language labels.

3.  **Phase 3: Diagnostics**
    *   Implement `validation.ts`.
    *   Build `IntegrityChecker` (Tab 1) and `StatsDashboard` (Tab 4).

4.  **Phase 4: Management (Write & Export)**
    *   Build Forms for adding/editing nodes.
    *   Implement `codeGenerator.ts` to finalize the workflow.

--- END OF FILE ---