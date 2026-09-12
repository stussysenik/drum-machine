import type { StudyDefinition } from '~/types'
import { pocket92 } from './pocket92'
import { abFourBarStory } from './abFourBarStory'

/**
 * Registry of all shipped studies. Source-controlled, versioned, editable.
 */
export const studies: StudyDefinition[] = [
  pocket92,
  abFourBarStory,
]

export function getStudyById(id: string): StudyDefinition | undefined {
  return studies.find(s => s.id === id)
}

export { pocket92, abFourBarStory }
