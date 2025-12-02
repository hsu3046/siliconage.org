
import { AIResponse } from "../types";

export const STATIC_CACHE: Record<string, AIResponse> = {
  "turing": {
    "summary": "The father of theoretical computer science and artificial intelligence.",
    "significance": "Alan Turing provided the formalization of concepts like 'algorithm' and 'computation' with the Turing machine. He also proposed the Turing test as a criterion for intelligence.",
    "keyFacts": [
      "Cracked the Enigma code during WWII.",
      "Proposed the 'Turing Test' in 1950.",
      "Persecuted for his sexuality, receiving a posthumous royal pardon in 2013."
    ]
  },
  "shannon": {
    "summary": "The father of information theory.",
    "significance": "Claude Shannon's 1948 paper 'A Mathematical Theory of Communication' founded the field of information theory, defining the 'bit' and establishing the theoretical limits of data compression and transmission.",
    "keyFacts": [
      "Worked at Bell Labs.",
      "Built the 'Ultimate Machine' (a box that turns itself off).",
      "Proved that boolean algebra could be used to simplify the arrangement of relays and switches."
    ]
  },
  "nvidia": {
    "summary": "The dominant chipmaker powering the AI revolution with its GPUs and CUDA software stack.",
    "significance": "Originally a gaming graphics company, NVIDIA's parallel processing hardware became the accidental engine of modern Deep Learning, enabling the training of massive models like GPT-4.",
    "keyFacts": [
      "Founded in 1993 by Jensen Huang, Chris Malachowsky, and Curtis Priem.",
      "Invented the GPU (Graphics Processing Unit) in 1999.",
      "Surpassed $1 Trillion market cap in 2023 due to AI demand."
    ]
  },
  "google": {
    "summary": "The pioneer of modern AI research, responsible for the Transformer architecture and AlphaGo.",
    "significance": "Google Brain and DeepMind laid the theoretical groundwork for Generative AI (Transformers), though they faced the 'Innovator's Dilemma' when releasing products to compete with OpenAI.",
    "keyFacts": [
      "Acquired DeepMind in 2014 for $500M.",
      "Google researchers authored 'Attention Is All You Need' in 2017.",
      "Developed TPUs (Tensor Processing Units) specifically for AI workloads."
    ]
  },
  "openai": {
    "summary": "The research lab that pushed Generative AI into the mainstream with ChatGPT.",
    "significance": "Founded to ensure AGI benefits humanity, OpenAI shifted the industry focus to Large Language Models (LLMs) and forced tech giants to accelerate their AI timelines.",
    "keyFacts": [
      "Founded as a non-profit in 2015 by Sam Altman, Elon Musk, and others.",
      "Released ChatGPT in November 2022, reaching 100M users in 2 months.",
      "Partnered with Microsoft in a multi-billion dollar investment deal."
    ]
  },
  "microsoft": {
    "summary": "The strategic giant that integrated AI into every productivity tool via its partnership with OpenAI.",
    "significance": "Under Satya Nadella, Microsoft bet the company on Cloud and AI, securing exclusive access to OpenAI's models to power Copilot and Azure AI.",
    "keyFacts": [
      "Invested $1 billion in OpenAI in 2019, followed by $10 billion in 2023.",
      "Integrated GPT-4 into Bing, Office (Copilot), and GitHub.",
      "Saved Apple with a $150M investment in 1997."
    ]
  },
  "tsmc": {
    "summary": "The world's most advanced semiconductor foundry, manufacturing the chips for NVIDIA and Apple.",
    "significance": "TSMC is the bottleneck of the global AI supply chain; virtually all advanced AI chips (GPUs, TPUs) are manufactured in its fabs in Taiwan.",
    "keyFacts": [
      "Founded by Morris Chang in 1987.",
      "Pioneered the 'Pure-play Foundry' business model.",
      "Produces over 90% of the world's most advanced chips."
    ]
  },
  "apple": {
    "summary": "The consumer tech giant bringing AI to the edge via Apple Silicon and privacy-focused integration.",
    "significance": "While quieter on 'Generative AI' hype, Apple's neural engine in M-series chips laid the hardware foundation for running AI locally on devices.",
    "keyFacts": [
      "Released the M1 chip in 2020, transitioning away from Intel.",
      "World's most valuable company for most of the 2010s/2020s.",
      "Siri was an early (though limited) mass-market AI assistant."
    ]
  },
  "ibm": {
    "summary": "The original tech giant that defined the computing era for decades.",
    "significance": "From mainframes to PC standards, IBM built the foundation of the modern computer industry. Its Deep Blue project was a landmark moment in AI history.",
    "keyFacts": [
      "Founded in 1911 as CTR, renamed IBM in 1924.",
      "Created the IBM PC standard which opened personal computing.",
      "Developed Deep Blue, which defeated Garry Kasparov in 1997."
    ]
  },
  "tesla": {
    "summary": "An energy and robotics company that is effectively a massive real-world AI application.",
    "significance": "Tesla is pushing the boundaries of computer vision and robotics with Autopilot/FSD and the Optimus robot, driven by massive internal AI training clusters.",
    "keyFacts": [
      "Founded in 2003, Elon Musk joined shortly after.",
      "Developed its own FSD (Full Self-Driving) custom AI chips.",
      "Building the Dojo supercomputer for video training data."
    ]
  },
  "samsung": {
    "summary": "A global electronics titan and a critical player in the memory chip market.",
    "significance": "Samsung Electronics is one of the few companies that can design and manufacture chips. Its HBM (High Bandwidth Memory) is crucial for feeding data to AI GPUs.",
    "keyFacts": [
      "Founded in 1969 (Electronics division).",
      "World's largest memory chip manufacturer.",
      "Key rival to TSMC in the foundry business and Apple in phones."
    ]
  },
  "jensen_huang": {
    "summary": "The visionary CEO of NVIDIA who bet the farm on accelerated computing.",
    "significance": "Huang consistently steered NVIDIA towards general-purpose GPU computing (GPGPU) and AI decades before the market materialized, creating the hardware standard for AI.",
    "keyFacts": [
      "Famous for his signature black leather jacket.",
      "One of the longest-serving tech CEOs (since 1993).",
      "Hand-delivered the first DGX-1 AI supercomputer to OpenAI."
    ]
  },
  "altman": {
    "summary": "The CEO of OpenAI and the face of the generative AI boom.",
    "significance": "Altman transformed OpenAI from a quiet research lab into a product-focused powerhouse, navigating complex safety/commercialization tensions.",
    "keyFacts": [
      "Former President of Y Combinator.",
      "Briefly ousted as CEO in November 2023, returned days later.",
      "Strong advocate for Universal Basic Income (UBI) in the age of AI."
    ]
  },
  "transformer": {
    "summary": "The neural network architecture that revolutionized Natural Language Processing.",
    "significance": "Introduced in the 'Attention Is All You Need' paper, it allows models to process entire sequences of data in parallel, enabling the scale of modern LLMs like GPT.",
    "keyFacts": [
      "Invented by Google researchers in 2017.",
      "Replaced RNNs and LSTMs as the standard for NLP.",
      "The 'T' in GPT stands for Transformer."
    ]
  },
  "gpu": {
    "summary": "Graphics Processing Units, the hardware engine of Deep Learning.",
    "significance": "Originally designed for video game graphics, their ability to perform massive parallel matrix calculations made them perfect for training neural networks.",
    "keyFacts": [
      "Popularized by NVIDIA.",
      "A single H100 GPU can cost upwards of $30,000.",
      "Fueling the current 'AI Gold Rush' for compute."
    ]
  },
  "chatgpt_launch": {
    "summary": "The viral release that brought AI capabilities to the general public.",
    "significance": "ChatGPT demonstrated that AI was no longer just a research curiosity but a transformative consumer product, triggering an industry-wide arms race.",
    "keyFacts": [
      "Launched November 30, 2022.",
      "Reached 1 million users in 5 days.",
      "Based on the GPT-3.5 architecture."
    ]
  }
};
