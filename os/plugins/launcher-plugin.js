const { withAndroidManifest } = require('expo/config-plugins');

/** Expo config plugin that adds HOME + DEFAULT intent categories to make the app a launcher */
module.exports = function launcherPlugin(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const mainActivity = manifest.manifest.application?.[0]?.activity?.find(
      (a) => a.$?.['android:name'] === '.MainActivity',
    );

    if (!mainActivity) return config;

    // Find the existing intent-filter with MAIN/LAUNCHER or create one
    let intentFilter = mainActivity['intent-filter']?.find((f) =>
      f.category?.some((c) => c.$?.['android:name'] === 'android.intent.category.LAUNCHER'),
    );

    if (!intentFilter) {
      if (!mainActivity['intent-filter']) mainActivity['intent-filter'] = [];
      intentFilter = {
        action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
        category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
      };
      mainActivity['intent-filter'].push(intentFilter);
    }

    // Add HOME and DEFAULT categories if not present
    const categories = intentFilter.category || [];
    const hasHome = categories.some((c) => c.$?.['android:name'] === 'android.intent.category.HOME');
    const hasDefault = categories.some((c) => c.$?.['android:name'] === 'android.intent.category.DEFAULT');

    if (!hasHome) {
      categories.push({ $: { 'android:name': 'android.intent.category.HOME' } });
    }
    if (!hasDefault) {
      categories.push({ $: { 'android:name': 'android.intent.category.DEFAULT' } });
    }

    intentFilter.category = categories;

    return config;
  });
};
