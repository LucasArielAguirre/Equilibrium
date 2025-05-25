import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Usuario {
  id: number;
  user: string;
  correo: string;
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('User')
    .select('id, user, correo');

  if (error) {
    console.error('Error al obtener usuarios:', error.message);
    return [];
  }

  return data || [];
}