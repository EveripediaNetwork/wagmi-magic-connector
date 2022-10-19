---
'@everipedia/wagmi-magic-connector': patch
---

- `magic.user.disconnect()` is no available for Magic Connect, relying on local storage instead
- Require email input for `connect()` flow to continue once modal is open. Otherwise the Magic Connect
modals appears even if the user quits the process manually.
