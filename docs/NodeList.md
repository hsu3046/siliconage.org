# The Silicon Age - 노드 목록

> 총 **395개** 노드 (2025년 12월 기준)

---

## 📊 개요

| 노드 타입 | 개수 | 설명 |
|----------|------|------|
| **Company** 🏢 | 64개 | 기업, 연구소, VC |
| **Person** 👤 | 102개 | 창업자, 발명가, CEO |
| **Technology** ⚙️ | 156개 | 제품, 기술, 표준 |
| **Episode** 📅 | 73개 | 사건, 투자, 인수합병 |

---

## 🏢 Company 노드 (64개)

### 속성
```typescript
{
  id: string;
  label: string;
  year: number;                    // 설립 연도
  importance: 1 | 2;               // 중요도 (1: 핵심, 2: 일반)
  impactRole: CompanyRole;         // PLATFORM | LAB | INFRA | SERVICE | PRODUCT
  companyCategories: CompanyCategory[];  // 산업 분류
  marketCap?: { current, peak };   // 시가총액
}
```

### 목록 (알파벳순)
| ID | Label | 설립 | Role | 주요 카테고리 |
|----|-------|------|------|--------------|
| a16z | Andreessen Horowitz | - | - | VC |
| adobe | Adobe | 1982 | PLATFORM | SOFTWARE |
| airbnb | Airbnb | - | - | INTERNET |
| alibaba | Alibaba | - | - | INTERNET |
| amazon | Amazon | 1994 | PLATFORM | INTERNET |
| amd | AMD | 1969 | INFRA | SEMICONDUCTOR |
| apple | Apple | 1976 | PLATFORM | HARDWARE |
| arm | ARM | 1990 | INFRA | SEMICONDUCTOR |
| asml | ASML | 1984 | INFRA | SEMICONDUCTOR |
| att | AT&T | 1885 | PLATFORM | TELECOM |
| binance | Binance | - | - | FINTECH |
| boston_dynamics | Boston Dynamics | - | - | ROBOTICS |
| broadcom | Broadcom | - | - | SEMICONDUCTOR |
| bytedance | ByteDance | 2012 | PLATFORM | MEDIA |
| cern | CERN | 1954 | LAB | LAB |
| cisco | Cisco | - | - | TELECOM |
| darpa | DARPA | 1958 | LAB | LAB |
| dji | DJI | 2006 | PLATFORM | AEROSPACE |
| fairchild | Fairchild Semi | 1957 | LAB | SEMICONDUCTOR |
| foxconn | Foxconn | - | - | HARDWARE |
| fujitsu | Fujitsu | 1935 | INFRA | SEMICONDUCTOR |
| google | Google | 1998 | PLATFORM | INTERNET |
| huawei | Huawei | - | - | TELECOM |
| huggingface | Hugging Face | - | - | SOFTWARE |
| ibm | IBM | 1911 | PLATFORM | HARDWARE |
| intel | Intel | 1968 | INFRA | SEMICONDUCTOR |
| irobot | iRobot | - | - | ROBOTICS |
| kpcb | Kleiner Perkins | - | - | VC |
| meta | Meta | - | - | INTERNET |
| microsoft | Microsoft | 1975 | PLATFORM | SOFTWARE |
| mobileye | Mobileye | - | - | SEMICONDUCTOR |
| netflix | Netflix | 1997 | PLATFORM | MEDIA |
| netscape | Netscape | 1994 | PLATFORM | INTERNET |
| ntt | NTT | 1952 | PLATFORM | TELECOM |
| nvidia | NVIDIA | - | - | SEMICONDUCTOR |
| openai | OpenAI | - | - | LAB |
| oracle | Oracle | 1977 | PLATFORM | SOFTWARE |
| palantir | Palantir | 2003 | SERVICE | SOFTWARE |
| paypal | PayPal | 1998 | PLATFORM | FINTECH |
| qualcomm | Qualcomm | 1985 | INFRA | SEMICONDUCTOR |
| reddit | Reddit | - | - | INTERNET |
| salesforce | Salesforce | 1999 | PLATFORM | SOFTWARE |
| samsung | Samsung | 1938 | INFRA | HARDWARE |
| sap | SAP | 1972 | PLATFORM | SOFTWARE |
| sequoia | Sequoia Capital | - | - | VC |
| sk_hynix | SK Hynix | - | - | SEMICONDUCTOR |
| softbank | SoftBank | 1981 | PLATFORM | VC |
| spacex | SpaceX | 2002 | INFRA | AEROSPACE |
| spotify | Spotify | 2006 | PLATFORM | MEDIA |
| stack_overflow | Stack Overflow | - | - | INTERNET |
| stripe | Stripe | 2010 | PLATFORM | FINTECH |
| sun | Sun Microsystems | 1982 | PLATFORM | HARDWARE |
| tencent | Tencent | - | - | INTERNET |
| tesla | Tesla | 2003 | PLATFORM | MOBILITY |
| ti | Texas Instruments | 1930 | INFRA | SEMICONDUCTOR |
| toshiba | Toshiba | 1939 | INFRA | SEMICONDUCTOR |
| tsmc | TSMC | 1987 | INFRA | SEMICONDUCTOR |
| uber | Uber | 2009 | PLATFORM | MOBILITY |
| vercel | Vercel | - | - | SOFTWARE |
| wikimedia | Wikimedia | - | - | INTERNET |
| xerox | Xerox PARC | 1970 | LAB | LAB |
| y_combinator | Y Combinator | - | - | VC |
| zoom | Zoom | - | - | SOFTWARE |

