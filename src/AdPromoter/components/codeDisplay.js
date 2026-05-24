// codeDisplay.js
import React, { useState } from 'react';
import { Code, Maximize2, Copy, Check, X, ChevronLeft, ChevronRight, Zap, MousePointer } from 'lucide-react';
import { Button } from '../../components/button';

const CodeDisplay = ({ codes }) => {
  const [option, setOption]       = useState('auto');   // 'auto' | 'manual'
  const [langIndex, setLangIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied]       = useState(false);

  const LANGS = ['HTML', 'JavaScript', 'PHP', 'Python'];

  // Pick code based on selected option + language
  const currentKey = option === 'manual'
    ? LANGS[langIndex] + '_manual'
    : LANGS[langIndex];

  const currentCode = codes?.[currentKey] || codes?.[LANGS[langIndex]] || '';

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCode = (code, compact = false) => {
    if (!code) return null;
    const lines = compact ? code.split('\n').slice(0, 4) : code.split('\n');
    return lines.map((line, i) => (
      <div key={i} className="flex">
        <span className="text-zinc-600 select-none w-8 text-right pr-3 border-r border-zinc-700 shrink-0">
          {i + 1}
        </span>
        <span className="pl-3 flex-1 whitespace-pre text-zinc-200">{line}</span>
      </div>
    ));
  };

  // ── Option selector ──────────────────────────────────────
  const OptionTabs = () => (
    <div className="flex gap-2 mb-3">
      <button
        onClick={() => setOption('auto')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
          option === 'auto'
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
        }`}
      >
        <Zap className="w-3 h-3" />
        Auto-Placement
      </button>
      <button
        onClick={() => setOption('manual')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
          option === 'manual'
            ? 'bg-purple-600 border-purple-600 text-white'
            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
        }`}
      >
        <MousePointer className="w-3 h-3" />
        Manual Placement
      </button>
    </div>
  );

  // ── Option description ───────────────────────────────────
  const OptionHint = () => (
    <p className="text-xs text-zinc-500 mb-2 leading-relaxed">
      {option === 'auto'
        ? '⚡ Drop one script tag anywhere. It auto-places the ad based on the space type you chose when creating this category.'
        : '📍 You control exactly where the ad appears. Place the div where you want the ad, add the script once anywhere on the page.'}
    </p>
  );

  // ── Language selector ────────────────────────────────────
  const LangTabs = () => (
    <div className="inline-flex items-center bg-zinc-900 rounded-full p-1 mb-2">
      {LANGS.map((lang, idx) => (
        <button
          key={lang}
          onClick={() => setLangIndex(idx)}
          className={`text-xs px-2 py-1 rounded-full transition-colors ${
            langIndex === idx
              ? option === 'manual' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );

  // ── Compact code block ───────────────────────────────────
  const CompactCode = () => (
    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden shadow-sm">
      <div className="flex justify-between items-center px-3 py-1 border-b border-zinc-700">
        <div className="flex items-center gap-1">
          <Code className="w-3 h-3 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-200">{LANGS[langIndex]}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ml-1 font-semibold ${
            option === 'manual'
              ? 'bg-purple-900 text-purple-300'
              : 'bg-blue-900 text-blue-300'
          }`}>
            {option === 'auto' ? 'Auto' : 'Manual'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm"
            onClick={() => setModalOpen(true)}
            className="p-1 h-6 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm"
            onClick={() => handleCopy(currentCode)}
            className="p-1 h-6 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 relative"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      <div className="p-2 text-xs font-mono overflow-hidden max-h-24">
        <div className="min-w-max">
          {formatCode(currentCode, true)}
          {currentCode.split('\n').length > 4 && (
            <div className="text-right text-xs text-zinc-500 pt-1">
              + {currentCode.split('\n').length - 4} more lines...
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Modal ────────────────────────────────────────────────
  const Modal = () => {
    const [mCopied, setMCopied] = useState(false);
    const doCopy = () => {
      navigator.clipboard.writeText(currentCode);
      setMCopied(true);
      setTimeout(() => setMCopied(false), 2000);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
        <div className="relative w-full max-w-4xl mx-4 bg-[#1e1e1e] rounded-lg overflow-hidden shadow-2xl">

          {/* Modal header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-zinc-300" />
              <span className="font-medium text-zinc-100">{LANGS[langIndex]}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                option === 'manual'
                  ? 'bg-purple-700 text-purple-200'
                  : 'bg-blue-700 text-blue-200'
              }`}>
                {option === 'auto' ? '⚡ Auto-Placement' : '📍 Manual Placement'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={doCopy}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                {mCopied
                  ? <><Check className="w-4 h-4 mr-1 text-green-500" /><span className="text-green-500">Copied!</span></>
                  : <><Copy className="w-4 h-4 mr-1" /><span>Copy</span></>
                }
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Option + lang switcher inside modal */}
          <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-900 flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              {['auto','manual'].map(opt => (
                <button key={opt} onClick={() => setOption(opt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    option === opt
                      ? opt === 'manual'
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {opt === 'auto' ? <><Zap className="w-3 h-3" />Auto-Placement</> : <><MousePointer className="w-3 h-3" />Manual Placement</>}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              {LANGS.map((lang, idx) => (
                <button key={lang} onClick={() => setLangIndex(idx)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    langIndex === idx
                      ? option === 'manual' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code */}
          <div className="p-4 text-sm font-mono overflow-auto max-h-96">
            <div className="min-w-max text-zinc-200">
              {formatCode(currentCode || `// No code available for this option`)}
            </div>
          </div>

          {/* Hint */}
          <div className="px-4 py-3 border-t border-zinc-700 bg-zinc-900">
            <p className="text-xs text-zinc-500">
              {option === 'auto'
                ? '⚡ Auto-Placement: Drop this ONE script tag anywhere on your page. It detects the space type and places the ad in the right spot automatically.'
                : '📍 Manual Placement: Place the div exactly where you want the ad, then add the script tag once anywhere on the page (head or before </body>).'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-1">
        <OptionTabs />
        <OptionHint />
        <div className="flex justify-center">
          <LangTabs />
        </div>
        <CompactCode />
      </div>
      {modalOpen && <Modal />}
    </div>
  );
};

export default CodeDisplay;