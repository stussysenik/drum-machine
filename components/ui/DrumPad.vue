<script setup lang="ts">
import type { VoiceId, DrumVoice } from '~/types'

const props = defineProps<{
  voiceId: VoiceId
  voice: DrumVoice
  isSelected: boolean
  isPlaying: boolean
}>()

const emit = defineEmits<{
  (e: 'trigger'): void
  (e: 'select'): void
  (e: 'mute'): void
  (e: 'solo'): void
}>()

const audio = useAudioEngine()

function handleClick() {
  emit('trigger')
  emit('select')
}
</script>

<template>
  <button
    :class="[
      'w-16 h-16 border flex flex-col items-center justify-center cursor-pointer transition-colors duration-50',
      'text-2xs uppercase tracking-tight',
      isPlaying
        ? 'bg-sp-accent-bright text-sp-bg border-sp-accent-bright'
        : isSelected
          ? 'bg-sp-pad-active text-sp-text border-sp-border-active'
          : 'bg-sp-pad text-sp-text-dim border-sp-border hover:border-sp-border-active'
    ]"
    @click="handleClick"
    @contextmenu.prevent="emit('mute')"
  >
    <span class="font-medium">{{ voice.label }}</span>
    <div class="flex gap-1 mt-1">
      <span
        v-if="voice.muted"
        class="text-sp-meter-clip"
      >M</span>
      <span
        v-if="voice.solo"
        class="text-sp-accent"
      >S</span>
    </div>
  </button>
</template>
