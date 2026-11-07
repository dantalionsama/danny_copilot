# Danny Copilot

An out-of-character (OOC) assistant for [Lumiverse](https://docs.lumiverse.chat/). Brainstorm plot, dig into characters, check your lore, tidy up your lorebooks, or just talk shop without touching your roleplay chat. Inspired by [ST-Copilot](https://github.com/Supker/ST-Copilot) for SillyTavern.

## Features

**Chatting**
- Sidebar tab (plus a fullscreen mode) that follows your theme: colors, fonts, light/dark
- Streaming replies with markdown, plus copy, edit, delete, regenerate and continue on any message
- **Voices:** Default, Danny, Blair and Woinker, each editable. A voice only changes how the assistant talks, never what it writes into your lorebooks or chat
- **Sessions:** several saved conversations per chat, auto-named from your first message
- **General mode:** use it with no chat open
- Pick which connection (model) Copilot uses, separate from your chat

**Context you control**
- Recent chat messages (slider), or hand-pick exact messages and ranges
- Character card and persona toggles
- Triggered lorebook entries with a token budget, plus per-entry exclude and pin
- **Attachments:** text files and images, kept per session and switchable on or off
- **Context viewer:** see exactly what gets sent, with rough token counts per section
- Editable system prompt and reply length (Auto / Short / Medium / Long)

**Changes you approve**
- **Lorebook proposals:** ask for a new or updated entry and approve it from a card. Pick the target lorebook (the one attached to the character, or any of yours), with undo
- **Chat edits:** ask for a fix to a numbered chat message and review a word-level diff before applying. Undo refuses to overwrite anything you've edited since

Nothing in your chats or lorebooks is changed without your tap on **Approve**.

## Install

1. In Lumiverse, open the **Extensions** panel.
2. Install from GitHub: `https://github.com/dantalionsama/danny_copilot`
3. Approve the permissions below and enable the extension.

A **Copilot** tab appears in the sidebar.

## Permissions

| Permission | Used for |
|---|---|
| `generation` | Generating replies and reading which lorebook entries are triggered |
| `chats`, `chat_mutation` | Reading the active chat, and applying chat edits you approve |
| `characters` | Reading the character card and its attached lorebooks |
| `personas` | Reading your active persona |
| `world_books` | Creating or updating lorebook entries you approve |

Your Copilot history, settings and attachments are stored per user by Lumiverse. Chat context and attachments only go to the connection you choose.

## Notes

- Token counts are rough estimates (characters ÷ 4; images are estimated from their size), not a real tokenizer.
- Images need a vision-capable model. They are resized before being stored.
- The lorebook uses Lumiverse's own activation rules, so it matches what a normal generation would trigger.
- Lorebook and chat-edit proposals can be switched off in the settings (⚙).

## Credits

Built by Risa for Lumiverse. Concept and layout inspired by [ST-Copilot](https://github.com/Supker/ST-Copilot) by Supker. No code was copied.