# AI Ideas Queue

Potential features using the free Gemini Flash key. Nothing here is committed to; this is a backlog.
Ground rules: a human decides anything involving money, roles, bans, or disputes; treat user text as
untrusted input; keep per-user cooldowns for the free-tier quota; don't send private DMs to the model.

## Up next
- [ ] **Social post drafts**: turn a new event, archive addition, or milestone into a draft X post for a mod to approve before posting.

## Collecting and trading
- [ ] Item research / keyword helper (`!research`, or cleaner queries for `!search`)
- [ ] Photo identification of items (year, set, variant), presented as a hint only
- [ ] Listing helper: rough notes into a clean eBay/Mercari title and description
- [ ] Want-list alerts: ping members when a sales post matches their wishlist
- [ ] Collection insights: what a member is missing in a set and who has it (ring/Vision sheets)
- [ ] Trade match explainers and friendly opening DMs for `!ringmatch` / `!visionmatch`
- [ ] Natural-language ring/Vision commands (model extracts fields, existing validation decides)
- [ ] Condition/grading guide and authenticity checklist per item
- [ ] "Is this a fair trade?" explainer from member-provided prices
- [ ] Community comps log: members submit real sold prices, AI summarizes ranges and outliers

## Moderation and community
- [ ] Scam/spam screening that flags for mods instead of auto-banning
- [ ] Vouch-ring detection (SQL first, AI explains clusters)
- [ ] Replace image CAPTCHA with a rules question or intro check
- [ ] FAQ/rules bot answering from pinned messages, escalating to mods when unsure
- [ ] Dispute thread summaries (neutral timeline for mods)
- [ ] Mod assistant: summary of a user's vouches and history
- [ ] Translation for international trades and proxies
- [ ] Tone check / rewrite before posting
- [ ] "This was asked before" duplicate question detection
- [ ] Smart reminders ("remind me about the pickup next Thursday")

## Proxy and events
- [ ] Proxy sheet digest: what's open this week
- [ ] Event Q&A over the proxy sheet
- [ ] Auto-create Discord scheduled events from new sheet rows
- [ ] Event announcements and recaps for mod approval

## Site
- [ ] "What is this?" item lookup page
- [ ] Semantic site search with embeddings
- [ ] Proxy request form helper (human reviews before it hits the sheet)
- [ ] Auto-drafted event pages
- [ ] Archive (Linkwarden) summaries and tags
- [ ] Weekly newsletter / activity digest
- [ ] Image alt text and plain-language rule summaries

## Content and growth
- [ ] Member spotlight and collection showcase captions
- [ ] Monthly trend report: what items and keywords are heating up
- [ ] Feedback/suggestion clustering into themes
- [ ] Giveaway helper: draft rules and announcements, with a plain random pick (no AI choosing winners)

## Dev-side
- [ ] Weekly log summarizer for `discordbotlogs.txt`
- [ ] Command usage and failure insights
- [ ] Edge-case test generator for the ring/Vision parsers
