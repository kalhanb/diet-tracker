import React from 'react';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DisclaimerProps {
  onAccept: () => void;
}

export const MedicalDisclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', border: '1px solid var(--secondary)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: 'var(--secondary)' }}>
          <ShieldAlert size={32} />
          <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Clinical Safety Protocol</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <AlertTriangle size={24} style={{ flexShrink: 0, color: 'var(--secondary)' }} />
                <p><strong>Not Medical Advice:</strong> NutriTrack Elite and its AI Coach provide nutritional information for <strong>educational purposes only</strong>. We are not licensed medical professionals.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <FileText size={24} style={{ flexShrink: 0, color: 'var(--secondary)' }} />
                <p><strong>Clinical Correlation:</strong> AI-generated meal plans do not account for every biochemical fluctuation. You <strong>must</strong> consult your physician before changing your diet if you have conditions like Diabetes or Hypertension.</p>
            </div>

            <div style={{ background: 'rgba(255,165,0,0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>By clicking "I Accept," you assume all responsibility for any health challenges that arise from following AI-generated suggestions.</p>
            </div>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '2.5rem', padding: '1rem', background: 'var(--secondary)' }}
          onClick={onAccept}
        >
          <CheckCircle2 size={18} /> I AGREE & ACKNOWLEDGE RISKS
        </button>
      </motion.div>
    </div>
  );
};
