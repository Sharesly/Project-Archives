import { Clock, Brain, Map, ShieldCheck, MessageSquare, Send, Link as LinkIcon, FileText, X, CheckCircle2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Project, Comment } from '../types';
import { APP_CONFIG, PROJECT_STATUSES, PRIORITY_LEVELS, RISK_FACTORS } from '../config';
import { useToast } from '../components/Toast';

export default function RecordView({ projectId, onBack }: { projectId: string | null, onBack: () => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      try {
        const [projectsData, commentsData] = await Promise.all([
          api.getProjects(),
          api.getComments(projectId)
        ]);
        const foundProject = projectsData.find(p => p.id === projectId);
        if (foundProject) setProject(foundProject);
        setComments(commentsData);
      } catch (error) {
        showToast('Failed to load project details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleSave = async () => {
    if (!project) return;
    try {
      await api.updateProject(project.id, project);
      showToast(`${APP_CONFIG.projectLabel} saved successfully`, 'success');
      onBack();
    } catch (error) {
      showToast('Failed to save changes', 'error');
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    try {
      await api.deleteProject(project.id);
      showToast(`${APP_CONFIG.projectLabel} deleted`, 'success');
      onBack();
    } catch (error) {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleAddTag = () => {
    if (!project || !newTag.trim()) return;
    if (newTag.length > 50) {
      showToast('Tag must be 50 characters or fewer', 'error');
      return;
    }
    if (project.tags.length >= 20) {
      showToast('Maximum of 20 tags allowed', 'error');
      return;
    }
    if (!project.tags.includes(newTag.trim())) {
      setProject({ ...project, tags: [...project.tags, newTag.trim()] });
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !project) return;
    try {
      const added = await api.addComment(project.id, newComment);
      setComments([...comments, added]);
      setNewComment('');
    } catch (error) {
      showToast('Failed to add comment', 'error');
    }
  };

  if (!projectId) {
    return (
      <div className="p-10 flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-bold text-on-surface-variant mb-4">No {APP_CONFIG.projectLabel} Selected</h2>
        <button onClick={onBack} className="px-6 py-2 bg-primary text-white rounded-lg">Back to Board</button>
      </div>
    );
  }

  if (loading || !project) return <div className="p-10">Loading {APP_CONFIG.projectLabel.toLowerCase()} details...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <nav className="flex gap-2 text-xs font-bold tracking-widest text-on-surface-variant mb-2 uppercase cursor-pointer" onClick={onBack}>
            <span className="hover:text-primary">Portfolio</span>
            <span>/</span>
            <span>{APP_CONFIG.projectLabel} Record</span>
          </nav>
          <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">{project.title}</h1>
          <p className="text-on-surface-variant mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Code: {project.code} &bull; Status: {project.status}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 border border-error text-error font-bold rounded-sm hover:bg-error-container transition-colors flex items-center gap-2" aria-label={`Delete ${APP_CONFIG.projectLabel}`}>
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="px-6 py-2 border border-outline-variant text-primary font-bold rounded-sm hover:bg-surface-container-low transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-8 py-2 bg-gradient-to-b from-primary to-primary-container text-white font-bold rounded-sm shadow-lg hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-2">Delete {APP_CONFIG.projectLabel}?</h3>
              <p className="text-sm text-on-surface-variant">This action cannot be undone. The {APP_CONFIG.projectLabel.toLowerCase()} and all its data will be permanently removed.</p>
            </div>
            <div className="p-6 bg-surface-container-low flex justify-end gap-3 border-t border-outline-variant/20">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); handleDelete(); }} className="px-6 py-2 text-sm font-bold bg-error text-white rounded-lg hover:bg-error/90 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-surface-container-lowest p-8 rounded-lg shadow-sm">
            <h2 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Core Specification
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="rec-title" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{APP_CONFIG.projectLabel} Name</label>
                <input
                  id="rec-title"
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  type="text"
                  value={project.title}
                  onChange={(e) => setProject({...project, title: e.target.value})}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="rec-dept" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{APP_CONFIG.departmentLabel}</label>
                <input
                  id="rec-dept"
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  type="text"
                  value={project.department}
                  onChange={(e) => setProject({...project, department: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 p-3 bg-surface-container-low rounded-lg min-h-[46px]">
                  {project.tags.map(tag => (
                    <span key={tag} className="bg-secondary-container text-on-secondary-fixed text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      {tag} <X className="w-3 h-3 cursor-pointer" onClick={() => setProject({...project, tags: project.tags.filter(t => t !== tag)})} />
                    </span>
                  ))}
                  {showTagInput ? (
                    <input
                      autoFocus
                      className="bg-transparent text-sm outline-none min-w-[100px]"
                      placeholder="Type tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') { setShowTagInput(false); setNewTag(''); } }}
                      onBlur={() => { if (newTag.trim()) handleAddTag(); else setShowTagInput(false); }}
                    />
                  ) : (
                    <button
                      className="text-primary text-xs font-bold flex items-center gap-1 ml-2"
                      onClick={() => setShowTagInput(true)}
                    >+ Add Tag</button>
                  )}
                </div>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="rec-priority" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Priority</label>
                <select
                  id="rec-priority"
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  value={project.priority}
                  onChange={(e) => setProject({...project, priority: e.target.value as typeof project.priority})}
                >
                  {PRIORITY_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="rec-risk" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Risk Factor</label>
                <select
                  id="rec-risk"
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  value={project.riskFactor}
                  onChange={(e) => setProject({...project, riskFactor: e.target.value})}
                >
                  {RISK_FACTORS.map(factor => (
                    <option key={factor} value={factor}>{factor}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="rec-status" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Status</label>
                <select
                  id="rec-status"
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  value={project.status}
                  onChange={(e) => setProject({...project, status: e.target.value as typeof project.status})}
                >
                  {PROJECT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-8 rounded-lg shadow-sm">
            <h2 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
              <Map className="w-6 h-6 text-primary" />
              Strategic Planning
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="rec-desc" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Executive Summary</label>
                <textarea
                  id="rec-desc"
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none resize-y"
                  rows={3}
                  value={project.description}
                  onChange={(e) => setProject({...project, description: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Primary Outcomes</label>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <input className="flex-1 text-sm bg-transparent border-b border-outline-variant py-1 focus:border-primary outline-none" type="text" defaultValue="Outcome 1" />
                    </li>
                    <li className="flex items-center gap-2">
                      <input className="flex-1 text-sm bg-transparent border-b border-outline-variant py-1 focus:border-primary outline-none" type="text" defaultValue="Outcome 2" />
                    </li>
                  </ul>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Key Deliverables</label>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-tertiary-fixed-variant" />
                      Deliverable 1
                    </li>
                    <li className="flex items-center gap-2 text-sm text-on-surface">
                      <div className="w-4 h-4 rounded-full border-2 border-on-surface-variant"></div>
                      Deliverable 2
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-8 rounded-lg shadow-sm">
            <h2 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Governance & Trust
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-low p-4 rounded-lg">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Approvals</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold">Approved</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Compliance</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Compliant</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Training</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Certification Required</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Relevant Links</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-primary font-medium hover:underline cursor-pointer">
                  <LinkIcon className="w-5 h-5" />
                  Documentation
                </div>
                <div className="flex items-center gap-3 text-sm text-primary font-medium hover:underline cursor-pointer">
                  <FileText className="w-5 h-5" />
                  Legal Review
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-lg shadow-sm flex flex-col h-[600px]">
            <div className="p-6 border-b border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Collaboration
              </h3>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {comments.length === 0 && (
                <div className="text-center text-sm text-on-surface-variant mt-10">No comments yet.</div>
              )}
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  {comment.author.avatar ? (
                    <img alt={comment.author.name} className="w-8 h-8 rounded-full" src={comment.author.avatar} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary" role="img" aria-label={comment.author.name}>{comment.author.initials}</div>
                  )}
                  <div className="bg-surface-container-low p-3 rounded-lg flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{comment.author.name}</span>
                      <span className="text-[10px] text-on-surface-variant uppercase">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/10">
              <div className="relative">
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary pr-12 outline-none"
                  placeholder="Write a comment..."
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Send comment"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-outline-variant/10">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-4 tracking-widest">{APP_CONFIG.projectLabel} Health</label>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Completion</span>
                <span className="font-bold">{project.progress}%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${project.progress}%` }}></div>
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">{APP_CONFIG.ownerLabel}</span>
                  <span className="font-bold">{project.owner.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">{APP_CONFIG.healthScoreLabel}</span>
                  <span className="text-tertiary-fixed-variant font-bold">{project.healthScore ?? '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Status</span>
                  <span className="font-bold">{project.status}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant/10">
                <label htmlFor="rec-progress" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Update Progress</label>
                <input
                  id="rec-progress"
                  type="range"
                  min="0"
                  max="100"
                  value={project.progress}
                  onChange={(e) => setProject({...project, progress: parseInt(e.target.value)})}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
