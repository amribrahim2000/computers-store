-- =========================================================
-- سكريبت إنشاء قاعدة البيانات والجداول لنظام حصر الكمبيوترات
-- خادم MySQL / MariaDB (موافق لـ phpMyAdmin / XAMPP / cPanel)
-- =========================================================

CREATE DATABASE IF NOT EXISTS `hospital_inventory` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hospital_inventory`;

-- 1. جدول الأجهزة الرئيسي (computers)
DROP TABLE IF EXISTS `computers`;
CREATE TABLE `computers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `asset_tag` VARCHAR(50) NOT NULL UNIQUE COMMENT 'كود الجهاز',
  `name` VARCHAR(150) NOT NULL COMMENT 'اسم الجهاز',
  `serial_number` VARCHAR(100) NOT NULL COMMENT 'الرقم التسلسلي',
  `department` VARCHAR(100) NOT NULL COMMENT 'القسم بالمستشفى',
  `room_number` VARCHAR(50) DEFAULT 'غير محدد',
  `assigned_user` VARCHAR(150) DEFAULT 'غير محدد',
  `status` ENUM('active', 'maintenance', 'faulty', 'decommissioned') DEFAULT 'active',
  `cpu` VARCHAR(100) DEFAULT 'Intel Core i5',
  `ram` VARCHAR(50) DEFAULT '16 GB',
  `storage` VARCHAR(50) DEFAULT '512 GB SSD',
  `os` VARCHAR(50) DEFAULT 'Windows 11 Pro',
  `ip_address` VARCHAR(45) DEFAULT '192.168.1.1',
  `mac_address` VARCHAR(50) DEFAULT '00:00:00:00:00:00',
  `purchase_date` DATE NULL,
  `warranty_expiry` DATE NULL COMMENT 'تاريخ انتهاء الضمان',
  `vendor_name` VARCHAR(150) DEFAULT 'شركة توريد العتاد',
  `notes` TEXT NULL,
  `custom_fields_json` JSON NULL COMMENT 'الحقول والأعمدة الإضافية المستوردة من الإكسيل',
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT 'حالة الحذف المؤقت Soft Delete (0: نشط, 1: في سلة المهملات)',
  `deleted_at` DATETIME NULL COMMENT 'تاريخ ووقت الحذف المؤقت',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول سجلات التذاكر والصيانة (maintenance_records)
DROP TABLE IF EXISTS `maintenance_records`;
CREATE TABLE `maintenance_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `asset_tag` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `issue` TEXT NOT NULL COMMENT 'وصف العطل',
  `action_taken` TEXT NULL COMMENT 'الإجراء المتخذ',
  `technician_name` VARCHAR(150) DEFAULT 'فني الصيانة',
  `cost` DECIMAL(10,2) DEFAULT 0.00,
  `status` ENUM('pending', 'in_progress', 'completed') DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`asset_tag`) REFERENCES `computers`(`asset_tag`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول مستخدمي النظام والصلاحيات (users)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'technician', 'viewer') DEFAULT 'technician',
  `department` VARCHAR(100) DEFAULT 'قسم IT',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج المستخدمين الافتراضيين:
INSERT INTO `users` (`name`, `username`, `password`, `role`, `department`) VALUES
('م. أحمد عبد الفتاح', 'admin', '123', 'admin', 'قسم تقنية المعلومات (IT Dept)'),
('م. خالد عبد الرحمن', 'tech', '123', 'technician', 'قسم تقنية المعلومات (IT Dept)'),
('د. سارة محمود (إدارة)', 'viewer', '123', 'viewer', 'الحسابات والإدارة (Finance)');

-- 4. جدول سجل الأنشطة والعمليات (audit_logs)
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(150) NOT NULL,
  `user_role` VARCHAR(50) NOT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `details` TEXT NOT NULL,
  `asset_tag` VARCHAR(50) NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج أجهزة المستشفى الافتراضية
INSERT INTO `computers` (`asset_tag`, `name`, `serial_number`, `department`, `room_number`, `assigned_user`, `status`, `cpu`, `ram`, `storage`, `os`, `ip_address`, `mac_address`, `purchase_date`, `warranty_expiry`, `notes`) VALUES
('HOSP-PC-101', 'جهاز غرفة الفحص والتصوير العاجل', 'SN-ER-99281', 'الطوارئ (ER)', 'غرفة 102', 'د. محمد علي', 'active', 'Intel Core i7 12th Gen', '16 GB', '512 GB SSD', 'Windows 11 Pro', '192.168.1.101', '00:1A:2B:3C:4D:5E', '2023-01-15', '2026-01-15', 'جهاز مرتبط بكاميرا فحص وأجهزة قياس المؤشرات الحيوية'),
('HOSP-PC-102', 'محطة مراقبة مؤشرات العناية المركزة', 'SN-ICU-88219', 'العناية المركزة (ICU)', 'كابينة 04', 'ممرض التمريض الأول', 'active', 'Intel Core i5 11th Gen', '16 GB', '256 GB SSD', 'Windows 10 Pro', '192.168.1.102', '00:1A:2B:3C:4D:5F', '2022-06-10', '2025-06-10', 'شاشة مخصصة لعرض رسم القلب ومعدل الأكسجين مستمر'),
('HOSP-PC-103', 'محطة معالجة أجهزة الأشعة المقطعية CT', 'SN-RAD-33102', 'قسم الأشعة (Radiology)', 'غرفة أشعة 2', 'د. سارة محمود', 'active', 'Intel Core i9 Workstation', '32 GB', '2 TB NVMe SSD', 'Windows 11 Pro', '192.168.1.103', '00:1A:2B:3C:4D:60', '2023-11-20', '2026-11-20', 'محطة عمل جرافيك معالجة صور الأشعة ثلاثية الأبعاد DICOM'),
('HOSP-PC-104', 'جهاز الصيدلية المركزية 01', 'SN-PH-11029', 'الصيدلية المركزية (Pharmacy)', 'شباك 1', 'د. نهى أحمد', 'maintenance', 'Intel Core i3 10th Gen', '8 GB', '256 GB SSD', 'Windows 10 Pro', '192.168.1.104', '00:1A:2B:3C:4D:61', '2021-03-05', '2024-03-05', 'جهاز صرف الأدوية وتدقيق الروشتات الإلكترونية');
