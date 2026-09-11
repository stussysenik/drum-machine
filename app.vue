<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { useSequencer } from '~/composables/useSequencer'
import { useKeyboard } from '~/composables/useKeyboard'
import { usePersistence } from '~/composables/usePersistence'
import Faceplate from '~/components/Faceplate.vue'

const store = useDrumMachineStore()
const sequencer = useSequencer()
const keyboard = useKeyboard()
const persistence = usePersistence()

// Auto-save interval
let autoSaveTimer: number | null = null

onMounted(async () => {
  // Load persisted session
  await persistence.loadSession()

  // Init keyboard
  keyboard.init()

  // Auto-save every 5 seconds when playing or after changes
  autoSaveTimer = window.setInterval(() => {
    persistence.saveSession()
  }, 5000)
})

onUnmounted(() => {
  keyboard.dispose()
  sequencer.dispose()
  if (autoSaveTimer) clearInterval(autoSaveTimer)
})
</script>

<template>
  <div class="app-root">
    <Faceplate />
  </div>
</template>

<style scoped>
.app-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1916;
  overflow: hidden;
}
</style>
