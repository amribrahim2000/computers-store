import { ComputerAsset } from '../types';

export type WarrantyStatus = 'expired' | 'expiring_30' | 'expiring_60' | 'expiring_90' | 'valid' | 'unknown';

export interface WarrantyNotification {
  id: string;
  asset: ComputerAsset;
  status: WarrantyStatus;
  daysLeft: number;
  urgency: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expiryDateFormatted: string;
}

export function getWarrantyInfo(expiryDateStr?: string): { status: WarrantyStatus; daysLeft: number; formattedDate: string } {
  if (!expiryDateStr || !expiryDateStr.trim()) {
    return { status: 'unknown', daysLeft: 0, formattedDate: 'غير محدد' };
  }

  const expiryDate = new Date(expiryDateStr);
  if (isNaN(expiryDate.getTime())) {
    return { status: 'unknown', daysLeft: 0, formattedDate: 'تاريخ غير صالح' };
  }

  const today = new Date();
  // Reset hours to start of day for accurate day calculation
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: WarrantyStatus = 'valid';
  if (daysLeft < 0) {
    status = 'expired';
  } else if (daysLeft <= 30) {
    status = 'expiring_30';
  } else if (daysLeft <= 60) {
    status = 'expiring_60';
  } else if (daysLeft <= 90) {
    status = 'expiring_90';
  } else {
    status = 'valid';
  }

  const formattedDate = exp.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return { status, daysLeft, formattedDate };
}

export function getWarrantyNotifications(assets: ComputerAsset[], daysThreshold: number = 90): WarrantyNotification[] {
  const notifications: WarrantyNotification[] = [];

  assets.forEach(asset => {
    if (!asset.warrantyExpiry) return;

    const { status, daysLeft, formattedDate } = getWarrantyInfo(asset.warrantyExpiry);

    if (status === 'unknown') return;

    // We include expired items + items expiring within the threshold (e.g. 90 days)
    if (status === 'expired' || daysLeft <= daysThreshold) {
      let urgency: 'high' | 'medium' | 'low' = 'low';
      let title = '';
      let description = '';

      if (status === 'expired') {
        urgency = 'high';
        const pastDays = Math.abs(daysLeft);
        title = `ضمان منتهي (${asset.assetTag})`;
        description = pastDays === 0 
          ? `انتهى ضمان الجهاز اليوم (${formattedDate}).`
          : `انتهى ضمان الجهاز منذ ${pastDays} يوم (${formattedDate}).`;
      } else if (status === 'expiring_30') {
        urgency = 'high';
        description = daysLeft === 0 
          ? `ينتهي ضمان الجهاز اليوم!`
          : `ينتهي الضمان خلال ${daysLeft} يوم فقط (${formattedDate}).`;
        title = `اقتراب شديد لانتهاء الضمان (${asset.assetTag})`;
      } else if (status === 'expiring_60') {
        urgency = 'medium';
        title = `اقتراب موعد انتهاء الضمان (${asset.assetTag})`;
        description = `ينتهي الضمان خلال ${daysLeft} يوم (${formattedDate}).`;
      } else {
        urgency = 'low';
        title = `ملاحظة ضمان (${asset.assetTag})`;
        description = `ينتهي الضمان خلال ${daysLeft} يوم (${formattedDate}).`;
      }

      notifications.push({
        id: `notif-${asset.id}`,
        asset,
        status,
        daysLeft,
        urgency,
        title,
        description,
        expiryDateFormatted: formattedDate
      });
    }
  });

  // Sort by urgency (expired & smallest daysLeft first)
  return notifications.sort((a, b) => a.daysLeft - b.daysLeft);
}
