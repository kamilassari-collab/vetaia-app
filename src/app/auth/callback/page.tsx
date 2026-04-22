'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/chat');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F3F0EA', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid #E8F2EF', borderTopColor: '#0B7A6A',
        animation: 'spin 0.8s linear infinite', marginBottom: 20,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#7A9490', fontSize: 15, fontWeight: 500 }}>
        Confirmation en cours…
      </p>
    </div>
  );
}
