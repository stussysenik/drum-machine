<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { useAudioEngine } from '~/composables/useAudioEngine'
import { usePersistence } from '~/composables/usePersistence'
import type { PadId } from '~/types'
import { SP1200 } from '~/types'

const store = useDrumMachineStore()
const audio = useAudioEngine()
const persistence = usePersistence()

const isRecording = ref(false)
const isDragOver = ref(false)
const recordTime = ref(0)
const showPanel = ref(false)

let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []
let recordTimer: number | null = null

// Memory state
const memoryUsed = computed(() => store.totalMemorySeconds)
const memoryPct = computed(() => (memoryUsed.value / SP1200.MAX_SAMPLE_TIME) * 100)
const memoryBars = computed(() => Math.round(memoryPct.value / 10))
const canImport = computed(() => memoryUsed.value < SP1200.MAX_SAMPLE_TIME)

// Toggle the upload/record panel
function togglePanel() {
  showPanel.value = !showPanel.value
}

// === FILE UPLOAD ===

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  for (const file of Array.from(input.files)) {
    await importFile(file)
  }

  // Reset input so same file can be selected again
  input.value = ''
}

async function importFile(file: File) {
  // Check memory
  const tempAudio = new Audio()
  tempAudio.src = URL.createObjectURL(file)
  await new Promise<void>(resolve => {
    tempAudio.addEventListener('loadedmetadata', () => resolve())
  })

  const duration = tempAudio.duration
  URL.revokeObjectURL(tempAudio.src)

  if (duration > SP1200.MAX_SAMPLE_DURATION) {
    alert(`Sample too long (${duration.toFixed(1)}s). Max is ${SP1200.MAX_SAMPLE_DURATION}s.`)
    return
  }

  if (store.totalMemorySeconds + duration > SP1200.MAX_SAMPLE_TIME) {
    alert(`Not enough memory! Used: ${store.totalMemorySeconds.toFixed(1)}s / ${SP1200.MAX_SAMPLE_TIME}s`)
    return
  }

  // Decode and load
  const buffer = await audio.decodeAudioFile(file)
  const targetPad = store.selectedPad

  audio.loadSampleToPad(targetPad, buffer)

  const sampleData = {
    id: `user_${Date.now()}_${targetPad}`,
    name: file.name.replace(/\.[^.]+$/, '').slice(0, 12).toUpperCase(),
    buffer,
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    isStock: false,
    assignedPad: targetPad,
  }

  store.addSample(sampleData)
  store.assignSampleToPad(sampleData.id, targetPad)
  persistence.saveSample(sampleData, buffer)
}

// === DRAG & DROP ===

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

async function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false

  if (!e.dataTransfer?.files.length) return

  for (const file of Array.from(e.dataTransfer.files)) {
    if (file.type.startsWith('audio/') || file.name.match(/\.(wav|mp3|ogg|flac|aiff)$/i)) {
      await importFile(file)
    }
  }
}

// === MIC RECORDING ===

async function startRecording() {
  if (isRecording.value) return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    recordedChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())

      const blob = new Blob(recordedChunks, { type: 'audio/webm' })
      const buffer = await audio.decodeAudioBuffer(await blob.arrayBuffer())

      // Check memory
      if (store.totalMemorySeconds + buffer.duration > SP1200.MAX_SAMPLE_TIME) {
        alert(`Not enough memory! Used: ${store.totalMemorySeconds.toFixed(1)}s / ${SP1200.MAX_SAMPLE_TIME}s`)
        return
      }

      const targetPad = store.selectedPad
      audio.loadSampleToPad(targetPad, buffer)

      const sampleData = {
        id: `rec_${Date.now()}`,
        name: `REC ${String(targetPad + 1).padStart(2, '0')}`,
        buffer,
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        isStock: false,
        assignedPad: targetPad,
      }

      store.addSample(sampleData)
      store.assignSampleToPad(sampleData.id, targetPad)
      persistence.saveSample(sampleData, buffer)
    }

    mediaRecorder.start()
    isRecording.value = true
    recordTime.value = 0

    // Max recording time = min(2.5s, remaining memory)
    const maxDuration = Math.min(SP1200.MAX_SAMPLE_DURATION, SP1200.MAX_SAMPLE_TIME - store.totalMemorySeconds)

    recordTimer = window.setInterval(() => {
      recordTime.value += 0.1
      if (recordTime.value >= maxDuration) {
        stopRecording()
      }
    }, 100)

  } catch (err) {
    alert('Microphone access denied. Allow mic access to record samples.')
  }
}

function stopRecording() {
  if (!isRecording.value || !mediaRecorder) return

  mediaRecorder.stop()
  isRecording.value = false

  if (recordTimer) {
    clearInterval(recordTimer)
    recordTimer = null
  }
  recordTime.value = 0
}

function cancelRecording() {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stream.getTracks().forEach(t => t.stop())
    mediaRecorder = null
  }
  isRecording.value = false
  if (recordTimer) {
    clearInterval(recordTimer)
    recordTimer = null
  }
  recordTime.value = 0
}

