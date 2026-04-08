'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, RadialLinearScale } from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import { 
  LayoutDashboard, TrendingUp, Sparkles, ShoppingBag, Plus, Scale, Settings, 
  UserCircle, Trash2, Edit2, CheckCircle2, Send, ShieldAlert, Maximize2, 
  Minimize2, Sun, Moon, Lock, Zap, Droplets 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mealLibrary } from '@/data/mealLibrary';
import { Pricing } from './Pricing';
import { MedicalDisclaimer } from './MedicalDisclaimer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, RadialLinearScale);

interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  goalType: string;
  targetWeight: number;
  dailyCalories: number;
  dailyWaterGoal: number;
  subscriptionStatus?: string;
  ldlLevel      ?: string;
  glucoseLevel  ?: string;
  bloodPressure ?: string;
  medications   ?: string;
  healthConditions ?: string;
}

interface PantryItem {
    id: string;
    name: string;
}

interface DietLog {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: string;
}

interface WeightLog {
  id: string;
  weight: number;
  date: string;
}

interface LoggableMeal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
}

interface ShoppingListItem {
    item: string;
    amount: string;
    category: string;
}

interface DietPlanArchive {
    id: string;
    planText: string;
    isFavorite: boolean;
    date: string;
}

export default function Dashboard({ user: initialUser, onBack }: { user: User, onBack: () => void }) {
  const [user, setUser] = useState<User>(initialUser);
  const [logs, setLogs] = useState<DietLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [waterAmount, setWaterAmount] = useState(0);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [planHistory, setPlanHistory] = useState<DietPlanArchive[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogForm, setShowLogForm] = useState(false);
  const [showEditLogForm, setShowEditLogForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showPantryForm, setShowPantryForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editingLog, setEditingLog] = useState<DietLog | null>(null);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [activeConfig, setActiveConfig] = useState({ activeProvider: 'gemini', activeModel: 'gemini-1.5-flash-latest' });
  const [availableModels, setAvailableModels] = useState<{provider: string, id: string, name: string}[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showPricing, setShowPricing] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [isElite, setIsElite] = useState(initialUser.subscriptionStatus === 'active');
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
  const [parsedMeals, setParsedMeals] = useState<Record<number, LoggableMeal[]>>({});
  const [parsedShoppingLists, setParsedShoppingLists] = useState<Record<number, ShoppingListItem[]>>({});
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loggingStatus, setLoggingStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    foodName: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'Breakfast'
  });
  
  const [pantryItemName, setPantryItemName] = useState('');

  const [weightFormData, setWeightFormData] = useState({
    weight: user.weight
  });

  const [profileFormData, setProfileFormData] = useState({
      ...user,
      ldlLevel: user.ldlLevel || '',
      glucoseLevel: user.glucoseLevel || '',
      bloodPressure: user.bloodPressure || '',
      medications: user.medications || '',
      healthConditions: user.healthConditions || ''
  });

  const fetchLogs = useCallback(async () => {
    const res = await fetch(`/api/logs?userId=${user.id}`);
    const data = await res.json();
    setLogs(data || []);
  }, [user.id]);

  const fetchWeightLogs = useCallback(async () => {
    const res = await fetch(`/api/weight?userId=${user.id}`);
    const data = await res.json();
    setWeightLogs(data || []);
  }, [user.id]);

  const fetchPantry = useCallback(async () => {
    const res = await fetch(`/api/pantry?userId=${user.id}`);
    const data = await res.json();
    setPantry(data || []);
  }, [user.id]);

  const fetchPlanHistory = useCallback(async () => {
    const res = await fetch(`/api/ai/history?userId=${user.id}`);
    const data = await res.json();
    setPlanHistory(data || []);
  }, [user.id]);

  useEffect(() => {
    fetchLogs();
    fetchWeightLogs();
    fetchPantry();
    fetchPlanHistory();
    
    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/config');
            const data = await res.json();
            setActiveConfig(data);
        } catch (error) {}
    };

    const fetchModels = async () => {
        try {
            const res = await fetch('/api/admin/models');
            const data = await res.json();
            if (data.models) setAvailableModels(data.models);
        } catch (error) {}
    };

    fetchConfig();
    fetchModels();
  }, [fetchLogs, fetchWeightLogs, fetchPantry]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.classList.toggle('light-mode', newTheme === 'light');
  };

  const handleUpgrade = async (plan: string) => {
    setIsElite(true);
    setShowPricing(false);
    alert(`Welcome to the Elite Clinical Tier! Your premium features are now unlocked.`);
  };

  const handleTabChange = (tabId: string) => {
    if ((tabId === 'diet-plans' || tabId === 'pantry') && !isElite) {
      setShowPricing(true);
      return;
    }
    setActiveTab(tabId);
  };

  const handleAddWater = async (amount: number) => {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          foodName: 'Water Hydration', 
          calories: 0, 
          protein: 0, 
          carbs: 0, 
          fat: 0, 
          mealType: 'Snack', 
          userId: user.id 
      }),
    });

    if (res.ok) {
      setWaterAmount(prev => prev + amount);
      setLoggingStatus('Liquid Fuel Online! 💧');
      setTimeout(() => setLoggingStatus(null), 3000);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, userId: user.id }),
    });
    if (res.ok) {
      fetchLogs();
      setShowLogForm(false);
      setFormData({ foodName: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'Breakfast' });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileFormData),
      });
      if (res.ok) {
          const updated = await res.json();
          setUser(updated);
          setShowProfileEdit(false);
          setLoggingStatus('Profile Re-Virtualized! 🧬');
          setTimeout(() => setLoggingStatus(null), 3000);
      }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...weightFormData, userId: user.id }),
    });
    if (res.ok) {
      fetchWeightLogs();
      setShowWeightForm(false);
    }
  };

  const handleAddPantry = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/pantry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pantryItemName, userId: user.id }),
    });
    if (res.ok) {
      fetchPantry();
      setShowPantryForm(false);
      setPantryItemName('');
    }
  };

  const deletePantryItem = async (id: string) => {
    await fetch(`/api/pantry?id=${id}`, { method: 'DELETE' });
    fetchPantry();
  };

  const sendChatMessage = async (text?: string) => {
    const messageToSend = text || chatInput;
    if (!messageToSend.trim()) return;

    const newUserMessage = { role: 'user' as const, parts: [{ text: messageToSend }] };
    const updatedHistory = [...chatMessages, newUserMessage];
    
    setChatMessages(updatedHistory);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, messages: updatedHistory }),
      });
      const data = await res.json();
      if (data.reply) {
        const fullContent = data.reply;
        const mealMatch = fullContent.match(/<MEALS_JSON>([\s\S]*?)<\/MEALS_JSON>/);
        const shopMatch = fullContent.match(/<SHOPPING_LIST_JSON>([\s\S]*?)<\/SHOPPING_LIST_JSON>/);
        const cleanContent = fullContent.replace(/<MEALS_JSON>[\s\S]*?<\/MEALS_JSON>/, '').replace(/<SHOPPING_LIST_JSON>[\s\S]*?<\/SHOPPING_LIST_JSON>/, '').trim();
        
        if (mealMatch) {
            try {
                const meals = JSON.parse(mealMatch[1]);
                setParsedMeals(prev => ({ ...prev, [updatedHistory.length]: meals }));
            } catch (err) {}
        }

        if (shopMatch) {
            try {
                const items = JSON.parse(shopMatch[1]);
                setParsedShoppingLists(prev => ({ ...prev, [updatedHistory.length]: items }));
            } catch (err) {}
        }
        
        setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: cleanContent }] }]);
        
        // Save to History
        await fetch('/api/ai/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, planText: cleanContent })
        });
        fetchPlanHistory();
      } else {
        setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: `### ⚠️ AI Error\n${data.error || "Failed to respond."}` }] }]);
      }
    } catch (e) {
      setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: "### ⚠️ Connectivity Error" }] }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleFavoritePlan = async (id: string, current: boolean) => {
      await fetch('/api/ai/history', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isFavorite: !current })
      });
      fetchPlanHistory();
  };

  const logAiSuggestion = async (msgIndex: number) => {
    const meals = parsedMeals[msgIndex];
    if (!meals) return;

    setLoggingStatus('Synchronizing your diet...');
    for (const meal of meals) {
        await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...meal, name: meal.name, userId: user.id }),
        });
    }
    setLoggingStatus('Goal updated! 🥗');
    fetchLogs();
    setTimeout(() => setLoggingStatus(null), 3000);
  };

  const currentSafetyAccepted = safetyAccepted; // For closure safety

  const updateGlobalConfig = async (provider: string, model: string) => {
    try {
        const res = await fetch('/api/admin/config', {
            method: 'PATCH',
            body: JSON.stringify({ activeProvider: provider, activeModel: model }),
        });
        const data = await res.json();
        setActiveConfig(data);
    } catch (error) {}
  };

  const renderMarkdown = (text: string) => {
    const parts = text.split(/((\|.*\|\n)+)/);
    return parts.map((part, i) => {
      if (part.match(/\|.*\|/)) {
        const rows = part.trim().split('\n');
        return (
          <div key={i} className="table-container" style={{ overflowX: 'auto', margin: '1rem 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(255,255,255,0.1)' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {rows[0].split('|').filter(c => c.trim()).map((cell, j) => (
                    <th key={j} style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>{cell.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(2).map((row, j) => (
                  <tr key={j}>
                    {row.split('|').filter(c => c.trim()).map((cell, k) => (
                      <td key={k} style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      const lines = part.split('\n');
      return lines.map((line, j) => {
          if (line.startsWith('## ')) return <h2 key={`${i}-${j}`} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>{line.replace('## ', '')}</h2>;
          if (line.startsWith('### ')) return <h3 key={`${i}-${j}`} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{line.replace('### ', '')}</h3>;
          return <p key={`${i}-${j}`} style={{ marginBottom: '0.5rem' }}>{line}</p>;
      });
    });
  };

  const caloriesConsumed = logs.reduce((sum, log) => sum + log.calories, 0);
  const proteinConsumed = logs.reduce((sum, log) => sum + log.protein, 0);
  const carbsConsumed = logs.reduce((sum, log) => sum + log.carbs, 0);
  const fatConsumed = logs.reduce((sum, log) => sum + log.fat, 0);
  const caloriesRemaining = user.dailyCalories - caloriesConsumed;
  const progressPercent = Math.min((caloriesConsumed / user.dailyCalories) * 100, 100);

  const chartData = {
    labels: weightLogs.map((log: WeightLog) => new Date(log.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightLogs.map((log: WeightLog) => log.weight),
        borderColor: '#2dd4bf',
        backgroundColor: 'rgba(45, 212, 191, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className={`dashboard-container premium-container ${theme === 'light' ? 'light-mode' : ''}`}>
      {/* Top Header Section */}
      <header className="main-header glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="avatar">
              <UserCircle size={40} color="var(--primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem' }}>Master {user.name}</h1>
              <p className="status-badge" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Phase: {user.goalType === 'Weight Loss' ? 'Cutting' : user.goalType === 'Muscle Gain' ? 'Bulking' : 'Performance'}</p>
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
             {!isElite && (
                 <button className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--secondary)' }} onClick={() => setShowPricing(true)}>
                    <Zap size={16} /> GO ELITE
                 </button>
             )}
             <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={toggleTheme}>
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setShowProfileEdit(true)}>
               <Settings size={20} />
             </button>
             <button className="btn-secondary" onClick={onBack}>Sign Out</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-tabs">
        <div className="tabs-list glass-card" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: '1rem' }}>
            {[
                { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Stats' },
                { id: 'trends', icon: <TrendingUp size={20} />, label: 'Trends' },
                { id: 'diet-plans', icon: <Sparkles size={20} />, label: 'AI Coach' },
                { id: 'pantry', icon: <ShoppingBag size={20} />, label: 'Pantry' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => handleTabChange(tab.id)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem', fontWeight: 600, color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                        background: activeTab === tab.id ? 'var(--surface-raised)' : 'transparent', transition: '0.3s',
                        position: 'relative'
                    }}
                >
                    {tab.icon} <span>{tab.label}</span>
                    {(tab.id === 'diet-plans' || tab.id === 'pantry') && !isElite && (
                        <Lock size={12} style={{ marginLeft: '4px', opacity: 0.5 }} />
                    )}
                </button>
            ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid">
              <div className="grid grid-cols-2">
                {/* Fuel & Hydration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card main-stat">
                        <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Fuel Status</h3>
                            <span className="value" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{caloriesConsumed} / {user.dailyCalories}</span>
                        </div>
                        <div className="progress-bar-container" style={{ background: 'var(--surface-raised)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                            <div className="progress-bar" style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary)' }}></div>
                        </div>
                        <div className="macros-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>PRO</div>
                                <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{proteinConsumed}g</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>CARB</div>
                                <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{carbsConsumed}g</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>FAT</div>
                                <div style={{ fontWeight: 'bold' }}>{fatConsumed}g</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setEditingLog(null); setShowLogForm(true); }}>
                             <Plus size={18} /> Log Fuel
                           </button>
                           <button className="btn-secondary" title="Log Weight" onClick={() => setShowWeightForm(true)}>
                             <Scale size={18} />
                           </button>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Hydration Lab</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                                    {waterAmount} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/ {user.dailyWaterGoal} ml</span>
                                </p>
                            </div>
                            <button className="btn-secondary" style={{ padding: '0.75rem', borderRadius: '50%', color: 'var(--accent)' }} onClick={() => handleAddWater(250)}>
                                <Droplets size={20} />
                            </button>
                        </div>
                        <div className="water-progress" style={{ background: 'rgba(192, 132, 252, 0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${Math.min((waterAmount / (user.dailyWaterGoal || 2000)) * 100, 100)}%`, 
                                height: '100%', 
                                background: 'var(--accent)',
                                transition: '0.5s ease'
                            }}></div>
                        </div>
                    </div>
                </div>

                {/* Radar Chart & Micronutrients */}
                <div className="glass-card" style={{ minHeight: '300px' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Clinical Balance</h3>
                    <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                        <Radar 
                            data={{
                                labels: ['Vitamin C', 'Iron', 'Calcium', 'Protein', 'Fiber', 'Vitamin D'],
                                datasets: [{
                                    label: 'Daily Balance',
                                    data: [80, 45, 60, 90, 30, 20],
                                    backgroundColor: 'rgba(192, 132, 252, 0.2)',
                                    borderColor: 'var(--accent)',
                                    pointBackgroundColor: 'var(--accent)',
                                }]
                            }}
                            options={{
                                scales: {
                                    r: {
                                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                                        grid: { color: 'rgba(255,255,255,0.1)' },
                                        pointLabels: { color: 'var(--text-secondary)', font: { size: 10 } },
                                        ticks: { display: false }
                                    }
                                },
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                </div>
              </div>

              {/* Daily Feed */}
              <div className="glass-card activity-log" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Daily Feed</h3>
                <div className="log-items" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {logs.length === 0 ? <p style={{ opacity: 0.5, textAlign: 'center' }}>No logs today.</p> : logs.map(log => (
                    <div key={log.id} className="log-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{log.foodName}</h4>
                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{log.calories} kcal • {log.mealType}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setEditingLog(log); setShowEditLogForm(true); }}><Edit2 size={14} /></button>
                        <button onClick={() => { if(confirm('Delete?')) fetch(`/api/logs?id=${log.id}`, {method: 'DELETE'}).then(() => fetchLogs())}} style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div key="trends" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card chart-card">
                <h2>Progress Report</h2>
                <div style={{ height: '300px' }}>
                    <Line data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'diet-plans' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`ai-layout ${isAiExpanded ? 'expanded' : ''}`}>
              {!safetyAccepted ? (
                  <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                      <ShieldAlert size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                      <h2 style={{ marginBottom: '1rem' }}>Clinical Safety Check</h2>
                      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                          By enabling the AI Coach, you acknowledge that all generated diet plans are for educational purposes and NOT medical prescriptions.
                      </p>
                      <button className="btn-primary" onClick={() => setSafetyAccepted(true)}>
                          I AGREE & UNLOCK COACH
                      </button>
                  </div>
              ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Elite Templates Library */}
                    <div className="templates-library">
                        <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>Elite Philosophy Library</h3>
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                            {[
                                { name: 'Mediterranean', desc: 'Healthy fats & greens. (Clinical Gold Standard)', prompt: 'Create a Mediterranean diet plan focusing on olive oil, fresh veggies, and lean fish.' },
                                { name: 'Keto Protocol', desc: 'High-fat, low-carb metabolic shift.', prompt: 'Create a strict Keto diet plan for metabolic optimization.' },
                                { name: 'DASH Clinical', desc: 'Low sodium, heart-healthy grains.', prompt: 'Create a DASH diet plan focused on reducing sodium and blood pressure.' },
                                { name: 'Muscle Fuel', desc: 'High protein for performance & growth.', prompt: 'Create a high-protein bulk diet plan for muscle hypertrophy.' }
                            ].map((diet, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => { setChatInput(diet.prompt); sendChatMessage(diet.prompt); }}
                                    className="glass-card" 
                                    style={{ minWidth: '220px', padding: '1rem', textAlign: 'left', cursor: 'grab' }}
                                >
                                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{diet.name}</h4>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{diet.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <section className="glass-card ai-coach-container" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                            <div className="ai-controls" style={{ display: 'flex', gap: '0.5rem' }}>
                                <select value={activeConfig.activeProvider} onChange={(e) => updateGlobalConfig(e.target.value, activeConfig.activeModel)} style={{ width: 'auto', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>
                                    <option value="gemini">Gemini</option>
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Claude</option>
                                </select>
                                <select value={activeConfig.activeModel} onChange={(e) => updateGlobalConfig(activeConfig.activeProvider, e.target.value)} style={{ width: 'auto', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                                    {availableModels.filter(m => m.provider === activeConfig.activeProvider).map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div ref={scrollRef} className="chat-history" style={{ flex: 1, overflowY: 'auto' }}>
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`message ${msg.role}`} style={{ marginBottom: '1rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    <div className="bubble" style={{ display: 'inline-block', padding: '0.75rem 1rem', borderRadius: '1rem', background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-raised)', color: msg.role === 'user' ? 'white' : 'inherit' }}>
                                        {msg.role === 'model' ? (
                                            <div>
                                                {renderMarkdown(msg.parts[0].text)}
                                                {parsedMeals[i] && (
                                                    <button onClick={() => logAiSuggestion(i)} className="btn-primary" style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                                        <Plus size={14} /> Log this Day
                                                    </button>
                                                )}

                                                {/* Clinical Shopping List */}
                                                {parsedShoppingLists[i] && (
                                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <ShoppingBag size={16} /> Clinical Commissary
                                                        </h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            {parsedShoppingLists[i].map((item, j) => (
                                                                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                                                                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                                                                    <span style={{ opacity: 0.9 }}>{item.item}</span>
                                                                    <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>— {item.amount} ({item.category})</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : msg.parts[0].text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="chat-input" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input placeholder="Ask coach..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} />
                                <button className="btn-primary" onClick={() => sendChatMessage()} disabled={isAiLoading}><Send size={18} /></button>
                            </div>
                        </div>
                    </section>

                    {/* Plan History Gallery */}
                    <div className="history-section">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} color="var(--primary)" /> Prescription History
                        </h3>
                        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                            {planHistory.map((plan, i) => (
                                <div key={i} className={`glass-card ${plan.isFavorite ? 'favorite-plan' : ''}`} style={{ padding: '1rem', fontSize: '0.85rem', position: 'relative', border: plan.isFavorite ? '1px solid var(--primary)' : '1px solid transparent' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', opacity: 0.6 }}>
                                        <span>{new Date(plan.date).toLocaleDateString()}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => toggleFavoritePlan(plan.id, plan.isFavorite)} style={{ color: plan.isFavorite ? 'var(--primary)' : 'inherit' }}>
                                                <Sparkles size={14} fill={plan.isFavorite ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', borderLeft: '2px solid var(--primary)', paddingLeft: '0.75rem' }}>
                                        {renderMarkdown(plan.planText.substring(0, 300) + '...')}
                                    </div>
                                    <button 
                                        onClick={() => setChatMessages([
                                            { role: 'user', parts: [{ text: "Re-examining clinical plan from " + new Date(plan.date).toLocaleDateString() + ":" }] },
                                            { role: 'model', parts: [{ text: plan.planText }] }
                                        ])}
                                        style={{ marginTop: '1rem', width: '100%', padding: '0.4rem', borderRadius: '0.5rem', background: 'var(--surface-raised)', fontSize: '0.75rem' }}
                                    >
                                        Re-load Full Plan
                                    </button>
                                </div>
                            ))}
                            {planHistory.length === 0 && <p style={{ opacity: 0.5 }}>No plans archived yet.</p>}
                        </div>
                    </div>
                  </div>
              )}
            </motion.div>
          )}

          {activeTab === 'pantry' && (
              <motion.div key="pantry" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card">
                  <div className="pantry-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <h2>Pantry</h2>
                      <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={() => setShowPantryForm(true)}><Plus size={20} /></button>
                  </div>
                  <div className="grid grid-cols-3">
                      {pantry.map(item => (
                          <div key={item.id} className="pantry-item" style={{ background: 'var(--surface-raised)', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                              <button onClick={() => deletePantryItem(item.id)} style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                          </div>
                      ))}
                  </div>
              </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Pricing Modal */}
      {showSafety && (
          <MedicalDisclaimer onAccept={() => { setSafetyAccepted(true); setShowSafety(false); setActiveTab(activeTab === 'dashboard' ? 'diet-plans' : activeTab); }} />
      )}

      {showPricing && (
          <Pricing onUpgrade={handleUpgrade} onClose={() => setShowPricing(false)} />
      )}

      {/* Global Modals */}
      {showLogForm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card modal" style={{ width: '90%', maxWidth: '400px' }}>
            <h2>New Entry</h2>
            <form onSubmit={handleAddLog} className="grid" style={{ marginTop: '1rem' }}>
              <input placeholder="Food Name" value={formData.foodName} onChange={e => setFormData({ ...formData, foodName: e.target.value })} required />
              <input placeholder="Calories" type="number" value={formData.calories} onChange={e => setFormData({ ...formData, calories: e.target.value })} required />
              <button type="submit" className="btn-primary">Save Entry</button>
              <button type="button" className="btn-secondary" onClick={() => setShowLogForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showProfileEdit && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card modal" style={{ width: '95%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <form onSubmit={handleUpdateProfile} className="grid grid-cols-2" style={{ marginTop: '1.5rem', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Full Name</label>
                    <input placeholder="Name" value={profileFormData.name} onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })} />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Age</label>
                    <input type="number" value={profileFormData.age} onChange={e => setProfileFormData({ ...profileFormData, age: parseInt(e.target.value) })} />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Weight (kg)</label>
                    <input type="number" step="0.1" value={profileFormData.weight} onChange={e => setProfileFormData({ ...profileFormData, weight: parseFloat(e.target.value) })} />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Height (cm)</label>
                    <input type="number" value={profileFormData.height} onChange={e => setProfileFormData({ ...profileFormData, height: parseFloat(e.target.value) })} />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Activity Level</label>
                    <select value={profileFormData.activityLevel} onChange={e => setProfileFormData({ ...profileFormData, activityLevel: e.target.value })}>
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Lightly Active</option>
                        <option value="moderate">Moderate</option>
                        <option value="very">Very Active</option>
                    </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}> <hr style={{ opacity: 0.1, margin: '1rem 0' }} /> <h4 style={{ color: 'var(--primary)' }}>Clinical Bio-Markers</h4> </div>
                <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>LDL Level</label>
                    <input value={profileFormData.ldlLevel} onChange={e => setProfileFormData({ ...profileFormData, ldlLevel: e.target.value })} />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Glucose Level (mg/dL)</label>
                    <input value={profileFormData.glucoseLevel} onChange={e => setProfileFormData({ ...profileFormData, glucoseLevel: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Medications / Conditions</label>
                    <input value={profileFormData.medications} onChange={e => setProfileFormData({ ...profileFormData, medications: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Update Profile</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowProfileEdit(false)}>Cancel</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {showPantryForm && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card modal" style={{ width: '90%', maxWidth: '400px' }}>
                <h2>Add Pantry Item</h2>
                <form onSubmit={handleAddPantry} className="grid" style={{ marginTop: '1rem' }}>
                <input placeholder="Item name" value={pantryItemName} onChange={e => setPantryItemName(e.target.value)} required />
                <button type="submit" className="btn-primary">Add Item</button>
                <button type="button" className="btn-secondary" onClick={() => setShowPantryForm(false)}>Cancel</button>
                </form>
            </div>
          </div>
      )}

      {showWeightForm && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card modal" style={{ width: '90%', maxWidth: '400px' }}>
                <h2>Update Weight</h2>
                <form onSubmit={handleAddWeight} className="grid" style={{ marginTop: '1rem' }}>
                  <input placeholder="Current Weight (kg)" type="number" step="0.1" value={weightFormData.weight} onChange={e => setWeightFormData({...weightFormData, weight: parseFloat(e.target.value)})} required />
                  <button type="submit" className="btn-primary">Save Weight</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowWeightForm(false)}>Cancel</button>
                </form>
            </div>
          </div>
      )}
    </div>
  );
}
