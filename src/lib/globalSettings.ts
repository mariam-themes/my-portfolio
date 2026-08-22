import connectToDatabase from '@/lib/mongodb';
import GlobalSettings, {
  DEFAULT_GLOBAL_SETTINGS,
  type IGlobalSettings,
} from '@/models/GlobalSettings';

/**
 * Returns the single GlobalSettings document, creating it with sensible
 * defaults on first access so the public site never renders empty.
 */
export async function getGlobalSettings(): Promise<IGlobalSettings | null> {
  try {
    await connectToDatabase();
    let doc = await GlobalSettings.findOne().lean();
    if (!doc) {
      const created = await GlobalSettings.create(DEFAULT_GLOBAL_SETTINGS);
      doc = created.toObject();
    }
    // Merge with defaults so newly-added fields (e.g. whatsapp) exist even on
    // documents created before the field was introduced.
    return { ...DEFAULT_GLOBAL_SETTINGS, ...doc } as unknown as IGlobalSettings;
  } catch (error) {
    console.error('getGlobalSettings failed:', error);
    return null;
  }
}
