'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LayoutDashboard, TrendingUp, Sparkles, Plus, Send, CheckCircle2, ShoppingBag, Trash2, ShieldAlert, Settings, UserCircle, Scale, Edit2 } from 'lucide-react';
import { mealLibrary } from '@/data/mealLibrary';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
  ldlLevel      ?: number;
  glucoseLevel  ?: number;
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

export default function Dashboard({ user: initialUser, onBack }: { user: User, onBack: () => void }) {
  const [user, setUser] = useState<User>(initialUser);
  const [logs, setLogs] = useState<DietLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogForm, setShowLogForm] = useState(false);
  const [showEditLogForm, setShowEditLogForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showPantryForm, setShowPantryForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editingLog, setEditingLog] = useState<DietLog | null>(null);
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
  const [parsedMeals, setParsedMeals] = useState<Record<number, LoggableMeal[]>>({});
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
      ldlLevel: user.ldlLevel?.toString() || '',
      glucoseLevel: user.glucoseLevel?.toString() || '',
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

  useEffect(() => {
    fetchLogs();
    fetchWeightLogs();
    fetchPantry();
  }, [fetchLogs, fetchWeightLogs, fetchPantry]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

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

  const handleEditLog = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingLog) return;
      
      const res = await fetch('/api/logs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingLog),
      });
      
      if (res.ok) {
          fetchLogs();
          setShowEditLogForm(false);
          setEditingLog(null);
      }
  };

  const handleDeleteLog = async (id: string) => {
      if (!confirm('Are you sure you want to delete this log?')) return;
      
      const res = await fetch(`/api/logs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
          fetchLogs();
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
        const cleanContent = fullContent.replace(/<MEALS_JSON>[\s\S]*?<\/MEALS_JSON>/, '').trim();
        
        if (mealMatch) {
            try {
                const meals = JSON.parse(mealMatch[1]);
                setParsedMeals(prev => ({ ...prev, [updatedHistory.length]: meals }));
            } catch (err) {}
        }
        
        setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: cleanContent }] }]);
      } else {
        setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: `### ⚠️ AI Error\n${data.error || "Failed to respond."}` }] }]);
      }
    } catch (e) {
      setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: "### ⚠️ Connectivity Error" }] }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const logAiSuggestion = async (msgIndex: number) => {
    const meals = parsedMeals[msgIndex];
    if (!meals) return;

    setLoggingStatus('Synchronizing your diet...');
    for (const meal of meals) {
        await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...meal, foodName: meal.name, userId: user.id }),
        });
    }
    setLoggingStatus('Goal updated! 🥗');
    fetchLogs();
    setTimeout(() => setLoggingStatus(null), 3000);
  };

  const caloriesConsumed = logs.reduce((sum, log) => sum + log.calories, 0);
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
    <div className="premium-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Personalized NutriTrack</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Elite Dashboard for {user.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {(user.ldlLevel || user.medications) && (
              <div className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={16} /> Bio-Monitoring Active
              </div>
          )}
          <button className="btn-secondary" style={{ padding: '0.6rem' }} onClick={() => setShowProfileEdit(true)}><Settings size={20} /></button>
          <button className="btn-secondary" onClick={onBack}>Sign Out</button>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: 'var(--surface)', padding: '0.4rem', borderRadius: '1rem', width: 'fit-content' }}>
        {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Stats' },
            { id: 'trends', icon: <TrendingUp size={20} />, label: 'Trends' },
            { id: 'diet-plans', icon: <Sparkles size={20} />, label: 'AI Coach' },
            { id: 'pantry', icon: <ShoppingBag size={20} />, label: 'Pantry' }
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
                    borderRadius: '0.75rem', fontWeight: 600, color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: activeTab === tab.id ? 'var(--surface-raised)' : 'transparent', transition: '0.3s'
                }}
            >
                {tab.icon} {tab.label}
            </button>
        ))}
      </nav>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2">
          <section className="glass-card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Daily Calorie Progress</h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>CONSUMED</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{caloriesConsumed}</p>
              </div>
              <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '16px solid var(--surface-raised)' }}></div>
                <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '16px solid var(--primary)', clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent > 25 ? '150% -50%' : '50% -50%'}, ${progressPercent > 50 ? '150% 150%' : '50% 150%'}, ${progressPercent > 75 ? '-50% 150%' : '50% 150%'}, 50% 50%)`, transform: 'rotate(-90deg)' }}></div>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{caloriesRemaining}</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KCAL LEFT</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>TARGET</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{user.dailyCalories}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
              <button className="btn-primary" onClick={() => setShowLogForm(true)}><Plus size={20} /> Log Meal</button>
              <button className="btn-secondary" onClick={() => setShowWeightForm(true)}><Scale size={20} /> Update Weight</button>
            </div>
          </section>

          <section className="glass-card" style={{ gridColumn: 'span 2' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Daily Feed</h2>
            <div className="grid">
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Feed is empty. Start logging!</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)', padding: '1.25rem 1.5rem', borderRadius: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{log.foodName}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>{log.mealType} • P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)' }}>{log.calories} kcal</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-secondary" style={{ padding: '0.5rem', opacity: 0.6 }} onClick={() => { setEditingLog(log); setShowEditLogForm(true); }}><Edit2 size={16} /></button>
                            <button className="btn-secondary" style={{ padding: '0.5rem', opacity: 0.6, color: 'var(--error)' }} onClick={() => handleDeleteLog(log.id)}><Trash2 size={16} /></button>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'trends' && (
        <section className="glass-card">
          <h2 style={{ marginBottom: '2rem' }}>Progress Report</h2>
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </section>
      )}

      {activeTab === 'diet-plans' && (
        <div className="grid grid-cols-2">
          {/* Left Side: Interactive AI Coach */}
          <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '650px', background: 'rgba(30, 41, 59, 0.4)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={20} color="white" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>AI Sports Dietitian</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Personalized Goal Coaching</p>
                </div>
             </div>

             <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
                {chatMessages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '300px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome! Would you like a daily plan utilizing your specific pantry?</p>
                        <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => sendChatMessage("Create a daily plan based on my current pantry")}>Analyze My Pantry</button>
                    </div>
                ) : (
                    chatMessages.map((msg, i) => (
                        <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            <div style={{
                                padding: '1.25rem', borderRadius: '1rem',
                                background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-raised)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                borderTopLeftRadius: msg.role === 'model' ? '0' : '1rem',
                                borderTopRightRadius: msg.role === 'user' ? '0' : '1rem',
                                fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                            }}>
                                {msg.parts[0].text}
                            </div>
                            {msg.role === 'model' && parsedMeals[i] && (
                                <button
                                    onClick={() => logAiSuggestion(i)}
                                    className="btn-primary"
                                    style={{ marginTop: '0.75rem', width: '100%', background: 'var(--success)', fontSize: '0.8rem', padding: '0.5rem' }}
                                >
                                    <CheckCircle2 size={16} /> Log This AI Plan
                                </button>
                            )}
                        </div>
                    ))
                )}
                {isAiLoading && <div className="loader-dots">Coach is analyzing...</div>}
                {loggingStatus && <div style={{ alignSelf: 'center', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.9rem' }}>{loggingStatus}</div>}
             </div>

             <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input placeholder="Ask me anything..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} />
                <button className="btn-primary" onClick={() => sendChatMessage()} disabled={isAiLoading || !chatInput.trim()}><Send size={18} /></button>
             </div>
          </section>

          {/* Right Side: Quick History Library */}
          <section className="grid" style={{ alignContent: 'start' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Favorite Items</h2>
            <div className="grid">
                {mealLibrary.slice(0, 5).map((meal) => (
                    <div key={meal.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.95rem' }}>{meal.name}</h4>
                        <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={() => {
                            setFormData({ foodName: meal.name, calories: meal.calories.toString(), protein: meal.protein.toString(), carbs: meal.carbs.toString(), fat: meal.fat.toString(), mealType: meal.category });
                            setShowLogForm(true);
                        }}><Plus size={18} /></button>
                    </div>
                ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'pantry' && (
          <section className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2>My Digital Pantry (What I have in stock)</h2>
                  <button className="btn-primary" onClick={() => setShowPantryForm(true)}><Plus size={20} /> Add Item</button>
              </div>
              <div className="grid grid-cols-3">
                  {pantry.map(item => (
                      <div key={item.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <h4 style={{ fontSize: '1rem' }}>{item.name}</h4>
                          <button onClick={() => deletePantryItem(item.id)} style={{ color: 'var(--error)', opacity: 0.6 }}><Trash2 size={16} /></button>
                      </div>
                  ))}
                  {pantry.length === 0 && (
                      <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                          <ShoppingBag size={48} style={{ margin: '0 auto 1.5rem' }} />
                          <p>Your pantry is currently empty. Add items to see AI suggestions.</p>
                      </div>
                  )}
              </div>
          </section>
      )}

      {/* Forms */}
      {showLogForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%' }}>
            <h2>New Entry</h2>
            <form onSubmit={handleAddLog} className="grid" style={{ marginTop: '1.5rem' }}>
              <input placeholder="Name" value={formData.foodName} onChange={e => setFormData({ ...formData, foodName: e.target.value })} required />
              <div className="grid grid-cols-2">
                <input placeholder="Kcal" type="number" value={formData.calories} onChange={e => setFormData({ ...formData, calories: e.target.value })} required />
                <select value={formData.mealType} onChange={e => setFormData({ ...formData, mealType: e.target.value })}>
                   <option value="Breakfast">Breakfast</option>
                   <option value="Lunch">Lunch</option>
                   <option value="Dinner">Dinner</option>
                   <option value="Snacks">Snack</option>
                </select>
              </div>
              <div className="grid grid-cols-3">
                <input placeholder="P (g)" type="number" step="0.1" value={formData.protein} onChange={e => setFormData({ ...formData, protein: e.target.value })} />
                <input placeholder="C (g)" type="number" step="0.1" value={formData.carbs} onChange={e => setFormData({ ...formData, carbs: e.target.value })} />
                <input placeholder="F (g)" type="number" step="0.1" value={formData.fat} onChange={e => setFormData({ ...formData, fat: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">Add Entry</button>
              <button type="button" className="btn-secondary" onClick={() => setShowLogForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showPantryForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%' }}>
            <h2>Add Pantry Item</h2>
            <form onSubmit={handleAddPantry} className="grid" style={{ marginTop: '1.5rem' }}>
              <input placeholder="Item Name (e.g. Kirkland Shrimp)" value={pantryItemName} onChange={e => setPantryItemName(e.target.value)} required autoFocus />
              <button type="submit" className="btn-primary">Add to Pantry</button>
              <button type="button" className="btn-secondary" onClick={() => setShowPantryForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showWeightForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%' }}>
            <h2>New Weight Log</h2>
            <form onSubmit={handleAddWeight} className="grid" style={{ marginTop: '1.5rem' }}>
              <input placeholder="kg" type="number" step="0.1" value={weightFormData.weight} onChange={e => setWeightFormData({ weight: parseFloat(e.target.value) })} required />
              <button type="submit" className="btn-primary">Update Weight</button>
              <button type="button" className="btn-secondary" onClick={() => setShowWeightForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showProfileEdit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <UserCircle size={32} color="var(--primary)" />
                <h2>Manage Elite Profile</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="grid">
              <div className="grid grid-cols-2">
                <input placeholder="Name" value={profileFormData.name} onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })} required />
                <input placeholder="Age" type="number" value={profileFormData.age} onChange={e => setProfileFormData({ ...profileFormData, age: parseInt(e.target.value) })} required />
              </div>
              <div className="grid grid-cols-3">
                <select value={profileFormData.gender} onChange={e => setProfileFormData({ ...profileFormData, gender: e.target.value })}>
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                </select>
                <input placeholder="Weight (kg)" type="number" step="0.1" value={profileFormData.weight} onChange={e => setProfileFormData({ ...profileFormData, weight: parseFloat(e.target.value) })} required />
                <input placeholder="Height (cm)" type="number" step="0.1" value={profileFormData.height} onChange={e => setProfileFormData({ ...profileFormData, height: parseFloat(e.target.value) })} required />
              </div>
              <div className="grid grid-cols-2">
                <select value={profileFormData.activityLevel} onChange={e => setProfileFormData({ ...profileFormData, activityLevel: e.target.value })}>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="very">Very Active</option>
                </select>
                <select value={profileFormData.goalType} onChange={e => setProfileFormData({ ...profileFormData, goalType: e.target.value })}>
                    <option value="loss">Weight Loss</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="gain">Gain Muscle</option>
                </select>
              </div>
              <input placeholder="Target Weight (kg)" type="number" step="0.1" value={profileFormData.targetWeight} onChange={e => setProfileFormData({ ...profileFormData, targetWeight: parseFloat(e.target.value) })} required />
              
              <div style={{ padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '1rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={18} /> Clinical Bio-Markers</h4>
                  <div className="grid grid-cols-2" style={{ marginBottom: '0.5rem' }}>
                    <input placeholder="LDL Level" type="number" value={profileFormData.ldlLevel} onChange={e => setProfileFormData({ ...profileFormData, ldlLevel: e.target.value })} />
                    <input placeholder="Glucose Level" type="number" value={profileFormData.glucoseLevel} onChange={e => setProfileFormData({ ...profileFormData, glucoseLevel: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2" style={{ marginBottom: '0.5rem' }}>
                    <input placeholder="Blood Pressure" value={profileFormData.bloodPressure} onChange={e => setProfileFormData({ ...profileFormData, bloodPressure: e.target.value })} />
                    <input placeholder="Medications" value={profileFormData.medications} onChange={e => setProfileFormData({ ...profileFormData, medications: e.target.value })} />
                  </div>
                  <input placeholder="Other Conditions" value={profileFormData.healthConditions} onChange={e => setProfileFormData({ ...profileFormData, healthConditions: e.target.value })} />
              </div>

              <button type="submit" className="btn-primary">Update Profile Targets</button>
              <button type="button" className="btn-secondary" onClick={() => setShowProfileEdit(false)}>Close Without Saving</button>
            </form>
          </div>
        </div>
      )}

      {showEditLogForm && editingLog && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%' }}>
            <h2>Edit Meal Log</h2>
            <form onSubmit={handleEditLog} className="grid" style={{ marginTop: '1.5rem' }}>
              <input placeholder="Name" value={editingLog.foodName} onChange={e => setEditingLog({ ...editingLog, foodName: e.target.value })} required />
              <div className="grid grid-cols-2">
                <input placeholder="Kcal" type="number" value={editingLog.calories} onChange={e => setEditingLog({ ...editingLog, calories: parseInt(e.target.value) })} required />
                <select value={editingLog.mealType} onChange={e => setEditingLog({ ...editingLog, mealType: e.target.value })}>
                   <option value="Breakfast">Breakfast</option>
                   <option value="Lunch">Lunch</option>
                   <option value="Dinner">Dinner</option>
                   <option value="Snacks">Snack</option>
                </select>
              </div>
              <div className="grid grid-cols-3">
                <input placeholder="P (g)" type="number" step="0.1" value={editingLog.protein} onChange={e => setEditingLog({ ...editingLog, protein: parseFloat(e.target.value) })} />
                <input placeholder="C (g)" type="number" step="0.1" value={editingLog.carbs} onChange={e => setEditingLog({ ...editingLog, carbs: parseFloat(e.target.value) })} />
                <input placeholder="F (g)" type="number" step="0.1" value={editingLog.fat} onChange={e => setEditingLog({ ...editingLog, fat: parseFloat(e.target.value) })} />
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
              <button type="button" className="btn-secondary" onClick={() => { setShowEditLogForm(false); setEditingLog(null); }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
