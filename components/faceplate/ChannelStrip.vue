<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { useAudioEngine } from '~/composables/useAudioEngine'
import type { PadId } from '~/types'

const store = useDrumMachineStore()
const audio = useAudioEngine()

// Tracks which pads are currently depressed
const pressedPads = ref<Record<number, boolean>>({})

function handlePadDown(channelIdx: number, e: PointerEvent) {
  e.preventDefault()
  const padId = store.visibleBankPads[channelIdx]
  pressedPads.value[channelIdx] = true
  store.selectPad(padId)
  audio.triggerPad(padId)
}

function handlePadUp(channelIdx: number) {
  pressedPads.value[channelIdx] = false
}

function handlePadLeave(channelIdx: number) {
  pressedPads.value[channelIdx] = false
}

function handleSliderInput(channelIdx: number, e: Event) {
  const target = e.target as HTMLInputElement
  const val = Number(target.value)
  store.setFader(channelIdx, val)
}
</script>

<template>
  <div class="grid grid-cols-8 gap-2.5 flex-1 px-2 select-none font-silkscreen">
    <div
      v-for="idx in 8"
      :key="idx"
      class="flex flex-col items-center justify-between h-full group"
    >
      <!-- Channel Number Label -->
      <div class="text-center">
        <span class="text-[11px] font-bold text-sp-label">{{ idx }}</span>
      </div>

      <!-- Vertical Slider Track & Cap -->
      <div class="relative flex items-center justify-center h-[130px] w-full py-1">
        <!-- Scale Tick Marks -->
        <div class="absolute inset-y-2 left-1.5 flex flex-col justify-between text-[7px] text-sp-label-dim font-mono pointer-events-none">
          <span>+</span>
          <span>-</span>
          <span class="text-sp-label font-bold">-0-</span>
          <span>-</span>
          <span>-</span>
        </div>

        <div class="absolute inset-y-2 right-1.5 flex flex-col justify-between text-[7px] text-sp-label-dim font-mono pointer-events-none">
          <span>+</span>
          <span>-</span>
          <span class="text-sp-label font-bold">-0-</span>
          <span>-</span>
          <span>-</span>
        </div>

        <!-- Center Detent Line Silkscreen -->
        <div class="absolute w-7 h-px bg-sp-label-dim/40 top-1/2 -translate-y-1/2 pointer-events-none" />

        <!-- Vertical Slider Input (styled as hardware fader) -->
        <div class="relative h-[116px] w-4 flex items-center justify-center">
          <div class="absolute w-1.5 h-full bg-sp-fader-track rounded-full border border-sp-chassis shadow-inner" />
          <input
            type="range"
            min="0"
            max="100"
            :value="store.faders[idx - 1]"
            @input="(e) => handleSliderInput(idx - 1, e)"
            class="slider-vertical cursor-pointer z-10"
          />
        </div>
      </div>

      <!-- Sound Name Silkscreen Label -->
      <div class="text-center h-4 flex items-center justify-center">
        <span class="text-[9px] font-bold tracking-wider text-sp-label-dim group-hover:text-sp-label transition-colors">
          {{ store.padSettings[store.visibleBankPads[idx - 1]]?.label ?? `SND-${idx}` }}
        </span>
      </div>

      <!-- Drum Play Pad (Pads 1 to 8) -->
      <button
        class="sp-play-pad w-full h-[56px] relative transition-all duration-75"
        :class="{
          'scale-[0.96] bg-sp-pad-press shadow-none': pressedPads[idx - 1],
          'ring-2 ring-sp-led-red/70': pressedPads[idx - 1],
          'border-sp-label/60': store.selectedPad === store.visibleBankPads[idx - 1]
        }"
        @pointerdown="(e) => handlePadDown(idx - 1, e)"
        @pointerup="() => handlePadUp(idx - 1)"
        @pointerleave="() => handlePadLeave(idx - 1)"
      >
        <span class="text-[12px] font-bold text-sp-label">
          {{ idx }}
        </span>
        <span class="text-[8px] text-sp-label-dim/70 font-mono mt-0.5">
          {{ store.selectedBank }}{{ idx }}
        </span>

        <!-- Subtle Red LED hit ring inside pad rim -->
        <span
          v-if="pressedPads[idx - 1]"
          class="absolute inset-1 rounded border border-sp-led-red/60 pointer-events-none animate-pulse"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.slider-vertical {
  -webkit-appearance: none;
  appearance: none;
  width: 116px;
  height: 16px;
  background: transparent;
  transform: rotate(-90deg);
  transform-origin: center center;
}

.slider-vertical::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 12px;
  background: #545458;
  border: 1px solid #787880;
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.slider-vertical::-moz-range-thumb {
  width: 22px;
  height: 12px;
  background: #545458;
  border: 1px solid #787880;
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}
</style>
