import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { useLocale } from '../hooks/useLocale';
import { Locale } from '../utils/i18n';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangeLog: () => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => Promise<void>;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenChangeLog, locale, onLocaleChange }) => {
  const [formStatus, setFormStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const { availableLocales, t } = useLocale();

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
              <h2 className="text-xl font-bold text-white tracking-tight">{t('about.title')}</h2>
              <p className="text-xs text-slate-400 font-mono">{t('about.version')} • {t('about.subtitle')}</p>
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
              {t('about.aboutProject')}
            </h3>
            <div className="leading-relaxed text-sm mb-4 space-y-3">
              {t('about.description').split('\n').map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Buy Me A Coffee Button */}
            <a
              href="https://www.buymeacoffee.com/hsu3046"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-black rounded-lg hover:bg-[#FFEA00] transition-transform hover:scale-105 active:scale-95 shadow-md group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" x2="6" y1="2" y2="4" />
                <line x1="10" x2="10" y1="2" y2="4" />
                <line x1="14" x2="14" y1="2" y2="4" />
              </svg>
              <span className="font-['Poppins',sans-serif] font-medium text-sm">{t('about.buyMeACoffee')}</span>
            </a>
          </section>

          {/* Section 2: Feedback Form (Formspree) */}
          <section>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              {t('about.feedback')}
            </h3>

            {formStatus === 'SUCCESS' ? (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <div>
                  <div className="font-bold">{t('about.feedbackSuccess')}</div>
                  <div className="text-xs opacity-80">{t('about.feedbackSuccessDesc')}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-400 mb-1">{t('about.feedbackEmail')}</label>
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
                  <label htmlFor="message" className="block text-xs font-bold text-slate-400 mb-1">{t('about.feedbackMessage')}</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder={t('about.feedbackPlaceholder')}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:outline-none focus:border-primary placeholder-slate-600 resize-none"
                  ></textarea>
                </div>

                {formStatus === 'ERROR' && (
                  <div className="text-xs text-red-400">
                    {t('about.feedbackError')}
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
                      {t('about.feedbackSending')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      {t('about.feedbackSend')}
                    </>
                  )}
                </button>
              </form>
            )}
          </section>

          {/* Section 3: Legal Disclaimer (minimal) */}
          <section className="pt-2 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              <span className="font-semibold">{t('about.disclaimer')}:</span> {t('about.disclaimerText').split('\n').map((line: string, i: number) => (
                <span key={i}>{line}{i === 0 && ' '}</span>
              ))}
            </p>
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
            {t('about.changelog')}
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
            <select
              value={locale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-700 transition-colors"
            >
              {availableLocales.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[10px] text-slate-500">
            {t('about.copyright')}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutModal;