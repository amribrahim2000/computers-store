import React, { useState } from 'react';
import { X, Wrench, CheckCircle2, Clock, AlertCircle, Save, Plus } from 'lucide-react';
import { ComputerAsset, MaintenanceRecord } from '../types';

interface MaintenanceModalProps {
  asset: ComputerAsset | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTechnicianName?: string;
  onSaveTicket: (assetId: string, record: MaintenanceRecord, newStatus?: 'active' | 'maintenance' | 'faulty') => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  asset,
  isOpen,
  onClose,
  defaultTechnicianName,
  onSaveTicket
}) => {
  const [issue, setIssue] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [technicianName, setTechnicianName] = useState(defaultTechnicianName || 'م. خالد عبد الرحمن');
  const [cost, setCost] = useState<number>(0);
  const [ticketStatus, setTicketStatus] = useState<'pending' | 'in_progress' | 'completed'>('in_progress');
  const [updatePcStatus, setUpdatePcStatus] = useState<'active' | 'maintenance' | 'faulty'>('maintenance');

  // تحديث اسم الفني عند الفتح
  React.useEffect(() => {
    if (defaultTechnicianName) {
      setTechnicianName(defaultTechnicianName);
    }
  }, [defaultTechnicianName, isOpen]);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!issue.trim()) return;

    const newTicket: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      assetId: asset.id,
      date: new Date().toISOString().split('T')[0],
      issue,
      actionTaken,
      technicianName,
      cost,
      status: ticketStatus
    };

    onSaveTicket(asset.id, newTicket, updatePcStatus);
    onClose();

    // إعادة ضبط الحقول
    setIssue('');
    setActionTaken('');
    setCost(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-right dir-rtl text-slate-900">
        
        {/* رأس النافذة */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">تسجيل تذكرة صيانة / إصلاح للجهاز</h2>
              <p className="text-xs text-slate-500 font-medium">{asset.name} ({asset.assetTag}) - {asset.department}</p>
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

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800">
          
          <div>
            <label className="block text-slate-700 font-bold mb-1">وصف المشكلة / العطل بالكمبيوتر *</label>
            <textarea
              required
              rows={3}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="مثال: تلف القرص الصلب وتوقفه عن الإقلاع، أو بطء شديد وحاجة لتنظيف المروحة وتغيير الرامات..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">الإجراء المتخذ / قطع الغيار المستبدلة</label>
            <input
              type="text"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="مثال: تم تركيب هارد SSD سعة 512GB وتثبيت Windows 11 Pro بنجاح"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">الفني المسؤول عن الصيانة</label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">التكلفة المادية المقدرة (ج.م)</label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">حالة تذكرة الصيانة</label>
              <select
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
              >
                <option value="pending">معلقة / بانتظار الشراء</option>
                <option value="in_progress">قيد العمل والتحسين</option>
                <option value="completed">مكتملة ومصلحة</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">تحديث حالة الكمبيوتر بالنظام</label>
              <select
                value={updatePcStatus}
                onChange={(e) => setUpdatePcStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
              >
                <option value="maintenance">تحويل للحالة: قيد الصيانة</option>
                <option value="active">تحويل للحالة: يعمل بكفاءة</option>
                <option value="faulty">تحويل للحالة: به عطل حرِج</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ سجل الصيانة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
