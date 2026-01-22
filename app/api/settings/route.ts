import { NextRequest, NextResponse } from 'next/server';
import { Setting } from '@/db/models';
import { withAuth, requirePermission } from '@/utils/auth';
import type { AuthUser } from '@/types/auth';

/**
 * GET /api/settings
 * Get all settings (public for general settings, requires system_settings for admin settings)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const key = searchParams.get('key');

    const where: Record<string, unknown> = {};
    
    if (storeId) {
      where.storeId = parseInt(storeId, 10);
    } else {
      where.storeId = { [Op.is]: null }; // Use Op.is for NULL comparison
    }

    if (key) {
      where.key = key;
    }

    const settings = await Setting.findAll({ where });

    // Convert to key-value object
    const settingsObject: Record<string, string> = {};
    settings.forEach(s => {
      settingsObject[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsObject });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: '取得設定時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update settings (requires system_settings permission)
 */
export const PUT = withAuth(
  async (request: NextRequest, { user }: { user: AuthUser }) => {
    // Check permission for system settings
    const permError = requirePermission(user, 'system_settings');
    if (permError) return permError;

    try {
      const body = await request.json();
      const { settings, storeId } = body;

      if (!settings || typeof settings !== 'object') {
        return NextResponse.json(
          { error: '設定必須是一個物件' },
          { status: 400 }
        );
      }

      const targetStoreId = storeId ?? null;

      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        console.log(`Attempting to save setting: ${key} = ${value}, storeId = ${targetStoreId}`);
        
        const [setting, created] = await Setting.findOrCreate({
          where: { key, storeId: targetStoreId },
          defaults: { key, value: String(value), storeId: targetStoreId },
        });

        console.log(`Setting ${key}: ${created ? 'created' : 'found'}, id=${setting.id}`);

        if (!created) {
          await setting.update({ value: String(value) });
          console.log(`Updated setting ${key} to ${value}`);
        }
      }

      // Verify saved data
      const savedSettings = await Setting.findAll({
        where: { storeId: targetStoreId }
      });
      console.log(`Total settings in DB for storeId=${targetStoreId}:`, savedSettings.length);

      return NextResponse.json({ message: '設定已更新' });
    } catch (error) {
      console.error('Update settings error:', error);
      return NextResponse.json(
        { error: '更新設定時發生錯誤' },
        { status: 500 }
      );
    }
  }
);
