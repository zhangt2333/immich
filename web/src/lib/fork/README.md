# Fork: quick actions

User-defined sequences of album and tag steps that run on the current asset, plus two selection flows (remove from album, restore into album). Everything lives in this directory; upstream files only receive anchors.

## Entry points

1. A floating button at the bottom-end corner opens the panel: combo list, selection flows, and a link to the management page. Rendered from `Root.svelte`, so it needs no upstream UI.
2. The asset viewer overflow menu shows the same combos for the photo on screen.
3. Sidebar entry -> `/fork/combos` (list, create, edit, reorder, delete).
4. A global hotkey, and a command-palette provider.

## Identity rules

Fork UI must never be confused with stock Immich UI:

- Accent colour is amber (`amber-400` family); Immich's own accent stays blue. Never restyle native components.
- Icon is `mdiStarFourPoints` (`★`), never the word "Fork" in any user-visible string.
- Chip text is `fork_mark` ("Custom" / "专属"), uppercase micro-label.
- Menu items carry a left amber bar (`ForkMenuOption`), dialogs carry a left amber border plus the chip (`ForkDialog`), and every fork node has a `data-fork="..."` attribute so `[data-fork]` lists them all.

## Anchors

Each anchor carries a `// fork` or `<!-- fork -->` marker and may only render a component from this directory.

| File | Edit |
| --- | --- |
| `web/src/hooks.client.ts` | `init` hook that calls `boot()` |
| `web/src/lib/route.ts` | `forkCombos` entry in the `Route` object |
| `web/src/lib/components/asset-viewer/AssetViewerNavBar.svelte` | imports + `<ComboViewport />` (records the displayed asset) and `<ComboMenuItems />` in the overflow menu |
| `web/src/lib/components/shared-components/side-bar/UserSidebar.svelte` | `mdiStarFourPoints` import + one `NavbarItem` |

## Sync checklist

1. `git grep -cE "// fork|<!-- fork -->" -- web/src ':!web/src/lib/fork'` lists exactly the four anchor files.
2. `mise //web:check`, `mise //web:lint`, `mise //web:test`.
3. Manually verify: the floating button appears and is visible on every authenticated page; the overflow menu shows the amber group; running a combo refreshes "Appears in" and drops the asset from the album timeline; the selection flows respect album edit rights.

## Runtime pieces

- `boot.ts` appends `#fork-root` to `document.body` and mounts `Root.svelte`, mirroring how `@immich/ui` mounts modals and toasts.
- `Root.svelte` renders the floating button and panel, installs the hotkey listener, and registers the palette provider.
- `ComboViewport.svelte` records the asset the viewer currently shows, so hotkeys target the photo on screen even while browsing a stack.
- `context.ts` owns eligibility: no shared links, no locked or trashed assets, tag steps only when the tag preference is on. Execution re-checks.
- `flows.ts` owns the selection flows; the panel opens `ForkAlbumPicker` (albums the user can edit) and then calls into it, so no `.ts` module imports a `.svelte` component.
- Combos persist in `localStorage` under `fork.combos`; writes are checked before state is published.
- Hotkeys require Ctrl or Alt and reject the combinations Immich already owns.

## Translations

`fork_*` keys live in `i18n/en.json` and `i18n/zh_Hans.json`. Upstream asks for `en.json` only, because Weblate owns the rest; this fork edits `zh_Hans.json` deliberately. On every upstream sync both files need the `fork_*` block re-applied - the keys are contiguous thanks to the key-sorted formatter, so it is a single hunk per file.
