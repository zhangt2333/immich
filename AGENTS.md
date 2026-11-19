# AGENTS.md

Immich monorepo: `server/` (NestJS API + job workers), `web/` (SvelteKit SPA), `mobile/` (Flutter), `native/` (Rust core for mobile), `machine-learning/` (FastAPI + ONNX), `e2e/` (API + Playwright tests), `packages/` (`@immich/sdk`, `@immich/cli`, plugin SDK/core, release scripts), `open-api/`, `i18n/`, `docs/`. Before changing code in `server/`, `web/`, `mobile/`, `native/`, `machine-learning/` or `e2e/`, read that folder's `AGENTS.md`.

## Fork Maintenance and Upstream Synchronization

This repository is a customized Immich fork that regularly replays its custom commits on the upstream `main` branch. `origin` points to `immich-app/immich`. The local `main` carries the fork commits on top of `origin/main`.

### Commit and code boundaries

- Keep upstream commits intact and maintain a separate commit for each custom capability. Keep fork guidance and deployment workflows in their own commits. Use concise English Conventional Commit subjects.
- Keep changes local to the affected path. Prefer a small branch or early return and reuse upstream queries, permission checks, and fallback behavior. Add a specialized method when it meaningfully isolates the custom behavior. Avoid parallel `ForXXX` methods at every layer.
- Keep existing custom block markers scoped to the corresponding fork changes. Follow the upstream rule on code comments for new code.
- Keep unrelated fixes and bulk formatting out of custom commits. Keep upstream tests intact. Add custom tests only when requested or required by applicable repository instructions.
- Use interactive rebase to edit an existing custom commit. Stage explicit paths and use `git commit --amend --no-edit` when retaining its message. Keep the original author.

### Synchronization workflow

1. Check `git status --short`, the active branch, and the upstream URL. Preserve local edits. Record the old head and `git merge-base HEAD origin/main` before fetching, and create a local recovery branch at the old head. Use `git log --reverse <old-base>..<old-head>` and the commit diffs to inventory the actual fork changes.
2. Run `git fetch origin main`, record the new `origin/main` hash, and confirm the upstream still contains the old base. Rebase the local `main` with `git rebase --onto <new-base> <old-base>`. Investigate unexpected history changes before replaying commits.
3. For conflicts, read the original patch and the new upstream code. Reapply the behavior at the current entry point and keep each adaptation in the corresponding custom commit. If both sides change `AGENTS.md`, keep this fork section first and incorporate the updated upstream guidance below it.
4. Review each replayed commit against its parent, including patches that applied cleanly. Follow the active call paths and check permissions, defaults, error handling, and fallbacks. Drop a patch only after verifying equivalent behavior upstream or confirming the capability is no longer needed. Record the reason and evidence.
5. Use `git range-diff <old-base>..<old-head> <new-base>..HEAD` to account for every original commit. Investigate dropped or unmatched entries and check that later commits preserve earlier custom behavior. Check `git status --short`, commit order, changed paths, and `git diff --check <new-base>..HEAD`.
6. For routine syncs, run the relevant static checks through `mise`, including TypeScript, targeted ESLint and Prettier, and applicable code generation. Follow the user's test instructions. Report which checks ran, what was skipped, and any remaining failures or verification gaps.
7. Report the new upstream base, the resulting commit for each capability, and any adaptations or removals. Keep the recovery branch until the result is verified. Push only when requested and verify the fork remote using local Git configuration. A force push requires explicit authorization and should use `--force-with-lease`.

### Fork behavior to verify

- Tag searches include matching assets from albums visible to the caller in both legacy and V3 metadata search. Preserve the fork's tag listing behavior, locked-asset restrictions, and search scope in branches without a positive tag filter.
- Android requests can download existing transcoded videos. Preserve download permissions, cache separation by User-Agent, and the normal download result when an edited file was selected or the transcode is unavailable.
- The fork builds and publishes its server image through `.github/workflows/custom-docker.yml`. Review new and renamed upstream workflows for dependencies on upstream credentials or on workflows that the fork has disabled.

### Reusable sync prompt

> Sync this Immich fork's local `main` with the latest `origin/main`. Follow the Fork Maintenance and Upstream Synchronization section of `AGENTS.md`. Back up and inventory the full fork commit series, then replay it in order. Review each change against the current upstream entry points, even when Git reports no conflict. Preserve each customization's behavior, permissions, and fallbacks, and keep adaptations in the corresponding commit. Account for every old commit with `git range-diff`. Run the relevant static checks and code generation through `mise`. Skip test suites for this sync. Report the new base, the resulting commit for each capability, the changes you made, and the checks you ran. Leave the result local for review.

## Rules

- No PRs of LLM-generated code; the human contributor must understand and be able to explain every change (see `CONTRIBUTING.md`).
- Do not generate PR titles, descriptions, issue text, review comments or discussion answers. Translating human-written text is fine.
- Never work on issues labelled `good first issue`; those PRs are closed automatically.
- Run every build, lint, test and codegen task through mise: `mise //<dir>:<task>`, root tasks as `mise //:<task>`. `mise tasks ls --all` lists them.
- Never hand-edit generated files: `open-api/immich-openapi-specs.json`, `packages/sdk/src/fetch-client.ts`, `mobile/generated/openapi/`, `server/src/queries/*.sql`, and Dart codegen (`*.g.dart`, `*.drift.dart`, `*.freezed.dart`, `router.gr.dart`, `lib/generated/`, `lib/platform/*.g.dart`).
- Only edit `i18n/en.json`; the other locale files come from Weblate.
- Do not add code comments. Make the code self-explanatory through naming and structure instead.
- PR titles are conventional commits. Keep a PR to one focused change.
- Sharing/asset ownership and external libraries are feature-frozen: bug fixes only.
- Renaming or removing a docs page requires an entry in `docs/static/_redirects`.

## Skills

- **Regenerate the API clients**: after any change to a server controller or DTO, run `mise //:open-api`. It rebuilds the server, rewrites the OpenAPI spec, regenerates the TypeScript SDK and the Dart client. The CI job "OpenAPI Clients" fails if this is stale. If a response field became required, the Dart client also needs a backward-compatibility patch in `open-api/patch`, checked by `flutter test test/openapi_patches_coverage.dart` (job "check-mobile-patches").
- **Add a translation string**: add the key to `i18n/en.json`, then run `mise //:i18n:format-fix` so the file stays key-sorted (CI job "Test i18n" fails otherwise). For the mobile app also run `mise //mobile:translation`. Web keys are typed against `en.json`, so the key must exist before `tsc` passes.
