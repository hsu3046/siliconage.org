# Data Manager & Code Generator - Complete Usage Guide

## Overview

The Data Manager is a powerful tool within Debug Mode that allows you to export your modified graph data as TypeScript code. This enables a safe, version-controlled workflow for updating your knowledge graph data.

## Accessing the Data Manager

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Debug Mode**:
   - Open your browser to `http://localhost:3000/debug`
   - OR click "Debug Mode" link if available in your app
   - Note: Debug Mode is only accessible in development (`NODE_ENV=development`)

3. **Open the Data Manager tab**:
   - Click the "📝 Data Manager" tab in the navigation bar
   - This is Tab 5 (the rightmost tab)

## Complete Workflow

### Step 1: Modify Your Data

Before generating code, you need to make changes to your graph data. You can do this in other tabs:

**Option A: Using Node Browser (Tab 2)**
- Search for specific nodes
- View node details
- Identify data that needs updating

**Option B: Using Relationship Inspector (Tab 3)**
- Explore node connections
- Identify missing or incorrect relationships
- Search for nodes by name (Cmd+F)

**Option C: Using Integrity Checker (Tab 1)**
- Find validation errors (broken links, orphan nodes, etc.)
- Identify missing metadata
- Fix data quality issues

### Step 2: Generate Code

Once you've identified what needs to change:

1. **Click the "Generate Code" button**
   - Located in the center of the Data Manager interface
   - Large cyan-to-purple gradient button

2. **Review the generated code**
   - Code appears in a scrollable preview window
   - Line count displayed in top-right corner
   - Code is formatted and ready to use

**What the generator does:**
- Exports all nodes sorted by category (Technology → Company → Person)
- Within each category, sorts by year, then alphabetically
- Groups links by type (CREATES → POWERS → CONTRIBUTES → ENGAGES)
- Uses builder functions (`createTech`, `createCompany`, `createPerson`)
- Handles special cases (`linkRival`, `linkPartner` for ENGAGES relationships)
- Properly escapes strings and formats multiline code

### Step 3: Export the Code

You have two options:

**Option A: Copy to Clipboard**
1. Click the "Copy" button above the code preview
2. Button text changes to "Copied!" with green styling
3. Feedback disappears after 2 seconds
4. Code is now in your clipboard

**Option B: Download as File**
1. Click the "Download" button above the code preview
2. Browser downloads `generated-constants.ts` file
3. File saved to your default downloads folder

### Step 4: Integrate into Your Codebase

**⚠️ CRITICAL: Backup First**

Before making changes, backup your original file:

```bash
cp constants.ts constants.ts.backup
```

**Manual Integration Steps:**

1. **Open the target file**:
   ```bash
   code constants.ts
   # or your preferred editor
   ```

2. **Replace the content**:
   - Select all existing code in `constants.ts`
   - Paste the generated code (Cmd+V / Ctrl+V)
   - OR open the downloaded file and copy its contents

3. **Verify the structure**:
   - Check that imports are at the top
   - Verify `INITIAL_DATA` is properly exported
   - Ensure no syntax errors (editor should highlight issues)

4. **Save the file** (Cmd+S / Ctrl+S)

### Step 5: Test Your Changes

**Run the development server:**

```bash
npm run dev
```

**Check for errors:**
- Terminal should show no compilation errors
- Browser console should be clear of errors
- App should load successfully

**Verify the data:**
1. Navigate back to Debug Mode (`/debug`)
2. Run Integrity Checker (Tab 1)
3. Verify no new validation errors
4. Check Node Browser (Tab 2) to see your changes reflected
5. Test Relationship Inspector (Tab 3) to verify connections

### Step 6: Regenerate AI Cache (If Needed)

If you added new nodes or significantly changed descriptions:

```bash
npm run generate-cache
```

This updates the AI-generated content for the DetailPanel.

## Understanding the Generated Code

### Structure

```typescript
// === GENERATED CODE ===
// Header comments

import { GraphData, Category, LinkType } from "./types";
import {
  createCompany, createPerson, createTech,
  link, linkRival, linkPartner
} from "./utils/builders";

export const INITIAL_DATA: GraphData = {
  nodes: [
    // === TECHNOLOGIES ===
    createTech({
      id: 'transistor',
      label: 'Transistor',
      year: 1947,
      description: 'Semiconductor device...',
      techCategoryL1: 'HARDWARE',
      // ...
    }),

    // === COMPANIES ===
    createCompany({
      id: 'fairchild',
      label: 'Fairchild Semiconductor',
      year: 1957,
      companyCategories: ['SEMICONDUCTOR'],
      // ...
    }),

    // === PEOPLE ===
    createPerson({
      id: 'shockley',
      label: 'William Shockley',
      year: 1910,
      primaryRole: 'INVENTOR',
      // ...
    })
  ],

  links: [
    // === CREATES ===
    link('shockley', 'transistor', LinkType.CREATES),

    // === POWERS ===
    link('transistor', 'integrated-circuit', LinkType.POWERS),

    // === CONTRIBUTES ===
    link('shockley', 'fairchild', LinkType.CONTRIBUTES),

    // === ENGAGES ===
    linkRival('apple', 'microsoft'),
    linkPartner('jobs', 'wozniak')
  ]
};
```

