<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { lessons } from '~/data/lessons'
import { studies } from '~/data/studies'
import SongWorkbench from './SongWorkbench.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const store = useDrumMachineStore()

type Tab = 'learn' | 'songs'
const activeTab = ref<Tab>('learn')
const closeButton = ref<HTMLButtonElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)

// === LEARN TAB ===

const activeLessonId = computed(() => store.lessonRuntime.activeLessonId)

const activeLesson = computed(() =>
  lessons.find(l => l.id === activeLessonId.value)
)

const completedSteps = computed(() => {
  if (!activeLessonId.value) return []
  return store.lessonRuntime.completedSteps[activeLessonId.value] ?? []
})

const lessonProgress = computed(() => {
  if (!activeLesson.value) return 0
  return Math.round((completedSteps.value.length / activeLesson.value.steps.length) * 100)
})

const isLessonComplete = computed(() => {
  if (!activeLesson.value) return false
  return completedSteps.value.length >= activeLesson.value.steps.length
})

// Check if a lesson's capabilities are all available
const samplingReady = computed(() => store.samples.length > 0 || true) // Will be false until Phase 5
const songChainReady = computed(() => true) // Available after Phase 4

function isLessonBlocked(lesson: typeof lessons[number]): boolean {
  if (lesson.capability.includes('sampling') && !samplingReady.value) return true
  if (lesson.capability.includes('song-chain') && !songChainReady.value) return true
  return false
}

function selectLesson(lessonId: string) {
  store.setActiveLesson(lessonId)
}

function close() {
  emit('close')
}

function trapFocus(e: KeyboardEvent) {
  if (!dialogRef.value) return
  const focusable = dialogRef.value.querySelectorAll<HTMLElement>(
    'button, [tabindex]:not([tabindex="-1"])'
  )
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}

// Load a study into a new practice project
function loadStudy(studyId: string) {
  const study = studies.find(s => s.id === studyId)
  if (!study) return
  store.loadStudyDefinition(study)
  // Auto-select the associated lesson
  const associatedLesson = lessons.find(l => l.id.includes(study.id.split('-')[0]) || l.title.includes(study.title.split(' ')[0]))
  if (associatedLesson) {
    store.setActiveLesson(associatedLesson.id)
  }
  close()
}

// Mark a step complete (called by parent when state predicate matches)
function markStepComplete(stepId: string) {
  if (activeLessonId.value) {
    store.completeLessonStep(activeLessonId.value, stepId)
  }
}

// Expose for parent component integration
defineExpose({ markStepComplete })

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    activeTab.value = 'learn'
    await nextTick()
    closeButton.value?.focus()
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="learn-backdrop" role="presentation" @click.self="close">
      <section
        ref="dialogRef"
        class="learn-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="learn-title"
        @keydown.esc="close"
        @keydown="trapFocus"
      >
        <header class="learn-header">
          <span id="learn-title">SP-1200 COMPANION</span>
          <button ref="closeButton" type="button" aria-label="Close companion" @click="close">×</button>
        </header>

        <!-- Tabs -->
        <nav class="learn-tabs" role="tablist" aria-label="Companion sections">
          <button
            role="tab"
            :aria-selected="activeTab === 'learn'"
            class="learn-tab"
            :class="{ 'learn-tab-active': activeTab === 'learn' }"
            @click="activeTab = 'learn'"
          >
            LEARN
          </button>
          <button
            role="tab"
            :aria-selected="activeTab === 'songs'"
            class="learn-tab"
            :class="{ 'learn-tab-active': activeTab === 'songs' }"
            @click="activeTab = 'songs'"
          >
            SONGS
          </button>
        </nav>

        <!-- LEARN TAB -->
        <div v-if="activeTab === 'learn'" class="learn-content" role="tabpanel">
          <!-- Lesson list when none active -->
          <div v-if="!activeLesson" class="lesson-list">
            <div
              v-for="lesson in lessons"
              :key="lesson.id"
              class="lesson-card"
              :class="{ 'lesson-card-blocked': isLessonBlocked(lesson) }"
            >
              <div class="lesson-card-header">
                <span class="lesson-phase">P{{ lesson.phase }}</span>
                <span class="lesson-title-text">{{ lesson.title }}</span>
                <span class="lesson-duration">{{ lesson.durationMinutes }}min</span>
              </div>
              <p class="lesson-intent">{{ lesson.intent }}</p>
              <div class="lesson-card-footer">
                <span
                  v-for="cap in lesson.capability"
                  :key="cap"
                  class="lesson-capability"
                  :class="{ 'lesson-cap-unavailable': cap === 'sampling' && !samplingReady }"
                >
                  {{ cap }}
                </span>
                <button
                  v-if="!isLessonBlocked(lesson)"
                  class="lesson-start-btn"
                  @click="selectLesson(lesson.id)"
                >
                  START
                </button>
                <span v-else class="lesson-blocked-label">LOCKED</span>
              </div>
            </div>
          </div>

          <!-- Active lesson view -->
          <div v-else class="lesson-active">
            <button class="lesson-back-btn" @click="store.setActiveLesson(null)">← BACK</button>
            <h2 class="lesson-active-title">{{ activeLesson.title }}</h2>
            <p class="lesson-active-intent">{{ activeLesson.intent }}</p>

            <!-- Progress bar -->
            <div class="lesson-progress-bar" role="progressbar" :aria-valuenow="lessonProgress" aria-valuemin="0" aria-valuemax="100">
              <div class="lesson-progress-fill" :style="{ width: `${lessonProgress}%` }" />
            </div>
            <span class="lesson-progress-text">{{ completedSteps.length }}/{{ activeLesson.steps.length }} steps</span>

            <!-- Steps -->
            <ol class="lesson-steps">
              <li
                v-for="step in activeLesson.steps"
                :key="step.id"
                class="lesson-step"
                :class="{ 'lesson-step-done': completedSteps.includes(step.id) }"
              >
                <span class="lesson-step-status">
                  {{ completedSteps.includes(step.id) ? '✓' : '○' }}
                </span>
                <div class="lesson-step-content">
                  <span class="lesson-step-label">{{ step.label }}</span>
                  <span class="lesson-step-detail">{{ step.detail }}</span>
                </div>
              </li>
            </ol>

            <!-- Study loader for new-practice-project lessons -->
            <div v-if="activeLesson.setup === 'new-practice-project'" class="lesson-study-loader">
              <p class="lesson-study-label">LOAD STUDY:</p>
              <button
                v-for="study in studies"
                :key="study.id"
                class="lesson-study-btn"
                @click="loadStudy(study.id)"
              >
                {{ study.title }}
              </button>
            </div>

            <!-- Completion message -->
            <div v-if="isLessonComplete" class="lesson-complete">
              <span class="lesson-complete-icon">✓</span>
              <span>LESSON COMPLETE</span>
            </div>
          </div>
        </div>

        <!-- SONGS TAB -->
        <div v-if="activeTab === 'songs'" class="learn-content" role="tabpanel">
          <SongWorkbench />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.learn-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(0 0 0 / .72);
}

