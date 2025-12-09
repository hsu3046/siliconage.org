import React from 'react';
import { useLocale } from '../hooks/useLocale';

interface ChangeLogProps {
    isOpen: boolean;
    onClose: () => void;
}

// Changelog data structure
interface ChangeLogEntry {
    version: string;
    date: string;
    color: string; // badge color class
    sections: {
        title: string;
        icon: string;
        iconColor: string;
        bulletColor: string;
        items: { bold?: string; text: string }[];
    }[];
}

// English changelog data
const changelogEN: ChangeLogEntry[] = [
    {
        version: "v1.5.0",
        date: "2025-12-09",
        color: "blue",
        sections: [
            {
                title: "Enhancements",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-purple-400",
                items: [
                    { bold: "Focus Mode UI:", text: "Redesigned focus indicator with cleaner visuals" },
                    { bold: "Multi-language:", text: "Added localized changelog support" },
                    { bold: "Search:", text: "Each view now has its own customized search placeholder" },
                ]
            },
            {
                title: "Fixed",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "History View:", text: "Year badges now properly hide when stories are hidden" },
                ]
            }
        ]
    },
    {
        version: "v1.4.0",
        date: "2025-12-08",
        color: "blue",
        sections: [
            {
                title: "Major Updates",
                icon: "⚡",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "Completely New History View UI:", text: "Redesigned for a clearer historical narrative." },
                    { bold: "Completely New Links View UI:", text: "A fresh interface to explore complex relationships." },
                    { bold: "Data Overhaul:", text: "Comprehensive review and update of all Companies, Technologies, Persons, and Episodes." },
                ]
            },
            {
                title: "Enhancements",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-purple-400",
                items: [
                    { bold: "Search Engine:", text: "Significantly enhanced search functionality across all views." },
                ]
            },
            {
                title: "Fixed",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "Bug Fixes:", text: "Miscellaneous bug fixes and stability improvements." },
                ]
            }
        ]
    },
    {
        version: "v1.3.0",
        date: "2025-12-06",
        color: "blue",
        sections: [
            {
                title: "Added",
                icon: "📦",
                iconColor: "text-blue-400",
                bulletColor: "text-blue-400",
                items: [
                    { bold: "New Links View:", text: "Added a new view to easily grasp the relationships between topics." },
                ]
            },
            {
                title: "Changed",
                icon: "⚡",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "History View UI:", text: "Redesigned the interface to make it easier to understand the historical flow of topics." },
                    { bold: "Search Functionality:", text: "Enhanced search capabilities for better navigation." },
                    { bold: "Topic Information:", text: "Significantly revised and added detailed information for each topic." },
                ]
            },
            {
                title: "Fixed",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "Bug Fixes:", text: "Fixed various miscellaneous bugs." },
                ]
            }
        ]
    },
    {
        version: "v1.2.0",
        date: "2025-12-05",
        color: "purple",
        sections: [
            {
                title: "New Content",
                icon: "📦",
                iconColor: "text-blue-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "Programming Languages:", text: "Added Python, C++, SQL, Swift as core technology nodes" },
                    { bold: "AI Concepts:", text: "Backpropagation, ImageNet, AlexNet, GAN, BERT, Diffusion, RLHF and more" },
                    { bold: "AI Companies:", text: "Anthropic (Claude), Stability AI, Midjourney" },
                    { bold: "AI Pioneers:", text: "Yoshua Bengio, Andrej Karpathy" },
                ]
            },
            {
                title: "Improvements",
                icon: "✨",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "Node Sizing:", text: "Improved sizing algorithm based on technology layers (L0-L3)" },
                    { bold: "Detail Panel:", text: "Improved UI Design and added research paper link" },
                ]
            }
        ]
    },
    {
        version: "v1.1.0",
        date: "2025-12-04",
        color: "green",
        sections: [
            {
                title: "New Features",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-green-400",
                items: [
                    { text: "Added search bar to Map mode - search and center the node on screen" },
                    { text: "Added search bar to History mode" },
                ]
            },
            {
                title: "Improvements",
                icon: "✨",
                iconColor: "text-yellow-400",
                bulletColor: "text-green-400",
                items: [
                    { text: "Improved physics engine for better node positioning" },
                    { text: "Minor UI adjustments" },
                ]
            }
        ]
    },
    {
        version: "v1.0.0",
        date: "2025-11-29",
        color: "slate",
        sections: [
            {
                title: "🚀 Initial Release",
                icon: "",
                iconColor: "",
                bulletColor: "text-green-400",
                items: [
                    { text: "Interactive force-directed graph visualization" },
                    { text: "Timeline and List view modes" },
                    { text: "Detail Panel with AI-generated insights" },
                    { text: "Category and link type filtering" },
                    { text: "Focus Mode for exploring node connections" },
                ]
            }
        ]
    }
];

