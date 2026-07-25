import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  Filter, 
  Activity,
  Layers,
  BarChart3,
  LineChart as LineChartIcon,
  CheckCircle2
} from 'lucide-react';
import { ComputerAsset, HospitalDepartment } from '../types';

interface DepartmentMaintenanceTrendChartProps {
  assets: ComputerAsset[];
  onFilterDepartment?: (dept: HospitalDepartment) => void;
}

// ألوان مخصصة وقوية لكل قسم من الأقسام الطبية
const DEPARTMENT_COLORS: Record<string, { main: string; bg: string; border: string }> = {
  'الطوارئ (ER)': { main: '#f43f5e', bg: 'bg-rose-50', border: 'border-rose-200' },
  'العناية المركزة (ICU)': { main: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200' },
  'قسم الأشعة (Radiology)': { main: '#2563eb', bg: 'bg-blue-50', border: 'border-blue-200' },
  'المختبر والتحاليل (Lab)': { main: '#8b5cf6', bg: 'bg-purple-50', border: 'border-purple-200' },
  'الصيدلية المركزية (Pharmacy)': { main: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'العيادات الخارجية (Outpatient)': { main: '#06b6d4', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  'غرف العمليات (Operating Theater)': { main: '#ec4899', bg: 'bg-pink-50', border: 'border-pink-200' },
  'الاستقبال والسجلات (Reception)': { main: '#6366f1', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  'الحسابات والإدارة (Finance)': { main: '#64748b', bg: 'bg-slate-50', border: 'border-slate-200' },
  'قسم تقنية المعلومات (IT Dept)': { main: '#0284c7', bg: 'bg-sky-50', border: 'border-sky-200' },
};

const DEFAULT_COLOR = { main: '#64748b', bg: 'bg-slate-50', border: 'border-slate-200' };

// أسماء الأشهر بالعربية
const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const DepartmentMaintenanceTrendChart: React.FC<DepartmentMaintenanceTrendChartProps> = ({
  assets,
  onFilterDepartment
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // 1. حساب الـ 6 أشهر الماضية بناءً على التاريخ الحالي
  const past6Months = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      months.push({
        key,
        year,
        monthIndex,
        label: `${ARABIC_MONTHS[monthIndex]} ${year}`,
        shortLabel: ARABIC_MONTHS[monthIndex]
      });
    }
    return months;
  }, []);

  // 2. استخراج قائمة الأقسام الفريدة الموجودة بالأجهزة
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    assets.forEach(a => {
      if (a.department) depts.add(a.department);
    });
    return Array.from(depts);
  }, [assets]);

  // 3. بناء بيانات الرسم البياني شهرياً مع احتساب التذاكر لكل قسم
  const { chartData, departmentTotals, total6MonthTickets, peakMonthInfo, topFaultyDept } = useMemo(() => {
    // مصفوفة مجاميع الأقسام
    const deptTotals: Record<string, number> = {};
    availableDepartments.forEach(dept => { deptTotals[dept] = 0; });

    let totalTicketsCount = 0;

    // هيكلة البيانات لكل شهر من الـ 6 أشهر
    const data = past6Months.map(m => {
      const monthRow: Record<string, any> = {
        monthKey: m.key,
        monthName: m.shortLabel,
        fullLabel: m.label,
        إجمالي_التذاكر: 0
      };

      // تهيئة الأقسام بـ 0
      availableDepartments.forEach(dept => {
        monthRow[dept] = 0;
      });

      // جلب كافة التذاكر المقترنة بأجهزة هذا القسم المسجلة بهذا الشهر
      assets.forEach(asset => {
        const dept = asset.department;
        if (!dept) return;

        if (asset.maintenanceHistory && asset.maintenanceHistory.length > 0) {
          asset.maintenanceHistory.forEach(record => {
            const recordDateStr = record.date || record.createdAt;
            if (!recordDateStr) return;

            const recDate = new Date(recordDateStr);
            if (isNaN(recDate.getTime())) return;

            const recKey = `${recDate.getFullYear()}-${String(recDate.getMonth() + 1).padStart(2, '0')}`;

            if (recKey === m.key) {
              monthRow[dept] = (monthRow[dept] || 0) + 1;
              monthRow['إجمالي_التذاكر'] = (monthRow['إجمالي_التذاكر'] || 0) + 1;
              deptTotals[dept] = (deptTotals[dept] || 0) + 1;
              totalTicketsCount++;
            }
          });
        }
      });

      return monthRow;
    });

    // معرفة الشهر الأعلى كثافة
    let peakMonth = data[0];
    data.forEach(m => {
      if ((m['إجمالي_التذاكر'] || 0) > (peakMonth['إجمالي_التذاكر'] || 0)) {
        peakMonth = m;
      }
    });

    // معرفة القسم الأكثر تضرراً بالصيانة
    let topDeptName = '';
    let topDeptVal = -1;
    Object.entries(deptTotals).forEach(([dName, count]) => {
      if (count > topDeptVal) {
        topDeptVal = count;
        topDeptName = dName;
      }
    });

    return {
      chartData: data,
      departmentTotals: deptTotals,
      total6MonthTickets: totalTicketsCount,
      peakMonthInfo: peakMonth,
      topFaultyDept: { name: topDeptName, count: topDeptVal }
    };
  }, [past6Months, availableDepartments, assets]);

  // الأقسام المعروضة حسب التصفية
  const activeDepartmentsForChart = useMemo(() => {
    if (selectedDeptFilter !== 'all') {
      return availableDepartments.filter(d => d === selectedDeptFilter);
    }
    // إرجاع أعلى الأقسام ذات التذاكر أولاً
    return [...availableDepartments].sort((a, b) => (departmentTotals[b] || 0) - (departmentTotals[a] || 0));
  }, [selectedDeptFilter, availableDepartments, departmentTotals]);

  // متوسط التذاكر شهرياً
  const avgTicketsPerMonth = Math.round((total6MonthTickets / 6) * 10) / 10;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 dir-rtl text-right">
      
      {/* رأس اللوحة والتحكم */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Activity className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black text-slate-900">
              وتيرة الأعطال وتذاكر الصيانة حسب الأقسام (آخر 6 أشهر)
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            متابعة دقيقة لمعدل التذاكر المسجلة لكل قسم طبي لتحديد أكثر الأقسام استهلاكاً للصيانة واتخاذ قرارات الاحلال والدعم الفني
          </p>
        </div>

        {/* أزرار التحكم بالرسم والتصفية */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* اختيار القسم */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع الأقسام الطبية ({availableDepartments.length})</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>
                  {dept} ({departmentTotals[dept] || 0} تذكرة)
                </option>
              ))}
            </select>
          </div>

          {/* نوع الرسم البياني */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'area'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="رسم بياني للمساحات المظللة (Area)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مساحي</span>
            </button>

            <button
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'line'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="رسم بياني بالخطوط البيانية (Line)"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خطوط</span>
            </button>

            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="رسم بياني بالأعمدة (Bar)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">أعمدة</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4 بطاقات إحصائية ملخصة للـ 6 أشهر */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* إجمالي تذاكر 6 أشهر */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5">
          <p className="text-[11px] font-bold text-slate-400">إجمالي تذاكر الـ 6 أشهر</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{total6MonthTickets}</span>
            <span className="text-xs text-slate-500 font-bold">تذكرة صيانة</span>
          </div>
        </div>

        {/* القسم الأكثر تضرراً */}
        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-3.5">
          <p className="text-[11px] font-bold text-rose-600">الأعلى تسجيلاً للأعطال</p>
          <p className="text-sm font-black text-slate-900 truncate mt-1">
            {topFaultyDept.name ? topFaultyDept.name.split(' ')[0] : 'لا يوجد'}
          </p>
          <p className="text-xs text-rose-700 font-bold">
            {topFaultyDept.count > 0 ? `${topFaultyDept.count} تذاكر مسجلة` : 'صفر بلا أعطال'}
          </p>
        </div>

        {/* الشهر الأكثر كثافة */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5">
          <p className="text-[11px] font-bold text-amber-700">الشهر الأكثر كثافة</p>
          <p className="text-sm font-black text-slate-900 truncate mt-1">
            {peakMonthInfo ? peakMonthInfo.fullLabel : '-'}
          </p>
          <p className="text-xs text-amber-700 font-bold">
            {peakMonthInfo ? `${peakMonthInfo['إجمالي_التذاكر']} تذكرة أصلية` : '-'}
          </p>
        </div>

        {/* معدل الأعطال الشهري */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5">
          <p className="text-[11px] font-bold text-blue-600">المعدل الشهري المتوقع</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-blue-700">{avgTicketsPerMonth}</span>
            <span className="text-xs text-blue-600 font-bold">تذكرة / شهر</span>
          </div>
        </div>

      </div>

      {/* منطقة الرسم البياني Recharts */}
      <div className="h-80 w-full dir-ltr pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <defs>
                {activeDepartmentsForChart.map(dept => {
                  const color = DEPARTMENT_COLORS[dept]?.main || DEFAULT_COLOR.main;
                  const safeId = dept.replace(/[^a-zA-Z0-9]/g, '_');
                  return (
                    <linearGradient key={dept} id={`grad_${safeId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="monthName" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontFamily: 'inherit' }}
                formatter={(value) => <span className="text-slate-700 font-semibold dir-rtl px-1">{value}</span>}
              />
              {activeDepartmentsForChart.map(dept => {
                const color = DEPARTMENT_COLORS[dept]?.main || DEFAULT_COLOR.main;
                const safeId = dept.replace(/[^a-zA-Z0-9]/g, '_');
                return (
                  <Area
                    key={dept}
                    type="monotone"
                    dataKey={dept}
                    name={dept}
                    stroke={color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#grad_${safeId})`}
                  />
                );
              })}
            </AreaChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="monthName" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }}
                formatter={(value) => <span className="text-slate-700 font-semibold px-1">{value}</span>}
              />
              {activeDepartmentsForChart.map(dept => {
                const color = DEPARTMENT_COLORS[dept]?.main || DEFAULT_COLOR.main;
                return (
                  <Line
                    key={dept}
                    type="monotone"
                    dataKey={dept}
                    name={dept}
                    stroke={color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="monthName" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }}
                formatter={(value) => <span className="text-slate-700 font-semibold px-1">{value}</span>}
              />
              {activeDepartmentsForChart.map(dept => {
                const color = DEPARTMENT_COLORS[dept]?.main || DEFAULT_COLOR.main;
                return (
                  <Bar
                    key={dept}
                    dataKey={dept}
                    name={dept}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                  />
                );
              })}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* قائمة مفصلة بالأقسام ومساهمتها في الأعطال */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>تفاصيل وتراكم الأعطال حسب كل قسم طبي (آخر 6 أشهر):</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">اضغط على أي قسم للتحديد والتصفية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {availableDepartments.map(dept => {
            const count = departmentTotals[dept] || 0;
            const percent = total6MonthTickets > 0 ? Math.round((count / total6MonthTickets) * 100) : 0;
            const style = DEPARTMENT_COLORS[dept] || DEFAULT_COLOR;
            const isSelected = selectedDeptFilter === dept;

            return (
              <div
                key={dept}
                onClick={() => {
                  if (selectedDeptFilter === dept) {
                    setSelectedDeptFilter('all');
                  } else {
                    setSelectedDeptFilter(dept);
                  }
                  if (onFilterDepartment) onFilterDepartment(dept as HospitalDepartment);
                }}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                    style={{ backgroundColor: style.main }}
                  ></span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{dept}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {count > 0 ? `${count} تذكرة صيانة` : 'لم يسجل أعطال'}
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                    count > 2 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    count > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// مكون الملاحظة التوضيحية عند تحريك الماوس فوق الرسم Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalMonth = payload.reduce((acc: number, item: any) => acc + (Number(item.value) || 0), 0);

    return (
      <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-xl border border-slate-700 text-xs dir-rtl max-w-xs">
        <p className="font-bold text-amber-400 mb-2 border-b border-slate-800 pb-1.5 flex items-center justify-between gap-2">
          <span>شهر: {payload[0]?.payload?.fullLabel || label}</span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
            مجموع الشهر: {totalMonth}
          </span>
        </p>

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {payload.map((entry: any, index: number) => {
            if (!entry.value || entry.value === 0) return null;
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-slate-300 truncate font-medium">{entry.name}:</span>
                </div>
                <span className="font-bold text-white shrink-0">{entry.value} تذكرة</span>
              </div>
            );
          })}
        </div>

        {totalMonth === 0 && (
          <p className="text-slate-400 text-[11px] italic">لم تسجل أي بلاغات أعطال لهذا الشهر</p>
        )}
      </div>
    );
  }

  return null;
};
