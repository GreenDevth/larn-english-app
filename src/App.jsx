import React, { useState, useEffect } from 'react';
import { Volume2, Lightbulb, Settings, Star, Trophy, Image as ImageIcon, Delete, Send, CheckCircle, XCircle, Cloud, BookOpen, ChevronLeft, Play } from 'lucide-react';

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
  const playSoundEffect = (type) => {
    if (type === 'correct') {
      speak("เก่งมาก ถูกต้องครับ", 'th-TH');
    } else if (type === 'wrong') {
      speak("ยังไม่ถูก ลองใหม่นะครับ", 'th-TH');
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
  };

  const goHome = () => {
    setScreen('home');
    setCurrentUnit(null);
    setVocabList([]);
  };

  const saveSettings = () => {
    // Save CSV to localStorage and re-parse units
    localStorage.setItem('vocabCSV', csvInput);
    const parsed = parseCSV(csvInput);
    setUnits(parsed);
    setIsAdminOpen(false);
  };

  const speak = (text, lang) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      if (lang) u.lang = lang;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      // ignore if not available
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

    const currentWord = vocabList[currentIndex];
    if (currentInput.length < (currentWord?.en.length || 0)) {
      setCurrentInput(prev => prev + key.toLowerCase());
      setGameStatus('playing');
    }
  };

  const checkAnswer = () => {
    const currentWord = vocabList[currentIndex];
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

  // --- Components ---
  const WordImage = ({ word, imgUrl }) => {
    const [imgSrc, setImgSrc] = useState(imgUrl || `https://placehold.co/400x300/FFB347/ffffff?text=${word}`);

    useEffect(() => {
      if (imgUrl) setImgSrc(imgUrl);
      else setImgSrc(`https://placehold.co/400x300/FFB347/ffffff?text=${word}`);
    }, [word, imgUrl]);

    return (
      <div className="w-full h-48 bg-blue-50 rounded-2xl shadow-inner border-4 border-white overflow-hidden flex items-center justify-center mb-4 relative group">
        <div className="absolute z-0 opacity-20 group-hover:scale-110 transition-transform duration-700">
          <ImageIcon size={64} className="text-gray-300" />
        </div>
        <img src={imgSrc} alt={word} className="w-full h-full object-cover z-10 relative" onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/400x300?text=${word}`
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
      <div className="w-full max-w-2xl bg-white rounded-t-[2rem] shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] p-4 sm:p-6 fixed bottom-0 left-0 right-0 mx-auto z-50 pb-8 animate-slide-up">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center mb-3 gap-1 sm:gap-2">
            {row.map((char) => (
              <button key={char} onClick={() => onKeyPress(char)}
                className="w-8 h-12 sm:w-12 sm:h-14 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 rounded-lg font-bold text-xl shadow-[0_3px_0_rgb(219,234,254)] active:shadow-none active:translate-y-[3px] transition-all uppercase border border-blue-100"
              >
                {char}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={() => onKeyPress('DELETE')}
            className="px-6 h-12 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-bold shadow-[0_3px_0_rgb(254,202,202)] active:translate-y-[3px] active:shadow-none flex items-center justify-center border border-red-100"
          >
            <Delete size={20} className="mr-2" /> ลบ
          </button>
          <button onClick={() => onKeyPress('ENTER')}
            className="px-10 h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-[4px] active:shadow-none text-xl flex items-center justify-center transition-all hover:scale-105"
          >
            ส่งคำตอบ
            <Send size={20} className="ml-2" />
          </button>
        </div>
      </div>
    );
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
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Settings className="mr-3 text-blue-500" size={32} />
                  ตั้งค่าคำศัพท์ (CSV)
                </h2>
                <button onClick={() => setIsAdminOpen(false)} className="text-gray-400 hover:text-red-500">
                  <XCircle size={32} />
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl mb-4 text-sm text-blue-800 font-medium">
                <p>Format: <code>Unit Name</code> (ขึ้นบรรทัดใหม่) ตามด้วย <code>EN,TH,ImageURL</code></p>
              </div>

              <textarea
                className="w-full h-64 border-2 border-gray-200 rounded-xl p-4 font-mono text-sm focus:border-blue-500 outline-none resize-none shadow-inner"
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="Unit 1&#10;EN,TH,ImageURL..."
              ></textarea>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={saveSettings} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95">
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </div>
          </div>
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
      `}</style>

      {/* Navbar */}
      <div className="w-full bg-white shadow-sm p-4 flex justify-between items-center z-10 px-4 md:px-8">
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

      {/* Game Area */}
      {gameStatus === 'complete' ? (
        <div className="flex flex-col items-center justify-center mt-20 p-8 text-center animate-fade-in z-20">
          <div className="relative">
            <Trophy className="text-yellow-400 mb-6 bounce drop-shadow-lg" size={120} />
            <div className="absolute top-0 left-0 w-full h-full animate-ping opacity-20 bg-yellow-200 rounded-full"></div>
          </div>
          <h1 className="text-5xl font-black text-blue-600 thai-font mb-4 drop-shadow-sm">สุดยอดไปเลย!</h1>
          <p className="text-2xl text-gray-600 thai-font mb-10">หนูทำคะแนนได้ {score} คะแนนแหนะ</p>
          <div className="flex gap-4">
            <button onClick={goHome} className="bg-white text-gray-600 border-2 border-gray-200 px-8 py-4 rounded-2xl text-xl font-bold hover:bg-gray-50 transition-transform hover:scale-105 thai-font">
              เลือกบทอื่น
            </button>
            <button onClick={() => startGame(currentUnit)} className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 thai-font active:bg-blue-700">
              เล่นอีกครั้ง
            </button>
          </div>
        </div>
      ) : (
        <div className={`game-container w-full max-w-xl px-4 flex flex-col items-center z-10 mt-8 transition-all ${gameStatus === 'wrong' ? 'shake' : ''}`}>
          {/* Card */}
          <div className="card bg-white p-6 rounded-[2rem] shadow-2xl w-full border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>

            <WordImage word={currentWord.en} imgUrl={currentWord.img} />

            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-gray-400 text-sm thai-font font-medium mb-1">คำศัพท์ภาษาไทย:</p>
                <h2 className="text-4xl font-black text-gray-800 thai-font tracking-wide">{currentWord.th}</h2>
              </div>
              <div className="flex gap-3">
                <button onClick={() => speak(currentWord.en)} className="w-14 h-14 bg-blue-50 rounded-2xl text-blue-500 hover:bg-blue-100 flex items-center justify-center shadow-sm active:scale-95 transition-all border border-blue-100">
                  <Volume2 size={28} />
                </button>
                <button onClick={() => setShowHint(true)} className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all border ${showHint ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border-gray-200'}`}>
                  <Lightbulb size={28} />
                </button>
              </div>
            </div>

            {showHint && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-center animate-fade-in">
                <p className="text-yellow-700 text-sm font-bold uppercase tracking-[0.5em]">
                  {currentWord.en.split('').map((c, i) => i === 0 ? c : '_').join('')}
                </p>
              </div>
            )}
          </div>

          {/* Letter Boxes */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 mb-4">
            {currentWord.en.split('').map((char, index) => (
              <LetterBox key={index} letter={currentInput[index] || ""} status={gameStatus === 'correct' ? 'correct' : (gameStatus === 'wrong' ? 'wrong' : 'default')} />
            ))}
          </div>

          {/* Feedback & Keyboard Space */}
          <div className="h-16 flex items-center justify-center">
            {gameStatus === 'wrong' && (
              <div className="text-red-500 font-bold text-xl thai-font flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-red-100 animate-bounce">
                <XCircle size={28} /> ผิดจ้า ลองใหม่นะ
              </div>
            )}
            {gameStatus === 'correct' && (
              <div className="text-green-500 font-bold text-xl thai-font flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-green-100 animate-bounce">
                <CheckCircle size={28} /> ถูกต้อง! เก่งมาก
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard */}
      {gameStatus !== 'complete' && (
        <Keyboard onKeyPress={handleKeyPress} />
      )}
    </div>
  );
}
