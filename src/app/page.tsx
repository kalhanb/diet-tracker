'use client';

import React, { useState } from 'react';
import ProfilePicker from '@/components/ProfilePicker';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  if (!selectedUser) {
    return (
      <main className="premium-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ProfilePicker onSelect={setSelectedUser} />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <Dashboard user={selectedUser} onBack={() => setSelectedUser(null)} />
    </main>
  );
}
