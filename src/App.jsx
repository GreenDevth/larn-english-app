import React, { useState, useEffect } from 'react';
import { Volume2, Lightbulb, Settings, Star, Trophy, Image as ImageIcon, Delete, Send, CheckCircle, XCircle, Cloud, BookOpen, ChevronLeft, Play, Plus, Trash2, Save, Edit, GripVertical, ChevronDown, ChevronRight, SpellCheck } from 'lucide-react';

// --- Mock Data (Default) ---
const DEFAULT_CSV = `Unit 1
EN,TH,ImageURL
swing,ชิงช้า,https://img.freepik.com/free-vector/boy-playing-swing_1308-126.jpg?semt=ais_hybrid&w=740&q=80
slide,สไลเดอร์,https://t4.ftcdn.net/jpg/02/10/48/66/360_F_210486634_t1g103eXfOdb6C2401103.jpg
market,ตลาด,
kitchen,ห้องครัว,
bedroom,ห้องนอน,
home,บ้าน,
house,บ้าน,
museum,พิพิธภัณฑ์,
shop,ร้านค้า,
bed,เตียง,
Unit 2
EN,TH,ImageURL
tree,ต้นไม้,
cat,แมว,
dog,สุนัข,
bird,นก,
`;

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
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button onClick={onCancel} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 flex items-center">
            <Save size={20} className="mr-2" /> Save Changes
          </button>
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

const LetterBox = ({ letter, status }) => {
  let borderClass = "border-b-gray-300 bg-white text-gray-700";

  if (status === 'correct') {
    borderClass = "border-b-green-500 bg-green-100 text-green-600 border-green-500";
  } else if (status === 'wrong') {
    borderClass = "border-b-red-500 bg-red-50 text-red-500 border-red-500";
  }

  return (
    <div className={`w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 border-2 border-b-4 rounded-xl flex items-center justify-center text-2xl sm:text-4xl font-bold transition-all duration-200 ${borderClass} shadow-sm mx-1`}>
      {letter.toUpperCase()}
    </div>
  );
};

