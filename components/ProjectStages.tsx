import React, { useState, useMemo } from 'react';
import { Project, ProjectStrategy, WritingTone, TargetLanguage, ProjectStage } from '../types';
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '../constants';
import { Button } from './Button';
import { IconArrowRight, IconCheckCircle, IconEdit3, IconRefreshCw, IconLoader, IconCopy, IconEye, IconCode } from './Icons';
import * as geminiService from '../services/geminiService';
import { marked } from 'marked';

// -------------------------
// STAGE 1: STRATEGY
// -------------------------
interface StrategyStageProps {
  onNext: (strategy: ProjectStrategy) => void;
}

export const StrategyStage: React.FC<StrategyStageProps> = ({ onNext }) => {
  const [form, setForm] = useState<ProjectStrategy>({
    topic: '',
    audience: '',
    keywords: '',
    language: TargetLanguage.ENGLISH,
    tone: WritingTone.PROFESSIONAL,
    customTone: '',
    customRules: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.topic && form.audience) {
      onNext(form);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Content Strategy</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Subject</label>
                    <input
                        type="text"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                        placeholder="e.g., The Future of Remote Work in 2024"
                        value={form.topic}
                        onChange={e => setForm({ ...form, topic: e.target.value })}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <input
                        type="text"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                        placeholder="e.g., HR Managers, Small Business Owners"
                        value={form.audience}
                        onChange={e => setForm({ ...form, audience: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (Comma separated)</label>
                    <input
                        type="text"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                        placeholder="e.g., remote work trends, employee engagement"
                        value={form.keywords}
                        onChange={e => setForm({ ...form, keywords: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
                    <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    value={form.language}
                    onChange={e => setForm({ ...form, language: e.target.value as TargetLanguage })}
                    >
                    {LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
                    <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    value={form.tone}
                    onChange={e => setForm({ ...form, tone: e.target.value as WritingTone })}
                    >
                    {TONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                {form.tone === WritingTone.CUSTOM && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Tone Instructions</label>
                        <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                        rows={2}
                        placeholder="Describe the specific persona or style..."
                        value={form.customTone}
                        onChange={e => setForm({ ...form, customTone: e.target.value })}
                        />
                    </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <label className="block text-sm font-bold text-yellow-900 mb-1">Strict Content Rules (Optional)</label>
                    <p className="text-xs text-yellow-700 mb-2">Define hard constraints for the AI.</p>
                    <textarea
                        className="w-full p-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-sm text-gray-900"
                        rows={6}
                        placeholder="e.g.,&#10;- Do not use emojis&#10;- Use British spelling&#10;- Avoid passive voice&#10;- No intro fluff, start directly"
                        value={form.customRules}
                        onChange={e => setForm({ ...form, customRules: e.target.value })}
                    />
                </div>
            </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" icon={<IconArrowRight />}>Generate Titles</Button>
        </div>
      </form>
    </div>
  );
};

// -------------------------
// STAGE 2: TITLES
// -------------------------
interface TitlesStageProps {
  strategy: ProjectStrategy;
  existingTitles: string[];
  onTitlesGenerated: (titles: string[]) => void;
  onSelect: (title: string) => void;
}

export const TitlesStage: React.FC<TitlesStageProps> = ({ strategy, existingTitles, onTitlesGenerated, onSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const titles = await geminiService.generateTitles(strategy);
      onTitlesGenerated(titles);
    } catch (err) {
      setError('Failed to generate titles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial generation on mount if no titles exist
  React.useEffect(() => {
    if (existingTitles.length === 0) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmSelection = () => {
    if (selectedIdx !== null) {
      onSelect(existingTitles[selectedIdx]);
    }
  };

  if (loading && existingTitles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm h-96">
        <IconRefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Analyzing Keywords & Generating SEO Titles...</h3>
        <p className="text-gray-500 mt-2">This uses Gemini Flash for rapid ideation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 2: Select a Title</h2>
        <Button variant="secondary" onClick={handleGenerate} isLoading={loading} icon={<IconRefreshCw />}>
          Regenerate
        </Button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">{error}</div>}

      <div className="space-y-3">
        {existingTitles.map((title, idx) => (
          <div 
            key={idx}
            onClick={() => setSelectedIdx(idx)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedIdx === idx 
                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start">
              <div className={`w-5 h-5 mt-1 rounded-full border flex items-center justify-center mr-3 ${
                selectedIdx === idx ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
              }`}>
                {selectedIdx === idx && <IconCheckCircle className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className={`font-medium ${selectedIdx === idx ? 'text-indigo-900' : 'text-gray-800'}`}>
                  {title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          disabled={selectedIdx === null} 
          onClick={confirmSelection}
          icon={<IconArrowRight />}
        >
          Confirm Title & Generate Outline
        </Button>
      </div>
    </div>
  );
};

// -------------------------
// STAGE 3: OUTLINE
// -------------------------
interface OutlineStageProps {
  project: Project;
  onOutlineUpdate: (outline: string) => void;
  onNext: () => void;
}

export const OutlineStage: React.FC<OutlineStageProps> = ({ project, onOutlineUpdate, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localOutline, setLocalOutline] = useState(project.outline);

  React.useEffect(() => {
    // Generate outline if empty
    const init = async () => {
      if (!project.outline && !loading) {
        setLoading(true);
        try {
          const generated = await geminiService.generateOutline(project.selectedTitle!, project.strategy);
          onOutlineUpdate(generated);
          setLocalOutline(generated);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm h-96">
        <IconLoader className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Structuring your article...</h3>
        <p className="text-gray-500 mt-2">Creating headers and key talking points.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Step 3: Review Outline</h2>
          <p className="text-gray-500 text-sm mt-1">Edit the structure before we write the full draft.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" onClick={() => setEditing(!editing)} icon={<IconEdit3 />}>
            {editing ? 'Done Editing' : 'Edit Outline'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 min-h-[400px]">
        {editing ? (
          <textarea 
            className="w-full h-[500px] p-4 bg-white border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={localOutline}
            onChange={(e) => setLocalOutline(e.target.value)}
          />
        ) : (
           <div className="prose prose-indigo max-w-none whitespace-pre-wrap font-mono text-sm text-gray-800">
             {localOutline}
           </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button onClick={() => {
          onOutlineUpdate(localOutline);
          onNext();
        }} icon={<IconArrowRight />}>
          Approve & Write Draft
        </Button>
      </div>
    </div>
  );
};

// -------------------------
// STAGE 4: DRAFT & REVIEW
// -------------------------
interface DraftReviewStageProps {
  project: Project;
  onDraftUpdate?: (draft: string) => void;
  onMetadataUpdate?: (meta: { slug: string; shortText: string; introText: string }) => void;
  onComplete?: () => void;
  readOnly?: boolean;
}

export const DraftReviewStage: React.FC<DraftReviewStageProps> = ({ project, onDraftUpdate, onMetadataUpdate, onComplete, readOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy to Clipboard');
  const [viewMode, setViewMode] = useState<'PREVIEW' | 'MARKDOWN'>('PREVIEW');
  
  // Local state for metadata editing
  const [localMeta, setLocalMeta] = useState({
      slug: project.slug || '',
      shortText: project.shortText || '',
      introText: project.introText || ''
  });

  // Sync local state if project updates
  React.useEffect(() => {
      setLocalMeta({
        slug: project.slug || '',
        shortText: project.shortText || '',
        introText: project.introText || ''
      });
  }, [project.slug, project.shortText, project.introText]);

  React.useEffect(() => {
    // Generate draft if empty and not readonly
    const init = async () => {
      if (!project.draft && !loading && project.outline && !readOnly && onDraftUpdate) {
        setLoading(true);
        try {
          const draft = await geminiService.generateDraft(project.selectedTitle!, project.outline, project.strategy);
          onDraftUpdate(draft);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevision = async () => {
    if (!revisionPrompt || !onDraftUpdate) return;
    setIsRevising(true);
    try {
      const newDraft = await geminiService.reviseDraft(project.draft, revisionPrompt, project.strategy);
      onDraftUpdate(newDraft);
      setRevisionPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRevising(false);
    }
  };

  const handleGenerateMetadata = async () => {
      setIsGeneratingMeta(true);
      try {
          const meta = await geminiService.generateSeoMetadata(project.draft, project.strategy);
          if (onMetadataUpdate) {
              onMetadataUpdate(meta);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingMeta(false);
      }
  };

  const handleMetaChange = (field: string, value: string) => {
      const updated = { ...localMeta, [field]: value };
      setLocalMeta(updated);
      if (onMetadataUpdate) {
          onMetadataUpdate(updated);
      }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(project.draft);
    setCopyLabel('Copied!');
    setTimeout(() => setCopyLabel('Copy to Clipboard'), 2000);
  };

  const wordCount = useMemo(() => {
    if (!project.draft) return 0;
    return project.draft.trim().split(/\s+/).length;
  }, [project.draft]);

  const renderContent = () => {
      if (viewMode === 'PREVIEW') {
          // @ts-ignore - marked type definition issue in pure browser import
          const html = marked.parse(project.draft);
          return <div className="prose prose-indigo max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <div className="prose prose-indigo max-w-none whitespace-pre-wrap font-mono text-sm text-gray-800">{project.draft}</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm h-96">
        <IconLoader className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Writing your content...</h3>
        <p className="text-gray-500 mt-2">Optimizing for GEO (Generative Engine Optimization) and SEO.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      {/* Left Panel: Draft Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <div className="flex items-center gap-3">
               <h3 className="font-semibold text-gray-800">Draft Preview</h3>
               <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full shadow-sm">
                   {wordCount} words
               </span>
           </div>
           <button 
                onClick={() => setViewMode(viewMode === 'PREVIEW' ? 'MARKDOWN' : 'PREVIEW')}
                className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
            >
               {viewMode === 'PREVIEW' ? <IconCode className="w-3 h-3" /> : <IconEye className="w-3 h-3" />}
               {viewMode === 'PREVIEW' ? 'View Source' : 'View Preview'}
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {renderContent()}
        </div>
      </div>

      {/* Right Panel: Feedback, SEO & Controls */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4 overflow-hidden">
          
          {/* Card 1: Status & Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Actions</h3>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
               <div className={`${readOnly ? 'bg-green-50' : 'bg-indigo-50'} p-4 rounded-lg`}>
                 <h4 className={`text-sm font-bold ${readOnly ? 'text-green-900' : 'text-indigo-900'} mb-1`}>
                    Status: {readOnly ? 'Completed' : 'Review'}
                 </h4>
                 <p className={`text-xs ${readOnly ? 'text-green-700' : 'text-indigo-700'}`}>
                    {readOnly 
                        ? 'Project is finalized. You can copy the content.' 
                        : 'Review the draft. Request changes or approve.'
                    }
                 </p>
               </div>

               {!readOnly && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Request Revision</label>
                   <textarea
                      className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none text-gray-900 bg-white"
                      placeholder="e.g., Make the intro more punchy..."
                      value={revisionPrompt}
                      onChange={(e) => setRevisionPrompt(e.target.value)}
                      disabled={isRevising}
                   />
                   <Button 
                     className="w-full mt-2" 
                     variant="secondary" 
                     disabled={!revisionPrompt} 
                     onClick={handleRevision}
                     isLoading={isRevising}
                   >
                     Submit Revision
                   </Button>
                 </div>
               )}

               {readOnly && (
                   <div>
                       <Button variant="secondary" className="w-full" onClick={handleCopy} icon={<IconCopy />}>
                           {copyLabel}
                       </Button>
                   </div>
               )}
            </div>

            {!readOnly && onComplete && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Button className="w-full" onClick={onComplete} icon={<IconCheckCircle />}>
                  Approve Final Draft
                </Button>
              </div>
            )}
          </div>

          {/* Card 2: SEO Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-900">SEO & Metadata</h3>
                  {!localMeta.slug && !readOnly && (
                      <button 
                        onClick={handleGenerateMetadata} 
                        disabled={isGeneratingMeta}
                        className="text-xs text-indigo-600 font-medium hover:text-indigo-800 disabled:opacity-50"
                      >
                          {isGeneratingMeta ? 'Generating...' : 'Auto-Generate'}
                      </button>
                  )}
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                  <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                      <input 
                          type="text" 
                          className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900"
                          value={localMeta.slug}
                          onChange={(e) => handleMetaChange('slug', e.target.value)}
                          placeholder="my-blog-post-slug"
                          disabled={readOnly}
                      />
                  </div>
                   <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Short Text (Excerpt)</label>
                      <textarea 
                          className="w-full p-2 text-sm border border-gray-300 rounded h-20 resize-none bg-white text-gray-900"
                          value={localMeta.shortText}
                          onChange={(e) => handleMetaChange('shortText', e.target.value)}
                          placeholder="Brief summary for blog cards..."
                          disabled={readOnly}
                      />
                  </div>
                   <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Intro Text / Social Hook</label>
                      <textarea 
                          className="w-full p-2 text-sm border border-gray-300 rounded h-24 resize-none bg-white text-gray-900"
                          value={localMeta.introText}
                          onChange={(e) => handleMetaChange('introText', e.target.value)}
                          placeholder="Catchy intro paragraph..."
                          disabled={readOnly}
                      />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};