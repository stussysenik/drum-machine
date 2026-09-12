<script setup lang="ts">
import { useDrumMachineStore } from '~/stores/drumMachine'
import { useSequencer } from '~/composables/useSequencer'
import type { BankId } from '~/types'

const store = useDrumMachineStore()
const sequencer = useSequencer()

function handleMode() {
  store.cyclePerformanceMode()
}

function handleBank() {
  store.cycleBank()
}

function handleRunStop() {
  sequencer.toggle()
}

function handleRecord() {
  store.toggleRecord()
}

function handleTapRepeat() {
  store.setLcd('TAP TEMPO', `BPM: ${store.bpm}`)
}
</script>

<template>
  <div class="flex flex-col justify-between h-full py-1 pr-3 border-r border-sp-label-dim/30 font-silkscreen select-none w-36">
    <!-- MODE SECTION -->
    <div class="flex flex-col gap-1.5 bg-sp-faceplate-dark/40 border border-sp-label-dim/30 rounded p-2">
      <div class="flex items-center justify-between">
        <span class="text-[9px] text-sp-label font-bold tracking-wider">MODE</span>
        <button
          class="sp-btn-tactile px-2 py-0.5 text-[8.5px]"
          @click="handleMode"
        >
          SELECT
        </button>
      </div>

      <!-- Mode LEDs -->
      <div class="flex flex-col gap-1 text-[8px] text-sp-label-dim pt-0.5">
        <div class="flex items-center gap-1.5">
          <span
            class="w-2 h-2 rounded-full border border-black transition-colors"
            :class="store.performanceMode === 'tune_decay' ? 'bg-sp-led-red shadow-[0_0_5px_#ff2020]' : 'bg-sp-led-off'"
          />
          <span :class="store.performanceMode === 'tune_decay' ? 'text-sp-label font-bold' : ''">TUNE / DECAY</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            class="w-2 h-2 rounded-full border border-black transition-colors"
            :class="store.performanceMode === 'mix' ? 'bg-sp-led-red shadow-[0_0_5px_#ff2020]' : 'bg-sp-led-off'"
          />
          <span :class="store.performanceMode === 'mix' ? 'text-sp-label font-bold' : ''">MIX</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            class="w-2 h-2 rounded-full border border-black transition-colors"
            :class="store.performanceMode === 'multi' ? 'bg-sp-led-red shadow-[0_0_5px_#ff2020]' : 'bg-sp-led-off'"
          />
          <span :class="store.performanceMode === 'multi' ? 'text-sp-label font-bold' : ''">MULTI-MODE</span>
        </div>
      </div>
    </div>

    <!-- BANK SELECT SECTION -->
    <div class="flex flex-col gap-1.5 bg-sp-faceplate-dark/40 border border-sp-label-dim/30 rounded p-2">
      <div class="flex items-center justify-between">
        <span class="text-[9px] text-sp-label font-bold tracking-wider">BANK</span>
        <button
          class="sp-btn-tactile px-2 py-0.5 text-[8.5px]"
          @click="handleBank"
        >
          SELECT
        </button>
      </div>

      <!-- Bank A, B, C, D LEDs -->
      <div class="grid grid-cols-2 gap-1 text-[8px] text-sp-label-dim pt-0.5">
        <div
          v-for="b in (['A', 'B', 'C', 'D'] as BankId[])"
          :key="b"
          class="flex items-center gap-1.5 cursor-pointer"
          @click="store.selectBank(b)"
        >
          <span
            class="w-2 h-2 rounded-full border border-black transition-colors"
            :class="store.selectedBank === b ? 'bg-sp-led-red shadow-[0_0_5px_#ff2020]' : 'bg-sp-led-off'"
          />
          <span :class="store.selectedBank === b ? 'text-sp-label font-bold' : ''">BANK {{ b }}</span>
        </div>
      </div>
    </div>

    <!-- TRANSPORT SECTION -->
    <div class="flex flex-col gap-1.5 bg-sp-faceplate-dark/40 border border-sp-label-dim/30 rounded p-2">
      <span class="text-[9px] text-sp-label font-bold tracking-wider border-b border-sp-label-dim/20 pb-0.5">SEQUENCER</span>
      
      <!-- RUN / STOP -->
      <button
        class="sp-btn-tactile flex items-center justify-between py-1 px-2 w-full"
        :class="store.playing ? 'bg-sp-btn-active border-sp-label' : ''"
        @click="handleRunStop"
      >
        <span class="text-[9px]">RUN / STOP</span>
        <span
          class="w-2 h-2 rounded-full border border-black"
          :class="store.playing ? 'bg-sp-led-red shadow-[0_0_5px_#ff2020]' : 'bg-sp-led-off'"
        />
      </button>

      <!-- RECORD -->
      <button
        class="sp-btn-tactile flex items-center justify-between py-1 px-2 w-full"
        :class="store.recording ? 'bg-sp-btn-active border-sp-label' : ''"
        @click="handleRecord"
      >
        <span class="text-[9px] text-red-300">RECORD</span>
        <span
          class="w-2 h-2 rounded-full border border-black"
          :class="store.recording ? 'bg-sp-led-red shadow-[0_0_5px_#ff2020]' : 'bg-sp-led-off'"
        />
      </button>

      <!-- TAP / REPEAT -->
      <button
        class="sp-btn-tactile py-1 px-2 w-full text-center text-[8.5px]"
        @click="handleTapRepeat"
      >
        TAP / REPEAT
      </button>
    </div>
  </div>
</template>
