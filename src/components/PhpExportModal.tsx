import React, { useState } from 'react';
import { X, Download, Code2, Database, Server, CheckCircle2, Copy, FileText } from 'lucide-react';
import { ComputerAsset } from '../types';

interface PhpExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: ComputerAsset[];
}

export const PhpExportModal: React.FC<PhpExportModalProps> = ({
  isOpen,
  onClose,
  assets
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'sql' | 'config' | 'api' | 'index' | 'readme'>('sql');

  if (!isOpen) return null;

  // توليد كود SQL القواعد مع البيانات الحالية
  const sqlScript = `-- =========================================================
-- سكريبت إنشاء قاعدة البيانات والجداول لنظام حصر الكمبيوترات
-- خادم MySQL / MariaDB (موافق لـ phpMyAdmin / XAMPP / cPanel)
-- =========================================================

CREATE DATABASE IF NOT EXISTS \`hospital_inventory\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`hospital_inventory\`;

-- 1. جدول الأجهزة الرئيسي (computers)
DROP TABLE IF EXISTS \`computers\`;
CREATE TABLE \`computers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`asset_tag\` VARCHAR(50) NOT NULL UNIQUE COMMENT 'كود الجهاز',
  \`name\` VARCHAR(150) NOT NULL COMMENT 'اسم الجهاز',
  \`serial_number\` VARCHAR(100) NOT NULL COMMENT 'الرقم التسلسلي',
  \`department\` VARCHAR(100) NOT NULL COMMENT 'القسم بالمستشفى',
  \`room_number\` VARCHAR(50) DEFAULT 'غير محدد',
  \`assigned_user\` VARCHAR(150) DEFAULT 'غير محدد',
  \`status\` ENUM('active', 'maintenance', 'faulty', 'decommissioned') DEFAULT 'active',
  \`cpu\` VARCHAR(100) DEFAULT 'Intel Core i5',
  \`ram\` VARCHAR(50) DEFAULT '16 GB',
  \`storage\` VARCHAR(50) DEFAULT '512 GB SSD',
  \`os\` VARCHAR(50) DEFAULT 'Windows 11 Pro',
  \`ip_address\` VARCHAR(45) DEFAULT '192.168.1.1',
  \`mac_address\` VARCHAR(50) DEFAULT '00:00:00:00:00:00',
  \`purchase_date\` DATE NULL,
  \`notes\` TEXT NULL,
  \`custom_fields_json\` JSON NULL COMMENT 'الحقول والأعمدة الإضافية المستوردة من الإكسيل',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول سجلات التذاكر والصيانة (maintenance_records)
DROP TABLE IF EXISTS \`maintenance_records\`;
CREATE TABLE \`maintenance_records\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`asset_tag\` VARCHAR(50) NOT NULL,
  \`date\` DATE NOT NULL,
  \`issue\` TEXT NOT NULL COMMENT 'وصف العطل',
  \`action_taken\` TEXT NULL COMMENT 'الإجراء المتخذ',
  \`technician_name\` VARCHAR(150) DEFAULT 'فني الصيانة',
  \`cost\` DECIMAL(10,2) DEFAULT 0.00,
  \`status\` ENUM('pending', 'in_progress', 'completed') DEFAULT 'completed',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`asset_tag\`) REFERENCES \`computers\`(\`asset_tag\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول مستخدمي النظام والصلاحيات (users)
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`username\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'technician', 'viewer') DEFAULT 'technician',
  \`department\` VARCHAR(100) DEFAULT 'قسم IT',
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج المستخدمين الافتراضيين:
INSERT INTO \`users\` (\`name\`, \`username\`, \`password\`, \`role\`, \`department\`) VALUES
('م. أحمد عبد الفتاح', 'admin', '123', 'admin', 'قسم تقنية المعلومات (IT Dept)'),
('م. خالد عبد الرحمن', 'tech', '123', 'technician', 'قسم تقنية المعلومات (IT Dept)'),
('د. سارة محمود (إدارة)', 'viewer', '123', 'viewer', 'الحسابات والإدارة (Finance)');

-- 4. جدول سجل الأنشطة والعمليات (audit_logs)
DROP TABLE IF EXISTS \`audit_logs\`;
CREATE TABLE \`audit_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_name\` VARCHAR(150) NOT NULL,
  \`user_role\` VARCHAR(50) NOT NULL,
  \`action_type\` VARCHAR(50) NOT NULL,
  \`details\` TEXT NOT NULL,
  \`asset_tag\` VARCHAR(50) NULL,
  \`timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج الأجهزة الحالية بالنظام (${assets.length} جهاز):
${assets.map(a => {
  const customJson = a.customFields ? JSON.stringify(a.customFields).replace(/'/g, "\\'") : 'NULL';
  return `INSERT INTO \`computers\` (\`asset_tag\`, \`name\`, \`serial_number\`, \`department\`, \`room_number\`, \`assigned_user\`, \`status\`, \`cpu\`, \`ram\`, \`storage\`, \`os\`, \`ip_address\`, \`mac_address\`, \`purchase_date\`, \`notes\`, \`custom_fields_json\`) VALUES
('${a.assetTag}', '${a.name.replace(/'/g, "''")}', '${a.serialNumber}', '${a.department}', '${a.roomNumber}', '${a.assignedUser.replace(/'/g, "''")}', '${a.status}', '${a.cpu}', '${a.ram}', '${a.storage}', '${a.os}', '${a.ipAddress}', '${a.macAddress}', '${a.purchaseDate || '2024-01-01'}', '${(a.notes || '').replace(/'/g, "''")}', ${customJson === 'NULL' ? 'NULL' : `'${customJson}'`});`;
}).join('\n')}
`;

  const phpConfig = `<?php
