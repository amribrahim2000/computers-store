import React, { useState } from 'react';
import { X, History, Search, Filter, Calendar, User, Shield, Wrench, PlusCircle, FileSpreadsheet, Trash2, Edit, LogIn, CheckCircle2 } from 'lucide-react';
import { AuditLogEntry, AuditActionType } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  if (!isOpen) return null;

  // قائمة أسماء المستخدمين الفريدة
  const uniqueUsers = Array.from(new Set(logs.map(l => l.userName)));

  // تصفية السجلات
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.assetTag && log.assetTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.assetName && log.assetName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = selectedAction === 'all' || log.actionType === selectedAction;
    const matchesUser = selectedUser === 'all' || log.userName === selectedUser;

    return matchesSearch && matchesAction && matchesUser;
  });

  const getActionBadge = (type: AuditActionType) => {
    switch (type) {
      case 'login':
        return { label: 'تسجيل دخول', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: LogIn };
      case 'add_device':
        return { label: 'إضافة جهاز', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: PlusCircle };
      case 'edit_device':
        return { label: 'تعديل جهاز', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Edit };
      case 'delete_device':
        return { label: 'حذف جهاز', bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: Trash2 };
      case 'maintenance_add':
        return { label: 'تسجيل صيانة', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Wrench };
      case 'excel_import':
        return { label: 'استيراد إكسيل', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: FileSpreadsheet };
      case 'user_add':
        return { label: 'إضافة مستخدم', bg: 'bg-teal-100 text-teal-800 border-teal-200', icon: User };
      default:
        return { label: 'إجراء عام', bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: History };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn dir-rtl">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl border border-purple-200">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">سجل الأنشطة والعمليات الكامل (Audit Log)</h2>
              <p className="text-xs text-slate-500">متابعة كافة الإجراءات والإصلاحات والتعديلات ومسؤوليها وتوقيت كل عمل</p>
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

        {/* Filters bar */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بكود الجهاز، الوصف، أو المستخدم..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2 font-semibold text-slate-900 focus:border-purple-600 focus:outline-none shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Action Type Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:border-purple-600 focus:outline-none shadow-2xs"
          >
            <option value="all">جميع أنواع العمليات</option>
            <option value="login">تسجيل دخول</option>
            <option value="add_device">إضافة جهاز كمبيوتر</option>
            <option value="edit_device">تعديل بيانات جهاز</option>
            <option value="delete_device">حذف جهاز</option>
            <option value="maintenance_add">تذاكر الصيانة والإصلاح</option>
            <option value="excel_import">استيراد شيت إكسيل</option>
            <option value="user_add">إدارة المستخدمين</option>
          </select>

          {/* User Filter */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:border-purple-600 focus:outline-none shadow-2xs"
          >
            <option value="all">جميع المستخدمين والمهندسين</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

        </div>

        {/* Logs Table / List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>لا توجد سجلات أنشطة مطابقة لشروط البحث.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.actionType);
              const IconComp = badge.icon;

              return (
                <div
                  key={log.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-xs transition space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${badge.bg}`}>
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.userName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({log.userRole === 'admin' ? 'مدير' : 'فني صيانة'})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {log.details}
                  </p>

                  {(log.assetTag || log.assetName) && (
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      {log.assetTag && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold rounded-md">
                          {log.assetTag}
                        </span>
                      )}
                      {log.assetName && (
                        <span className="text-slate-600 font-semibold">
                          ({log.assetName})
                        </span>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold">
            إجمالي السجلات المعروضة: ({filteredLogs.length}) إجراء
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