---

## 👤 Person 노드 (102개)

### 속성
```typescript
{
  id: string;
  label: string;
  year: number;
  importance: 1 | 2;
  impactRole: PersonRole;      // VISIONARY | THEORIST | BUILDER
  role: string;                // "Founder", "CEO" 등
  primaryRole?: string;        // "CEO of Tesla"
  secondaryRole?: string;      // "CEO of SpaceX"
  birthYear?: number;
  deathYear?: number;
}
```

### 목록 (알파벳순)
```
alex_karp, alexander_graham_bell, alexis_ohanian, altman, andreessen,
andy_grove, bardeen, benioff, berners_lee, bezos, bosack, brattain,
brian_chesky, cerf, chad_hurley, charles_geschke, chris_wanstrath,
clement_delangue, cook, cz, daniel_ek, don_valentine, ellison, eric_yuan,
faggin, fei_fei_li, frank_wang, fujio_masuoka, gates, gelsinger,
guillermo_rauch, gwynne_shotwell, hassabis, hasso_plattner, hinton, hock_tan,
ilya, irwin_jacobs, jack_dorsey, jack_ma, jan_koum, jeff_atwood, jensen_huang,
jimmy_wales, jobs, joel_spolsky, john_collison, john_doerr, john_warnock, kay,
kevin_systrom, kilby, kurita, larry_page, lecun, lee_byung_chul, lee_jae_yong,
lee_kun_hee, lerner, linus, lisa_su, marc_raibert, masayoshi_son, mccarthy,
moore, morris_chang, musk, nadella, noyce, palmer_luckey, park_jung_ho,
patrick_collison, paul_graham, paul_jacobs, pichai, pony_ma, reed_hastings,
reid_hoffman, ren_zhengfei, ritchie, safra_catz, satoshi, scott_mcnealy,
shannon, shigeki_goto, shockley, shou_zi_chew, sophie_wilson, steve_chen,
steve_furber, steve_huffman, terry_gou, thiel, thompson, travis_kalanick,
turing, vaswani, vitalik, von_neumann, wozniak, zhang_yiming, zuckerberg
```

---

## ⚙️ Technology 노드 (156개)

### 속성
```typescript
{
  id: string;
  label: string;
  year: number;
  importance: 1 | 2;
  impactRole: TechRole;        // PRODUCT | CORE | STANDARD | PLATFORM
  techCategoryL1?: string;     // 대분류
  techCategoryL2?: string;     // 소분류
  endYear?: number;            // 기술 종료 연도 (선택)
}
```

### techCategoryL1 (5개)
- Hardware & Infrastructure
- System Software
- Network & Connectivity
- Digital Services & Platforms
- AI & Physical Systems

