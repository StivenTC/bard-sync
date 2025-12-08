'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '@/shared/lib/firebase';
import styles from './home.module.scss';
import { Scroll, Users, Shield } from 'lucide-react';

import Link from 'next/link';

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
    <main className={styles.container}>
      <h1 className={styles.title}>BardSync</h1>
      <p className={styles.subtitle}>Immersive Audio & Visuals for your Tabletop RPGs</p>

      <section className={styles.card} aria-label="System Status and Navigation">
        <div className={styles.status} role="status">
          System Status: <strong>{isConnected ? 'Online' : 'Connecting...'}</strong>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className={styles.btn} aria-label="Go to GM Console">
            <Shield size={20} aria-hidden="true" /> GM Console
          </Link>
          <Link href="/player" className={styles.btn} aria-label="Go to Player View">
            <Users size={20} aria-hidden="true" /> Player View
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <p><Scroll size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} aria-hidden="true" /> Crafted by Tcla for Game Masters</p>
      </footer>
    </main>
  );
}
