import * as XLSX from 'xlsx';
import { ComputerAsset, ExcelColumnMapping, HospitalDepartment, AssetStatus, OperatingSystem } from '../types';

// الخرائط التلقائية للتعرف الذكي على أعمدة الإكسيل
export const DEFAULT_COLUMN_MAPPING: ExcelColumnMapping = {
  assetTag: 'كود الجهاز',
  name: 'اسم الجهاز',
  serialNumber: 'السيريال',
  department: 'القسم',
  roomNumber: 'الغرفة/المكان',
  assignedUser: 'المستخدم/الموظف',
  status: 'الحالة',
  cpu: 'المعالج',
  ram: 'الرامات',
  storage: 'التخزين',
  os: 'نظام التشغيل',
  ipAddress: 'عنوان IP',
  macAddress: 'عنوان MAC',
  purchaseDate: 'تاريخ الشراء',
  notes: 'ملاحظات'
};

/**
 * محاولة خوارزمية للتعرف على ألقاب الأعمدة بناءً على النص باللغة العربية والإنجليزية
 */
export function autoDetectMapping(headers: string[]): ExcelColumnMapping {
  const mapping: ExcelColumnMapping = { ...DEFAULT_COLUMN_MAPPING };

  const normalize = (str: string) => str.toLowerCase().trim().replace(/[\_\-\s]/g, '');
  const matchedHeaders = new Set<string>();

  headers.forEach(h => {
    const norm = normalize(h);
    
    // كود الجهاز
    if (norm.includes('كود') || norm.includes('رمز') || norm.includes('tag') || norm.includes('assetid') || norm.includes('كودالجهاز')) {
      mapping.assetTag = h;
      matchedHeaders.add(h);
    }
    // اسم الجهاز
    else if ((norm.includes('اسم') && norm.includes('جهاز')) || norm.includes('computername') || norm.includes('pcname') || norm.includes('devicename')) {
      mapping.name = h;
      matchedHeaders.add(h);
    }
    // السيريال
    else if (norm.includes('سيريال') || norm.includes('تسلسلي') || norm.includes('serial') || norm.includes('sn')) {
      mapping.serialNumber = h;
      matchedHeaders.add(h);
    }
    // القسم
    else if (norm.includes('قسم') || norm.includes('department') || norm.includes('dept')) {
      mapping.department = h;
      matchedHeaders.add(h);
    }
    // الغرفة / المكان
    else if (norm.includes('غرفة') || norm.includes('مكان') || norm.includes('موقع') || norm.includes('room') || norm.includes('location')) {
      mapping.roomNumber = h;
      matchedHeaders.add(h);
    }
    // الموظف / الطبيب
    else if (norm.includes('موظف') || norm.includes('مستخدم') || norm.includes('طبيب') || norm.includes('user') || norm.includes('assigned')) {
      mapping.assignedUser = h;
      matchedHeaders.add(h);
    }
    // الحالة
    else if (norm.includes('حالة') || norm.includes('status') || norm.includes('حالةالجهاز')) {
      mapping.status = h;
      matchedHeaders.add(h);
    }
    // المعالج
    else if (norm.includes('معالج') || norm.includes('cpu') || norm.includes('processor')) {
      mapping.cpu = h;
      matchedHeaders.add(h);
    }
    // الرامات
    else if (norm.includes('رام') || norm.includes('ذاكرة') || norm.includes('ram') || norm.includes('memory')) {
      mapping.ram = h;
      matchedHeaders.add(h);
    }
    // التخزين
    else if (norm.includes('تخزين') || norm.includes('قرص') || norm.includes('هارد') || norm.includes('ssd') || norm.includes('storage') || norm.includes('hdd')) {
      mapping.storage = h;
      matchedHeaders.add(h);
    }
    // نظام التشغيل
    else if (norm.includes('نظام') || norm.includes('تشغيل') || norm.includes('os') || norm.includes('windows') || norm.includes('operating')) {
      mapping.os = h;
      matchedHeaders.add(h);
    }
    // IP Address
    else if (norm.includes('ip') || norm.includes('عنوانip') || norm.includes('ايبي')) {
      mapping.ipAddress = h;
      matchedHeaders.add(h);
    }
    // MAC Address
    else if (norm.includes('mac') || norm.includes('ماك')) {
      mapping.macAddress = h;
      matchedHeaders.add(h);
    }
    // تاريخ الشراء
    else if (norm.includes('تاريخ') || norm.includes('شراء') || norm.includes('date') || norm.includes('purchase')) {
      mapping.purchaseDate = h;
      matchedHeaders.add(h);
    }
    // ملاحظات
    else if (norm.includes('ملاحظ') || norm.includes('ملاحظات') || norm.includes('notes') || norm.includes('comment')) {
      mapping.notes = h;
      matchedHeaders.add(h);
    }
  });

  // اكتشاف أية أعمدة مخصصة غير قياسية
  const customCols = headers.filter(h => !matchedHeaders.has(h));
  mapping.customColumns = customCols;

  return mapping;
}

