import React, { useState, useEffect } from 'react';
import { Volume2, Lightbulb, Settings, Star, Trophy, Image as ImageIcon, Delete, Send, CheckCircle, XCircle, Cloud } from 'lucide-react';

// --- Mock Data (Default) ---
const DEFAULT_CSV = `EN,TH
swing,ชิงช้า
slide,สไลเดอร์
market,ตลาด
kitchen,ห้องครัว
bedroom,ห้องนอน
home,บ้าน
house,บ้าน
museum,พิพิธภัณฑ์
shop,ร้านค้า
bed,เตียง
tree,ต้นไม้
cat,แมว
dog,สุนัข`;

export default function App() {
  // ...existing code from your index.html React component...
// --- State ---
const [vocabList, setVocabList] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [currentInput, setCurrentInput] = useState("");
const [score, setScore] = useState(0);
const [gameStatus, setGameStatus] = useState('playing'); // playing, correct, wrong, complete
const [isAdminOpen, setIsAdminOpen] = useState(false);
const [csvInput, setCsvInput] = useState("");
const [showHint, setShowHint] = useState(false);
  const [view, setView] = useState('home'); // 'home' or 'game'
  const [units, setUnits] = useState([]);

// --- Initialization ---
useEffect(() => {
  // Try to load CSV from /vocab/vocal.csv and build units
  loadCsvAndUnits();
}, []);

const loadVocab = () => {
  // loadVocab keeps its behavior but if units exist, load current unit
  const savedCSV = localStorage.getItem('vocabCSV');
  const csvToParse = savedCSV || csvInput || DEFAULT_CSV;
  setCsvInput(csvToParse);
  const parsed = parseCsv(csvToParse);
  const shuffled = parsed.sort(() => Math.random() - 0.5);
  setVocabList(shuffled);
  setCurrentIndex(0);
  setScore(0);
  setCurrentInput("");
  setGameStatus('playing');
  setShowHint(false);
};

// Parse CSV text into array of {en, th, image} OR into units if 'Unit' sections present
const parseUnitsFromCsvText = (csvText) => {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // detect if file contains Unit sections
  const hasUnit = lines.some(l => /^Unit\s*\d+/i.test(l));
  if (!hasUnit) {
    // fallback: parse as a flat CSV (header optional)
    const startIndex = lines[0] && lines[0].toLowerCase().startsWith('en,') ? 1 : 0;
    const parsed = [];
    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        parsed.push({ en: parts[0].trim().toLowerCase(), th: parts[1].trim(), image: parts[2]?.trim() || '' });
      }
    }
    // return single unit containing all
    return [{ name: 'All', items: parsed }];
  }

  const units = [];
  let current = { name: 'Unit', items: [] };
  for (const line of csvText.split(/\r?\n/)) {
    const l = line.trim();
    if (!l) continue;
    const unitMatch = l.match(/^Unit\s*\d*/i);
    if (unitMatch) {
      // push previous if any
      if (current.items && current.items.length) units.push(current);
      current = { name: l, items: [] };
      continue;
    }
    if (l.toLowerCase().startsWith('en,')) continue; // header
    const parts = l.split(',');
    if (parts.length >= 2) {
      current.items.push({ en: parts[0].trim().toLowerCase(), th: parts[1].trim(), image: parts[2]?.trim() || '' });
    }
  }
  if (current.items && current.items.length) units.push(current);
  return units;
};

// Fetch CSV file and build units (10 units)
const loadCsvAndUnits = async () => {
  try {
    const res = await fetch('/vocab/vocal.csv');
    if (res.ok) {
      const text = await res.text();
      setCsvInput(text);
      const parsedUnits = parseUnitsFromCsvText(text);
      setUnits(parsedUnits);
    } else {
      // fallback to defaults
      const parsedUnits = parseUnitsFromCsvText(DEFAULT_CSV);
      setUnits(parsedUnits);
    }
  } catch (e) {
    const parsedUnits = parseUnitsFromCsvText(DEFAULT_CSV);
    setUnits(parsedUnits);
  }
};

const buildUnits = (list, count) => {
  const per = Math.ceil(list.length / count) || 1;
  const out = [];
  for (let i = 0; i < count; i++) {
    const start = i * per;
    const slice = list.slice(start, start + per);
    out.push(slice);
  }
  return out;
};

const saveSettings = () => {
  localStorage.setItem('vocabCSV', csvInput);
  loadVocab();
  setIsAdminOpen(false);
  speak("บันทึกข้อมูลเรียบร้อยแล้วครับ", 'th-TH');
};

const currentWord = vocabList[currentIndex];

// --- TTS Helpers ---
const speak = (text, lang = 'en-US') => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

const playSoundEffect = (type) => {
  if (type === 'correct') {
    speak("เก่งมาก ถูกต้องครับ", 'th-TH');
  } else if (type === 'wrong') {
    speak("ยังไม่ถูก ลองใหม่นะครับ", 'th-TH');
  }
};

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

  if (currentInput.length < (currentWord?.en.length || 0)) {
    setCurrentInput(prev => prev + key.toLowerCase());
    setGameStatus('playing');
  }
};

