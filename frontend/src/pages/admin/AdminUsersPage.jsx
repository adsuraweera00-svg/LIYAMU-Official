import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import { getRoleBadge } from '../../utils/badges';
import { UserX, UserCheck, Shield, ChevronDown, Search, Filter, Mail, Calendar, AlertCircle } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmModal, setConfirmModal] = useState({ show: false, userId: null, newRole: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('active');

  const roles = ['reader', 'beginner_reader', 'pro_reader', 'author', 'verified_author', 'pro_writer', 'admin'];

  const load = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'active' ? '/admin/users' : '/admin/users/deleted';
      const { data } = await api.get(endpoint);
      setUsers(data);
    } catch (err) {
      console.error(err);
      showMsg('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab]);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleUpdate = async (userId, updates) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}`, updates);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
      setConfirmModal({ show: false, userId: null, newRole: null });
      showMsg('User profile updated successfully');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!adminPassword) return showMsg('Admin password required', 'error');
    try {
      await api.delete(`/admin/users/${deleteModal.userId}`, { data: { adminPassword } });
      setDeleteModal({ show: false, userId: null, userName: '' });
      setAdminPassword('');
      showMsg('User account and all associated data permanently removed.');
      load();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Deletion failed', 'error');
    }
  };

  const initiateRoleChange = (userId, newRole) => {
    setConfirmModal({ show: true, userId, newRole });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = (user.name + user.email).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Feedback */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
            <Shield size={24} className="md:h-7 md:w-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Access Control</h2>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Manage global roles, permissions and account lifecycle</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-900 shadow-inner">
           <button 
             onClick={() => setActiveTab('active')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Active Members
           </button>
           <button 
             onClick={() => setActiveTab('deleted')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'deleted' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Deleted Audit
           </button>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg ${
                message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <div className="relative group md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email address..."
            className="w-full rounded-2xl bg-white border border-slate-100 py-3 md:py-4 pl-12 pr-4 text-xs font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
          <select 
            className="w-full appearance-none rounded-2xl bg-white border border-slate-100 py-4 pl-12 pr-4 text-xs font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Member Roles</option>
            {roles.map(r => (
              <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap modern-table">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-5 py-4 md:px-8 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">User Details</th>
                <th className="px-5 py-4 md:px-8 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Role & Access</th>
                <th className="px-5 py-4 md:px-8 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Activity</th>
                <th className="px-5 py-4 md:px-8 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const badge = getRoleBadge(user.role);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-5 md:px-8 md:py-6" data-label="User Details">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-2xl ${activeTab === 'deleted' ? 'bg-slate-100 text-slate-400' : badge.color} flex items-center justify-center shadow-inner`}>
                          {activeTab === 'deleted' ? <UserX size={20} /> : <badge.icon size={20} className={badge.badgeColor} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1 dark:text-slate-500">
                             <Mail size={10} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 md:px-8 md:py-6" data-label="Role & Access">
                      {activeTab === 'active' ? (
                        <div className="relative inline-block w-full md:w-48">
                            <select 
                             value={user.role}
                             onChange={(e) => initiateRoleChange(user.id, e.target.value)}
                             disabled={user.email === 'liyamu.owner@gmail.com' || user.badges?.owner}
                             className={`w-full appearance-none rounded-xl px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                               user.role === 'admin' ? 'bg-slate-900 text-white border-transparent' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-brand-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                             } ${(user.email === 'liyamu.owner@gmail.com' || user.badges?.owner) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {roles.map(r => (
                                <option key={r} value={r}>{r.replace('_', ' ')}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${user.role === 'admin' ? 'text-white' : 'text-slate-400'}`} />
                         </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archived Record</span>
                      )}
                    </td>
                    <td className="px-5 py-5 md:px-8 md:py-6" data-label="Activity">
                       <div className="flex flex-col gap-1">
                          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                             <Calendar size={10} /> {activeTab === 'active' ? `Joined ${new Date(user.createdAt).toLocaleDateString()}` : `Deleted ${new Date(user.deletedAt).toLocaleDateString()}`}
                          </p>
                          {activeTab === 'active' && (
                            <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest ${user.isBanned ? 'text-rose-500' : 'text-emerald-500'}`}>
                               <div className={`h-1.5 w-1.5 rounded-full ${user.isBanned ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                               {user.isBanned ? 'Account Banned' : 'Active Account'}
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-5 py-5 md:px-8 md:py-6 text-right" data-label="Settings">
                       {activeTab === 'active' ? (
                         <div className="flex items-center justify-end gap-2">
                           {!(user.email === 'liyamu.owner@gmail.com' || user.badges?.owner) ? (
                             <>
                               <button 
                                onClick={() => handleUpdate(user.id, { isBanned: !user.isBanned })}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                                  user.isBanned 
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                               >
                                 {user.isBanned ? <UserCheck size={14} /> : <Shield size={14} />}
                                 {user.isBanned ? 'Unban' : 'Suspend'}
                               </button>
                               <button 
                                onClick={() => setDeleteModal({ show: true, userId: user.id, userName: user.name })}
                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                title="Delete User Permanently"
                               >
                                 <UserX size={16} />
                               </button>
                             </>
                           ) : (
                             <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Immutable Account</span>
                           )}
                         </div>
                       ) : (
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Permanent Record</span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 dark:bg-slate-800">
                <Search size={32} />
              </div>
              <h3 className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">No members found matching your search</h3>
            </div>
          )}
        </div>
      </div>

      {/* Role Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ show: false, userId: null, newRole: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-slate-900"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Confirm Update</h3>
                <p className="mt-2 text-xs font-medium text-slate-400 leading-relaxed">
                  Change role to <span className="font-black text-slate-900 dark:text-white">{confirmModal.newRole?.replace('_', ' ').toUpperCase()}</span>?
                </p>
                <div className="mt-10 flex w-full flex-col gap-3">
                  <button 
                    onClick={() => handleUpdate(confirmModal.userId, { role: confirmModal.newRole })}
                    className="w-full rounded-2xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-600 transition-all shadow-xl shadow-slate-900/10 dark:bg-brand-600"
                  >
                    Confirm & Update
                  </button>
                  <button 
                    onClick={() => setConfirmModal({ show: false, userId: null, newRole: null })}
                    className="w-full rounded-2xl bg-slate-50 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secure Delete Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDeleteModal({ show: false, userId: null, userName: '' });
                setAdminPassword('');
              }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-[3rem] bg-white p-10 shadow-2xl dark:bg-slate-900 border-rose-500/20 border"
            >
              <div className="text-center">
                 <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
                    <UserX size={40} />
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Delete Account?</h3>
                 <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500 leading-relaxed px-6">
                    Permanently delete <span className="text-rose-600 underline">{deleteModal.userName}</span> and all associated books, creations and content.
                 </p>

                 <div className="mt-8 space-y-4">
                    <div className="text-left">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block italic text-center">Confirm Identity (Enter Admin Password)</label>
                       <input 
                         type="password"
                         className="w-full rounded-2xl bg-slate-50 border-none px-6 py-4 text-sm font-black focus:ring-2 focus:ring-rose-500 transition-all dark:bg-slate-800 dark:text-white text-center tracking-[0.3em]"
                         placeholder="••••••••"
                         value={adminPassword}
                         onChange={(e) => setAdminPassword(e.target.value)}
                       />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-4">
                       <button 
                         onClick={() => {
                           setDeleteModal({ show: false, userId: null, userName: '' });
                           setAdminPassword('');
                         }}
                         className="rounded-2xl bg-slate-50 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:bg-slate-800 active:scale-95 transition-all"
                       >
                         Abort Deletion
                       </button>
                       <button 
                         disabled={!adminPassword}
                         onClick={handleDeleteUser}
                         className="rounded-2xl bg-rose-600 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-rose-600/20 hover:bg-rose-500 active:scale-95 transition-all disabled:opacity-50"
                       >
                         Confirm Wipe
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsersPage;
