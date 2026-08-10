import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { INTEREST_TAGS } from '../constants';
import { X, Mail, Shield, User as UserIcon, Bookmark, Trash2, Camera, Plus, Check, Github } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onClose: () => void;
  onUnassign: () => void;
  onUpdateAvatar?: (url: string) => void;
  onUpdateTags?: (tags: string[]) => void;
  onUpdateGithub?: (username: string) => void;
  availableInterestTags?: string[];
}

export function UserProfile({
  user,
  onClose,
  onUnassign,
  onUpdateAvatar,
  onUpdateTags,
  onUpdateGithub,
  availableInterestTags = INTEREST_TAGS
}: UserProfileProps) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [githubUsername, setGithubUsername] = useState(user.githubUsername || '');
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(user.tags || []);
  const [isEditingTags, setIsEditingTags] = useState(false);

  // Toggle interest tags
  const handleToggleTag = (tag: string) => {
    let nextTags;
    if (selectedTags.includes(tag)) {
      nextTags = selectedTags.filter(t => t !== tag);
    } else {
      nextTags = [...selectedTags, tag];
    }
    setSelectedTags(nextTags);
    if (onUpdateTags) {
      onUpdateTags(nextTags);
    }
  };

  const handleSaveAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateAvatar) {
      onUpdateAvatar(avatarUrl.trim() || `https://ui-avatars.com/api/?name=${user.name}&background=random`);
    }
    setIsEditingAvatar(false);
  };

  const handleSaveGithub = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGithub) {
      onUpdateGithub(githubUsername.trim());
    }
    setIsEditingGithub(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id={`user-profile-modal-${user.id}`}>
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col relative" id="profile-container">
        
        {/* Color accents */}
        <div className="bg-indigo-600 h-28 w-full relative flex items-end px-6 pb-4">
          <div className="absolute top-4 right-4 flex gap-1.5 z-20">
            <button 
              onClick={onClose}
              id="btn-user-profile-close"
              className="p-2 bg-black/10 hover:bg-black/20 text-white rounded-xl transition-colors backdrop-blur-sm shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="p-6 relative pt-0 mt-[-40px]">
          {/* Avatar and Edit Avatars */}
          <div className="flex items-end justify-between mb-4 relative z-10">
            <div className="relative group/avatar">
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 shadow-md object-cover"
              />
              {onUpdateAvatar && (
                <button
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                  id="btn-trigger-edit-avatar"
                  className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white hover:bg-indigo-650 rounded-full border border-white shadow-sm transition-all text-center cursor-pointer"
                  title="Modify Profile Picture"
                >
                  <Camera size={12} />
                </button>
              )}
            </div>

            <div className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
              user.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {user.role}
            </div>
          </div>

          {/* Edit avatar field URL */}
          {isEditingAvatar && (
            <form onSubmit={handleSaveAvatar} className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl mb-4 space-y-2 animate-in slide-in-from-top-1.5 duration-200" id="form-edit-avatar">
              <label htmlFor="avatar-url-input" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Photo URL</label>
              <div className="flex gap-2">
                <input
                  id="avatar-url-input"
                  type="text"
                  placeholder="https://picsum.photos/..."
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  id="btn-save-avatar"
                  className="bg-indigo-600 text-white hover:bg-indigo-505 rounded-xl px-3 py-1.5 font-bold text-xs shadow-sm shadow-indigo-600/10 active:scale-95 transition-all text-center animate-pulse"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Edit github field */}
          {isEditingGithub && onUpdateGithub && (
            <form onSubmit={handleSaveGithub} className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl mb-4 space-y-2 animate-in slide-in-from-top-1.5 duration-200" id="form-edit-github">
              <label htmlFor="github-username-input" className="text-[10px] font-black uppercase text-slate-450 tracking-wider">GitHub Username</label>
              <div className="flex gap-2">
                <input
                  id="github-username-input"
                  type="text"
                  placeholder="e.g. armuripradeep657"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-550 font-mono"
                />
                <button
                  type="submit"
                  id="btn-save-github"
                  className="bg-indigo-650 text-white hover:bg-indigo-750 rounded-xl px-3 py-1.5 font-bold text-xs shadow-sm shadow-indigo-650/10 active:scale-95 transition-all text-center cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* User detail file */}
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 leading-tight">{user.name}</h3>
            <span className="text-xs text-slate-400 font-mono block">UID: {user.id}</span>
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3.5 text-xs text-slate-600">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            
            <div className="flex items-center gap-3.5 text-xs text-slate-600">
              <Shield size={16} className="text-slate-400 shrink-0" />
              <span>Gender Category: <strong className="font-bold text-slate-700">{user.gender}</strong></span>
            </div>

            <div className="flex items-center gap-3.5 text-xs text-slate-600">
              <UserIcon size={16} className="text-slate-400 shrink-0" />
              <span>
                Room Status:{' '}
                {user.assignedRoomId ? (
                  <span className="bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 px-2 py-0.5 rounded ml-1">
                     Room {user.assignedRoomId.split('-')[1]}
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded ml-1">
                    Unassigned
                  </span>
                )}
              </span>
            </div>

            {user.role === UserRole.STUDENT && user.department && (
              <div className="flex items-center gap-3.5 text-xs text-slate-600">
                <Bookmark size={16} className="text-slate-400 shrink-0" />
                <span>Department: <strong className="font-bold text-slate-700">{user.department}</strong></span>
              </div>
            )}

            {user.dob && (
              <div className="flex items-center gap-3.5 text-xs text-slate-600">
                <Shield size={16} className="text-slate-400 shrink-0" />
                <span>Date of Birth: <strong className="font-bold text-slate-700">{user.dob}</strong></span>
              </div>
            )}

            {user.password && (
              <div className="flex items-center gap-3.5 text-xs text-slate-600">
                <Shield size={16} className="text-slate-400 shrink-0" />
                <span>Password: <strong className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">{user.password}</strong></span>
              </div>
            )}

            {/* GitHub Account Link */}
            <div className="flex items-center justify-between gap-3.5 text-xs text-slate-600 relative group/github">
              <div className="flex items-center gap-3.5 min-w-0">
                <Github size={16} className="text-slate-405 shrink-0" />
                <span className="truncate">
                  GitHub Profile:{' '}
                  {user.githubUsername ? (
                    <a
                      href={`https://github.com/${user.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-850 font-bold hover:underline transition-all inline-flex items-center gap-1 font-mono"
                    >
                      {user.githubUsername}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not Linked</span>
                  )}
                </span>
              </div>
              {onUpdateGithub && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingGithub(!isEditingGithub);
                    setIsEditingAvatar(false);
                  }}
                  id="btn-edit-github-inline"
                  className="text-[11px] font-bold text-indigo-605 hover:text-indigo-805 underline hover:no-underline px-1.5 py-0.5 rounded transition-all shrink-0 cursor-pointer"
                >
                  {isEditingGithub ? "Cancel" : "Edit"}
                </button>
              )}
            </div>
          </div>

          {/* Interest tags / Roommate compatibility */}
          {user.role === UserRole.STUDENT && (
            <div className="mt-5 border-t border-slate-100 pt-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Bookmark size={14} className="text-slate-400" /> Roommate Interests
                </h4>
                {onUpdateTags && (
                  <button
                    onClick={() => setIsEditingTags(!isEditingTags)}
                    id="btn-edit-tags"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 text-center cursor-pointer"
                  >
                    {isEditingTags ? 'Done' : 'Update Interests'}
                  </button>
                )}
              </div>

              {isEditingTags ? (
                <div className="bg-slate-55 border border-slate-200 p-3.5 rounded-2xl flex flex-wrap gap-1.5" id="tags-editor">
                  {availableInterestTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        id={`btn-toggle-tag-${tag}`}
                        className={`text-[10px] px-2.5 py-1.5 rounded-xl border font-bold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5" id="tags-display">
                  {selectedTags.length > 0 ? (
                    selectedTags.map(tag => (
                      <span
                        key={tag}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-605 font-bold flex items-center gap-1"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">No roommate matchers checked.</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RELEASE ROOM ACTIONS */}
          {user.role === UserRole.STUDENT && user.assignedRoomId && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                onClick={onUnassign}
                id="btn-user-release-room"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-2xl text-xs font-black shadow-inner tracking-medium transition-all"
              >
                <Trash2 size={14} /> Vacate & Deallocate Current Bed
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
