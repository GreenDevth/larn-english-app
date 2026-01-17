import React, { useState, useEffect } from 'react';
import { Volume2, Lightbulb, Settings, Star, Trophy, Image as ImageIcon, Delete, Send, CheckCircle, XCircle, Cloud, BookOpen, ChevronLeft, Play, Plus, Trash2, Save, Edit, GripVertical, ChevronDown, ChevronRight, SpellCheck, Menu, X } from 'lucide-react';
import SummaryScreen from './components/SummaryScreen';

// --- No hard-coded data - all vocab loaded from vocab.csv ---

// --- Error Modal Component ---
const ErrorModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="text-red-500" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
};

// --- Admin Helper: Generate CSV from Units ---
const generateCSV = (units) => {
  let csv = "";
  units.forEach(unit => {
    csv += `${unit.name}\nEN,TH,ImageURL\n`;
    (unit.items || unit.words || []).forEach(word => {
      csv += `${word.en},${word.th},${word.img || ''}\n`;
    });
  });
  return csv;
};

const AdminPanel = ({ units: initialUnits, onSave, onCancel, voices, voicePrefs, setVoicePrefs, saveVoicePrefs }) => {
  const [localUnits, setLocalUnits] = useState(JSON.parse(JSON.stringify(initialUnits || [])));
  const [expandedUnits, setExpandedUnits] = useState({});

  const toggleUnit = (idx) => {
    setExpandedUnits(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const updateUnitName = (idx, name) => {
    const newUnits = [...localUnits];
    newUnits[idx].name = name;
    setLocalUnits(newUnits);
  };

  const addUnit = () => {
    setLocalUnits([...localUnits, { name: `Unit ${localUnits.length + 1}`, items: [] }]);
  };

  const removeUnit = (idx) => {
    if (!confirm("Delete this entire unit?")) return;
    setLocalUnits(localUnits.filter((_, i) => i !== idx));
  };

  const addWord = (unitIdx) => {
    const newUnits = [...localUnits];
    newUnits[unitIdx].items.push({ en: '', th: '', img: '' });
    setLocalUnits(newUnits);
    setExpandedUnits(prev => ({ ...prev, [unitIdx]: true }));
  };

  const updateWord = (unitIdx, wordIdx, field, value) => {
    const newUnits = [...localUnits];
    newUnits[unitIdx].items[wordIdx][field] = value;
    setLocalUnits(newUnits);
  };

  const removeWord = (unitIdx, wordIdx) => {
    const newUnits = [...localUnits];
    newUnits[unitIdx].items = newUnits[unitIdx].items.filter((_, i) => i !== wordIdx);
    setLocalUnits(newUnits);
  };

  const handleSave = () => {
    const csvString = generateCSV(localUnits);
    onSave(csvString);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl p-6 shadow-2xl animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <Settings className="mr-3 text-blue-500" size={32} />
            จัดการบทเรียน (Admin)
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors">
            <XCircle size={32} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">

          {/* Voice Settings Section */}
          <div className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center"><Volume2 size={18} className="mr-2" /> Voice Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">English Voice</label>
                <select
                  value={voicePrefs['en-US'] || ''}
                  onChange={(e) => { const p = { ...voicePrefs, ['en-US']: e.target.value || null }; saveVoicePrefs(p); }}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Auto-detect (Recommended)</option>
                  {voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en')).map((v, i) => (
                    <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thai Voice</label>
                <select
                  value={voicePrefs['th-TH'] || ''}
                  onChange={(e) => { const p = { ...voicePrefs, ['th-TH']: e.target.value || null }; saveVoicePrefs(p); }}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Auto-detect (Recommended)</option>
                  {voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('th')).map((v, i) => (
                    <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Units List */}
          <div className="space-y-4">
            {localUnits.map((unit, unitIdx) => (
              <div key={unitIdx} className="border border-blue-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                {/* Unit Header */}
                <div className="bg-blue-50/50 p-3 flex items-center gap-3 border-b border-blue-100">
                  <button onClick={() => toggleUnit(unitIdx)} className="p-1 hover:bg-blue-100 rounded-lg text-blue-400">
                    {expandedUnits[unitIdx] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={unit.name}
                      onChange={(e) => updateUnitName(unitIdx, e.target.value)}
                      className="w-full bg-transparent font-bold text-blue-800 text-lg border-none focus:ring-0 p-0 placeholder-blue-300"
                      placeholder="Unit Name..."
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-300 bg-white px-2 py-1 rounded-lg">{(unit.items || []).length} words</span>
                  <button onClick={() => removeUnit(unitIdx)} className="p-2 hover:bg-red-100 text-gray-300 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Words Grid */}
                {expandedUnits[unitIdx] && (
                  <div className="p-3 bg-white animate-slide-up">
                    <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 mb-2 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <div>English</div>
                      <div>Thai</div>
                      <div>Image URL</div>
                      <div></div>
                    </div>
                    <div className="space-y-2">
                      {(unit.items || []).map((word, wordIdx) => (
                        <div key={wordIdx} className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-center group">
                          <input
                            value={word.en}
                            onChange={(e) => updateWord(unitIdx, wordIdx, 'en', e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            placeholder="apple"
                          />
                          <input
                            value={word.th}
                            onChange={(e) => updateWord(unitIdx, wordIdx, 'th', e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm thai-font focus:border-blue-500 outline-none"
                            placeholder="แอปเปิ้ล"
                          />
                          <div className="relative">
                            <input
                              value={word.img}
                              onChange={(e) => updateWord(unitIdx, wordIdx, 'img', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:border-blue-500 outline-none pr-8"
                              placeholder="https://..."
                            />
                            {word.img && <ImageIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                          </div>
                          <button onClick={() => removeWord(unitIdx, wordIdx)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                            <XCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addWord(unitIdx)} className="mt-3 w-full py-2 border-2 border-dashed border-blue-200 text-blue-400 rounded-xl hover:bg-blue-50 hover:border-blue-300 font-bold text-sm flex items-center justify-center transition-all">
                      <Plus size={16} className="mr-2" /> Add Word
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={addUnit} className="mt-6 w-full py-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 font-bold flex items-center justify-center transition-all">
            <Plus size={20} className="mr-2" /> Add New Unit
          </button>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              if (confirm('ต้องการรีเซ็ตข้อมูลกลับไปเป็นค่าเริ่มต้นจากไฟล์ vocab.csv หรือไม่?')) {
                localStorage.removeItem('vocabCSV');
                window.location.reload();
              }
            }}
            className="px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-bold transition-colors"
          >
            🔄 Reset to Default
          </button>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 flex items-center">
              <Save size={20} className="mr-2" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Components (Moved outside App to prevent re-renders) ---
const WordImage = ({ word, imgUrl }) => {
  const PLACEHOLDER_TEXT = "?"; // Don't show word to avoid spoilers
  const [imgSrc, setImgSrc] = useState(imgUrl || `https://placehold.co/400x300/FFB347/ffffff?text=${PLACEHOLDER_TEXT}`);

  useEffect(() => {
    if (imgUrl) setImgSrc(imgUrl);
    else setImgSrc(`https://placehold.co/400x300/FFB347/ffffff?text=${PLACEHOLDER_TEXT}`);
  }, [word, imgUrl]);

  return (
    <div className="w-full h-auto max-h-[35vh] min-h-[150px] bg-[#F0F9FF] relative group flex items-center justify-center overflow-hidden flex-1">
      <div className="absolute z-0 opacity-20 group-hover:scale-110 transition-transform duration-700">
        <ImageIcon size={80} className="text-blue-200" />
      </div>
      <img src={imgSrc} alt={word} className="w-full h-full object-contain p-4 z-10 relative transition-transform duration-500 group-hover:scale-105" onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://placehold.co/600x600?text=${PLACEHOLDER_TEXT}`
      }} />
    </div>
  );
};

const LetterBox = ({ letter, status, sizeClass }) => {
  let borderClass = "border-b-gray-300 bg-white text-gray-700";

  if (status === 'correct') {
    borderClass = "border-b-green-500 bg-green-100 text-green-600 border-green-500";
  } else if (status === 'wrong') {
    borderClass = "border-b-red-500 bg-red-50 text-red-500 border-red-500";
  }

  // Check if letter is a space
  const isSpace = letter === ' ';

  return (
    <div className={`${sizeClass} border-2 border-b-4 rounded-xl flex items-center justify-center font-bold transition-all duration-200 ${borderClass} shadow-sm`}>
      {isSpace ? '␣' : letter.toUpperCase()}
    </div>
  );
};

const Keyboard = ({ onKeyPress, playKeySound, isShiftActive }) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <div className="w-full max-w-xl bg-white/95 backdrop-blur rounded-t-3xl shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] p-3 sm:p-6 fixed bottom-0 left-0 right-0 mx-auto z-50 pb-safe animate-slide-up border-t border-gray-100">
      {/* แถวที่ 1: Q-P (10 ปุ่ม) */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
        {rows[0].map((char) => (
          <button key={char} onClick={() => { playKeySound(); onKeyPress(char); }}
            className="aspect-square w-full bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-[0_3px_0_rgb(219,234,254)] active:shadow-none active:translate-y-[2px] transition-all uppercase border-2 border-blue-100 relative top-0 active:top-[2px] flex items-center justify-center"
          >
            {isShiftActive ? char.toUpperCase() : char}
          </button>
        ))}
      </div>

      {/* แถวที่ 2: A-L (9 ปุ่ม) - จัดกึ่งกลาง */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
        <div className="col-span-1"></div> {/* Spacer ซ้าย */}
        {rows[1].map((char) => (
          <button key={char} onClick={() => { playKeySound(); onKeyPress(char); }}
            className="aspect-square w-full bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-[0_3px_0_rgb(219,234,254)] active:shadow-none active:translate-y-[2px] transition-all uppercase border-2 border-blue-100 relative top-0 active:top-[2px] flex items-center justify-center"
          >
            {isShiftActive ? char.toUpperCase() : char}
          </button>
        ))}
      </div>

      {/* แถวที่ 3: Z-M (7 ปุ่ม) - จัดกึ่งกลาง */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 mb-2 sm:mb-3">
        <div className="col-span-1"></div> {/* Spacer ซ้าย */}
        <div className="col-span-1"></div> {/* Spacer ซ้าย */}
        {rows[2].map((char) => (
          <button key={char} onClick={() => { playKeySound(); onKeyPress(char); }}
            className="aspect-square w-full bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-[0_3px_0_rgb(219,234,254)] active:shadow-none active:translate-y-[2px] transition-all uppercase border-2 border-blue-100 relative top-0 active:top-[2px] flex items-center justify-center"
          >
            {isShiftActive ? char.toUpperCase() : char}
          </button>
        ))}
        <div className="col-span-1"></div> {/* Spacer ขวา */}
      </div>

      {/* ปุ่มควบคุม */}
      <div className="flex justify-center gap-2 sm:gap-3 px-2">
        {/* ปุ่ม Shift */}
        <button onClick={() => onKeyPress('SHIFT')}
          className={`flex-1 max-w-[100px] h-11 sm:h-12 rounded-lg font-bold shadow-[0_3px_0_rgb(147,197,253)] active:translate-y-[2px] active:shadow-none flex items-center justify-center border-2 text-sm sm:text-base relative transition-all ${isShiftActive
            ? 'bg-blue-500 text-white border-blue-600'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100'
            }`}
        >
          ⇧ Shift
        </button>

        {/* ปุ่ม Space */}
        <button onClick={() => onKeyPress('SPACE')}
          className="flex-1 max-w-[200px] h-11 sm:h-12 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg font-bold shadow-[0_3px_0_rgb(229,231,235)] active:translate-y-[2px] active:shadow-none flex items-center justify-center border-2 border-gray-200 text-sm sm:text-base relative"
        >
          ␣ Space
        </button>

        <button onClick={() => onKeyPress('CLEAR')}
          className="flex-1 max-w-[120px] h-11 sm:h-12 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg font-bold shadow-[0_3px_0_rgb(255,237,213)] active:translate-y-[2px] active:shadow-none flex items-center justify-center border border-orange-200 text-sm sm:text-base relative"
        >
          <XCircle size={16} className="mr-1.5" /> ล้าง
        </button>
        <button onClick={() => onKeyPress('DELETE')}
          className="flex-1 max-w-[100px] h-11 sm:h-12 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg font-bold shadow-[0_3px_0_rgb(254,202,202)] active:translate-y-[2px] active:shadow-none flex items-center justify-center border border-red-100 text-sm sm:text-base relative"
        >
          <Delete size={16} className="mr-1.5" /> ลบ
        </button>
      </div>
    </div>
  );
};

const ParticleSystem = ({ type }) => {
  if (!type) return null;

  // Rain logic for 'wrong'
  if (type === 'wrong') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute animate-rain" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            width: '3px',
            height: '15px',
            backgroundColor: '#9CA3AF',
            animationDuration: `${0.6 + Math.random() * 0.4}s`,
            animationDelay: `${Math.random() * 0.2}s`
          }} />
        ))}
      </div>
    );
  }

  // Grand Firework logic (Multi-burst) with Rocket Launch
  const bursts = [
    { x: 50, y: 50, color: '#FFD700', delay: 0 },     // Center Gold
    { x: 20, y: 40, color: '#FF0000', delay: 0.1 },   // Left Red
    { x: 80, y: 40, color: '#00FFFF', delay: 0.1 },   // Right Cyan
    { x: 35, y: 25, color: '#FF00FF', delay: 0.2 },   // Top Left Magenta
    { x: 65, y: 25, color: '#00FF00', delay: 0.2 },   // Top Right Green
    { x: 50, y: 20, color: '#FFFFFF', delay: 0.3 }    // High Center White
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {bursts.map((burst, bIdx) => {
        // No flight time - instant explosion
        const explosionDelay = burst.delay;

        return (
          <React.Fragment key={bIdx}>
            {/* Rocket Trail Removed - Instant Effect */}
            {/* Explosion Particles - Ribbons */}
            {Array.from({ length: 40 }).map((_, pIdx) => {
              const angle = Math.random() * Math.PI * 2;
              const velocity = Math.random() * 25 + 10;
              const tx = Math.cos(angle) * velocity;
              const ty = Math.sin(angle) * velocity;
              const color = Math.random() > 0.3 ? burst.color : ['#FFF', '#FFD700', '#FF69B4', '#00CED1'][Math.floor(Math.random() * 4)];

              return (
                <div
                  key={`${bIdx}-${pIdx}`}
                  className="absolute animate-firework"
                  style={{
                    left: `${burst.x}%`,
                    top: `${burst.y}%`,
                    '--tx': `${tx}vw`,
                    '--ty': `${ty}vh`,
                    '--rot': `${Math.random() * 360}deg`,
                    backgroundColor: color,
                    width: `${Math.random() * 6 + 4}px`,
                    height: `${Math.random() * 12 + 8}px`,
                    borderRadius: '2px', // Slight round for ribbon feel
                    animationDuration: '1.5s',
                    animationDelay: `${explosionDelay}s`,
                    boxShadow: `0 0 5px ${color}`
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function App() {
  const [units, setUnits] = useState([]);
  const [currentUnit, setCurrentUnit] = useState(null); // { name: "Unit 1", words: [] }
  const [screen, setScreen] = useState('home'); // 'home', 'game'
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);

  // Game State
  const [vocabList, setVocabList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, correct, wrong, complete
  const [showHint, setShowHint] = useState(false);

  // Speech voices and prefs
  const [voices, setVoices] = useState([]);
  const [voicePrefs, setVoicePrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('voicePrefs') || '{}'); } catch (e) { return {}; }
  });
  const [particleType, setParticleType] = useState(null); // 'correct', 'wrong'


  // System voice language (EN/TH)
  const [systemVoiceLang, setSystemVoiceLang] = useState(() => {
    try { return localStorage.getItem('systemVoiceLang') || 'th'; } catch (e) { return 'th'; }
  });

  // Volume control (0-100)
  const [volume, setVolume] = useState(() => {
    try { return parseInt(localStorage.getItem('volume') || '70'); } catch (e) { return 70; }
  });

  // Background music
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Statistics tracking for Summary Screen
  const [wordStats, setWordStats] = useState([]); // Array of {word, correct, time, attempts}
  const [startTime, setStartTime] = useState(null); // Time when current word started
  const [attempts, setAttempts] = useState(0); // Number of attempts for current word

  // Error Modal State
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const v = window.speechSynthesis.getVoices() || [];
      setVoices(v);
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => loadVoices();
    }
  }, []);

  // --- Initialization ---
  useEffect(() => {
    loadVocab();
  }, []);

  const loadVocab = async () => {
    try {
      // First, try to load from localStorage (user's custom edits)
      const savedCSV = localStorage.getItem('vocabCSV');

      if (savedCSV) {
        // User has custom data, use it
        setCsvInput(savedCSV);
        const parsedUnits = parseCSV(savedCSV);
        setUnits(parsedUnits);
      } else {
        // No custom data, load from external file
        // Use import.meta.env.BASE_URL to handle both dev and production paths
        const basePath = import.meta.env.BASE_URL || '/';
        const vocabPath = `${basePath}vocab.csv`.replace('//', '/');

        console.log('Attempting to load vocab from:', vocabPath);
        const response = await fetch(vocabPath);

        if (response.ok) {
          const csvText = await response.text();
          setCsvInput(csvText);
          const parsedUnits = parseCSV(csvText);
          setUnits(parsedUnits);
          console.log('✅ Loaded vocab successfully:', parsedUnits.length, 'units');
        } else {
          // Show error modal if file not found
          console.error('ไม่พบไฟล์ vocab.csv ที่:', vocabPath, 'Status:', response.status);
          setErrorModal({
            isOpen: true,
            title: '⚠️ ไม่พบไฟล์ vocab.csv',
            message: `ไม่สามารถโหลดไฟล์ข้อมูลคำศัพท์ได้\n\nกรุณาตรวจสอบว่าไฟล์ vocab.csv อยู่ในโฟลเดอร์ public/\n\nPath ที่พยายามโหลด: ${vocabPath}`
          });
          setUnits([]);
        }
      }
    } catch (error) {
      console.error('Error loading vocab:', error);
      setErrorModal({
        isOpen: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: `เกิดข้อผิดพลาดในการโหลดข้อมูล\n\n${error.message}`
      });
      setUnits([]);
    }
  };

  const loadCsvAndUnits = () => {
    loadVocab();
  };

  const parseCSV = (csvText) => {
    if (!csvText) return [];
    const rawLines = csvText.split(/\r?\n/).map(l => l.trim());
    const lines = rawLines.filter(l => l !== '');
    const units = [];

    // If file doesn't contain Unit headers, treat everything as Unit 1
    if (lines.length === 0) return units;

    if (!/^Unit\s*/i.test(lines[0])) {
      const unit = { name: 'Unit 1', items: [] };
      units.push(unit);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^EN\s*,/i.test(line)) continue; // skip header
        const parts = line.split(',');
        if (parts.length >= 2) {
          const en = parts[0].trim();
          const th = parts[1].trim();
          const img = (parts[2] || '').trim();
          if (en) unit.items.push({ en, th, img });
        }
      }
      return units;
    }

    // Multi-unit file with Unit headers
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^Unit\s*/i.test(line)) {
        const unit = { name: line.trim(), items: [] };
        units.push(unit);
        i++;
        if (i < lines.length && /^EN\s*,/i.test(lines[i])) i++; // skip header
        while (i < lines.length && !/^Unit\s*/i.test(lines[i])) {
          const l = lines[i];
          if (l) {
            const parts = l.split(',');
            if (parts.length >= 2) {
              const en = parts[0].trim();
              const th = parts[1].trim();
              const img = (parts[2] || '').trim();
              if (en) unit.items.push({ en, th, img });
            }
          }
          i++;
        }
      } else {
        i++;
      }
    }

    return units;
  };
  // --- Audio FX ---
  const playGameSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();

      // Ensure AudioContext is not suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.error("Audio FX error", e);
    }
  };

  // เสียงกดปุ่มแบบพิมพ์ดีด
  const playKeySound = () => {
    try {
      if (typeof window === 'undefined' || !window.AudioContext) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      // สร้างเสียงคลิกสั้น ๆ แบบพิมพ์ดีด
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      // เสียงคลิกสั้น ๆ ความถี่สูง
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);

      // Volume ต่ำและสั้นมาก
      const vol = volume / 100 * 0.1; // ใช้ volume จาก state
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Ignore errors
    }
  };

  const playSoundEffect = (type) => {
    playGameSound(type); // Play SFX

    if (type === 'correct') {
      // คำชมภาษาไทย
      const correctMessagesTH = [
        "ถูกต้อง! เยี่ยมไปเลย",
        "ถูกต้อง! เก่งมากเลย",
        "ถูกต้อง! สุดยอดที่สุดเลย",
        "ว้าว! ถูกต้องแล้ว เก่งมากเลย",
        "เจ๋งมาก! นี่มันสุดยอดจริง ๆ",
        "เยี่ยมมาก! ทำได้ดีสุด ๆ เลย",
        "สุดยอดเลย! เก่งเกินคาดจริง ๆ",
        "ว้าว! ตอบถูกแล้ว น่าประทับใจมาก",
        "เก่งมาก ๆ เลย! น่ารักสุด ๆ",
        "เยี่ยมจริง ๆ! สุดยอดฝีมือเลย"
      ];

      // คำชมภาษาอังกฤษ
      const correctMessagesEN = [
        "Correct! Excellent!",
        "Correct! Great job!",
        "Correct! Awesome!",
        "Wow! That's right!",
        "Amazing! Correct!"
      ];

      const messages = systemVoiceLang === 'en' ? correctMessagesEN : correctMessagesTH;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const lang = systemVoiceLang === 'en' ? 'en-US' : 'th-TH';
      speak(randomMessage, lang);
    } else if (type === 'wrong') {
      // คำให้กำลังใจภาษาไทย
      const wrongMessagesTH = [
        "ไม่เป็นไรนะ ลองใหม่อีกครั้งได้",
        "เกือบแล้ว! ลองคิดอีกนิดนะ",
        "ยังไม่ถูกนะ มันต้องใส่ตัวอักษรอะไรดี",
        "พลาดไปนิดเดียวเอง",
        "ลองดูใหม่นะ อีกนิดเดียว",
        "ดูเหมือนยังไม่ถูกนะ ลองใหม่อีกครั้งนะ",
        "ยังไม่ใช่ แต่ความพยายามสุดยอดมาก",
        "ยังไม่ถูกนะ ลองคิดอีกนิดนะ"
      ];

      // คำให้กำลังใจภาษาอังกฤษ
      const wrongMessagesEN = [
        "Oops! Try again!",
        "Oops! Almost there!",
        "Oops! Not quite!",
        "Oh! One more time!",
        "Hmm! Try once more!"
      ];

      const messages = systemVoiceLang === 'en' ? wrongMessagesEN : wrongMessagesTH;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const lang = systemVoiceLang === 'en' ? 'en-US' : 'th-TH';
      speak(randomMessage, lang);
    }
  };

  // Global unlock for Speech Synthesis on mobile
  useEffect(() => {
    const unlockSpeech = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Try to resume speech synthesis
        window.speechSynthesis.resume();
        console.log('🔓 Speech synthesis unlocked');
      }
    };

    // Listen for any user interaction
    document.addEventListener('touchstart', unlockSpeech, { once: true, passive: true });
    document.addEventListener('click', unlockSpeech, { once: true, passive: true });

    return () => {
      document.removeEventListener('touchstart', unlockSpeech);
      document.removeEventListener('click', unlockSpeech);
    };
  }, []);

  // --- Helpers / Actions ---
  const createBonusUnit = (units, count = 20) => {
    // รวบรวมคำศัพท์จากทุก unit
    const allWords = [];
    units.forEach(unit => {
      if (unit.items && unit.items.length > 0) {
        allWords.push(...unit.items);
      }
    });

    // สุ่มคำศัพท์ (ไม่ซ้ำกัน) โดยใช้ Fisher-Yates shuffle
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(count, allWords.length));

    return {
      name: '🎁 Bonus: ทบทวนทั้งหมด',
      items: selectedWords,
      isBonus: true
    };
  };

  const startGame = (unit) => {
    setCurrentUnit(unit);
    setVocabList(unit?.items || []);
    setCurrentIndex(0);
    setScore(0);
    setCurrentInput("");
    setGameStatus('playing');
    setScreen('game');
    // Reset statistics
    setWordStats([]);
    setStartTime(Date.now());
    setAttempts(0);
    // Speak immediately for Chrome Android autoplay policy
    try { speak(`เริ่ม ${unit?.name || 'บทเรียน'}`, 'th-TH', { interrupt: true }); } catch (e) { }
  };

  const goHome = () => {
    setScreen('home');
    setCurrentUnit(null);
    setVocabList([]);
  };

  const saveSettings = (newCsvContent) => {
    // Save CSV to localStorage and re-parse units
    const contentToSave = typeof newCsvContent === 'string' ? newCsvContent : csvInput;
    localStorage.setItem('vocabCSV', contentToSave);
    const parsed = parseCSV(contentToSave);
    setUnits(parsed);
    setCsvInput(contentToSave); // Update state too
    setIsAdminOpen(false);
    speak("บันทึกข้อมูลเรียบร้อยแล้ว", 'th-TH');
  };

  const saveVoicePrefs = (prefs) => {
    setVoicePrefs(prefs);
    try { localStorage.setItem('voicePrefs', JSON.stringify(prefs)); } catch (e) { }
  };

  const chooseVoiceForLang = (lang) => {
    if (!voices || voices.length === 0) return null;
    const langPrefix = (lang || '').toLowerCase().slice(0, 2);
    let candidates = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
    // Added common Thai female voice names: Pattara (Windows), Narisa (Mac/iOS), Premwadee (Android? check specs but good to add)
    const preferredNames = ['female', 'samantha', 'kwanya', 'pattara', 'narisa', 'premwadee', 'serena', 'alloy', 'zoe', 'clara', 'google', 'wave', 'fem', 'kate', 'luna', 'maya', 'th-'].map(s => s.toLowerCase());
    const scoreVoice = (voice) => {
      const name = (voice.name || '').toLowerCase();
      let score = 0;
      preferredNames.forEach(p => { if (name.includes(p)) score += 2; });
      if (voice.default) score += 1;
      return score;
    };
    if (candidates.length === 0) candidates = voices.slice();
    candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    return candidates[0] || null;
  };

  // ตรวจสอบเพศของเสียงจากชื่อ
  const detectVoiceGender = (voice) => {
    if (!voice || !voice.name) return 'neutral';
    const name = voice.name.toLowerCase();

    // คำที่บ่งบอกเพศหญิง
    const femaleKeywords = ['female', 'woman', 'girl', 'samantha', 'kwanya', 'pattara', 'narisa', 'premwadee',
      'serena', 'alloy', 'zoe', 'clara', 'fem', 'kate', 'luna', 'maya', 'siri', 'alexa',
      'google.*female', 'th-th.*female'];

    // คำที่บ่งบอกเพศชาย
    const maleKeywords = ['male', 'man', 'boy', 'david', 'mark', 'james', 'google.*male', 'th-th.*male'];

    // ตรวจสอบเพศหญิง
    for (const keyword of femaleKeywords) {
      if (name.includes(keyword)) return 'female';
    }

    // ตรวจสอบเพศชาย
    for (const keyword of maleKeywords) {
      if (name.includes(keyword)) return 'male';
    }

    return 'neutral'; // ไม่สามารถระบุได้
  };

  // เลือกคำลงท้ายที่เหมาะสม (ค่ะ/ครับ) ตามเพศของเสียง
  const getPoliteEnding = (voice, femaleVersion, maleVersion, neutralVersion = '') => {
    const gender = detectVoiceGender(voice);
    if (gender === 'female') return femaleVersion;
    if (gender === 'male') return maleVersion;
    return neutralVersion || femaleVersion; // default เป็นหญิงถ้าไม่ระบุ
  };

  const speak = (text, lang, opts = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      const u = new SpeechSynthesisUtterance(String(text || ''));
      if (lang) u.lang = lang;
      u.rate = opts.rate || 0.95;
      u.pitch = opts.pitch || 1;
      u.volume = typeof opts.volume === 'number' ? opts.volume : (volume / 100);
      const prefName = (voicePrefs && voicePrefs[lang]) || null;
      let voiceToUse = null;
      const langPrefix = (lang || '').toLowerCase().slice(0, 2);

      if (prefName && voices && voices.length > 0) {
        // Prefer an exact-name match that also supports the requested language prefix.
        voiceToUse = voices.find(v => v.name === prefName && v.lang && v.lang.toLowerCase().startsWith(langPrefix))
          // If exact-name+lang not found, fall back to exact-name (might be cross-lingual but better than nothing)
          || voices.find(v => v.name === prefName) || null;
        // If we found a pref but it's not ideal (language mismatch), prefer to ignore and pick a voice matching the language instead.
        if (voiceToUse && voiceToUse.lang && !voiceToUse.lang.toLowerCase().startsWith(langPrefix)) {
          // pick a voice matching the language; keep pref only if that's the only match
          const langMatch = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
          if (langMatch) voiceToUse = langMatch;
        }
      }
      // Allow caller to override voice directly via opts.voiceOverride
      if (opts && opts.voiceOverride) {
        voiceToUse = opts.voiceOverride;
      }

      // If still not selected, ensure we have a candidate
      if (!voiceToUse) voiceToUse = chooseVoiceForLang(lang) || null;

      if (voiceToUse) u.voice = voiceToUse;

      // Default interrupt to true if not specified
      const shouldInterrupt = opts.interrupt !== false;
      if (shouldInterrupt) {
        try { window.speechSynthesis.cancel(); } catch (e) { }
      }

      window.speechSynthesis.speak(u);
    } catch (e) {
      // ignore if not available
    }
  };

  // Enhanced playTextToSpeech function with fallback and user interaction
  const playTextToSpeech = (text, lang) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        alert("Your browser does not support text-to-speech functionality.");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      const voice = voices.find(v => v.lang === lang);
      if (voice) {
        utterance.voice = voice;
      }

      // Fallback to a default voice if available
      if (!voice && voices.length > 0) {
        utterance.voice = voices[0];
      }

      // Play the utterance
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("TTS Error:", e);
    }
  };

  return (
    <div className="font-sans antialiased bg-gray-50 min-h-screen flex flex-col">
      {/* Admin Panel - สำหรับแก้ไขคำศัพท์ */}
      {isAdminOpen && (
        <AdminPanel
          units={units}
          onSave={(newCsv) => {
            setParticleType('correct');
            saveSettings(newCsv);
          }}
          onCancel={() => setIsAdminOpen(false)}
          voices={voices}
          voicePrefs={voicePrefs}
          setVoicePrefs={setVoicePrefs}
          saveVoicePrefs={saveVoicePrefs}
        />
      )}

      {/* Navigation - ซ่อนในหน้าเกม */}
      {screen === 'home' && (
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <div className="text-xl font-bold text-blue-600">
              {/* Logo หรือ ชื่อแอปพลิเคชัน */}
              Vocab Trainer
            </div>
            <div className="flex items-center gap-4">
              {/* ปุ่มเสียง */}
              <div className="flex items-center gap-2">
                <Volume2 size={20} className="text-gray-600" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Math.min(100, Math.max(0, e.target.value)))}
                  className="w-24 accent-blue-500"
                />
              </div>

              {/* ปุ่มเมนู - สำหรับเปิดปิด Admin Panel */}
              <button onClick={() => setIsAdminOpen(true)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <Settings size={20} className="text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* หน้าเกม - แสดงคำศัพท์และรับคำตอบ */}
      {screen === 'game' && currentUnit && (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          {/* ปุ่มกลับไปหน้าหลัก */}
          <button onClick={goHome} className="self-start text-gray-500 hover:text-blue-600 transition-colors mb-4">
            <ChevronLeft className="inline-block" /> กลับ
          </button>

          {/* แสดงคำศัพท์ปัจจุบัน */}
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-md flex flex-col items-center">
            {/* ชื่อบทเรียน */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              {currentUnit.name}
            </h2>

            {/* แสดงภาพคำศัพท์ (ถ้ามี) */}
            {vocabList[currentIndex]?.img && (
              <WordImage word={vocabList[currentIndex].en} imgUrl={vocabList[currentIndex].img} />
            )}

            {/* กล่องแสดงตัวอักษรคำศัพท์ */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4">
              {currentInput.split('').map((char, idx) => (
                <LetterBox key={idx} letter={char} status={''} sizeClass="h-14" />
              ))}
            </div>

            {/* ปุ่มกดตัวอักษรบนคีย์บอร์ด */}
            <Keyboard
              onKeyPress={(key) => {
                if (gameStatus !== 'playing') return;
                if (key === 'CLEAR') {
                  setCurrentInput("");
                  return;
                } else if (key === 'DELETE') {
                  setCurrentInput(currentInput.slice(0, -1));
                  return;
                } else if (key === 'SHIFT') {
                  setIsShiftActive(!isShiftActive);
                  return;
                } else if (key === 'SPACE') {
                  // Handle space separately if needed
                  return;
                }

                // Add the pressed character to the current input
                setCurrentInput(prev => prev + (isShiftActive ? key.toUpperCase() : key));
                playKeySound();
              }}
              playKeySound={playKeySound}
              isShiftActive={isShiftActive}
            />

            {/* ปุ่มตรวจสอบคำตอบ */}
            <button onClick={() => {}} className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              ตรวจสอบคำตอบ
            </button>
          </div>
        </div>
      )}

      {/* หน้าแรก - แสดงรายชื่อบทเรียน */}
      {screen === 'home' && (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-md flex flex-col items-center">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              เลือกบทเรียน
            </h2>

            {/* แสดงรายชื่อบทเรียนที่โหลดจาก CSV */}
            <div className="w-full space-y-2">
              {units.map((unit, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl shadow-sm">
                  <div className="flex-1">
                    <div className="text-gray-700 font-semibold">{unit.name}</div>
                    <div className="text-xs text-gray-400">{(unit.items || []).length} คำศัพท์</div>
                  </div>
                  <button onClick={() => startGame(unit)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95">
                    เริ่มเล่น
                  </button>
                </div>
              ))}
            </div>

            {/* ปุ่มเพิ่มบทเรียนใหม่ */}
            <button onClick={() => setIsAdminOpen(true)} className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all active:scale-95">
              <Plus size={20} className="mr-2" /> บทเรียนใหม่
            </button>
          </div>
        </div>
      )}

      {/* สรุปผลการเรียนรู้ - แสดงเมื่อจบเกม */}
      {screen === 'summary' && (
        <SummaryScreen
          vocabList={vocabList}
          onRestart={() => {
            setScreen('game');
            setCurrentIndex(0);
            setCurrentInput("");
            setScore(0);
            setGameStatus('playing');
          }}
          onBackToMenu={goHome}
        />
      )}

      {/* โมดัลแสดงข้อผิดพลาด */}
      {errorModal.isOpen && (
        <ErrorModal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
          title={errorModal.title}
          message={errorModal.message}
        />
      )}

      {/* เบลอพื้นหลังเมื่อมีโมดัลเปิดอยู่ */}
      {(isAdminOpen || errorModal.isOpen) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"></div>
      )}
    </div>
  );
}
