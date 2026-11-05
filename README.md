# Danny Copilot

An out-of-character (OOC) assistant for [Lumiverse](https://docs.lumiverse.chat/). Brainstorm plot, analyze characters, check lore, or ask anything without touching your roleplay chat. Inspired by [ST-Copilot](https://github.com/Supker/ST-Copilot) for SillyTavern.

## Features

- **Sidebar tab** that follows your theme (colors, fonts, light/dark)
- **Chat context:** recent messages (slider), character card, persona, and triggered lorebook entries with a token budget
- **General mode:** use it without any chat open
- **Saved history** per chat
- **Message tools:** regenerate, copy, edit, delete
- **Markdown** rendering with streaming replies
- **Context viewer:** see exactly what gets sent, with rough token counts per section
- **Own connection:** pick which model Copilot uses, separate from your chat
- **Editable system prompt**

## Install

1. In Lumiverse, open the **Extensions** panel.
2. Install from GitHub: `https://github.com/dantalionsama/danny_copilot`
3. Approve the permissions and enable the extension.

A **Copilot** tab appears in the sidebar.

## Usage

- **This chat / General:** with "This chat", Copilot sees your current chat. "General" sends no chat context.
- **CTX:** how many recent chat messages Copilot can see.
- **Connection:** the model used for Copilot replies.
- **⚙ Settings:** toggle the character card, persona, and lorebook, set the lorebook token budget, and edit the system prompt.
- **Context button:** preview everything that will be sent with your next message.

## Permissions

| Permission | Used for |
|---|---|
| `generation` | Generating replies and reading triggered lorebook entries |
| `chats`, `chat_mutation` | Reading the active chat and its messages |
| `characters` | Reading the character card |
| `personas` | Reading your active persona |

Copilot never edits your chats, characters, or lorebooks. Your Copilot history and settings are stored per user by Lumiverse, and chat context only goes to the connection you choose.

## Notes

- Token counts are rough estimates (characters ÷ 4), not the model's real tokenizer.
- The lorebook uses Lumiverse's own activation rules, so it matches what a normal generation would trigger.

## Credits

Built by dantalionsama for Lumiverse. Concept and layout inspired by [ST-Copilot](https://github.com/Supker/ST-Copilot) by Supker. No code was copied.
