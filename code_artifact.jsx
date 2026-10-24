import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Save, Plus, Trash2, Edit2, Check, X, 
  BarChart2, Clock, Target, Calendar, Flame, BookOpen, Sun, Moon,
  Sunrise, SunMedium, Sunset, MoonStar, Settings, Sparkles, TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Default Korean Teacher Certification Exam (임용고시) categories
const DEFAULT_CATEGORIES = [
  { id: 'edu', name: '교육학', color: '#6366f1' },
  { id: 'major_ethics', name: '전공 윤리 (통합)', color: '#10b981' },
  { id: 'west', name: '서양윤리', color: '#3b82f6' },
  { id: 'east', name: '동양윤리', color: '#f59e0b' },
  { id: 'korea', name: '한국윤리', color: '#ec4899' },
  { id: 'politics', name: '정치/사회사상', color: '#8b5cf6' },
  { id: 'pedagogy', name: '교과교육론', color: '#14b8a6' },
];

// Motivational Quotes for Exam Preparation
const MOTIVATIONAL_QUOTES = [
  "꾸준함이 비범함을 만든다. 오늘의 1분이 합격을 끌어당깁니다.",
  "합격의 순간을 떠올리며, 오늘 주어진 시간에 최선을 다하세요.",
  "흔들리지 않고 피는 꽃은 없다. 지금의 피로함은 결실의 과정입니다.",
  "합격자 명단에 당신의 이름이 들어갈 자리가 만들어지고 있습니다.",
  "슬럼프는 올 수 있지만, 멈추지 않는 한 합격은 당신의 것입니다."
];

// Default D-Day (2027년 11월 20일 토요일 임용고시 예상일)
const DEFAULT_EXAM_DATE = '2027-11-20T09:00:00';

