<script setup lang="ts">
import { ref } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'

const store = useDrumMachineStore()
const isBusy = ref(false)

function handleEject() {
  isBusy.value = true
  store.setLcd('DISK 3.5" DRIVE', 'DISK EJECTED')
  setTimeout(() => {
    isBusy.value = false
    store.updateLcd()
  }, 1200)
}
</script>

<template>
  <div class="flex flex-col justify-between h-full pl-3 border-l border-sp-label-dim/30 select-none font-silkscreen w-40">
    <!-- 3.5" DISK DRIVE MODULE -->
    <div class="flex flex-col bg-sp-faceplate-dark/60 border border-sp-label-dim/40 rounded p-2.5 shadow-inner">
      <div class="flex items-center justify-between pb-1.5 border-b border-sp-label-dim/30">
        <span class="text-[9px] text-sp-label font-bold tracking-wider">3.5" DISK DRIVE</span>
        <span class="text-[7.5px] text-sp-label-dim font-mono">720 KB DD</span>
      </div>

      <!-- Simulated Floppy Slot -->
      <div class="my-3 py-2 px-1 bg-sp-chassis rounded border border-sp-faceplate-dark flex flex-col items-center justify-center">
        <!-- Slot Opening -->
        <div class="w-full h-2 bg-black rounded-sm border border-neutral-800 shadow-inner" />
      </div>

      <!-- Drive Controls: Activity LED & Eject -->
      <div class="flex items-center justify-between pt-1">
        <div class="flex items-center gap-1.5">
          <span
            class="w-2 h-2 rounded-full border border-black transition-colors"
            :class="isBusy ? 'bg-sp-led-red shadow-[0_0_6px_#ff2020]' : 'bg-sp-led-off'"
          />
          <span class="text-[8px] text-sp-label-dim">BUSY</span>
        </div>

        <button
          class="sp-btn-tactile px-2.5 py-1 text-[8.5px] bg-sp-btn hover:bg-sp-btn-active active:bg-sp-btn-press"
          @click="handleEject"
        >
          EJECT
        </button>
      </div>
    </div>

    <!-- AUTHENTIC E-MU SYSTEMS SP-1200 BADGE -->
    <div class="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-sp-faceplate-light/30 to-sp-faceplate-dark/50 border border-sp-label-dim/40 rounded shadow-md mt-2">
      <span class="text-[10px] tracking-[0.25em] font-bold text-sp-label uppercase">E-mu Systems</span>
      <span class="text-[14px] tracking-[0.18em] font-black text-sp-label mt-0.5">SP-1200</span>
      <span class="text-[7px] tracking-[0.2em] text-sp-label-dim/80 uppercase mt-0.5">Sampling Percussion</span>
    </div>
  </div>
</template>
