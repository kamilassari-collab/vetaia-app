'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, LogOut, Home, Mic,
  Pencil, Trash2, FolderOpen, MoreHorizontal, ChevronRight,
  FolderPlus, Send, Settings, HelpCircle, FileText,
  Square, Copy, Printer,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { AiLoader } from '@/components/ui/ai-loader';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Source { name: string; url: string; type: string; excerpt: string }
interface Message { role: 'user' | 'assistant'; content: string; sources?: Source[]; mode?: string }
interface Folder { id: string; name: string; color: string; collapsed: boolean; createdAt: number }
interface Conversation { id: string; title: string; folderId: string | null; messages: Message[]; createdAt: number }
interface PatientBanner { name: string; species: string; breed?: string; weight_kg?: number }

const DEMO_PERSONA = { initials: 'SM', name: 'Dr. Sophie Moreau', clinic: 'Clinique du Parc' };
function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }


// ─── Sources block ────────────────────────────────────────────────────────────
function SourcePills({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  const colors: Record<string, string> = { 'Réglementation FR': '#C1121F', 'Cas cliniques FR': '#E07A1F', 'Guideline International': '#185FA5', Reference: '#0B7A6A', Guideline: '#185FA5', Interne: '#6B8F8A' };
  const hasExcerpts = sources.some(s => s.excerpt);
  return (
    <div style={{ marginTop: 12, borderTop: '1px solid #EDF1F5', paddingTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94A3B8' }}>Sources</span>
        <span style={{ fontSize: 10, color: '#CBD5E0' }}>·</span>
        <span style={{ fontSize: 10, color: '#94A3B8' }}>{sources.length} référence{sources.length > 1 ? 's' : ''}</span>
        {hasExcerpts && (
          <button onClick={() => setOpen(v => !v)} style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#0B7A6A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
            {open ? 'Masquer les extraits ↑' : 'Voir les extraits ↓'}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sources.map((s, i) => {
          const c = colors[s.type] ?? '#6B8F8A';
          const pill = (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: `${c}08`, border: `1px solid ${c}25`, fontSize: 11.5, fontWeight: 500, color: '#364152', cursor: s.url ? 'pointer' : 'default', transition: 'all 0.1s' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 }} />
              {s.name}
              <span style={{ fontSize: 10, color: c, fontWeight: 600, marginLeft: 2 }}>{s.type}</span>
            </span>
          );
          return s.url ? <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{pill}</a> : <span key={i}>{pill}</span>;
        })}
      </div>
      {open && hasExcerpts && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sources.filter(s => s.excerpt).map((s, i) => {
            const c = colors[s.type] ?? '#6B8F8A';
            return (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #EDF1F5', borderLeft: `3px solid ${c}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.type} · {s.name}</div>
                <div style={{ fontSize: 12.5, color: '#486081', fontStyle: 'italic', lineHeight: 1.6 }}>&ldquo;{s.excerpt}&rdquo;</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── AI Message ───────────────────────────────────────────────────────────────
function AIMessage({ content, sources, isStreaming, mode }: { content: string; sources?: Source[]; isStreaming: boolean; mode?: string }) {
  const copyText = () => navigator.clipboard.writeText(content);

  if (mode === 'note') {
    if (isStreaming && !content) return <AiLoader />;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#E8F5F0', border: '1px solid #BBE0D6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Logo mark height={11} /></div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0B7A6A' }}>Note enregistrée</span>
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '4px 14px 14px 14px', background: '#F0FAF7', border: '1px solid #BBE0D6' }}>
          <p style={{ fontSize: 13.5, color: '#364152', lineHeight: 1.65, margin: 0 }}>{content}</p>
        </div>
      </div>
    );
  }

  if (mode === 'report') {
    if (isStreaming && !content) return <AiLoader />;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#E8F5F0', border: '1px solid #BBE0D6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Logo mark height={11} /></div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0B7A6A' }}>Compte-rendu SOAP</span>
        </div>
        <div style={{ borderRadius: '4px 14px 14px 14px', background: 'white', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 20px' }}><div className="ai-prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div></div>
          {!isStreaming && (
            <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderTop: '1px solid #F1F5F9', background: '#FAFBFC' }}>
              <button onClick={copyText} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1px solid #E2E8F0', borderRadius: 7, background: 'white', fontSize: 11.5, color: '#6B8F8A', cursor: 'pointer', fontFamily: 'inherit' }}><Copy size={11} /> Copier</button>
              <button onClick={() => {
                const md = content
                  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                  .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                  .replace(/^- (.+)$/gm, '<li>$1</li>')
                  .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/\n/g, '<br/>');
                const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Compte-rendu SOAP</title><style>
                  body{font-family:'Helvetica Neue',Arial,sans-serif;max-width:700px;margin:40px auto;padding:0 32px;color:#111;font-size:14px;line-height:1.7}
                  h1,h2,h3{color:#0B7A6A;margin-top:24px;margin-bottom:6px}
                  h2{font-size:15px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
                  ul{padding-left:20px;margin:8px 0}li{margin:4px 0}
                  strong{color:#111}p{margin:8px 0}
                  .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0B7A6A;padding-bottom:12px;margin-bottom:24px}
                  .brand{font-size:18px;font-weight:700;color:#111}.brand span{color:#0B7A6A}
                  .date{font-size:12px;color:#666}
                  @media print{body{margin:20px}}
                </style></head><body>
                <div class="header"><div class="brand">Veta<span>IA</span></div><div class="date">${new Date().toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric'})}</div></div>
                <p>${md}</p>
                </body></html>`;
                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const w = window.open(url, '_blank');
                setTimeout(() => { w?.print(); URL.revokeObjectURL(url); }, 500);
              }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1px solid #E2E8F0', borderRadius: 7, background: 'white', fontSize: 11.5, color: '#6B8F8A', cursor: 'pointer', fontFamily: 'inherit' }}><Printer size={11} /> PDF</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default chat
  if (isStreaming && !content) return <AiLoader />;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#E8F5F0', border: '1px solid #BBE0D6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Logo mark height={11} /></div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0B7A6A' }}>VetaIA</span>
      </div>
      <div className="ai-bubble">
        <div className="ai-prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div>
      </div>
      {sources && sources.length > 0 && <SourcePills sources={sources} />}
    </div>
  );
}

// ─── ConvoItem ────────────────────────────────────────────────────────────────
interface ConvoItemProps {
  c: Conversation; currentId: string; folders: Folder[];
  editingTitle: string | null; titleInput: string; indent?: boolean;
  onSelect: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onStartRename: (id: string, title: string) => void;
  onTitleChange: (v: string) => void;
  onCommitRename: (id: string) => void;
  onCancelRename: () => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (convoId: string, folderId: string | null) => void;
}

function ConvoItem({ c, currentId, folders, editingTitle, titleInput, indent = false, onSelect, onDragStart, onDragEnd, onStartRename, onTitleChange, onCommitRename, onCancelRename, onDelete, onMoveToFolder }: ConvoItemProps) {
  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = c.id === currentId;
  const isRenaming = editingTitle === c.id;

  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  return (
    <div draggable onDragStart={e => onDragStart(e, c.id)} onDragEnd={onDragEnd}
      onClick={() => { if (!showMenu && !isRenaming) onSelect(c.id); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 34, padding: indent ? '0 6px 0 24px' : '0 6px', borderRadius: 8, cursor: 'pointer', marginBottom: 1, transition: 'background 0.12s', background: isActive ? '#EDF7F4' : hovered ? '#F8FAFB' : 'transparent', borderLeft: isActive ? '2px solid #0B7A6A' : '2px solid transparent' }}>

      {isRenaming ? (
        <input autoFocus value={titleInput} onChange={e => onTitleChange(e.target.value)}
          onBlur={() => onCommitRename(c.id)}
          onKeyDown={e => { if (e.key === 'Enter') onCommitRename(c.id); if (e.key === 'Escape') onCancelRename(); }}
          onClick={e => e.stopPropagation()}
          style={{ flex: 1, background: 'white', border: '1px solid #CBD5E0', outline: 'none', color: '#364152', fontSize: 12.5, borderRadius: 5, padding: '2px 6px', fontFamily: 'inherit' }} />
      ) : (
        <span style={{ flex: 1, fontSize: 12.5, color: isActive ? '#0B7A6A' : '#486081', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400 }}>{c.title}</span>
      )}

      {hovered && !isRenaming && (
        <div style={{ display: 'flex', gap: 1, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => { onStartRename(c.id, c.title); setShowMenu(false); }}
            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4, color: '#94A3B8' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#364152'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94A3B8'}>
            <Pencil size={11} />
          </button>
          <button onClick={() => setShowMenu(v => !v)}
            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: showMenu ? '#EDF2F7' : 'none', border: 'none', cursor: 'pointer', borderRadius: 4, color: '#94A3B8' }}>
            <MoreHorizontal size={11} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(c.id); }}
            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4, color: '#94A3B8' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#E53E3E'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94A3B8'}>
            <Trash2 size={11} />
          </button>
        </div>
      )}

      {showMenu && (
        <div ref={menuRef} onClick={e => e.stopPropagation()}
          style={{ position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4, background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, padding: 4, minWidth: 176, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '4px 8px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94A3B8' }}>Déplacer vers</div>
          <button onClick={() => { onMoveToFolder(c.id, null); setShowMenu(false); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: c.folderId === null ? '#EDF7F4' : 'transparent', color: c.folderId === null ? '#0B7A6A' : '#364152', fontSize: 12.5, fontFamily: 'inherit', textAlign: 'left' }}>
            Sans dossier {c.folderId === null && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
          </button>
          {folders.length > 0 && <div style={{ height: 1, background: '#F1F5F9', margin: '3px 0' }} />}
          {folders.map(f => (
            <button key={f.id} onClick={() => { onMoveToFolder(c.id, f.id); setShowMenu(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: c.folderId === f.id ? '#EDF7F4' : 'transparent', color: c.folderId === f.id ? '#0B7A6A' : '#364152', fontSize: 12.5, fontFamily: 'inherit', textAlign: 'left' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              {c.folderId === f.id && <span style={{ color: '#0B7A6A', fontSize: 10 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FolderRow ────────────────────────────────────────────────────────────────
function FolderRow({ f, folderConvos, renamingFolderId, folderNameInput, onToggle, onStartRename, onFolderNameChange, onCommitRename, onCancelRename, onDelete }: {
  f: Folder; folderConvos: Conversation[]; renamingFolderId: string | null; folderNameInput: string;
  onToggle: () => void; onStartRename: (id: string, name: string) => void;
  onFolderNameChange: (v: string) => void; onCommitRename: (id: string) => void;
  onCancelRename: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isRenaming = renamingFolderId === f.id;
  return (
    <div onClick={onToggle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 6px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s', background: hovered ? '#F8FAFB' : 'transparent' }}>
      <ChevronRight size={12} style={{ color: '#94A3B8', flexShrink: 0, transition: 'transform 0.15s', transform: f.collapsed ? 'rotate(0)' : 'rotate(90deg)' }} />
      <FolderOpen size={12} style={{ color: '#0B7A6A', flexShrink: 0 }} />
      {isRenaming ? (
        <input autoFocus value={folderNameInput} onChange={e => onFolderNameChange(e.target.value)}
          onBlur={() => onCommitRename(f.id)}
          onKeyDown={e => { if (e.key === 'Enter') onCommitRename(f.id); if (e.key === 'Escape') onCancelRename(); }}
          onClick={e => e.stopPropagation()}
          style={{ flex: 1, background: 'white', border: '1px solid #CBD5E0', outline: 'none', color: '#364152', fontSize: 12.5, borderRadius: 5, padding: '2px 6px', fontFamily: 'inherit' }} />
      ) : (
        <span onDoubleClick={e => { e.stopPropagation(); onStartRename(f.id, f.name); }}
          style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: '#486081', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
      )}
      {hovered && !isRenaming ? (
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4, color: '#94A3B8', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#E53E3E'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94A3B8'}>
          <Trash2 size={11} />
        </button>
      ) : (
        <span style={{ fontSize: 10.5, color: '#CBD5E0', flexShrink: 0 }}>{folderConvos.length}</span>
      )}
    </div>
  );
}

// ─── Recording timer ──────────────────────────────────────────────────────────
function useTimer(running: boolean) {
  const [secs, setSecs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running) { ref.current = setInterval(() => setSecs(s => s + 1), 1000); }
    else { if (ref.current) clearInterval(ref.current); }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);
  const reset = () => setSecs(0);
  const fmt = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  return { fmt, reset };
}

// ─── ChatInner ────────────────────────────────────────────────────────────────
function ChatInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const consultationId = searchParams.get('consultationId');

  // Active tab: 'consultation' | 'chat'
  const [activeTab, setActiveTab] = useState<'consultation' | 'chat'>('consultation');

  const [convos, setConvos] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentId, setCurrentId] = useState<string>('');
  const [activeFolderId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [, setMovingConvoId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const [patientBanner, setPatientBanner] = useState<PatientBanner | null>(null);
  const [persona, setPersona] = useState(DEMO_PERSONA);
  const [recordingPhase, setRecordingPhase] = useState<'idle' | 'recording' | 'paused' | 'transcribing'>('idle');
  const [recordingTranscript, setRecordingTranscript] = useState('');
  const [inputMode, setInputMode] = useState<'mic' | 'text'>('mic');
  const [consultText, setConsultText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRecording = recordingPhase === 'recording';
  const isPaused = recordingPhase === 'paused';
  const isTranscribing = recordingPhase === 'transcribing';
  const { fmt: timerFmt, reset: resetTimer } = useTimer(isRecording);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      const meta = user.user_metadata ?? {};
      const firstName = meta.first_name ?? '';
      const lastName = meta.last_name ?? '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      const initials = ([(firstName[0] ?? ''), (lastName[0] ?? '')].join('').toUpperCase() || user.email?.[0]?.toUpperCase()) ?? '?';
      setPersona({ initials, name: fullName ? `Dr. ${fullName}` : (user.email ?? ''), clinic: meta.clinic_name ?? '' });
      const savedConvos: Conversation[] = JSON.parse(localStorage.getItem('leash-conversations') || '[]');
      const savedFolders: Folder[] = JSON.parse(localStorage.getItem('leash-folders') || '[]');
      setFolders(savedFolders);
      if (savedConvos.length === 0) {
        const id = genId();
        const fresh = [{ id, title: 'Nouvelle consultation', folderId: null, messages: [], createdAt: Date.now() }];
        setConvos(fresh); setCurrentId(id);
        localStorage.setItem('leash-conversations', JSON.stringify(fresh));
      } else {
        setConvos(savedConvos); setCurrentId(savedConvos[0].id);
      }
      const prefill = sessionStorage.getItem('leash-prefill');
      if (prefill) { sessionStorage.removeItem('leash-prefill'); setTimeout(() => { setInput(prefill); setActiveTab('chat'); }, 80); }
    });
  }, [router]);

  useEffect(() => {
    if (!patientId) return;
    fetch(`/api/patients/${patientId}`).then(r => r.json()).then(data => {
      if (data.patient) setPatientBanner({ name: data.patient.name, species: data.patient.species, breed: data.patient.breed, weight_kg: data.patient.weight_kg });
    }).catch(() => {});
  }, [patientId]);

  useEffect(() => {
    if (!consultationId) return;
    fetch(`/api/messages?consultationId=${consultationId}`).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const dbMessages: Message[] = data.map((m: { role: 'user' | 'assistant'; content: string; mode?: string }) => ({ role: m.role, content: m.content, mode: m.mode }));
        setConvos(prev => { const id = prev[0]?.id ?? ''; return prev.map(c => c.id === id ? { ...c, messages: dbMessages } : c); });
      }
    }).catch(() => {});
  }, [consultationId]);

  useEffect(() => { setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); }, [convos, currentId]);

  const save = (updated: Conversation[]) => { setConvos(updated); localStorage.setItem('leash-conversations', JSON.stringify(updated)); };
  const saveFolders = (updated: Folder[]) => { setFolders(updated); localStorage.setItem('leash-folders', JSON.stringify(updated)); };

  const current = convos.find(c => c.id === currentId);
  const messages = current?.messages ?? [];

  function groupConvos(list: Conversation[]) {
    const now = Date.now();
    return {
      today: list.filter(c => now - c.createdAt < 86400000),
      week: list.filter(c => now - c.createdAt >= 86400000 && now - c.createdAt < 604800000),
      older: list.filter(c => now - c.createdAt >= 604800000),
    };
  }

  function newConvo() {
    const id = genId();
    save([{ id, title: 'Nouvelle consultation', folderId: activeFolderId, messages: [], createdAt: Date.now() }, ...convos]);
    setCurrentId(id); setActiveTab('consultation'); setRecordingPhase('idle'); resetTimer(); setRecordingTranscript('');
  }

  function commitRename(id: string) {
    if (!titleInput.trim()) { setEditingTitle(null); return; }
    save(convos.map(c => c.id === id ? { ...c, title: titleInput.trim() } : c)); setEditingTitle(null);
  }

  function addFolder() { setCreatingFolder(true); setNewFolderName(''); setTimeout(() => newFolderInputRef.current?.focus(), 30); }
  function commitNewFolder() {
    if (newFolderName.trim()) saveFolders([...folders, { id: genId(), name: newFolderName.trim(), color: '#0B7A6A', collapsed: false, createdAt: Date.now() }]);
    setCreatingFolder(false); setNewFolderName('');
  }
  function toggleFolderCollapsed(id: string) { saveFolders(folders.map(f => f.id === id ? { ...f, collapsed: !f.collapsed } : f)); }
  function renameFolder(id: string, name: string) { if (!name.trim()) return; saveFolders(folders.map(f => f.id === id ? { ...f, name: name.trim() } : f)); setRenamingFolderId(null); }
  function deleteFolder(id: string) { save(convos.map(c => c.folderId === id ? { ...c, folderId: null } : c)); saveFolders(folders.filter(f => f.id !== id)); }
  function moveConvoToFolder(convoId: string, folderId: string | null) { save(convos.map(c => c.id === convoId ? { ...c, folderId } : c)); setMovingConvoId(null); }
  async function logout() { await supabase.auth.signOut(); router.push('/login'); }

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  async function saveMessageToDB(role: 'user' | 'assistant', content: string, mode = 'chat') {
    if (!consultationId) return;
    try { await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consultationId, role, content, mode }) }); } catch { /* non-critical */ }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput(''); if (textareaRef.current) textareaRef.current.style.height = '48px';
    setLoading(true); setActiveTab('chat');

    const userMsg: Message = { role: 'user', content: text };
    const withUser = convos.map(c => c.id !== currentId ? c : { ...c, messages: [...c.messages, userMsg], title: c.title === 'Nouvelle consultation' ? text.slice(0, 42) : c.title });
    setConvos(withUser.map(c => c.id !== currentId ? c : { ...c, messages: [...c.messages, { role: 'assistant', content: '' }] }));
    localStorage.setItem('leash-conversations', JSON.stringify(withUser));
    await saveMessageToDB('user', text);

    const fetchWithRetry = async (attempt = 1): Promise<Response> => {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text, patientId: patientId ?? undefined, consultationId: consultationId ?? undefined }) });
      if (res.status >= 500 && attempt < 3) { await new Promise(r => setTimeout(r, 2000)); return fetchWithRetry(attempt + 1); }
      return res;
    };

    try {
      const res = await fetchWithRetry();
      if (res.status === 429) {
        const body = await res.json();
        setConvos(cur => { const f = cur.map(c => { if (c.id !== currentId) return c; const msgs = [...c.messages]; msgs[msgs.length - 1] = { role: 'assistant', content: body.message ?? 'Limite atteinte.' }; return { ...c, messages: msgs }; }); localStorage.setItem('leash-conversations', JSON.stringify(f)); return f; });
        setLoading(false); return;
      }
      if (!res.ok || !res.body) throw new Error('Erreur serveur.');
      const sources: Source[] = JSON.parse(res.headers.get('X-Sources') || '[]');
      const responseMode = res.headers.get('X-Response-Mode') ?? 'chat';
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let fullContent = '';
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        fullContent += decoder.decode(value, { stream: true });
        setConvos(cur => cur.map(c => { if (c.id !== currentId) return c; const msgs = [...c.messages]; msgs[msgs.length - 1] = { role: 'assistant', content: fullContent, mode: responseMode }; return { ...c, messages: msgs }; }));
      }
      setConvos(cur => { const f = cur.map(c => { if (c.id !== currentId) return c; const msgs = [...c.messages]; msgs[msgs.length - 1] = { role: 'assistant', content: fullContent, sources, mode: responseMode }; return { ...c, messages: msgs }; }); localStorage.setItem('leash-conversations', JSON.stringify(f)); return f; });
      await saveMessageToDB('assistant', fullContent, responseMode);
    } catch {
      setConvos(cur => { const f = cur.map(c => { if (c.id !== currentId) return c; const msgs = [...c.messages]; msgs[msgs.length - 1] = { role: 'assistant', content: 'Une erreur est survenue.' }; return { ...c, messages: msgs }; }); localStorage.setItem('leash-conversations', JSON.stringify(f)); return f; });
    } finally { setLoading(false); }
  }

  function handleKey(e: React.KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = []; mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordingPhase('transcribing');
        try {
          const fd = new FormData(); fd.append('audio', blob, 'recording.webm');
          const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.text) { setRecordingTranscript(data.text); setRecordingPhase('idle'); return; }
        } catch { /* silent */ }
        setRecordingPhase('idle');
      };
      mr.start(); setRecordingPhase('recording');
    } catch { setRecordingPhase('idle'); }
  }

  function stopRecording() { mediaRecorderRef.current?.stop(); }

  function toggleRecording() {
    if (isRecording) { stopRecording(); }
    else if (isPaused) { setRecordingPhase('recording'); }
    else { resetTimer(); startRecording(); }
  }

  function pauseRecording() {
    if (isRecording) { mediaRecorderRef.current?.pause(); setRecordingPhase('paused'); }
  }

  function finishConsultation() {
    if (isRecording || isPaused) { stopRecording(); }
    if (recordingTranscript) { sendMessage('Génère un compte rendu SOAP pour cette consultation :\n\n' + recordingTranscript); }
  }

  function speciesEmoji(s: string) { if (s === 'chien') return '🐕'; if (s === 'chat') return '🐈'; return '🐾'; }

  const renderConvoItem = (c: Conversation, indent = false) => (
    <ConvoItem key={c.id} c={c} currentId={currentId} folders={folders}
      editingTitle={editingTitle} titleInput={titleInput} indent={indent}
      onSelect={id => { setCurrentId(id); setActiveTab('consultation'); }}
      onDragStart={(e, id) => { e.dataTransfer.setData('convoId', id); setMovingConvoId(id); }}
      onDragEnd={() => setMovingConvoId(null)}
      onStartRename={(id, title) => { setEditingTitle(id); setTitleInput(title); }}
      onTitleChange={setTitleInput} onCommitRename={commitRename}
      onCancelRename={() => setEditingTitle(null)}
      onDelete={(id) => { const updated = convos.filter(c => c.id !== id); save(updated); if (currentId === id) setCurrentId(updated[0]?.id ?? ''); }}
      onMoveToFolder={moveConvoToFolder}
    />
  );

  const EXAMPLES = [
    { icon: '💊', text: 'Protocole antimicrobien pour une pyodermite superficielle chez le chien', tag: 'Pharmacologie' },
    { icon: '🫀', text: 'Staging IRIS insuffisance rénale chronique stade 3 chez le chat', tag: 'Guideline' },
    { icon: '🩺', text: 'Diagnostics différentiels pour un épanchement pleural chez le chat', tag: 'Clinique' },
    { icon: '🔬', text: 'Valeurs normales NFS chien adulte et interprétation leucocytose', tag: 'Biologie' },
    { icon: '⚡', text: 'Protocole CPR RECOVER 2024 arrêt cardio-respiratoire chien', tag: 'Urgences' },
    { icon: '🐾', text: 'Effets secondaires AINS chez le chien insuffisant rénal', tag: 'Pharmacologie' },
  ];

  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Newsreader:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 2px; } ::-webkit-scrollbar-track { background: transparent; }
        .ai-bubble { padding: 14px 18px; border-radius: 4px 14px 14px 14px; background: white; border: 1px solid #E2E8F0; word-break: break-word; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .ai-prose { font-family: 'Manrope', sans-serif; font-size: 13.5px; line-height: 1.78; color: #364152; }
        .ai-prose p { margin: 0 0 10px; } .ai-prose p:last-child { margin-bottom: 0; }
        .ai-prose strong { font-weight: 700; color: #1A202C; }
        .ai-prose em { font-style: italic; color: #6B8F8A; }
        .ai-prose ul { margin: 6px 0 10px; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 5px; }
        .ai-prose ul li { position: relative; padding-left: 18px; }
        .ai-prose ul li::before { content: ''; position: absolute; left: 4px; top: 8px; width: 5px; height: 5px; border-radius: 50%; background: #0B7A6A; }
        .ai-prose ol { margin: 6px 0 10px; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 5px; counter-reset: li; }
        .ai-prose ol li { position: relative; padding-left: 28px; counter-increment: li; }
        .ai-prose ol li::before { content: counter(li); position: absolute; left: 0; top: 1px; min-width: 20px; height: 20px; background: #EDF7F4; border-radius: 5px; font-size: 10px; font-weight: 700; color: #0B7A6A; display: flex; align-items: center; justify-content: center; }
        .ai-prose code { font-family: 'Fira Code', monospace; font-size: 12px; background: #F0FAF7; color: #0B7A6A; padding: 2px 6px; border-radius: 4px; border: 1px solid #BBE0D6; }
        .ai-prose pre { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; overflow-x: auto; margin: 8px 0; }
        .ai-prose pre code { background: none; border: none; padding: 0; color: #364152; }
        .ai-prose h1,.ai-prose h2,.ai-prose h3 { font-family: 'Newsreader',serif; font-weight: 400; color: #1A202C; letter-spacing: -0.02em; margin: 14px 0 6px; }
        .ai-prose h1 { font-size: 20px; } .ai-prose h2 { font-size: 17px; } .ai-prose h3 { font-size: 15px; }
        .ai-prose table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 8px 0; }
        .ai-prose th { background: #EDF7F4; color: #0B7A6A; font-weight: 600; padding: 7px 12px; text-align: left; border: 1px solid #E2E8F0; }
        .ai-prose td { padding: 7px 12px; border: 1px solid #F1F5F9; color: #364152; }
        .chat-input { background: transparent; border: none; outline: none; resize: none; width: 100%; font-family: 'Manrope', sans-serif; font-size: 14px; color: #364152; line-height: 1.6; }
        .chat-input::placeholder { color: #94A3B8; }
        .chat-input::-webkit-scrollbar { display: none; }
        .tab-btn { display: flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; border: none; background: transparent; font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 500; color: #94A3B8; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .tab-btn.active { background: white; color: #364152; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04); }
        .tab-btn:hover:not(.active) { color: #486081; background: rgba(255,255,255,0.6); }
        @keyframes pulse-ring { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.35); opacity: 0; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
        @keyframes waveBar { 0%,100% { transform: scaleY(0.2); } 50% { transform: scaleY(1); } }
        .wave-bar { width: 4px; border-radius: 3px; background: #0B7A6A; transform-origin: center; animation: waveBar var(--dur, 0.9s) ease-in-out infinite; animation-delay: var(--delay, 0s); }
        .mode-pill { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: none; font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .mode-pill.active { background: white; color: #0B7A6A; box-shadow: 0 1px 4px rgba(0,0,0,0.09); }
        .mode-pill.inactive { background: transparent; color: #94A3B8; }
        .mode-pill.inactive:hover { color: #486081; }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Manrope', sans-serif", background: '#F7FAFC' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
        <aside style={{ width: 240, background: 'white', borderRight: '1px solid #EDF1F5', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>

          {/* Logo */}
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #EDF1F5', flexShrink: 0 }}>
            <Logo height={22} />
          </div>

          {/* Nav */}
          <div style={{ padding: '10px 10px 6px', flexShrink: 0 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, color: '#486081', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'background 0.12s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <Home size={14} style={{ flexShrink: 0 }} /> Accueil
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, color: '#94A3B8', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'background 0.12s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <Settings size={14} style={{ flexShrink: 0 }} /> Modules
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, color: '#94A3B8', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'background 0.12s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <HelpCircle size={14} style={{ flexShrink: 0 }} /> Guide d&apos;utilisation
            </div>
          </div>

          <div style={{ height: 1, background: '#EDF1F5', margin: '4px 0' }} />

          {/* New consultation + folder buttons */}
          <div style={{ padding: '8px 10px', flexShrink: 0 }}>
            <button onClick={newConvo}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, border: '1px solid #E2E8F0', cursor: 'pointer', background: 'white', color: '#364152', fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 500, transition: 'all 0.15s', marginBottom: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#BBE0D6'; (e.currentTarget as HTMLElement).style.color = '#0B7A6A'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLElement).style.color = '#364152'; }}>
              <Plus size={14} style={{ color: '#0B7A6A', flexShrink: 0 }} />
              Nouvelle consultation
            </button>

            {creatingFolder ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: '1px solid #BBE0D6', background: '#F0FAF7' }}>
                <FolderPlus size={13} style={{ color: '#0B7A6A', flexShrink: 0 }} />
                <input ref={newFolderInputRef} value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitNewFolder(); if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); } }}
                  onBlur={commitNewFolder}
                  placeholder="Nom du dossier…"
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#364152', fontSize: 12.5, fontFamily: "'Manrope', sans-serif" }}
                />
              </div>
            ) : (
              <button onClick={addFolder}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: '1px solid transparent', cursor: 'pointer', background: 'transparent', color: '#94A3B8', fontFamily: "'Manrope', sans-serif", fontSize: 12.5, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8FAFB'; (e.currentTarget as HTMLElement).style.color = '#486081'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}>
                <FolderPlus size={13} style={{ flexShrink: 0 }} /> Nouveau dossier
              </button>
            )}
          </div>

          {/* Section label */}
          <div style={{ padding: '2px 16px 4px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#CBD5E0', flexShrink: 0 }}>
            Toutes les consultations
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2px 8px 8px' }}>
            {folders.map(f => {
              const folderConvos = convos.filter(c => c.folderId === f.id);
              return (
                <div key={f.id}
                  onDragOver={e => { e.preventDefault(); setDragOverFolderId(f.id); }}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('convoId'); if (id) moveConvoToFolder(id, f.id); setDragOverFolderId(null); }}
                  style={{ marginBottom: 2, borderRadius: 8, outline: dragOverFolderId === f.id ? '1px dashed #0B7A6A' : 'none' }}>
                  <FolderRow f={f} folderConvos={folderConvos} renamingFolderId={renamingFolderId} folderNameInput={folderNameInput}
                    onToggle={() => toggleFolderCollapsed(f.id)}
                    onStartRename={(id, name) => { setRenamingFolderId(id); setFolderNameInput(name); }}
                    onFolderNameChange={setFolderNameInput}
                    onCommitRename={id => renameFolder(id, folderNameInput)}
                    onCancelRename={() => setRenamingFolderId(null)}
                    onDelete={() => deleteFolder(f.id)} />
                  {!f.collapsed && (
                    <div>
                      {folderConvos.map(c => renderConvoItem(c, true))}
                      {folderConvos.length === 0 && <div style={{ padding: '4px 10px 4px 24px', fontSize: 11.5, color: '#CBD5E0', fontStyle: 'italic' }}>Glissez ici</div>}
                    </div>
                  )}
                </div>
              );
            })}

            {(() => {
              const { today, week, older } = groupConvos(convos.filter(c => !c.folderId));
              const isEmpty = convos.filter(c => !c.folderId).length === 0 && folders.length === 0;
              const SL = ({ label }: { label: string }) => <div style={{ padding: '10px 8px 3px', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#CBD5E0' }}>{label}</div>;
              return (
                <>
                  {isEmpty && <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: '#CBD5E0', lineHeight: 1.6 }}>Démarrez votre première consultation</div>}
                  {today.length > 0 && (<><SL label="Aujourd'hui" />{today.map(c => renderConvoItem(c))}</>)}
                  {week.length > 0 && (<><SL label="7 derniers jours" />{week.map(c => renderConvoItem(c))}</>)}
                  {older.length > 0 && (<><SL label="Plus ancien" />{older.map(c => renderConvoItem(c))}</>)}
                </>
              );
            })()}
          </div>

          {/* User row */}
          <div style={{ padding: '10px 12px 14px', borderTop: '1px solid #EDF1F5', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #0B7A6A, #0D9C87)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {persona.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#364152', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{persona.name}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{persona.clinic}</div>
            </div>
            <button onClick={logout} title="Déconnexion"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'transparent', color: '#CBD5E0', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; (e.currentTarget as HTMLElement).style.background = '#FFF5F5'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#CBD5E0'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <LogOut size={14} />
            </button>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F7FAFC' }}>

          {/* Header */}
          <div style={{ padding: '20px 32px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4, fontWeight: 500, textTransform: 'capitalize' }}>
                  {dateStr}
                </div>
                {patientBanner ? (
                  <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 32, fontWeight: 400, color: '#1A202C', letterSpacing: '-0.025em', lineHeight: 1, margin: 0 }}>
                    Consultation — {patientBanner.name}
                  </h1>
                ) : editingTitle === currentId ? (
                  <input
                    autoFocus
                    value={titleInput}
                    onChange={e => setTitleInput(e.target.value)}
                    onBlur={() => commitRename(currentId)}
                    onKeyDown={e => { if (e.key === 'Enter') commitRename(currentId); if (e.key === 'Escape') { setEditingTitle(null); } }}
                    style={{ fontFamily: "'Newsreader', serif", fontSize: 32, fontWeight: 400, color: '#1A202C', letterSpacing: '-0.025em', lineHeight: 1, margin: 0, border: 'none', outline: 'none', background: 'transparent', borderBottom: '2px solid #0B7A6A', padding: '0 2px', width: '100%', maxWidth: 400 }}
                  />
                ) : (
                  <h1
                    onClick={() => { setEditingTitle(currentId); setTitleInput(current?.title || 'Nouvelle consultation'); }}
                    title="Cliquer pour renommer"
                    style={{ fontFamily: "'Newsreader', serif", fontSize: 32, fontWeight: 400, color: '#1A202C', letterSpacing: '-0.025em', lineHeight: 1, margin: 0, cursor: 'text' }}>
                    {current?.title || 'Nouvelle consultation'}
                  </h1>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {recordingTranscript && !isRecording && !isTranscribing && (
                  <button onClick={() => { sendMessage('Génère un compte rendu SOAP pour cette consultation :\n\n' + recordingTranscript); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: '1px solid #BBE0D6', background: '#EDF7F4', color: '#0B7A6A', fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <FileText size={13} /> Générer le SOAP
                  </button>
                )}
                <button onClick={newConvo}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: '#0B7A6A', color: 'white', fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(11,122,106,0.3)', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#096A5A'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#0B7A6A'}>
                  <Plus size={14} /> Nouvelle consultation
                </button>
              </div>
            </div>

            {/* Patient info strip */}
            {patientBanner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: '#EDF7F4', borderRadius: 10, marginBottom: 16, border: '1px solid #BBE0D6' }}>
                <span style={{ fontSize: 20 }}>{speciesEmoji(patientBanner.species)}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0B7A6A' }}>{patientBanner.name}</span>
                {(patientBanner.breed || patientBanner.weight_kg) && (
                  <span style={{ fontSize: 12, color: '#6B8F8A' }}>{[patientBanner.breed, patientBanner.weight_kg ? `${patientBanner.weight_kg} kg` : null].filter(Boolean).join(' · ')}</span>
                )}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EDF1F5', borderRadius: 10, padding: 4, width: 'fit-content' }}>
              <button className={`tab-btn${activeTab === 'consultation' ? ' active' : ''}`} onClick={() => setActiveTab('consultation')}>
                <Mic size={13} /> Consultation
              </button>
              <button className={`tab-btn${activeTab === 'chat' ? ' active' : ''}`} onClick={() => setActiveTab('chat')}>
                <FileText size={13} />
                Assistant IA
                {messages.length > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0B7A6A', display: 'inline-block' }} />}
              </button>
            </div>
          </div>

          {/* ── CONSULTATION TAB ─────────────────────────────────────────────── */}
          {activeTab === 'consultation' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Recording timer bar (only shown when recording/paused) */}
              {(isRecording || isPaused) && (
                <div style={{ flexShrink: 0, padding: '10px 32px', borderBottom: '1px solid #EDF1F5', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: isRecording ? '#22C55E' : '#F59E0B', boxShadow: isRecording ? '0 0 0 3px rgba(34,197,94,0.2)' : 'none' }} />
                  <span style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 300, color: '#1A202C', letterSpacing: '-0.04em', lineHeight: 1 }}>{timerFmt}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{isPaused ? 'en pause' : 'en cours'}</span>
                </div>
              )}

              {/* Content area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

                {isTranscribing ? (
                  /* ── Transcribing ── */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                      <div style={{ position: 'relative', width: 64, height: 64 }}>
                        <motion.div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #0B7A6A' }}
                          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity }} />
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#EDF7F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Logo mark height={24} />
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: '#486081', fontWeight: 500 }}>Transcription en cours…</div>
                    </motion.div>
                  </div>

                ) : recordingTranscript && !isRecording ? (
                  /* ── Transcript ready — full page edit ── */
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
                      <div style={{ maxWidth: 860, margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#22C55E', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Transcription prête</span>
                          <span style={{ fontSize: 12, color: '#CBD5E0', marginLeft: 'auto' }}>Modifiez si nécessaire</span>
                        </div>
                        <textarea value={recordingTranscript} onChange={e => setRecordingTranscript(e.target.value)}
                          style={{ width: '100%', minHeight: 'calc(100vh - 340px)', background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, outline: 'none', padding: '20px 24px', fontFamily: "'Manrope', sans-serif", fontSize: 14.5, color: '#364152', lineHeight: 1.8, resize: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} />
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, padding: '14px 32px', borderTop: '1px solid #EDF1F5', background: 'white', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                      <button onClick={() => setRecordingTranscript('')}
                        style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #E2E8F0', background: 'white', fontSize: 13, color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                        Recommencer
                      </button>
                      <button onClick={finishConsultation}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 9, border: 'none', background: '#0B7A6A', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(11,122,106,0.3)' }}>
                        <FileText size={13} /> Générer le compte-rendu SOAP
                      </button>
                    </div>
                  </motion.div>

                ) : inputMode === 'text' ? (
                  /* ── Text mode — full page textarea ── */
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
                      <div style={{ maxWidth: 860, margin: '0 auto', height: '100%' }}>
                        <textarea value={consultText} onChange={e => setConsultText(e.target.value)}
                          placeholder="Saisissez vos observations de consultation ici&#10;&#10;Exemple : Chien, Golden Retriever, 5 ans, 32 kg. Boiterie membre postérieur droit depuis 3 jours. Douleur à la palpation du genou droit. Légère tuméfaction. Pas de traumatisme connu..."
                          style={{ width: '100%', height: 'calc(100vh - 300px)', background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, outline: 'none', padding: '20px 24px', fontFamily: "'Manrope', sans-serif", fontSize: 14.5, color: '#364152', lineHeight: 1.8, resize: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} />
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, padding: '14px 32px', borderTop: '1px solid #EDF1F5', background: 'white', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                      <button onClick={() => { if (consultText.trim()) { sendMessage('Génère un compte rendu SOAP pour cette consultation :\n\n' + consultText); setConsultText(''); } }}
                        disabled={!consultText.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 9, border: 'none', background: consultText.trim() ? '#0B7A6A' : '#F1F5F9', color: consultText.trim() ? 'white' : '#94A3B8', fontSize: 13, fontWeight: 600, cursor: consultText.trim() ? 'pointer' : 'default', fontFamily: 'inherit', boxShadow: consultText.trim() ? '0 2px 10px rgba(11,122,106,0.3)' : 'none', transition: 'all 0.15s' }}>
                        <FileText size={13} /> Générer le compte-rendu SOAP
                      </button>
                    </div>
                  </motion.div>

                ) : (
                  /* ── Mic mode ── */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', gap: 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 600px 400px at 50% 50%, rgba(11,122,106,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    {isRecording ? (
                      /* ── Active recording UI ── */
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, position: 'relative', zIndex: 1 }}>

                        {/* Animated waveform */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, height: 80 }}>
                          {[
                            { h: 18, dur: '0.7s', delay: '0s' }, { h: 38, dur: '0.9s', delay: '0.08s' },
                            { h: 55, dur: '0.6s', delay: '0.16s' }, { h: 72, dur: '1.1s', delay: '0.04s' },
                            { h: 62, dur: '0.8s', delay: '0.22s' }, { h: 80, dur: '0.7s', delay: '0.12s' },
                            { h: 68, dur: '0.9s', delay: '0.28s' }, { h: 80, dur: '0.65s', delay: '0.06s' },
                            { h: 74, dur: '1.0s', delay: '0.18s' }, { h: 80, dur: '0.75s', delay: '0.32s' },
                            { h: 72, dur: '0.85s', delay: '0.10s' }, { h: 80, dur: '0.7s', delay: '0.24s' },
                            { h: 60, dur: '0.9s', delay: '0.36s' }, { h: 78, dur: '0.8s', delay: '0.14s' },
                            { h: 52, dur: '0.7s', delay: '0.26s' }, { h: 70, dur: '1.1s', delay: '0.40s' },
                            { h: 42, dur: '0.85s', delay: '0.20s' }, { h: 58, dur: '0.75s', delay: '0.30s' },
                            { h: 30, dur: '0.9s', delay: '0.44s' }, { h: 20, dur: '0.7s', delay: '0.16s' },
                          ].map((b, i) => (
                            <div key={i} className="wave-bar" style={{ height: b.h, '--dur': b.dur, '--delay': b.delay } as React.CSSProperties} />
                          ))}
                        </div>

                        <p style={{ fontSize: 15, fontWeight: 600, color: '#1A202C', margin: 0 }}>Consultation en cours…</p>

                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={pauseRecording}
                            style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', color: '#486081', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            Pause
                          </button>
                          <button onClick={toggleRecording}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, border: 'none', background: '#FEE2E2', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            <Square size={12} fill="#DC2626" /> Arrêter
                          </button>
                          <button onClick={finishConsultation}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, border: 'none', background: '#0B7A6A', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(11,122,106,0.3)' }}>
                            <FileText size={13} /> Terminer et générer
                          </button>
                        </div>
                      </motion.div>

                    ) : isPaused ? (
                      /* ── Paused ── */
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {[0,1,2,3,4].map(i => <div key={i} style={{ width: 4, height: 32, borderRadius: 3, background: '#E2E8F0' }} />)}
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#94A3B8', margin: 0 }}>Consultation en pause</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={toggleRecording}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, border: '1.5px solid #BBE0D6', background: '#EDF7F4', color: '#0B7A6A', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            <Mic size={14} /> Reprendre
                          </button>
                          <button onClick={finishConsultation}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, border: 'none', background: '#0B7A6A', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(11,122,106,0.3)' }}>
                            <FileText size={13} /> Terminer et générer
                          </button>
                        </div>
                      </motion.div>

                    ) : (
                      /* ── Idle / start ── */
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, position: 'relative', zIndex: 1 }}>

                        {/* Pulsing mic button */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '1px solid rgba(11,122,106,0.2)', background: 'rgba(11,122,106,0.04)' }}
                              animate={{ width: [80, 80 + (i + 1) * 40], height: [80, 80 + (i + 1) * 40], opacity: [0.6, 0] }}
                              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.6 }} />
                          ))}
                          <button onClick={toggleRecording}
                            style={{ width: 80, height: 80, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #0B7A6A, #0D9C87)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(11,122,106,0.4)', position: 'relative', zIndex: 1, transition: 'transform 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}>
                            <Mic size={28} />
                          </button>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 16, fontWeight: 600, color: '#364152', margin: '0 0 6px' }}>Démarrer l&apos;enregistrement</p>
                          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, maxWidth: 340, lineHeight: 1.6 }}>
                            Dictez vos observations pendant la consultation. VetaIA génère automatiquement le compte-rendu SOAP.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── AI CHAT TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px 32px 0' }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
                {messages.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8 }}>
                    <p style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                      Posez une question clinique ou essayez un exemple :
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      {EXAMPLES.map((ex, i) => (
                        <motion.button key={ex.text} onClick={() => sendMessage(ex.text)}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, textAlign: 'left', background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 16px 16px', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                          whileHover={{ borderColor: '#BBE0D6', boxShadow: '0 2px 12px rgba(11,122,106,0.1)', y: -2 }}>
                          <span style={{ fontSize: 22, lineHeight: 1 }}>{ex.icon}</span>
                          <span style={{ fontSize: 12.5, color: '#486081', lineHeight: 1.5, flex: 1 }}>{ex.text}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0B7A6A', background: '#EAF4F2', padding: '2px 7px', borderRadius: 99 }}>{ex.tag}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 8 }}>
                    <AnimatePresence initial={false}>
                      {messages.map((msg, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          {msg.role === 'user' ? (
                            <div style={{ maxWidth: '62%', padding: '11px 16px', borderRadius: '16px 4px 16px 16px', background: '#0B7A6A', color: 'white', fontSize: 13.5, lineHeight: 1.65, fontWeight: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxShadow: '0 2px 8px rgba(11,122,106,0.25)' }}>
                              {msg.content}
                            </div>
                          ) : (
                            <div style={{ maxWidth: '78%' }}>
                              <AIMessage content={msg.content} sources={msg.sources}
                                isStreaming={loading && i === messages.length - 1} mode={msg.mode} />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ flexShrink: 0, paddingBottom: 20 }}>
                <motion.div
                  animate={{ borderColor: '#E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16 }}>
                  <div style={{ padding: '12px 16px 6px' }}>
                    <textarea ref={textareaRef} value={input}
                      onChange={e => { setInput(e.target.value); autoResize(); }}
                      onKeyDown={handleKey}
                      placeholder="Posez votre question vétérinaire…"
                      rows={1} className="chat-input"
                      style={{ height: 48, minHeight: 48, maxHeight: 160 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px 10px' }}>
                    <span style={{ fontSize: 11, color: '#CBD5E0' }}>⏎ Envoyer · Shift+⏎ Saut de ligne</span>
                    <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 9, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', background: input.trim() && !loading ? '#0B7A6A' : '#F1F5F9', color: input.trim() && !loading ? 'white' : '#94A3B8', fontSize: 13, fontWeight: 600, fontFamily: "'Manrope', sans-serif", boxShadow: input.trim() && !loading ? '0 2px 8px rgba(11,122,106,0.3)' : 'none', transition: 'all 0.15s' }}>
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}><Send size={13} /></motion.div>
                      ) : <Send size={13} />}
                      Envoyer
                    </button>
                  </div>
                </motion.div>
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#CBD5E0' }}>
                  VetaIA peut faire des erreurs — vérifiez toujours les informations cliniques critiques.
                </div>
              </div>
            </div>
          )}

          {/* ── Bottom toolbar ───────────────────────────────────────────────── */}
          <div style={{ height: 48, flexShrink: 0, borderTop: '1px solid #EDF1F5', background: 'white', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
            {/* Mode toggle — only relevant on consultation tab */}
            {activeTab === 'consultation' && (
              <div style={{ display: 'flex', alignItems: 'center', background: '#EDF1F5', borderRadius: 8, padding: 3 }}>
                <button className={`mode-pill ${inputMode === 'mic' ? 'active' : 'inactive'}`} onClick={() => setInputMode('mic')}>
                  <Mic size={12} /> Microphone
                </button>
                <button className={`mode-pill ${inputMode === 'text' ? 'active' : 'inactive'}`} onClick={() => setInputMode('text')}>
                  <Pencil size={12} /> Saisie manuelle
                </button>
              </div>
            )}

            {/* Transcript shortcut */}
            {recordingTranscript && activeTab === 'consultation' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 8, background: '#EDF7F4', border: '1px solid #BBE0D6', cursor: 'pointer' }}
                onClick={() => setActiveTab('chat')}>
                <FileText size={12} style={{ color: '#0B7A6A' }} />
                <span style={{ fontSize: 12, color: '#0B7A6A', fontWeight: 500 }}>Transcription prête</span>
              </div>
            )}

            {/* Status dot */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 8, background: '#F7FAFC', border: '1px solid #EDF1F5' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isRecording ? '#22C55E' : '#CBD5E0' }} />
              <span style={{ fontSize: 12, color: '#486081', fontWeight: 500 }}>
                {patientBanner ? `${patientBanner.name}` : current?.title || 'Consultation'}
              </span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F7FAFC', fontFamily: "'Manrope', sans-serif", color: '#94A3B8', fontSize: 14 }}>
        Chargement…
      </div>
    }>
      <ChatInner />
    </Suspense>
  );
}
