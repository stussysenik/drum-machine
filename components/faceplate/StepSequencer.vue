<script setup lang="ts">
import { computed } from 'vue'
import type { VoiceChannel, StepData } from '~/types'
import { useDrumMachineStore } from '~/stores/drumMachine'

const store = useDrumMachineStore()

// Display steps for the currently selected pad's voice channel
const voiceChannel = computed<VoiceChannel>(() => store.selectedPad % 8 as VoiceChannel)

const steps = computed(() => {
  const pattern = store.activePattern
  return pattern.steps[voiceChannel.value]
})

function getStepClass(step: StepData, index: number) {
  const isPlayhead = store.playing && store.currentStep === index

  if (isPlayhead) return 'sp-step-playhead'
  if (step.active) return 'sp-step-active'
  return 'sp-step-empty'
}

function toggleStep(index: number) {
  store.toggleStep(voiceChannel.value, index)
}
</script>

<template>
  <div class="flex items-center gap-3 w-full">
    <!-- Voice label -->
    <div class="w-16 text-right">
      <span class="text-[10px] font-silkscreen uppercase tracking-wider text-label-dim">
        CH {{ voiceChannel + 1 }}
      </span>
    </div>

    <!-- 16 step buttons -->
    <div class="flex gap-[3px] flex-1">
      <button
        v-for="(step, index) in steps"
        :key="index"
        class="sp-step-btn flex-1 h-[28px]"
        :class="getStepClass(step, index)"
        :title="`Step ${index + 1}`"
        @click="toggleStep(index)"
      />
    </div>
  </div>
</template>

<style scoped>
.sp-step-btn {
  transition: background-color 0.04s ease, box-shadow 0.04s ease;
}

.sp-step-empty {
  background: #2e2c28;
  border-color: #2e2c28;
}

.sp-step-active {
  background: #aa1010;
  border-color: #aa1010;
}

.sp-step-playhead {
  background: #ff2020;
  border-color: #ff2020;
  box-shadow: 0 0 6px rgba(255, 32, 32, 0.6);
}
</style>