export default function App() {
  // --- Persistent States ---
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('study_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [studyLogs, setStudyLogs] = useState(() => {
    const saved = localStorage.getItem('study_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyTargetHours, setDailyTargetHours] = useState(() => {
    const saved = localStorage.getItem('study_target_hours');
    return saved ? Number(saved) : 8;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('study_dark_mode');
    return saved ? JSON.parse(saved) : true;
  });

  const [targetExamDate, setTargetExamDate] = useState(() => {
    const saved = localStorage.getItem('study_exam_date');
    return saved || DEFAULT_EXAM_DATE;
  });

  // --- Timer States ---
  const [selectedCategoryId, setSelectedCategoryId] = useState(DEFAULT_CATEGORIES[0].id);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // --- D-Day Countdown State ---
  const [dDayTimeLeft, setDDayTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isSettingDday, setIsSettingDday] = useState(false);

  // --- UI States ---
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#64748b');
  const [editingLogId, setEditingLogId] = useState(null);
  const [editMinutes, setEditMinutes] = useState('');
  const [randomQuote, setRandomQuote] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState(getTodayString());

  // Ref for timer interval
  const timerRef = useRef(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('study_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('study_logs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem('study_target_hours', dailyTargetHours.toString());
  }, [dailyTargetHours]);

  useEffect(() => {
    localStorage.setItem('study_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('study_exam_date', targetExamDate);
  }, [targetExamDate]);

  // Set initial random quote
  useEffect(() => {
    const quoteIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setRandomQuote(MOTIVATIONAL_QUOTES[quoteIndex]);
  }, []);

  // Timer Interval Handler
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // D-Day Countdown Calculation Loop
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const examTime = new Date(targetExamDate).getTime();
      const difference = examTime - now;

      if (difference > 0) {
        setDDayTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setDDayTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetExamDate]);

  // Utility: Date to String (YYYY-MM-DD)
  function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Timer Actions
  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
  };

  const handleSaveSession = () => {
    if (secondsElapsed === 0) return;

    const now = new Date();
    const hour = now.getHours();
    const category = categories.find(c => c.id === selectedCategoryId) || categories[0];

    const newLog = {
      id: Date.now(),
      date: getTodayString(),
      timestamp: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      hourOfDay: hour, // Used for time pattern analysis
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color,
      durationSeconds: secondsElapsed,
    };

    setStudyLogs(prev => [newLog, ...prev]);
    setIsRunning(false);
    setSecondsElapsed(0);
  };

  // Add Custom Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCat = {
      id: 'custom_' + Date.now(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };

    setCategories(prev => [...prev, newCat]);
    setNewCategoryName('');
  };

  // Log Edit / Delete
  const handleDeleteLog = (id) => {
    setStudyLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleStartEditLog = (log) => {
    setEditingLogId(log.id);
    setEditMinutes(Math.round(log.durationSeconds / 60));
  };

  const handleSaveEditLog = (id) => {
    const mins = parseInt(editMinutes, 10);
    if (isNaN(mins) || mins <= 0) {
      handleDeleteLog(id);
    } else {
      setStudyLogs(prev => prev.map(log => 
        log.id === id ? { ...log, durationSeconds: mins * 60 } : log
      ));
    }
    setEditingLogId(null);
  };

  // Format Helper: Seconds to HH:MM:SS
  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format Helper: Seconds to Hours and Minutes text
  const formatTimeText = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hrs === 0) return `${mins}분`;
    return `${hrs}시간 ${mins}분`;
  };

  // Filtered Logs for selected date
  const filteredLogs = studyLogs.filter(log => log.date === selectedDateFilter);

  // Calculated Stats
  const totalSecondsToday = filteredLogs.reduce((acc, log) => acc + log.durationSeconds, 0);
  const targetSeconds = dailyTargetHours * 3600;
  const progressPercent = Math.min(Math.round((totalSecondsToday / targetSeconds) * 100), 100);

  // Grouping by Category for Chart
  const categoryStatsMap = {};
  filteredLogs.forEach(log => {
    if (!categoryStatsMap[log.categoryName]) {
      categoryStatsMap[log.categoryName] = {
        name: log.categoryName,
        seconds: 0,
        color: log.categoryColor || '#94a3b8'
      };
    }
    categoryStatsMap[log.categoryName].seconds += log.durationSeconds;
  });

  const chartData = Object.values(categoryStatsMap).map(item => ({
    name: item.name,
    value: Math.round((item.seconds / 3600) * 10) / 10,
    minutes: Math.round(item.seconds / 60),
    color: item.color
  }));

  // Time Period Pattern Analysis (Morning, Afternoon, Evening, Night)
  const timePeriodData = [
    { key: 'morning', name: '아침 (06-12시)', icon: Sunrise, color: '#f59e0b', seconds: 0 },
    { key: 'afternoon', name: '오후 (12-18시)', icon: SunMedium, color: '#3b82f6', seconds: 0 },
    { key: 'evening', name: '저녁 (18-24시)', icon: Sunset, color: '#8b5cf6', seconds: 0 },
    { key: 'night', name: '야간 (00-06시)', icon: MoonStar, color: '#ec4899', seconds: 0 },
  ];

  filteredLogs.forEach(log => {
    const h = log.hourOfDay !== undefined ? log.hourOfDay : 12; // default fallback
    if (h >= 6 && h < 12) timePeriodData[0].seconds += log.durationSeconds;
    else if (h >= 12 && h < 18) timePeriodData[1].seconds += log.durationSeconds;
    else if (h >= 18 && h < 24) timePeriodData[2].seconds += log.durationSeconds;
    else timePeriodData[3].seconds += log.durationSeconds;
  });

  const patternChartData = timePeriodData.map(p => ({
    name: p.name,
    minutes: Math.round(p.seconds / 60),
    fill: p.color
  }));

  // Determine Dominant Pattern
  const maxPeriod = [...timePeriodData].sort((a, b) => b.seconds - a.seconds)[0];
  let patternFeedback = "공부 기록을 남기면 몰입 패턴을 분석해 드립니다.";
  if (maxPeriod && maxPeriod.seconds > 0) {
    if (maxPeriod.key === 'morning') patternFeedback = "🌅 상쾌한 아침 몰입형! 상반기 시험시간에 두뇌가 최적화되어 있습니다.";
    else if (maxPeriod.key === 'afternoon') patternFeedback = "☀️ 안정적인 오후 집중형! 오후 전공 시험 인출에 집중해보세요.";
    else if (maxPeriod.key === 'evening') patternFeedback = "🌆 차분한 저녁 몰입형! 퇴근/방과 후 연속 몰입도가 매우 뛰어납니다.";
    else patternFeedback = "🌙 열정적인 야간 심야형! 수면 패턴 조절에 신경 써주세요.";
  }

  // Streak Calculation
  const uniqueDatesWithStudy = Array.from(new Set(studyLogs.map(l => l.date))).sort().reverse();
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < 30; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (uniqueDatesWithStudy.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (i === 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  const activeCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* 🌟 TOP BANNER: D-Day Countdown Header */}
      <div className={`border-b px-4 sm:px-8 py-3 bg-gradient-to-r ${darkMode ? 'from-indigo-950 via-slate-900 to-purple-950 border-slate-800' : 'from-indigo-600 via-indigo-700 to-purple-700 border-indigo-800 text-white'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-80">2028학년도 교원임용시험 D-DAY</span>
                <button 
                  onClick={() => setIsSettingDday(!isSettingDday)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  날짜 변경
                </button>
              </div>
              {isSettingDday ? (
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="date"
                    value={targetExamDate.split('T')[0]}
                    onChange={(e) => {
                      setTargetExamDate(`${e.target.value}T09:00:00`);
                      setIsSettingDday(false);
                    }}
                    className="text-xs px-2 py-1 rounded bg-slate-800 text-white border border-slate-600 outline-none"
                  />
                  <button onClick={() => setIsSettingDday(false)} className="text-xs opacity-70 hover:opacity-100">취소</button>
                </div>
              ) : (
                <p className="text-xs opacity-90">목표일: {new Date(targetExamDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</p>
              )}
            </div>
          </div>

          {/* D-Day Counter Box */}
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10">
            <div className="text-center">
              <span className="text-2xl font-black font-mono tracking-tight text-amber-300">D-{dDayTimeLeft.days}</span>
              <span className="text-[10px] block opacity-80">DAYS</span>
            </div>
            <span className="text-xl font-light opacity-40">:</span>
            <div className="text-center font-mono">
              <span className="text-sm font-bold block">{String(dDayTimeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[9px] block opacity-70">시</span>
            </div>
            <span className="text-xs opacity-40">:</span>
            <div className="text-center font-mono">
              <span className="text-sm font-bold block">{String(dDayTimeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] block opacity-70">분</span>
            </div>
            <span className="text-xs opacity-40">:</span>
            <div className="text-center font-mono">
              <span className="text-sm font-bold block">{String(dDayTimeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] block opacity-70">초</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Navigation Header */}
      <header className={`border-b px-6 py-4 flex items-center justify-between ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              임용 Pass 스터디 타이머
            </h1>
            <p className="text-xs text-slate-400">합격을 위한 최적의 학습 패턴 분석기</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`hidden sm:flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <Flame className="w-4 h-4 mr-1 fill-amber-400 text-amber-500" />
            연속 학습 {streak}일째
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            title="테마 변경"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Stopwatch Timer & Subject Picker */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Daily Quote Card */}
          <div className={`p-4 rounded-2xl border text-sm italic flex items-center justify-between ${darkMode ? 'bg-slate-900/60 border-slate-800/80 text-slate-300' : 'bg-indigo-50/60 border-indigo-100 text-indigo-900'}`}>
            <span className="truncate mr-2">💬 "{randomQuote}"</span>
            <button 
              onClick={() => setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])}
              className="text-xs shrink-0 underline opacity-70 hover:opacity-100"
            >
              새 명언
            </button>
          </div>

          {/* Main Timer Display Box */}
          <div className={`relative p-8 rounded-3xl border text-center shadow-xl transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 shadow-indigo-950/10' : 'bg-white border-slate-100 shadow-slate-200/50'
          }`}>
            {/* Subject Selector Header */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">현재 선택 과목:</span>
              <span 
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm transition-all"
                style={{ backgroundColor: activeCategory.color }}
              >
                {activeCategory.name}
              </span>
            </div>

            {/* Main Clock */}
            <div className="my-6">
              <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight drop-shadow-sm">
                {formatTime(secondsElapsed)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {isRunning ? '⏱️ 집중해서 스터디 진행 중...' : secondsElapsed > 0 ? '⏸️ 일시정지 됨' : '준비되면 타이머 시작을 누르세요'}
              </p>
            </div>

            {/* Controller Buttons */}
            <div className="flex justify-center items-center gap-4 mt-8">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>타이머 시작</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-lg shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>일시정지</span>
                </button>
              )}

              <button
                onClick={handleSaveSession}
                disabled={secondsElapsed === 0}
                className={`flex items-center space-x-2 px-6 py-4 rounded-2xl font-semibold text-lg transition-all transform active:scale-95 ${
                  secondsElapsed > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                <span>기록 저장</span>
              </button>

              <button
                onClick={handleReset}
                disabled={secondsElapsed === 0 && !isRunning}
                className={`p-4 rounded-2xl border transition-all ${
                  darkMode 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                }`}
                title="리셋"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subject Categories Selection Grid */}
          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                공부 과목 선택
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium border transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/10 text-indigo-400 font-bold'
                        : darkMode
                        ? 'border-slate-800 hover:bg-slate-800/60 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Subject Form */}
            <form onSubmit={handleAddCategory} className="mt-5 pt-4 border-t border-slate-800/50 flex items-center gap-2">
              <input
                type="text"
                placeholder="새 과목 추가 (예: 교육철학)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none transition-colors ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                }`}
              />
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                title="과목 색상 지정"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
                title="과목 추가"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Pattern Analysis & Analytics Dashboard */}
        <div className="lg:col-span-5 space-y-6">

          {/* Date Picker & Target Tracker */}
          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <input
                  type="date"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className={`text-sm font-semibold rounded-lg px-2 py-1 outline-none ${
                    darkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800'
                  }`}
                />
              </div>
              
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>목표:</span>
                <select
                  value={dailyTargetHours}
                  onChange={(e) => setDailyTargetHours(Number(e.target.value))}
                  className={`rounded px-1.5 py-0.5 text-xs outline-none ${
                    darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {[4, 6, 8, 10, 12, 14].map(h => (
                    <option key={h} value={h}>{h}시간</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total Time & Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-xs text-slate-400">오늘 총 학습 시간</p>
                  <p className="text-2xl font-black tracking-tight text-indigo-500">
                    {formatTimeText(totalSecondsToday)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">목표 달성률</p>
                  <p className="text-lg font-bold text-emerald-500">{progressPercent}%</p>
                </div>
              </div>

              <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 📊 FEATURE 2: Time Period Pattern Analysis Report */}
          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                시간대별 공부 몰입 리포트
              </h3>
            </div>

            {/* AI Pattern Feedback Badge */}
            <div className={`p-3 rounded-2xl mb-4 text-xs font-medium border ${darkMode ? 'bg-purple-950/40 border-purple-800/50 text-purple-200' : 'bg-purple-50 border-purple-100 text-purple-900'}`}>
              {patternFeedback}
            </div>

            {/* Time Period Bar Chart */}
            <div className="h-40 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patternChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value) => [`${value}분`, '학습 시간']}
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#0f172a' : '#fff',
                      borderColor: darkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                    {patternChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Distribution Breakdown */}
          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              과목별 집계 통계
            </h3>

            {chartData.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                저장된 학습 기록이 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {chartData.map((item) => {
                  const percentage = Math.round((item.minutes / (totalSecondsToday / 60)) * 100) || 0;
                  return (
                    <div key={item.name} className="text-xs">
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </span>
                        <span>{item.minutes}분 ({percentage}%)</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Session Logs List */}
          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-indigo-500" />
              상세 타임 로그 ({filteredLogs.length}건)
            </h3>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">해당 날짜의 학습 기록이 없습니다.</p>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                      darkMode ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: log.categoryColor }} />
                      <div>
                        <p className="font-semibold text-slate-200">{log.categoryName}</p>
                        <p className="text-[10px] text-slate-500">{log.timestamp}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingLogId === log.id ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={editMinutes}
                            onChange={(e) => setEditMinutes(e.target.value)}
                            className="w-12 px-1 py-0.5 text-center text-xs rounded border border-indigo-500 bg-slate-900 text-slate-100"
                            placeholder="분"
                          />
                          <span className="text-[10px]">분</span>
                          <button
                            onClick={() => handleSaveEditLog(log.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingLogId(null)}
                            className="p-1 text-slate-400 hover:text-slate-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-mono font-bold text-indigo-400">
                            {formatTimeText(log.durationSeconds)}
                          </span>
                          <button
                            onClick={() => handleStartEditLog(log)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                            title="수정"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                            title="삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}