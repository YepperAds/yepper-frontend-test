import React, { useState } from 'react';
import { Copy, Check, Plus, Code, Info, Zap, MousePointer, Globe, Trash2, ChevronDown, Edit, X } from 'lucide-react';

const AUTO_RELIABLE = [
  'header','floating','overlay','modalpic',
  'mobile interstitial','bottom','profooter'
];

// ── Language options for the code switcher ────────────────────
const CODE_LANGUAGES = ['HTML', 'JavaScript', 'PHP', 'Python'];

const HUMAN_LANGUAGES = [
  { value: 'english',     label: 'English' },
  { value: 'french',      label: 'French (Français)' },
  { value: 'kinyarwanda', label: 'Kinyarwanda' },
  { value: 'kiswahili',   label: 'Swahili' },
  { value: 'chinese',     label: 'Chinese (中文)' },
  { value: 'spanish',     label: 'Spanish (Español)' },
];

// ── Build the integration snippet for each code language ──────
function buildAutoScript(src, lang) {
  switch (lang) {
    case 'JavaScript':
      return `const s = document.createElement('script');\ns.src = '${src}';\ns.async = true;\ndocument.head.appendChild(s);`;
    case 'PHP':
      return `<?php\n$script = '<script src="${src}" async></script>';\necho $script;\n?>`;
    case 'Python':
      return `# Django / Jinja2 template\nSCRIPT_TAG = '<script src="${src}" async></script>'\n# Render in your template:\n# {{ script_tag|safe }}`;
    default: // HTML
      return `<script src="${src}" async></script>`;
  }
}

function buildManualDiv(spaceId, lang) {
  switch (lang) {
    case 'JavaScript':
      return `const el = document.createElement('div');\nel.dataset.yepperSpace = '${spaceId}';\ndocument.querySelector('#your-container').appendChild(el);`;
    case 'PHP':
      return `<?php echo '<div data-yepper-space="${spaceId}"></div>'; ?>`;
    case 'Python':
      return `# Django / Jinja2 template\nSPACE_DIV = '<div data-yepper-space="${spaceId}"></div>'\n# {{ space_div|safe }}`;
    default: // HTML
      return `<div data-yepper-space="${spaceId}"></div>`;
  }
}

// ── Copy button ───────────────────────────────────────────────
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700 shrink-0"
    >
      {copied
        ? <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copied</span></>
        : <><Copy className="w-3 h-3" /><span>Copy</span></>}
    </button>
  );
};

