// SP-1200 Persistence — IndexedDB + Export/Import
// Saves patterns, songs, settings, samples. Local-first, no backend.
//
// SINGLETON: one set of localforage instances shared across all composables.

import localforage from 'localforage'
import type { Pattern, Song, SampleData, PadId } from '~/types'
import { SP1200 } from '~/types'

type LocalForageInstance = ReturnType<typeof localforage.createInstance>

// Module-level localforage instances (created once)
let patternStore: LocalForageInstance | null = null
let songStore: LocalForageInstance | null = null
let settingsStore: LocalForageInstance | null = null
let sampleStore: LocalForageInstance | null = null
let sampleBufferStore: LocalForageInstance | null = null
let _store: ReturnType<typeof useDrumMachineStore> | null = null

function getStores() {
  if (!patternStore) {
    patternStore = localforage.createInstance({ name: 'sp1200', storeName: 'patterns' })
    songStore = localforage.createInstance({ name: 'sp1200', storeName: 'songs' })
    settingsStore = localforage.createInstance({ name: 'sp1200', storeName: 'settings' })
    sampleStore = localforage.createInstance({ name: 'sp1200', storeName: 'samples' })
    sampleBufferStore = localforage.createInstance({ name: 'sp1200', storeName: 'sampleBuffers' })
  }
  return {
    patternStore: patternStore!,
    songStore: songStore!,
    settingsStore: settingsStore!,
    sampleStore: sampleStore!,
    sampleBufferStore: sampleBufferStore!,
  }
}

function getStore() {
  if (!_store) _store = useDrumMachineStore()
  return _store
}

