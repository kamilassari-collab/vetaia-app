// ─── Server-only: all functions use supabaseAdmin (service role key) ─────────
// DO NOT import this file in 'use client' components.
// Import types/utils from @/lib/patient-utils instead.

import { createClient } from '@supabase/supabase-js';
export type { Species, Sex, Patient, Consultation, ChatMessage } from './patient-utils';
export { speciesEmoji, calculateAge } from './patient-utils';
import type { Patient, Consultation, ChatMessage } from './patient-utils';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function createPatient(data: Omit<Patient, 'id' | 'created_at'>): Promise<Patient> {
  const { data: patient, error } = await getAdmin()
    .from('patients')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return patient;
}

export async function getPatients(vetId: string): Promise<Patient[]> {
  const { data, error } = await getAdmin()
    .from('patients')
    .select('*')
    .eq('vet_id', vetId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const { data: patient, error } = await getAdmin()
    .from('patients')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return patient;
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await getAdmin()
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getPatientHistory(patientId: string): Promise<Consultation[]> {
  const { data, error } = await getAdmin()
    .from('consultations')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConsultation(patientId: string, vetId: string): Promise<Consultation> {
  const { data, error } = await getAdmin()
    .from('consultations')
    .insert({ patient_id: patientId, vet_id: vetId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConsultationReport(consultationId: string, soapReport: string, rawNotes?: string): Promise<void> {
  const update: Record<string, string> = { soap_report: soapReport };
  if (rawNotes) update.raw_notes = rawNotes;
  const { error } = await getAdmin()
    .from('consultations')
    .update(update)
    .eq('id', consultationId);
  if (error) throw error;
}

export async function appendRawNotes(consultationId: string, newNote: string): Promise<void> {
  const { data } = await getAdmin()
    .from('consultations')
    .select('raw_notes')
    .eq('id', consultationId)
    .single();
  const existing = data?.raw_notes ?? '';
  const updated = existing
    ? `${existing}\n\n[${new Date().toLocaleTimeString('fr-FR')}] ${newNote}`
    : `[${new Date().toLocaleTimeString('fr-FR')}] ${newNote}`;
  await getAdmin().from('consultations').update({ raw_notes: updated }).eq('id', consultationId);
}

export async function saveMessage(consultationId: string, role: 'user' | 'assistant', content: string, mode = 'chat'): Promise<void> {
  const { error } = await getAdmin()
    .from('chat_messages')
    .insert({ consultation_id: consultationId, role, content, mode });
  if (error) throw error;
}

export async function getMessages(consultationId: string): Promise<ChatMessage[]> {
  const { data, error } = await getAdmin()
    .from('chat_messages')
    .select('*')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
