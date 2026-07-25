import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Table, 
  Layers, 
  Download,
  Info
} from 'lucide-react';
import { ComputerAsset, ExcelColumnMapping } from '../types';
import { 
  parseExcelFile, 
  autoDetectMapping, 
  processMappedRowsToAssets, 
  DEFAULT_COLUMN_MAPPING,
  downloadSampleExcelTemplate
} from '../utils/excelUtils';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAssets: (newAssets: ComputerAsset[], replaceExisting: boolean) => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onImportAssets
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // بيانات الملف بعد القراءة
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [sheetData, setSheetData] = useState<{ headers: string[]; rows: any[] }>({ headers: [], rows: [] });

  // الخرائط للأعمدة
  const [mapping, setMapping] = useState<ExcelColumnMapping>(DEFAULT_COLUMN_MAPPING);

  // النتيجة للذكاء البرمجي والمعاينة
  const [previewAssets, setPreviewAssets] = useState<ComputerAsset[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  if (!isOpen) return null;

  // التعامل مع اختيار أو سحب الملف
  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('يرجى اختيار ملف Excel بصيغة (.xlsx, .xls) أو ملف CSV متوافق.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setFile(selectedFile);

    try {
      const parsed = await parseExcelFile(selectedFile);
      setSheetNames(parsed.sheetNames);
      
      const firstSheet = parsed.sheetNames[0];
      setSelectedSheet(firstSheet);
      
      const currentSheetData = parsed.parsedSheets[firstSheet];
      setSheetData(currentSheetData);

      // التعرف التلقائي على الأعمدة
      const detectedMap = autoDetectMapping(currentSheetData.headers);
      setMapping(detectedMap);

      setStep('mapping');
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء قراءة ملف الإكسيل. يرجى التأكد من أن الملف ليس محميًا بكلمة مرور.');
    } finally {
      setIsLoading(false);
    }
  };

  // تغيير الشيت المختار
  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    // تحديث البيانات بناءً على الشيت الجديد
    // نقرأ الملف مجدداً أو من التخزين
    if (file) {
      parseExcelFile(file).then(parsed => {
        const data = parsed.parsedSheets[sheetName];
        setSheetData(data);
        const detected = autoDetectMapping(data.headers);
        setMapping(detected);
      });
    }
  };

  // الانتقال لخطوة المعاينة
  const handleProceedToPreview = () => {
    if (sheetData.rows.length === 0) {
      setError('الشيت المحدد لا يحتوي على أية بيانات أو صفوف.');
      return;
    }

    const processed = processMappedRowsToAssets(sheetData.rows, mapping);
    setPreviewAssets(processed);
    setStep('preview');
  };

  // إتمام الاستيراد
  const handleConfirmImport = () => {
    onImportAssets(previewAssets, importMode === 'replace');
    onClose();
    // إعادة تعيين الحالة
    setStep('upload');
    setFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right dir-rtl text-slate-900">
        
        {/* رأس النافذة */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>رفع وتجهيز شيت إكسيل (Excel) للأجهزة</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </h2>
              <p className="text-xs text-slate-500">
                استيراد بيانات أجهزة كمبيوتر المستشفى تلقائياً من ملفات Excel و CSV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* مؤشر الخطوات */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'upload' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>اختيار الملف</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 rotate-180" />

          <div className={`flex items-center gap-2 ${step === 'mapping' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'mapping' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>مطابقة الأعمدة والذكاء البرمجي</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 rotate-180" />

          <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>معاينة وتأكيد الاستيراد</span>
          </div>
        </div>

        {/* محتوى النافذة حسب الخطوة */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200">
          
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* الخطوة 1: اختيار ورفع الملف */}
          {step === 'upload' && (
            <div className="space-y-6">
              
              {/* منطقة سحب الملفات */}
              <div 
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/50 hover:bg-slate-950/80 rounded-2xl p-8 text-center transition cursor-pointer group flex flex-col items-center justify-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
              >
                <div className="p-4 bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 rounded-full mb-3 transition">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  قم بسحب وإفلات ملف Excel هنا
                </h3>
                <p className="text-xs text-slate-400 mb-4 max-w-sm">
                  يدعم الشيتات بصيغة (.xlsx, .xls) أو ملفات (.csv) التي تحتوي على بيانات أجهزة كمبيوتر المستشفى
                </p>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition cursor-pointer shadow-md">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>تصفح واختيار الملف من جهازك</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {/* تنزيل النموذج المجهز */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">تريد نموذج Excel جاهز مسبقاً ملائم لمستشفاك؟</p>
                    <p className="text-slate-600 mt-0.5">يمكنك تنزيل شيت الإكسيل المعتمد بالأسفل ممتلئاً بنماذج توضيحية وأعمدة مخصصة لتعبئته ثم رفعه مباشرة!</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleExcelTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل نموذج Excel المعتمد (Template)</span>
                </button>
              </div>

            </div>
          )}

          {/* الخطوة 2: مطابقة الأعمدة والذكاء البرمجي */}
          {step === 'mapping' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">الملف المحدد: </span>
                  <span className="text-xs font-semibold text-emerald-400">{file?.name}</span>
                </div>

                {/* اختيار ورقة العمل */}
                {sheetNames.length > 1 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300">ورقة العمل (Sheet):</label>
                    <select
                      value={selectedSheet}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {sheetNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>التعرف التلقائي ومطابقة حقول الإكسيل مع النظام:</span>
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  قام النظام بتحديد الأعمدة المقابلة تلقائياً. يمكنك تعديل أي حقل إذا كان اسم العمود مختلفاً في شيت الإكسيل الخاص بك.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  
                  {/* كود الجهاز */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">كود الجهاز (Asset Tag):</span>
                    <select
                      value={mapping.assetTag}
                      onChange={(e) => setMapping({ ...mapping, assetTag: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* اسم الجهاز */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">اسم الجهاز:</span>
                    <select
                      value={mapping.name}
                      onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* الرقم التسلسلي */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">الرقم التسلسلي (Serial):</span>
                    <select
                      value={mapping.serialNumber}
                      onChange={(e) => setMapping({ ...mapping, serialNumber: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* القسم بالمستشفى */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">القسم بالمستشفى:</span>
                    <select
                      value={mapping.department}
                      onChange={(e) => setMapping({ ...mapping, department: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* الغرفة / المكان */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">الغرفة / الموقع:</span>
                    <select
                      value={mapping.roomNumber}
                      onChange={(e) => setMapping({ ...mapping, roomNumber: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* المستخدم / الموظف */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">المستخدم / الموظف:</span>
                    <select
                      value={mapping.assignedUser}
                      onChange={(e) => setMapping({ ...mapping, assignedUser: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* الحالة */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">حالة الجهاز:</span>
                    <select
                      value={mapping.status}
                      onChange={(e) => setMapping({ ...mapping, status: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* عنوان IP */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">عنوان IP Address:</span>
                    <select
                      value={mapping.ipAddress}
                      onChange={(e) => setMapping({ ...mapping, ipAddress: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* المعالج */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">المعالج (CPU):</span>
                    <select
                      value={mapping.cpu}
                      onChange={(e) => setMapping({ ...mapping, cpu: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* الرامات */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">الذاكرة (RAM):</span>
                    <select
                      value={mapping.ram}
                      onChange={(e) => setMapping({ ...mapping, ram: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-emerald-400 text-xs w-48 focus:border-emerald-500"
                    >
                      <option value="">-- اختار عمود الإكسيل --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* الأعمدة الإضافية والمخصصة المكتشفة */}
                {mapping.customColumns && mapping.customColumns.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <h5 className="text-xs font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>تم اكتشاف أعمدة مخصصة إضافية في شيت الإكسيل ({mapping.customColumns.length}):</span>
                    </h5>
                    <p className="text-[11px] text-purple-700 mb-2">
                      سيقوم النظام بحفظ وتحليل هذه الأعمدة الإضافية كبيانات مخصصة تظهر داخل بطاقة تفاصيل الجهاز ومحرك البحث!
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {mapping.customColumns.map((col, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white text-purple-800 border border-purple-200 rounded-lg text-[11px] font-bold shadow-2xs">
                          + {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* الخطوة 3: المعاينة وتأكيد الاستيراد */}
          {step === 'preview' && (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-900">
                    تم تحليل الملف بنجاح وجاهز لاستيراد عدد ({previewAssets.length}) جهاز كمبيوتر!
                  </span>
                </div>
              </div>

              {/* وضع الاستيراد */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 block">طريقة معالجة البيانات الحالية:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${importMode === 'append' ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block text-slate-900">إضافة وتحديث للقائمة (Append)</span>
                      <span className="text-[11px] text-slate-500">دمج الأجهزة الجديدة من الشيت مع الأجهزة الموجودة حالياً بالمستشفى</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${importMode === 'replace' ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-amber-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block text-slate-900">استبدال كامل البيانات (Replace All)</span>
                      <span className="text-[11px] text-slate-500">حذف القائمة الحالية واعتماد أجهزة شيت الإكسيل الجديد فقط</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* جدول المعاينة للعيان */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <span>معاينة نموذجية للبيانات المعالجة (أول 5 أجهزة):</span>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right text-slate-800">
                    <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="p-2.5">الكود</th>
                        <th className="p-2.5">اسم الجهاز</th>
                        <th className="p-2.5">القسم</th>
                        <th className="p-2.5">المستخدم</th>
                        <th className="p-2.5">IP Address</th>
                        <th className="p-2.5">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewAssets.slice(0, 5).map((asset, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-blue-700 font-bold">{asset.assetTag}</td>
                          <td className="p-2.5 font-bold text-slate-900">{asset.name}</td>
                          <td className="p-2.5">{asset.department}</td>
                          <td className="p-2.5 text-slate-600">{asset.assignedUser}</td>
                          <td className="p-2.5 font-mono text-slate-700">{asset.ipAddress}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              asset.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                              asset.status === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {asset.status === 'active' ? 'يعمل' : asset.status === 'maintenance' ? 'صيانة' : 'عطل'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* أزرار أسفل النافذة */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {step !== 'upload' && (
              <button
                type="button"
                onClick={() => setStep(step === 'preview' ? 'mapping' : 'upload')}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200 cursor-pointer shadow-xs"
              >
                السابق
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            {step === 'mapping' && (
              <button
                type="button"
                onClick={handleProceedToPreview}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <span>الانتقال للمعاينة</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            )}

            {step === 'preview' && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد واستيراد الأجهزة</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
