import React from 'react';
import { 
  X, 
  Monitor, 
  Building2, 
  User, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  Printer, 
  Edit3, 
  Calendar, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { ComputerAsset } from '../types';
import { generateSimpleQRCodeSVG } from '../utils/qrUtils';

interface DeviceDetailModalProps {
  asset: ComputerAsset | null;
  onClose: () => void;
  onEdit: (asset: ComputerAsset) => void;
  onAddMaintenanceTicket: (asset: ComputerAsset) => void;
  onPrintSingleAssetTag: (asset: ComputerAsset) => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  asset,
  onClose,
  onEdit,
  onAddMaintenanceTicket,
  onPrintSingleAssetTag
}) => {
  if (!asset) return null;

  const qrSvg = generateSimpleQRCodeSVG(`${asset.assetTag} | ${asset.name} | ${asset.department}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right dir-rtl text-slate-900">
        
        {/* رأس النافذة */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl border border-blue-200">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-md">
                  {asset.assetTag}
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  asset.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  asset.status === 'maintenance' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {asset.status === 'active' ? 'يعمل بكفاءة' : asset.status === 'maintenance' ? 'قيد الصيانة' : 'بها عطل'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{asset.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">الرقم التسلسلي: {asset.serialNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم البطاقة */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* كارت ملصق الباركود وتفاصيل الغرفة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* بطاقة ملصق الجهاز الرقمي QR */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
              <div 
                dangerouslySetInnerHTML={{ __html: qrSvg }} 
                className="mb-2 p-2 bg-white rounded-xl border border-slate-200"
              />
              <p className="font-mono font-bold text-xs text-slate-900">{asset.assetTag}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{asset.department}</p>
              
              <button
                onClick={() => onPrintSingleAssetTag(asset)}
                className="mt-3 w-full py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة ملصق الجهاز</span>
              </button>
            </div>

            {/* تفاصيل الموقع والمستخدم */}
            <div className="md:col-span-2 bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3 text-xs shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>الموقع والجهة المخصص لها داخل المستشفى:</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block font-medium">القسم الطبي:</span>
                  <span className="font-bold text-slate-900 text-sm">{asset.department}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">الغرفة / المبنى:</span>
                  <span className="font-bold text-slate-800">{asset.roomNumber}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">المسؤول عن الجهاز:</span>
                  <span className="font-bold text-slate-800">{asset.assignedUser}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">المسمى الوظيفي:</span>
                  <span className="text-slate-700 font-semibold">{asset.assignedUserRole || 'كادر طبي / إداري'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* المواصفات الفنية والشبكة */}
          <div className="bg-slate-50 p-5 border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>المواصفات الفنية والشبكة:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] font-medium">المعالج (CPU):</span>
                <span className="font-bold text-slate-900 block mt-0.5">{asset.cpu}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] font-medium">الذاكرة (RAM):</span>
                <span className="font-bold text-slate-900 block mt-0.5">{asset.ram}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] font-medium">قرص التخزين:</span>
                <span className="font-bold text-slate-900 block mt-0.5">{asset.storage}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] font-medium">نظام التشغيل:</span>
                <span className="font-bold text-slate-900 block mt-0.5">{asset.os}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] font-medium">عنوان IP Address:</span>
                <span className="font-mono font-bold text-cyan-700 block mt-0.5">{asset.ipAddress}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] font-medium">عنوان MAC Address:</span>
                <span className="font-mono text-slate-700 font-semibold block mt-0.5">{asset.macAddress}</span>
              </div>
            </div>
          </div>

          {/* الحقول والأعمدة المخصصة الإضافية من الإكسيل */}
          {asset.customFields && Object.keys(asset.customFields).length > 0 && (
            <div className="bg-purple-50/80 p-5 border border-purple-200 rounded-2xl space-y-3 shadow-xs">
              <h4 className="font-bold text-purple-900 text-sm border-b border-purple-200 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>البيانات والأعمدة المخصصة الإضافية (من الإكسيل):</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {Object.entries(asset.customFields).map(([key, val]) => (
                  <div key={key} className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs">
                    <span className="text-purple-700 block text-[11px] font-bold">{key}:</span>
                    <span className="font-semibold text-slate-900 block mt-0.5">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* الضمان والشراء والملاحظات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-2 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>معلومات الشراء والضمان:</span>
              </span>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">تاريخ الشراء:</span>
                <span className="font-mono font-bold text-slate-800">{asset.purchaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">تاريخ انتهاء الضمان:</span>
                <span className="font-mono text-amber-700 font-bold">{asset.warrantyExpiry}</span>
              </div>
              {asset.vendorName && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">المورد:</span>
                  <span className="text-slate-800 font-semibold">{asset.vendorName}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-2 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>ملاحظات إضافية:</span>
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                {asset.notes || 'لا توجد ملاحظات مسجلة على هذا الجهاز.'}
              </p>
            </div>

          </div>

          {/* سجل الصيانة السابقة والإصلاحات */}
          <div className="bg-slate-50 p-5 border border-slate-200 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>سجل الأنشطة والإصلاحات والتعديلات بالتفصيل ({asset.maintenanceHistory?.length || 0})</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">يتضمن تفاصيل كل عطل والإجراء المتخذ واسم المهندس/الفني المسؤول وتاريخ ووقت الإصلاح والتكلفة</p>
              </div>

              <button
                onClick={() => onAddMaintenanceTicket(asset)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>تسجيل إصلاح جديد</span>
              </button>
            </div>

            {(!asset.maintenanceHistory || asset.maintenanceHistory.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center">لم تسجل أي تذاكر صيانة أو إصلاحات سابقة لهذا الجهاز حتى الآن.</p>
            ) : (
              <div className="space-y-3 pt-1">
                {asset.maintenanceHistory.map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-amber-100 text-amber-800 rounded-md">
                          <Wrench className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{rec.issue}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                          📅 {rec.date}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          rec.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.status === 'completed' ? 'تم الإصلاح بنجاح' : 'قيد العمل'}
                        </span>
                      </div>
                    </div>

                    {rec.actionTaken && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="text-slate-800 text-xs leading-relaxed font-semibold">
                          <strong className="text-blue-700">الإجراء المستحدث والإصلاح: </strong>
                          {rec.actionTaken}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>منفذ الإصلاح / الفني: {rec.technicianName}</span>
                      </div>

                      {rec.cost !== undefined && rec.cost > 0 && (
                        <span className="font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                          التكلفة المقدرة: {rec.cost} ج.م
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* أسفل البطاقة */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onEdit(asset)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer shadow-xs"
          >
            <Edit3 className="w-4 h-4 text-emerald-600" />
            <span>تعديل بيانات الجهاز</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
