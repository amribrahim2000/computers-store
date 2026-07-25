export type AssetStatus = 'active' | 'maintenance' | 'faulty' | 'decommissioned';

export type OperatingSystem = 'Windows 11 Pro' | 'Windows 10 Pro' | 'Windows 7 Pro' | 'Ubuntu Linux' | 'macOS' | 'أخرى';

export type UserRole = 'admin' | 'technician' | 'viewer';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  department?: string;
  avatarColor?: string;
  createdAt: string;
  isActive: boolean;
}

export type AuditActionType = 
  | 'login'
  | 'logout'
  | 'add_device'
  | 'edit_device'
  | 'delete_device'
  | 'maintenance_add'
  | 'excel_import'
  | 'excel_export'
  | 'user_add'
  | 'user_status_change'
  | 'data_reset';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: AuditActionType;
  details: string;
  assetTag?: string;
  assetName?: string;
  timestamp: string;
}

export type HospitalDepartment = 
  | 'الطوارئ (ER)'
  | 'العناية المركزة (ICU)'
  | 'قسم الأشعة (Radiology)'
  | 'المختبر والتحاليل (Lab)'
  | 'الصيدلية المركزية (Pharmacy)'
  | 'العيادات الخارجية (Outpatient)'
  | 'غرف العمليات (Operating Theater)'
  | 'الاستقبال والسجلات (Reception)'
  | 'الحسابات والإدارة (Finance)'
  | 'شؤون المرضى (Patient Reg)'
  | 'قسم تقنية المعلومات (IT Dept)';

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  date: string;
  issue: string;
  actionTaken?: string;
  technicianName: string;
  performedByUserId?: string;
  cost?: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  createdAt?: string;
}

export interface ComputerAsset {
  id: string;
  assetTag: string; // كود الجهاز مثلاً: HOSP-PC-101
  name: string; // اسم الجهاز بجهة العمل
  serialNumber: string; // الرقم التسلسلي
  department: HospitalDepartment;
  roomNumber: string; // رقم الغرفة أو المبدنى
  assignedUser: string; // اسم الموظف / الطبيب / الفني
  assignedUserRole?: string; // المسمى الوظيفي
  status: AssetStatus;
  
  // المواصفات الفنية
  cpu: string; // المعالج
  ram: string; // الذاكرة
  storage: string; // مساحة التخزين
  os: OperatingSystem; // نظام التشغيل
  
  // الشبكة
  ipAddress: string;
  macAddress: string;

  // الضمان والشراء
  purchaseDate: string; // تاريخ الشراء
  warrantyExpiry: string; // تاريخ انتهاء الضمان
  vendorName?: string; // المورد

  // صيانة وملاحظات
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserName?: string;
  updatedByUserName?: string;
  
  // حقول وأعمدة إضافية مخصصة من الإكسيل
  customFields?: Record<string, string>;

  maintenanceHistory?: MaintenanceRecord[];
}

export interface ExcelColumnMapping {
  assetTag: string;
  name: string;
  serialNumber: string;
  department: string;
  roomNumber: string;
  assignedUser: string;
  status: string;
  cpu: string;
  ram: string;
  storage: string;
  os: string;
  ipAddress: string;
  macAddress: string;
  purchaseDate: string;
  notes: string;
  customColumns?: string[]; // أسماء الأعمدة الإضافية التي تم اكتشافها في شيت الإكسيل
}
