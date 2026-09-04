<script setup lang="ts">
import type { VoiceParam } from '~/types'

const props = defineProps<{
  param: VoiceParam
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  (e: 'update', value: number): void
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-6 h-6'
    case 'lg': return 'w-10 h-10'
    default: return 'w-8 h-8'
  }
})

// Calculate rotation angle (0-100 maps to -135 to 135 degrees)
const rotation = computed(() => {
  const normalized = (props.param.value - props.param.min) / (props.param.max - props.param.min)
  return -135 + normalized * 270
})

// Drag handling
const isDragging = ref(false)
const startY = ref(0)
const startValue = ref(0)

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true
  startY.value = e.clientY
  startValue.value = props.param.value
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const delta = startY.value - e.clientY
  const range = props.param.max - props.param.min
  const sensitivity = range / 100
  const newValue = Math.round(startValue.value + delta * sensitivity)
  emit('update', Math.max(props.param.min, Math.min(props.param.max, newValue)))
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// Display value
const displayValue = computed(() => {
  if (props.param.unit) {
    return `${props.param.value}${props.param.unit}`
  }
  return props.param.value.toString()
})
</script>

<template>
  <div class="flex flex-col items-center gap-0.5">
    <!-- Knob -->
    <div
      :class="[
        'rounded-full bg-sp-raised border border-sp-border relative cursor-pointer select-none',
        sizeClass,
        isDragging ? 'border-sp-accent' : ''
      ]"
      @mousedown="handleMouseDown"
    >
      <!-- Indicator line -->
      <div
        class="absolute top-0.5 left-1/2 w-0.5 h-2 bg-sp-accent rounded-full origin-bottom"
        :style="{ transform: `translateX(-50%) rotate(${rotation}deg)`, transformOrigin: '50% 120%' }"
      />
      <!-- Center dot -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-1 h-1 rounded-full bg-sp-text-muted" />
      </div>
    </div>
    <!-- Label -->
    <span class="text-2xs text-sp-text-muted uppercase tracking-wider">{{ param.label }}</span>
    <!-- Value -->
    <span class="text-2xs text-sp-text-dim">{{ displayValue }}</span>
  </div>
</template>