const Keyboard = ({ onKeyPress }) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <div className="w-full max-w-2xl bg-white/95 backdrop-blur rounded-t-3xl shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] p-4 sm:p-6 fixed bottom-0 left-0 right-0 mx-auto z-50 pb-6 animate-slide-up border-t border-gray-100">
      {rows.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center mb-2 gap-1.5 sm:gap-2">
          {row.map((char) => (
            <button key={char} onClick={() => onKeyPress(char)}
              className="w-8 h-12 xs:w-10 xs:h-12 sm:w-11 sm:h-14 md:w-12 md:h-16 lg:w-14 lg:h-18 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 rounded-2xl font-bold text-lg sm:text-xl md:text-2xl shadow-[0_4px_0_rgb(219,234,254)] active:shadow-none active:translate-y-[4px] transition-all uppercase border-2 border-blue-100 relative top-0 active:top-[4px]"
            >
              {char}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={() => onKeyPress('DELETE')}
          className="px-6 h-12 sm:h-14 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-bold shadow-[0_4px_0_rgb(254,202,202)] active:translate-y-[4px] active:shadow-none flex items-center justify-center border border-red-100 text-lg sm:text-xl active:top-[4px] relative"
        >
          <Delete size={24} className="mr-2" /> ลบ
        </button>
        <button onClick={() => onKeyPress('ENTER')}
          className="px-10 h-12 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-[4px] active:shadow-none text-lg sm:text-xl flex items-center justify-center transition-all hover:scale-105 active:scale-100 active:top-[4px] relative"
        >
          ส่งคำตอบ
          <Send size={24} className="ml-2" />
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

  const loadVocab = () => {
    const savedCSV = localStorage.getItem('vocabCSV') || DEFAULT_CSV;
    setCsvInput(savedCSV);
    const parsedUnits = parseCSV(savedCSV);
    setUnits(parsedUnits);
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
      // Simple synth sounds
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'correct') {
        // Success Chime: C5 -> E5 -> G5 (fast arpeggio)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'wrong') {
        // Error Buzz: Sawtooth, low pitch dropping
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

  const playSoundEffect = (type) => {
    playGameSound(type); // Play SFX
    if (type === 'correct') {
      speak("เก่งมาก ถูกต้องค่ะ", 'th-TH');
    } else if (type === 'wrong') {
      speak("ยังไม่ถูก ลองใหม่นะคะ", 'th-TH');
    }
  };

  // --- Helpers / Actions ---
  const startGame = (unit) => {
    setCurrentUnit(unit);
    setVocabList(unit?.items || []);
    setCurrentIndex(0);
    setScore(0);
    setCurrentInput("");
    setGameStatus('playing');
    setScreen('game');
    // announce unit then the first word
    try { setTimeout(() => { speak(`เริ่ม ${unit?.name || 'บทเรียน'}`, 'th-TH', { interrupt: true }); }, 200); } catch (e) { }
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
    speak("บันทึกข้อมูลเรียบร้อยแล้วค่ะ", 'th-TH');
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

  const speak = (text, lang, opts = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      const u = new SpeechSynthesisUtterance(String(text || ''));
      if (lang) u.lang = lang;
      u.rate = opts.rate || 0.95;
      u.pitch = opts.pitch || 1;
      u.volume = typeof opts.volume === 'number' ? opts.volume : 1;

      const prefName = (voicePrefs && voicePrefs[lang]) || null;
      let voiceToUse = null;
      if (prefName) voiceToUse = voices.find(v => v.name === prefName) || null;
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

  // Auto-read the current word when in game view
  useEffect(() => {
    if (screen === 'game' && vocabList && vocabList.length > 0) {
      const w = vocabList[currentIndex];
      // Small delay to allow transition/voices to load
      const tid = setTimeout(() => {
        if (w && w.en) speak(w.en, 'en-US', { interrupt: false });
      }, 500);
      return () => clearTimeout(tid);
    }
  }, [currentIndex, screen, vocabList, voices]); // Removed voicePrefs to prevent re-triggering during pref change

  // --- Game Logic ---
  const handleKeyPress = (key) => {
    if (gameStatus !== 'playing' && gameStatus !== 'wrong') return;

    if (key === 'DELETE') {
      setCurrentInput(prev => prev.slice(0, -1));
      setGameStatus('playing');
      return;
    }

    if (key === 'ENTER') {
      checkAnswer();
      return;
    }

    // Play letter sound REMOVED (User request)
    // speak(key, 'en-US', { rate: 1.2, interrupt: true });

    const currentWord = vocabList[currentIndex];
    const maxLen = currentWord?.en.length || 0;

    if (currentInput.length < maxLen) {
      const newInput = currentInput + key.toLowerCase();
      setCurrentInput(newInput);
      setGameStatus('playing');

      // Auto-check if full length reached
      if (newInput.length === maxLen) {
        checkAnswer(newInput);
      }
    }
  };

  const checkAnswer = (paramInput) => {
    const inputToCheck = typeof paramInput === 'string' ? paramInput : currentInput;
    const currentWord = vocabList[currentIndex];
    if (!currentWord) return;

    if (inputToCheck.toLowerCase() === currentWord.en.toLowerCase()) {
      setGameStatus('correct');
      setScore(prev => prev + 10);
      playSoundEffect('correct');
      setParticleType('correct');
      setTimeout(() => setParticleType(null), 3500); // Extended for fireworks

      setTimeout(() => {
        nextCard();
      }, 4000); // 4s delay for full effect
    } else {
      setGameStatus('wrong');
      playSoundEffect('wrong');
      setParticleType('wrong');
      setTimeout(() => setParticleType(null), 1000);
    }
  };

  const nextCard = () => {
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentInput("");
      setGameStatus('playing');
      setShowHint(false);
    } else {
      setGameStatus('complete');
      speak("ยินดีด้วย หนูเล่นจบเกมแล้ว เก่งมาก ๆ เลย", 'th-TH');
    }
  };



  // --- Screens ---

  // 1. Home Screen
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center p-6 relative overflow-hidden font-sans">
        {/* Background Elements */}
        <div className="absolute top-10 left-10 text-white opacity-60 animate-bounce delay-700">
          <Cloud size={80} fill="currentColor" />
        </div>
        <div className="absolute top-20 right-20 text-white opacity-40 animate-pulse">
          <Cloud size={120} fill="currentColor" />
        </div>

        <div className="w-full max-w-4xl z-10 flex flex-col items-center">
          {/* Header */}
          <div className="mt-10 mb-12 text-center relative group cursor-default">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 tracking-tight drop-shadow-sm transform group-hover:scale-105 transition-transform duration-300">
              Larn English
            </h1>
            <div className="absolute -top-6 -right-6 text-yellow-400 animate-spin-slow">
              <Star size={48} fill="currentColor" />
            </div>
            <p className="text-xl text-blue-600 mt-4 font-bold thai-font bg-white/50 py-2 px-6 rounded-full inline-block backdrop-blur-sm">
              มาเรียนภาษาอังกฤษกันเถอะ!
            </p>
            <button onClick={() => setIsAdminOpen(true)} className="absolute top-1/2 -right-16 md:-right-24 text-gray-400 hover:text-blue-500 transition-colors p-2">
              <Settings size={24} />
            </button>
          </div>

          {/* Units Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
            {units.map((unit, index) => (
              <button
                key={index}
                onClick={() => startGame(unit)}
                className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-b-8 border-blue-100 active:border-b-0 active:translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={100} className="text-blue-500" />
                </div>
                <div className="flex flex-col items-start relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                    <span className="text-2xl font-black">{index + 1}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{unit.name}</h3>
                  <p className="text-gray-500 thai-font">{(unit.items || unit.words || []).length} คำศัพท์</p>

                  <div className="mt-6 w-full flex justify-end">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Modal */}
        {isAdminOpen && (
          <AdminPanel
            units={units}
            onSave={saveSettings}
            onCancel={() => setIsAdminOpen(false)}
            voices={voices}
            voicePrefs={voicePrefs}
            setVoicePrefs={setVoicePrefs}
            saveVoicePrefs={saveVoicePrefs}
          />
        )}
      </div>
    );
  }

  // 2. Game Screen
  const currentWord = vocabList[currentIndex];

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center pb-80 relative overflow-hidden font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Sarabun:wght@400;700&display=swap');
        body { font-family: 'Fredoka', 'Sarabun', sans-serif; }
        .thai-font { font-family: 'Sarabun', sans-serif; }
        .shake { animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both; }
        @keyframes shake {
          10%,90% { transform: translate3d(-1px, 0, 0); }
          20%,80% { transform: translate3d(2px, 0, 0); }
          30%,50%,70% { transform: translate3d(-4px, 0, 0); }
          40%,60% { transform: translate3d(4px, 0, 0); }
        }
        .bounce { animation: bounce 0.5s infinite alternate; }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes firework {
          0% { transform: translate(0, 0) scale(0) rotate(var(--rot)); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(var(--tx), calc(var(--ty) + 20vh)) scale(1) rotate(calc(var(--rot) + 720deg)); opacity: 0; }
        }
        .animate-firework { animation: firework 1.2s ease-out forwards; }
        @keyframes launch {
          0% { top: 105%; opacity: 1; transform: scaleY(2); }
          50% { opacity: 1; }
          100% { top: var(--target-y); opacity: 0; transform: scaleY(0.5); }
        }
        .animate-launch { animation: launch 0.6s ease-out forwards; }
        @keyframes rain {
          0% { transform: translateY(0); opacity: 0.7; }
          100% { transform: translateY(200px); opacity: 0; }
        }
        .animate-rain { animation: rain 0.8s ease-in forwards; }
      `}</style>

      <ParticleSystem type={particleType} />

      {/* Navbar */}
      <div className="w-full bg-white shadow-sm p-4 flex justify-between items-center z-20 px-4 md:px-8 sticky top-0">
        <button onClick={goHome} className="flex items-center text-gray-500 hover:text-blue-600 font-bold transition-colors">
          <ChevronLeft size={24} className="mr-1" />
          <span className="hidden sm:inline">เลือกบทเรียน</span>
        </button>
        <h2 className="text-xl font-bold text-gray-800">{currentUnit?.name}</h2>
        <div className="bg-yellow-100 px-4 py-2 rounded-full flex items-center gap-2 border border-yellow-200">
          <Star className="text-yellow-500 fill-current" size={20} />
          <span className="font-bold text-yellow-700">{score}</span>
        </div>
      </div>

      <div className="w-full max-w-2xl px-4 flex-1 flex flex-col items-center justify-start relative z-10 py-4 h-[calc(100vh-80px)] overflow-hidden">

        {/* Unified Card - Flexible Height */}
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden mb-4 shrink-1 flex flex-col animate-fade-in max-h-[60vh]">
          {/* Image Section (Top) */}
          <WordImage word={currentWord?.en} imgUrl={currentWord?.img} />

          {/* Info Section (Bottom) */}
          <div className="p-3 flex items-center justify-between border-t border-gray-100 shrink-0">
            <div>
              <p className="text-gray-400 text-[10px] font-bold mb-0.5">คำศัพท์ภาษาไทย:</p>
              <h3 className="text-3xl font-bold text-gray-800 thai-font">{currentWord?.th}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => speak(currentWord?.en)}
                className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors"
                title="ฟังเสียง"
              >
                <Volume2 size={24} />
              </button>
              <button
                onClick={() => {
                  // Spell it out
                  const spelling = (currentWord?.en || '').split('').join('. ');
                  speak(spelling, 'en-US', { rate: 0.8 });
                }}
                className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center hover:bg-purple-100 transition-colors"
                title="สะกดคำ"
              >
                <SpellCheck size={24} />
              </button>
              <button
                onClick={() => setShowHint(true)}
                className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center hover:bg-yellow-100 transition-colors"
                title="คำใบ้"
              >
                <Lightbulb size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Word Display */}
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {(currentWord?.en || '').split('').map((char, index) => {
            let status = 'neutral';
            if (index < currentInput.length) {
              // Only reveal status if game is NOT playing (meaning we checked logic)
              if (gameStatus === 'correct' || gameStatus === 'wrong') {
                status = currentInput[index].toLowerCase() === char.toLowerCase() ? 'correct' : 'wrong';
              }
            }
            return (
              <LetterBox key={index} letter={index < currentInput.length ? currentInput[index] : ''} status={status} />
            );
          })}
        </div>

        {/* Hint */}
        {showHint && (
          <div className="mb-4 text-blue-400 font-bold animate-fade-in">
            Hint: {currentWord?.en}
          </div>
        )}

        {/* Feedback Messages */}
        {gameStatus === 'correct' && (
          <div className="text-green-500 font-bold text-xl thai-font flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-green-100 animate-fade-in">
            <CheckCircle size={28} /> ถูกต้อง! เก่งมาก
          </div>
        )}
        {gameStatus === 'wrong' && (
          <div className="text-red-500 font-bold text-xl thai-font flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-red-100 animate-fade-in">
            <XCircle size={28} /> ผิดจ้า ลองใหม่นะ
          </div>
        )}
      </div>

      <Keyboard onKeyPress={handleKeyPress} />
    </div>
  );
}
