<script setup lang="ts">
import { computed } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { SP1200 } from '~/types'

const store = useDrumMachineStore()

const songIndex = computed(() => store.currentSong)
const song = computed(() => store.songs[store.currentSong])
const isPlaying = computed(() => store.playing)
const pendingSong = computed(() => store.pendingSong)
const isEmpty = computed(() => song.value.entries.length === 0)

const entries = computed(() =>
  song.value.entries.map((entry, i) => ({
    position: i + 1,
    patternIndex: entry.patternIndex,
    repeats: entry.repeats,
    label: `P${String(entry.patternIndex + 1).padStart(2, '0')}`,
  }))
)

const chainDisplay = computed(() =>
  song.value.entries
    .map((e, i) => `P${String(e.patternIndex + 1).padStart(2, '0')}×${e.repeats}`)
    .join(' → ')
)

const layers = computed(() => {
  if (isEmpty.value) return []
  // Show layers for the first entry's pattern
  const firstPattern = song.value.entries[0].patternIndex
  return store.patternLayerSummary(firstPattern)
})

function selectSong(index: number) {
  store.requestSongSelection(index)
}

function cancelPending() {
  store.cancelPendingSong()
}

function jumpToEntry(patternIndex: number) {
  store.selectPattern(patternIndex)
}

function prevSong() {
  const prev = Math.max(0, store.currentSong - 1)
  store.requestSongSelection(prev)
}

function nextSong() {
  const next = Math.min(SP1200.MAX_SONGS - 1, store.currentSong + 1)
  store.requestSongSelection(next)
}
</script>

<template>
  <div class="song-workbench">
    <!-- Song selector -->
    <div class="sw-header">
      <button class="sw-nav-btn" aria-label="Previous song" @click="prevSong">◀</button>
      <span class="sw-title">
        SONG {{ String(songIndex + 1).padStart(2, '0') }}
        <span v-if="pendingSong !== null" class="sw-pending">
          → {{ String(pendingSong + 1).padStart(2, '0') }}
        </span>
      </span>
      <button class="sw-nav-btn" aria-label="Next song" @click="nextSong">▶</button>
    </div>

    <!-- Pending indicator -->
    <div v-if="pendingSong !== null" class="sw-pending-bar">
      <span>NEXT SONG: {{ String(pendingSong + 1).padStart(2, '0') }} (at seg boundary)</span>
      <button class="sw-cancel-btn" @click="cancelPending">CANCEL</button>
    </div>

    <!-- Empty state -->
    <div v-if="isEmpty" class="sw-empty">
      <p>EMPTY SONG</p>
      <p class="sw-empty-hint">Add pattern entries in Song mode to build an arrangement.</p>
    </div>

    <!-- Chain display -->
    <div v-else class="sw-chain">
      <div class="sw-chain-label">CHAIN</div>
      <div class="sw-chain-display">{{ chainDisplay }}</div>
    </div>

    <!-- Entry list -->
    <div v-if="!isEmpty" class="sw-entries">
      <div
        v-for="entry in entries"
        :key="entry.position"
        class="sw-entry"
        @click="jumpToEntry(entry.patternIndex)"
      >
        <span class="sw-entry-pos">{{ String(entry.position).padStart(2, '0') }}</span>
        <span class="sw-entry-label">{{ entry.label }}</span>
        <span class="sw-entry-reps">×{{ entry.repeats }}</span>
      </div>
    </div>

    <!-- Layer summary -->
    <div v-if="!isEmpty" class="sw-layers">
      <div class="sw-layers-label">CHANNEL LAYERS</div>
      <div class="sw-layer-grid">
        <div
          v-for="layer in layers"
          :key="layer.channel"
          class="sw-layer"
          :class="{ 'sw-layer-active': layer.activeSteps > 0 }"
        >
          <span class="sw-layer-ch">CH{{ layer.channel }}</span>
          <span class="sw-layer-dots">
            <span v-for="n in 8" :key="n" class="sw-dot" :class="{ 'sw-dot-on': n <= Math.ceil(layer.activeSteps / 2) }" />
          </span>
          <span v-if="layer.sampleLabel" class="sw-layer-name">{{ layer.sampleLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.song-workbench {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  font-family: 'Bahnschrift Condensed', 'Arial Narrow', sans-serif;
  color: #e8e4dc;
  max-height: 100%;
  overflow-y: auto;
}

.sw-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sw-nav-btn {
  background: #4a4640;
  border: 1px solid #4e4c48;
  color: #e8e4dc;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;
}

.sw-nav-btn:active {
  background: #3a3630;
}

.sw-title {
  flex: 1;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.sw-pending {
  color: #ff9933;
  font-size: 10px;
}

.sw-pending-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #4a3a20;
  border: 1px solid #ff9933;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 10px;
  color: #ff9933;
}

.sw-cancel-btn {
  background: #4a4640;
  border: 1px solid #aa1010;
  color: #ff6060;
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 9px;
  cursor: pointer;
  font-family: inherit;
}

.sw-empty {
  text-align: center;
  padding: 16px 8px;
}

.sw-empty p {
  margin: 0;
  font-size: 12px;
  color: #9a9690;
}

.sw-empty-hint {
  font-size: 10px !important;
  margin-top: 4px !important;
  color: #6a6660 !important;
}

.sw-chain {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sw-chain-label,
.sw-layers-label {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #6caec4;
  font-weight: 700;
}

.sw-chain-display {
  font-family: 'VT323', monospace;
  font-size: 13px;
  color: #9aae3a;
  background: #1a1916;
  padding: 6px 8px;
  border-radius: 3px;
  overflow-x: auto;
  white-space: nowrap;
}

.sw-entries {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sw-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  background: #3a3834;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid transparent;
}

.sw-entry:hover {
  border-color: #6caec4;
}

.sw-entry-pos {
  font-family: 'VT323', monospace;
  font-size: 11px;
  color: #9aae3a;
  width: 16px;
  text-align: center;
}

.sw-entry-label {
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #e8e4dc;
  flex: 1;
}

.sw-entry-reps {
  font-family: 'VT323', monospace;
  font-size: 12px;
  color: #9aae3a;
}

.sw-layers {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sw-layer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}

.sw-layer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  background: #2e2c28;
  border-radius: 3px;
  border: 1px solid transparent;
}

.sw-layer-active {
  border-color: #4a4844;
  background: #3a3834;
}

.sw-layer-ch {
  font-family: 'VT323', monospace;
  font-size: 11px;
  color: #9a9690;
  width: 28px;
}

.sw-layer-dots {
  display: flex;
  gap: 2px;
}

.sw-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #4a4844;
}

.sw-dot-on {
  background: #9aae3a;
  box-shadow: 0 0 3px rgba(154, 174, 58, 0.5);
}

.sw-layer-name {
  font-size: 9px;
  color: #6a6660;
  margin-left: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}
</style>
