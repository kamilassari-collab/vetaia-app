// ─── Client-safe types and utilities (no Supabase imports) ───────────────────

export type Species = 'chien' | 'chat' | 'nac' | 'autre';
export type Sex = 'Mâle' | 'Femelle' | 'Mâle castré' | 'Femelle stérilisée';

export interface Patient {
  id: string;
  vet_id: string;
  name: string;
  species: Species;
  breed?: string;
  sex?: Sex;
  birth_date?: string;
  weight_kg?: number;
  microchip?: string;
  owner_name?: string;
  owner_phone?: string;
  notes?: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  vet_id: string;
  date: string;
  raw_notes?: string;
  soap_report?: string;
  intent?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  consultation_id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: string;
  created_at: string;
}

export function speciesEmoji(species: string): string {
  if (species === 'chien') return '🐕';
  if (species === 'chat') return '🐈';
  return '🐾';
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth() + (years * 12);
  const adjustedYears = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (adjustedYears === 0) return `${remainingMonths} mois`;
  return `${adjustedYears} an${adjustedYears > 1 ? 's' : ''}`;
}