// Korean changelog data
const changelogKO: ChangeLogEntry[] = [
    {
        version: "v1.5.0",
        date: "2025-12-09",
        color: "blue",
        sections: [
            {
                title: "개선사항",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-purple-400",
                items: [
                    { bold: "포커스 모드 UI:", text: "더 깔끔한 포커스 표시 디자인으로 개선" },
                    { bold: "다국어 지원:", text: "업데이트 기록 다국어 지원 추가" },
                    { bold: "검색:", text: "각 뷰별로 맞춤형 검색 placeholder 적용" },
                ]
            },
            {
                title: "버그 수정",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "History View:", text: "스토리 숨김 시 연도 배지도 함께 숨겨지도록 수정" },
                ]
            }
        ]
    },
    {
        version: "v1.4.0",
        date: "2025-12-08",
        color: "blue",
        sections: [
            {
                title: "주요 업데이트",
                icon: "⚡",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "History View 전면 개편:", text: "더 명확한 역사적 흐름을 위한 UI 재설계" },
                    { bold: "Links View 전면 개편:", text: "관계 탐색을 위한 새로운 인터페이스" },
                    { bold: "데이터 정비:", text: "모든 회사, 기술, 인물, 에피소드 정보 전면 검토 및 업데이트" },
                ]
            },
            {
                title: "개선사항",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-purple-400",
                items: [
                    { bold: "검색 엔진:", text: "모든 뷰에서 검색 기능 대폭 강화" },
                ]
            },
            {
                title: "버그 수정",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "버그 수정:", text: "다양한 버그 수정 및 안정성 개선" },
                ]
            }
        ]
    },
    {
        version: "v1.3.0",
        date: "2025-12-06",
        color: "blue",
        sections: [
            {
                title: "신규 기능",
                icon: "📦",
                iconColor: "text-blue-400",
                bulletColor: "text-blue-400",
                items: [
                    { bold: "Links View 추가:", text: "주제 간의 관계를 쉽게 파악할 수 있는 새로운 뷰" },
                ]
            },
            {
                title: "변경사항",
                icon: "⚡",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "History View UI:", text: "주제의 역사적 흐름을 더 쉽게 이해할 수 있도록 인터페이스 개선" },
                    { bold: "검색 기능:", text: "더 나은 탐색을 위한 검색 기능 강화" },
                    { bold: "주제 정보:", text: "각 주제별 상세 정보 대폭 수정 및 추가" },
                ]
            },
            {
                title: "버그 수정",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "버그 수정:", text: "다양한 버그 수정" },
                ]
            }
        ]
    },
    {
        version: "v1.2.0",
        date: "2025-12-05",
        color: "purple",
        sections: [
            {
                title: "신규 콘텐츠",
                icon: "📦",
                iconColor: "text-blue-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "프로그래밍 언어:", text: "Python, C++, SQL, Swift를 핵심 기술 노드로 추가" },
                    { bold: "AI 개념:", text: "역전파, ImageNet, AlexNet, GAN, BERT, Diffusion, RLHF 등" },
                    { bold: "AI 기업:", text: "Anthropic (Claude), Stability AI, Midjourney" },
                    { bold: "AI 선구자:", text: "Yoshua Bengio, Andrej Karpathy" },
                ]
            },
            {
                title: "개선사항",
                icon: "✨",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "노드 크기:", text: "기술 레이어(L0-L3) 기반 크기 알고리즘 개선" },
                    { bold: "상세 패널:", text: "UI 디자인 개선 및 연구 논문 링크 추가" },
                ]
            }
        ]
    },
    {
        version: "v1.1.0",
        date: "2025-12-04",
        color: "green",
        sections: [
            {
                title: "신규 기능",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-green-400",
                items: [
                    { text: "지도 모드에 검색바 추가 - 노드 검색 및 화면 중앙 이동" },
                    { text: "History 모드에 검색바 추가" },
                ]
            },
            {
                title: "개선사항",
                icon: "✨",
                iconColor: "text-yellow-400",
                bulletColor: "text-green-400",
                items: [
                    { text: "더 나은 노드 배치를 위한 물리 엔진 개선" },
                    { text: "UI 미세 조정" },
                ]
            }
        ]
    },
    {
        version: "v1.0.0",
        date: "2025-11-29",
        color: "slate",
        sections: [
            {
                title: "🚀 최초 릴리스",
                icon: "",
                iconColor: "",
                bulletColor: "text-green-400",
                items: [
                    { text: "인터랙티브 포스-다이렉트 그래프 시각화" },
                    { text: "타임라인 및 리스트 뷰 모드" },
                    { text: "AI 생성 인사이트가 포함된 상세 패널" },
                    { text: "카테고리 및 링크 유형 필터링" },
                    { text: "노드 연결 탐색을 위한 포커스 모드" },
                ]
            }
        ]
    }
];

