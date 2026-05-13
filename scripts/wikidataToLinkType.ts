/**
 * wikidataToLinkType.ts
 *
 * Maps Wikidata properties (e.g. P127, P176, P800) into our 4-element
 * LinkType enum (POWERS, CREATES, CONTRIBUTES, ENGAGES) and computes
 * default direction + arrow + icon defaults.
 *
 * NOT a script — re-exported by wikidataBfs.ts and generateLinks.ts.
 *
 * Reference: docs/NodeLinkRules.md (Logic Matrix) + Wikidata property
 * pages https://www.wikidata.org/wiki/Property:P*
 */

import { LinkType, ArrowHead, LinkIcon } from '../types';

export interface PropertyMapping {
    /** Our internal LinkType */
    type: LinkType;
    /** Default arrowhead */
    arrow: ArrowHead;
    /** Default icon for the link */
    icon?: LinkIcon;
    /** Default link strength (0-1) */
    strength: number;
    /** Human-readable relation_kind label persisted alongside the link */
    relation: string;
    /**
     * If 'inverse', the link should be inserted with source/target swapped
     * relative to the Wikidata triple (e.g. P361 part-of means we want
     * "container POWERS containee" so the surface form follows the
     * containment direction we use in the graph).
     */
    direction?: 'forward' | 'inverse';
}

/**
 * Table is intentionally explicit rather than dynamic — every approved
 * property in here has been hand-checked against NodeLinkRules.md.
 * Unknown / disallowed properties fall through to `null`.
 */
export const PROPERTY_MAP: Record<string, PropertyMapping> = {
    // --- Ownership / corporate structure -> CONTRIBUTES (Person/Company -> Company)
    P127:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.5, relation: 'owned by',          direction: 'inverse' },
    P749:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.5, relation: 'parent organization', direction: 'inverse' },
    P355:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.5, relation: 'subsidiary' },
    P112:  { type: LinkType.CREATES,     arrow: ArrowHead.SINGLE, icon: LinkIcon.SPARK, strength: 0.9, relation: 'founded by',         direction: 'inverse' },
    P169:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.6, relation: 'CEO',                direction: 'inverse' },
    P488:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.5, relation: 'chairperson',        direction: 'inverse' },

    // --- Production / authorship -> CREATES (Company/Person -> Tech)
    P176:  { type: LinkType.CREATES,     arrow: ArrowHead.SINGLE, icon: LinkIcon.SPARK, strength: 0.9, relation: 'manufactured by',    direction: 'inverse' },
    P178:  { type: LinkType.CREATES,     arrow: ArrowHead.SINGLE, icon: LinkIcon.SPARK, strength: 0.9, relation: 'developer',          direction: 'inverse' },
    P287:  { type: LinkType.CREATES,     arrow: ArrowHead.SINGLE, icon: LinkIcon.SPARK, strength: 0.7, relation: 'designed by',        direction: 'inverse' },
    P800:  { type: LinkType.CREATES,     arrow: ArrowHead.SINGLE, icon: LinkIcon.SPARK, strength: 0.8, relation: 'notable work' },
    P1056: { type: LinkType.CREATES,     arrow: ArrowHead.SINGLE, icon: LinkIcon.SPARK, strength: 0.8, relation: 'product produced' },

    // --- Containment / dependency -> POWERS (Tech -> Tech, infrastructure)
    P361:  { type: LinkType.POWERS,      arrow: ArrowHead.SINGLE, icon: LinkIcon.POWERS, strength: 0.7, relation: 'part of',           direction: 'inverse' },
    P527:  { type: LinkType.POWERS,      arrow: ArrowHead.SINGLE, icon: LinkIcon.POWERS, strength: 0.7, relation: 'has part' },
    P1535: { type: LinkType.POWERS,      arrow: ArrowHead.SINGLE, icon: LinkIcon.POWERS, strength: 0.6, relation: 'used by',           direction: 'inverse' },

    // --- Evolution / influence -> CONTRIBUTES (Tech -> Tech)
    P155:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.5, relation: 'follows',            direction: 'inverse' },
    P156:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.5, relation: 'followed by' },
    P279:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.4, relation: 'subclass of',        direction: 'inverse' },
    P737:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.5, relation: 'influenced by',      direction: 'inverse' },
    P941:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.5, relation: 'inspired by',        direction: 'inverse' },
    P138:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.4, relation: 'named after',        direction: 'inverse' },

    // --- Education / employment -> CONTRIBUTES (Person -> Company)
    P108:  { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.4, relation: 'employer' },
    P39:   { type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE,                       strength: 0.4, relation: 'position held' },
};

/**
 * Properties to *follow* during BFS, even if we will not create a typed link
 * for them yet (e.g. P31 instance-of is used to classify nodes but does not
 * itself create a link in the visible graph).
 */
export const FOLLOW_PROPERTIES: string[] = [
    ...Object.keys(PROPERTY_MAP),
    // Discovery-only (no link emitted yet, just used to harvest neighbours)
    // 'P31', 'P279',
];

/** Properties used solely to classify a node, never emitted as a link */
export const META_PROPERTIES = ['P31', 'P279'];

/** Wikidata "instance of" Q-ids that map onto our 3 categories */
export const CATEGORY_QIDS: Record<'COMPANY' | 'PERSON' | 'TECHNOLOGY', string[]> = {
    COMPANY: [
        'Q783794',    // company
        'Q4830453',   // business
        'Q43229',     // organization
        'Q6881511',   // enterprise
        'Q891723',    // public company
        'Q4830453',   // duplicate kept on purpose for readability
        'Q1616075',   // television company
        'Q484652',    // international organization
        'Q210167',    // video game developer
        'Q15265344',  // broadcaster
        'Q31855',     // research institute
        'Q3914',      // laboratory
        'Q200023',    // research organization
    ],
    PERSON: [
        'Q5',         // human
    ],
    TECHNOLOGY: [
        'Q7397',      // software
        'Q3966',      // computer hardware
        'Q9143',      // programming language
        'Q1301371',   // network protocol
        'Q11862829',  // academic discipline
        'Q15401930',  // product
        'Q39546',     // tool
        'Q11574',     // SI unit (rare)
        'Q635926',    // technology
        'Q8205',      // technology (broad)
        'Q11862829',  // academic discipline (dup ok)
        'Q11862829',
        'Q11691246',  // CPU instruction set architecture
        'Q9135',      // operating system
        'Q11862829',
        'Q1057495',   // standard
        'Q123208',    // industry standard
    ],
};

/** Q-ids that should *always* be rejected (films, places, songs, books) */
export const NEGATIVE_INSTANCE_QIDS = new Set<string>([
    'Q11424',         // film
    'Q24856',         // film series
    'Q47461344',      // written work
    'Q571',           // book
    'Q482994',        // album
    'Q134556',        // single (song)
    'Q15226218',      // song
    'Q105543609',     // musical work
    'Q1075',          // musical composition
    'Q1107',          // anime
    'Q15116915',      // anime series
    'Q15275719',      // recurring event
    'Q41298',         // magazine
    'Q4006',          // geographic location
    'Q486972',        // human settlement
    'Q515',           // city
    'Q1549591',       // big city
    'Q3957',          // town
    'Q5398426',       // television series
    'Q24871',         // film franchise
    'Q11410',         // game
    'Q7889',          // video game
]);