// ── Code block with language tab bar ─────────────────────────
const CodeBlock = ({ code, activeLang, onLangChange }) => (
  <div className="bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
    {/* Tab bar */}
    <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
      <div className="flex items-center gap-0.5">
        {/* traffic-light dots */}
        <div className="w-2 h-2 rounded-full bg-red-500 opacity-60 mr-1" />
        <div className="w-2 h-2 rounded-full bg-yellow-500 opacity-60 mr-1" />
        <div className="w-2 h-2 rounded-full bg-green-500 opacity-60 mr-3" />
        {/* language tabs */}
        {CODE_LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => onLangChange(lang)}
            className={`px-2 py-0.5 text-xs font-mono rounded transition-all ${
              activeLang === lang
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
      <CopyBtn text={code} />
    </div>
    {/* Code lines */}
    <div className="p-3 overflow-x-auto">
      {code.split('\n').map((line, i) => (
        <div key={i} className="flex min-w-max">
          <span className="text-zinc-700 select-none w-6 text-right pr-2 shrink-0 text-xs font-mono">{i + 1}</span>
          <span className="pl-2 text-xs font-mono whitespace-pre text-zinc-300">{line}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Left panel: auto script ───────────────────────────────────
const AutoPanel = ({ siteScript, websiteId, codeLang, onCodeLangChange, onAddSpace }) => {
  const BACKEND = process.env.REACT_APP_API_URL || 'https://yepper-backend-test.onrender.com';
  const fallbackSrc = `${BACKEND}/api/ads/script/site/${websiteId}`;
  const extractSrc = (val) => {
    if (!val) return null;
    const match = val.match(/src=["']([^"']+)["']/);
    return match ? match[1] : val;
  };
  const rawSrc = extractSrc(siteScript) || fallbackSrc;
  const code   = buildAutoScript(rawSrc, codeLang);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-zinc-100">Auto-Placement Script</h3>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">
        Paste this <strong className="text-zinc-300">once</strong> anywhere on your page.
        It handles <strong className="text-zinc-300">all</strong> your auto-placed spaces automatically.
        Never change it when you add more spaces.
      </p>

      <CodeBlock code={code} activeLang={codeLang} onLangChange={onCodeLangChange} />

      <div className="bg-blue-950 border border-blue-800 rounded-lg px-3 py-2 text-xs text-blue-300">
        ⚡ Best for: Header, Footer, Floating, Overlay, Mobile Interstitial
      </div>

      <button
        onClick={onAddSpace}
        className="flex items-center justify-center gap-2 w-full py-2 mt-auto rounded-lg border border-dashed border-blue-700 text-blue-400 hover:bg-blue-950 hover:border-blue-500 text-xs font-medium transition-all"
      >
        <Plus className="w-3 h-3" /> Add Auto Space
      </button>
    </div>
  );
};

// ── Right panel: one div per manual space ─────────────────────
const ManualPanel = ({ categories, codeLang, onCodeLangChange, onAddSpace, onDeleteCategory, onEditLanguage, onEditUserCount }) => (
  <div className="flex flex-col gap-3 h-full">
    <div className="flex items-center gap-2 mb-1">
      <MousePointer className="w-4 h-4 text-purple-400" />
      <h3 className="text-sm font-semibold text-zinc-100">Manual Placement Divs</h3>
    </div>
    <p className="text-xs text-zinc-500 leading-relaxed">
      Paste each div <strong className="text-zinc-300">exactly where you want that ad</strong> to appear.
      The script on the left injects the ad into it automatically.
    </p>

    {categories.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 bg-zinc-900 rounded-lg border border-dashed border-zinc-700 py-8">
        <Code className="w-5 h-5 text-zinc-600" />
        <p className="text-xs text-zinc-500 text-center">No spaces yet.<br />Add a space to get its placement div.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-72">
        {categories.map((cat, idx) => {
          const code = buildManualDiv(cat._id, codeLang);
          return (
            <div key={cat._id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-mono">{idx + 1}.</span>
                <span className="text-xs font-semibold text-zinc-300">{cat.categoryName || cat.spaceType}</span>
                <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded ml-auto">{cat.spaceType}</span>
                {AUTO_RELIABLE.includes((cat.spaceType || '').toLowerCase()) && (
                  <span className="text-xs text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">auto</span>
                )}
                {/* Delete button */}
                {onDeleteCategory && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat); }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-300 transition-all border border-red-900 shrink-0"
                    title="Delete space"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <CodeBlock code={code} activeLang={codeLang} onLangChange={onCodeLangChange} />
            </div>
          );
        })}
      </div>
    )}

    <button
      onClick={onAddSpace}
      className="flex items-center justify-center gap-2 w-full py-2 mt-auto rounded-lg border border-dashed border-purple-700 text-purple-400 hover:bg-purple-950 hover:border-purple-500 text-xs font-medium transition-all"
    >
      <Plus className="w-3 h-3" /> Add Manual Space
    </button>
  </div>
);

// ── Master container ──────────────────────────────────────────
export const MasterIntegration = ({ website, categories = [], onAddSpace, onLanguageChange, onDeleteCategory, onEditLanguage, onEditUserCount }) => {
  const [open, setOpen]             = useState(true);
  const [codeLang, setCodeLang]     = useState('HTML');
  const [humanLang, setHumanLang]   = useState('english');
  const [langSaved, setLangSaved]   = useState(false);

  const handleHumanLangChange = (val) => {
    setHumanLang(val);
    setLangSaved(false);
  };

  const handleSaveHumanLang = () => {
    if (onLanguageChange) onLanguageChange(humanLang);
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 2000);
  };

  const currentHumanLabel = HUMAN_LANGUAGES.find(l => l.value === humanLang)?.label || 'English';

  return (
    <div className="mb-8 rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Code className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-zinc-100">Integration Codes</p>
            <p className="text-xs text-zinc-500">
              {categories.length} space{categories.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>
        <span className={`text-zinc-500 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="border-t border-zinc-700">

          {/* ── Ad Language selector (applies to all spaces) ── */}
          <div className="px-5 py-3 border-b border-zinc-700 bg-zinc-950 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-medium text-zinc-300">Ads Language</span>
              <span className="text-zinc-600">— all spaces will serve ads in:</span>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <select
                value={humanLang}
                onChange={e => handleHumanLangChange(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-zinc-500"
              >
                {HUMAN_LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <button
                onClick={handleSaveHumanLang}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all border ${
                  langSaved
                    ? 'bg-green-900 border-green-700 text-green-300'
                    : 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                {langSaved ? <><Check className="w-3 h-3" /> Saved</> : 'Apply to All Spaces'}
              </button>
            </div>
          </div>

          {/* ── Two code panels ── */}
          <div className="grid grid-cols-2 divide-x divide-zinc-700">
            <div className="p-5">
              <AutoPanel
                siteScript={website?.siteScript}
                websiteId={website?._id}
                codeLang={codeLang}
                onCodeLangChange={setCodeLang}
                onAddSpace={onAddSpace}
              />
            </div>
            <div className="p-5">
              <ManualPanel
                categories={categories}
                codeLang={codeLang}
                onCodeLangChange={setCodeLang}
                onAddSpace={onAddSpace}
                onDeleteCategory={onDeleteCategory}
                onEditLanguage={onEditLanguage}
                onEditUserCount={onEditUserCount}
              />
            </div>
          </div>

          {/* ── Spaces summary strip ── */}
          {categories.length > 0 && (
            <div className="border-t border-zinc-700 px-5 py-3 bg-zinc-950">
              <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">
                {categories.length} Ad Space{categories.length !== 1 ? 's' : ''} on this site
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <div
                    key={cat._id}
                    className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs group"
                  >
                    <span className="font-semibold text-zinc-200">{cat.categoryName || cat.spaceType}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-400">${cat.price}/ad</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-400">{cat.userCount} user{cat.userCount !== 1 ? 's' : ''}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500 capitalize">{cat.defaultLanguage || currentHumanLabel}</span>
                    {/* Delete button in summary strip */}
                    {onDeleteCategory && (
                      <button
                        onClick={() => onDeleteCategory(cat)}
                        className="ml-1 opacity-0 group-hover:opacity-100 flex items-center justify-center w-4 h-4 rounded text-red-500 hover:text-red-400 hover:bg-red-950 transition-all"
                        title="Delete space"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer tip ── */}
          <div className="border-t border-zinc-700 px-5 py-3 flex items-start gap-2 bg-zinc-950">
            <Info className="w-3 h-3 text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500">
              The script on the left handles everything automatically. For spaces that need exact
              placement, also paste the relevant div from the right panel. New spaces are picked
              up automatically — no need to update the script.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Default export kept for backward compat
const CodeDisplay = () => null;
export default CodeDisplay;
