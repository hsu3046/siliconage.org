# The Silicon Age - 노드 & 관계 분류 체계

> 총 **395개** 노드 (2025년 12월 기준)

---

## 📊 개요

| 노드 타입 | 개수 | 아이콘 | 설명 |
|----------|------|--------|------|
| **Company** | 64개 | 🏢 | 기업, 연구소, VC |
| **Person** | 102개 | 👤 | 창업자, 발명가, CEO |
| **Technology** | 156개 | ⚙️ | 제품, 기술, 표준 |
| **Episode** | 73개 | 📅 | 사건, 투자, 인수합병 |

---

## 🔗 관계(Link) 종류

모든 노드는 4가지 관계 타입으로 연결됩니다.

| Link Type | 한국어 | 설명 | 예시 |
|-----------|--------|------|------|
| **CREATED** | 창조 | 설립, 발명, 개발, 출시 | `Steve Jobs → iPhone`, `Intel → x86` |
| **BASED_ON** | 기반 | 기술 의존, 인프라 활용 | `iPhone → ARM Architecture`, `AWS → Linux` |
| **PART_OF** | 소속 | 멤버십, 소유권, 카테고리 | `Jensen Huang → NVIDIA`, `TSMC → SEMICONDUCTOR` |
| **INFLUENCED** | 영향 | 투자, 인수, 영감 | `Sequoia → Google 투자`, `PARC Visit → Macintosh` |

### 방향(Direction)
- **FORWARD**: Source → Target (기본)
- **REVERSE**: Target → Source

---

## 🏢 Company 노드 (64개)

### Role (역할 분류)

| CompanyRole | 한국어 | 설명 | 예시 |
|-------------|--------|------|------|
| **PLATFORM** | 플랫폼 | 생태계 중심 기업 | Google, Apple, Microsoft |
| **LAB** | 연구소 | R&D 중심 조직 | OpenAI, DARPA, Xerox PARC |
| **INFRA** | 인프라 | 공급망/하드웨어 | TSMC, ASML, Samsung |
| **SERVICE** | 서비스 | 서비스 제공 기업 | Palantir, Salesforce |
| **PRODUCT** | 제품 | 소비자 하드웨어 | iRobot, DJI, GoPro |

### Category (산업 분류)

| CompanyCategory | 한국어 | 예시 |
|-----------------|--------|------|
| **SEMICONDUCTOR** | 반도체 | Intel, TSMC, AMD, NVIDIA |
| **HARDWARE** | 하드웨어 | Apple, Samsung, Foxconn |
| **SOFTWARE** | 소프트웨어 | Microsoft, Adobe, Oracle |
| **INTERNET** | 인터넷 | Google, Amazon, Meta |
| **TELECOM** | 통신 | AT&T, Cisco, Huawei |
| **LAB** | 연구소 | DARPA, CERN, Xerox PARC |
| **VC** | 벤처캐피탈 | Sequoia, a16z, Y Combinator |
| **ROBOTICS** | 로보틱스 | Boston Dynamics, iRobot |
| **FINTECH** | 핀테크 | PayPal, Stripe, Binance |
| **MOBILITY** | 모빌리티 | Tesla, Uber |
| **AEROSPACE** | 항공우주 | SpaceX, DJI |
| **MEDIA** | 미디어 | Netflix, ByteDance, Spotify |

### 목록 (알파벳순)
| ID | Label | 설립 | Role | 주요 카테고리 |
|----|-------|------|------|--------------:|
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

### Role (역할 분류)

| PersonRole | 한국어 | 설명 | 예시 |
|------------|--------|------|------|
| **VISIONARY** | 비전가 | 창업자, CEO | Steve Jobs, Bill Gates, Elon Musk |
| **THEORIST** | 이론가 | 발명가, 학자 | Alan Turing, Geoffrey Hinton |
| **BUILDER** | 빌더 | 엔지니어, 설계자 | Steve Wozniak, Dennis Ritchie |

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

### Role (역할 분류)