### 목록 (알파벳순)
```
3g_patents, 4g_lte, 5g_infra, 5g_patents, adas, alipay, alphafold, android,
api_economy, apple_silicon, ar, arm_arch, arm_cortex, arm_neoverse, arpanet,
atlas, autonomous_driving, autonomous_flight, autopilot, aws, azure, bitcoin,
blockchain, c_language, ccd, cdma, cdma_tech, chaos_monkey, cloud_computing,
computer_vision, core_processor, crm, cuda, deep_blue, defi, douyin, dram,
drone, dsp, emoji, epyc, erp, ethereum, euv, facebook_app, falcon9, fm_towns,
foundry, fpv_drone, fugaku, fujitsu_mainframe, galaxy, gcp, gig_economy,
gimbal_stabilization, git, github, gotham, gps, gpt, gpu, gui, harmony_os, hbm,
hemt, ibm_pc, ibm_q, ibm_quantum, ibm_system_360, ic, illustrator, instagram,
ios_cisco, iot, iphone, java, javascript, kirin_chip, laser, lidar, linkedin,
macintosh, mainframe, metaverse, microprocessor, moores_law, mosfet,
music_streaming, nand_flash, nextjs, nfs, ntt_docomo, oculus, oled_display,
optical_fiber, optimus, oracle_db, paypay, pdf, pentium, photoshop, pos_system,
postscript, powerpc, punch_card, pytorch, quadcopter, quantum_computing, qubit,
raspberry_pi, rec_algo, risc, robotics, roomba, ros, router, ryzen, saas,
search, self_driving_car, sharing_economy, skype, smart_contracts, snapdragon,
sns, solar_cell, solaris, spot, stablecoin, starlink, starship, sycamore,
t1100, ti_calculator, tiktok, tms1000, tpu, transformer, transformers_lib,
transistor, ttl_logic, twitter, unix, upc_barcode, voip, vr, watson_super,
webrtc, wechat, whatsapp, wikipedia, windows, www, x86, xbox, youtube
```

---

## 📅 Episode 노드 (73개)

### 속성
```typescript
{
  id: string;
  label: string;
  year: number;
  importance: 1 | 2;
  impactRole: EpisodeRole;     // MILESTONE | DEAL | CRISIS
  eventType?: string;          // "Investment", "Acquisition" 등
  impactScale?: string;        // "$13B Deal" 등
}
```

### 목록 (알파벳순)
```
a16z_airbnb, a16z_facebook, a16z_github, a16z_skype, a16z_twitter,
ant_group_halt, apple_qcom_war, arm_license_model, att_breakup,
bitcoin_whitepaper, broadcom_vmware, browser_wars, cambridge_analytica,
chatgpt_launch, darpa_grand_challenge, dartmouth, dot_com_bubble,
dtp_revolution, faa_drone_rules, first_reusable_rocket, foxconn_apple_deal,
foxconn_automation, foxconn_suicides, ftx_collapse, galaxy_launch, gui_visit,
hyundai_bd_deal, ibm_loss_1993, ic_patent_battle, in_q_tel, intel_inside,
kasparov_match, kpcb_amazon, kpcb_google, kpcb_netscape, kpcb_sun,
lenovo_acquisition, memory_to_cpu, meng_wanzhou, ms_openai_deal, ms_saves_apple,
ms_skype_deal, netflix_prize, no_software, nvidia_arm_fail, openai_coup,
oracle_buys_sun, pentium_bug, phantom_launch, project_maven, qcom_licensing,
samsung_memory_bet, sequoia_apple, sequoia_google, sequoia_nvidia,
sequoia_oracle, sequoia_paypal, sequoia_whatsapp, sequoia_youtube, softbank_arm,
softbank_nvidia, softbank_uber, streaming_wars, the_merge, tick_tock,
tiktok_ban_threat, traitorous_eight, us_sanctions, vision_fund, wintel_alliance,
xerox_investment, yc_airbnb, zoom_boom
```

---

## 관련 파일

- `constants.ts` - 모든 노드 및 링크 정의
- `types.ts` - NodeData, LinkData 인터페이스 정의
