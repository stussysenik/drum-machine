## ADDED Requirements

### Requirement: Versioned learning and practice-project persistence

The local project representation SHALL include a schema version, project name, project source, and lesson progress in serializable form. It SHALL migrate prior persisted machine state without serializing audio buffers.

#### Scenario: Learner resumes after reload

- **WHEN** a learner reloads the application after completing a lesson in a named practice project
- **THEN** the project and its recognized lesson progress are restored
- **AND** samples continue to use the existing binary/audio persistence path rather than JSON lesson state.

