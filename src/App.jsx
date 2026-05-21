import React, { useState, useEffect } from 'react';
import { Volume2, Lightbulb, Settings, Star, Trophy, Image as ImageIcon, Delete, Send, CheckCircle, XCircle, Cloud, BookOpen, ChevronLeft, Play, Plus, Trash2, Save, Edit, GripVertical, ChevronDown, ChevronRight, SpellCheck, Menu, X, RefreshCw, List, FolderOpen, Lock, Unlock, Sparkles, Upload } from 'lucide-react';
import SummaryScreen from './components/SummaryScreen';
import { fetchVocabFromSheet, updateSheetData, fetchSheetsList, translateText } from './utils/googleSheet';


// Global utterance to prevent Chrome from garbage collecting it
let globalUtterance = null;

// --- Cute Alert & Confirm Modal Component ---
const CuteAlertModal = ({ isOpen, onClose, title, message, type = 'info', isConfirm = false, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  let bgColor = 'bg-blue-50 border-blue-200';
  let iconBgColor = 'bg-blue-100 text-blue-500';
  let btnColor = 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-300';
  let emoji = '🐱';
  let borderTopColor = 'from-blue-400 via-cyan-400 to-teal-400';

  if (type === 'success') {
    bgColor = 'bg-green-50 border-green-200';
    iconBgColor = 'bg-green-100 text-green-600';
    btnColor = 'bg-green-500 hover:bg-green-600 active:bg-green-700 focus:ring-green-300';
    emoji = '🎉';
    borderTopColor = 'from-green-400 via-emerald-400 to-teal-400';
  } else if (type === 'error') {
    bgColor = 'bg-red-50 border-red-200';
    iconBgColor = 'bg-red-100 text-red-500';
    btnColor = 'bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-300';
    emoji = '❌';
    borderTopColor = 'from-red-400 via-pink-400 to-orange-400';
  } else if (type === 'warning') {
    bgColor = 'bg-amber-50 border-amber-200';
    iconBgColor = 'bg-amber-100 text-amber-600';
    btnColor = 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-300';
    emoji = '🐻';
    borderTopColor = 'from-yellow-400 via-amber-400 to-orange-400';
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-scale-up border border-gray-100 flex flex-col relative overflow-hidden font-sans">
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${borderTopColor}`} />

        <div className="text-center mt-4 mb-6">
          <div className={`w-20 h-20 rounded-full ${iconBgColor} flex items-center justify-center mx-auto text-5xl shadow-md mb-4 animate-bounce`}>
            {emoji}
          </div>
          
          <h3 className="text-2xl font-black text-gray-800 thai-font mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 font-medium thai-font leading-relaxed whitespace-pre-line px-2">
            {message}
          </p>
        </div>

        <div className="flex gap-3 w-full mt-2">
          {isConfirm ? (
            <>
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold shadow-sm hover:shadow transition-all active:scale-95 text-base border border-gray-200/50 thai-font"
              >
                ยกเลิก 🌸
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3.5 ${btnColor} text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-base thai-font`}
              >
                ตกลงค่ะ ⭐
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`w-full py-3.5 ${btnColor} text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-base thai-font`}
            >
              โอเคเลย! 🐻⭐
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- PinAuthModal Component ---
const PinAuthModal = ({ isOpen, onClose, onSuccess, correctPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleKeyPress = (num) => {
    setError('');
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          // Play correct sound
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.1);
            osc.frequency.setValueAtTime(783.99, now + 0.2);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
          } catch(e){}
          
          setTimeout(() => {
            onSuccess();
            setPin('');
          }, 300);
        } else {
          // Play wrong sound
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.25);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
          } catch(e){}
          
          setError('รหัส PIN ไม่ถูกต้องค่ะ คุณพ่อคุณแม่ลองใหม่อีกครั้งนะคะ 🥺');
          setTimeout(() => setPin(''), 1000);
        }
      }
    }
  };

  const handleBackspace = () => {
    setError('');
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up border border-gray-100 flex flex-col items-center relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-50"
        >
          <X size={24} />
        </button>

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mt-4 mb-4 animate-bounce">
          <Lock size={30} />
        </div>

        <h3 className="text-2xl font-black text-gray-800 tracking-tight">Parent PIN Lock</h3>
        <p className="text-gray-500 text-xs thai-font text-center mt-2 px-4 leading-relaxed">
          เฉพาะผู้ปกครองเท่านั้นที่สามารถเข้าหน้าจัดบทเรียนได้ค่ะ<br />
          กรุณาป้อนรหัส PIN 4 หลักเพื่อความปลอดภัย 🔒
        </p>

        {/* PIN Dots */}
        <div className="flex gap-4 justify-center my-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 border-indigo-200 transition-all duration-150 ${
                index < pin.length ? 'bg-indigo-600 scale-125 shadow-md shadow-indigo-200 border-indigo-600' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        <div className="h-6 mb-2 flex items-center justify-center">
          {error && (
            <p className="text-red-500 text-xs font-bold text-center thai-font animate-pulse">
              {error}
            </p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-14 h-14 bg-indigo-50/70 hover:bg-indigo-100/80 active:bg-indigo-200 text-indigo-600 rounded-2xl font-bold text-xl shadow-[0_3px_0_rgb(224,231,255)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center border border-indigo-100 relative top-0 active:top-[2px] mx-auto active:scale-95"
            >
              {num}
            </button>
          ))}
          
          {/* Backspace */}
          <button
            onClick={handleBackspace}
            className="w-14 h-14 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 rounded-2xl font-bold text-sm shadow-[0_3px_0_rgb(254,202,202)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center border border-red-100 relative top-0 active:top-[2px] mx-auto active:scale-95 thai-font"
          >
            ลบ
          </button>
          
          {/* 0 */}
          <button
            key="0"
            onClick={() => handleKeyPress('0')}
            className="w-14 h-14 bg-indigo-50/70 hover:bg-indigo-100/80 active:bg-indigo-200 text-indigo-600 rounded-2xl font-bold text-xl shadow-[0_3px_0_rgb(224,231,255)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center border border-indigo-100 relative top-0 active:top-[2px] mx-auto active:scale-95"
          >
            0
          </button>
          
          {/* Clear */}
          <button
            onClick={() => { setError(''); setPin(''); }}
            className="w-14 h-14 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-500 rounded-2xl font-bold text-sm shadow-[0_3px_0_rgb(229,231,235)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center border border-gray-200 relative top-0 active:top-[2px] mx-auto active:scale-95 thai-font"
          >
            ล้าง
          </button>
        </div>
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

const AdminPanel = ({ units: initialUnits, onSave, onCancel, voices, voicePrefs, setVoicePrefs, saveVoicePrefs, parentPin, setParentPin, exportBackupJSON, importBackupJSON, showCuteAlert, showCuteConfirm }) => {
  const [localUnits, setLocalUnits] = useState(JSON.parse(JSON.stringify(initialUnits || [])));
  const [expandedUnits, setExpandedUnits] = useState({});

  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem('larnvocab_sheet_url') || '');
  const [selectedSheet, setSelectedSheet] = useState(localStorage.getItem('larnvocab_selected_sheet') || 'VocabData');
  const [sheetList, setSheetList] = useState([]);
  const [isFetchingSheets, setIsFetchingSheets] = useState(false);
  const [customSheetName, setCustomSheetName] = useState('');
  const [isCustomSheet, setIsCustomSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [translatingWords, setTranslatingWords] = useState({});
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const handleTranslateSingle = async (unitIdx, wordIdx) => {
    const word = localUnits[unitIdx].items[wordIdx];
    const enText = (word.en || '').trim();
    if (!enText) {
      await showCuteAlert('กรุณากรอกคำศัพท์ภาษาอังกฤษก่อนทำการแปลนะคะ', 'warning');
      return;
    }
    if (!sheetUrl) {
      await showCuteAlert('กรุณาระบุ Google Apps Script Web App URL เพื่อใช้งานระบบแปลภาษาค่ะ', 'warning');
      return;
    }

    const key = `${unitIdx}-${wordIdx}`;
    setTranslatingWords(prev => ({ ...prev, [key]: true }));

    try {
      const translated = await translateText(sheetUrl, enText);
      if (translated) {
        updateWord(unitIdx, wordIdx, 'th', translated);
      } else {
        await showCuteAlert('แปลภาษาไม่สำเร็จ หรือไม่มีข้อมูลส่งกลับมาค่ะ', 'error');
      }
    } catch (err) {
      await showCuteAlert(`เกิดข้อผิดพลาดในการแปล: ${err.message}`, 'error');
    } finally {
      setTranslatingWords(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleTranslateAllEmpty = async () => {
    if (!sheetUrl) {
      await showCuteAlert('กรุณาระบุ Google Apps Script Web App URL เพื่อใช้งานระบบแปลภาษาค่ะ', 'warning');
      return;
    }

    const emptyWords = [];
    localUnits.forEach((unit, unitIdx) => {
      (unit.items || []).forEach((word, wordIdx) => {
        if ((word.en || '').trim() && !(word.th || '').trim()) {
          emptyWords.push({ unitIdx, wordIdx, en: word.en.trim() });
        }
      });
    });

    if (emptyWords.length === 0) {
      await showCuteAlert('ไม่พบคำศัพท์ภาษาอังกฤษที่มีช่องแปลภาษาไทยว่างอยู่ค่ะ', 'info');
      return;
    }

    const confirmed = await showCuteConfirm(`ต้องการแปลภาษาไทยอัตโนมัติให้กับคำศัพท์ที่ว่างอยู่จำนวน ${emptyWords.length} คำ หรือไม่คะ?`);
    if (!confirmed) {
      return;
    }

    setIsTranslatingAll(true);
    let successCount = 0;
    
    for (const item of emptyWords) {
      const key = `${item.unitIdx}-${item.wordIdx}`;
      setTranslatingWords(prev => ({ ...prev, [key]: true }));
      try {
        const translated = await translateText(sheetUrl, item.en);
        if (translated) {
          updateWord(item.unitIdx, item.wordIdx, 'th', translated);
          successCount++;
        }
      } catch (err) {
        console.error(`Error translating ${item.en}:`, err);
      } finally {
        setTranslatingWords(prev => ({ ...prev, [key]: false }));
      }
    }

    setIsTranslatingAll(false);
    await showCuteAlert(`แปลภาษาสำเร็จแล้วทั้งหมด ${successCount} คำ จาก ${emptyWords.length} คำค่ะ!`, 'success');
  };

  const handleChangePin = async () => {
    if (newPinInput.length !== 4) {
      await showCuteAlert('รหัสผ่าน PIN ต้องเป็นตัวเลข 4 หลักพอดีนะคะ', 'warning');
      return;
    }
    setParentPin(newPinInput);
    localStorage.setItem('larnvocab_parent_pin', newPinInput);
    await showCuteAlert('เปลี่ยนรหัสผ่านผู้ปกครองสำเร็จเรียบร้อยแล้วค่ะ!', 'success');
    setNewPinInput('');
  };

  useEffect(() => {
    if (sheetUrl) {
      handleFetchSheetsList(false);
    }
  }, []);

  const handleFetchSheetsList = async (showSuccessAlert = true) => {
    if (!sheetUrl) return;
    setIsFetchingSheets(true);
    try {
      const list = await fetchSheetsList(sheetUrl);
      if (Array.isArray(list)) {
        const validList = list.filter(item => typeof item === 'string');
        setSheetList(validList);
        if (validList.length > 0) {
          const savedSheet = localStorage.getItem('larnvocab_selected_sheet') || 'VocabData';
          if (validList.includes(savedSheet)) {
            setSelectedSheet(savedSheet);
          } else {
            setSelectedSheet(validList[0]);
          }
        }
      } else {
        setSheetList([]);
      }
      if (showSuccessAlert) {
        await showCuteAlert(`โหลดรายชื่อแผ่นงานสำเร็จ! พบทั้งหมด ${list.length} รายการค่ะ`, 'success');
      }
    } catch (error) {
      if (showSuccessAlert) {
        await showCuteAlert(`ไม่สามารถเข้าถึงแผ่นงานได้: ${error.message}`, 'error');
      }
      console.error(error);
    } finally {
      setIsFetchingSheets(false);
    }
  };

  const handleSync = async () => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    setSyncMessage('');
    const targetSheet = isCustomSheet ? customSheetName.trim() : selectedSheet;
    if (!targetSheet) {
      await showCuteAlert('กรุณาเลือกหรือป้อนชื่อแผ่นงานก่อนทำการ Sync นะคะ', 'warning');
      setIsSyncing(false);
      return;
    }
    try {
      const data = await fetchVocabFromSheet(sheetUrl, targetSheet);
      
      const parsedUnits = transformSheetDataToUnits(data);
      setLocalUnits(parsedUnits);
      
      localStorage.setItem('larnvocab_sheet_url', sheetUrl);
      localStorage.setItem('larnvocab_selected_sheet', targetSheet);
      const time = new Date().toLocaleString();
      localStorage.setItem('larnvocab_last_sync', time);
      
      setSyncMessage(`✅ Sync สำเร็จ! โหลดคำศัพท์จาก "${targetSheet}" มาทั้งหมด ${data.length} คำเรียบร้อยแล้วค่ะ`);
      await showCuteAlert(`Sync สำเร็จ! โหลดคำศัพท์จากแผ่นงาน "${targetSheet}" มาทั้งหมด ${data.length} คำเรียบร้อยแล้วค่ะ`, 'success');
      
      await handleFetchSheetsList(false);
    } catch (error) {
      await showCuteAlert(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
      setSyncMessage(`❌ เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpload = async () => {
    if (!sheetUrl) return;
    setIsUploading(true);
    setSyncMessage('');
    const targetSheet = isCustomSheet ? customSheetName.trim() : selectedSheet;
    if (!targetSheet) {
      await showCuteAlert('กรุณาเลือกหรือป้อนชื่อแผ่นงานก่อนทำการอัปโหลดนะคะ', 'warning');
      setIsUploading(false);
      return;
    }
    try {
      const flatVocab = flattenUnitsForSheet(localUnits);
      const result = await updateSheetData(sheetUrl, flatVocab, targetSheet);
      if (result.status === 'success') {
        localStorage.setItem('larnvocab_sheet_url', sheetUrl);
        localStorage.setItem('larnvocab_selected_sheet', targetSheet);
        const time = new Date().toLocaleString();
        localStorage.setItem('larnvocab_last_sync', time);
        
        let successMsg = `อัปโหลดไปยังแผ่นงาน "${targetSheet}" สำเร็จ! จำนวน ${result.count} รายการค่ะ`;
        if (result.isNewSheet) {
          successMsg = `สร้างแผ่นงานใหม่ "${targetSheet}" และอัปโหลดสำเร็จแล้วค่ะ! จำนวน ${result.count} รายการ`;
        }
        await showCuteAlert(successMsg, 'success');
        setSyncMessage(successMsg);
        setIsCustomSheet(false);
        setCustomSheetName('');
        await handleFetchSheetsList(false);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      await showCuteAlert(`อัปโหลดไม่สำเร็จ: ${error.message}`, 'error');
      setSyncMessage(`❌ อัปโหลดไม่สำเร็จ: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const transformSheetDataToUnits = (data) => {
    const unitsMap = {};
    const unitsOrder = [];
    (data || []).forEach(item => {
      const sessionNum = item.session || 1;
      const unitName = `Unit ${sessionNum}`;
      const en = (item.en || '').trim();
      const th = (item.th || '').trim();
      const img = (item.image || item.img || '').trim();
      if (!en) return;
      if (!unitsMap[unitName]) {
        unitsMap[unitName] = {
          name: unitName,
          items: []
        };
        unitsOrder.push(unitName);
      }
      unitsMap[unitName].items.push({ en, th, img });
    });
    return unitsOrder.map(name => unitsMap[name]);
  };

  const flattenUnitsForSheet = (units) => {
    const flatData = [];
    (units || []).forEach(unit => {
      const match = unit.name.match(/\d+/);
      const sessionNum = match ? parseInt(match[0]) : 1;
      (unit.items || []).forEach(word => {
        flatData.push({
          session: sessionNum,
          en: word.en || '',
          th: word.th || '',
          image: word.img || ''
        });
      });
    });
    return flatData;
  };

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

  const removeUnit = async (idx) => {
    if (!await showCuteConfirm("ต้องการลบ Unit นี้ทั้งหมดใช่หรือไม่คะ? 🌸")) return;
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

          {/* Google Sheets Cloud Sync Section */}
          <div className="bg-[#ECFDF5] p-5 rounded-2xl mb-6 border border-emerald-100 shadow-sm animate-fade-in">
            <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <Cloud size={20} className="text-emerald-600 animate-pulse" /> 
              Google Sheets Cloud Sync
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">Google Apps Script Web App URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 p-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 outline-none placeholder-emerald-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleFetchSheetsList(true)}
                    disabled={isFetchingSheets || !sheetUrl}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-xl text-sm flex items-center gap-1 transition-all"
                  >
                    {isFetchingSheets ? <RefreshCw className="animate-spin" size={16} /> : <List size={16} />}
                    ค้นหาแผ่นงาน
                  </button>
                </div>
              </div>

              {sheetUrl && (
                <div className="p-3 bg-white/80 border border-emerald-100 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-700">📦 แผ่นงานที่เลือก (Sheet Name)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSheet(!isCustomSheet);
                        setCustomSheetName('');
                      }}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      {isCustomSheet ? (
                        <>
                          <FolderOpen size={12} /> เลือกที่มีอยู่
                        </>
                      ) : (
                        <>
                          <Plus size={12} /> สร้างชีตใหม่
                        </>
                      )}
                    </button>
                  </div>

                  {isCustomSheet ? (
                    <input
                      type="text"
                      value={customSheetName}
                      onChange={(e) => setCustomSheetName(e.target.value)}
                      placeholder="พิมพ์ชื่อแผ่นงานใหม่ (เช่น Animals, Fruits)"
                      className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-300 outline-none"
                    />
                  ) : (
                    <div>
                      {sheetList.length > 0 ? (
                        <select
                          value={selectedSheet}
                          onChange={(e) => setSelectedSheet(e.target.value)}
                          className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-300 outline-none"
                        >
                          {sheetList.map(name => (
                            <option key={name} value={name}>📄 {name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-xs text-emerald-500/70 italic text-center py-1">
                          {isFetchingSheets ? 'กำลังตรวจสอบ...' : 'กดปุ่ม "ค้นหาแผ่นงาน" เพื่อดึงรายชื่อแผ่นงานค่ะ'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={isSyncing || isUploading || !sheetUrl || (isCustomSheet && !customSheetName)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
                >
                  {isSyncing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  ดึงข้อมูลลง (Sync Down)
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isSyncing || isUploading || !sheetUrl || (isCustomSheet && !customSheetName)}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
                >
                  {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  ส่งข้อมูลขึ้น (Upload Up)
                </button>
              </div>

              {syncMessage && (
                <div className={`p-3 rounded-xl text-center text-xs font-bold border ${syncMessage.includes('สำเร็จ') ? 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse' : 'bg-red-100 text-red-800 border-red-200'}`}>
                  {syncMessage}
                </div>
              )}
            </div>
          </div>

          {/* Magic Translation Section */}
          {sheetUrl && (
            <div className="bg-[#FAF5FF] p-5 rounded-2xl mb-6 border border-purple-100 shadow-sm animate-fade-in">
              <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-600 animate-pulse" /> 
                เครื่องมือช่วยแปลภาษาอัจฉริยะ (Magic Translator)
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <p className="text-xs text-purple-600/80 font-medium thai-font max-w-md">
                  * ช่วยแปลคำศัพท์ภาษาอังกฤษเป็นภาษาไทยให้โดยอัตโนมัติผ่านคลาวด์ คุณผู้ใช้สามารถป้อนคำอังกฤษหลาย ๆ คำแล้วกดแปลทั้งหมดในคลิกเดียวได้เลยค่ะ ✨
                </p>
                <button
                  type="button"
                  onClick={handleTranslateAllEmpty}
                  disabled={isTranslatingAll || !sheetUrl}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-purple-300 disabled:to-indigo-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shrink-0 thai-font"
                >
                  {isTranslatingAll ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {isTranslatingAll ? 'กำลังแปลภาษารวดเดียว...' : '🪄 แปลคำศัพท์ที่ว่างทั้งหมด'}
                </button>
              </div>
            </div>
          )}

          {/* Parent PIN Settings Section */}
          <div className="bg-[#FFFBEB] p-5 rounded-2xl mb-6 border border-amber-100 shadow-sm animate-fade-in">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <Lock size={20} className="text-amber-600" /> 
              ตั้งค่ารหัสผ่านผู้ปกครอง (Parent PIN Settings)
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1">รหัสผ่าน 4 หลักปัจจุบัน</label>
                  <input
                    type="password"
                    disabled
                    value={parentPin}
                    className="w-full p-2.5 bg-amber-50/50 border border-amber-200/60 rounded-xl text-sm outline-none text-amber-600 font-mono tracking-widest text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1">ตั้งรหัสผ่านใหม่ (ตัวเลข 4 หลัก)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="ป้อนเลข 4 หลัก"
                      value={newPinInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 4) setNewPinInput(val);
                      }}
                      className="flex-1 p-2.5 bg-white border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-300 outline-none text-center font-mono tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={handleChangePin}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      <Unlock size={16} />
                      บันทึก PIN
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-amber-600/80 font-medium thai-font">
                * รหัสผ่านนี้ใช้ปกป้องการเข้าถึงการตั้งค่าคำศัพท์และระบบคลาวด์ซิงก์จากเด็ก ๆ ค่ะ (รหัสเริ่มต้นคือ 1234)
              </p>
            </div>
          </div>

          {/* Backup & Restore Profiles Section */}
          <div className="bg-[#EFF6FF] p-5 rounded-2xl mb-6 border border-blue-100 shadow-sm animate-fade-in">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Save size={20} className="text-blue-600" />
              สำรองและกู้คืนโปรไฟล์ผู้เรียน (Backup & Restore Profiles)
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-blue-600/80 font-medium thai-font">
                * คุณสามารถสำรองข้อมูลโปรไฟล์เด็กๆ คะแนนดาวสะสม และการตั้งค่าทั้งหมด เก็บไว้เป็นไฟล์ JSON ลงเครื่องคอมพิวเตอร์ และนำกลับมากู้คืนได้ทุกเมื่อเพื่อไม่ให้ข้อมูลสูญหายตามคำแนะนำค่ะ 💾
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportBackupJSON}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2 thai-font"
                >
                  <Save size={16} />
                  ส่งออกข้อมูลสำรอง (Export JSON)
                </button>
                <label className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer thai-font">
                  <Upload size={16} />
                  นำเข้าข้อมูลสำรอง (Import JSON)
                  <input
                    type="file"
                    accept=".json"
                    onChange={importBackupJSON}
                    className="hidden"
                  />
                </label>
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
                          <div className="relative">
                            <input
                              value={word.th}
                              onChange={(e) => updateWord(unitIdx, wordIdx, 'th', e.target.value)}
                              className={`w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-9 py-2 text-sm thai-font focus:border-blue-500 outline-none ${translatingWords[`${unitIdx}-${wordIdx}`] ? 'opacity-60 bg-blue-50/50' : ''}`}
                              placeholder={translatingWords[`${unitIdx}-${wordIdx}`] ? 'กำลังแปล...' : 'แอปเปิ้ล'}
                              disabled={translatingWords[`${unitIdx}-${wordIdx}`]}
                            />
                            <button
                              type="button"
                              onClick={() => handleTranslateSingle(unitIdx, wordIdx)}
                              disabled={translatingWords[`${unitIdx}-${wordIdx}`] || !sheetUrl}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 disabled:text-gray-300 transition-colors p-1 rounded-md hover:bg-purple-50"
                              title="แปลเป็นไทยอัตโนมัติ 🪄"
                            >
                              {translatingWords[`${unitIdx}-${wordIdx}`] ? (
                                <RefreshCw size={14} className="animate-spin text-purple-500" />
                              ) : (
                                <Sparkles size={14} className={word.en && !word.th ? 'animate-pulse text-purple-500' : ''} />
                              )}
                            </button>
                          </div>
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
            onClick={async () => {
              if (await showCuteConfirm('ต้องการล้างข้อมูลคำศัพท์ ประวัติการซิงก์ ลิงก์เชื่อมโยงชีต และรีเซ็ตรหัสผ่าน PIN กลับเป็น 1234 เพื่อเริ่มต้นดึงข้อมูลใหม่ทั้งหมดจาก Google Sheets เท่านั้นหรือไม่คะ? 🌸')) {
                localStorage.removeItem('vocabCSV');
                localStorage.removeItem('larnvocab_parent_pin');
                localStorage.removeItem('larnvocab_sheet_url');
                localStorage.removeItem('larnvocab_selected_sheet');
                localStorage.removeItem('larnvocab_last_sync');
                window.location.reload();
              }
            }}
            className="px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-bold transition-colors thai-font"
          >
            🔄 รีเซ็ตและล้างข้อมูลทั้งหมด
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

      {/* ปุ่มควบคุม NEW LAYOUT: Clear | Space | Delete */}
      <div className="flex justify-center gap-3 sm:gap-4 px-2">
        {/* ปุ่ม Clear (ย้ายมาแทน Shift) */}
        <button onClick={() => onKeyPress('CLEAR')}
          className="flex-none w-20 sm:w-24 h-11 sm:h-12 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg font-bold shadow-[0_3px_0_rgb(255,237,213)] active:translate-y-[2px] active:shadow-none flex items-center justify-center border-2 border-orange-100 text-sm sm:text-base relative transition-all"
        >
          <XCircle size={20} />
          <span className="ml-1">ล้าง</span>
        </button>

        {/* ปุ่ม Space (ขยายใหญ่ขึ้น) */}
        <button onClick={() => onKeyPress('SPACE')}
          className="flex-1 max-w-[320px] h-11 sm:h-12 bg-white hover:bg-gray-50 text-gray-500 rounded-lg font-bold shadow-[0_3px_0_rgb(229,231,235)] active:translate-y-[2px] active:shadow-none flex items-center justify-center border-2 border-gray-200 text-base sm:text-lg relative transition-all"
        >
          <span className="mb-0.5">Space</span>
        </button>

        {/* ปุ่ม Delete */}
        <button onClick={() => onKeyPress('DELETE')}
          className="flex-none w-20 sm:w-24 h-11 sm:h-12 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg font-bold shadow-[0_3px_0_rgb(254,202,202)] active:translate-y-[2px] active:shadow-none flex items-center justify-center border-2 border-red-100 text-sm sm:text-base relative transition-all"
        >
          <Delete size={20} />
          <span className="ml-1">ลบ</span>
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

  // --- Profile & Star States ---
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('larnvocab_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse profiles", e);
    }
    return [{ id: 'default', name: 'เด็กดี', avatar: '🐻', stars: 0 }];
  });

  const [currentProfileId, setCurrentProfileId] = useState(() => {
    return localStorage.getItem('larnvocab_current_profile_id') || 'default';
  });

  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isSwitchProfileOpen, setIsSwitchProfileOpen] = useState(false);
  const [isNavbarStarAnimating, setIsNavbarStarAnimating] = useState(false);

  const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0] || { id: 'default', name: 'เด็กดี', avatar: '🐻', stars: 0 };

  useEffect(() => {
    localStorage.setItem('larnvocab_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('larnvocab_current_profile_id', currentProfileId);
  }, [currentProfileId]);

  const createNewProfile = (name, avatar) => {
    if (!name.trim()) return false;
    const newProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      avatar: avatar || '🐻',
      stars: 0
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setCurrentProfileId(newProfile.id);
    speak(`ยินดีต้อนรับ น้อง ${name.trim()} นะคะ`, 'th-TH');
    return true;
  };

  const switchProfile = (profileId) => {
    const target = profiles.find(p => p.id === profileId);
    if (target) {
      setCurrentProfileId(profileId);
      speak(`ยินดีต้อนรับกลับ น้อง ${target.name} นะคะ`, 'th-TH');
    }
  };

  const deleteProfile = async (profileId) => {
    if (profiles.length <= 1) {
      await showCuteAlert("ต้องมีอย่างน้อยหนึ่งชื่อผู้เรียนเสมอนะคะ 🌸", 'warning');
      return;
    }
    const updated = profiles.filter(p => p.id !== profileId);
    setProfiles(updated);
    if (currentProfileId === profileId) {
      setCurrentProfileId(updated[0].id);
    }
    speak("ลบโปรไฟล์เรียบร้อยแล้วค่ะ", 'th-TH');
  };

  const addStarToCurrentProfile = () => {
    setProfiles(prevProfiles => prevProfiles.map(p => {
      if (p.id === currentProfileId) {
        return { ...p, stars: (p.stars || 0) + 1 };
      }
      return p;
    }));
    setIsNavbarStarAnimating(true);
    setTimeout(() => setIsNavbarStarAnimating(false), 1000);
  };

  // --- JSON Backup & Restore Functions ---
  const exportBackupJSON = async () => {
    try {
      const backupData = {
        profiles: profiles,
        currentProfileId: currentProfileId,
        parentPin: parentPin,
        volume: volume,
        vocabCSV: localStorage.getItem('vocabCSV') || '',
        larnvocab_sheet_url: localStorage.getItem('larnvocab_sheet_url') || '',
        larnvocab_selected_sheet: localStorage.getItem('larnvocab_selected_sheet') || 'VocabData'
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `larnvocab_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      speak("ส่งออกข้อมูลสำรองเรียบร้อยแล้วค่ะ", 'th-TH');
    } catch (e) {
      await showCuteAlert(`ไม่สามารถส่งออกข้อมูลสำรองได้: ${e.message}`, 'error');
    }
  };

  const importBackupJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!imported.profiles || !Array.isArray(imported.profiles)) {
          throw new Error("รูปแบบไฟล์สำรองไม่ถูกต้องค่ะ (ขาดคีย์ profiles)");
        }

        const confirmed = await showCuteConfirm("ต้องการกู้คืนข้อมูลสำรองนี้ใช่หรือไม่? ข้อมูลปัจจุบันในเครื่องจะถูกแทนที่ทั้งหมดค่ะ 🌸");
        if (confirmed) {
          setProfiles(imported.profiles);
          if (imported.currentProfileId) {
            setCurrentProfileId(imported.currentProfileId);
          }
          if (imported.parentPin) {
            setParentPin(imported.parentPin);
            localStorage.setItem('larnvocab_parent_pin', imported.parentPin);
          }
          if (typeof imported.volume === 'number') {
            setVolume(imported.volume);
            localStorage.setItem('volume', imported.volume.toString());
          }
          if (imported.vocabCSV !== undefined) {
            localStorage.setItem('vocabCSV', imported.vocabCSV);
          }
          if (imported.larnvocab_sheet_url !== undefined) {
            localStorage.setItem('larnvocab_sheet_url', imported.larnvocab_sheet_url);
          }
          if (imported.larnvocab_selected_sheet !== undefined) {
            localStorage.setItem('larnvocab_selected_sheet', imported.larnvocab_selected_sheet);
          }

          speak("นำเข้าข้อมูลสำรองเรียบร้อยแล้วค่ะ กำลังรีโหลดระบบใหม่นะคะ", 'th-TH');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (err) {
        await showCuteAlert(`นำเข้าข้อมูลไม่สำเร็จ: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Parent PIN Protection States
  const [parentPin, setParentPin] = useState(() => {
    return localStorage.getItem('larnvocab_parent_pin') || '1234';
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

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

  // Custom Cute Alert/Confirm State
  const [alertConfig, setAlertConfig] = useState(null);

  const showCuteAlert = (message, type = 'info', title = '') => {
    return new Promise((resolve) => {
      let defaultTitle = 'ข้อมูล 💡';
      if (type === 'success') defaultTitle = 'สำเร็จเรียบร้อย! 🎉';
      else if (type === 'error') defaultTitle = 'โอ๊ะโอ... มีข้อผิดพลาด ❌';
      else if (type === 'warning') defaultTitle = 'คำเตือน ⚠️';
      
      setAlertConfig({
        message,
        type,
        title: title || defaultTitle,
        isConfirm: false,
        onClose: () => {
          setAlertConfig(null);
          resolve(true);
        }
      });
    });
  };

  const showCuteConfirm = (message, title = 'ยืนยันการดำเนินการ 🌸') => {
    return new Promise((resolve) => {
      setAlertConfig({
        message,
        type: 'warning',
        title,
        isConfirm: true,
        onConfirm: () => {
          setAlertConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setAlertConfig(null);
          resolve(false);
        }
      });
    });
  };

  // --- FIX 1: Enhanced Voice Loading for Android ---
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const v = window.speechSynthesis.getVoices() || [];

      // If voices found, set them
      if (v.length > 0) {
        setVoices(v);
      } else {
        // If not found (common on Android Chrome init), poll for them
        const intervalId = setInterval(() => {
          const retryVoices = window.speechSynthesis.getVoices();
          if (retryVoices.length > 0) {
            setVoices(retryVoices);
            clearInterval(intervalId);
          }
        }, 100);
        // Safety stop after 5s
        setTimeout(() => clearInterval(intervalId), 5000);
      }
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
        // No custom data, wait for user to sync from Google Sheet
        setUnits([]);
        console.log('ℹ️ No local vocab data. Ready for Google Sheets sync down.');
      }
    } catch (error) {
      console.error('Error loading vocab:', error);
      showCuteAlert(`เกิดข้อผิดพลาดในการโหลดข้อมูล\n\n${error.message}`, 'error', '❌ เกิดข้อผิดพลาด');
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

  // --- FIX 2: Enhanced Mobile Unlock ---
  useEffect(() => {
    const unlockSpeech = () => {
      enableMobileAudio(); // Use the enhanced unlocker
    };

    // Listen for any user interaction
    document.addEventListener('touchstart', unlockSpeech, { once: true, passive: true });
    document.addEventListener('click', unlockSpeech, { once: true, passive: true });

    return () => {
      document.removeEventListener('touchstart', unlockSpeech);
      document.removeEventListener('click', unlockSpeech);
    };
  }, []);

  // Enable Mobile Audio - Unlock Speech Synthesis API
  const enableMobileAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // 1. CLEAR QUEUE (Critical for iOS)
    window.speechSynthesis.cancel();

    // 2. RESUME
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // 3. SPEAK SILENT SPACE (Better than empty string for some browsers)
    const utterance = new SpeechSynthesisUtterance(" ");
    utterance.volume = 0;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);

    console.log("🔊 Audio Context unlocked manually");
  };

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
    // Unlock audio for mobile browsers (must be called on user gesture)
    enableMobileAudio();

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

    // Speak unit name after a short delay (to ensure audio is unlocked)
    setTimeout(() => {
      try {
        speak(`เริ่ม ${unit?.name || 'บทเรียน'}`, 'th-TH');
      } catch (e) {
        console.error('Failed to speak unit name:', e);
      }
    }, 100);
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

  // Global array to prevent GC of queued utterances
  if (typeof window !== 'undefined' && !window.speechUtterances) window.speechUtterances = [];

  const speak = (text, lang = 'en-US', opts = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      // Default interrupt to true if not specified
      const shouldInterrupt = opts.interrupt !== false;

      if (shouldInterrupt) {
        window.speechSynthesis.cancel();
        if (window.speechUtterances) { // Ensure it exists before clearing
          window.speechUtterances = []; // Clear our refs too
        }
      }

      const utterance = new SpeechSynthesisUtterance(String(text || ''));

      // Keep reference to prevent GC
      if (window.speechUtterances) { // Ensure it exists before pushing
        window.speechUtterances.push(utterance);
      }

      // Cleanup on end
      utterance.onend = () => {
        console.log("✅ Speech ended");
        // Remove from array (filter out this specific instance)
        if (window.speechUtterances) {
          window.speechUtterances = window.speechUtterances.filter(u => u !== utterance);
        }
      };
      utterance.onerror = (e) => {
        console.error("❌ Speech error:", e);
        if (window.speechUtterances) {
          window.speechUtterances = window.speechUtterances.filter(u => u !== utterance);
        }
      };

      // Basic config
      utterance.rate = opts.rate || 1;
      utterance.pitch = opts.pitch || 1;
      utterance.volume = typeof opts.volume === 'number' ? opts.volume : (volume / 100);

      // ค้นหาเสียงที่เลือกจากแผงตั้งค่าเสียง หรือเลือกเสียงพรีเมียมอัตโนมัติ
      let voiceToUse = null;
      if (voicePrefs && voicePrefs[lang]) {
        voiceToUse = voices.find(v => v.name === voicePrefs[lang]);
      }
      
      if (!voiceToUse) {
        voiceToUse = chooseVoiceForLang(lang);
      }

      if (voiceToUse) {
        utterance.voice = voiceToUse;
        utterance.lang = voiceToUse.lang || lang;
      } else {
        utterance.lang = lang || 'en-US';
      }

      // Resume if needed
      try {
        if (window.speechSynthesis.paused || window.speechSynthesis.pending) {
          window.speechSynthesis.resume();
        }
      } catch (e) { }

      // Speak!
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('❌ speak() exception:', e);
    }
  };

  // --- FIX 3: Safe Auto-read with Delay & Resume ---
  useEffect(() => {
    if (screen === 'game' && vocabList && vocabList.length > 0) {
      const w = vocabList[currentIndex];

      // Increased delay to 500ms for Mobile Browsers to catch up
      const tid = setTimeout(() => {
        if (w && w.en) {
          console.log('🔊 Attempting to speak:', w.en);

          // Safety Resume Check
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          }
          // Auto-read: queue after "Start Unit" speech
          // interrupt: false allows it to wait if "Start Unit" is still speaking
          speak(w.en, 'en-US', { interrupt: false });
        }
      }, 500);

      return () => clearTimeout(tid);
    }
  }, [currentIndex, screen, vocabList, voices]);

  // Auto-hide hint after 5 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  // --- Game Logic ---
  const handleKeyPress = (key) => {
    if (gameStatus !== 'playing' && gameStatus !== 'wrong') return;

    if (key === 'SHIFT') {
      setIsShiftActive(prev => !prev);
      return;
    }

    if (key === 'CLEAR') {
      setCurrentInput('');
      setGameStatus('playing');
      setIsShiftActive(false); // Reset shift when clearing
      return;
    }

    if (key === 'DELETE') {
      setCurrentInput(prev => prev.slice(0, -1));
      setGameStatus('playing');
      setAttempts(prev => prev + 1); // Count delete as an attempt
      return;
    }

    if (key === 'SPACE') {
      const currentWord = vocabList[currentIndex];
      const maxLen = currentWord?.en.length || 0;

      if (currentInput.length < maxLen) {
        const newInput = currentInput + ' ';
        setCurrentInput(newInput);
        setGameStatus('playing');

        // Auto-check if full length reached
        if (newInput.length === maxLen) {
          checkAnswer(newInput);
        }
      }
      return;
    }

    // Play letter sound REMOVED (User request)
    // speak(key, 'en-US', { rate: 1.2, interrupt: true });

    const currentWord = vocabList[currentIndex];
    const maxLen = currentWord?.en.length || 0;

    if (currentInput.length < maxLen) {
      // Apply shift if active
      const charToAdd = isShiftActive ? key.toUpperCase() : key.toLowerCase();
      const newInput = currentInput + charToAdd;
      setCurrentInput(newInput);
      setGameStatus('playing');

      // Turn off shift after typing a letter (like real keyboard)
      setIsShiftActive(false);

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

    const isCorrect = inputToCheck.toLowerCase() === currentWord.en.toLowerCase();

    if (isCorrect) {
      // Record statistics for correct answer
      const timeSpent = startTime ? (Date.now() - startTime) / 1000 : 0; // in seconds
      setWordStats(prev => [...prev, {
        word: currentWord.en,
        thai: currentWord.th,
        correct: true,
        time: timeSpent,
        attempts: attempts + 1
      }]);

      setGameStatus('correct');
      setScore(prev => prev + 10);
      addStarToCurrentProfile();
      playSoundEffect('correct');
      setParticleType('correct');
      setTimeout(() => setParticleType(null), 3500); // Extended for fireworks

      setTimeout(() => {
        nextCard();
      }, 4000); // 4s delay for full effect
    } else {
      setGameStatus('wrong');
      setAttempts(prev => prev + 1); // Increment attempts on wrong answer
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
      // Reset timing for next word
      setStartTime(Date.now());
      setAttempts(0);
    } else {
      setGameStatus('complete');
      setScreen('summary'); // Go to summary screen instead of just setting status
      speak("สุดยอดเลย! มาดูกันว่าคะแนนเป็นยังไงบ้าง", 'th-TH');
    }
  };



  // --- Screens ---

  // Collapsible Nav Component
  const CollapsibleNav = () => {
    return (
      <>
        {/* Hamburger Button */}
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="fixed top-4 left-4 z-[70] w-12 h-12 bg-white hover:bg-blue-50 text-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title={isNavOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          {isNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Backdrop */}
        {isNavOpen && (
          <div
            onClick={() => setIsNavOpen(false)}
            className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm animate-fade-in"
          />
        )}

        {/* Slide-in Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-[65] transition-transform duration-300 ease-out ${isNavOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings size={24} className="text-blue-500" />
                ตั้งค่า
              </h3>
            </div>

            {/* Menu Items */}
            <div className="flex-1 space-y-3">
              {/* ปุ่มสลับภาษาระบบ */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ภาษาระบบ</label>
                <button
                  onClick={() => {
                    const newLang = systemVoiceLang === 'th' ? 'en' : 'th';
                    setSystemVoiceLang(newLang);
                    localStorage.setItem('systemVoiceLang', newLang);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-bold"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 size={20} />
                    {systemVoiceLang === 'th' ? 'ภาษาไทย' : 'English'}
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{systemVoiceLang.toUpperCase()}</span>
                </button>
              </div>

              {/* ควบคุมระดับเสียง */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ระดับเสียง</label>
                <div className="space-y-3">
                  {/* แสดงระดับเสียงปัจจุบัน */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-300"
                        style={{ width: `${volume}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-12 text-right">{volume}%</span>
                  </div>

                  {/* ปุ่มปรับเสียง */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newVolume = Math.max(0, volume - 10);
                        setVolume(newVolume);
                        localStorage.setItem('volume', newVolume.toString());
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-bold text-sm"
                    >
                      <Volume2 size={16} />
                      ลดเสียง
                    </button>
                    <button
                      onClick={() => {
                        const newVolume = Math.min(100, volume + 10);
                        setVolume(newVolume);
                        localStorage.setItem('volume', newVolume.toString());
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-bold text-sm"
                    >
                      <Volume2 size={20} />
                      เพิ่มเสียง
                    </button>
                  </div>
                </div>
              </div>

              {/* ปุ่มจัดการบทเรียน */}
              <button
                onClick={() => {
                  setIsPinModalOpen(true);
                  setIsNavOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-bold"
              >
                <Settings size={20} />
                จัดการบทเรียน
              </button>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">Larn English App v1.0</p>
            </div>
          </div>
        </div>
      </>
    );
  };

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
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 tracking-tight drop-shadow-sm transform group-hover:scale-105 transition-transform duration-300 pb-4">
              Larn English
            </h1>
            <div className="absolute -top-6 -right-6 text-yellow-400 animate-spin-slow">
              <Star size={48} fill="currentColor" />
            </div>
            <p className="text-xl text-blue-600 mt-4 font-bold thai-font bg-white/50 py-2 px-6 rounded-full inline-block backdrop-blur-sm">
              มาเรียนภาษาอังกฤษกันเถอะ!
            </p>
          </div>

          {/* Kids Profile Card */}
          <div className="w-full px-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 p-[3px] rounded-3xl shadow-xl max-w-xl mx-auto hover:scale-[1.01] transition-transform duration-300">
              <div className="bg-white rounded-[21px] p-5 flex flex-col sm:flex-row items-center gap-5 justify-between relative overflow-hidden">
                {/* Decorative sparkles */}
                <div className="absolute top-2 right-2 text-yellow-300 animate-pulse">
                  <Sparkles size={24} />
                </div>
                
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-100 to-orange-100 flex items-center justify-center text-4xl shadow-md animate-bounce">
                    {currentProfile.avatar}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-400 thai-font">เด็กดีที่กำลังเรียนรู้:</h2>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 thai-font mt-0.5">
                      น้อง{currentProfile.name}
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-yellow-600 font-black text-sm mt-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 w-fit">
                      <Star size={16} className="fill-current text-yellow-500 animate-spin-slow" />
                      <span>สะสมดาวถาวร: {currentProfile.stars || 0} ดวง</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setIsSwitchProfileOpen(true)}
                    className="flex-1 sm:flex-none px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 text-sm thai-font"
                  >
                    สลับคนเรียน
                  </button>
                  <button
                    onClick={() => setIsCreateProfileOpen(true)}
                    className="flex-1 sm:flex-none px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 text-sm thai-font"
                  >
                    เพิ่มเด็กใหม่
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Units Grid */}
          <div className="w-full px-4 space-y-6">
            {units.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-dashed border-blue-200 text-center max-w-lg mx-auto animate-fade-in flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Cloud size={48} className="animate-pulse text-blue-400" />
                </div>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 mb-3 thai-font">
                  ยินดีต้อนรับสู่ Larn English! 🌟
                </h3>
                <p className="text-gray-500 thai-font text-sm leading-relaxed mb-6 px-2">
                  ระบบล้างข้อมูลสำเร็จแล้วค่ะ ตอนนี้ตัวแอปเริ่มต้นอย่างปลอดภัยโดย **เชื่อมต่อตรงกับ Google Sheets เท่านั้น** 
                  กรุณาเข้าหน้าจัดการบทเรียนเพื่อตั้งค่าและทำการดึงข้อมูล (Sync Down) มาใช้เล่นกันนะคะ ☁️🔒
                </p>
                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-95 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Lock size={18} />
                  เข้าหน้าจัดการระบบเพื่อเชื่อมต่อ Google Sheet
                </button>
              </div>
            ) : (
              <>
                {/* Bonus Unit Card */}
                <div
                  onClick={() => startGame(createBonusUnit(units, 20))}
                  className="bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 text-white rounded-3xl p-6 shadow-2xl cursor-pointer hover:scale-[1.02] transition-all duration-300 border-4 border-amber-300 relative overflow-hidden group"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Trophy className="text-yellow-200" size={36} />
                        <h3 className="text-2xl font-bold">Bonus: ทบทวนทั้งหมด</h3>
                      </div>
                      <Star className="text-yellow-200 animate-pulse" size={32} fill="currentColor" />
                    </div>

                    <p className="text-amber-50 text-sm mb-3">
                      สุ่มคำศัพท์จากทุก Unit มา 20 ข้อเพื่อทบทวน
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-white/20 px-3 py-1.5 rounded-full backdrop-blur font-bold">
                        📚 {units.reduce((sum, u) => sum + (u.items?.length || 0), 0)} คำทั้งหมด
                      </span>
                      <span className="bg-white/20 px-3 py-1.5 rounded-full backdrop-blur font-bold">
                        🎲 สุ่ม 20 ข้อ
                      </span>
                    </div>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>

                {/* Regular Units Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              </>
            )}
          </div>
        </div>

        {/* Collapsible Navigation */}
        <CollapsibleNav />

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
            parentPin={parentPin}
            setParentPin={setParentPin}
            exportBackupJSON={exportBackupJSON}
            importBackupJSON={importBackupJSON}
            showCuteAlert={showCuteAlert}
            showCuteConfirm={showCuteConfirm}
          />
        )}

        {/* Create Profile Modal */}
        <CreateProfileModal
          isOpen={isCreateProfileOpen}
          onClose={() => setIsCreateProfileOpen(false)}
          onCreate={createNewProfile}
          showCuteAlert={showCuteAlert}
        />

        {/* Switch Profile Modal */}
        <SwitchProfileModal
          isOpen={isSwitchProfileOpen}
          onClose={() => setIsSwitchProfileOpen(false)}
          profiles={profiles}
          currentId={currentProfileId}
          onSwitch={switchProfile}
          onDelete={deleteProfile}
          onCreateNewClick={() => {
            setIsSwitchProfileOpen(false);
            setIsCreateProfileOpen(true);
          }}
          showCuteConfirm={showCuteConfirm}
        />

        {/* Parent PIN Lock Modal */}
        <PinAuthModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => {
            setIsPinModalOpen(false);
            setIsAdminOpen(true);
          }}
          correctPin={parentPin}
        />



        {/* Cute Alert / Confirm Modal */}
        {alertConfig && (
          <CuteAlertModal
            isOpen={true}
            onClose={alertConfig.onClose}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
            isConfirm={alertConfig.isConfirm}
            onConfirm={alertConfig.onConfirm}
            onCancel={alertConfig.onCancel}
          />
        )}
      </div>
    );
  }

  // 2. Summary Screen
  if (screen === 'summary') {
    return (
      <SummaryScreen
        stats={wordStats}
        unitName={currentUnit?.name || 'Unit'}
        onRestart={() => startGame(currentUnit)}
        onGoHome={goHome}
      />
    );
  }

  // 3. Game Screen
  const currentWord = vocabList[currentIndex];

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center pb-80 relative overflow-hidden font-sans">
      <style>{`
        body { font-family: 'Mali', 'Baloo 2 Local', 'Baloo 2', sans-serif; }
        .thai-font { font-family: 'Mali', 'Sarabun Local', 'Sarabun', sans-serif; }
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
        <div className="flex items-center gap-2">
          <button
            onClick={goHome}
            className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="กลับหน้าหลัก"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => {
              const newLang = systemVoiceLang === 'th' ? 'en' : 'th';
              setSystemVoiceLang(newLang);
              localStorage.setItem('systemVoiceLang', newLang);
            }}
            className="flex items-center justify-center gap-1.5 px-3 h-10 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-600 rounded-xl transition-all font-bold text-sm border-2 border-purple-200"
            title={systemVoiceLang === 'th' ? 'เปลี่ยนเป็นภาษาอังกฤษ' : 'Switch to Thai'}
          >
            <Volume2 size={16} />
            <span className="uppercase">{systemVoiceLang}</span>
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-800 truncate max-w-[25%]">{currentUnit?.name}</h2>
        
        <div className="flex items-center gap-3">
          {/* Active Profile Info */}
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full text-blue-700">
            <span className="text-2xl animate-bounce">{currentProfile.avatar}</span>
            <span className="font-bold text-sm thai-font">น้อง{currentProfile.name}</span>
          </div>

          {/* Cumulative Stars (Permanent Stars) */}
          <div 
            className={`bg-yellow-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-yellow-200 text-yellow-700 transition-all duration-300 ${
              isNavbarStarAnimating ? 'scale-125 rotate-12 shadow-lg shadow-yellow-100 bg-yellow-200' : ''
            }`}
            title="ดาวสะสมถาวรทั้งหมดของเด็กคนนี้"
          >
            <Star className={`text-yellow-500 fill-current ${isNavbarStarAnimating ? 'animate-spin' : ''}`} size={18} />
            <span className="font-bold text-sm">{currentProfile.stars || 0}</span>
          </div>

          {/* Unit Score */}
          <div className="bg-emerald-100 px-3.5 py-1.5 rounded-full flex items-center gap-1 border border-emerald-200 text-emerald-700" title="คะแนนในรอบนี้">
            <Trophy size={16} className="text-emerald-500 animate-pulse" />
            <span className="font-bold text-sm">{score}</span>
          </div>
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

        {/* Hint - Moved to top */}
        {showHint && (
          <div className="mb-2 text-blue-400 font-bold animate-fade-in text-lg">
            Hint: {(currentWord?.en || '').charAt(0)}...
          </div>
        )}

        {/* Word Display */}
        <div className="w-full mb-4 overflow-x-auto scrollbar-hide word-display-container">
          <div className="flex items-center gap-1 sm:gap-2 px-4 min-w-fit mx-auto justify-center">
            {(currentWord?.en || '').split('').map((char, index) => {
              let status = 'neutral';
              if (index < currentInput.length) {
                // Only reveal status if game is NOT playing (meaning we checked logic)
                if (gameStatus === 'correct' || gameStatus === 'wrong') {
                  status = currentInput[index].toLowerCase() === char.toLowerCase() ? 'correct' : 'wrong';
                }
              }

              // Calculate responsive size based on word length
              const wordLength = currentWord?.en.length || 0;
              let sizeClass = '';

              if (wordLength <= 5) {
                // Short words: large boxes
                sizeClass = 'w-12 h-14 sm:w-16 sm:h-20 md:w-20 md:h-24 text-2xl sm:text-4xl';
              } else if (wordLength <= 8) {
                // Medium words: medium boxes
                sizeClass = 'w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 text-xl sm:text-3xl';
              } else if (wordLength <= 12) {
                // Long words: small boxes
                sizeClass = 'w-8 h-10 sm:w-12 sm:h-14 md:w-14 md:h-16 text-lg sm:text-2xl';
              } else {
                // Very long words: extra small boxes
                sizeClass = 'w-7 h-9 sm:w-10 sm:h-12 md:w-12 md:h-14 text-base sm:text-xl';
              }

              // Override for space - make it wider
              const isSpace = char === ' ';
              if (isSpace) {
                if (wordLength <= 8) {
                  sizeClass = 'w-14 h-12 sm:w-20 sm:h-16 md:w-24 md:h-20 text-xl sm:text-3xl';
                } else {
                  sizeClass = 'w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-lg sm:text-2xl';
                }
              }

              return (
                <LetterBox
                  key={index}
                  letter={index < currentInput.length ? currentInput[index] : ''}
                  status={status}
                  sizeClass={sizeClass}
                />
              );
            })}
          </div>
        </div>

        {/* Feedback Messages */}
        {gameStatus === 'correct' && (
          <div className="text-green-500 font-bold text-xl thai-font flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-green-100 animate-fade-in z-[60] relative">
            <CheckCircle size={28} /> ถูกต้อง! เก่งมาก
          </div>
        )}
        {gameStatus === 'wrong' && (
          <div className="text-red-500 font-bold text-xl thai-font flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-red-100 animate-fade-in z-[60] relative">
            <XCircle size={28} /> ผิดจ้า ลองใหม่นะ
          </div>
        )}
      </div>

      <Keyboard onKeyPress={handleKeyPress} playKeySound={playKeySound} isShiftActive={isShiftActive} />



      {/* Cute Alert / Confirm Modal */}
      {alertConfig && (
        <CuteAlertModal
          isOpen={true}
          onClose={alertConfig.onClose}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          isConfirm={alertConfig.isConfirm}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
        />
      )}
    </div>
  );
}

// --- Modals for Kids Profiles (Create and Switch) ---
const CreateProfileModal = ({ isOpen, onClose, onCreate, showCuteAlert }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐻');
  const avatars = ['🐻', '🐰', '🐱', '🐼', '🐯', '🦁'];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      await showCuteAlert("กรุณากรอกชื่อน้องเรียนด้วยนะคะ 🌸", "warning");
      return;
    }
    const success = onCreate(name, selectedAvatar);
    if (success) {
      setName('');
      setSelectedAvatar('🐻');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up border border-gray-100 flex flex-col relative overflow-hidden font-sans">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500" />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-50"
        >
          <X size={24} />
        </button>

        <div className="text-center mt-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto text-5xl shadow-md mb-3 animate-bounce">
            {selectedAvatar}
          </div>
          <h3 className="text-2xl font-black text-gray-800 thai-font">สร้างโปรไฟล์ผู้เรียนคนใหม่ 🌟</h3>
          <p className="text-gray-500 text-xs thai-font mt-1">มาเพิ่มรายชื่อเด็กๆ เพื่อบันทึกดาวสะสมแยกคนกันนะคะ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 thai-font mb-2">ชื่อของเด็กดี (ชื่อเล่น):</label>
            <input
              type="text"
              maxLength={15}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อที่นี่... (เช่น น้องมานี, น้องปิติ)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-yellow-300 outline-none text-center font-bold text-gray-700 thai-font"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 thai-font mb-3">เลือกรูปอวตารสัตว์น่ารัก:</label>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    selectedAvatar === av 
                      ? 'bg-yellow-400 scale-110 shadow-md shadow-yellow-200 border-2 border-yellow-500' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all thai-font"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 thai-font"
            >
              บันทึกชื่อใหม่ 🎉
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SwitchProfileModal = ({ isOpen, onClose, profiles, currentId, onSwitch, onDelete, onCreateNewClick, showCuteConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up border border-gray-100 flex flex-col relative overflow-hidden max-h-[85vh] font-sans">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-50"
        >
          <X size={24} />
        </button>

        <div className="text-center mt-4 mb-6">
          <h3 className="text-2xl font-black text-gray-800 thai-font">สลับรายชื่อผู้เรียน 🐻🐰</h3>
          <p className="text-gray-500 text-xs thai-font mt-1">เลือกชื่อของเด็กดีเพื่อเก็บสะสมดาวของตัวเองกันนะคะ</p>
        </div>

        {/* Profile List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[45vh] custom-scrollbar">
          {profiles.map((p) => {
            const isActive = p.id === currentId;
            return (
              <div 
                key={p.id}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  isActive 
                    ? 'bg-blue-50 border-blue-400 shadow-md shadow-blue-50' 
                    : 'bg-white hover:bg-gray-50 border-gray-100'
                }`}
              >
                <button
                  onClick={() => { onSwitch(p.id); onClose(); }}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-3xl shadow-inner">
                    {p.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg thai-font flex items-center gap-1.5">
                      {p.name}
                      {isActive && <span className="text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">กำลังเล่น</span>}
                    </h4>
                    <p className="text-sm text-yellow-600 font-bold flex items-center gap-1 mt-0.5">
                      <Star size={14} className="fill-current text-yellow-500 animate-spin-slow" />
                      สะสม {p.stars || 0} ดวง
                    </p>
                  </div>
                </button>

                {profiles.length > 1 && (
                  <button
                    onClick={async () => {
                      if (await showCuteConfirm(`คุณพ่อคุณแม่แน่ใจว่าต้องการลบโปรไฟล์ของ น้อง${p.name} หรือไม่คะ? ดาวสะสมและประวัติจะถูกลบออกถาวรค่ะ 🌸`)) {
                        onDelete(p.id);
                      }
                    }}
                    className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl transition-all"
                    title="ลบโปรไฟล์"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            onClick={onCreateNewClick}
            className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 thai-font text-sm"
          >
            <Plus size={18} />
            เด็กดีคนใหม่
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all thai-font text-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};