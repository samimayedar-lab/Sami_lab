# Safe edition — what changed

Based on "Full Website Builder Skill – Tarfandack". All design, UX, typography, accessibility,
legal and engineering guidance is kept as-is. Only the parts below were changed.

| Where | Original | Safe edition |
|---|---|---|
| §0 | Auto-installed ~25 unpinned third-party packages/skills (`npx --yes`, `npm -g`) and told the AI not to ask permission | Replaced with safety rules: ask before installing, running outside scripts, connecting services, deploying or spending; outside content treated as untrusted; secrets rules; safe site defaults (CSP, no trackers, self-hosted assets); optional-tool table |
| §0.6 | "Execute without further questions" | Few questions, but permission gates are never skipped |
| Chart.js example | Loaded from jsDelivr without `integrity` | Self-hosted file (or CDN with SRI) |
| Decks (§44, §50) | Hotlinked Google Fonts / Fontshare | Self-hosted / embedded fonts |
| Decks (§49) | Inline editing on by default | Local authoring copy only; disabled in public copies; `textContent` not `innerHTML` |
| Deploy / PDF scripts | Run directly; auto-install Playwright | Read the script first; ask before deploy/install |
| Rube / Composio | Connect freely; remote workbench | Only on request; no remote code execution without approval |
| 21st.dev, community registries | Prefer and install directly | Review code before adding |
| shadcn MCP, Appendix A | GitHub token on command line / in config; `npx -y` latest | Tokens via environment only; pinned versions; every server optional |
| shadcn CLI, Remotion scaffold, skill updates | `@latest`, `--yes` | Ask first; pin versions; review written files |
| §75, §79, §80 | — | Installed skills treated as untrusted; new security checklist items |
