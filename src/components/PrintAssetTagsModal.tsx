import React, { useState } from 'react';
import { X, Printer, CheckSquare, Square, Building2 } from 'lucide-react';
import { ComputerAsset } from '../types';
import { generateSimpleQRCodeSVG } from '../utils/qrUtils';

interface PrintAssetTagsModalProps {
  assets: ComputerAsset[];
  singleAsset?: ComputerAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintAssetTagsModal: React.FC<PrintAssetTagsModalProps> = ({
  assets,
  singleAsset,
  isOpen,
  onClose
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    singleAsset ? [singleAsset.id] : assets.map(a => a.id)
  );

  if (!isOpen) return null;

  const targetAssets = singleAsset 
    ? [singleAsset] 
    : assets.filter(a => selectedIds.includes(a.id));

  const toggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map(a => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white print:static">
      
      {/* طباعة CSS المخصصة لتنسيق ملصقات الأجهزة */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-asset-tags, #printable-asset-tags * {
            visibility: visible;
          }
          #printable-asset-tags {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 10px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right dir-rtl print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full text-slate-900">
        
        {/* رأس النافذة */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl border border-purple-200">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">طباعة ملصقات الباركود و QR الكود للأجهزة</h2>
              <p className="text-xs text-slate-500">طباعة بطاقات التعريف والتتبع المرفقة مع كمبيوترات المستشفى</p>
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

        {/* أدوات التحديد السريع (لا تظهر في الطباعة) */}
        {!singleAsset && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 no-print">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 hover:text-slate-900 cursor-pointer font-bold"
            >
              {selectedIds.length === assets.length ? (
                <CheckSquare className="w-4 h-4 text-purple-700" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>تحديد جميع الأجهزة ({assets.length})</span>
            </button>

            <span className="text-slate-500 font-mono font-bold">
              المحدد للطباعة: ({targetAssets.length}) ملصق
            </span>
          </div>
        )}

        {/* شبكة الملصقات القابلة للطباعة */}
        <div id="printable-asset-tags" className="p-6 overflow-y-auto flex-1 bg-slate-100/60 print:bg-white text-slate-900 print:text-black">
          
          {targetAssets.length === 0 ? (
            <p className="text-center text-slate-500 py-12 text-xs">لم يتم تحديد أية أجهزة لطباعة ملصقاتها.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-3">
              {targetAssets.map((asset) => {
                const qrSvg = generateSimpleQRCodeSVG(`${asset.assetTag} | ${asset.name} | ${asset.department} | IP: ${asset.ipAddress}`);

                return (
                  <div
                    key={asset.id}
                    className="p-4 bg-white text-slate-900 rounded-xl border-2 border-slate-900 shadow-xs flex flex-col justify-between space-y-2 relative print:break-inside-avoid"
                  >
                    {!singleAsset && (
                      <button
                        onClick={() => toggleSelectOne(asset.id)}
                        className="absolute top-2 left-2 p-1 text-slate-400 hover:text-slate-900 no-print"
                      >
                        {selectedIds.includes(asset.id) ? (
                          <CheckSquare className="w-4 h-4 text-purple-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    )}

                    {/* أعلى الملصق */}
                    <div className="border-b border-slate-300 pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">المستشفى العام - IT Assets</span>
                        <span className="font-mono text-xs font-black text-slate-900">{asset.assetTag}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{asset.name}</h4>
                    </div>

                    {/* كود الـ QR والمواصفات السريعة */}
                    <div className="flex items-center gap-3 pt-1">
                      <div 
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                        className="shrink-0" 
                      />
                      <div className="text-[11px] text-slate-800 space-y-0.5 font-medium">
                        <p><strong className="text-slate-600">القسم:</strong> {asset.department}</p>
                        <p><strong className="text-slate-600">الغرفة:</strong> {asset.roomNumber}</p>
                        <p><strong className="text-slate-600">IP:</strong> <span className="font-mono">{asset.ipAddress}</span></p>
                        <p><strong className="text-slate-600">المستخدم:</strong> {asset.assignedUser}</p>
                      </div>
                    </div>

                    {/* أسفل الملصق */}
                    <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                      <span>S/N: {asset.serialNumber}</span>
                      <span>{asset.os}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* أزرار أسفل النافذة */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={targetAssets.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الملصقات ({targetAssets.length})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
