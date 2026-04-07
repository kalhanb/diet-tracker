'use client';

import React, { useState, useEffect } from 'react';
import { Plus, User, ArrowRight } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  goalType: string;
  gender: 'male' | 'female';
  activityLevel: string;
  targetWeight: number;
  dailyCalories: number;
}

export default function ProfileManager({ onSelect }: { onSelect: (user: Profile) => void }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    gender: 'male' as 'male' | 'female',
    weight: 70,
    height: 175,
    activityLevel: 'moderate',
    goalType: 'maintain',
    targetWeight: 70,
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data || []);
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const newUser = await res.json();
      onSelect(newUser);
    }
  };

  if (showCreate) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Create Your Profile</h2>
        <form onSubmit={handleCreate} className="grid">
          <div className="grid grid-cols-2">
            <div className="grid" style={{ gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="grid" style={{ gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Age</label>
              <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid" style={{ gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Gender</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="grid" style={{ gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Activity Level</label>
              <select value={formData.activityLevel} onChange={e => setFormData({ ...formData, activityLevel: e.target.value })}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="heavy">Very Active</option>
                <option value="extra">Extra Active</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid" style={{ gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Weight (kg)</label>
              <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })} />
            </div>
            <div className="grid" style={{ gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Height (cm)</label>
              <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid" style={{ gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Goal</label>
              <select value={formData.goalType} onChange={e => setFormData({ ...formData, goalType: e.target.value })}>
                <option value="lose">Weight Loss</option>
                <option value="maintain">Maintenance</option>
                <option value="gain">Weight Gain</option>
              </select>
            </div>
            <div className="grid" style={{ gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Target Weight (kg)</label>
              <input type="number" step="0.1" value={formData.targetWeight} onChange={e => setFormData({ ...formData, targetWeight: parseFloat(e.target.value) })} />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Create Profile <ArrowRight size={18} /></button>
          <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => setShowCreate(false)}>Back</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>NutriTrack Portal</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3.5rem', fontSize: '1.2rem' }}>Select a profile to continue your journey.</p>
      
      <div className="grid grid-cols-3" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {users.map(user => (
          <div key={user.id} className="glass-card" onClick={() => onSelect(user)} style={{ cursor: 'pointer', padding: '2rem' }}>
            <div style={{ background: 'var(--surface-raised)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <User size={35} className="gradient-text" />
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>{user.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.goalType.toUpperCase()} • {user.weight}kg</p>
          </div>
        ))}
        
        <div className="glass-card" onClick={() => setShowCreate(true)} style={{ cursor: 'pointer', border: '1px dashed var(--primary)', background: 'transparent', padding: '2rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px dashed var(--primary)' }}>
            <Plus size={35} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem' }}>New Profile</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Add a user</p>
        </div>
      </div>
    </div>
  );
}
