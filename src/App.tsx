import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsDashboard } from './components/StatsDashboard';
import { DeviceList } from './components/DeviceList';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { DeviceDetailModal } from './components/DeviceDetailModal';
import { DeviceFormModal } from './components/DeviceFormModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { PrintAssetTagsModal } from './components/PrintAssetTagsModal';
import { PhpExportModal } from './components/PhpExportModal';
import { LoginModal } from './components/LoginModal';
import { UserManagementModal } from './components/UserManagementModal';
import { AuditLogModal } from './components/AuditLogModal';
import { WarrantyNotificationsModal } from './components/WarrantyNotificationsModal';

import { ComputerAsset, MaintenanceRecord, HospitalDepartment, User, AuditLogEntry, AuditActionType } from './types';
import { INITIAL_COMPUTERS, INITIAL_USERS, INITIAL_AUDIT_LOGS } from './data/initialData';
import { exportAssetsToExcel, downloadSampleExcelTemplate } from './utils/excelUtils';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'hospital_computers_inventory_v1';
const USERS_STORAGE_KEY = 'hospital_users_inventory_v1';
const CURRENT_USER_KEY = 'hospital_current_user_v1';
const AUDIT_LOGS_KEY = 'hospital_audit_logs_v1';

export default function App() {
  // المستخدمون المخزنون
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load users', e);
    }
    return INITIAL_USERS;
  });

  // المستخدم الحالي المسجل الدخول
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load current user', e);
    }
    return INITIAL_USERS[0]; // الدخول افتراضياً بحساب المدير التجريبي
  });

  // سجل الأنشطة والعمليات (Audit Log)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(AUDIT_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  // الأجهزة المخزنة
  const [assets, setAssets] = useState<ComputerAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local storage assets', e);
    }
    return INITIAL_COMPUTERS;
  });

  // النوافذ المنبثقة والتبويبات
  const [activeTab, setActiveTab] = useState<'all' | 'maintenance' | 'stats'>('all');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ComputerAsset | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<ComputerAsset | null>(null);
  
  const [maintModalAsset, setMaintModalAsset] = useState<ComputerAsset | null>(null);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [singlePrintAsset, setSinglePrintAsset] = useState<ComputerAsset | null>(null);

  const [isPhpModalOpen, setIsPhpModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);

  // التنبيهات المؤقتة
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // حفظ التغييرات في التخزين المحلي
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    } catch (e) {
      console.error('Failed to save assets', e);
    }
  }, [assets]);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to save current user', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Failed to save audit logs', e);
    }
  }, [auditLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // دالة تسجيل العمليات في سجل Audit Log
  const logAudit = (
    actionType: AuditActionType,
    details: string,
    assetTag?: string,
    assetName?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'مستخدم النظام',
      userRole: currentUser?.role || 'viewer',
      actionType,
      details,
      assetTag,
      assetName,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // تسجيل الدخول والخروج
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    logAudit('login', `تسجيل دخول ناجح للمستخدم: ${user.name}`);
    showToast(`أهلاً بك م. ${user.name}! تم تسجيل الدخول بنجاح.`);
  };

  const handleLogout = () => {
    if (currentUser) {
      logAudit('logout', `تسجيل الخروج من النظام للمستخدم: ${currentUser.name}`);
    }
    setCurrentUser(null);
    showToast('تم تسجيل الخروج من النظام.');
  };

  // إدارة المستخدمين
  const handleAddUser = (newUserData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...newUserData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    logAudit('user_add', `إضافة مستخدم جديد للنظام باسم: ${newUser.name} (${newUser.username})`);
    showToast(`تمت إضافة المستخدم الجديد (${newUser.name}) بنجاح!`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextActive = !u.isActive;
        logAudit('user_status_change', `تغيير حالة حساب المستخدم (${u.name}) إلى: ${nextActive ? 'نشط' : 'معطل'}`);
        return { ...u, isActive: nextActive };
      }
      return u;
    }));
    showToast('تم تحديث حالة حساب المستخدم.');
  };

  // استيراد الأجهزة من شيت إكسيل
  const handleImportAssets = (newAssets: ComputerAsset[], replaceExisting: boolean) => {
    if (replaceExisting) {
      setAssets(newAssets);
      logAudit('excel_import', `استبدال جميع أجهزة السجل واستيراد ${newAssets.length} جهاز كمبيوتر من شيت إكسيل`);
      showToast(`تم استبدال القائمة بنجاح واستيراد ${newAssets.length} جهاز كمبيوتر من شيت الإكسيل!`);
    } else {
      setAssets(prev => [...newAssets, ...prev]);
      logAudit('excel_import', `دمج وإضافة ${newAssets.length} جهاز كمبيوتر جديد من شيت إكسيل`);
      showToast(`تم دمج وإضافة ${newAssets.length} جهاز كمبيوتر جديد من شيت الإكسيل!`);
    }
  };

  // حفظ أو تعديل جهاز
  const handleSaveAsset = (assetData: Partial<ComputerAsset>) => {
    if (editingAsset) {
      // تعديل
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? { 
        ...a, 
        ...assetData, 
        updatedAt: new Date().toISOString(),
        updatedByUserName: currentUser?.name || 'مستخدم IT'
      } as ComputerAsset : a));

      logAudit('edit_device', `تحديث وتعديل بيانات الجهاز (${assetData.assetTag || editingAsset.assetTag}) - القسم: ${assetData.department || editingAsset.department}`, assetData.assetTag || editingAsset.assetTag, assetData.name || editingAsset.name);
      showToast(`تم تحديث بيانات الجهاز (${assetData.assetTag}) بنجاح!`);
    } else {
      // إضافة جديد
      const newAsset: ComputerAsset = {
        id: `pc-${Date.now()}`,
        assetTag: assetData.assetTag || `HOSP-PC-${Math.floor(100 + Math.random() * 900)}`,
        name: assetData.name || 'جهاز كمبيوتر جديد',
        serialNumber: assetData.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        department: assetData.department || 'الطوارئ (ER)',
        roomNumber: assetData.roomNumber || 'الدور الأول',
        assignedUser: assetData.assignedUser || 'كادر المستشفى',
        assignedUserRole: assetData.assignedUserRole || '',
        status: assetData.status || 'active',
        cpu: assetData.cpu || 'Intel Core i5',
        ram: assetData.ram || '16 GB',
        storage: assetData.storage || '512 GB SSD',
        os: assetData.os || 'Windows 11 Pro',
        ipAddress: assetData.ipAddress || '192.168.10.10',
        macAddress: assetData.macAddress || '00:1B:44:00:00:00',
        purchaseDate: assetData.purchaseDate || new Date().toISOString().split('T')[0],
        warrantyExpiry: assetData.warrantyExpiry || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        notes: assetData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByUserName: currentUser?.name || 'مستخدم IT',
        updatedByUserName: currentUser?.name || 'مستخدم IT',
        maintenanceHistory: []
      };
      setAssets(prev => [newAsset, ...prev]);

      logAudit('add_device', `إضافة جهاز كمبيوتر جديد: ${newAsset.name} بقسم ${newAsset.department}`, newAsset.assetTag, newAsset.name);
      showToast(`تمت إضافة الجهاز الجديد (${newAsset.assetTag}) لقائمة المستشفى!`);
    }
  };

  // حذف جهاز
  const handleDeleteAsset = (id: string) => {
    const target = assets.find(a => a.id === id);
    if (target) {
      logAudit('delete_device', `حذف الجهاز (${target.assetTag} - ${target.name}) من النظام`, target.assetTag, target.name);
    }
    setAssets(prev => prev.filter(a => a.id !== id));
    showToast('تم حذف الجهاز من السجل بنجاح.');
    if (selectedAsset?.id === id) {
      setSelectedAsset(null);
    }
  };

  // تسجيل تذكرة صيانة
  const handleSaveMaintenanceTicket = (
    assetId: string, 
    ticket: MaintenanceRecord, 
    newStatus?: 'active' | 'maintenance' | 'faulty'
  ) => {
    const target = assets.find(a => a.id === assetId);

    const enrichedTicket: MaintenanceRecord = {
      ...ticket,
      technicianName: currentUser?.name || ticket.technicianName,
      performedByUserId: currentUser?.id,
      createdAt: new Date().toISOString()
    };

    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const history = a.maintenanceHistory || [];
        return {
          ...a,
          status: newStatus || a.status,
          maintenanceHistory: [enrichedTicket, ...history],
          updatedAt: new Date().toISOString(),
          updatedByUserName: currentUser?.name || 'فني صيانة'
        };
      }
      return a;
    }));

    logAudit(
      'maintenance_add', 
      `تسجيل تذكرة صيانة وإصلاح للجهاز (${target?.assetTag || ''}): ${ticket.issue} | الإجراء: ${ticket.actionTaken || 'قيد المعالجة'} بواسطة (${currentUser?.name || ticket.technicianName})`,
      target?.assetTag,
      target?.name
    );

    showToast(`تم حفظ سجل الصيانة وتحديث حالة الجهاز!`);

    // إذا كان الكارت مفتوحاً للتفاصيل، نحدثه بنفس الوقت
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset(prev => prev ? {
        ...prev,
        status: newStatus || prev.status,
        maintenanceHistory: [enrichedTicket, ...(prev.maintenanceHistory || [])]
      } : null);
    }
  };

  // تصدير لإكسيل
  const handleExport = () => {
    exportAssetsToExcel(assets);
    logAudit('excel_export', `تصدير قائمة الأجهزة الحالية إلى شيت إكسيل (${assets.length} جهاز)`);
    showToast('تم تصدير ملف الإكسيل بنجاح وجاري التنزيل...');
  };

  // استعادة البيانات الافتراضية
  const handleResetData = () => {
    if (confirm('هل أنت متأكد من إعادة ضبط البيانات واسترجاع قائمة أجهزة المستشفى النموذجية الافتراضية؟')) {
      setAssets(INITIAL_COMPUTERS);
      localStorage.removeItem(STORAGE_KEY);
      logAudit('data_reset', 'إعادة ضبط كافة بيانات الأجهزة واسترجاع النموذج الافتراضي للمستشفى');
      showToast('تمت استعادة القائمة النموذجية لأجهزة المستشفى.');
    }
  };

  // إذا لم يكن هناك مستخدم مسجل الدخول، نعرض شاشة الدخول
  if (!currentUser) {
    return (
      <LoginModal
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white pb-16">
      
      {/* شريط الإشعارات والـ Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-white border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce text-xs font-semibold dir-rtl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الهيدر وشريط التنقل العلوي */}
      <Navbar
        assets={assets}
        currentUser={currentUser}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenAddModal={() => {
          setEditingAsset(null);
          setIsAddModalOpen(true);
        }}
        onOpenPrintModal={() => {
          setSinglePrintAsset(null);
          setIsPrintModalOpen(true);
        }}
        onOpenPhpModal={() => setIsPhpModalOpen(true)}
        onOpenUsersModal={() => setIsUsersModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenWarrantyModal={() => setIsWarrantyModalOpen(true)}
        onLogout={handleLogout}
        onExportExcel={handleExport}
        onDownloadTemplate={downloadSampleExcelTemplate}
        onResetData={handleResetData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* التبويب 1: التحليلات والإحصائيات */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <StatsDashboard
              assets={assets}
              onFilterDepartment={(dept) => {
                setActiveTab('all');
              }}
              onFilterStatus={(status) => {
                setActiveTab('all');
              }}
              onOpenWarrantyModal={() => setIsWarrantyModalOpen(true)}
            />
          </div>
        )}

        {/* التبويب 2: جميع الأجهزة (قائمة البحث والفلترة) */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            
            {/* بطاقة Bento الدعائية لرفع الإكسيل */}
            {assets.length === INITIAL_COMPUTERS.length && (
              <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-md dir-rtl">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 text-white rounded-2xl shrink-0 backdrop-blur-sm border border-white/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">مرحباً بك د. {currentUser.name}! في نظام حصر أجهزة كمبيوتر المستشفى</h2>
                    <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                      عندك شيت إكسيل (Excel) وتريد رفعه؟ اضغط على زر "رفع شيت إكسيل" للتعرف الذكي على الحقول وتحميل بياناتك فوراً.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition shrink-0 cursor-pointer relative z-10"
                >
                  رفع شيت الإكسيل الآن
                </button>

                {/* عناصر ديكور خلفية Bento */}
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500 opacity-30 rounded-full pointer-events-none"></div>
                <div className="absolute right-12 top-2 w-24 h-24 border-4 border-blue-400 opacity-20 rounded-full pointer-events-none"></div>
              </div>
            )}

            <DeviceList
              assets={assets}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              onEditAsset={(asset) => {
                setEditingAsset(asset);
                setIsAddModalOpen(true);
              }}
              onDeleteAsset={handleDeleteAsset}
              onAddMaintenanceTicket={(asset) => {
                setMaintModalAsset(asset);
                setIsMaintModalOpen(true);
              }}
              onPrintSingleAssetTag={(asset) => {
                setSinglePrintAsset(asset);
                setIsPrintModalOpen(true);
              }}
            />
          </div>
        )}

        {/* التبويب 3: طلبات الصيانة والأعطال */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <DeviceList
              assets={assets.filter(a => a.status === 'maintenance' || a.status === 'faulty')}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              onEditAsset={(asset) => {
                setEditingAsset(asset);
                setIsAddModalOpen(true);
              }}
              onDeleteAsset={handleDeleteAsset}
              onAddMaintenanceTicket={(asset) => {
                setMaintModalAsset(asset);
                setIsMaintModalOpen(true);
              }}
              onPrintSingleAssetTag={(asset) => {
                setSinglePrintAsset(asset);
                setIsPrintModalOpen(true);
              }}
            />
          </div>
        )}

      </main>

      {/* النوافذ المنبثقة (Modals) */}

      {/* 1. نافذة رفع وتجهيز شيت الإكسيل */}
      <ExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportAssets={handleImportAssets}
      />

      {/* 2. نافذة البطاقة الفنية والتفاصيل */}
      <DeviceDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onEdit={(asset) => {
          setSelectedAsset(null);
          setEditingAsset(asset);
          setIsAddModalOpen(true);
        }}
        onAddMaintenanceTicket={(asset) => {
          setMaintModalAsset(asset);
          setIsMaintModalOpen(true);
        }}
        onPrintSingleAssetTag={(asset) => {
          setSinglePrintAsset(asset);
          setIsPrintModalOpen(true);
        }}
      />

      {/* 3. نافذة إضافة وتعديل جهاز */}
      <DeviceFormModal
        isOpen={isAddModalOpen}
        editingAsset={editingAsset}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
      />

      {/* 4. نافذة تسجيل وتحديث صيانة */}
      <MaintenanceModal
        asset={maintModalAsset}
        isOpen={isMaintModalOpen}
        defaultTechnicianName={currentUser.name}
        onClose={() => {
          setIsMaintModalOpen(false);
          setMaintModalAsset(null);
        }}
        onSaveTicket={handleSaveMaintenanceTicket}
      />

      {/* 5. نافذة طباعة ملصقات الباركود و QR */}
      <PrintAssetTagsModal
        assets={assets}
        singleAsset={singlePrintAsset}
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSinglePrintAsset(null);
        }}
      />

      {/* 6. نافذة تصدير وتنزيل مشروع PHP & MySQL */}
      <PhpExportModal
        isOpen={isPhpModalOpen}
        onClose={() => setIsPhpModalOpen(false)}
        assets={assets}
      />

      {/* 7. نافذة إدارة مستخدمي النظام والصلاحيات */}
      <UserManagementModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onAddUser={handleAddUser}
        onToggleUserStatus={handleToggleUserStatus}
      />

      {/* 8. نافذة سجل الأنشطة والعمليات Audit Log */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      {/* 9. نافذة تنبيهات مواعيد انتهاء الضمان */}
      <WarrantyNotificationsModal
        isOpen={isWarrantyModalOpen}
        onClose={() => setIsWarrantyModalOpen(false)}
        assets={assets}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
        onAddMaintenanceTicket={(asset) => {
          setMaintModalAsset(asset);
          setIsMaintModalOpen(true);
        }}
      />

    </div>
  );
}