### Node Organization

**Technologies** (sorted by year, then alphabetically):
- All technology nodes grouped together
- Uses `createTech()` builder
- Includes `techCategoryL1`, `techCategoryL2` fields

**Companies** (sorted by year, then alphabetically):
- All company nodes grouped together
- Uses `createCompany()` builder
- Includes `companyCategories` array

**People** (sorted by year, then alphabetically):
- All person nodes grouped together
- Uses `createPerson()` builder
- Includes `primaryRole` field

### Link Organization

**CREATES** - Foundational creation relationships:
- Person → Technology
- Person → Company
- Company → Technology
- Company → Company

**POWERS** - Enablement relationships:
- Technology → Technology
- Technology → Company

**CONTRIBUTES** - Contribution relationships:
- Person → Company
- Person → Technology
- Company → Technology

**ENGAGES** - Social/Business relationships:
- Person → Person
- Company → Company
- Special helpers: `linkRival()`, `linkPartner()`

## Statistics Dashboard

The top of the Data Manager shows key metrics:

- **Total Nodes**: Count of all entities
- **Total Links**: Count of all relationships
- **Companies**: Count by category (red)
- **People**: Count by category (blue)
- **Technologies**: Count by category (green)

These update in real-time as you modify data.

## Unsaved Changes Indicator

When data has been modified:
- Orange "UNSAVED CHANGES" badge appears in header
- "Reset Changes" button becomes available
- Statistics may differ from original data

## Reset Functionality

**When to use Reset:**
- You made mistakes and want to start over
- You want to discard all changes
- You want to reload original data from `constants.ts`

**How to reset:**
1. Click the "Reset Changes" button (red, next to Generate Code)
2. Confirm the action in the dialog
3. Data reverts to original `INITIAL_DATA`
4. "UNSAVED CHANGES" badge disappears

**⚠️ Warning:** Reset is immediate and cannot be undone!

## Best Practices

### 1. Incremental Changes
- Make small, focused changes
- Test frequently
- Generate code after each logical change set

### 2. Version Control
```bash
# Before making changes
git checkout -b feature/update-data

# After verifying changes work
git add constants.ts
git commit -m "Update: Added new AI companies and connections"
git push origin feature/update-data
```

### 3. Validation Workflow
1. Make changes
2. Run Integrity Checker
3. Fix any errors found
4. Generate code
5. Test in dev environment
6. Commit to version control

### 4. Documentation
Add comments in `constants.ts` for major sections:

```typescript
// === COMPANIES ===
// AI/ML Companies (2010s-2020s)
createCompany({ ... }),
createCompany({ ... }),

// Social Media Companies (2000s-2010s)
createCompany({ ... }),
```

## Common Issues and Solutions

### Issue 1: "Validation errors after generating code"

**Cause:** Data has integrity issues (broken links, orphan nodes, etc.)

**Solution:**
1. Go to Integrity Checker (Tab 1)
2. Review all errors and warnings
3. Fix issues manually in the generated code
4. Or modify data in Debug Mode and regenerate

### Issue 2: "Syntax errors in generated code"

**Cause:** Special characters in descriptions not properly escaped

**Solution:**
- Check for unescaped quotes in descriptions
- Look for newlines or special characters
- File an issue if escaping is broken

### Issue 3: "App crashes after pasting new code"

**Cause:** TypeScript compilation errors

**Solution:**
1. Check terminal for specific error messages
2. Verify all imports are correct
3. Ensure `INITIAL_DATA` is properly exported
4. Check for missing commas or brackets
5. Restore from backup if needed

### Issue 4: "Changes not reflected in app"

**Cause:** Browser cache or React hot-reload issue

**Solution:**
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
2. Stop and restart dev server
3. Clear browser cache
4. Check that `constants.ts` was actually saved

### Issue 5: "Lost my changes"

**Cause:** Didn't save generated code before closing tab

**Solution:**
- Prevention: Always copy or download immediately
- Use "Download" button for safety
- Use version control for backup

## Advanced Tips

### Tip 1: Bulk Updates

