<script setup lang="ts">
import type { VoiceId, SignalModule } from '~/types'

const props = defineProps<{
  voiceId: VoiceId
  modules: SignalModule[]
}>()

const store = useDrumMachineStore()

const moduleLabels: Record<string, string> = {
  bitcrusher: '12-BIT',
  drive: 'DRIVE',
  filter: 'SSM2044',
  compressor: 'COMP',
  delay: 'DELAY',
  reverb: 'REVERB'
}

function getModuleClass(module: SignalModule) {
  return [
    'px-2 py-1 border text-2xs uppercase tracking-wider cursor-pointer transition-colors duration-75',
    module.enabled
      ? 'bg-sp-raised border-sp-border-active text-sp-text'
      : 'bg-sp-bg border-sp-border text-sp-text-muted line-through opacity-50'
  ]
}
</script>

<template>
  <div class="flex items-center gap-0 overflow-x-auto p-1">
    <!-- Input -->
    <div class="px-2 py-1 bg-sp-bg border border-sp-border text-2xs text-sp-text-muted uppercase">
      IN
    </div>

    <!-- Connector -->
    <div class="w-2 h-px bg-sp-border" />

    <!-- Modules -->
    <template v-for="(module, index) in modules" :key="module.id">
      <button
        :class="getModuleClass(module)"
        @click="store.toggleModule(voiceId, module.id)"
      >
        {{ moduleLabels[module.type] || module.type }}
      </button>
      <div
        :class="[
          'w-2 h-px',
          module.enabled ? 'bg-sp-border-active' : 'bg-sp-border'
        ]"
      />
    </template>

    <!-- Output -->
    <div class="px-2 py-1 bg-sp-bg border border-sp-border text-2xs text-sp-text-muted uppercase">
      OUT
    </div>
  </div>
</template>
