<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { useAudioEngine } from '~/composables/useAudioEngine'

const store = useDrumMachineStore()
const audio = useAudioEngine()

const trackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

// Fader value 0-100 based on selected parameter
const faderValue = computed(() => {
  switch (store.selectedParameter) {
    case 'pitch':
      return store.padSettings[store.selectedPad].pitch
    case 'gain':
      return store.padSettings[store.selectedPad].gain
    case 'swing':
      return store.swing
    case 'bpm':
      return store.bpm
    default:
      return 50
  }
})

// Parameter label
const paramLabel = computed(() => {
  switch (store.selectedParameter) {
    case 'pitch': return `PITCH ${store.selectedPad + 1}`
    case 'gain': return `VOL ${store.selectedPad + 1}`
    case 'swing': return 'SWING'
    case 'bpm': return 'TEMPO'
    default: return 'VALUE'
  }
})

// Display value
const displayValue = computed(() => {
  switch (store.selectedParameter) {
    case 'pitch':
      return store.padSettings[store.selectedPad].pitch.toFixed(0)
    case 'gain':
      return store.padSettings[store.selectedPad].gain.toFixed(0)
    case 'swing':
      return store.swing.toFixed(0)
    case 'bpm':
      return store.bpm.toFixed(1)
    default:
      return '0'
  }
})

// Vertical position percentage (inverted: top = high)
const capPosition = computed(() => `${100 - faderValue.value}%`)

function handlePointerDown(e: PointerEvent) {
  isDragging.value = true
  updateFromPointer(e)
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function handlePointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  updateFromPointer(e)
}

function handlePointerUp() {
  isDragging.value = false
}

function updateFromPointer(e: PointerEvent) {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const y = e.clientY - rect.top
  const pct = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100))
  setValue(pct)
}

function setValue(pct: number) {
  switch (store.selectedParameter) {
    case 'pitch':
      store.setPadPitch(store.selectedPad, pct)
      audio.setPadPitch(store.selectedPad, 0.2 + (pct / 100) * 1.8)
      break
    case 'gain':
      store.setPadGain(store.selectedPad, pct)
      audio.setPadGain(store.selectedPad, pct / 100)
      break
    case 'swing':
      store.setSwing(Math.round(50 + (pct / 100) * 16))
      break
    case 'bpm':
      store.setBpm(Math.round(40 + (pct / 100) * 160))
      break
  }
}

// Click on track to jump
function handleTrackClick(e: PointerEvent) {
  updateFromPointer(e)
}

onUnmounted(() => {})
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <!-- Label -->
    <span class="text-[9px] font-silkscreen uppercase tracking-widest text-label-dim">
      {{ paramLabel }}
    </span>

    <!-- Fader track -->
    <div
      ref="trackRef"
      class="sp-fader-track w-fader-w h-fader-h relative"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @click="handleTrackClick"
    >
      <!-- Fade track marks -->
      <div class="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
        <div v-for="i in 11" :key="i" class="flex items-center">
          <div class="w-1.5 h-px bg-label-dim/20" />
        </div>
      </div>

      <!-- Fader cap -->
      <div
        class="sp-fader-cap"
        :style="{ top: capPosition }"
        :class="{ 'cursor-grabbing shadow-lg scale-105': isDragging }"
      />
    </div>

    <!-- Value display -->
    <span class="text-[9px] font-mono text-label">
      {{ displayValue }}
    </span>
  </div>
</template>

<style scoped>
.sp-fader-track {
  cursor: ns-resize;
  user-select: none;
  touch-action: none;
}

.sp-fader-cap {
  transition: top 0.05s ease;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.sp-fader-cap:active,
.sp-fader-cap.shadow-lg {
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>
