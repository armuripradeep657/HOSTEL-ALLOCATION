import React, { useState } from 'react';
import { User, UserRole, Gender } from '../types';
import { INTEREST_TAGS } from '../constants';
import { X, UserPlus, Info, Check } from 'lucide-react';

interface CreateUserModalProps {
  onClose: () => void;
  onCreate: (user: User) => void;
  existingUsers: User[];
  availableInterestTags?: string[];
}

export function CreateUserModal({
  onClose,
  onCreate,
  existingUsers,
  availableInterestTags = INTEREST_TAGS
}: CreateUserModalProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [department, setDepartment] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!id.trim() || !name.trim() || !email.trim()) {
      setError('Please fill in all core fields.');
      return;
    }

    const cleanedId = id.trim().toLowerCase();
    const isDuplicate = existingUsers.some(u => u.id.toLowerCase() === cleanedId);
    if (isDuplicate) {
      setError(`UID "${id}" already allocated. Please use a unique register number.`);
      return;
    }

    const newUser: User = {
      id: id.trim(),
      name: name.trim(),
      email: email.trim(),
      role: UserRole.STUDENT,
      gender,
      avatarUrl: '',
      tags: selectedTags,
      assignedRoomId: null,
      assignedBedId: null,
      department: department.trim(),
      dob: dob,
      password: password,
      isAlloted: false,
      githubUsername: githubUsername.trim()
    };

    onCreate(newUser);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="create-user-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col relative max-h-[90vh]">
        
        {/* Color accent */}
        <div className="bg-indigo-600 h-2 w-full" />

        {/* Header bar */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <UserPlus size={20} className="text-indigo-650 animate-bounce" /> Register Student UID
            </h2>
            <p className="text-xs text-slate-400 mt-1">Initialize a freshman profile database record</p>
          </div>
          <button 
            onClick={onClose}
            id="btn-create-user-close"
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form panel body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5" id="create-user-form">
          {error && (
            <div className="bg-rose-50 text-rose-900 border border-rose-100 p-3 rounded-xl text-xs flex items-start gap-2 animate-shake">
              <Info size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User ID */}
            <div className="space-y-1.5">
              <label htmlFor="student-id-record" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Register ID (UID)</label>
              <input
                id="student-id-record"
                type="text"
                placeholder="e.g. MH24S009"
                value={id}
                onChange={e => {
                  setId(e.target.value.replace(/\s+/g, ''));
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all font-mono text-sm"
                required
              />
            </div>

            {/* Student Name */}
            <div className="space-y-1.5">
              <label htmlFor="student-name-record" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Student Full Name</label>
              <input
                id="student-name-record"
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Email */}
            <div className="space-y-1.5">
              <label htmlFor="student-email-record" className="text-xs font-bold text-slate-505 uppercase tracking-wide">Email Address</label>
              <input
                id="student-email-record"
                type="email"
                placeholder="ramesh@college.edu"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-sm"
                required
              />
            </div>

            {/* Gender Switcher */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-505 uppercase tracking-wide block">Gender Profile</span>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender('Male')}
                  id="btn-gender-male"
                  className={`py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                    gender === 'Male'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Male Block
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Female')}
                  id="btn-gender-female"
                  className={`py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                    gender === 'Female'
                      ? 'bg-white text-slate-850 shadow-sm'
                      : 'text-slate-505 hover:text-slate-705'
                  }`}
                >
                  Female Block
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-slate-200">
            {/* Department */}
            <div className="space-y-1.5">
              <label htmlFor="student-dept-record" className="text-xs font-bold text-slate-505 uppercase tracking-wide">Department</label>
              <input
                id="student-dept-record"
                type="text"
                placeholder="e.g. Mechanical, Computer Science"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-sm"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label htmlFor="student-dob-record" className="text-xs font-bold text-slate-505 uppercase tracking-wide">Date of Birth</label>
              <input
                id="student-dob-record"
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="student-password-record" className="text-xs font-bold text-slate-555 uppercase tracking-wide">Account Password</label>
              <input
                id="student-password-record"
                type="password"
                placeholder="Enter student portal password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-sm"
                required
              />
            </div>

            {/* GitHub Username */}
            <div className="space-y-1.5">
              <label htmlFor="student-github-record" className="text-xs font-bold text-slate-555 uppercase tracking-wide">GitHub Username (Optional)</label>
              <input
                id="student-github-record"
                type="text"
                placeholder="e.g. armuripradeep657"
                value={githubUsername}
                onChange={e => setGithubUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-sm font-mono"
              />
            </div>
          </div>

          {/* Personality matcher */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-505 uppercase tracking-wide block">Roommate Matching Tags</span>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-wrap gap-1.5" id="tag-selector-pool">
              {availableInterestTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    id={`btn-tag-select-${tag}`}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-bold transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-650 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit action */}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={onClose}
              id="btn-cancel-create"
              type="button"
              className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 active:scale-97 transition-colors text-center"
            >
              Cancel
            </button>
            <button
              id="btn-submit-create-user"
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 active:scale-97 transition-all text-center border border-indigo-600"
            >
              Create Database Entry
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
