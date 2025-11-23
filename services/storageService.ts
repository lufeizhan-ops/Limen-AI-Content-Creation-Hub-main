import { Project } from '../types';

const STORAGE_KEY = 'contentforge_projects_v1';

// Helper to revive dates from JSON
const dateTimeReviver = (key: string, value: any) => {
  if (key === 'updatedAt') return new Date(value);
  return value;
};

export const getProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored, dateTimeReviver);
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects:', error);
  }
};

export const deleteProject = (id: string): Project[] => {
    const projects = getProjects();
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated);
    return updated;
};