// Japanese changelog data
const changelogJA: ChangeLogEntry[] = [
    {
        version: "v1.5.0",
        date: "2025-12-09",
        color: "blue",
        sections: [
            {
                title: "改善",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-purple-400",
                items: [
                    { bold: "フォーカスモードUI:", text: "よりクリーンなビジュアルデザインに改善" },
                    { bold: "多言語対応:", text: "更新履歴の多言語サポートを追加" },
                    { bold: "検索:", text: "各ビューに専用の検索プレースホルダーを適用" },
                ]
            },
            {
                title: "バグ修正",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "History View:", text: "ストーリー非表示時に年バッジも非表示になるよう修正" },
                ]
            }
        ]
    },
    {
        version: "v1.4.0",
        date: "2025-12-08",
        color: "blue",
        sections: [
            {
                title: "主要アップデート",
                icon: "⚡",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "History View全面刷新:", text: "より明確な歴史の流れを表現するUIに再設計" },
                    { bold: "Links View全面刷新:", text: "関係性を探索するための新しいインターフェース" },
                    { bold: "データ整備:", text: "すべての企業、技術、人物、エピソード情報を全面的に見直し・更新" },
                ]
            },
            {
                title: "改善",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-purple-400",
                items: [
                    { bold: "検索エンジン:", text: "すべてのビューで検索機能を大幅に強化" },
                ]
            },
            {
                title: "バグ修正",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "バグ修正:", text: "各種バグ修正と安定性の向上" },
                ]
            }
        ]
    },
    {
        version: "v1.3.0",
        date: "2025-12-06",
        color: "blue",
        sections: [
            {
                title: "新機能",
                icon: "📦",
                iconColor: "text-blue-400",
                bulletColor: "text-blue-400",
                items: [
                    { bold: "Links View追加:", text: "トピック間の関係を簡単に把握できる新しいビュー" },
                ]
            },
            {
                title: "変更点",
                icon: "⚡",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "History View UI:", text: "トピックの歴史的流れをより理解しやすいインターフェースに改善" },
                    { bold: "検索機能:", text: "より良いナビゲーションのための検索機能強化" },
                    { bold: "トピック情報:", text: "各トピックの詳細情報を大幅に修正・追加" },
                ]
            },
            {
                title: "バグ修正",
                icon: "🛠️",
                iconColor: "text-green-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "バグ修正:", text: "各種バグ修正" },
                ]
            }
        ]
    },
    {
        version: "v1.2.0",
        date: "2025-12-05",
        color: "purple",
        sections: [
            {
                title: "新コンテンツ",
                icon: "📦",
                iconColor: "text-blue-400",
                bulletColor: "text-green-400",
                items: [
                    { bold: "プログラミング言語:", text: "Python、C++、SQL、Swiftをコア技術ノードとして追加" },
                    { bold: "AI概念:", text: "逆伝播、ImageNet、AlexNet、GAN、BERT、Diffusion、RLHFなど" },
                    { bold: "AI企業:", text: "Anthropic (Claude)、Stability AI、Midjourney" },
                    { bold: "AIパイオニア:", text: "Yoshua Bengio、Andrej Karpathy" },
                ]
            },
            {
                title: "改善",
                icon: "✨",
                iconColor: "text-amber-400",
                bulletColor: "text-amber-400",
                items: [
                    { bold: "ノードサイズ:", text: "技術レイヤー(L0-L3)に基づくサイズアルゴリズムの改善" },
                    { bold: "詳細パネル:", text: "UIデザインの改善と研究論文リンクの追加" },
                ]
            }
        ]
    },
    {
        version: "v1.1.0",
        date: "2025-12-04",
        color: "green",
        sections: [
            {
                title: "新機能",
                icon: "🚀",
                iconColor: "text-purple-400",
                bulletColor: "text-green-400",
                items: [
                    { text: "マップモードに検索バーを追加 - ノード検索と画面中央への移動" },
                    { text: "Historyモードに検索バーを追加" },
                ]
            },
            {
                title: "改善",
                icon: "✨",
                iconColor: "text-yellow-400",
                bulletColor: "text-green-400",
                items: [
                    { text: "より良いノード配置のための物理エンジン改善" },
                    { text: "UI微調整" },
                ]
            }
        ]
    },
    {
        version: "v1.0.0",
        date: "2025-11-29",
        color: "slate",
        sections: [
            {
                title: "🚀 初回リリース",
                icon: "",
                iconColor: "",
                bulletColor: "text-green-400",
                items: [
                    { text: "インタラクティブなフォースダイレクトグラフ可視化" },
                    { text: "タイムラインとリストビューモード" },
                    { text: "AI生成インサイト付き詳細パネル" },
                    { text: "カテゴリとリンクタイプのフィルタリング" },
                    { text: "ノード接続探索のためのフォーカスモード" },
                ]
            }
        ]
    }
];

