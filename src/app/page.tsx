'use client';

import { useEffect, useState } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function Home() {
  const [status, setStatus] = useState<string>('Esperando...');
  const [lastValue, setLastValue] = useState<string>('');

  useEffect(() => {
    // Escuchar cambios en el nodo de prueba
    const testRef = ref(db, 'test/connection');
    const unsubscribe = onValue(testRef, (snapshot) => {
      const data = snapshot.val();
      setLastValue(JSON.stringify(data));
    }, (error) => {
      setStatus(`Error de lectura: ${error.message}`);
    });

    return () => unsubscribe();
  }, []);

  const testConnection = async () => {
    setStatus('Intentando escribir...');
    try {
      const testRef = ref(db, 'test/connection');
      await set(testRef, {
        timestamp: Date.now(),
        message: 'Hola desde BardSync',
        ok: true
      });
      setStatus('Escritura exitosa! Verifica si "Last Value" se actualizó.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error de escritura: ${error.message}`);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>BardSync - Fase 1: Test de Conexión</h1>

      <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc' }}>
        <p><strong>Estado:</strong> {status}</p>
        <p><strong>Último valor en DB:</strong> {lastValue}</p>

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
          Probar Conexión (Escribir)
        </button>
      </div>

      <p>Si ves el timestamp actualizarse al hacer clic, la conexión funciona.</p>
    </main>
  );
}
