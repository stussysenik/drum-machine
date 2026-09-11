# SP-1200 Reference Dossier

## Mission

Build a browser instrument whose panel workflow, timing behaviour, and signal path are traceable to primary hardware documentation. A visual similarity pass is not proof of emulation: every claim must identify its reference and validation method.

## Authority Order

1. **1987 E-mu SP-1200 Service Manual** — front-panel diagram, operation, diagnostics, theory of operation, signal names, schematics, wiring, and parts list. Use for control labels, firmware behaviour, calibration, and circuit topology. Do not commit a copyrighted scan; acquire a licensed/owner-use copy and record its checksum locally.
2. **Reference unit photography** — geometry, silkscreen placement, material finish, proportions, and aging. Initial reference: `https://i.ebayimg.com/images/g/mLoAAOSwOgFn5zDQ/s-l1200.jpg` (captured 2026-09-11; marketplace images may disappear).
3. **Rossum SP-1200 documentation** — confirms the original-format 12-bit linear / 26.04 kHz sampling lineage, but is not authority for features added in the reissue. `https://www.rossum-electro.com/products/sp-1200`
4. **Independent circuit research** — use only to form hypotheses, then verify against the service manual, measurements, or a reference unit. Useful starting point: `https://ronnypries.de/music-production/musicDSP/DAC%20research/`.

## Locked Hardware Facts

| Area | Decision | Evidence / validation |
| --- | --- | --- |
| Digital format | 12-bit signed linear PCM at 26.041666 kHz | Service manual theory/schematics; Rossum product documentation |
| Pitching | Hardware-clocked sample skip/repeat with zero-order hold; no modern interpolation | Compare spectra of fixed test tones at several pitch ratios |
| Voice model | Eight monophonic playback channels, with voice allocation/stealing | Front-panel/manual workflow and trigger stress test |
| UI hierarchy | Flat graphite panel, cyan divider rules, silver top/bottom bands, square white switches, black square pads | Reference photograph plus service manual front-panel diagram |
| Input/output filtering | Must be modelled per documented analog path; never substitute an arbitrary "lo-fi" effect | Circuit-derived implementation and A/B measurements |

## Visual Measurement Protocol

1. Use a straight-on high-resolution photo and the service-manual front-panel drawing.
2. Normalize the inner panel to width `1000`; record x/y/w/h for each labelled control group in a layout table before moving components.
3. Treat the photographed unit as one specimen: preserve geometry, but do not generalize its cosmetic wear or watermark.
4. Compare at 948×832, 1024×768, and 1440×900. The complete machine must remain recognisable, and controls must remain usable via keyboard.

## DSP R&D Decision Tree

```text
Does a behaviour affect rendered audio?
├─ No → model it as UI/firmware state and validate against the operation manual.
└─ Yes → Is it digital and clocked?
   ├─ Yes → AudioWorklet, phase accumulator, 12-bit quantizer, deterministic test vectors.
   └─ No → Is the circuit topology/values documented?
      ├─ Yes → implement circuit-derived DSP, compare impulse/frequency response.
      └─ No → measure a reference unit, version the measurement, fit the smallest model.
```

## Current State and Next Gate

- **Now:** Phase 1 faceplate correction. The `SET-UP → DISK → SYNC → SAMPLE` order, flat panel language, performance layout, and tutorial are being aligned to the photo.
- **Next:** Produce a coordinate table from a clean front-on reference and replace approximate CSS grid proportions with those measurements.
- **Blocked intentionally:** Claiming a 1:1 analog filter or sequencer without captured unit measurements and deterministic audio tests.

## Research Log Template

Add each result to the active OpenSpec change with: source URL/document edition, accessed date, claim, confidence, affected module, test fixture, result, and remaining uncertainty.
