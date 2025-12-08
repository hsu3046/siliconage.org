import React, { useState } from 'react';
import { Logo } from './Logo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangeLog: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenChangeLog }) => {
  const [formStatus, setFormStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus('SUBMITTING');

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/xvgepevq", {
        method: "POST",
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setFormStatus('SUCCESS');
        form.reset();
      } else {
        setFormStatus('ERROR');
      }
    } catch (error) {
      setFormStatus('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-surface border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">The Silicon Age</h2>
              <p className="text-xs text-slate-400 font-mono">v1.4.0 • From Transistors to AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-300">

          {/* Section 1: Introduction */}
          <section>
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
              About Project
            </h3>
            <p className="leading-relaxed text-sm mb-4">
              The Silicon Age is an interactive visualization project designed to map the complex evolution of computing and artificial intelligence.
              By connecting the dots between legendary companies, visionary pioneers, and breakthrough technologies, we aim to provide a holistic view of how we arrived at the modern AI era.
              <br /><br />
              Unlike linear timelines, this 4-dimensional map (Graph, Time, List, Space) reveals the hidden influence and structural relationships that define the industry.
            </p>

            {/* Buy Me A Coffee Button */}
            <a
              href="https://www.buymeacoffee.com/hsu3046"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-black rounded-lg hover:bg-[#FFEA00] transition-transform hover:scale-105 active:scale-95 shadow-md group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.216 6.415l-.132-.666c-.119-.596-.385-1.127-.778-1.547-.417-.444-.969-.74-1.579-.838-1.559-.251-4.706-.251-7.727-.01-2.26.18-4.56.63-6.68 1.3-.11.04-.22.08-.33.12-.5.2-.97.48-1.39.84-.57.49-.96 1.14-1.09 1.88l-1.5 8.35c-.17.95.14 1.93.81 2.65.6.64 1.45 1.01 2.33 1.01h.03c.51-.01 1.02-.13 1.48-.35.43-.2.83-.47 1.18-.79.37-.34.69-.73.93-1.16.27-.47.46-.98.57-1.51l.88-4.13c.04-.2.23-.33.43-.29.2.04.33.23.29.43l-.93 4.35c-.14.66-.38 1.28-.71 1.86-.34.58-.77 1.1-1.28 1.54-.53.46-1.13.82-1.78 1.07-.68.27-1.42.4-2.16.39-.02 0-.05 0-.07 0-1.21 0-2.34-.48-3.18-1.35-.93-.97-1.36-2.31-1.12-3.62l1.5-8.35c.16-.9.65-1.68 1.36-2.27.56-.47 1.2-.81 1.89-1.02.15-.05.3-.09.46-.14 2.21-.7 4.61-1.17 7-1.36 3.19-.25 6.54-.25 8.27.03.8.13 1.51.52 2.06 1.1.52.56.88 1.27 1.03 2.06l.13.67c.04.2.23.33.43.29.2-.04.33-.23.29-.43zm-8.216 6.585h-6c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm2-3h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1z" />
              </svg>
              <span className="font-['Poppins',sans-serif] font-medium text-sm">Buy me a coffee</span>
            </a>
          </section>

          {/* Section 2: Legal Disclaimer */}
          <section className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Disclaimer & Terms
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed text-justify">
              <strong>AI-Generated Content:</strong> The descriptions, summaries, and key facts presented on this website are generated using large language models (LLMs) to ensure objectivity and coverage. While we strive for accuracy, artificial intelligence can occasionally produce hallucinations or inaccuracies.
              <br /><br />
              <strong>No Warranty:</strong> This website is provided "as is" without any representations or warranties, express or implied. The creators make no representations or warranties in relation to the completeness or accuracy of the information found on this website.
              <br /><br />
              <strong>Limitation of Liability:</strong> In no event shall the creators be liable for any errors or omissions in the content, or for any damages arising from the use of this website. Users should verify critical historical data independently.
            </p>
          </section>

          {/* Section 3: Feedback Form (Formspree) */}
          <section>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              Feedback & Bug Report
            </h3>

            {formStatus === 'SUCCESS' ? (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <div>
                  <div className="font-bold">Message Sent!</div>
                  <div className="text-xs opacity-80">Thank you for your feedback. We will review it shortly.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-400 mb-1">Your Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:outline-none focus:border-primary placeholder-slate-600"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-slate-400 mb-1">Message / Correction</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Found a bug? Information correction? Feature request?"
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:outline-none focus:border-primary placeholder-slate-600 resize-none"
                  ></textarea>
                </div>

                {formStatus === 'ERROR' && (
                  <div className="text-xs text-red-400">
                    Something went wrong. Please try again later.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formStatus === 'SUBMITTING'}
                  className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus === 'SUBMITTING' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      Send Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <button
            onClick={onOpenChangeLog}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            ChangeLog
          </button>
          <p className="text-[10px] text-slate-500">
            © 2025 The Silicon Age Project
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutModal;