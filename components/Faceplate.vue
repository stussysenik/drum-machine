<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as Tone from 'tone'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { useAudioEngine } from '~/composables/useAudioEngine'
import { useStockKit } from '~/composables/useStockKit'
import { useSequencer } from '~/composables/useSequencer'
import ModuleSilkscreen from './faceplate/ModuleSilkscreen.vue'
import MasterControl from './faceplate/MasterControl.vue'
import ProgrammingStrip from './faceplate/ProgrammingStrip.vue'
import PerformanceControls from './faceplate/PerformanceControls.vue'
import ChannelStrip from './faceplate/ChannelStrip.vue'
import FloppyDrive from './faceplate/FloppyDrive.vue'
import TutorialDialog from './faceplate/TutorialDialog.vue'

const store = useDrumMachineStore()
const audio = useAudioEngine()
const stockKit = useStockKit()
const sequencer = useSequencer()
const tutorialOpen = ref(false)

// Sync Tone.js transport when BPM/swing changes
watch(() => store.bpm, (bpm) => {
  Tone.getTransport().bpm.value = bpm
})
watch(() => store.swing, () => {
  sequencer.syncTransport()
})
watch(() => store.mode, () => {
  store.updateLcd()
})

// Start Tone.js context on first user gesture
async function ensureToneStarted() {
  await Tone.start()
}

onMounted(async () => {
  await audio.init()
  await stockKit.loadStockKit()
  store.updateLcd()

  window.addEventListener('pointerdown', ensureToneStarted, { once: true })
})
</script>

<template>
  <div class="faceplate-wrapper flex items-center justify-center p-4">
    <!-- SP-1200 Authentic Hardware Chassis -->
    <div class="sp-console max-w-[1120px] w-full min-h-[650px] flex flex-col justify-between p-4 bg-sp-faceplate border-[10px] border-sp-chassis shadow-2xl relative select-none">
      <!-- 4 Hex Chassis Corner Screws -->
      <div class="absolute top-2.5 left-2.5 sp-chassis-screw">
        <div class="w-2 h-0.5 bg-sp-screw-slot transform rotate-45" />
      </div>
      <div class="absolute top-2.5 right-2.5 sp-chassis-screw">
        <div class="w-2 h-0.5 bg-sp-screw-slot transform -rotate-45" />
      </div>
      <div class="absolute bottom-2.5 left-2.5 sp-chassis-screw">
        <div class="w-2 h-0.5 bg-sp-screw-slot transform -rotate-12" />
      </div>
      <div class="absolute bottom-2.5 right-2.5 sp-chassis-screw">
        <div class="w-2 h-0.5 bg-sp-screw-slot transform rotate-75" />
      </div>

      <div class="sp-metal-band flex items-center justify-between px-10 font-silkscreen">
        <div class="flex items-baseline gap-3 text-sp-chassis">
          <span class="text-[24px] tracking-[-0.1em] font-black uppercase">SP 1200</span>
          <span class="text-[8px] tracking-[0.42em] uppercase">Sampling Percussion</span>
        </div>
        <button class="sp-help-button" type="button" @click="tutorialOpen = true">HELP</button>
      </div>

      <!-- MAIN HARDWARE GRID -->
      <div class="flex flex-col gap-3.5 my-2">
        <!-- ROW 1: Silkscreen Modules (Left) + Master Control (Right) -->
        <div class="grid grid-cols-12 gap-3.5 items-stretch min-h-[150px]">
          <!-- Left 8 Cols: SET-UP, DISK, SYNC, SAMPLE modules -->
          <div class="col-span-8 flex">
            <ModuleSilkscreen />
          </div>

          <!-- Right 4 Cols: Master Control (LCD + 10-Key + Volumes) -->
          <div class="col-span-4 flex">
            <MasterControl class="w-full" />
          </div>
        </div>

        <!-- ROW 2: Programming Module (Segment / Song + 8 Soft Buttons) -->
        <div class="w-full">
          <ProgrammingStrip />
        </div>

        <!-- ROW 3: Performance Section (Controls + 8 Sliders & Pads + Floppy) -->
        <div class="flex items-stretch gap-3 p-3 min-h-[250px]">
          <!-- Left Column: Mode, Bank Select, Sequencer Transport -->
          <PerformanceControls />

          <!-- Center: 8 Vertical Channel Sliders + 8 Large Drum Play Pads -->
          <ChannelStrip />

          <!-- Right Column: 3.5" Disk Drive & Classic E-mu Badge -->
          <FloppyDrive />
        </div>
      </div>

      <div class="sp-metal-band flex items-center px-10 text-[20px] font-silkscreen text-sp-chassis">
        <span>E-mu Systems, Inc.</span>
      </div>
    </div>
    <TutorialDialog :open="tutorialOpen" @close="tutorialOpen = false" />
  </div>
</template>

<style scoped>
.faceplate-wrapper {
  width: 100%;
  height: 100%;
  max-height: 100vh;
  overflow: auto;
}
.sp-metal-band { min-height: 44px; background: linear-gradient(180deg, #d5d4d0, #a8a8aa 45%, #d2d1ce); border: 1px solid #77777b; }
.sp-help-button { border: 1px solid #444449; background: #eeece7; color: #202024; padding: .22rem .5rem; font: 700 .65rem 'Bahnschrift Condensed', sans-serif; letter-spacing: .12em; cursor: pointer; }
</style>