| TechRole | 한국어 | 설명 | 예시 |
|----------|--------|------|------|
| **PRODUCT** | 제품 | 소비자 대상 제품 | iPhone, ChatGPT, Windows |
| **CORE** | 핵심기술 | 기반 기술 | Transformer, PageRank, CUDA |
| **STANDARD** | 표준 | 프로토콜, 규격 | HTTP, x86, TCP/IP |
| **PLATFORM** | 플랫폼 | 개발/서비스 플랫폼 | Android, AWS, iOS |

### Category L1 (대분류, 5개)

| TechCategoryL1 | 한국어 | 설명 |
|----------------|--------|------|
| **Hardware, Robotics & Infra** | 하드웨어, 로보틱스 & 인프라 | 물리적 장치, 칩, 제조, 로봇 |
| **System Software** | 시스템 소프트웨어 | OS, 개발도구, 언어 |
| **Network & Connectivity** | 네트워크 & 연결 | 통신, 프로토콜 |
| **Digital Services & Platforms** | 디지털 서비스 & 플랫폼 | 인터넷 서비스, 핀테크 |
| **Artificial Intelligence (AI)** | 인공지능 (AI) | AI 모델, AI 애플리케이션 |

### Category L2 (소분류, 17개)

| TechCategoryL2 | 한국어 | L1 분류 |
|----------------|--------|---------|
| **Processors & Compute** | 프로세서 & 컴퓨팅 | Hardware, Robotics & Infra |
| **Devices & Form Factors** | 디바이스 & 폼팩터 | Hardware, Robotics & Infra |
| **Memory & Storage** | 메모리 & 저장장치 | Hardware, Robotics & Infra |
| **Components & Manufacturing** | 부품 & 제조 | Hardware, Robotics & Infra |
| **Robotics & Mobility** | 로보틱스 & 모빌리티 | Hardware, Robotics & Infra |
| **Operating Systems (OS)** | 운영체제 | System Software |
| **Development & Languages** | 개발 & 언어 | System Software |
| **Telecommunications** | 통신 | Network & Connectivity |
| **Network Architecture** | 네트워크 아키텍처 | Network & Connectivity |
| **Search & Information** | 검색 & 정보 | Digital Services & Platforms |
| **Social & Media** | 소셜 & 미디어 | Digital Services & Platforms |
| **Digital Platforms** | 디지털 플랫폼 | Digital Services & Platforms |
| **Fintech & Crypto** | 핀테크 & 크립토 | Digital Services & Platforms |
| **Spatial Computing** | 공간 컴퓨팅 | Digital Services & Platforms |
| **AI Core & Models** | AI 핵심 & 모델 | Artificial Intelligence (AI) |
| **AI Applications & Agents** | AI 애플리케이션 & 에이전트 | Artificial Intelligence (AI) |

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

### Role (역할 분류)

| EpisodeRole | 한국어 | 설명 | 예시 |
|-------------|--------|------|------|
| **MILESTONE** | 이정표 | 출시, 돌파구, 혁신 | Dartmouth Conference, ChatGPT Launch |
| **DEAL** | 거래 | 인수합병, 투자 | Sequoia → Google, Microsoft → OpenAI |
| **CRISIS** | 위기 | 스캔들, 실패 | Pentium Bug, FTX Collapse |

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

## 📁 관련 파일

| 파일명 | 설명 |
|--------|------|
| `types.ts` | 모든 타입, enum 정의 |
| `constants.ts` | 노드 및 링크 데이터 정의 |
| `utils/ranking.ts` | Impact Score 계산 로직 |

---

## 🎨 시각적 표현

### 노드 색상 (UI)
| Category | 색상 | Hex |
|----------|------|-----|
| Company | 🔴 Red | `#ef4444` |
| Person | 🔵 Blue | `#3b82f6` |
| Technology | 🟢 Emerald | `#10b981` |
| Episode | 🟣 Violet | `#8b5cf6` |

### 링크 색상 (UI)
| Link Type | 색상 |
|-----------|------|
| CREATED | Teal (#0891b2) |
| BASED_ON | Orange |
| PART_OF | Gray |
| INFLUENCED | Yellow |
