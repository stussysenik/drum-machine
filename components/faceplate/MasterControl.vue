<script setup lang="ts">
import { computed } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'

const store = useDrumMachineStore()

function handleKey(k: string) {
  store.pressKeypad(k)
}

function handleTempo() {
  const newBpm = prompt('ENTER TEMPO (BPM):', String(store.bpm))
  if (newBpm) {
    const val = parseFloat(newBpm)
    if (!isNaN(val)) store.setBpm(val)
  }
}

function adjustMixVolume(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  store.mixVolume = val
}

function adjustMetronomeVolume(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  store.metronomeVolume = val
}
</script>

<template>
  <div class="flex flex-col gap-2 bg-sp-faceplate-dark/50 border border-sp-label-dim/40 rounded p-2.5 select-none font-silkscreen">
    <div class="flex items-center justify-between border-b border-sp-label-dim/30 pb-1">
      <span class="text-[10px] tracking-widest text-sp-label font-bold">MASTER CONTROL</span>
      <span class="text-[8px] text-sp-label-dim tracking-wider font-mono">2x16 LCD / 10-KEY</span>
    </div>

    <!-- 2x16 Character LCD Display -->
    <div class="sp-lcd-screen flex flex-col justify-center min-h-[58px]">
      <div class="sp-lcd-text text-[13px] whitespace-pre">{{ store.lcd.line1 }}</div>
      <div class="sp-lcd-text text-[13px] whitespace-pre">{{ store.lcd.line2 }}</div>
    </div>

    <!-- Master Volumes & Keypad Grid -->
    <div class="flex gap-3 items-start justify-between pt-1">
      <!-- Volume Knobs -->
      <div class="flex flex-col gap-2 justify-around pt-0.5">
        <!-- Mix Volume Pot -->
        <div class="flex flex-col items-center">
          <span class="text-[8px] text-sp-label-dim tracking-wider mb-0.5">MIX VOL</span>
          <input
            type="range"
            min="0"
            max="100"
            :value="store.mixVolume"
            @input="adjustMixVolume"
            class="w-16 h-1.5 accent-[#8e8c84] bg-sp-fader-track cursor-pointer rounded-full"
          />
          <span class="text-[8px] text-sp-label font-mono mt-0.5">{{ store.mixVolume }}%</span>
        </div>

        <!-- Metronome Volume Pot -->
        <div class="flex flex-col items-center">
          <span class="text-[8px] text-sp-label-dim tracking-wider mb-0.5">METRO VOL</span>
          <input
            type="range"
            min="0"
            max="100"
            :value="store.metronomeVolume"
            @input="adjustMetronomeVolume"
            class="w-16 h-1.5 accent-[#8e8c84] bg-sp-fader-track cursor-pointer rounded-full"
          />
          <span class="text-[8px] text-sp-label font-mono mt-0.5">{{ store.metronomeVolume }}%</span>
        </div>

        <!-- TEMPO Button -->
        <button
          class="sp-btn-tactile w-full py-1 text-[9px] bg-sp-btn hover:bg-sp-btn-active mt-1"
          @click="handleTempo"
        >
          TEMPO
        </button>
      </div>

      <!-- Numeric Keypad Matrix -->
      <div class="flex flex-col gap-1">
        <!-- Row 1: 7 8 9 -->
        <div class="flex gap-1">
          <button class="sp-btn-keypad" @click="handleKey('7')">7</button>
          <button class="sp-btn-keypad" @click="handleKey('8')">8</button>
          <button class="sp-btn-keypad" @click="handleKey('9')">9</button>
        </div>
        <!-- Row 2: 4 5 6 -->
        <div class="flex gap-1">
          <button class="sp-btn-keypad" @click="handleKey('4')">4</button>
          <button class="sp-btn-keypad" @click="handleKey('5')">5</button>
          <button class="sp-btn-keypad" @click="handleKey('6')">6</button>
        </div>
        <!-- Row 3: 1 2 3 -->
        <div class="flex gap-1">
          <button class="sp-btn-keypad" @click="handleKey('1')">1</button>
          <button class="sp-btn-keypad" @click="handleKey('2')">2</button>
          <button class="sp-btn-keypad" @click="handleKey('3')">3</button>
        </div>
        <!-- Row 4: 0, NO, YES -->
        <div class="flex gap-1">
          <button class="sp-btn-keypad" @click="handleKey('0')">0</button>
          <button class="sp-btn-keypad text-[10px] text-red-400" @click="handleKey('NO')">NO</button>
          <button class="sp-btn-keypad text-[10px] text-green-400" @click="handleKey('YES')">YES</button>
        </div>
        <!-- Row 5: <, >, ENTER -->
        <div class="flex gap-1">
          <button class="sp-btn-keypad font-mono" @click="handleKey('<')">&lt;</button>
          <button class="sp-btn-keypad font-mono" @click="handleKey('>')">&gt;</button>
          <button class="sp-btn-keypad text-[9px] bg-sp-faceplate-light" @click="handleKey('ENTER')">ENT</button>
        </div>
      </div>
    </div>
  </div>
</template>
