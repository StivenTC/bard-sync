'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import styles from './home.module.scss';
import { Scroll, Users, Shield } from 'lucide-react';

export default function HomeScreen() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      setIsConnected(!!snap.val());
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>BardSync</h1>
      <p className={styles.subtitle}>Immersive Audio & Visuals for your Tabletop RPGs</p>

      <div className={styles.card}>
        <div className={styles.status}>
          System Status: <strong>{isConnected ? 'Online' : 'Connecting...'}</strong>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className={styles.btn} >
            <Shield size={20} /> GM Console
          </a>
          <a href="/player" className={styles.btn}>
            <Users size={20} /> Player View
          </a>
        </div>
      </div>

      <div className={styles.footer}>
        <p><Scroll size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Crafted by Tcla for Game Masters</p>
      </div>
    </div>
  );
}
