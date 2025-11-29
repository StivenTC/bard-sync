'use client';

import { useEffect, useState } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function HomeScreen() {
  const [status, setStatus] = useState<string>('Waiting...');
  const [lastValue, setLastValue] = useState<string>('');

  useEffect(() => {
    // Listen for changes in the test node
    const testRef = ref(db, 'test/connection');
    const unsubscribe = onValue(testRef, (snapshot) => {
      const data = snapshot.val();
      setLastValue(JSON.stringify(data));
    }, (error) => {
      setStatus(`Read error: ${error.message}`);
    });

    return () => unsubscribe();
  }, []);

  const testConnection = async () => {
    setStatus('Attempting to write...');
    try {
      const testRef = ref(db, 'test/connection');
      await set(testRef, {
        timestamp: Date.now(),
        message: 'Hello from BardSync',
        ok: true
      });
      setStatus('Write successful! Check if "Last Value" updated.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Write error: ${error.message}`);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>BardSync - Phase 1: Connection Test</h1>

      <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc' }}>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Last Value in DB:</strong> {lastValue}</p>

        <button
          onClick={testConnection}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Test Connection (Write)
        </button>
      </div>

      <p>If you see the timestamp update when clicking, the connection works.</p>
    </main>
  );
}
