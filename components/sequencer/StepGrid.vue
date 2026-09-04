<script setup lang="ts">
import type { VoiceId, Step } from '~/types'

const props = defineProps<{
  voiceId: VoiceId
  steps: Step[]
  currentStep: number
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', index: number): void
  (e: 'select-voice'): void
}>()

const store = useDrumMachineStore()

function getStepClass(step: Step, index: number) {
  const isPlaying = store.playing && store.currentStep === index
  return [
    'aspect-square border cursor-pointer transition-colors duration-50',
    step.active
      ? isPlaying
        ? 'bg-sp-accent-bright border-sp-accent-bright shadow-[0_0_4px_rgba(212,200,106,0.5)]'
        : 'bg-sp-accent border-sp-accent'
      : isPlaying
        ? 'bg-sp-active border-sp-accent'
        : 'bg-sp-pad border-sp-raised hover:border-sp-border-active'
  ]
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Voice label -->
    <button
      :class="[
        'w-10 text-2xs uppercase tracking-wider text-left cursor-pointer',
        isSelected ? 'text-sp-accent' : 'text-sp-text-dim hover:text-sp-text'
      ]"
      @click="emit('select-voice')"
    >
      {{ voiceId }}
    </button>

    <!-- Step buttons -->
    <div class="flex gap-0.5 flex-1">
      <button
        v-for="(step, index) in steps"
        :key="index"
        :class="getStepClass(step, index)"
        :style="{ width: '100%', maxWidth: '28px' }"
        @click="emit('toggle', index)"
      />
    </div>

    <!-- Level/mute -->
    <div class="flex items-center gap-1">
      <button
        :class="[
          'w-4 h-4 border text-2xs flex items-center justify-center',
          store.voices[voiceId].muted
            ? 'bg-sp-meter-clip border-sp-meter-clip text-sp-bg'
            : 'bg-sp-raised border-sp-border text-sp-text-dim'
        ]"
        @click="store.toggleMute(voiceId)"
        title="Mute"
      >
        {{ store.voices[voiceId].muted ? 'M' : '' }}
      </button>
      <button
        :class="[
          'w-4 h-4 border text-2xs flex items-center justify-center',
          store.voices[voiceId].solo
            ? 'bg-sp-accent border-sp-accent text-sp-bg'
            : 'bg-sp-raised border-sp-border text-sp-text-dim'
        ]"
        @click="store.toggleSolo(voiceId)"
        title="Solo"
      >
        {{ store.voices[voiceId].solo ? 'S' : '' }}
      </button>
    </div>
  </div>
</template>
