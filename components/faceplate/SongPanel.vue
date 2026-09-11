<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'

const store = useDrumMachineStore()

const isSongMode = computed(() => store.mode === 'song')
const isEditing = ref(false)

const activeSong = computed(() => store.songs[store.currentSong])

const chainLength = computed(() => activeSong.value.entries.length)

function toggleMode() {
  store.mode = store.mode === 'pattern' ? 'song' : 'pattern'
  store.updateLcd()
}

function addEntry() {
  store.addSongEntry(store.currentPattern, 1)
}

function removeEntry(index: number) {
  store.removeSongEntry(index)
}

function selectEntry(index: number) {
  // Jump to the pattern for this entry
  const entry = activeSong.value.entries[index]
  if (entry) store.selectPattern(entry.patternIndex)
}

function nextSong() {
  store.selectSong(Math.min(99, store.currentSong + 1))
  store.updateLcd()
}

function prevSong() {
  store.selectSong(Math.max(0, store.currentSong - 1))
  store.updateLcd()
}

function clearSong() {
  store.clearSong()
}

function updateEntryPattern(index: number, direction: number) {
  const entry = activeSong.value.entries[index]
  if (!entry) return
  const newIdx = Math.max(0, Math.min(99, entry.patternIndex + direction))
  entry.patternIndex = newIdx
}

function updateEntryRepeats(index: number, direction: number) {
  const entry = activeSong.value.entries[index]
  if (!entry) return
  entry.repeats = Math.max(1, Math.min(99, entry.repeats + direction))
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <!-- Song/Pattern mode toggle -->
    <button
      class="sp-btn-param"
      :class="{ 'sp-btn-param-active': isSongMode }"
      @click="toggleMode"
    >
      {{ isSongMode ? 'SONG' : 'PTN' }}
    </button>

    <!-- Song edit panel toggle (only in song mode) -->
    <button
      v-if="isSongMode"
      class="sp-btn-param"
      :class="{ 'sp-btn-param-active': isEditing }"
      @click="isEditing = !isEditing"
    >
      EDIT
    </button>
  </div>

  <!-- Song Editor Overlay -->
  <Transition name="slide-up">
    <div
      v-if="isSongMode && isEditing"
      class="song-editor"
    >
      <div class="song-editor-header">
        <button class="song-nav-btn" @click="prevSong">◀</button>
        <span class="song-title">
          SONG {{ String(store.currentSong + 1).padStart(2, '0') }}
        </span>
        <button class="song-nav-btn" @click="nextSong">▶</button>
        <button class="song-clear-btn" @click="clearSong">CLR</button>
      </div>

      <!-- Chain list -->
      <div class="song-chain">
        <div
          v-for="(entry, i) in activeSong.entries"
          :key="i"
          class="chain-entry"
          :class="{ 'chain-entry-active': i === store.currentStep % Math.max(1, chainLength) }"
        >
          <span class="chain-pos">{{ String(i + 1).padStart(2, '0') }}</span>
          <button class="chain-btn" @click="updateEntryPattern(i, -1)">◀</button>
          <span class="chain-ptn">P{{ String(entry.patternIndex + 1).padStart(2, '0') }}</span>
          <button class="chain-btn" @click="updateEntryPattern(i, 1)">▶</button>
          <span class="chain-x">×</span>
          <button class="chain-btn" @click="updateEntryRepeats(i, -1)">◀</button>
          <span class="chain-reps">{{ entry.repeats }}</span>
          <button class="chain-btn" @click="updateEntryRepeats(i, 1)">▶</button>
          <button class="chain-remove" @click="removeEntry(i)">✕</button>
        </div>

        <div v-if="chainLength === 0" class="chain-empty">
          NO ENTRIES — ADD PATTERNS
        </div>
      </div>

      <!-- Add entry -->
      <button class="song-add-btn" @click="addEntry">
        + ADD PTN {{ String(store.currentPattern + 1).padStart(2, '0') }}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.song-editor {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: #2e2c28;
  border: 1px solid #4a4844;
  border-radius: 6px 6px 0 0;
  padding: 12px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.5);
  z-index: 50;
  max-height: 300px;
  overflow-y: auto;
}

.song-editor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.song-nav-btn {
  background: #4a4640;
  border: 1px solid #4e4c48;
  color: #e8e4dc;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  font-family: 'Bahnschrift Condensed', sans-serif;
}

.song-nav-btn:active {
  background: #3a3630;
}

.song-title {
  flex: 1;
  text-align: center;
  font-family: 'Bahnschrift Condensed', sans-serif;
  font-size: 11px;
  color: #e8e4dc;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.song-clear-btn {
  background: #4a4640;
  border: 1px solid #aa1010;
  color: #ff6060;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 9px;
  cursor: pointer;
  font-family: 'Bahnschrift Condensed', sans-serif;
  letter-spacing: 0.05em;
}

.song-chain {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.chain-entry {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background: #3a3834;
  border-radius: 3px;
  border: 1px solid transparent;
}

.chain-entry-active {
  border-color: #ff2020;
  box-shadow: 0 0 4px rgba(255, 32, 32, 0.3);
}

.chain-pos {
  font-family: 'VT323', monospace;
  font-size: 12px;
  color: #9aae3a;
  width: 16px;
  text-align: center;
}

.chain-btn {
  background: #4a4640;
  border: 1px solid #4e4c48;
  color: #a09c94;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.chain-btn:active {
  background: #3a3630;
  color: #e8e4dc;
}

.chain-ptn {
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #e8e4dc;
  width: 32px;
  text-align: center;
}

.chain-x {
  color: #6a6660;
  font-size: 10px;
}

.chain-reps {
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #9aae3a;
  width: 16px;
  text-align: center;
}

.chain-remove {
  background: transparent;
  border: none;
  color: #aa1010;
  font-size: 10px;
  cursor: pointer;
  padding: 2px 4px;
  margin-left: auto;
}

.chain-remove:active {
  color: #ff2020;
}

.chain-empty {
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #6a6660;
  text-align: center;
  padding: 12px;
}

.song-add-btn {
  width: 100%;
  background: #4a4640;
  border: 1px solid #4e4c48;
  color: #9aae3a;
  padding: 6px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  font-family: 'Bahnschrift Condensed', sans-serif;
  letter-spacing: 0.05em;
}

.song-add-btn:active {
  background: #3a3630;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(8px);
  opacity: 0;
}
</style>