.learn-dialog {
  width: min(100%, 34rem);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border: 2px solid #6caec4;
  background: #45434a;
  color: #f2f0eb;
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / .6);
  font-family: 'Bahnschrift Condensed', 'Arial Narrow', sans-serif;
}

.learn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .6rem .75rem;
  border-bottom: 1px solid #6caec4;
  letter-spacing: .12em;
  font-size: .75rem;
  font-weight: 700;
}

.learn-header button {
  min-width: 1.9rem;
  min-height: 1.9rem;
  border: 1px solid #b9b6ae;
  background: #eeece7;
  color: #202024;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.learn-tabs {
  display: flex;
  border-bottom: 1px solid #6caec4;
}

.learn-tab {
  flex: 1;
  padding: .5rem;
  background: transparent;
  border: none;
  color: #9a9690;
  font-family: inherit;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .12em;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.learn-tab-active {
  color: #f2f0eb;
  border-bottom-color: #6caec4;
}

.learn-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* === LESSON LIST === */

.lesson-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-card {
  background: #3a3834;
  border: 1px solid #4a4844;
  border-radius: 4px;
  padding: 10px;
}

.lesson-card-blocked {
  opacity: .55;
}

.lesson-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.lesson-phase {
  font-family: 'VT323', monospace;
  font-size: 12px;
  color: #6caec4;
  width: 24px;
}

.lesson-title-text {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .05em;
}

.lesson-duration {
  font-size: 10px;
  color: #9a9690;
}

.lesson-intent {
  margin: 0 0 8px 0;
  font-size: 11px;
  color: #ccc8c0;
  line-height: 1.4;
}

.lesson-card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lesson-capability {
  font-size: 9px;
  padding: 1px 5px;
  background: #4a4844;
  border-radius: 2px;
  color: #9a9690;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.lesson-cap-unavailable {
  color: #ff6060;
  background: #4a2020;
}

.lesson-start-btn {
  margin-left: auto;
  background: #6caec4;
  border: none;
  color: #202024;
  padding: 3px 12px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .05em;
  cursor: pointer;
}

.lesson-blocked-label {
  margin-left: auto;
  font-size: 10px;
  color: #ff6060;
  letter-spacing: .1em;
}

/* === ACTIVE LESSON === */

.lesson-active {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-back-btn {
  align-self: flex-start;
  background: transparent;
  border: 1px solid #4e4c48;
  color: #9a9690;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 10px;
  cursor: pointer;
}

.lesson-active-title {
  margin: 0;
  font-size: 16px;
  letter-spacing: .05em;
}

.lesson-active-intent {
  margin: 0;
  font-size: 12px;
  color: #ccc8c0;
  line-height: 1.4;
}

.lesson-progress-bar {
  height: 6px;
  background: #2e2c28;
  border-radius: 3px;
  overflow: hidden;
}

.lesson-progress-fill {
  height: 100%;
  background: #9aae3a;
  transition: width .3s ease;
}

.lesson-progress-text {
  font-family: 'VT323', monospace;
  font-size: 12px;
  color: #9aae3a;
}

.lesson-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lesson-step {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  background: #3a3834;
  border-radius: 3px;
  border: 1px solid transparent;
}

.lesson-step-done {
  border-color: #9aae3a44;
  background: #2e3420;
}

.lesson-step-status {
  font-family: 'VT323', monospace;
  font-size: 16px;
  color: #9aae3a;
  width: 20px;
  text-align: center;
}

.lesson-step-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lesson-step-label {
  font-size: 12px;
  font-weight: 600;
}

.lesson-step-detail {
  font-size: 10px;
  color: #9a9690;
  line-height: 1.3;
}

.lesson-study-loader {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: #2e2c28;
  border-radius: 4px;
}

.lesson-study-label {
  margin: 0;
  font-size: 10px;
  color: #6caec4;
  letter-spacing: .1em;
  font-weight: 700;
}

.lesson-study-btn {
  background: #4a4640;
  border: 1px solid #4e4c48;
  color: #e8e4dc;
  padding: 6px 10px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  text-align: left;
}

.lesson-study-btn:hover {
  border-color: #6caec4;
}

.lesson-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #2e3420;
  border: 1px solid #9aae3a;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #9aae3a;
  letter-spacing: .1em;
}

.lesson-complete-icon {
  font-size: 18px;
}
</style>
