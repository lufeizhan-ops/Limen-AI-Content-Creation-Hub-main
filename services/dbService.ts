import { Project } from '../types';
import { getSupabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'contentforge_projects_v1';

// Helper to handle Date objects when parsing JSON
const dateTimeReviver = (key: string, value: any) => {
  if (key === 'updatedAt') return new Date(value);
  return value;
};

export const getProjects = async (): Promise<Project[]> => {
  const supabase = getSupabase();

  // 1. Try Supabase
  if (supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (!error && data) {
      // Map the JSONB 'data' column back to our Project type
      return data.map((row: any) => ({
        ...row.data,
        id: row.id,
        updatedAt: new Date(row.updated_at)
      }));
    } else {
      console.error('Supabase fetch error:', error);
    }
  }

  // 2. Fallback to LocalStorage
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored, dateTimeReviver);
  } catch (error) {
    console.error('Failed to load projects from local storage:', error);
    return [];
  }
};

export const saveProject = async (project: Project): Promise<void> => {
  const supabase = getSupabase();

  // 1. Try Supabase
  if (supabase) {
    const { error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        updated_at: new Date().toISOString(),
        data: project // Store the full object as JSON
      });

    if (error) {
      console.error('Supabase save error:', error);
      throw new Error('Failed to save to backend');
    }
    return;
  }

  // 2. Fallback to LocalStorage
  const projects = await getProjects(); // Note: This might try to fetch from Supabase if connected, which is fine.
  
  // However, if we are here, it likely means supabase was null, so getProjects probably pulled from LS.
  // If getProjects pulled from Supabase but saveProject failed (unlikely path unless connection dropped),
  // we might overwrite local data. To be safe, we should strictly read LS here if we are saving to LS.
  
  let localProjects: Project[] = [];
  try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) localProjects = JSON.parse(stored, dateTimeReviver);
  } catch (e) { /* ignore */ }

  const index = localProjects.findIndex(p => p.id === project.id);
  let updatedProjects = [...localProjects];
  
  if (index >= 0) {
    updatedProjects[index] = project;
  } else {
    updatedProjects = [project, ...localProjects];
  }
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
};

export const deleteProject = async (id: string): Promise<void> => {
    const supabase = getSupabase();

    // 1. Try Supabase
    if (supabase) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Supabase delete error:', error);
            throw new Error('Failed to delete from backend');
        }
        return;
    }

    // 2. Fallback to LocalStorage
    let localProjects: Project[] = [];
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) localProjects = JSON.parse(stored, dateTimeReviver);
    } catch (e) { /* ignore */ }

    const updatedProjects = localProjects.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
};