// Localized texts
const localizedTexts = {
    en: {
        title: "📋 ChangeLog",
        subtitle: "Version History & Updates",
        footer: "💡 Have feedback or found a bug? Use the feedback form in the About section."
    },
    ko: {
        title: "📋 업데이트 기록",
        subtitle: "버전 기록 및 변경사항",
        footer: "💡 피드백이나 버그를 발견하셨나요? About 섹션의 피드백 양식을 이용해주세요."
    },
    ja: {
        title: "📋 更新履歴",
        subtitle: "バージョン履歴とアップデート",
        footer: "💡 フィードバックやバグを見つけましたか？Aboutセクションのフィードバックフォームをご利用ください。"
    }
};

const ChangeLog: React.FC<ChangeLogProps> = ({ isOpen, onClose }) => {
    const { locale } = useLocale();

    if (!isOpen) return null;

    // Select changelog data based on locale
    const changelog = locale === 'ko' ? changelogKO : locale === 'ja' ? changelogJA : changelogEN;
    const texts = localizedTexts[locale] || localizedTexts.en;

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
            case 'purple': return 'bg-purple-500/10 border-purple-500/50 text-purple-400';
            case 'green': return 'bg-green-500/10 border-green-500/50 text-green-400';
            case 'slate': return 'bg-slate-700 border-slate-600 text-slate-300';
            default: return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{texts.title}</h2>
                        <p className="text-sm text-slate-400 mt-1">{texts.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg p-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {changelog.map((entry, entryIndex) => (
                        <div key={entry.version}>
                            {entryIndex > 0 && <div className="border-t border-slate-800 my-8"></div>}

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 border rounded-full text-xs font-bold ${getColorClasses(entry.color)}`}>
                                        {entry.version}
                                    </span>
                                    <span className="text-slate-500 text-sm">{entry.date}</span>
                                </div>

                                <div className="space-y-6">
                                    {entry.sections.map((section, sectionIndex) => (
                                        <div key={sectionIndex}>
                                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                {section.icon && <span className={section.iconColor}>{section.icon}</span>}
                                                {section.title}
                                            </h3>
                                            <ul className="space-y-2 text-slate-300 text-sm">
                                                {section.items.map((item, itemIndex) => (
                                                    <li key={itemIndex} className="flex items-start gap-2">
                                                        <span className={`${section.bulletColor} mt-1`}>✓</span>
                                                        <span>
                                                            {item.bold && <strong className="text-white">{item.bold}</strong>}
                                                            {item.bold ? ' ' : ''}{item.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                    <p className="text-xs text-slate-500 text-center">
                        {texts.footer}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangeLog;
