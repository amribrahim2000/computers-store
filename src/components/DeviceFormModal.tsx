import React, { useState, useEffect } from 'react';
import { X, Monitor, Save, Building2, User, Cpu, Wifi, ShieldCheck, AlertCircle } from 'lucide-react';
import { ComputerAsset, HospitalDepartment, AssetStatus, OperatingSystem } from '../types';

interface DeviceFormModalProps {
  isOpen: boolean;
  editingAsset: ComputerAsset | null;
  onClose: () => void;
  onSave: (assetData: Partial<ComputerAsset>) => void;
}

export const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
  isOpen,
  editingAsset,
  onClose,
  onSave
}) => {
  const departments: HospitalDepartment[] = [
    'الطوارئ (ER)',
    'العناية المركزة (ICU)',
    'قسم الأشعة (Radiology)',
    'المختبر والتحاليل (Lab)',
    'الصيدلية المركزية (Pharmacy)',
    'العيادات الخارجية (Outpatient)',
    'غرف العمليات (Operating Theater)',
    'الاستقبال والسجلات (Reception)',
    'الحسابات والإدارة (Finance)',
    'شؤون المرضى (Patient Reg)',
    'قسم تقنية المعلومات (IT Dept)'
  ];

  const operatingSystems: OperatingSystem[] = [
    'Windows 11 Pro',
    'Windows 10 Pro',
    'Windows 7 Pro',
    'Ubuntu Linux',
    'macOS',
    'أخرى'
  ];

  const [formData, setFormData] = useState<Partial<ComputerAsset>>({
    assetTag: '',
    name: '',
    serialNumber: '',
    department: 'الطوارئ (ER)',
    roomNumber: '',
    assignedUser: '',
    assignedUserRole: '',
    status: 'active',
    cpu: 'Intel Core i5',
    ram: '16 GB',
    storage: '512 GB SSD',
    os: 'Windows 11 Pro',
    ipAddress: '192.168.10.x',
    macAddress: '00:1B:44:XX:XX:XX',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAsset) {
      setFormData(editingAsset);
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        assetTag: `HOSP-PC-${randomNum}`,
        name: 'جهاز كمبيوتر جديد',
        serialNumber: `SN-DEL-${Math.floor(100000 + Math.random() * 900000)}`,
        department: 'الطوارئ (ER)',
        roomNumber: 'الدور الأرضي',
        assignedUser: 'كادر المستشفى',
        assignedUserRole: 'موظف/طبيب',
        status: 'active',
        cpu: 'Intel Core i5-12400',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        os: 'Windows 11 Pro',
        ipAddress: `192.168.10.${Math.floor(10 + Math.random() * 200)}`,
        macAddress: '00:1B:44:88:99:AA',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyExpiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      });
    }
    setError(null);
  }, [editingAsset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.assetTag || !formData.department) {
      setError('يرجى تعبئة الحقول الأساسية: كود الجهاز، اسم الجهاز، والقسم بالمستشفى.');
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right dir-rtl text-slate-900">
        
        {/* رأس النافذة */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingAsset ? 'تعديل بيانات جهاز الكمبيوتر' : 'إضافة جهاز كمبيوتر جديد للمستشفى'}
              </h2>
              <p className="text-xs text-slate-500">
                أدخل أو حدث المواصفات الفنية والموقع والتبعية الإدارية للجهاز
              </p>
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

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-slate-800">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* البيانات الأساسية */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">البيانات التعريفية الأساسية:</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div>
                <label className="block text-slate-600 font-medium mb-1">كود الجهاز (Asset Tag) *</label>
                <input
                  type="text"
                  required
                  value={formData.assetTag || ''}
                  onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                  placeholder="مثال: HOSP-PC-101"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">اسم الجهاز / المسمى الأكاديمي *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: كمبيوتر أطباء الطوارئ 01"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">الرقم التسلسلي (Serial Number)</label>
                <input
                  type="text"
                  value={formData.serialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="SN-DEL-xxxxxx"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">القسم بالمستشفى *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as HospitalDepartment })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-blue-500 focus:outline-none shadow-xs"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">الحالة التشغيلية</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-blue-500 focus:outline-none shadow-xs"
                >
                  <option value="active">يعمل بكفاءة</option>
                  <option value="maintenance">قيد الصيانة</option>
                  <option value="faulty">بها عطل مفاجئ</option>
                  <option value="decommissioned">مُكهن/خارج الخدمة</option>
                </select>
              </div>

            </div>
          </div>

          {/* التبعية والمكان */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>المكان والمستخدم المسؤول:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div>
                <label className="block text-slate-600 font-medium mb-1">الغرفة / رقم المبنى</label>
                <input
                  type="text"
                  value={formData.roomNumber || ''}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="غرفة 102 - الدور الأول"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">اسم الموظف / الطبيب المسؤول</label>
                <input
                  type="text"
                  value={formData.assignedUser || ''}
                  onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
                  placeholder="د. أحمد سليمان"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={formData.assignedUserRole || ''}
                  onChange={(e) => setFormData({ ...formData, assignedUserRole: e.target.value })}
                  placeholder="استشاري طوارئ"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

            </div>
          </div>

          {/* المواصفات الفنية والشبكة */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>المواصفات الفنية والشبكة:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div>
                <label className="block text-slate-600 font-medium mb-1">المعالج (CPU)</label>
                <input
                  type="text"
                  value={formData.cpu || ''}
                  onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                  placeholder="Intel Core i7-12700"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">الذاكرة (RAM)</label>
                <input
                  type="text"
                  value={formData.ram || ''}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  placeholder="16 GB DDR4"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">مساحة التخزين</label>
                <input
                  type="text"
                  value={formData.storage || ''}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  placeholder="512 GB SSD"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">نظام التشغيل</label>
                <select
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value as OperatingSystem })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
                >
                  {operatingSystems.map(os => (
                    <option key={os} value={os}>{os}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">عنوان IP Address</label>
                <input
                  type="text"
                  value={formData.ipAddress || ''}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="192.168.10.15"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">عنوان MAC Address</label>
                <input
                  type="text"
                  value={formData.macAddress || ''}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  placeholder="00:1B:44:11:3A:B7"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

            </div>
          </div>

          {/* التواريخ والملاحظات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">تاريخ الشراء</label>
              <input
                type="date"
                value={formData.purchaseDate || ''}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">تاريخ انتهاء الضمان</label>
              <input
                type="date"
                value={formData.warrantyExpiry || ''}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1 text-xs">ملاحظات إضافية</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="اكتب أية تفاصيل أخرى تخص الجهاز..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
            />
          </div>

          {/* أزرار الحفظ */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editingAsset ? 'حفظ التعديلات' : 'حفظ وإضافة الجهاز'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
