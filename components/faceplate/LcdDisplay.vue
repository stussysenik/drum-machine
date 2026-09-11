<script setup lang="ts">
import { computed } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { SP1200 } from '~/types'

const store = useDrumMachineStore()

// Memory bar: 10 segments, filled based on usage
const memoryBar = computed(() => {
  const pct = (store.totalMemorySeconds / SP1200.MAX_SAMPLE_TIME) * 100
  const bars = Math.round(pct / 10)
  return '█'.repeat(bars) + '░'.repeat(10 - bars)
})

// Line 1: Track/Song info
const line1 = computed(() => {
  if (store.mode === 'song') {
    const songNum = String(store.currentSong + 1).padStart(2, '0')
    return `SONG:${songNum}`
  }
  const patNum = String(store.currentPattern + 1).padStart(2, '0')
  return `TRK:${patNum}`
})

// Line 2: BPM + Memory
const line2 = computed(() => {
  const bpm = String(store.bpm).padStart(3, '0') + '.0'
  return `BPM:${bpm} MEM:[${memoryBar.value}]`
})
</script>

<template>
  <div class="sp-lcd">
    <div class="sp-lcd-text sp-lcd-line">{{ line1 }}</div>
    <div class="sp-lcd-text sp-lcd-line">{{ line2 }}</div>
  </div>
</template>

<style scoped>
.sp-lcd {
  background: #1a2210;
  border: 2px solid #2e2c28;
  border-radius: 4px;
  padding: 8px 16px;
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.5),
    0 0 8px rgba(154, 174, 58, 0.1);
  min-width: 220px;
}

.sp-lcd-text {
  color: #9aae3a;
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 18px;
  letter-spacing: 0.15em;
  line-height: 1.3;
  text-shadow: 0 0 4px rgba(154, 174, 58, 0.4);
}

.sp-lcd-line {
  white-space: pre;
  font-variant-numeric: tabular-nums;
}
</style>
