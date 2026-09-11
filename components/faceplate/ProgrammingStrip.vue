<script setup lang="ts">
import { useDrumMachineStore } from '~/stores/drumMachine'

const store = useDrumMachineStore()

function toggleMode() {
  store.mode = store.mode === 'song' ? 'pattern' : 'song'
  store.updateLcd()
}

function handleSoftButton(index: number) {
  if (store.mode === 'pattern') {
    // Segment mode functions
    switch (index) {
      case 1: // Auto correct
        store.setLcd('AUTO CORRECT', 'OFF 1/8 1/16 1/32')
        break
      case 2: // Time sig
        store.setLcd('TIME SIGNATURE', '4/4 (DEF)')
        break
      case 3: // Length
        store.setLcd('SEGMENT LENGTH', '02 BARS')
        break
      case 4: // Metronome
        store.setLcd('METRONOME CLICK', '1/4 NOTES')
        break
      case 5: // Erase
        store.setLcd('ERASE MODE', 'HOLD PAD TO ERASE')
        break
      case 6: // Step
        store.setLcd('STEP PROGRAMMING', `STEP: ${store.currentStep + 1} / 16`)
        break
      case 7: // Copy
        store.setLcd('COPY SEGMENT', 'FROM:01 TO:02')
        break
      case 8: // Swing
        store.swing = store.swing === 71 ? 50 : store.swing + 4
        store.setLcd('SWING SETTING', `${store.swing}%`)
        break
    }
  } else {
    // Song mode functions
    switch (index) {
      case 1: // Trigger
        store.setLcd('SONG TRIGGER', 'SELECT SEGMENT')
        break
      case 2: // Repeat
        store.setLcd('REPEAT COUNT', '01 TIMES')
        break
      case 3: // End
        store.setLcd('END OF SONG', 'STEP MARKED')
        break
      case 4: // Insert
        store.setLcd('INSERT STEP', 'NEW SEGMENT')
        break
      case 5: // Delete
        store.setLcd('DELETE STEP', 'CONFIRM YES/NO')
        break
      case 6: // Mix
        store.setLcd('SONG MIX CHANGE', 'SELECT MIX 1-8')
        break
      case 7: // Tempo
        store.setLcd('SONG TEMPO CHANGE', `BPM: ${store.bpm}`)
        break
      case 8: // Step
        store.setLcd('SONG STEP EDIT', 'STEP: 01')
        break
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-between w-full bg-sp-faceplate-dark/40 border border-sp-label-dim/40 rounded px-3 py-2 select-none font-silkscreen">
    <!-- Mode Toggle: SEGMENT / SONG -->
    <div class="flex items-center gap-3 pr-4 border-r border-sp-label-dim/30">
      <button
        class="sp-btn-tactile flex flex-col items-center justify-center px-3 py-1.5"
        :class="store.mode === 'song' ? 'bg-sp-btn-active border-sp-label' : ''"
        @click="toggleMode"
      >
        <span class="text-[9px] tracking-wider">SEGMENT / SONG</span>
        <div class="flex items-center gap-2 mt-1">
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full" :class="store.mode === 'pattern' ? 'bg-sp-led-red shadow-[0_0_4px_#ff2020]' : 'bg-sp-led-off'" />
            <span class="text-[7.5px] text-sp-label-dim">SEG</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full" :class="store.mode === 'song' ? 'bg-sp-led-red shadow-[0_0_4px_#ff2020]' : 'bg-sp-led-off'" />
            <span class="text-[7.5px] text-sp-label-dim">SONG</span>
          </div>
        </div>
      </button>
    </div>

    <!-- 8 Soft Buttons with Dual Silkscreen Labels -->
    <div class="grid grid-cols-8 gap-2 flex-1 pl-4 text-center">
      <!-- Soft Button 1 -->
      <div class="flex flex-col items-center">
        <span class="text-[7.5px] text-sp-label-dim leading-none mb-1 font-bold" :class="store.mode === 'song' ? 'text-sp-label' : ''">TRIGGER</span>
        <button class="sp-btn-tactile w-full py-1 text-[10px]" @click="handleSoftButton(1)">1</button>
        <span class="text-[7.5px] text-sp-label-dim leading-none mt-1 font-bold" :class="store.mode === 'pattern' ? 'text-sp-label' : ''">AUTO-CORR</span>
      </div>

      <!-- Soft Button 2 -->
      <div class="flex flex-col items-center">
        <span class="text-[7.5px] text-sp-label-dim leading-none mb-1 font-bold" :class="store.mode === 'song' ? 'text-sp-label' : ''">REPEAT</span>
        <button class="sp-btn-tactile w-full py-1 text-[10px]" @click="handleSoftButton(2)">2</button>
        <span class="text-[7.5px] text-sp-label-dim leading-none mt-1 font-bold" :class="store.mode === 'pattern' ? 'text-sp-label' : ''">TIME-SIG</span>
      </div>

      <!-- Soft Button 3 -->
      <div class="flex flex-col items-center">
        <span class="text-[7.5px] text-sp-label-dim leading-none mb-1 font-bold" :class="store.mode === 'song' ? 'text-sp-label' : ''">END</span>
        <button class="sp-btn-tactile w-full py-1 text-[10px]" @click="handleSoftButton(3)">3</button>
        <span class="text-[7.5px] text-sp-label-dim leading-none mt-1 font-bold" :class="store.mode === 'pattern' ? 'text-sp-label' : ''">LENGTH</span>
      </div>

      <!-- Soft Button 4 -->
      <div class="flex flex-col items-center">
        <span class="text-[7.5px] text-sp-label-dim leading-none mb-1 font-bold" :class="store.mode === 'song' ? 'text-sp-label' : ''">INSERT</span>
        <button class="sp-btn-tactile w-full py-1 text-[10px]" @click="handleSoftButton(4)">4</button>
        <span class="text-[7.5px] text-sp-label-dim leading-none mt-1 font-bold" :class="store.mode === 'pattern' ? 'text-sp-label' : ''">METRONOME</span>
      </div>

      <!-- Soft Button 5 -->
      <div class="flex flex-col items-center">
        <span class="text-[7.5px] text-sp-label-dim leading-none mb-1 font-bold" :class="store.mode === 'song' ? 'text-sp-label' : ''">DELETE</span>
        <button class="sp-btn-tactile w-full py-1 text-[10px]" @click="handleSoftButton(5)">5</button>
        <span class="text-[7.5px] text-sp-label-dim leading-none mt-1 font-bold" :class="store.mode === 'pattern' ? 'text-sp-label' : ''">ERASE</span>
      </div>

      <!-- Soft Button 6 -->
      <div class="flex flex-col items-center">
        <span class="text-[7.5px] text-sp-label-dim leading-none mb-1 font-bold" :class="store.mode === 'song' ? 'text-sp-label' : ''">MIX</span>
        <button class="sp-btn-tactile w-full py-1 text-[10px]" @click="handleSoftButton(6)">6</button>
        <span class="text-[7.5px] text-sp-label-dim leading-none mt-1 font-bold" :class="store.mode === 'pattern' ? 'text-sp-label' : ''">STEP</span>
      </div>

      <!-- Soft Button 7 -->
      <div class="flex flex-col items-center">
        <span class="text-[7.5px] text-sp-label-dim leading-none mb-1 font-bold" :class="store.mode === 'song' ? 'text-sp-label' : ''">TEMPO</span>
        <button class="sp-btn-tactile w-full py-1 text-[10px]" @click="handleSoftButton(7)">7</button>
        <span class="text-[7.5px] text-sp-label-dim leading-none mt-1 font-bold" :class="store.mode === 'pattern' ? 'text-sp-label' : ''">COPY</span>
      </div>

      <!-- Soft Button 8 -->
      <div class="flex flex-col items-center">
        <span class="text-[7.5px] text-sp-label-dim leading-none mb-1 font-bold" :class="store.mode === 'song' ? 'text-sp-label' : ''">STEP</span>
        <button class="sp-btn-tactile w-full py-1 text-[10px]" @click="handleSoftButton(8)">8</button>
        <span class="text-[7.5px] text-sp-label-dim leading-none mt-1 font-bold" :class="store.mode === 'pattern' ? 'text-sp-label' : ''">SWING</span>
      </div>
    </div>
  </div>
</template>
