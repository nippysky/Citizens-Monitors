// ─── babel.config.js ─────────────────────────────────────────────────────────
// Strips diagnostic logging from production bundles at BUILD time.
//
// Why build-time rather than reassigning console.* at runtime:
//   • The calls (and their argument expressions) are removed entirely, so
//     nothing is serialised or evaluated — a runtime no-op still pays the cost
//     of building every argument, e.g. console.log(JSON.stringify(bigPayload)).
//   • Nothing can leak before the guard runs, and no module can undo it.
//   • Internal state, payload shapes and tokens never reach a release log.
//
// `console.warn` and `console.error` are deliberately KEPT so real problems
// still reach crash/diagnostic tooling.
//
// NOTE: babel config changes require a fresh native build (or at minimum a
// cleared Metro cache) — they are not picked up by an OTA update.

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {
        plugins: [
          ["transform-remove-console", { exclude: ["error", "warn"] }],
        ],
      },
    },
  };
};