// =========================================================
// ملف الاتصال بقاعدة البيانات MySQL (config.php)
// =========================================================

$db_host = 'localhost';
$db_name = 'hospital_inventory';
$db_user = 'root'; // غير اسم المستخدم حسب سيرفرك
$db_pass = '';     // غير كلمة المرور حسب سيرفرك

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
} catch (PDOException $e) {
    die("خطأ في الاتصال بقاعدة البيانات MySQL: " . $e->getMessage());
}
?>`;

  const phpApi = `<?php
// =========================================================
// API التعامل مع البيانات JSON للـ PHP (api.php)
// =========================================================
header('Content-Type: application/json; charset=utf-8');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // جلب جميع الأجهزة
    $stmt = $pdo->query("SELECT * FROM computers ORDER BY id DESC");
    $computers = $stmt->fetchAll();
    echo json_encode(['status' => 'success', 'data' => $computers], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    // إضافة جهاز جديد
    $input = json_decode(file_get_contents('php://input'), true);
    
    $sql = "INSERT INTO computers (asset_tag, name, serial_number, department, room_number, assigned_user, status, cpu, ram, storage, os, ip_address, mac_address, purchase_date, notes) 
            VALUES (:asset_tag, :name, :serial_number, :department, :room_number, :assigned_user, :status, :cpu, :ram, :storage, :os, :ip_address, :mac_address, :purchase_date, :notes)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':asset_tag' => $input['assetTag'],
        ':name' => $input['name'],
        ':serial_number' => $input['serialNumber'],
        ':department' => $input['department'],
        ':room_number' => $input['roomNumber'] ?? '',
        ':assigned_user' => $input['assignedUser'] ?? '',
        ':status' => $input['status'] ?? 'active',
        ':cpu' => $input['cpu'] ?? '',
        ':ram' => $input['ram'] ?? '',
        ':storage' => $input['storage'] ?? '',
        ':os' => $input['os'] ?? 'Windows 11 Pro',
        ':ip_address' => $input['ipAddress'] ?? '',
        ':mac_address' => $input['macAddress'] ?? '',
        ':purchase_date' => $input['purchaseDate'] ?? date('Y-m-d'),
        ':notes' => $input['notes'] ?? ''
    ]);

    echo json_encode(['status' => 'success', 'message' => 'تم حفظ الجهاز بنجاح في MySQL']);
    exit;
}
?>`;

  const phpIndex = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>نظام إدارة أجهزة الكمبيوتر - PHP & MySQL</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-slate-50 text-slate-900 font-sans p-6">
    <?php require_once 'config.php'; ?>
    <div class="max-w-7xl mx-auto">
        <header class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">سجل حصر أجهزة الكمبيوتر (PHP & MySQL)</h1>
                <p class="text-sm text-slate-500">نظام إدارة العتاد التقني ومتابعة الصيانة بالمستشفى</p>
            </div>
            <a href="export_excel.php" class="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm">تصدير إكسيل</a>
        </header>

        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table class="w-full text-right text-sm">
                <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                        <th class="p-3">كود الجهاز</th>
                        <th class="p-3">اسم الجهاز</th>
                        <th class="p-3">القسم</th>
                        <th class="p-3">المستخدم</th>
                        <th class="p-3">الحالة</th>
                        <th class="p-3">عنوان IP</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $stmt = $pdo->query("SELECT * FROM computers ORDER BY id DESC");
                    while($row = $stmt->fetch()) {
                        echo "<tr class='border-b border-slate-100 hover:bg-slate-50'>";
                        echo "<td class='p-3 font-mono font-bold text-blue-700'>{$row['asset_tag']}</td>";
                        echo "<td class='p-3 font-semibold'>{$row['name']}</td>";
                        echo "<td class='p-3'>{$row['department']}</td>";
                        echo "<td class='p-3'>{$row['assigned_user']}</td>";
                        echo "<td class='p-3'><span class='px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-800'>{$row['status']}</span></td>";
                        echo "<td class='p-3 font-mono'>{$row['ip_address']}</td>";
                        echo "</tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;

  const readmeText = `=========================================================
