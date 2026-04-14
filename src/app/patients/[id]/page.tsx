'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Patient, Consultation, speciesEmoji, calculateAge, Sex, Species } from '@/lib/patient-utils';
import { Logo } from '@/components/Logo';

const VET_ID = 'demo';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('leash-demo-auth')) { router.push('/login'); return; }
    fetchData();
  }, [id]);

  async function fetchData() {
    const res = await fetch(`/api/patients/${id}`);
    const data = await res.json();
    setPatient(data.patient);
    setHistory(data.history ?? []);
    setEditForm(data.patient);
    setLoading(false);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/patients/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    setShowEdit(false);
    fetchData();
  }

  async function startConsultation() {
    setStarting(true);
    const res = await fetch('/api/consultations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patient_id: id, vet_id: VET_ID }) });
    const consultation = await res.json();
    router.push(`/chat?patientId=${id}&consultationId=${consultation.id}`);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', fontFamily: "'DM Sans', sans-serif", color: '#7A9490' }}>Chargement…</div>;
  if (!patient) return <div style={{ textAlign: 'center', padding: '80px', fontFamily: "'DM Sans', sans-serif", color: '#7A9490' }}>Patient introuvable.</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F3F0EA; font-family: 'DM Sans', sans-serif; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #0B7A6A !important; }
        .consult-card:hover { border-color: rgba(11,122,106,0.25) !important; }
        .consult-card { transition: border-color 0.15s; }
      `}</style>

      {/* Navbar */}
      <nav style={{ background: '#111D1B', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 0, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 32 }}>
          <Logo height={28} dark />
        </Link>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          <Link href="/patients" style={{ padding: '6px 12px', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: 'white', textDecoration: 'none', background: 'rgba(11,122,106,0.18)', border: '1px solid rgba(11,122,106,0.25)' }}>Mes patients</Link>
          <Link href="/chat" style={{ padding: '6px 12px', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Assistant IA</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
        {/* Back */}
        <Link href="/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#7A9490', textDecoration: 'none', marginBottom: 20 }}>
          ← Retour aux patients
        </Link>

        {/* Patient header card */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #DDD9CF', padding: '28px', marginBottom: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(11,122,106,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#0B7A6A,#1A4A43)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>
              {speciesEmoji(patient.species)}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 28, fontWeight: 400, color: '#111D1B', letterSpacing: '-0.02em', marginBottom: 6 }}>{patient.name}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {[
                  { label: patient.species.charAt(0).toUpperCase() + patient.species.slice(1) },
                  patient.breed ? { label: patient.breed } : null,
                  patient.sex ? { label: patient.sex } : null,
                  patient.birth_date ? { label: calculateAge(patient.birth_date) } : null,
                  patient.weight_kg ? { label: `${patient.weight_kg} kg` } : null,
                ].filter(Boolean).map((tag, i) => tag && (
                  <span key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: '#E8F2EF', color: '#085F52', padding: '3px 10px', borderRadius: 100, fontWeight: 500 }}>
                    {tag.label}
                  </span>
                ))}
              </div>
              {patient.owner_name && (
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#4A6460' }}>
                  👤 {patient.owner_name}{patient.owner_phone ? ` · ${patient.owner_phone}` : ''}
                </div>
              )}
              {patient.microchip && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#7A9490', marginTop: 4 }}>Puce: {patient.microchip}</div>}
              {patient.notes && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#7A9490', marginTop: 8, fontStyle: 'italic' }}>{patient.notes}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowEdit(true)} style={{ padding: '9px 16px', border: '1.5px solid #DDD9CF', borderRadius: 9, background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#4A6460', cursor: 'pointer' }}>Modifier</button>
              <button onClick={startConsultation} disabled={starting} style={{ padding: '9px 18px', background: '#0B7A6A', color: 'white', border: 'none', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 14px rgba(11,122,106,0.3)', opacity: starting ? 0.7 : 1 }}>
                {starting ? 'Démarrage…' : '+ Nouvelle consultation'}
              </button>
            </div>
          </div>
        </div>

        {/* Consultation history */}
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#7A9490', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
          Historique · {history.length} consultation{history.length !== 1 ? 's' : ''}
        </h2>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: 16, border: '1px dashed #DDD9CF', color: '#B5AFA6', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
            Aucune consultation enregistrée pour ce patient.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map(c => (
              <div key={c.id} className="consult-card" style={{ background: 'white', borderRadius: 16, border: '1px solid #DDD9CF', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#111D1B' }}>
                      {new Date(c.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#7A9490', marginTop: 2 }}>
                      {c.soap_report ? '✓ Compte-rendu SOAP généré' : c.raw_notes ? '📝 Notes enregistrées' : 'Consultation vide'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setExpanded(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                      style={{ padding: '7px 14px', border: '1.5px solid #DDD9CF', borderRadius: 8, background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#4A6460', cursor: 'pointer' }}>
                      {expanded[c.id] ? 'Réduire' : 'Voir détail'}
                    </button>
                    {(c.soap_report || c.raw_notes) && (
                      <button onClick={() => {
                        const w = window.open('', '_blank');
                        if (w) { w.document.write(`<pre style="font-family:monospace;padding:32px;white-space:pre-wrap">${c.soap_report || c.raw_notes}</pre>`); w.print(); }
                      }} style={{ padding: '7px 14px', border: '1.5px solid #DDD9CF', borderRadius: 8, background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#4A6460', cursor: 'pointer' }}>
                        PDF
                      </button>
                    )}
                  </div>
                </div>
                {expanded[c.id] && (c.soap_report || c.raw_notes) && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #DDD9CF', marginTop: 0 }}>
                    <pre style={{ marginTop: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#4A6460', whiteSpace: 'pre-wrap', lineHeight: 1.7, background: '#F3F0EA', borderRadius: 10, padding: '14px 16px' }}>
                      {c.soap_report || c.raw_notes}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,29,27,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 24, fontWeight: 400, color: '#111D1B' }}>Modifier le patient</h2>
              <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#7A9490' }}>×</button>
            </div>
            <form onSubmit={handleEdit}>
              {[
                { label: 'Nom', key: 'name', type: 'text' },
                { label: 'Race', key: 'breed', type: 'text' },
                { label: 'Date de naissance', key: 'birth_date', type: 'date' },
                { label: 'Poids (kg)', key: 'weight_kg', type: 'number' },
                { label: 'N° puce', key: 'microchip', type: 'text' },
                { label: 'Propriétaire', key: 'owner_name', type: 'text' },
                { label: 'Téléphone', key: 'owner_phone', type: 'tel' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A6460', marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>{f.label}</label>
                  <input type={f.type} step={f.type === 'number' ? '0.1' : undefined}
                    value={(editForm as Record<string, string | number | undefined>)[f.key] as string ?? ''}
                    onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', border: '1.5px solid #DDD9CF', borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#111D1B' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A6460', marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>Espèce</label>
                  <select value={editForm.species ?? 'chien'} onChange={e => setEditForm(prev => ({ ...prev, species: e.target.value as Species }))}
                    style={{ width: '100%', border: '1.5px solid #DDD9CF', borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, background: 'white' }}>
                    <option value="chien">🐕 Chien</option>
                    <option value="chat">🐈 Chat</option>
                    <option value="nac">🐾 NAC</option>
                    <option value="autre">🐾 Autre</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A6460', marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>Sexe</label>
                  <select value={editForm.sex ?? 'Mâle'} onChange={e => setEditForm(prev => ({ ...prev, sex: e.target.value as Sex }))}
                    style={{ width: '100%', border: '1.5px solid #DDD9CF', borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, background: 'white' }}>
                    <option>Mâle</option><option>Femelle</option><option>Mâle castré</option><option>Femelle stérilisée</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A6460', marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>Notes</label>
                <textarea value={editForm.notes ?? ''} onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))} rows={3}
                  style={{ width: '100%', border: '1.5px solid #DDD9CF', borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowEdit(false)} style={{ padding: '10px 20px', border: '1.5px solid #DDD9CF', borderRadius: 9, background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#0B7A6A', color: 'white', border: 'none', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
