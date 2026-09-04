<script setup lang="ts">
import { useDrumMachineStore } from '~/stores/drumMachine'
import { useKeyboard } from '~/composables/useKeyboard'
import { useSequencer } from '~/composables/useSequencer'
import DrumPad from '~/components/ui/DrumPad.vue'
import StepGrid from '~/components/sequencer/StepGrid.vue'
import Knob from '~/components/ui/Knob.vue'
import SignalChain from '~/components/ui/SignalChain.vue'

const store = useDrumMachineStore()
const keyboard = useKeyboard()
const sequencer = useSequencer()

onMounted(() => {
  keyboard.init()
})

onUnmounted(() => {
  keyboard.dispose()
  sequencer.dispose()
})
</script>

<template>
  <div class="h-screen w-screen bg-sp-bg text-sp-text font-mono overflow-hidden flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-2 border-b border-sp-border bg-sp-surface">
      <div class="flex items-center gap-4">
        <h1 class="text-sm font-semibold tracking-wider text-sp-accent uppercase">SP-1200</h1>
        <span class="text-xs text-sp-text-muted">Essentialist Drum Machine</span>
      </div>
      <div class="flex items-center gap-4">
        <div class="hw-display">
          {{ store.bpm }} BPM | SWING {{ store.swing }}% | STEP {{ store.currentStep + 1 }}/16
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Voice Pads -->
      <aside class="w-48 border-r border-sp-border bg-sp-surface p-2 flex flex-col gap-2">
        <div class="hw-label">Voices</div>
        <div class="grid grid-cols-2 gap-1">
          <DrumPad
            v-for="(voice, id) in store.voices"
            :key="id"
            :voice-id="id"
            :voice="voice"
            :is-selected="store.selectedVoice === id"
            :is-playing="false"
          />
        </div>
      </aside>

      <!-- Center - Step Sequencer -->
      <section class="flex-1 flex flex-col p-2 gap-2 overflow-auto">
        <div class="hw-label">Step Sequencer</div>
        <div class="flex flex-col gap-1">
          <StepGrid
            v-for="(steps, voiceId) in store.pattern.steps"
            :key="voiceId"
            :voice-id="voiceId"
            :steps="steps"
            :current-step="store.currentStep"
            :is-selected="store.selectedVoice === voiceId"
          />
        </div>
      </section>

      <!-- Right Panel - Controls -->
      <aside class="w-64 border-l border-sp-border bg-sp-surface p-2 flex flex-col gap-4 overflow-auto">
        <!-- Voice Parameters -->
        <div>
          <div class="hw-label">{{ store.voices[store.selectedVoice].label }} Parameters</div>
          <div class="grid grid-cols-4 gap-2">
            <Knob
              v-for="(param, key) in store.voices[store.selectedVoice].params"
              :key="key"
              :param="param"
              @update="(v) => store.setVoiceParam(store.selectedVoice, key, v)"
            />
          </div>
        </div>

        <!-- Signal Chain -->
        <div>
          <div class="hw-label">Signal Chain - {{ store.selectedVoice.toUpperCase() }}</div>
          <SignalChain
            :voice-id="store.selectedVoice"
            :modules="store.signalChains[store.selectedVoice].modules"
          />
        </div>

        <!-- Transport -->
        <div>
          <div class="hw-label">Transport</div>
          <div class="flex gap-2">
            <button
              :class="['hw-btn', store.playing ? 'hw-btn-active' : '']"
              @click="sequencer.toggle()"
            >
              {{ store.playing ? 'Stop' : 'Play' }}
            </button>
            <button class="hw-btn" @click="store.clearPattern()">Clear</button>
            <button class="hw-btn" @click="store.randomizePattern()">Random</button>
          </div>
        </div>

        <!-- BPM Control -->
        <div>
          <div class="hw-label">Tempo</div>
          <div class="flex items-center gap-2">
            <input
              type="range"
              :value="store.bpm"
              min="60"
              max="180"
              class="flex-1"
              @input="store.setBpm(Number(($event.target as HTMLInputElement).value))"
            />
            <span class="text-xs text-sp-text-dim w-10">{{ store.bpm }}</span>
          </div>
        </div>

        <!-- Swing Control -->
        <div>
          <div class="hw-label">Swing</div>
          <div class="flex items-center gap-2">
            <input
              type="range"
              :value="store.swing"
              min="50"
              max="75"
              class="flex-1"
              @input="store.setSwing(Number(($event.target as HTMLInputElement).value))"
            />
            <span class="text-xs text-sp-text-dim w-10">{{ store.swing }}%</span>
          </div>
        </div>
      </aside>
    </main>

    <!-- Footer - Help -->
    <footer class="px-4 py-1 border-t border-sp-border bg-sp-surface text-xs text-sp-text-muted flex gap-4">
      <span>SPACE: Play/Stop</span>
      <span>Q-W-E-R-T-Y: Trigger Voices</span>
      <span>1-5: Views</span>
      <span>[: BPM Down</span>
      <span>]: BPM Up</span>
      <span>,: Swing Down</span>
      <span>.: Swing Up</span>
      <span>TAB: Next Voice</span>
      <span>DEL: Clear</span>
      <span>ENT: Randomize</span>
    </footer>
  </div>
</template>