دليل تشغيل التطبيق على سيرفر PHP & MySQL (Localhost / cPanel)
=========================================================

1. خطوات إعداد قاعدة البيانات MySQL:
   - افتح لوحة التحكم phpMyAdmin على السيرفر المحلي (XAMPP / WAMP) أو لوحة cPanel.
   - قم بإنشاء قاعدة بيانات جديدة باسم: hospital_inventory
   - اضغط على تبويب "استيراد" (Import) واختر ملف: database.sql
   - اضغط تنفيذ (Go). سيتم إنشاء الجداول وإدراج جميع الأجهزة بداخلها!

2. إعداد الاتصال بالخادم (config.php):
   - افتح ملف config.php وعدل اسم المستخدم وكلمة المرور لقاعدة البيانات حسب خادامك:
     $db_user = 'root';
     $db_pass = '';

3. دعم استيراد وتصدير الإكسيل والأعمدة المخصصة:
   - الملفات مدعومة للتعامل مع معايير UTF-8 والأعمدة الديناميكية في PHP.
`;

  const downloadFile = (content: string, filename: string, type = 'text/plain') => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(name);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const getActiveContent = () => {
    switch (activeCodeTab) {
      case 'sql': return { text: sqlScript, filename: 'database.sql' };
      case 'config': return { text: phpConfig, filename: 'config.php' };
      case 'api': return { text: phpApi, filename: 'api.php' };
      case 'index': return { text: phpIndex, filename: 'index.php' };
      case 'readme': return { text: readmeText, filename: 'README.txt' };
    }
  };

  const activeData = getActiveContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right dir-rtl text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">تصدير مشروع PHP & MySQL</h2>
              <p className="text-xs text-slate-500">تحميل أكواد PHP وسكريبت إنشاء قاعدة البيانات لاستضافته على cPanel أو XAMPP</p>
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

        {/* Action Buttons & Tabs */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCodeTab('sql')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeCodeTab === 'sql' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>قاعدة البيانات (database.sql)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('config')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeCodeTab === 'config' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>الاتصال (config.php)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('api')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeCodeTab === 'api' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>API البيانات (api.php)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('index')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeCodeTab === 'index' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>صفحة العرض (index.php)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('readme')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeCodeTab === 'readme' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>دليل التشغيل (README)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeData.text, activeData.filename)}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedTab === activeData.filename ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedTab === activeData.filename ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>

            <button
              onClick={() => downloadFile(activeData.text, activeData.filename)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل {activeData.filename}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-200 dir-ltr text-left">
          <pre className="whitespace-pre-wrap">{activeData.text}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-600 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>يحتوي ملف database.sql على {assets.length} جهاز محفوط حالياً بالنظام جاهز للاستيراد في phpMyAdmin.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                downloadFile(sqlScript, 'database.sql');
                downloadFile(phpConfig, 'config.php');
                downloadFile(phpApi, 'api.php');
                downloadFile(phpIndex, 'index.php');
                downloadFile(readmeText, 'README.txt');
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تحميل حزمة PHP & MySQL الكاملة</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
