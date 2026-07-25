import { ComputerAsset, AuditLogEntry } from '../types';

// القيمة الافتراضية لرابط API المحلي أو المضيف
const DEFAULT_API_URL = '/php_backend/api.php';

export const getMysqlApiUrl = (): string => {
  return localStorage.getItem('hospital_mysql_api_url') || DEFAULT_API_URL;
};

export const setMysqlApiUrl = (url: string): void => {
  localStorage.setItem('hospital_mysql_api_url', url);
};

/**
 * مزامنة وحفظ دفعة الأجهزة المستوردة من شيت الإكسيل مباشرة في MySQL
 */
export async function syncBatchAssetsToMysql(
  assets: ComputerAsset[],
  replaceExisting: boolean,
  user?: { name: string; role: string }
): Promise<{ success: boolean; message: string }> {
  const apiUrl = getMysqlApiUrl();

  try {
    const response = await fetch(`${apiUrl}?action=batch_import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assets,
        replaceExisting,
        userName: user?.name || 'مستخدم IT',
        userRole: user?.role || 'admin'
      })
    });

    if (!response.ok) {
      throw new Error(`خطأ خادم HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return { success: true, message: data.message || 'تمت المزامنة والحفظ بنجاح في MySQL' };
    } else {
      return { success: false, message: data.message || 'فشلت المزامنة في MySQL' };
    }
  } catch (error: any) {
    console.warn('تنبيه: تعذر الاتصال بـ MySQL المحلي مباشرة (سيتم الاعتماد على المزامنة المحلية):', error.message);
    return {
      success: false,
      message: `تم الحفظ محلياً في الذاكرة. للربط المباشر مع MySQL يرجى إعداد الخادم المحلي. (${error.message})`
    };
  }
}

/**
 * إرسال وحفظ سجل عمليات (Audit Log) في جدول audit_logs بـ MySQL
 */
export async function sendAuditLogToMysql(
  logEntry: AuditLogEntry
): Promise<{ success: boolean; message: string }> {
  const apiUrl = getMysqlApiUrl();

  try {
    const response = await fetch(`${apiUrl}?action=add_audit_log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: logEntry.userName,
        userRole: logEntry.userRole,
        actionType: logEntry.actionType,
        details: logEntry.details,
        assetTag: logEntry.assetTag || null
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.status === 'success',
      message: data.message || 'تم حفظ السجل في MySQL'
    };
  } catch (error: any) {
    console.warn('تنبيه: تعذر إرسال الـ Log إلى MySQL:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * مزامنة جهاز واحد إلى MySQL
 */
export async function syncSingleAssetToMysql(
  asset: ComputerAsset
): Promise<{ success: boolean; message: string }> {
  const apiUrl = getMysqlApiUrl();

  try {
    const response = await fetch(`${apiUrl}?action=add_asset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(asset)
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.status === 'success',
      message: data.message || 'تم الحفظ في MySQL'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * إرسال إشارة حذف مؤقت مجمع (Soft Delete) إلى MySQL
 */
export async function batchSoftDeleteMysql(
  assetTags: string[],
  user?: { name: string; role: string }
): Promise<{ success: boolean; message: string }> {
  const apiUrl = getMysqlApiUrl();

  try {
    const response = await fetch(`${apiUrl}?action=batch_soft_delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetTags,
        userName: user?.name || 'مستخدم IT',
        userRole: user?.role || 'admin'
      })
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    return {
      success: data.status === 'success',
      message: data.message || 'تم الحذف المؤقت في MySQL'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * استعادة دفعة أجهزة من سلة المهملات في MySQL
 */
export async function batchRestoreMysql(
  assetTags: string[],
  user?: { name: string; role: string }
): Promise<{ success: boolean; message: string }> {
  const apiUrl = getMysqlApiUrl();

  try {
    const response = await fetch(`${apiUrl}?action=batch_restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetTags,
        userName: user?.name || 'مستخدم IT',
        userRole: user?.role || 'admin'
      })
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    return {
      success: data.status === 'success',
      message: data.message || 'تمت الاستعادة بنجاح في MySQL'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * الحذف النهائي من سلة المهملات في MySQL
 */
export async function batchPermanentDeleteMysql(
  assetTags: string[],
  user?: { name: string; role: string }
): Promise<{ success: boolean; message: string }> {
  const apiUrl = getMysqlApiUrl();

  try {
    const response = await fetch(`${apiUrl}?action=batch_permanent_delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetTags,
        userName: user?.name || 'مستخدم IT',
        userRole: user?.role || 'admin'
      })
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    return {
      success: data.status === 'success',
      message: data.message || 'تم الحذف النهائي بنجاح'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
