import React, { useState, useEffect } from 'react';
import { Project, ProjectStage, ProjectStrategy } from './types';
import { StrategyStage, TitlesStage, OutlineStage, DraftReviewStage } from './components/ProjectStages';
import { IconFileText, IconPlus, IconArrowRight, IconLoader, IconTrash, IconDatabase, IconSettings } from './components/Icons';
import { Button } from './components/Button';
import { SettingsModal } from './components/SettingsModal';
import * as dbService from './services/dbService';
import { getSupabase } from './services/supabaseClient';

// Robust UUID generator for Postgres compatibility
const generateId = () => crypto.randomUUID();

const App: React.FC = () => {
  const [view, setView] = useState<'DASHBOARD' | 'PROJECT'>('DASHBOARD');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load projects on mount
  const loadData = async () => {
      setAppLoading(true);
      const data = await dbService.getProjects();
      setProjects(data);
      setIsConnected(!!getSupabase());
      setAppLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Create New Project
  const handleCreateProject = async () => {
    const newProject: Project = {
      id: generateId(),
      name: 'Untitled Project',
      updatedAt: new Date(),
      stage: ProjectStage.STRATEGY,
      strategy: {} as ProjectStrategy, 
      generatedTitles: [],
      selectedTitle: null,
      outline: '',
      draft: '',
      revisionHistory: []
    };

    // Optimistic Update
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    setView('PROJECT');

    // Async Save
    await dbService.saveProject(newProject);
  };

  // Centralized Update Logic
  const updateProject = async (id: string, updates: Partial<Project>) => {
    const currentProject = projects.find(p => p.id === id);
    if (!currentProject) return;

    const updatedProject = { 
      ...currentProject, 
      ...updates, 
      updatedAt: new Date() 
    };

    // Optimistic Update
    setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));

    // Async Save
    try {
      await dbService.saveProject(updatedProject);
    } catch (e) {
      console.error("Failed to save project", e);
      // Ideally revert optimistic update here if needed
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(!window.confirm("Are you sure you want to delete this project?")) return;

      // Optimistic update
      setProjects(prev => prev.filter(p => p.id !== id));

      try {
          await dbService.deleteProject(id);
      } catch (e) {
          console.error("Failed to delete project", e);
          // Ideally reload projects here
      }
  };

  const renderStage = () => {
    if (!activeProject) return null;

    switch (activeProject.stage) {
      case ProjectStage.STRATEGY:
        return (
          <StrategyStage 
            onNext={(strategy) => updateProject(activeProject.id, { strategy, stage: ProjectStage.TITLES })} 
          />
        );
      case ProjectStage.TITLES:
        return (
          <TitlesStage 
            strategy={activeProject.strategy}
            existingTitles={activeProject.generatedTitles}
            onTitlesGenerated={(titles) => updateProject(activeProject.id, { generatedTitles: titles })}
            onSelect={(title) => updateProject(activeProject.id, { 
              selectedTitle: title, 
              name: title, 
              stage: ProjectStage.OUTLINE 
            })}
          />
        );
      case ProjectStage.OUTLINE:
        return (
          <OutlineStage 
            project={activeProject}
            onOutlineUpdate={(outline) => updateProject(activeProject.id, { outline })}
            onNext={() => updateProject(activeProject.id, { stage: ProjectStage.DRAFTING })}
          />
        );
      case ProjectStage.DRAFTING:
      case ProjectStage.REVIEW:
        return (
          <DraftReviewStage 
            project={activeProject}
            onDraftUpdate={(draft) => updateProject(activeProject.id, { draft })}
            onMetadataUpdate={(meta) => updateProject(activeProject.id, meta)}
            onComplete={() => {
              updateProject(activeProject.id, { stage: ProjectStage.COMPLETED });
              setView('DASHBOARD');
            }}
          />
        );
      case ProjectStage.COMPLETED:
          return (
              <DraftReviewStage 
                  project={activeProject}
                  readOnly={true}
              />
          );
      default:
        return <div>Error: Unknown Stage</div>;
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <IconLoader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Dashboard View
  if (view === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">CF</div>
            <span className="text-xl font-bold text-gray-900">ContentForge AI</span>
          </div>
          <div className="flex items-center gap-4">
             <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${isConnected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                <IconDatabase className="w-3 h-3" />
                {isConnected ? 'Cloud' : 'Local'}
             </div>
             <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Backend Settings"
             >
                 <IconSettings className="w-5 h-5" />
             </button>
            <Button onClick={handleCreateProject} icon={<IconPlus />}>New Project</Button>
          </div>
        </nav>
        
        <main className="max-w-5xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Projects</h1>
          
          {projects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <IconFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
              <p className="text-gray-500 mb-6">Start creating SEO-optimized content with AI.</p>
              <Button onClick={handleCreateProject}>Create First Project</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map(project => (
                <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors flex justify-between items-center group">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          project.stage === ProjectStage.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.stage}
                      </span>
                      <span>Updated {project.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => {
                        setActiveProjectId(project.id);
                        setView('PROJECT');
                    }} icon={<IconArrowRight />}>
                        Open
                    </Button>
                    <Button variant="secondary" className="text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={(e) => handleDeleteProject(project.id, e)}>
                        <IconTrash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)}
            onSave={() => loadData()} 
        />
      </div>
    );
  }

  // Project View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('DASHBOARD')} className="text-gray-500 hover:text-gray-900">
            ← Back
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">
            {activeProject?.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Current Stage:</span>
          <span className="font-semibold text-indigo-600">{activeProject?.stage}</span>
        </div>
      </nav>

      <main className="flex-1 p-6 overflow-hidden">
        {renderStage()}
      </main>
    </div>
  );
};

export default App;