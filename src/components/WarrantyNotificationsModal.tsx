import React, { useState } from 'react';
import { X, Bell, AlertTriangle, ShieldAlert, ShieldCheck, Clock, Calendar, Building2, ExternalLink, Wrench, Search, Filter, Sparkles } from 'lucide-react';
import { ComputerAsset, HospitalDepartment } from '../types';
import { getWarrantyNotifications, WarrantyNotification, WarrantyStatus } from '../utils/warrantyUtils';

interface WarrantyNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: ComputerAsset[];
  onSelectAsset: (asset: ComputerAsset) => void;
  onAddMaintenanceTicket: (asset: ComputerAsset) => void;
}

export const WarrantyNotificationsModal: React.FC<WarrantyNotificationsModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
  onAddMaintenanceTicket
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expired' | '30days' | '90days'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [daysThreshold, setDaysThreshold] = useState<number>(180); // 6 months threshold

  if (!isOpen) return null;

  const allNotifications = getWarrantyNotifications(assets, daysThreshold);

  // Stats
  const expiredCount = allNotifications.filter(n => n.status === 'expired').length;
  const expiring30Count = allNotifications.filter(n => n.status === 'expiring_30').length;
  const totalAlertsCount = expiredCount + expiring30Count;

  // Filtered list
  const filteredNotifications = allNotifications.filter(n => {
    const matchesSearch = 
      n.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.asset.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.asset.vendorName && n.asset.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'expired') return n.status === 'expired';
    if (filterType === '30days') return n.status === 'expiring_30' || n.status === 'expired';
    if (filterType === '90days') return n.status !== 'valid';

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn dir-rtl">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-orange-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm relative">
              <Bell className="w-6 h-6 animate-bounce" />
              {totalAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {totalAlertsCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>تنبيهات مواعيد انتهاء الضمان (Warranty Alerts)</span>
                {totalAlertsCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-xs font-black">
                    {totalAlertsCount} تنبيه عاجل
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">متابعة الأجهزة التي انتهى ضمانها أو القريبة من الانتهاء لتجديد العقود والصيانة</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 bg-white/80 hover:bg-slate-200 rounded-xl transition cursor-pointer border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Control bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم الجهاز، الكود، القسم، أو المورد..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:outline-none shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            {/* Threshold dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 shrink-0">نطاق التنبيه:</span>
              <select
                value={daysThreshold}
                onChange={(e) => setDaysThreshold(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none shadow-2xs"
              >
                <option value={30}>خلال 30 يوماً</option>
                <option value={60}>خلال 60 يوماً</option>
                <option value={90}>خلال 90 يوماً (3 أشهر)</option>
                <option value={180}>خلال 180 يوماً (6 أشهر)</option>
                <option value={365}>خلال سنة كاملة</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              الكل ({allNotifications.length})
            </button>

            <button
              onClick={() => setFilterType('expired')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                filterType === 'expired'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>منتهي الضمان ({expiredCount})</span>
            </button>

            <button
              onClick={() => setFilterType('30days')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                filterType === '30days'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>خلال 30 يوماً ({expiring30Count})</span>
            </button>

            <button
              onClick={() => setFilterType('90days')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                filterType === '90days'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
              }`}
            >
              ينتهي قريباً (3 أشهر)
            </button>
          </div>

        </div>

        {/* Notifications List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700 text-sm">ممتاز! لا توجد تنبيهات ضمان مطابقة لخيارات الفلترة.</p>
              <p className="text-slate-500 mt-1">جميع أجهزة المستشفى المعروضة ضمانها ساري أو خارج النطاق المحدد.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isExpired = notif.status === 'expired';
              const is30 = notif.status === 'expiring_30';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition shadow-2xs hover:shadow-xs space-y-3 ${
                    isExpired
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : is30
                      ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-xs ${
                          isExpired ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                        }`}>
                          {notif.asset.assetTag}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{notif.asset.name}</h3>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{notif.asset.department}</span>
                        </span>
                        {notif.asset.vendorName && (
                          <span className="text-slate-500">
                            • المورد: <strong>{notif.asset.vendorName}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expiry Badge */}
                    <div className="text-left dir-ltr">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black shadow-2xs ${
                        isExpired
                          ? 'bg-rose-600 text-white'
                          : is30
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{notif.expiryDateFormatted}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Note */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <p className={`font-bold flex items-center gap-1.5 ${
                      isExpired ? 'text-rose-700' : is30 ? 'text-amber-800' : 'text-blue-800'
                    }`}>
                      {isExpired ? (
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      )}
                      <span>{notif.description}</span>
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectAsset(notif.asset);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>معاينة الجهاز</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onAddMaintenanceTicket(notif.asset);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>طلب صيانة/تجديد</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>يتم حساب تواريخ الضمان تلقائياً بناءً على تاريخ انتهاء الضمان لكل جهاز بالحصر</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
