<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const closeButton = ref<HTMLButtonElement | null>(null)
const step = ref(0)
const slides = [
  ['WELCOME', 'THE SP-1200 WORKFLOW IS A SHORT LOOP: SELECT A BANK, STRIKE A PAD, THEN CAPTURE OR PROGRAM THE RHYTHM.'],
  ['PLAY', 'PADS 1–8 TRIGGER THE ACTIVE BANK. USE BANK SELECT TO REACH A–D; EACH PAD IS ASSIGNED TO A HARDWARE VOICE CHANNEL.'],
  ['SHAPE', 'IN MIX MODE, THE EIGHT FADERS SET CHANNEL LEVELS. TUNE / DECAY CHANGES THE SELECTED SOUND’S CHARACTER.'],
  ['SEQUENCE', 'PRESS RUN/STOP TO HEAR THE CURRENT SEGMENT. ENABLE RECORD, PLAY THE PADS, THEN USE PROGRAMMING KEYS FOR CORRECTION AND SWING.'],
]
const current = computed(() => slides[step.value])

function close() {
  emit('close')
}

function next() {
  if (step.value === slides.length - 1) close()
  else step.value += 1
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    step.value = 0
    await nextTick()
    closeButton.value?.focus()
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="tutorial-backdrop" role="presentation" @click.self="close">
      <section class="tutorial-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorial-title" @keydown.esc="close">
        <header class="tutorial-header">
          <span id="tutorial-title">SP-1200 QUICK START</span>
          <button ref="closeButton" type="button" aria-label="Close tutorial" @click="close">×</button>
        </header>
        <div class="tutorial-content">
          <span class="tutorial-step">{{ String(step + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}</span>
          <h2>{{ current[0] }}</h2>
          <p>{{ current[1] }}</p>
        </div>
        <footer>
          <button type="button" :disabled="step === 0" @click="step -= 1">BACK</button>
          <button type="button" @click="next">{{ step === slides.length - 1 ? 'PLAY' : 'NEXT' }}</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.tutorial-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: rgb(0 0 0 / .72); }
.tutorial-dialog { width: min(100%, 29rem); border: 2px solid #6caec4; background: #45434a; color: #f2f0eb; box-shadow: 0 1.5rem 4rem rgb(0 0 0 / .6); font-family: 'Bahnschrift Condensed', 'Arial Narrow', sans-serif; }
.tutorial-header, footer { display: flex; align-items: center; justify-content: space-between; padding: .6rem .75rem; border-bottom: 1px solid #6caec4; letter-spacing: .12em; font-size: .75rem; font-weight: 700; }
.tutorial-header button, footer button { border: 1px solid #b9b6ae; background: #eeece7; color: #202024; min-width: 3.75rem; min-height: 1.9rem; font: inherit; font-weight: 700; cursor: pointer; }
.tutorial-header button { min-width: 1.9rem; font-size: 1.25rem; line-height: 1; }
.tutorial-content { min-height: 11rem; padding: 1.5rem; }
.tutorial-step { color: #6caec4; font-family: monospace; font-size: .7rem; letter-spacing: .12em; }
h2 { margin: .65rem 0; font-size: 1.1rem; letter-spacing: .12em; }
p { margin: 0; color: #ddd9d1; font-size: .9rem; line-height: 1.55; }
footer { border-top: 1px solid #6caec4; border-bottom: 0; justify-content: flex-end; gap: .5rem; }
footer button:last-child { border-color: #6caec4; background: #6caec4; }
button:disabled { opacity: .35; cursor: default; }
</style>
