<script setup lang="ts">
import { useDrumMachineStore } from '~/stores/drumMachine'

const store = useDrumMachineStore()

const parameters = [
  { id: 'pitch' as const, label: 'PITCH' },
  { id: 'gain' as const, label: 'VOL' },
  { id: 'swing' as const, label: 'SWING' },
  { id: 'bpm' as const, label: 'TEMPO' },
]

const transports = [
  { id: 'play', label: 'PLAY', action: () => store.togglePlay() },
  { id: 'stop', label: 'STOP', action: () => store.stop() },
  { id: 'clear', label: 'CLEAR', action: () => store.clearPattern() },
  { id: 'erase', label: 'ERASE', action: () => store.clearVoiceChannel(store.selectedPad % 8 as any) },
  { id: 'bank-a', label: 'BANK A', action: () => store.selectBank('A') },
  { id: 'bank-b', label: 'BANK B', action: () => store.selectBank('B') },
]

function prevPattern() {
  store.selectPattern(Math.max(0, store.currentPattern - 1))
  store.updateLcd()
}

function nextPattern() {
  store.selectPattern(Math.min(99, store.currentPattern + 1))
  store.updateLcd()
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Parameter buttons (for fader) -->
    <div class="flex items-center gap-1.5">
      <span class="text-[8px] font-silkscreen text-label-dim/60 uppercase tracking-widest mr-1">EDIT:</span>
      <button
        v-for="param in parameters"
        :key="param.id"
        class="sp-btn-param"
        :class="{ 'sp-btn-param-active': store.selectedParameter === param.id }"
        @click="store.setSelectedParameter(param.id)"
      >
        {{ param.label }}
      </button>
    </div>

    <!-- Pattern navigation -->
    <div class="flex items-center gap-1.5">
      <button class="sp-btn-param" @click="prevPattern">◀ PTN</button>
      <span class="text-[9px] font-mono text-label">
        {{ String(store.currentPattern + 1).padStart(2, '0') }}
      </span>
      <button class="sp-btn-param" @click="nextPattern">PTN ▶</button>
    </div>

    <!-- Transport + utility buttons -->
    <div class="flex items-center gap-1.5">
      <button
        v-for="btn in transports"
        :key="btn.id"
        class="sp-btn-param"
        :class="[
          btn.id === 'play' && store.playing ? 'sp-btn-param-active' : '',
          btn.id === 'bank-a' && store.selectedBank === 'A' ? 'bg-led-dim/20 border-led-dim' : '',
          btn.id === 'bank-b' && store.selectedBank === 'B' ? 'bg-led-dim/20 border-led-dim' : '',
        ]"
        @click="btn.action"
      >
        {{ btn.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.sp-btn-param {
  font-size: 8px;
  letter-spacing: 0.1em;
}
</style>
