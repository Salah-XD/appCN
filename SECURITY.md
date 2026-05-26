# Security policy

appCN ships UI components — the blast radius of a vulnerability here is small
compared to a backend library, but we still want to know about anything that
could break a consumer's app or expose them to risk.

## Supported versions

While in `0.x`, only the latest minor receives fixes. Once `1.0.0` lands,
we'll cut a `1.x` LTS line and update this table.

| Version | Supported |
| ------- | --------- |
| `0.1.x` | ✅        |
| `< 0.1` | ❌        |

## Reporting a vulnerability

Please **do not** open a public GitHub issue. Email:

**thisissalah.dev@gmail.com**

Include: affected component(s), reproduction steps, and what an attacker could
do with the issue. A minimal repro repo or Expo Snack helps a lot.

You'll receive an acknowledgement within **72 hours**. We aim to ship a fix
or a workable mitigation within **90 days** of report; severe issues get
priority. Once a fix ships, we credit reporters in the CHANGELOG unless you
prefer to stay anonymous.

## Out of scope

- Bugs in `react-native`, `expo`, `nativewind`, `reanimated`, or other
  upstream packages — please report those upstream.
- Issues that require physical access to an unlocked device.
- Issues in example apps or showcase code that aren't shipped in the registry
  or on npm.
