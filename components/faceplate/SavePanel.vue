<script setup lang="ts">
import { ref } from 'vue'
import { useDrumMachineStore } from '~/stores/drumMachine'
import { usePersistence } from '~/composables/usePersistence'

const store = useDrumMachineStore()
const persistence = usePersistence()

const showPanel = ref(false)
const importCode = ref('')
const exportCode = ref('')
const showExport = ref(false)

function togglePanel() {
  showPanel.value = !showPanel.value
  showExport.value = false
  exportCode.value = ''
  importCode.value = ''
}

function handleExport() {
  exportCode.value = persistence.exportToShareCode()
  showExport.value = true
}

function handleExportJSON() {
  const json = persistence.exportToJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sp1200-beat-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  if (!importCode.value.trim()) return

  try {
    if (importCode.value.trim().startsWith('{')) {
      persistence.importFromJSON(importCode.value.trim())
    } else {
      persistence.importFromShareCode(importCode.value.trim())
    }
    importCode.value = ''
    showPanel.value = false
  } catch (e) {
    alert('Invalid import code or file.')
  }
}

function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      persistence.importFromJSON(reader.result as string)
      showPanel.value = false
    } catch (e) {
      alert('Invalid beat file.')
    }
  }
  reader.readAsText(file)
  input.value = ''
}
</script>

<template>
  <div class="relative">
    <button
      class="sp-btn-param"
      :class="{ 'sp-btn-param-active': showPanel }"
      @click="togglePanel"
    >
      SAVE
    </button>

    <Transition name="slide-up">
      <div v-if="showPanel" class="save-panel">
        <div class="panel-header">
          <span class="panel-title">SAVE / LOAD</span>
          <button class="panel-close" @click="togglePanel">✕</button>
        </div>

        <!-- Export -->
        <div class="save-section">
          <button class="save-btn" @click="handleExport">
            📋 COPY SHARE CODE
          </button>
          <button class="save-btn" @click="handleExportJSON">
            💾 DOWNLOAD .JSON
          </button>
        </div>

        <!-- Export code display -->
        <div v-if="showExport && exportCode" class="code-display">
          <textarea
            :value="exportCode"
            readonly
            class="code-textarea"
            rows="3"
            @click="($event.target as HTMLTextAreaElement).select()"
          />
        </div>

        <!-- Import -->
        <div class="save-section">
          <label class="save-btn import-label">
            📂 LOAD FROM FILE
            <input
              type="file"
              accept=".json"
              class="hidden"
              @change="handleImportFile"
            />
          </label>
        </div>

        <div class="import-area">
          <textarea
            v-model="importCode"
            class="code-textarea"
            rows="2"
            placeholder="Paste share code..."
          />
          <button class="import-btn" @click="handleImport">
            ▶ IMPORT
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.save-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 220px;
  background: #2e2c28;
  border: 1px solid #4a4844;
  border-radius: 6px 6px 0 0;
  padding: 12px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.panel-title {
  font-family: 'Bahnschrift Condensed', sans-serif;
  font-size: 10px;
  color: #e8e4dc;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.panel-close {
  background: transparent;
  border: none;
  color: #6a6660;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
}

.save-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.save-btn {
  background: #4a4640;
  border: 1px solid #4e4c48;
  color: #e8e4dc;
  padding: 5px 8px;
  border-radius: 3px;
  font-size: 9px;
  cursor: pointer;
  font-family: 'Bahnschrift Condensed', sans-serif;
  letter-spacing: 0.05em;
  text-align: left;
}

.save-btn:active {
  background: #3a3630;
}

.import-label {
  display: block;
  text-align: center;
}

.code-display {
  margin-bottom: 8px;
}

.code-textarea {
  width: 100%;
  background: #1a1916;
  border: 1px solid #4e4c48;
  border-radius: 3px;
  color: #9aae3a;
  font-family: 'VT323', monospace;
  font-size: 11px;
  padding: 6px;
  resize: none;
  outline: none;
}

.code-textarea:focus {
  border-color: #9aae3a;
}

.import-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.import-btn {
  background: #4a4640;
  border: 1px solid #9aae3a;
  color: #9aae3a;
  padding: 4px;
  border-radius: 3px;
  font-size: 9px;
  cursor: pointer;
  font-family: 'Bahnschrift Condensed', sans-serif;
  letter-spacing: 0.1em;
}

.import-btn:active {
  background: #3a3630;
}

.hidden {
  display: none;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(8px);
  opacity: 0;
}
</style>
