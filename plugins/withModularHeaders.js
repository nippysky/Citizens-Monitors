/**
 * plugins/withModularHeaders.js
 *
 * Adds `use_modular_headers!` to the generated Podfile so that Firebase's
 * AppCheckCore can import GoogleUtilities and RecaptchaInterop when they are
 * built as static libraries.  Without this, `pod install` fails with:
 *   "The Swift pod `AppCheckCore` depends upon `GoogleUtilities` and
 *    `RecaptchaInterop`, which do not define modules."
 */
const { withPodfile } = require("@expo/config-plugins");

/** @type {import('@expo/config-plugins').ConfigPlugin} */
module.exports = function withModularHeaders(config) {
  return withPodfile(config, (cfg) => {
    const contents = cfg.modResults.contents;
    if (!contents.includes("use_modular_headers!")) {
      cfg.modResults.contents = contents.replace(
        "prepare_react_native_project!",
        "prepare_react_native_project!\n\n# Required for Firebase / AppCheckCore with static libraries.\nuse_modular_headers!"
      );
    }
    return cfg;
  });
};
