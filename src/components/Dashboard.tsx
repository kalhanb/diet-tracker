'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Utensils, Scale, LayoutDashboard, TrendingUp, Sparkles, Plus } from 'lucide-react';
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
  const [aiPlan, setAiPlan] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
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

  const generateAiPlan = async () => {
    setIsAiLoading(true);
    setAiPlan('');
    try {
      const res = await fetch('/api/ai/diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.plan) {
        setAiPlan(data.plan);
      } else {
        setAiPlan("### ⚠️ Error\nCould not generate your AI plan. Please check your **GEMINI_API_KEY**.");
      }
    } catch (e) {
      console.error('AI error:', e);
      setAiPlan("### ⚠️ Connectivity Error\nFailed to reach the AI dietitian.");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchWeightLogs();
  }, [fetchLogs, fetchWeightLogs]);

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
          <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Welcome, {user.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Goal: {user.goalType.toUpperCase()} to {user.targetWeight}kg</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={onBack}>Switch Profile</button>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '1rem', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem', fontWeight: 600, color: activeTab === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: activeTab === 'dashboard' ? 'var(--surface-raised)' : 'transparent',
            transition: '0.3s'
          }}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem', fontWeight: 600, color: activeTab === 'trends' ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: activeTab === 'trends' ? 'var(--surface-raised)' : 'transparent',
            transition: '0.3s'
          }}
        >
          <TrendingUp size={20} /> Trends
        </button>
        <button
          onClick={() => setActiveTab('diet-plans')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem', fontWeight: 600, color: activeTab === 'diet-plans' ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: activeTab === 'diet-plans' ? 'var(--surface-raised)' : 'transparent',
            transition: '0.3s'
          }}
        >
          <Sparkles size={20} /> Diet Plans
        </button>
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
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KCAL REMAINING</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>TARGET</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{user.dailyCalories}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
              <button className="btn-primary" onClick={() => setShowLogForm(true)}><Plus size={20} /> Log Food</button>
              <button className="btn-secondary" onClick={() => setShowWeightForm(true)}><Scale size={20} /> Update Weight</button>
            </div>
          </section>

          <section className="glass-card" style={{ gridColumn: 'span 2' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Daily Food Log</h2>
            <div className="grid">
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No food logged yet for today.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)', padding: '1rem 1.5rem', borderRadius: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem' }}>{log.foodName}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{log.mealType.toUpperCase()} • P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g</p>
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
          <h2 style={{ marginBottom: '2rem' }}>Weight Trends</h2>
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
          </div>
        </section>
      )}

      {activeTab === 'diet-plans' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <h2 style={{ margin: 0 }}>Smart Nutrition Engine</h2>
             <button
               className="btn-primary"
               onClick={generateAiPlan}
               disabled={isAiLoading}
               style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
             >
               {isAiLoading ? <span className="loader-dots">Thinking...</span> : <><Sparkles size={18} /> Generate AI Meal Plan</>}
             </button>
          </div>

          {aiPlan && (
            <div className="glass-card" style={{ marginBottom: '2.5rem', background: 'rgba(192, 132, 252, 0.05)', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                  <Sparkles size={24} />
                  <h3 style={{ margin: 0 }}>Customized AI Nutritionist Suggestion</h3>
               </div>
               <div style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                  {aiPlan}
               </div>
               <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setAiPlan('')}>Dismiss AI Suggestion</button>
               </div>
            </div>
          )}

          <h3 style={{ marginBottom: '1.5rem', opacity: 0.8, fontSize: '1rem' }}>Library Favorites (High-Protein)</h3>
          <div className="grid grid-cols-3">
             {mealLibrary.filter(m => m.calories < caloriesRemaining + 500).map((meal) => (
               <div key={meal.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <span className="badge badge-primary">{meal.category}</span>
                    <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{meal.calories} kcal</span>
                 </div>
                 <h3>{meal.name}</h3>
                 <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                   {meal.tags.map((tag) => <span key={tag} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--surface-raised)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>#{tag}</span>)}
                 </div>
                 <div style={{ marginTop: 'auto', background: 'var(--surface-raised)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <div>P: <strong>{meal.protein}g</strong></div>
                    <div>C: <strong>{meal.carbs}g</strong></div>
                    <div>F: <strong>{meal.fat}g</strong></div>
                 </div>
                 <button className="btn-primary" style={{ padding: '0.5rem', width: '100%' }} onClick={() => {
                        setFormData({
                            foodName: meal.name,
                            calories: meal.calories.toString(),
                            protein: meal.protein.toString(),
                            carbs: meal.carbs.toString(),
                            fat: meal.fat.toString(),
                            mealType: meal.category.toLowerCase()
                        });
                        setShowLogForm(true);
                 }}>Select Meal</button>
               </div>
             ))}
          </div>
        </section>
      )}

      {showLogForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%' }}>
            <h2>Log Food</h2>
            <form onSubmit={handleAddLog} className="grid" style={{ marginTop: '1.5rem' }}>
              <input placeholder="Food Name" value={formData.foodName} onChange={e => setFormData({ ...formData, foodName: e.target.value })} required />
              <div className="grid grid-cols-2">
                <input placeholder="Calories" type="number" value={formData.calories} onChange={e => setFormData({ ...formData, calories: e.target.value })} required />
                <select value={formData.mealType} onChange={e => setFormData({ ...formData, mealType: e.target.value })}>
                   <option value="breakfast">Breakfast</option>
                   <option value="lunch">Lunch</option>
                   <option value="dinner">Dinner</option>
                   <option value="snack">Snack</option>
                </select>
              </div>
              <div className="grid grid-cols-3">
                <input placeholder="Protein (g)" type="number" step="0.1" value={formData.protein} onChange={e => setFormData({ ...formData, protein: e.target.value })} />
                <input placeholder="Carbs (g)" type="number" step="0.1" value={formData.carbs} onChange={e => setFormData({ ...formData, carbs: e.target.value })} />
                <input placeholder="Fat (g)" type="number" step="0.1" value={formData.fat} onChange={e => setFormData({ ...formData, fat: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">Add Log</button>
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
              <button type="submit" className="btn-primary">Update</button>
              <button type="button" className="btn-secondary" onClick={() => setShowWeightForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
