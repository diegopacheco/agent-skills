# Node.js and Bun, JavaScript and TypeScript

## Detected
* LaunchDarkly `variation` and `useLDFlag`, Optimizely `decide`, GrowthBook `isOn`, `useFeatureIsOn`, `getFeatureValue`, ConfigCat `getValueAsync`, Statsig `checkGate` and `useGate`, PostHog `isFeatureEnabled` and `useFeatureFlagEnabled`, Eppo `getBooleanAssignment`, DevCycle `variableValue`, Unleash `isEnabled` and `useFlag`, OpenFeature `getBooleanValue` and `useBooleanFlagValue`, Split `getTreatment`, Flagsmith `hasFeature`, Harness, Firebase Remote Config `getBoolean`.
* The provider comes from the import in the same file. A call with no SDK import counts only when its receiver is named like `flags`, `features` or `toggles`.
* `process.env.FEATURE_X`, `Bun.env.FEATURE_X`, `import.meta.env.VITE_FEATURE_X`, `NEXT_PUBLIC_FEATURE_X`, `REACT_APP_FEATURE_X`.
* `flags.json`, `features.json` and `*.env` declarations, `flags.darkMode` and `flags["dark-mode"]` property reads.
* Template literals `\`region-${r}\`` become dynamic reads.

## Check by hand
* LaunchDarkly React `useFlags()` returns camelCased keys read by destructuring (`const { newNav } = useFlags()`). Search for `useFlags` and add review entries.
* Flags passed through React context or props under another name.

## Log first
```ts
export function featureFlags(values: Readonly<Record<string, boolean>>, log: Logger): FeatureFlags {
  return {
    isEnabled(name: string): boolean {
      const value = values[name] ?? false;
      log.info("flag_evaluated", { flag: name, value });
      return value;
    },
  };
}
```
In the browser, send these lines to the backend or the analytics pipeline so the catalog can read them.
