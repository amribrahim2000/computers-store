import React, { useState } from 'react';
import { X, UserPlus, Users, Shield, ShieldCheck, UserX, CheckCircle2, AlertCircle, Key, Lock, Building2 } from 'lucide-react';
import { User, UserRole, HospitalDepartment } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onAddUser: (newUser: Omit<User, 'id' | 'createdAt'>) => void;
  onToggleUserStatus: (userId: string) => void;
}

const DEPARTMENTS: HospitalDepartment[] = [
  'قسم تقنية المعلومات (IT Dept)',
  'الطوارئ (ER)',
  'العناية المركزة (ICU)',
  'قسم الأشعة (Radiology)',
  'المختبر والتحاليل (Lab)',
  'الصيدلية المركزية (Pharmacy)',
  'العيادات الخارجية (Outpatient)',
  'غرف العمليات (Operating Theater)',
  'الاستقبال والسجلات (Reception)',
  'الحسابات والإدارة (Finance)',
  'شؤون المرضى (Patient Reg)'
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onAddUser,
  onToggleUserStatus
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [department, setDepartment] = useState<HospitalDepartment>('قسم تقنية المعلومات (IT Dept)');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setError('اسم المستخدم هذا موجود بالفعل، يرجى اختيار اسم آخر.');
      return;
    }

    const colors = ['bg-blue-600', 'bg-amber-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddUser({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password || '123',
      role,
      department,
      avatarColor: randomColor,
      isActive: true
    });

    setName('');
    setUsername('');
    setPassword('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn dir-rtl">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">إدارة مستخدمي النظام وصلاحيات الدخول</h2>
              <p className="text-xs text-slate-500">إضافة المهندسين والفنيين والمشرفين ومتابعة صلاحياتهم</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>قائمة المستخدمين المسجلين بالنظام ({users.length})</span>
            </h3>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{showAddForm ? 'إلغاء الإضافة' : 'إضافة مستخدم جديد'}</span>
              </button>
            )}
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-4 animate-fadeIn text-xs">
              <h4 className="font-bold text-blue-900 text-xs border-b border-blue-200 pb-2">بيانات المستخدم الجديد:</h4>
              
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم الثلاثي *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: م. علي حسن"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (Username) *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: a.hassan"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصلاحية بالنظام *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs"
                  >
                    <option value="admin">مدير نظام كامل (Admin)</option>
                    <option value="technician">فني صيانة وإصلاح (Technician)</option>
                    <option value="viewer">مستعرض وباحث فقط (Viewer)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">القسم بالمستشفى *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as HospitalDepartment)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs"
                  >
                    {DEPARTMENTS.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  حفظ إضافة المستخدم
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">المستخدم</th>
                  <th className="p-3">اسم الدخول</th>
                  <th className="p-3">الصلاحية</th>
                  <th className="p-3">القسم</th>
                  <th className="p-3 text-center">الحالة</th>
                  {currentUser.role === 'admin' && <th className="p-3 text-center">إجراء</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 ${user.avatarColor || 'bg-slate-700'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span>{user.name}</span>
                        {user.id === currentUser.id && (
                          <span className="mr-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">أنت</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-700 dir-ltr text-right">{user.username}</td>

                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border-purple-200' 
                          : user.role === 'technician' 
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {user.role === 'admin' ? 'مدير كامل' : user.role === 'technician' ? 'فني IT' : 'مستعرض'}
                      </span>
                    </td>

                    <td className="p-3 text-slate-600 font-semibold">{user.department || 'عام'}</td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {user.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>

                    {currentUser.role === 'admin' && (
                      <td className="p-3 text-center">
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => onToggleUserStatus(user.id)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              user.isActive 
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={user.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
