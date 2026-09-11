<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PadId } from '~/types'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { useAudioEngine } from '~/composables/useAudioEngine'

const props = defineProps<{
  padId: PadId
  label: string
}>()

const store = useDrumMachineStore()
const audio = useAudioEngine()

const isPressed = ref(false)

const isSelected = computed(() => store.selectedPad === props.padId)
const hasSample = computed(() => audio.hasSample(props.padId))

function handlePointerDown(e: PointerEvent) {
  e.preventDefault()
  isPressed.value = true
  store.selectPad(props.padId)
  audio.triggerPad(props.padId)
}

function handlePointerUp() {
  isPressed.value = false
}

function handlePointerLeave() {
  isPressed.value = false
}
</script>

<template>
  <button
    class="sp-pad-btn w-[68px] h-[68px] flex flex-col items-center justify-center gap-1"
    :class="{
      'scale-[0.96] bg-sp-pad-press': isPressed,
      'ring-2 ring-sp-pad-glow/60': isPressed,
    }"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerLeave"
  >
    <!-- Label (silkscreen) -->
    <span class="sp-pad-label text-[9px]">
      {{ hasSample ? label : '—' }}
    </span>
    <!-- Pad number -->
    <span class="text-[8px] text-label-dim/50 font-mono">
      {{ padId < 8 ? padId + 1 : padId - 7 }}
    </span>
  </button>
</template>

<style scoped>
.sp-pad-btn {
  position: relative;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.04s ease, box-shadow 0.04s ease;
}

.sp-pad-btn:active {
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.5),
    0 0 8px rgba(204, 48, 48, 0.3);
}
</style>