function closePanel() {
  if (isRecording.value) cancelRecording()
  showPanel.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Upload/Record toggle button -->
    <button
      class="sp-btn-param"
      :class="{ 'sp-btn-param-active': showPanel }"
      @click="togglePanel"
    >
      LOAD
    </button>

    <!-- Panel -->
    <Transition name="slide-up">
      <div
        v-if="showPanel"
        class="sample-panel"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <!-- Header -->
        <div class="panel-header">
          <span class="panel-title">SAMPLE LOAD</span>
          <button class="panel-close" @click="closePanel">✕</button>
        </div>

        <!-- Memory bar -->
        <div class="memory-section">
          <div class="memory-label">
            MEM: [{{ '█'.repeat(memoryBars) }}{{ '░'.repeat(10 - memoryBars) }}]
          </div>
          <div class="memory-pct" :class="{ 'memory-warn': memoryPct > 80 }">
            {{ memoryUsed.toFixed(1) }}s / {{ SP1200.MAX_SAMPLE_TIME }}s
          </div>
        </div>

        <!-- File upload -->
        <div
          class="drop-zone"
          :class="{ 'drag-over': isDragOver, 'disabled': !canImport || isRecording }"
        >
          <label class="upload-label">
            <span v-if="isDragOver">DROP TO LOAD</span>
            <span v-else>CLICK OR DROP AUDIO</span>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.ogg,.flac,.aiff"
              multiple
              class="hidden"
              :disabled="!canImport || isRecording"
              @change="handleFileSelect"
            />
          </label>
        </div>

        <!-- Mic recording -->
        <div class="record-section">
          <div class="record-status">
            <span v-if="isRecording" class="rec-indicator">● REC</span>
            <span v-else class="rec-idle">MIC RECORD</span>
            <span v-if="isRecording" class="rec-time">{{ recordTime.toFixed(1) }}s</span>
          </div>
          <div class="record-actions">
            <button
              v-if="!isRecording"
              class="rec-btn"
              :disabled="!canImport"
              @click="startRecording"
            >
              ● REC
            </button>
            <button
              v-else
              class="rec-btn rec-stop"
              @click="stopRecording"
            >
              ■ STOP
            </button>
          </div>
        </div>

        <!-- Target pad indicator -->
        <div class="target-pad">
          <span class="target-label">→ PAD</span>
          <span class="target-num">{{ store.selectedPad < 8 ? store.selectedPad + 1 : store.selectedPad - 7 }}</span>
          <span class="target-bank">[{{ store.selectedBank }}]</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.sample-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 200px;
  background: #2e2c28;
  border: 1px solid #4a4844;
  border-radius: 6px 6px 0 0;
  padding: 12px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.panel-title {
  font-family: 'Bahnschrift Condensed', sans-serif;
  font-size: 10px;
  color: #e8e4dc;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.panel-close {
  background: transparent;
  border: none;
  color: #6a6660;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
}

.panel-close:active {
  color: #ff2020;
}

.memory-section {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #3a3834;
}

.memory-label {
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #9aae3a;
  letter-spacing: 0.05em;
}

.memory-pct {
  font-family: 'VT323', monospace;
  font-size: 11px;
  color: #6a6660;
  margin-top: 2px;
}

.memory-warn {
  color: #ff6060;
}

.drop-zone {
  border: 2px dashed #4e4c48;
  border-radius: 4px;
  padding: 12px;
  text-align: center;
  margin-bottom: 8px;
  transition: border-color 0.1s, background 0.1s;
}

.drop-zone.drag-over {
  border-color: #9aae3a;
  background: rgba(154, 174, 58, 0.05);
}

.drop-zone.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.upload-label {
  font-family: 'Bahnschrift Condensed', sans-serif;
  font-size: 9px;
  color: #a09c94;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.upload-label input {
  display: none;
}

.record-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #3a3834;
}

.record-status {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rec-indicator {
  font-family: 'Bahnschrift Condensed', sans-serif;
  font-size: 10px;
  color: #ff2020;
  letter-spacing: 0.1em;
  animation: blink 0.6s infinite;
}

@keyframes blink {
  50% { opacity: 0.4; }
}

.rec-idle {
  font-family: 'Bahnschrift Condensed', sans-serif;
  font-size: 9px;
  color: #6a6660;
  letter-spacing: 0.1em;
}

.rec-time {
  font-family: 'VT323', monospace;
  font-size: 12px;
  color: #ff2020;
}

.rec-btn {
  background: #4a4640;
  border: 1px solid #aa1010;
  color: #ff2020;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 9px;
  cursor: pointer;
  font-family: 'Bahnschrift Condensed', sans-serif;
  letter-spacing: 0.1em;
}

.rec-btn:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.rec-btn:active:not(:disabled) {
  background: #3a3630;
}

.rec-stop {
  border-color: #9aae3a;
  color: #9aae3a;
}

.target-pad {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #3a3834;
}

.target-label {
  font-family: 'Bahnschrift Condensed', sans-serif;
  font-size: 9px;
  color: #6a6660;
}

.target-num {
  font-family: 'VT323', monospace;
  font-size: 16px;
  color: #e8e4dc;
}

.target-bank {
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #9aae3a;
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
