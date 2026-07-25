import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Monitor, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  MoreVertical, 
  Printer, 
  Edit3, 
  Trash2, 
  Eye, 
  Grid, 
  List, 
  Building2, 
  User, 
  Wifi, 
  Cpu, 
  HardDrive, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { ComputerAsset, HospitalDepartment, AssetStatus } from '../types';

interface DeviceListProps {
  assets: ComputerAsset[];
  onSelectAsset: (asset: ComputerAsset) => void;
  onEditAsset: (asset: ComputerAsset) => void;
  onDeleteAsset: (id: string) => void;
  onAddMaintenanceTicket: (asset: ComputerAsset) => void;
  onPrintSingleAssetTag: (asset: ComputerAsset) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  assets,
  onSelectAsset,
  onEditAsset,
  onDeleteAsset,
  onAddMaintenanceTicket,
  onPrintSingleAssetTag
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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

  // فلترة وتنسيق القائمة
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      // بحث النص
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        item.name.toLowerCase().includes(q) ||
        item.assetTag.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q) ||
        item.assignedUser.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.ipAddress.toLowerCase().includes(q) ||
        item.cpu.toLowerCase().includes(q) ||
        item.roomNumber.toLowerCase().includes(q)
      );

      // فلترة القسم
      const matchesDept = selectedDept === 'all' || item.department === selectedDept;

      // فلترة الحالة
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [assets, searchQuery, selectedDept, selectedStatus]);

  return (
    <div className="space-y-4 dir-rtl text-right">
      
      {/* شريط البحث والفلاتر */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* حقل البحث */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الجهاز، الكود، IP، السيريال، أو اسم الموظف..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-800"
              >
                مسح
              </button>
            )}
          </div>

          {/* الفلاتر المنسدلة وطريقة العرض */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            
            {/* فلتر الأقسام */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">جميع أقسام المستشفى ({assets.length})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* فلتر الحالة التشغيلية */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">يعمل بكفاءة</option>
              <option value="maintenance">قيد الصيانة</option>
              <option value="faulty">بها أعطال</option>
              <option value="decommissioned">مُكهن/خارج الخدمة</option>
            </select>

            {/* أزرار نمط العرض (جدول / كروت) */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="عرض جدول تفصيلي"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="عرض شبكة كروت"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* عدد نتائج الفلترة */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>
            تم العثور على <strong className="text-slate-900 font-mono">{filteredAssets.length}</strong> جهاز كمبيوتر
          </span>

          {(selectedDept !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDept('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:underline cursor-pointer font-bold"
            >
              إعادة تصفير الفلاتر
            </button>
          )}
        </div>

      </div>

      {/* لا يوجد نتائج */}
      {filteredAssets.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-xs">
          <Monitor className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-base font-bold text-slate-800">لم يتم العثور على أجهزة تطابق معايير البحث!</p>
          <p className="text-xs text-slate-500">جرب البحث بكلمة مختلفة أو استورد شيت إكسيل جديد يحتوي على بيانات الأجهزة.</p>
        </div>
      )}

      {/* عرض الجدول التفصيلي (Table View) */}
      {viewMode === 'table' && filteredAssets.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right text-slate-800">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">الكود والرمز</th>
                  <th className="p-3.5">اسم الجهاز والوظيفة</th>
                  <th className="p-3.5">القسم والغرفة</th>
                  <th className="p-3.5">المستخدم المسؤول</th>
                  <th className="p-3.5">المواصفات (RAM / CPU)</th>
                  <th className="p-3.5">عنوان IP</th>
                  <th className="p-3.5">الحالة التشغيلية</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* الكود والرمز */}
                    <td className="p-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                      <span className="bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                        {asset.assetTag}
                      </span>
                    </td>

                    {/* اسم الجهاز */}
                    <td className="p-3.5 font-medium text-slate-900">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{asset.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">SN: {asset.serialNumber}</p>
                      </div>
                    </td>

                    {/* القسم والغرفة */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">{asset.department}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{asset.roomNumber}</p>
                    </td>

                    {/* المستخدم */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-bold">{asset.assignedUser}</span>
                      </div>
                      {asset.assignedUserRole && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{asset.assignedUserRole}</p>
                      )}
                    </td>

                    {/* المواصفات */}
                    <td className="p-3.5">
                      <div className="text-slate-700">
                        <p className="font-bold text-slate-800">{asset.cpu}</p>
                        <p className="text-[11px] text-slate-500">{asset.ram} • {asset.storage} • {asset.os}</p>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="p-3.5 font-mono text-slate-800">
                      <div className="flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-cyan-600" />
                        <span className="font-bold">{asset.ipAddress}</span>
                      </div>
                    </td>

                    {/* الحالة */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        asset.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80' :
                        asset.status === 'maintenance' ? 'bg-amber-100 text-amber-800 border border-amber-200/80' :
                        asset.status === 'faulty' ? 'bg-rose-100 text-rose-800 border border-rose-200/80' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          asset.status === 'active' ? 'bg-emerald-500' :
                          asset.status === 'maintenance' ? 'bg-amber-500' :
                          asset.status === 'faulty' ? 'bg-rose-500 animate-ping' :
                          'bg-slate-400'
                        }`}></span>
                        <span>
                          {asset.status === 'active' ? 'يعمل بكفاءة' :
                           asset.status === 'maintenance' ? 'قيد الصيانة' :
                           asset.status === 'faulty' ? 'عطل مفاجئ' : 'مُكهن'}
                        </span>
                      </span>
                    </td>

                    {/* الأزرار والإجراءات */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* معاينة البطاقة الفنية */}
                        <button
                          onClick={() => onSelectAsset(asset)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="عرض البطاقة الفنية وتاريخ الصيانة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* تسجيل طلب صيانة */}
                        <button
                          onClick={() => onAddMaintenanceTicket(asset)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          title="تسجيل تذكرة صيانة للجهاز"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>

                        {/* طباعة الباركود */}
                        <button
                          onClick={() => onPrintSingleAssetTag(asset)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                          title="طباعة ملصق QR الكود"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* تعديل */}
                        <button
                          onClick={() => onEditAsset(asset)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="تعديل مواصفات الجهاز"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* حذف */}
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت تأكد من حذف الجهاز ${asset.name} (${asset.assetTag})؟`)) {
                              onDeleteAsset(asset.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="حذف الجهاز"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* عرض الكروت (Grid View) */}
      {viewMode === 'grid' && filteredAssets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between transition group"
            >
              <div>
                
                {/* رأس الكارت */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md">
                      {asset.assetTag}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1.5 line-clamp-1 group-hover:text-blue-600 transition">{asset.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{asset.serialNumber}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                    asset.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    asset.status === 'maintenance' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    asset.status === 'faulty' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {asset.status === 'active' ? 'يعمل' :
                     asset.status === 'maintenance' ? 'صيانة' :
                     asset.status === 'faulty' ? 'عطل' : 'مُكهن'}
                  </span>
                </div>

                {/* التفاصيل الحيوية */}
                <div className="space-y-2 text-xs text-slate-700 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>القسم:</span>
                    </span>
                    <span className="font-bold text-slate-900">{asset.department}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span>المستخدم:</span>
                    </span>
                    <span className="text-slate-800 font-semibold">{asset.assignedUser}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      <span>المواصفات:</span>
                    </span>
                    <span className="text-slate-700 font-medium">{asset.cpu} ({asset.ram})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Wifi className="w-3.5 h-3.5 text-cyan-600" />
                      <span>IP Address:</span>
                    </span>
                    <span className="font-mono text-blue-700 font-bold">{asset.ipAddress}</span>
                  </div>
                </div>

              </div>

              {/* أسفل الكارت والأزرار */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectAsset(asset)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>عرض البطاقة</span>
                </button>

                <button
                  onClick={() => onAddMaintenanceTicket(asset)}
                  className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 rounded-xl transition cursor-pointer"
                  title="طلب صيانة"
                >
                  <Wrench className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onEditAsset(asset)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
