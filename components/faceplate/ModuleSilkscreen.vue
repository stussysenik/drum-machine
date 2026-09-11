<script setup lang="ts">
import { useDrumMachineStore } from '~/stores/drumMachine'
import type { HardwareModule } from '~/types'

const store = useDrumMachineStore()

function selectModule(mod: HardwareModule) {
  store.setHardwareModule(mod)
}
</script>

<template>
  <div class="grid grid-cols-4 gap-5 w-full h-full font-silkscreen select-none">
    <!-- 1. SET-UP MODULE -->
    <div
      class="sp-module-box flex flex-col justify-between cursor-pointer transition-colors"
      :class="store.activeModule === 'setup' ? 'bg-sp-faceplate-dark/25' : ''"
      @click="selectModule('setup')"
    >
      <span class="sp-module-title">SET-UP</span>
      <div class="text-[7.5px] leading-[1.2] text-sp-label pt-1 space-y-0.5">
        <div v-for="item in ['11 MULTI PITCH', '12 MULTI LEVEL', '13 EXIT MULTI MODE', '14 DYNAMIC BUTTONS', '15 DEFINE MIX', '16 SELECT MIX', '17 CHANNEL ASSIGN', '18 DECAY/TUNE SELECT', '19 LOOP/TRUNCATE', '20 DELETE SOUND', '21 SET SONG/SEQ', '22 MIDI PARAMETERS', '23 SPECIAL']" :key="item">{{ item }}</div>
      </div>
    </div>

    <!-- 2. DISK MODULE -->
    <div
      class="sp-module-box flex flex-col justify-between cursor-pointer transition-colors"
      :class="store.activeModule === 'disk' ? 'bg-sp-faceplate-dark/25' : ''"
      @click="selectModule('disk')"
    >
      <span class="sp-module-title">DISK</span>
      <div class="text-[8.5px] leading-[1.3] text-sp-label pt-1 space-y-0.5">
        <div v-for="item in ['1 SAVE SEQUENCES', '2 SAVE SOUNDS', '3 LOAD SEQUENCES', '4 LOAD SEGMENT', '5 LOAD SOUNDS', '6 LOAD SOUNDS', '7 CATALOG SEQUENCES', '8 CATALOG SOUNDS', '9 FORMAT/COPY SOFTWARE', '0 LOAD SEQUENCES AND SOUNDS']" :key="item">{{ item }}</div>
      </div>
    </div>

    <!-- 3. SYNC MODULE -->
    <div
      class="sp-module-box flex flex-col justify-between cursor-pointer transition-colors"
      :class="store.activeModule === 'sync' ? 'bg-sp-faceplate-dark/25' : ''"
      @click="selectModule('sync')"
    >
      <span class="sp-module-title">SYNC</span>
      <div class="text-[8.5px] leading-[1.4] text-sp-label pt-1 space-y-0.5">
        <div v-for="item in ['1 INTERNAL', '2 MIDI', '3 SMPTE', '4 CLICK']" :key="item">{{ item }}</div>
      </div>
    </div>

    <!-- 4. SAMPLE MODULE -->
    <div
      class="sp-module-box flex flex-col justify-between cursor-pointer transition-colors"
      :class="store.activeModule === 'sample' ? 'bg-sp-faceplate-dark/25' : ''"
      @click="selectModule('sample')"
    >
      <span class="sp-module-title">SAMPLE</span>
      <div class="text-[8.5px] leading-[1.3] text-sp-label pt-1 space-y-0.5">
        <div v-for="item in ['1 VU MODE', '2 ASSIGN VOICE', '3 LEVEL', '4 THRESHOLD SET', '5 SAMPLE LENGTH', '6 RE-SAMPLE', '7 ARM SAMPLING', '8 FORCE SAMPLING']" :key="item">{{ item }}</div>
      </div>
    </div>
  </div>
</template>
