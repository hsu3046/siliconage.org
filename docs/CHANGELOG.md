# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-12-06

### Changed
- **Map Search**: Search now enters Focus Mode directly (double-click behavior)
- **Focus Exit**: Now zooms to Level 1 first, then after stabilization zooms to Level 3 centered on the focused node
- **Focus Exit**: Smooth physics with reduced jitter (low alpha, high decay)

### Fixed
- **Focus Highlight**: Yellow stroke now properly removed from all node types on exit

## [1.2.0] - 2025-12-05

### Added
- **Programming Languages**: Added Python, C++, SQL, Swift as core technology nodes
- **AI Concepts**: Added Backpropagation, ImageNet, AlexNet, Word2Vec, GAN, ResNet, Attention, BERT, Diffusion Models, RLHF
- **AI Companies**: Added Anthropic (Claude), Stability AI (Stable Diffusion), Midjourney
- **AI Pioneers**: Added Yoshua Bengio, Andrej Karpathy

### Changed
- **AI Deep Dive**: Upgraded Gemini API to 2.0-flash with Google Search Grounding for real-time information
- **AI Deep Dive**: Enhanced prompts with rich node context (year, description, industry, market cap)
- **Impact Score**: Rebalanced algorithm - VISIONARY role reduced, STANDARD tech boosted, THEORIST boosted
- **Impact Score**: Added foundational BASED_ON links for better score propagation

### Fixed
- **DetailPanel**: Fixed duplicate connections display bug

## [1.1.0] - 2025-12-04

### Added
- **Map Search**: Node-only search with suggestions dropdown
- **Map Search**: Enter key support for quick search (PC)
- **History Search**: Node-only search with suggestions dropdown (matching Map behavior)
- **History Search**: Enter key support for quick search

### Changed
- **Map Search**: Search now only centers on node without opening Detail Panel
- **Map Focus Mode**: Search bar is now hidden when in Focus mode
- **Map Focus Mode**: Node now centers correctly in the middle of the screen
- **Map Focus Mode**: Exit now returns to Zoom Level 1 (most zoomed out)
- **History Search**: Reduced top margin to match List View

### Fixed
- **Map Search**: Fixed first search not panning to node (double-pan interference)
- **Map Search**: Fixed suggestions not showing after first search
- **History Search**: Fixed mobile scroll shift when selecting search result (keyboard dismiss)

## [1.0.1] - Previous Version

- Initial stable release
