# Spec: Persistence — Save, Load, Share

## POV
You'll spend hours making beats — they must survive a page close. Local-first for daily use (fast, offline, private), plus export/import for backup and sharing. No backend for MVP.

---

## 1. Local Storage — IndexedDB
- **What's saved:** patterns, songs, sample assignments, parameter settings, signal chain state.
- **Why IndexedDB:** structured data, large (AudioBuffers), survives reload, works offline.
- **Library:** localForage or idb-keyval for a clean async API.
- **Load on launch:** restore last session state instantly.

## 2. Export / Import — Shareable Beats
- **Export:** serialize pattern + song + settings to JSON, optionally bit-packed + base64url (like drumhaus's preset sharing).
- **Import:** load a shared file/code back in.
- **Why:** backup your beats, share them, transfer between devices. No server needed.

## 3. What This Replaces
The existing scaffold has no persistence — state is lost on reload. This spec adds the full save/load layer. The Pinia store gets persisted to IndexedDB; the export/import adds the shareable-code path.