const checkAnswer = () => {
  if (!currentWord) return;

  if (currentInput.toLowerCase() === currentWord.en.toLowerCase()) {
    setGameStatus('correct');
    setScore(prev => prev + 10);
    playSoundEffect('correct');

    setTimeout(() => {
      nextCard();
    }, 2000);
  } else {
    setGameStatus('wrong');
    playSoundEffect('wrong');
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

// --- Helper Components ---
const WordImage = ({ wordObj }) => {
  // wordObj can be a string (word) or an object {en, th, image}
  const word = typeof wordObj === 'string' ? wordObj : (wordObj?.en || '');
  const imageUrl = typeof wordObj === 'object' ? (wordObj.image || '') : '';
  const [imgSrc, setImgSrc] = useState(imageUrl || `https://placehold.co/400x300/FFB347/ffffff?text=${word}`);

  useEffect(() => {
    setImgSrc(imageUrl || `https://placehold.co/400x300/FFB347/ffffff?text=${word}`);
  }, [word, imageUrl]);

  return (
    <div className="w-full h-48 bg-white rounded-2xl shadow-inner border-4 border-blue-100 overflow-hidden flex items-center justify-center mb-4 relative word-image">
      <div className="absolute z-0 opacity-20">
        <ImageIcon size={64} className="text-gray-300" />
      </div>
      <img src={imgSrc} alt={word} className="w-full h-full object-cover z-10 relative" onError={(e)=> {
        e.target.onerror = null;
        e.target.src=`https://placehold.co/400x300?text=${word}`
      }} />
    </div>
  );
};

const LetterBox = ({ letter, status }) => {
  let borderClass = "border-gray-300";
  let textClass = "text-gray-700";
  let bgClass = "bg-white";

  if (status === 'correct') {
    borderClass = "border-green-400";
    bgClass = "bg-green-100";
    textClass = "text-green-600";
  } else if (status === 'wrong') {
    borderClass = "border-red-400";
    bgClass = "bg-red-50";
    textClass = "text-red-500";
  }

  return (
    <div className={`letter-box w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 border-b-4 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-200 ${bgClass} ${borderClass} ${textClass} shadow-sm mx-1`}>
      {letter.toUpperCase()}
    </div>
  );
};

const Keyboard = ({ onKeyPress }) => {
  const rows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m']
  ];

  return (
    <div className="app-keyboard w-full bg-white rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-2 sm:p-4 fixed bottom-0 left-0 z-50 pb-6">
      {rows.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center mb-2 gap-1 sm:gap-2">
          {row.map((char) => (
            <button key={char} onClick={()=> onKeyPress(char)}
              className="w-8 h-10 sm:w-10 sm:h-12 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-800 rounded-lg font-bold text-lg shadow-[0_2px_0_rgb(147,197,253)] active:shadow-none active:translate-y-[2px] transition-all uppercase"
            >
              {char}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-2 mt-2">
        <button onClick={()=> onKeyPress('DELETE')}
          className="px-6 h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold shadow-[0_2px_0_rgb(252,165,165)] active:translate-y-[2px] active:shadow-none flex items-center justify-center"
        >
          <Delete size={20} className="mr-2" /> ลบ
        </button>
        <button onClick={()=> onKeyPress('ENTER')}
          className="px-8 h-12 bg-green-400 hover:bg-green-500 text-white rounded-xl font-bold shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-[4px] active:shadow-none text-lg flex items-center justify-center"
        >
          ส่งคำตอบ
          <Send size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// --- Render Logic ---
if (view === 'home') {
  // Home screen with unit selection
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center pb-40 relative overflow-hidden font-sans">
      <div className="w-full max-w-4xl p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">เลือกหน่วยการเรียน (Units)</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => loadCsvAndUnits()} className="px-3 py-2 bg-white rounded shadow">รีเฟรช</button>
          <button onClick={() => setIsAdminOpen(true)} className="px-3 py-2 bg-white rounded shadow">CSV</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl w-full px-6">
        {units.length === 0 && <div className="text-gray-500">กำลังโหลด...</div>}
        {units.map((u, idx) => (
          <div key={idx} className="unit-card bg-white rounded-2xl shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg" onClick={() => {
            // load this unit
            setVocabList(u.items || []);
            setCurrentIndex(0);
            setScore(0);
            setCurrentInput("");
            setGameStatus('playing');
            setView('game');
          }}>
            <div className="w-16 h-16 bg-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">{u.name}</div>
            <div className="text-sm text-gray-600">คำศัพท์: { (u.items || []).length }</div>
            <div className="text-xs text-gray-400 mt-2">คลิกเพื่อเริ่ม</div>
          </div>
        ))}
      </div>
    </div>
  );
}

if (!currentWord && gameStatus !== 'complete') {
  return <div className="min-h-screen flex items-center justify-center bg-blue-50 text-2xl text-blue-400 font-bold">กำลังโหลด...</div>;
}

return (
  <div className="app-root min-h-screen bg-blue-50 flex flex-col items-center pb-80 relative overflow-hidden font-sans">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&family=Sarabun:wght@400;700&display=swap');
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
      .pop-in { animation: popIn 0.3s ease-out forwards; }
      @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    `}</style>
    {/* Background Decorations */}
    <div className="absolute top-10 left-10 text-yellow-300 opacity-50 animate-bounce">
      <Cloud size={64} />
    </div>
    <div className="absolute top-20 right-10 text-blue-200 opacity-50">
      <Cloud size={96} />
    </div>
    {/* Header / Score */}
    <div className="app-header w-full max-w-md flex justify-between items-center p-4 z-10">
      <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
          <button onClick={() => setView('home')} className="text-sm text-gray-500 mr-2">ย้อนกลับ</button>
        <Star className="text-yellow-400 fill-current" size={24} />
        <span className="font-bold text-xl text-gray-700">{score}</span>
      </div>
      <button onClick={()=> setIsAdminOpen(true)} className="w-10 h-10 bg-white rounded-full shadow-md text-gray-400 hover:text-blue-500 flex items-center justify-center transition-colors">
        <Settings size={20} />
      </button>
    </div>
    {/* Completion Screen */}
    {gameStatus === 'complete' ? (
      <div className="flex flex-col items-center justify-center mt-20 p-8 text-center pop-in z-20">
        <Trophy className="text-yellow-400 mb-6 bounce" size={96} />
        <h1 className="text-4xl font-bold text-blue-600 thai-font mb-4">เก่งมาก!</h1>
        <p className="text-xl text-gray-600 thai-font mb-8">หนูทำคะแนนได้ {score} คะแนน</p>
        <button onClick={loadVocab} className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 thai-font">
          เล่นอีกครั้ง
        </button>
      </div>
    ) : (
      /* Game Screen */
      <div className={`game-container w-full max-w-md px-4 flex flex-col items-center z-10 transition-all ${gameStatus==='wrong' ? 'shake' : '' }`}>
        {/* Card */}
        <div className="card bg-white p-4 rounded-3xl shadow-xl w-full border-b-8 border-blue-200">
          <WordImage word={currentWord.en} />
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-400 text-sm thai-font">คำศัพท์ภาษาไทย:</p>
              <h2 className="text-3xl font-bold text-blue-600 thai-font">{currentWord.th}</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={()=> speak(currentWord.en)} className="w-12 h-12 bg-blue-100 rounded-full text-blue-500 hover:bg-blue-200 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                <Volume2 size={24} />
              </button>
              <button onClick={()=> setShowHint(true)} className="w-12 h-12 bg-yellow-100 rounded-full text-yellow-500 hover:bg-yellow-200 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                <Lightbulb size={24} />
              </button>
            </div>
          </div>
          {showHint && (
            <div className="text-center text-gray-400 text-sm mb-2 animate-pulse">
              Hint: {currentWord.en.split('').map((c, i) => i === 0 ? c : '_').join(' ')}
            </div>
          )}
        </div>
        {/* Letter Boxes */}
        <div className="letter-boxes mt-8 flex flex-wrap justify-center gap-y-2">
          {currentWord.en.split('').map((char, index) => (
            <LetterBox key={index} letter={currentInput[index] || "" } status={gameStatus==='correct' ? 'correct' : (gameStatus==='wrong' ? 'wrong' : 'default' )} />
          ))}
        </div>
        {/* Feedback Text */}
        <div className="h-12 mt-4 flex items-center justify-center">
          {gameStatus === 'wrong' && (
            <div className="text-red-500 font-bold text-lg thai-font flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <XCircle size={24} /> ผิดจ้า ลองใหม่นะ
            </div>
          )}
          {gameStatus === 'correct' && (
            <div className="text-green-500 font-bold text-lg thai-font flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <CheckCircle size={24} /> ถูกต้อง! เก่งมาก
            </div>
          )}
        </div>
      </div>
    )}
    {/* Keyboard - Only show when playing */}
    {gameStatus !== 'complete' && (
      <Keyboard onKeyPress={handleKeyPress} />
    )}
    {/* Admin Modal */}
    {isAdminOpen && (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4 thai-font text-gray-800 flex items-center">
            <Settings className="mr-2 text-blue-500" size={24} />
            เพิ่มบทเรียน (CSV)
          </h2>
          <p className="text-sm text-gray-500 mb-2 thai-font">
            ใส่ข้อมูลในรูปแบบ: คำศัพท์อังกฤษ,คำแปลไทย (บรรทัดละ 1 คำ)
          </p>
          <textarea className="w-full h-48 border-2 border-gray-200 rounded-xl p-4 font-mono text-sm focus:border-blue-500 outline-none" value={csvInput} onChange={(e)=> setCsvInput(e.target.value)} placeholder="apple,แอปเปิ้ล&#10;banana,กล้วย"></textarea>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={()=> setIsAdminOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg thai-font">
              ยกเลิก
            </button>
            <button onClick={saveSettings} className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold shadow-md hover:bg-blue-600 thai-font">
              บันทึกและเริ่มเกม
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