For adding many nodes at once:
1. Prepare data in a spreadsheet
2. Write a script to convert to builder functions
3. Paste into generated code
4. Validate with Integrity Checker

### Tip 2: Link Management

To find all links for a specific node:
1. Use Relationship Inspector (Tab 3)
2. Search for the node (Cmd+F)
3. Adjust depth to 1-3 to see connections
4. Note all incoming and outgoing links
5. Update links in generated code

### Tip 3: Keyboard Shortcuts

Throughout Debug Mode:
- **Cmd+F / Ctrl+F**: Focus search input
- **Enter**: Select first search suggestion (in Inspector)
- **Escape**: Close modals/panels

### Tip 4: Code Review

Before committing generated code:
```bash
# Check diff
git diff constants.ts

# Review changes line by line
git diff --word-diff constants.ts

# Commit with detailed message
git commit -m "feat: Add 5 new AI companies (2020-2024)

- Added OpenAI, Anthropic, Midjourney, Runway, Stability AI
- Connected to foundational AI research
- Added key personnel relationships"
```

## Workflow Example: Adding a New Company

Let's walk through adding "Anthropic" to the graph:

### 1. Research Phase (Browser/Inspector)
- Search for similar companies (OpenAI, DeepMind)
- Note their structure and connections
- Identify relevant people and technologies

### 2. Data Planning
- ID: `anthropic`
- Label: `Anthropic`
- Year: `2021`
- Category: `COMPANY`
- Company Categories: `['AI', 'RESEARCH']`
- Description: `AI safety and research company...`

### 3. Generate Initial Code
- Click "Generate Code"
- Download the file

### 4. Manual Editing
Open downloaded file and add:

```typescript
// In COMPANIES section
createCompany({
  id: 'anthropic',
  label: 'Anthropic',
  year: 2021,
  description: 'AI safety and research company creating reliable, interpretable AI systems',
  companyCategories: ['AI', 'RESEARCH'],
}),
```

Add connections in links section:

```typescript
// In CREATES section
link('dario-amodei', 'anthropic', LinkType.CREATES),

// In POWERS section
link('transformer', 'anthropic', LinkType.POWERS),

// In CONTRIBUTES section
link('dario-amodei', 'anthropic', LinkType.CONTRIBUTES),
```

### 5. Integration
```bash
# Backup
cp constants.ts constants.ts.backup

# Replace content
# (paste new code into constants.ts)

# Verify syntax
npm run dev
# Check terminal for errors
```

### 6. Validation
1. Go to `/debug`
2. Run Integrity Checker
3. Check Node Browser for "Anthropic"
4. Use Relationship Inspector to verify connections
5. Verify Statistics show updated counts

### 7. Commit
```bash
git add constants.ts
git commit -m "feat: Add Anthropic (2021)

- Added company node with AI/RESEARCH categories
- Connected to Dario Amodei (founder)
- Connected to Transformer architecture"
git push
```

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] Running in development mode (`npm run dev`)
- [ ] Can access `/debug` URL
- [ ] Backed up original `constants.ts`
- [ ] Generated code has no syntax errors
- [ ] Ran Integrity Checker after changes
- [ ] Hard refreshed browser
- [ ] Checked terminal for compilation errors
- [ ] Checked browser console for runtime errors
- [ ] Tested in clean browser session (incognito)

## Feature Limitations

**Current limitations:**
- ❌ No inline editing (must edit generated code)
- ❌ No CRUD forms for adding/editing nodes
- ❌ No link management UI
- ❌ No undo/redo functionality
- ❌ No auto-save (must manually paste to constants.ts)

**Why manual integration?**
- Ensures version control
- Prevents accidental data loss
- Allows code review before committing
- Maintains single source of truth in `constants.ts`

## Future Enhancements

Potential Phase 5 features:
- Direct file writing (with Git integration)
- Node CRUD forms with validation
- Link management interface
- Batch operations
- Import/export JSON
- Collaborative editing

## Support

**If you encounter issues:**

1. Check this guide first
2. Review Integrity Checker output
3. Check browser and terminal consoles
4. Restore from backup if needed
5. File an issue with:
   - What you were trying to do
   - Generated code (if applicable)
   - Error messages
   - Steps to reproduce

## Summary

The Data Manager provides a **safe, controlled workflow** for updating your knowledge graph:

1. 🔍 **Explore** data in other tabs
2. 🛠️ **Modify** data as needed
3. 📝 **Generate** TypeScript code
4. 📋 **Copy** or download the code
5. 🔄 **Integrate** into `constants.ts` manually
6. ✅ **Validate** with Integrity Checker
7. 💾 **Commit** to version control

This approach ensures data quality, prevents errors, and maintains a clear audit trail of all changes.
