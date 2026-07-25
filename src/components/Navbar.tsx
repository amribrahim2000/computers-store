import React from 'react';
import { 
  Monitor, 
  Upload, 
  Download, 
  Plus, 
  FileSpreadsheet, 
  RefreshCw, 
  Printer, 
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Server,
  Users,
  History,
  LogOut,
  Bell,
  User as UserIcon
} from 'lucide-react';
import { ComputerAsset, User } from '../types';
import { getWarrantyNotifications } from '../utils/warrantyUtils';

interface NavbarProps {
  assets: ComputerAsset[];
  currentUser: User | null;
  onOpenUploadModal: () => void;
  onOpenAddModal: () => void;
  onOpenPrintModal: () => void;
  onOpenPhpModal: () => void;
  onOpenUsersModal: () => void;
  onOpenAuditModal: () => void;
  onOpenWarrantyModal: () => void;
  onLogout: () => void;
  onExportExcel: () => void;
  onDownloadTemplate: () => void;
  onResetData: () => void;
  onSyncAllToMysql?: () => void;
  activeTab: 'all' | 'maintenance' | 'stats';
  setActiveTab: (tab: 'all' | 'maintenance' | 'stats') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  assets,
  currentUser,
  onOpenUploadModal,
  onOpenAddModal,
  onOpenPrintModal,
  onOpenPhpModal,
  onOpenUsersModal,
  onOpenAuditModal,
  onOpenWarrantyModal,
  onLogout,
  onExportExcel,
  onDownloadTemplate,
  onResetData,
  onSyncAllToMysql,
  activeTab,
  setActiveTab,
}) => {
  const activeCount = assets.filter(a => a.status === 'active').length;
  const maintCount = assets.filter(a => a.status === 'maintenance').length;
  const faultyCount = assets.filter(a => a.status === 'faulty').length;

  // إشعارات وتنبيهات الضمان
  const warrantyNotifications = getWarrantyNotifications(assets, 90);
  const urgentWarrantyCount = warrantyNotifications.filter(n => n.status === 'expired' || n.status === 'expiring_30').length;

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* الشريط العلوي للعنوان والخدمات */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* عنوان المستشفى والنظام */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  نظام إدارة أجهزة الكمبيوتر والمعدات
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  المستشفى العام
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع الأجهزة، سجل الإصلاحات، سجل الأنشطة والعمليات، وإدارة صلاحيات المستخدمين
              </p>
            </div>
          </div>

          {/* معلومات المستخدم الحالي وأزرار التحكم بالدخول */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 self-start md:self-auto">
              <div className={`w-8 h-8 rounded-xl text-white font-bold flex items-center justify-center text-xs shrink-0 ${currentUser.avatarColor || 'bg-blue-600'}`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-xs pl-2">
                <p className="font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-semibold">
                  {currentUser.role === 'admin' ? 'مدير كامل' : currentUser.role === 'technician' ? 'فني صيانة IT' : 'مستعرض'}
                </p>
              </div>

              {/* زر تنبيهات الضمان */}
              <button
                onClick={onOpenWarrantyModal}
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 relative"
                title="تنبيهات انتهاء ضمان الأجهزة"
              >
                <Bell className={`w-4 h-4 text-amber-600 ${urgentWarrantyCount > 0 ? 'animate-bounce' : ''}`} />
                <span className="hidden lg:inline">تنبيهات الضمان</span>
                {warrantyNotifications.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    urgentWarrantyCount > 0 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-amber-500 text-white'
                  }`}>
                    {warrantyNotifications.length}
                  </span>
                )}
              </button>

              {/* زر سجل الأنشطة */}
              <button
                onClick={onOpenAuditModal}
                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1"
                title="عرض سجل الأنشطة والعمليات الكامل (Audit Log)"
              >
                <History className="w-4 h-4 text-purple-600" />
                <span className="hidden lg:inline">سجل الأنشطة</span>
              </button>

              {/* زر إدارة المستخدمين */}
              <button
                onClick={onOpenUsersModal}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1"
                title="إدارة مستخدمي النظام والصلاحيات"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span className="hidden lg:inline">المستخدمين</span>
              </button>

              {/* زر خروج */}
              <button
                onClick={onLogout}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition cursor-pointer"
                title="تسجيل الخروج من النظام"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
              </button>
            </div>
          )}

        </div>

        {/* أزرار الإجراءات الرئيسية */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* رفع شيت إكسيل */}
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
              title="رفع ملف Excel لحصر الأجهزة"
            >
              <Upload className="w-4 h-4" />
              <span>رفع شيت إكسيل</span>
            </button>

            {/* تصدير لإكسيل */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm rounded-xl transition active:scale-95 cursor-pointer"
              title="تصدير الأجهزة الحالية إلى Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">تصدير إكسيل</span>
            </button>

            {/* تنزيل النموذج */}
            <button
              onClick={onDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              title="تنزيل نموذج Excel معتمد لإدخال البيانات"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">نموذج إكسيل</span>
            </button>

            {/* تصدير كود PHP & MySQL */}
            <button
              onClick={onOpenPhpModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs sm:text-sm rounded-xl transition active:scale-95 cursor-pointer shadow-2xs"
              title="تصدير حزمة كود PHP وقاعدة بيانات MySQL لرفعها على السيرفر"
            >
              <Server className="w-4 h-4 text-indigo-600" />
              <span>حزمة PHP & MySQL</span>
            </button>

            {/* مزامنة وحفظ البيانات الحالية مباشرة إلى MySQL */}
            {onSyncAllToMysql && (
              <button
                onClick={onSyncAllToMysql}
                className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm rounded-xl transition active:scale-95 cursor-pointer shadow-2xs"
                title="مزامنة كافة الأجهزة الحالية من الذاكرة المحلية مباشرة وحفظها في قاعدة بيانات MySQL"
              >
                <RefreshCw className="w-4 h-4 text-white" />
                <span>مزامنة مع MySQL الآن</span>
              </button>
            )}

            {/* إضافة جهاز جديد */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جهاز</span>
            </button>

            {/* طباعة الملصقات */}
            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              title="طباعة ملصقات الباركود و QR لكل الأجهزة"
            >
              <Printer className="w-4 h-4 text-purple-600" />
              <span className="hidden md:inline">ملصقات QR</span>
            </button>

            {/* استعادة البيانات الافتراضية */}
            <button
              onClick={onResetData}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-amber-600 border border-slate-200 rounded-xl transition cursor-pointer"
              title="استعادة البيانات التجريبية الافتراضية للمستشفى"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* شارات الحالة السريعة */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>يعمل بكفاءة: {activeCount}</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>قيد الصيانة: {maintCount}</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>بها أعطال: {faultyCount}</span>
            </span>
          </div>

        </div>

        {/* شريط تبويبات التصفح */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>جميع الأجهزة ({assets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'maintenance'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>طلبات الصيانة والإصلاح ({maintCount + faultyCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>التحليلات والأقسام</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

