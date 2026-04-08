import React from 'react';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingProps {
  onUpgrade: (plan: string) => void;
  onClose: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onUpgrade, onClose }) => {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Foundational tracking for beginners',
      features: ['Weight Tracking', 'Basic Meal Logging', 'Standard Stats Dashboard'],
      btnText: 'Current Plan',
      elite: false
    },
    {
      name: 'Elite Clinical',
      price: '$19',
      interval: '/mo',
      description: 'The ultimate AI-driven dietary lab',
      features: [
          'Full AI Clinical Coach',
          'Bio-Marker (LDL, Glucose) Analysis',
          'Dynamic Model Orchestrator',
          'Interactive Digital Pantry',
          'Advanced Trend Forecasting'
      ],
      btnText: 'Go Elite Now',
      elite: true
    }
  ];

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ maxWidth: '900px', width: '100%', padding: '3rem', position: 'relative' }}
      >
        <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.25rem' }}
        >✕</button>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Elevate Your Performance</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>Unlock precision clinical analysis and the world's most advanced AI coaching models.</p>
        </div>

        <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`glass-card ${plan.elite ? 'premium-border' : ''}`}
              style={{ 
                padding: '2rem', 
                border: plan.elite ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                background: plan.elite ? 'rgba(45, 212, 191, 0.05)' : 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>{plan.name}</h3>
                  {plan.elite && <Sparkles size={18} color="var(--primary)" />}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{plan.interval}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{plan.description}</p>
              </div>

              <div style={{ flex: 1, marginBottom: '2rem' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {plan.features.map((feat, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                      <Check size={16} color={plan.elite ? 'var(--primary)' : 'var(--text-secondary)'} />
                      <span style={{ opacity: plan.elite ? 1 : 0.7 }}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={plan.elite ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', padding: '1rem' }}
                onClick={() => plan.elite && onUpgrade(plan.name)}
                disabled={!plan.elite}
              >
                {plan.elite ? <Zap size={18} /> : null} {plan.btnText}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.5, fontSize: '0.8rem' }}>
            <Shield size={14} /> Encrypted Stripe Checkout & Instant Feature Activation
        </div>
      </motion.div>
    </div>
  );
};
