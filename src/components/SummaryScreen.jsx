import React from 'react';
import { Home, RotateCcw, BookOpen, Trophy, Clock, Target, Star } from 'lucide-react';

const SummaryScreen = ({ stats, unitName, onRestart, onGoHome }) => {
    // Calculate summary statistics
    const totalWords = stats.length;
    const correctWords = stats.filter(s => s.correct).length;
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;
    const avgTime = stats.length > 0
        ? (stats.reduce((sum, s) => sum + s.time, 0) / stats.length).toFixed(1)
        : 0;
    const perfectWords = stats.filter(s => s.correct && s.attempts === 1).length;
    const wrongWords = stats.filter(s => !s.correct);

    // Determine badge and message
    const getBadge = () => {
        if (accuracy === 100) return { emoji: '🥇', color: 'text-yellow-500', name: 'เหรียญทอง' };
        if (accuracy >= 80) return { emoji: '🥈', color: 'text-gray-400', name: 'เหรียญเงิน' };
        if (accuracy >= 60) return { emoji: '🥉', color: 'text-orange-600', name: 'เหรียญทองแดง' };
        return { emoji: '⭐', color: 'text-blue-500', name: 'ดาวน้อย' };
    };

    const getMessage = () => {
        if (accuracy === 100) return "เก่งมาก! เพอร์เฟ็กต์เลย! 🌟";
        if (accuracy >= 80) return "ยอดเยี่ยม! เก่งมากเลย! 🎉";
        if (accuracy >= 60) return "ดีมาก! พยายามต่อไปนะ! 💪";
        return "ไม่เป็นไร ลองใหม่อีกครั้งนะ! 🌈";
    };

    const badge = getBadge();
    const message = getMessage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background decoration */}
            <div className="absolute top-10 left-10 text-blue-200 opacity-20 animate-pulse">
                <Star size={100} fill="currentColor" />
            </div>
            <div className="absolute bottom-10 right-10 text-purple-200 opacity-20 animate-bounce">
                <Trophy size={120} fill="currentColor" />
            </div>

            <div className="w-full max-w-4xl z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                        สรุปผลการเล่น
                    </h1>
                    <p className="text-2xl text-gray-600 thai-font">{unitName}</p>
                </div>

                {/* Main Stats Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
                    {/* Badge and Message */}
                    <div className="text-center mb-8">
                        <div className={`text-8xl mb-4 ${badge.color}`}>{badge.emoji}</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">{badge.name}</h2>
                        <p className="text-xl text-gray-600 thai-font">{message}</p>
                    </div>

                    {/* Score Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-green-700">{correctWords}/{totalWords}</div>
                            <div className="text-sm text-green-600 thai-font mt-1">คำที่ถูก</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-blue-700">{accuracy}%</div>
                            <div className="text-sm text-blue-600 thai-font mt-1">ความแม่นยำ</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-purple-700">{avgTime}s</div>
                            <div className="text-sm text-purple-600 thai-font mt-1">เวลาเฉลี่ย</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-yellow-700">{perfectWords}</div>
                            <div className="text-sm text-yellow-600 thai-font mt-1">ถูกครั้งแรก</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-600 mb-2 thai-font">
                            <span>ความคืบหน้า</span>
                            <span>{correctWords}/{totalWords} คำ</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                                style={{ width: `${accuracy}%` }}
                            />
                        </div>
                    </div>

                    {/* Detailed Stats */}
                    {wrongWords.length > 0 && (
                        <div className="bg-red-50 rounded-2xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center thai-font">
                                <Target className="mr-2" size={24} />
                                คำที่ควรทบทวน
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {wrongWords.map((word, idx) => (
                                    <div key={idx} className="bg-white rounded-xl p-3 flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-gray-800">{word.word}</div>
                                            <div className="text-sm text-gray-500 thai-font">{word.thai}</div>
                                        </div>
                                        <div className="text-xs text-gray-400">{word.attempts} ครั้ง</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Perfect Words */}
                    {perfectWords > 0 && (
                        <div className="bg-yellow-50 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-yellow-700 mb-4 flex items-center thai-font">
                                <Star className="mr-2" size={24} fill="currentColor" />
                                คำที่ตอบถูกครั้งแรก ({perfectWords} คำ)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {stats.filter(s => s.correct && s.attempts === 1).map((word, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-2 text-center">
                                        <div className="font-bold text-gray-800 text-sm">{word.word}</div>
                                        <div className="text-xs text-gray-500 thai-font">{word.thai}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onGoHome}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <Home size={24} />
                        <span className="thai-font">กลับหน้าหลัก</span>
                    </button>
                    <button
                        onClick={onRestart}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <RotateCcw size={24} />
                        <span className="thai-font">เล่นใหม่</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SummaryScreen;