export function usePersistence() {

  // === SAVE ===

  async function savePattern(index: number, pattern: Pattern) {
    const { patternStore } = getStores()
    await patternStore.setItem(String(index), pattern)
  }

  async function saveAllPatterns(patterns: Pattern[]) {
    const { patternStore } = getStores()
    await Promise.all(patterns.map((p, i) => patternStore.setItem(String(i), p)))
  }

  async function saveSong(index: number, song: Song) {
    const { songStore } = getStores()
    await songStore.setItem(String(index), song)
  }

  async function saveAllSongs(songs: Song[]) {
    const { songStore } = getStores()
    await Promise.all(songs.map((s, i) => songStore.setItem(String(i), s)))
  }

  async function saveSettings() {
    const store = getStore()
    const { settingsStore } = getStores()
    await settingsStore.setItem('padSettings', store.padSettings)
    await settingsStore.setItem('bpm', store.bpm)
    await settingsStore.setItem('swing', store.swing)
    await settingsStore.setItem('currentPattern', store.currentPattern)
    await settingsStore.setItem('currentSong', store.currentSong)
  }

  async function saveSample(sample: SampleData, buffer: AudioBuffer) {
    const { sampleStore, sampleBufferStore } = getStores()
    // Save metadata
    const meta = {
      id: sample.id,
      name: sample.name,
      duration: sample.duration,
      sampleRate: sample.sampleRate,
      isStock: sample.isStock,
      assignedPad: sample.assignedPad,
    }
    await sampleStore.setItem(sample.id, meta)

    // Save raw audio data (convert AudioBuffer → ArrayBuffer for storage)
    const channels: Float32Array[] = []
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      channels.push(buffer.getChannelData(c))
    }
    await sampleBufferStore.setItem(`${sample.id}_data`, channels[0].buffer)
  }

  // === LOAD ===

  async function loadPattern(index: number): Promise<Pattern | null> {
    const { patternStore } = getStores()
    return await patternStore.getItem(String(index))
  }

  async function loadAllPatterns(): Promise<(Pattern | null)[]> {
    const { patternStore } = getStores()
    const patterns: (Pattern | null)[] = []
    for (let i = 0; i < SP1200.MAX_PATTERNS; i++) {
      patterns.push(await patternStore.getItem(String(i)))
    }
    return patterns
  }

  async function loadSong(index: number): Promise<Song | null> {
    const { songStore } = getStores()
    return await songStore.getItem(String(index))
  }

  async function loadSettings() {
    const store = getStore()
    const { settingsStore } = getStores()
    const padSettings = await settingsStore.getItem('padSettings')
    const bpm = await settingsStore.getItem('bpm')
    const swing = await settingsStore.getItem('swing')
    const currentPattern = await settingsStore.getItem('currentPattern')
    const currentSong = await settingsStore.getItem('currentSong')

    if (padSettings) store.$patch({ padSettings: padSettings as typeof store.padSettings })
    if (bpm) store.setBpm(bpm as number)
    if (swing) store.setSwing(swing as number)
    if (currentPattern) store.selectPattern(currentPattern as number)
    if (currentSong) store.selectSong(currentSong as number)
  }

  async function loadSampleBuffer(sampleId: string, sampleRate: number, duration: number): Promise<AudioBuffer | null> {
    const { sampleBufferStore } = getStores()
    const arrayBuffer = await sampleBufferStore.getItem(`${sampleId}_data`) as ArrayBuffer | null
    if (!arrayBuffer) return null

    const audioCtx = new AudioContext({ sampleRate: 48000 })
    const buffer = audioCtx.createBuffer(1, arrayBuffer.byteLength / 4, sampleRate)
    const data = buffer.getChannelData(0)
    const sourceData = new Float32Array(arrayBuffer)
    data.set(sourceData)
    return buffer
  }

  async function loadAllSamples(): Promise<SampleData[]> {
    const { sampleStore } = getStores()
    const samples: SampleData[] = []
    await sampleStore.iterate((value: any, key: string) => {
      if (!key.endsWith('_data')) {
        samples.push({
          id: value.id,
          name: value.name,
          duration: value.duration,
          sampleRate: value.sampleRate,
          isStock: value.isStock,
          assignedPad: value.assignedPad,
          buffer: null as any,  // Will be loaded separately
        })
      }
    })
    return samples
  }

  // === DELETE ===

  async function deleteSample(sampleId: string) {
    const { sampleStore, sampleBufferStore } = getStores()
    await sampleStore.removeItem(sampleId)
    await sampleBufferStore.removeItem(`${sampleId}_data`)
  }

  // === EXPORT/IMPORT ===

  function exportToJSON(): string {
    const store = getStore()
    const data = {
      version: 1,
      patterns: store.patterns,
      songs: store.songs,
      settings: {
        padSettings: store.padSettings,
        bpm: store.bpm,
        swing: store.swing,
        currentPattern: store.currentPattern,
        currentSong: store.currentSong,
      },
      samples: store.samples.map(s => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        sampleRate: s.sampleRate,
        isStock: s.isStock,
        assignedPad: s.assignedPad,
      })),
      exportedAt: Date.now(),
    }
    return JSON.stringify(data, null, 2)
  }

  function exportToShareCode(): string {
    const json = exportToJSON()
    // Simple base64url encoding for shareable codes
    const encoded = btoa(json)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    return encoded
  }

  function importFromJSON(json: string) {
    const store = getStore()
    const data = JSON.parse(json)
    if (data.patterns) store.$patch({ patterns: data.patterns })
    if (data.songs) store.$patch({ songs: data.songs })
    if (data.settings) store.$patch({ ...data.settings })
    store.updateLcd()
  }

  function importFromShareCode(code: string) {
    // Decode base64url
    let base64 = code.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) base64 += '='
    const json = atob(base64)
    importFromJSON(json)
  }

  // === SAVE SESSION (auto-save) ===

  async function saveSession() {
    const store = getStore()
    await savePattern(store.currentPattern, store.activePattern)
    await saveSettings()
  }

  // === LOAD SESSION ===

  async function loadSession() {
    await loadSettings()
    const store = getStore()
    const pattern = await loadPattern(store.currentPattern)
    if (pattern) {
      store.patterns[store.currentPattern] = pattern
    }
    store.updateLcd()
  }

  return {
    savePattern,
    saveAllPatterns,
    saveSong,
    saveAllSongs,
    saveSettings,
    saveSample,
    saveSession,
    loadPattern,
    loadAllPatterns,
    loadSong,
    loadSettings,
    loadSampleBuffer,
    loadAllSamples,
    loadSession,
    deleteSample,
    exportToJSON,
    exportToShareCode,
    importFromJSON,
    importFromShareCode,
  }
}
