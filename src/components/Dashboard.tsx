'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Utensils, Scale, LayoutDashboard, TrendingUp, Sparkles, Plus, Send } from 'lucide-react';
import { mealLibrary } from '@/data/mealLibrary';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface User {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  goalType: string;
  targetWeight: number;
  dailyCalories: number;
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

export default function Dashboard({ user, onBack }: { user: User, onBack: () => void }) {
  const [logs, setLogs] = useState<DietLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogForm, setShowLogForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'breakfast'
  });
  const [weightFormData, setWeightFormData] = useState({
    weight: user.weight
  });

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/logs?userId=${user.id}`);
      const data = await res.json();
      setLogs(data || []);
    } catch (e) {
      console.error('Failed to fetch logs', e);
    }
  }, [user.id]);

  const fetchWeightLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/weight?userId=${user.id}`);
      const data = await res.json();
      setWeightLogs(data || []);
    } catch (e) {
      console.error('Failed to fetch weight logs', e);
    }
  }, [user.id]);

  useEffect(() => {
    fetchLogs();
    fetchWeightLogs();
  }, [fetchLogs, fetchWeightLogs]);

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
      setFormData({ foodName: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'breakfast' });
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
        setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: data.reply }] }]);
      } else {
        setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: `### ⚠️ AI Error\n${data.error || "Failed to respond."}` }] }]);
      }
    } catch (e) {
      setChatMessages([...updatedHistory, { role: 'model', parts: [{ text: "### ⚠️ Connectivity Error" }] }]);
    } finally {
      setIsAiLoading(false);
    }
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
          <h1 className="gradient-text" style={{ fontSize: '2rem' }}>NutriTrack Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Goal: {user.goalType.toUpperCase()} to {user.targetWeight}kg</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={onBack}>Switch Account</button>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '1rem', width: 'fit-content' }}>
        {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Summary' },
            { id: 'trends', icon: <TrendingUp size={20} />, label: 'Trends' },
            { id: 'diet-plans', icon: <Sparkles size={20} />, label: 'AI Coach' }
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
                    borderRadius: '0.75rem', fontWeight: 600, color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: activeTab === tab.id ? 'var(--surface-raised)' : 'transparent',
                    transition: '0.3s'
                }}
            >
                {tab.icon} {tab.label}
            </button>
        ))}
      </nav>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2">
          <section className="glass-card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Daily Calorie Tracker</h2>
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
                      <h4 style={{ fontSize: '1.1rem' }}>{log.foodName}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{log.mealType} • P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g</p>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)' }}>{log.calories} kcal</span>
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
            <Line data={chartData} options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
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
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>AI Personal Chef</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Powered by Gemini 2.5</p>
                </div>
             </div>

             <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
                {chatMessages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '300px' }}>
                        <Sparkles size={40} style={{ color: 'var(--accent)', marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Say hello to your chef! Request a high-protein plan or ask for a meal swap.</p>
                        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => sendChatMessage("Give me a one-day high-protein plan with salmon and matcha focus")}>Generate Today's Plan</button>
                    </div>
                ) : (
                    chatMessages.map((msg, i) => (
                        <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            <div style={{
                                padding: '1rem', borderRadius: '1rem',
                                background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-raised)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                borderTopLeftRadius: msg.role === 'model' ? '0' : '1rem',
                                borderTopRightRadius: msg.role === 'user' ? '0' : '1rem',
                                fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                            }}>
                                {msg.parts[0].text}
                            </div>
                        </div>
                    ))
                )}
                {isAiLoading && (
                     <div style={{ alignSelf: 'flex-start', background: 'var(--surface-raised)', padding: '0.75rem 1rem', borderRadius: '1rem', borderTopLeftRadius: 0 }}>
                        <div className="loader-dots">Nutritionist is thinking...</div>
                     </div>
                )}
             </div>

             <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                    placeholder="Ask follow-up or request meal swap..." 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                    style={{ background: 'var(--surface)' }}
                />
                <button className="btn-primary" style={{ padding: '0 1.25rem' }} onClick={() => sendChatMessage()} disabled={isAiLoading || !chatInput.trim()}>
                    <Send size={18} />
                </button>
             </div>
          </section>

          {/* Right Side: Quick Selection Library */}
          <section className="grid" style={{ alignContent: 'start' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Library Favorites</h2>
            <div className="grid">
                {mealLibrary.slice(0, 4).map((meal) => (
                    <div key={meal.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ fontSize: '1rem' }}>{meal.name}</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                 <span className="badge badge-primary">{meal.calories} kcal</span>
                                 <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>P: {meal.protein}g</span>
                            </div>
                        </div>
                        <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={() => {
                            setFormData({
                                foodName: meal.name,
                                calories: meal.calories.toString(),
                                protein: meal.protein.toString(),
                                carbs: meal.carbs.toString(),
                                fat: meal.fat.toString(),
                                mealType: meal.category.toLowerCase()
                            });
                            setShowLogForm(true);
                        }}><Plus size={18} /></button>
                    </div>
                ))}
            </div>
          </section>
        </div>
      )}

      {/* Forms/Modals */}
      {showLogForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%' }}>
            <h2>New Entry</h2>
            <form onSubmit={handleAddLog} className="grid" style={{ marginTop: '1.5rem' }}>
              <input placeholder="Food / Drink Name" value={formData.foodName} onChange={e => setFormData({ ...formData, foodName: e.target.value })} required />
              <div className="grid grid-cols-2">
                <input placeholder="Kcal" type="number" value={formData.calories} onChange={e => setFormData({ ...formData, calories: e.target.value })} required />
                <select value={formData.mealType} onChange={e => setFormData({ ...formData, mealType: e.target.value })}>
                   <option value="Breakfast">Breakfast</option>
                   <option value="Lunch">Lunch</option>
                   <option value="Dinner">Dinner</option>
                   <option value="Snack">Snack</option>
                   <option value="Drink">Drink</option>
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

      {showWeightForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%' }}>
            <h2>Update Weight</h2>
            <form onSubmit={handleAddWeight} className="grid" style={{ marginTop: '1.5rem' }}>
              <input placeholder="Current Weight (kg)" type="number" step="0.1" value={weightFormData.weight} onChange={e => setWeightFormData({ weight: parseFloat(e.target.value) })} required />
              <button type="submit" className="btn-primary">Sync Weight</button>
              <button type="button" className="btn-secondary" onClick={() => setShowWeightForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
