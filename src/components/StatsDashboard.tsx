import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Monitor, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  ShieldAlert, 
  Cpu, 
  Clock,
  Bell,
  ChevronLeft
} from 'lucide-react';
import { ComputerAsset, HospitalDepartment } from '../types';
import { getWarrantyNotifications } from '../utils/warrantyUtils';
import { DepartmentMaintenanceTrendChart } from './DepartmentMaintenanceTrendChart';

interface StatsDashboardProps {
  assets: ComputerAsset[];
  onFilterDepartment: (dept: HospitalDepartment) => void;
  onFilterStatus: (status: 'active' | 'maintenance' | 'faulty') => void;
  onOpenWarrantyModal?: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  assets,
  onFilterDepartment,
  onFilterStatus,
  onOpenWarrantyModal
}) => {
  const total = assets.length;
  const activeCount = assets.filter(a => a.status === 'active').length;
  const maintCount = assets.filter(a => a.status === 'maintenance').length;
  const faultyCount = assets.filter(a => a.status === 'faulty').length;
  const decomCount = assets.filter(a => a.status === 'decommissioned').length;

  const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  // إحصائيات الأقسام للرسم البياني
  const departmentCounts: Record<string, number> = {};
  assets.forEach(a => {
    departmentCounts[a.department] = (departmentCounts[a.department] || 0) + 1;
  });

  const departmentData = Object.entries(departmentCounts).map(([dept, count]) => ({
    name: dept.split(' ')[0], // اختصار للرسم
    fullDept: dept,
    count
  })).sort((a, b) => b.count - a.count);

  // إحصائيات الحالة
  const statusData = [
    { name: 'يعمل بكفاءة', value: activeCount, color: '#10b981' },
    { name: 'قيد الصيانة', value: maintCount, color: '#f59e0b' },
    { name: 'بها أعطال', value: faultyCount, color: '#f43f5e' },
    { name: 'مُكهن/ملغى', value: decomCount, color: '#64748b' },
  ].filter(d => d.value > 0);

  // إشعارات الضمان من الموديول الجديد
  const warrantyNotifications = getWarrantyNotifications(assets, 90);
  const expiredWarrantyCount = warrantyNotifications.filter(n => n.status === 'expired').length;
  const expiring30Count = warrantyNotifications.filter(n => n.status === 'expiring_30').length;

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* البطاقات الإحصائية الأربع الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* إجمالي أجهزة الكمبيوتر */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">إجمالي الأجهزة بالمستشفى</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{total}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Monitor className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-bold text-blue-600">{activePercent}%</span>
            <span>نسبة الجاهزية للخدمة الطبية</span>
          </div>
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        </div>

        {/* الأجهزة الشغالة */}
        <div 
          onClick={() => onFilterStatus('active')}
          className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-5 shadow-xs relative overflow-hidden cursor-pointer group transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">تعمل بكفاءة انتظامية</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 font-medium">انقر للتصفية في العيادات والأقسام</p>
          <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500"></div>
        </div>

        {/* أجهزة قيد الصيانة */}
        <div 
          onClick={() => onFilterStatus('maintenance')}
          className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-5 shadow-xs relative overflow-hidden cursor-pointer group transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">تحت الصيانة والإصلاح</p>
              <p className="text-3xl font-black text-amber-600 mt-1">{maintCount}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-700 font-semibold">يتوفر لها متابعة تذاكر الفنيين</p>
          <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500"></div>
        </div>

        {/* أجهزة بها أعطال مفاجئة */}
        <div 
          onClick={() => onFilterStatus('faulty')}
          className="bg-white border border-slate-200 hover:border-rose-400 rounded-2xl p-5 shadow-xs relative overflow-hidden cursor-pointer group transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">بها أعطال حرجة</p>
              <p className="text-3xl font-black text-rose-600 mt-1">{faultyCount}</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-rose-700 font-semibold">تستوجب التدخل الفني السريع</p>
          <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500"></div>
        </div>

      </div>

      {/* الرسومات البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* توزيع الأجهزة على الأقسام الطبية */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>توزيع أجهزة الكمبيوتر حسب أقسام المستشفى</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">عدد الأجهزة لكل قسم</span>
          </div>

          <div className="h-64 w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11} 
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any) => [`${value} جهاز`, 'العدد']}
                  labelFormatter={(label) => `القسم: ${label}`}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* حالة التشغيل الكلية (Pie Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>نسبة الحالة التشغيلية</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">ملخص كفاءة المنظومة الرقمية</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any) => [`${value} جهاز`, 'العدد']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {statusData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-600 font-medium">{s.name}:</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* لوحة الرسم البياني المخصص لوتيرة الأعطال لكل قسم على مدار الـ 6 أشهر الماضية Recharts */}
      <DepartmentMaintenanceTrendChart 
        assets={assets} 
        onFilterDepartment={onFilterDepartment} 
      />

      {/* قسم التنبيهات ونظام متابعة انتهاء ضمان الأجهزة */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-orange-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-2xs">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>تنبيهات حالة ضمان الأجهزة (Warranty Status Alerts)</span>
                {warrantyNotifications.length > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-[11px] font-black">
                    {warrantyNotifications.length} جهاز يستوجب المتابعة
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">متابعة دقيقة للأجهزة المنتهية ضماناتها أو القريبة من الانتهاء لمخاطبة الشركات الموردة</p>
            </div>
          </div>

          {onOpenWarrantyModal && (
            <button
              onClick={onOpenWarrantyModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>فتح مركز تنبيهات الضمان</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {warrantyNotifications.length === 0 ? (
          <div className="p-4 bg-white/80 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-bold">
            جميع الأجهزة المسجلة ذات ضمان ساري ومستقر! لا توجد تنبيهات عاجلة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {warrantyNotifications.slice(0, 3).map((notif) => {
              const isExp = notif.status === 'expired';

              return (
                <div 
                  key={notif.id} 
                  onClick={onOpenWarrantyModal}
                  className={`p-3.5 bg-white border rounded-xl flex items-center justify-between text-xs cursor-pointer hover:shadow-xs transition ${
                    isExp ? 'border-rose-300 hover:border-rose-400' : 'border-amber-300 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isExp ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {notif.asset.assetTag}
                      </span>
                      <p className="font-bold text-slate-900 truncate max-w-[140px]">{notif.asset.name}</p>
                    </div>
                    <p className="text-slate-500 text-[11px]">{notif.asset.department}</p>
                  </div>

                  <div className="text-left font-mono text-[11px] font-bold shrink-0">
                    <span className={`px-2 py-1 rounded-lg flex items-center gap-1 ${
                      isExp ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{notif.expiryDateFormatted}</span>
                    </span>
                    <p className={`text-[10px] mt-1 text-left ${isExp ? 'text-rose-700' : 'text-amber-800'}`}>
                      {notif.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