/**
 * قراءة شيت الإكسيل وإرجاع أسماء الصفحات والبيانات
 */
export async function parseExcelFile(file: File): Promise<{
  sheetNames: string[];
  parsedSheets: Record<string, { headers: string[]; rows: any[] }>;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const result: Record<string, { headers: string[]; rows: any[] }> = {};

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

          if (jsonData.length > 0) {
            const headers = Object.keys(jsonData[0]);
            result[sheetName] = {
              headers,
              rows: jsonData
            };
          } else {
            result[sheetName] = { headers: [], rows: [] };
          }
        });

        resolve({
          sheetNames: workbook.SheetNames,
          parsedSheets: result
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * تحويل الصفحات الخام بعد تعيين الأعمدة إلى قائمة أجهزة معرفة بالنظام
 */
export function processMappedRowsToAssets(
  rawRows: any[],
  mapping: ExcelColumnMapping
): ComputerAsset[] {
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

  return rawRows.map((row, index) => {
    const rawDept = String(row[mapping.department] || '').trim();
    // مطابقة القسم مع الأقسام المعرفة بالمستشفى
    let department: HospitalDepartment = 'قسم تقنية المعلومات (IT Dept)';
    const foundDept = departments.find(d => 
      d.toLowerCase().includes(rawDept.toLowerCase()) || rawDept.toLowerCase().includes(d.toLowerCase())
    );
    if (foundDept) {
      department = foundDept;
    } else if (rawDept) {
      // إسناد الأقسام بناء على الكلمات المفتاحية
      if (rawDept.includes('طوارئ') || rawDept.includes('ER')) department = 'الطوارئ (ER)';
      else if (rawDept.includes('عناية') || rawDept.includes('ICU')) department = 'العناية المركزة (ICU)';
      else if (rawDept.includes('أشعة') || rawDept.includes('Radio')) department = 'قسم الأشعة (Radiology)';
      else if (rawDept.includes('معمل') || rawDept.includes('مختبر') || rawDept.includes('Lab')) department = 'المختبر والتحاليل (Lab)';
      else if (rawDept.includes('صيدل') || rawDept.includes('Pharm')) department = 'الصيدلية المركزية (Pharmacy)';
      else if (rawDept.includes('عياد') || rawDept.includes('Outpatient')) department = 'العيادات الخارجية (Outpatient)';
      else if (rawDept.includes('عمليات') || rawDept.includes('Surgery')) department = 'غرف العمليات (Operating Theater)';
      else if (rawDept.includes('استقبال') || rawDept.includes('سجلات')) department = 'الاستقبال والسجلات (Reception)';
      else if (rawDept.includes('حسابات') || rawDept.includes('إدارة') || rawDept.includes('مالية')) department = 'الحسابات والإدارة (Finance)';
      else if (rawDept.includes('مرضى') || rawDept.includes('دخول')) department = 'شؤون المرضى (Patient Reg)';
    }

    const rawStatus = String(row[mapping.status] || '').toLowerCase().trim();
    let status: AssetStatus = 'active';
    if (rawStatus.includes('صيانة') || rawStatus.includes('maint')) status = 'maintenance';
    else if (rawStatus.includes('عطل') || rawStatus.includes('مكسور') || rawStatus.includes('fault') || rawStatus.includes('broken')) status = 'faulty';
    else if (rawStatus.includes('كهنة') || rawStatus.includes('تكهين') || rawStatus.includes('ملغى') || rawStatus.includes('decom')) status = 'decommissioned';

    const rawOS = String(row[mapping.os] || '').trim();
    let os: OperatingSystem = 'Windows 11 Pro';
    if (rawOS.toLowerCase().includes('10')) os = 'Windows 10 Pro';
    else if (rawOS.toLowerCase().includes('7')) os = 'Windows 7 Pro';
    else if (rawOS.toLowerCase().includes('ubuntu') || rawOS.toLowerCase().includes('linux')) os = 'Ubuntu Linux';
    else if (rawOS.toLowerCase().includes('mac')) os = 'macOS';

    const assetTag = String(row[mapping.assetTag] || `HOSP-PC-${100 + index + 1}`).trim();
    const name = String(row[mapping.name] || `جهاز كمبيوتر - ${department}`).trim();
    const serialNumber = String(row[mapping.serialNumber] || `SN-IMP-${Math.floor(100000 + Math.random() * 900000)}`).trim();

    // استخراج الحقول والأعمدة المخصصة الإضافية
    const mappedValues = new Set(Object.values(mapping).filter(v => typeof v === 'string'));
    const customFields: Record<string, string> = {};

    Object.keys(row).forEach(key => {
      if (!mappedValues.has(key) && key !== 'customColumns' && row[key] !== undefined && row[key] !== '') {
        customFields[key] = String(row[key]).trim();
      }
    });

    if (mapping.customColumns) {
      mapping.customColumns.forEach(col => {
        if (row[col] !== undefined && row[col] !== '') {
          customFields[col] = String(row[col]).trim();
        }
      });
    }

    return {
      id: `import-${Date.now()}-${index}`,
      assetTag,
      name,
      serialNumber,
      department,
      roomNumber: String(row[mapping.roomNumber] || 'غير محدد').trim(),
      assignedUser: String(row[mapping.assignedUser] || 'كادر القسم').trim(),
      status,
      cpu: String(row[mapping.cpu] || 'Intel Core i5').trim(),
      ram: String(row[mapping.ram] || '16 GB').trim(),
      storage: String(row[mapping.storage] || '512 GB SSD').trim(),
      os,
      ipAddress: String(row[mapping.ipAddress] || `192.168.10.${10 + (index % 200)}`).trim(),
      macAddress: String(row[mapping.macAddress] || '00:1B:44:XX:XX:XX').trim(),
      purchaseDate: String(row[mapping.purchaseDate] || new Date().toISOString().split('T')[0]).trim(),
      warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: String(row[mapping.notes] || 'تم الاستيراد من ملف إكسيل').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      maintenanceHistory: []
    };
  });
}

/**
 * تصدير قائمة الأجهزة الحالية إلى ملف Excel منسق
 */
export function exportAssetsToExcel(assets: ComputerAsset[], fileName = 'قائمة_أجهزة_كمبيوتر_المستشفى.xlsx') {
  const exportData = assets.map((item, idx) => {
    const baseRow: Record<string, any> = {
      'م': idx + 1,
      'كود الجهاز (Asset Tag)': item.assetTag,
      'اسم الجهاز': item.name,
      'الرقم التسلسلي (Serial)': item.serialNumber,
      'القسم بالمستشفى': item.department,
      'الغرفة / المكان': item.roomNumber,
      'المستخدم / الموظف المسؤول': item.assignedUser,
      'الحالة التشغيلية': item.status === 'active' ? 'يعمل بكفاءة' : item.status === 'maintenance' ? 'قيد الصيانة' : item.status === 'faulty' ? 'بها أعطال' : 'خارج الخدمة (مُكهن)',
      'عنوان IP': item.ipAddress,
      'عنوان MAC': item.macAddress,
      'المعالج (CPU)': item.cpu,
      'الذاكرة (RAM)': item.ram,
      'التخزين (Storage)': item.storage,
      'نظام التشغيل': item.os,
      'تاريخ الشراء': item.purchaseDate,
      'تاريخ انتهاء الضمان': item.warrantyExpiry,
      'ملاحظات': item.notes || ''
    };

    // دمج الحقول المخصصة الإضافية في أسطر تصدير الإكسيل
    if (item.customFields) {
      Object.entries(item.customFields).forEach(([k, v]) => {
        baseRow[k] = v;
      });
    }

    return baseRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // إعداد اتجاه الشيت من اليمين إلى اليسار للغة العربية
  worksheet['!dir'] = 'rtl';
  
  // ضبط عرض الأعمدة
  const colWidths = [
    { wch: 5 },   // م
    { wch: 18 },  // كود الجهاز
    { wch: 28 },  // اسم الجهاز
    { wch: 20 },  // الرقم التسلسلي
    { wch: 25 },  // القسم
    { wch: 20 },  // الغرفة
    { wch: 22 },  // المستخدم
    { wch: 18 },  // الحالة
    { wch: 16 },  // IP
    { wch: 20 },  // MAC
    { wch: 22 },  // CPU
    { wch: 14 },  // RAM
    { wch: 18 },  // Storage
    { wch: 16 },  // OS
    { wch: 14 },  // الشراء
    { wch: 14 },  // الضمان
    { wch: 30 }   // ملاحظات
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'أجهزة المستشفى');

  XLSX.writeFile(workbook, fileName);
}

/**
 * تنزيل نموذج إكسيل فارغ ومجهز لمستخدمي المستشفى لرفعه لاحقاً (مع دعم إضافة أعمدة مخصصة)
 */
export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'كود الجهاز': 'HOSP-PC-201',
      'اسم الجهاز': 'كمبيوتر استقبال العيادات',
      'السيريال': 'SN-DEL-998811',
      'القسم': 'العيادات الخارجية (Outpatient)',
      'الغرفة/المكان': 'عيادة 101',
      'المستخدم/الموظف': 'د. أحمد صبري',
      'الحالة': 'يعمل',
      'المعالج': 'Intel Core i5-12400',
      'الرامات': '16 GB',
      'التخزين': '512 GB SSD',
      'نظام التشغيل': 'Windows 11 Pro',
      'عنوان IP': '192.168.10.45',
      'عنوان MAC': '00:1A:2B:3C:4D:5E',
      'تاريخ الشراء': '2024-01-15',
      'ملاحظات': 'نموذج تجريبي جاهز للتعديل',
      'الشركة الموردة (عمود إضافي)': 'مؤسسة النيل للحلول الطبية',
      'رقم الشاسية الجانبي (عمود إضافي)': 'CHS-99201'
    },
    {
      'كود الجهاز': 'HOSP-PC-202',
      'اسم الجهاز': 'محطة عمل الأشعة',
      'السيريال': 'SN-HP-334411',
      'القسم': 'قسم الأشعة (Radiology)',
      'الغرفة/المكان': 'غرفة السونار',
      'المستخدم/الموظف': 'د. رانيا طارق',
      'الحالة': 'قيد الصيانة',
      'المعالج': 'Intel Core i7-13700',
      'الرامات': '32 GB',
      'التخزين': '1 TB SSD',
      'نظام التشغيل': 'Windows 11 Pro',
      'عنوان IP': '192.168.20.15',
      'عنوان MAC': '00:1A:2B:3C:4D:5F',
      'تاريخ الشراء': '2023-08-20',
      'ملاحظات': 'يحتاج تحديث تعاريف كارت الشاشة',
      'الشركة الموردة (عمود إضافي)': 'شركة الدلتا للتجهيزات',
      'رقم الشاسية الجانبي (عمود إضافي)': 'CHS-99202'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!dir'] = 'rtl';
  worksheet['!cols'] = [
    { wch: 15 }, { wch: 25 }, { wch: 18 }, { wch: 25 }, { wch: 18 },
    { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
    { wch: 16 }, { wch: 15 }, { wch: 18 }, { wch: 14 }, { wch: 25 },
    { wch: 25 }, { wch: 25 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج إدخال الأجهزة');

  XLSX.writeFile(workbook, 'نموذج_حصر_أجهزة_المستشفى.xlsx');
}
