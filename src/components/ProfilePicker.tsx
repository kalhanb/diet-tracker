'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, ShieldAlert, HeartPulse } from 'lucide-react';

interface User {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  goalType: string;
  targetWeight: number;
  ldlLevel?: number;
  medications?: string;
}

export default function ProfilePicker({ onSelect }: { onSelect: (user: User) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goalType: 'loss',
    targetWeight: '',
    ldlLevel: '',
    glucoseLevel: '',
    bloodPressure: '',
    medications: '',
    healthConditions: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      await fetchUsers();
      setShowForm(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="premium-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      {!showForm ? (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '800px' }}>
          <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>NutriTrack Elite</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Select your profile to continue your journey</p>
          
          <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
            {users.map((user) => (
              <button key={user.id} className="glass-card" onClick={() => onSelect(user)} style={{ textAlign: 'left', padding: '2rem', transition: '0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'var(--surface-raised)', padding: '0.75rem', borderRadius: '50%' }}>
                        <Users size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>{user.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.age} yrs | {user.weight}kg</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-primary">{user.goalType.toUpperCase()} GOAL</span>
                    {user.medications && <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>MEDICAL CONTEXT</span>}
                </div>
              </button>
            ))}
            <button className="glass-card" onClick={() => setShowForm(true)} style={{ border: '2px dashed rgba(255,255,255,0.1)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2.5rem' }}>
                <Plus size={48} color="var(--primary)" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Create New Elite Profile</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '700px', width: '95%' }}>
          <h2 style={{ marginBottom: '2rem' }}>Elite Profile Setup</h2>
          <form onSubmit={handleSubmit} className="grid">
            <div className="grid grid-cols-1" style={{ marginBottom: '1rem' }}>
                <input placeholder="Personal Email (Required for Elite Access)" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2">
                <input placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Age" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required />
            </div>
            
            <div className="grid grid-cols-3">
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <input placeholder="Weight (kg)" type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} required />
                <input placeholder="Height (cm)" type="number" step="0.1" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2">
                <select value={formData.activityLevel} onChange={e => setFormData({...formData, activityLevel: e.target.value})} required>
                    <option value="sedentary">Sedentary (No exercise)</option>
                    <option value="light">Lightly Active (1-2 days/wk)</option>
                    <option value="moderate">Moderately Active (3-5 days/wk)</option>
                    <option value="very">Very Active (Daily exercise)</option>
                </select>
                <select value={formData.goalType} onChange={e => setFormData({...formData, goalType: e.target.value})} required>
                    <option value="loss">Weight Loss</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="gain">Gain Muscle</option>
                </select>
            </div>

            <input placeholder="Target Weight (kg)" type="number" step="0.1" value={formData.targetWeight} onChange={e => setFormData({...formData, targetWeight: e.target.value})} required />

            <div style={{ margin: '1rem 0', padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '1rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                    <ShieldAlert size={20} />
                    <h4 style={{ margin: 0 }}>Clinical Bio-Markers (Important for AI Accuracy)</h4>
                </div>
                <div className="grid grid-cols-2">
                    <input placeholder="LDL Level (mg/dL)" type="number" value={formData.ldlLevel} onChange={e => setFormData({...formData, ldlLevel: e.target.value})} />
                    <input placeholder="Glucose (mg/dL)" type="number" value={formData.glucoseLevel} onChange={e => setFormData({...formData, glucoseLevel: e.target.value})} />
                </div>
                <div className="grid grid-cols-2">
                    <input placeholder="Blood Pressure (e.g. 120/80)" value={formData.bloodPressure} onChange={e => setFormData({...formData, bloodPressure: e.target.value})} />
                    <input placeholder="Medications (e.g. Metformin 500mg)" value={formData.medications} onChange={e => setFormData({...formData, medications: e.target.value})} />
                </div>
                <input placeholder="Other Health Conditions (e.g. Prediabetes, Iron Deficiency, etc.)" value={formData.healthConditions} onChange={e => setFormData({...formData, healthConditions: e.target.value})} style={{ marginTop: '0.75rem' }} />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem', opacity: 0.6 }}>Our AI analyzes these markers to optimize your diet for heart health, blood sugar, and nutrient deficiencies.</p>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Building Elite Profile...' : 'Save & Initialize Database'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Go Back</button>
          </form>
        </div>
      )}
    </div>
  );
}
