<?php
/**
 * RESTful API Engine for Hospital Inventory
 * يدعم جميع العمليات (عرض، إضافة، تعديل، حذف، صيانة، تسجيل دخول)
 */

require_once 'config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. جلب قائمة كافة الأجهزة النشطة (أو المحذوفة)
if ($action === 'get_assets') {
    try {
        $includeDeleted = isset($_GET['include_deleted']) && $_GET['include_deleted'] == '1';
        $sql = $includeDeleted 
            ? "SELECT * FROM computers ORDER BY id DESC" 
            : "SELECT * FROM computers WHERE is_deleted = 0 ORDER BY id DESC";

        $stmt = $pdo->query($sql);
        $computers = $stmt->fetchAll();

        // جلب سجلات الصيانة لكل جهاز
        foreach ($computers as &$comp) {
            $mStmt = $pdo->prepare("SELECT * FROM maintenance_records WHERE asset_tag = ? ORDER BY id DESC");
            $mStmt->execute([$comp['asset_tag']]);
            $comp['maintenanceHistory'] = $mStmt->fetchAll();

            // تحويل الحقول المخزنة كـ JSON
            if (!empty($comp['custom_fields_json'])) {
                $comp['customFields'] = json_decode($comp['custom_fields_json'], true);
            }
        }

        echo json_encode(["status" => "success", "data" => $computers], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 1.1 جلب سلة المحذوفات (Soft Deleted Devices)
if ($action === 'get_trash') {
    try {
        $stmt = $pdo->query("SELECT * FROM computers WHERE is_deleted = 1 ORDER BY deleted_at DESC");
        $computers = $stmt->fetchAll();

        foreach ($computers as &$comp) {
            if (!empty($comp['custom_fields_json'])) {
                $comp['customFields'] = json_decode($comp['custom_fields_json'], true);
            }
        }

        echo json_encode(["status" => "success", "data" => $computers], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 2. إضافة جهاز جديد
if ($action === 'add_asset' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    try {
        $sql = "INSERT INTO computers (asset_tag, name, serial_number, department, room_number, assigned_user, status, cpu, ram, storage, os, ip_address, mac_address, purchase_date, warranty_expiry, vendor_name, notes, custom_fields_json) 
                VALUES (:asset_tag, :name, :serial_number, :department, :room_number, :assigned_user, :status, :cpu, :ram, :storage, :os, :ip_address, :mac_address, :purchase_date, :warranty_expiry, :vendor_name, :notes, :custom_fields_json)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':asset_tag' => $input['assetTag'],
            ':name' => $input['name'],
            ':serial_number' => $input['serialNumber'] ?? '',
            ':department' => $input['department'],
            ':room_number' => $input['roomNumber'] ?? '',
            ':assigned_user' => $input['assignedUser'] ?? '',
            ':status' => $input['status'] ?? 'active',
            ':cpu' => $input['cpu'] ?? '',
            ':ram' => $input['ram'] ?? '',
            ':storage' => $input['storage'] ?? '',
            ':os' => $input['os'] ?? '',
            ':ip_address' => $input['ipAddress'] ?? '',
            ':mac_address' => $input['macAddress'] ?? '',
            ':purchase_date' => !empty($input['purchaseDate']) ? $input['purchaseDate'] : null,
            ':warranty_expiry' => !empty($input['warrantyExpiry']) ? $input['warrantyExpiry'] : null,
            ':vendor_name' => $input['vendorName'] ?? '',
            ':notes' => $input['notes'] ?? '',
            ':custom_fields_json' => isset($input['customFields']) ? json_encode($input['customFields'], JSON_UNESCAPED_UNICODE) : null
        ]);

        echo json_encode(["status" => "success", "message" => "تمت إضافة الجهاز بنجاح!"], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 3. إضافة سجل صيانة
if ($action === 'add_maintenance' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    try {
        $stmt = $pdo->prepare("INSERT INTO maintenance_records (asset_tag, date, issue, action_taken, technician_name, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['assetTag'],
            $input['date'] ?? date('Y-m-d'),
            $input['issue'],
            $input['actionTaken'] ?? '',
            $input['technicianName'] ?? 'فني صيانة',
            $input['cost'] ?? 0,
            $input['status'] ?? 'completed'
        ]);

        // تحديث حالة الجهاز إن وجد
        if (!empty($input['newStatus'])) {
            $uStmt = $pdo->prepare("UPDATE computers SET status = ? WHERE asset_tag = ?");
            $uStmt->execute([$input['newStatus'], $input['assetTag']]);
        }

        echo json_encode(["status" => "success", "message" => "تم حفظ تذكرة الصيانة بنجاح!"], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 4. تسجيل الدخول
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && ($user['password'] === $password || password_verify($password, $user['password']))) {
            unset($user['password']);
            echo json_encode(["status" => "success", "data" => $user], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "اسم المستخدم أو كلمة المرور غير صحيحة!"], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 5. استيراد ومزامنة دفعة أجهزة وحفظها مباشرة في MySQL
if ($action === 'batch_import' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $assets = $input['assets'] ?? [];
    $replaceExisting = $input['replaceExisting'] ?? false;

    try {
        $pdo->beginTransaction();

        if ($replaceExisting) {
            $pdo->exec("DELETE FROM computers");
        }

        $sql = "INSERT INTO computers (asset_tag, name, serial_number, department, room_number, assigned_user, status, cpu, ram, storage, os, ip_address, mac_address, purchase_date, warranty_expiry, vendor_name, notes, custom_fields_json, is_deleted, deleted_at) 
                VALUES (:asset_tag, :name, :serial_number, :department, :room_number, :assigned_user, :status, :cpu, :ram, :storage, :os, :ip_address, :mac_address, :purchase_date, :warranty_expiry, :vendor_name, :notes, :custom_fields_json, :is_deleted, :deleted_at)
                ON DUPLICATE KEY UPDATE 
                name = VALUES(name), serial_number = VALUES(serial_number), department = VALUES(department), room_number = VALUES(room_number), assigned_user = VALUES(assigned_user), status = VALUES(status), cpu = VALUES(cpu), ram = VALUES(ram), storage = VALUES(storage), os = VALUES(os), ip_address = VALUES(ip_address), mac_address = VALUES(mac_address), purchase_date = VALUES(purchase_date), warranty_expiry = VALUES(warranty_expiry), notes = VALUES(notes), custom_fields_json = VALUES(custom_fields_json), is_deleted = VALUES(is_deleted), deleted_at = VALUES(deleted_at)";

        $stmt = $pdo->prepare($sql);

        $insertedCount = 0;
        foreach ($assets as $a) {
            $stmt->execute([
                ':asset_tag' => $a['assetTag'],
                ':name' => $a['name'],
                ':serial_number' => $a['serialNumber'] ?? '',
                ':department' => $a['department'] ?? 'الطوارئ (ER)',
                ':room_number' => $a['roomNumber'] ?? '',
                ':assigned_user' => $a['assignedUser'] ?? '',
                ':status' => $a['status'] ?? 'active',
                ':cpu' => $a['cpu'] ?? '',
                ':ram' => $a['ram'] ?? '',
                ':storage' => $a['storage'] ?? '',
                ':os' => $a['os'] ?? '',
                ':ip_address' => $a['ipAddress'] ?? '',
                ':mac_address' => $a['macAddress'] ?? '',
                ':purchase_date' => !empty($a['purchaseDate']) ? $a['purchaseDate'] : null,
                ':warranty_expiry' => !empty($a['warrantyExpiry']) ? $a['warrantyExpiry'] : null,
                ':vendor_name' => $a['vendorName'] ?? '',
                ':notes' => $a['notes'] ?? '',
                ':custom_fields_json' => isset($a['customFields']) ? json_encode($a['customFields'], JSON_UNESCAPED_UNICODE) : null,
                ':is_deleted' => !empty($a['isDeleted']) ? 1 : 0,
                ':deleted_at' => !empty($a['deletedAt']) ? $a['deletedAt'] : null
            ]);
            $insertedCount++;
        }

        // إدراج سجل العمليات تلقائياً
        $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_name, user_role, action_type, details, asset_tag) VALUES (?, ?, ?, ?, ?)");
        $logStmt->execute([
            $input['userName'] ?? 'مستخدم النظام',
            $input['userRole'] ?? 'admin',
            'mysql_sync_all',
            "تمت مزامنة وحفظ عدد {$insertedCount} جهاز كمبيوتر في قاعدة البيانات MySQL",
            null
        ]);

        $pdo->commit();

        echo json_encode([
            "status" => "success", 
            "message" => "تم حفظ ومزامنة {$insertedCount} جهاز بنجاح في قاعدة البيانات MySQL وتوثيق السجل!",
            "count" => $insertedCount
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "خطأ أثناء الحفظ في MySQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 5.1 الحذف المؤقت المجمع (Batch Soft Delete)
if ($action === 'batch_soft_delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $assetTags = $input['assetTags'] ?? [];
    $userName = $input['userName'] ?? 'فني النظام';
    $userRole = $input['userRole'] ?? 'admin';

    if (empty($assetTags)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "لم يتم تحديد أي أجهزة للحذف!"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    try {
        $pdo->beginTransaction();

        $inClause = implode(',', array_fill(0, count($assetTags), '?'));
        $sql = "UPDATE computers SET is_deleted = 1, deleted_at = NOW() WHERE asset_tag IN ($inClause)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($assetTags);
        $count = $stmt->rowCount();

        // توثيق السجل
        $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_name, user_role, action_type, details) VALUES (?, ?, ?, ?)");
        $logStmt->execute([
            $userName,
            $userRole,
            'soft_delete_devices',
            "تم نقل عدد {$count} جهاز كمبيوتر إلى سلة المهملات (حذف مؤقت)"
        ]);

        $pdo->commit();

        echo json_encode([
            "status" => "success", 
            "message" => "تم نقل {$count} جهاز بنجاح إلى سلة المهملات في MySQL!",
            "count" => $count
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 5.2 استعادة الأجهزة المحذوفة مؤقتاً (Batch Restore)
if ($action === 'batch_restore' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $assetTags = $input['assetTags'] ?? [];
    $userName = $input['userName'] ?? 'فني النظام';
    $userRole = $input['userRole'] ?? 'admin';

    if (empty($assetTags)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "لم يتم تحديد أي أجهزة للاستعادة!"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    try {
        $pdo->beginTransaction();

        $inClause = implode(',', array_fill(0, count($assetTags), '?'));
        $sql = "UPDATE computers SET is_deleted = 0, deleted_at = NULL WHERE asset_tag IN ($inClause)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($assetTags);
        $count = $stmt->rowCount();

        // توثيق السجل
        $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_name, user_role, action_type, details) VALUES (?, ?, ?, ?)");
        $logStmt->execute([
            $userName,
            $userRole,
            'restore_devices',
            "تمت استعادة عدد {$count} جهاز من سلة المهملات إلى السجل النشط"
        ]);

        $pdo->commit();

        echo json_encode([
            "status" => "success", 
            "message" => "تمت استعادة {$count} جهاز بنجاح في MySQL!",
            "count" => $count
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 5.3 الحذف النهائي لأجهزة سلة المهملات (Permanent Delete)
if ($action === 'batch_permanent_delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $assetTags = $input['assetTags'] ?? [];
    $userName = $input['userName'] ?? 'فني النظام';
    $userRole = $input['userRole'] ?? 'admin';

    try {
        $pdo->beginTransaction();

        if (empty($assetTags)) {
            // تفريغ كافة سلة المهملات
            $stmt = $pdo->query("DELETE FROM computers WHERE is_deleted = 1");
            $count = $stmt->rowCount();
        } else {
            $inClause = implode(',', array_fill(0, count($assetTags), '?'));
            $stmt = $pdo->prepare("DELETE FROM computers WHERE asset_tag IN ($inClause)");
            $stmt->execute($assetTags);
            $count = $stmt->rowCount();
        }

        $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_name, user_role, action_type, details) VALUES (?, ?, ?, ?)");
        $logStmt->execute([
            $userName,
            $userRole,
            'permanent_delete_devices',
            "تم الحذف النهائي لعدد {$count} جهاز كمبيوتر بشكل كامل من قاعدة البيانات"
        ]);

        $pdo->commit();

        echo json_encode([
            "status" => "success", 
            "message" => "تم الحذف النهائي لـ {$count} جهاز من قاعدة البيانات MySQL!",
            "count" => $count
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 6. إضافة سجل عمليات إلى جدول audit_logs في MySQL
if ($action === 'add_audit_log' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    try {
        $stmt = $pdo->prepare("INSERT INTO audit_logs (user_name, user_role, action_type, details, asset_tag) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['userName'] ?? 'مستخدم النظام',
            $input['userRole'] ?? 'viewer',
            $input['actionType'] ?? 'general',
            $input['details'] ?? 'عملية غير محددة',
            $input['assetTag'] ?? null
        ]);

        echo json_encode(["status" => "success", "message" => "تم حفظ السجل (Log) بنجاح في MySQL"], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 7. جلب كافة سجلات Audit Logs من MySQL
if ($action === 'get_audit_logs') {
    try {
        $stmt = $pdo->query("SELECT * FROM audit_logs ORDER BY id DESC");
        $logs = $stmt->fetchAll();
        echo json_encode(["status" => "success", "data" => $logs], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}
?>
