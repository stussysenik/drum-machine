// SP-1200 Audio Engine - Rust/WASM
// Emulates physical constraints: 12-bit DAC, 26.04kHz, SSM2044 filters, analog signal path

use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

// === PHYSICAL CONSTANTS ===
const BIT_DEPTH: u32 = 12;
const QUANTIZE_LEVELS: f32 = 4096.0; // 2^12
const SAMPLE_RATE: f32 = 26040.0; // SP-1200 native rate
const MAX_SAMPLE_TIME: f32 = 10.0; // 10 seconds total
const MAX_VOICES: usize = 12;

// === 12-BIT DAC EMULATION ===
// Models the actual quantization behavior of the SP-1200's DAC
#[wasm_bindgen]
pub struct Dac12Bit {
    levels: f32,
    noise_floor: f32,
    linearity_error: f32,
}

#[wasm_bindgen]
impl Dac12Bit {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            levels: QUANTIZE_LEVELS,
            noise_floor: 0.0001, // -80dB noise floor
            linearity_error: 0.002, // 0.2% linearity error
        }
    }

    // Quantize with proper 12-bit DAC characteristics
    pub fn process(&self, input: f32) -> f32 {
        // Add dithering noise (TPDF dither)
        let dither = (js_sys::Math::random() as f32 - js_sys::Math::random() as f32) / self.levels;
        
        // Quantize to 12-bit levels
        let quantized = ((input + dither) * self.levels).round() / self.levels;
        
        // Add linearity error (simulates imperfect resistor ladder)
        let error = (js_sys::Math::random() as f32 - 0.5) * self.linearity_error;
        
        // Add noise floor
        let noise = (js_sys::Math::random() as f32 - 0.5) * self.noise_floor;
        
        quantized + error + noise
    }
}

// === SSM2044 ANALOG FILTER ===
// 4-pole lowpass with analog characteristics
#[wasm_bindgen]
pub struct Ssm2044Filter {
    cutoff: f32,
    resonance: f32,
    // State variables for 4-pole filter
    stage1: f32,
    stage2: f32,
    stage3: f32,
    stage4: f32,
    // Analog characteristics
    saturation: f32,
    temperature_drift: f32,
}

#[wasm_bindgen]
impl Ssm2044Filter {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            cutoff: 1000.0,
            resonance: 1.0,
            stage1: 0.0,
            stage2: 0.0,
            stage3: 0.0,
            stage4: 0.0,
            saturation: 0.8,
            temperature_drift: 0.0001,
        }
    }

    pub fn set_cutoff(&mut self, cutoff: f32) {
        self.cutoff = cutoff.clamp(20.0, 20000.0);
    }

    pub fn set_resonance(&mut self, resonance: f32) {
        self.resonance = resonance.clamp(0.1, 20.0);
    }

    // Process single sample through 4-pole filter
    pub fn process(&mut self, input: f32) -> f32 {
        // Calculate filter coefficient (Moog-style)
        let fc = self.cutoff / SAMPLE_RATE;
        let f = 2.0 * fc;
        let k = 3.6 * f - 1.6 * f * f - 1.0; // Empirical tuning
        let p = (k + 1.0) * 0.5;
        let scale = (p * p).exp();
        
        // Feedback amount based on resonance
        let feedback = self.resonance * (1.0 - 0.15 * f);
        
        // 4-pole cascade with saturation
        let input_sat = self.soft_clip(input * scale);
        
        self.stage1 = self.stage1 + p * (input_sat - self.stage1 + feedback * (self.stage1 - self.stage2));
        self.stage1 = self.soft_clip(self.stage1);
        
        self.stage2 = self.stage2 + p * (self.stage1 - self.stage2);
        self.stage2 = self.soft_clip(self.stage2);
        
        self.stage3 = self.stage3 + p * (self.stage2 - self.stage3);
        self.stage3 = self.soft_clip(self.stage3);
        
        self.stage4 = self.stage4 + p * (self.stage3 - self.stage4);
        self.stage4 = self.soft_clip(self.stage4);
        
        self.stage4
    }

    // Soft clipping - analog saturation characteristic
    fn soft_clip(&self, x: f32) -> f32 {
        if x > 1.0 {
            1.0 - (-x).exp() * 0.3679 // tanh-like saturation
        } else if x < -1.0 {
            -1.0 + x.exp() * 0.3679
        } else {
            x - (x * x * x) / 3.0 // Gentle saturation
        }
    }

    pub fn reset(&mut self) {
        self.stage1 = 0.0;
        self.stage2 = 0.0;
        self.stage3 = 0.0;
        self.stage4 = 0.0;
    }
}

// === ANALOG DRIVE CIRCUIT ===
// Models the SP-1200's analog drive stage
#[wasm_bindgen]
pub struct AnalogDrive {
    amount: f32,
    asymmetry: f32,
    harmonics: f32,
}

#[wasm_bindgen]
impl AnalogDrive {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            amount: 0.0,
            asymmetry: 0.1, // Slight asymmetry (tube-like)
            harmonics: 0.5,
        }
    }

    pub fn set_amount(&mut self, amount: f32) {
        self.amount = amount.clamp(0.0, 1.0);
    }

    pub fn process(&self, input: f32) -> f32 {
        if self.amount < 0.001 {
            return input;
        }

        let drive = 1.0 + self.amount * 15.0;
        let x = input * drive;
        
        // Asymmetric saturation (even + odd harmonics)
        let saturated = if x >= 0.0 {
            x / (1.0 + x * (1.0 - self.asymmetry))
        } else {
            x / (1.0 - x * (1.0 + self.asymmetry))
        };
        
        // Mix dry/wet
        input * (1.0 - self.amount) + saturated * self.amount
    }
}

// === ENVELOPE GENERATOR ===
// Analog ADSR with SP-1200 characteristics
#[wasm_bindgen]
pub struct AnalogEnvelope {
    attack: f32,
    decay: f32,
    sustain: f32,
    release: f32,
    state: EnvelopeState,
    value: f32,
    sample_rate: f32,
}

#[derive(Clone, Copy)]
enum EnvelopeState {
    Idle,
    Attack,
    Decay,
    Sustain,
    Release,
}

#[wasm_bindgen]
impl AnalogEnvelope {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            attack: 0.002,
            decay: 0.1,
            sustain: 0.7,
            release: 0.05,
            state: EnvelopeState::Idle,
            value: 0.0,
            sample_rate: SAMPLE_RATE,
        }
    }

    pub fn set_attack(&mut self, attack: f32) {
        self.attack = attack.clamp(0.001, 2.0);
    }

    pub fn set_decay(&mut self, decay: f32) {
        self.decay = decay.clamp(0.001, 3.0);
    }

    pub fn set_sustain(&mut self, sustain: f32) {
        self.sustain = sustain.clamp(0.0, 1.0);
    }

    pub fn set_release(&mut self, release: f32) {
        self.release = release.clamp(0.001, 5.0);
    }

    pub fn trigger(&mut self) {
        self.state = EnvelopeState::Attack;
    }

    pub fn release(&mut self) {
        self.state = EnvelopeState::Release;
    }

    pub fn process(&mut self) -> f32 {
        match self.state {
            EnvelopeState::Idle => self.value = 0.0,
            EnvelopeState::Attack => {
                // Exponential attack (analog characteristic)
                let rate = 1.0 - (-1.0 / (self.attack * self.sample_rate)).exp();
                self.value += rate * (1.0 - self.value);
                if self.value >= 0.99 {
                    self.value = 1.0;
                    self.state = EnvelopeState::Decay;
                }
            }
            EnvelopeState::Decay => {
                // Exponential decay
                let rate = 1.0 - (-1.0 / (self.decay * self.sample_rate)).exp();
                self.value -= rate * (self.value - self.sustain);
                if self.value <= self.sustain + 0.001 {
                    self.value = self.sustain;
                    self.state = EnvelopeState::Sustain;
                }
            }
            EnvelopeState::Sustain => {
                self.value = self.sustain;
            }
            EnvelopeState::Release => {
                let rate = 1.0 - (-1.0 / (self.release * self.sample_rate)).exp();
                self.value -= rate * self.value;
                if self.value < 0.001 {
                    self.value = 0.0;
                    self.state = EnvelopeState::Idle;
                }
            }
        }
        self.value
    }
}

// === DRUM VOICE ===
// Complete drum voice with synthesis and analog signal path
#[wasm_bindgen]
pub struct DrumVoice {
    voice_type: VoiceId,
    tune: f32,
    decay: f32,
    level: f32,
    drive: f32,
    filter_cutoff: f32,
    filter_resonance: f32,
    // Signal chain
    dac: Dac12Bit,
    filter: Ssm2044Filter,
    drive_stage: AnalogDrive,
    envelope: AnalogEnvelope,
    // Oscillator state
    phase: f32,
    frequency: f32,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Serialize, Deserialize)]
pub enum VoiceId {
    Bd, Sd, Lt, Mt, Ht, Rs, Cp, Cb, Cy, Oh, Ch, Cl,
}

#[wasm_bindgen]
impl DrumVoice {
    #[wasm_bindgen(constructor)]
    pub fn new(voice_type: VoiceId) -> Self {
        let mut voice = Self {
            voice_type,
            tune: 0.5,
            decay: 0.5,
            level: 0.8,
            drive: 0.2,
            filter_cutoff: 0.7,
            filter_resonance: 0.3,
            dac: Dac12Bit::new(),
            filter: Ssm2044Filter::new(),
            drive_stage: AnalogDrive::new(),
            envelope: AnalogEnvelope::new(),
            phase: 0.0,
            frequency: 60.0,
        };
        voice.update_params();
        voice
    }

    fn update_params(&mut self) {
        // Map 0-100 params to actual values
        let tune = self.tune;
        let decay = self.decay;
        let drive = self.drive;
        let cutoff = self.filter_cutoff;
        let resonance = self.filter_resonance;

        // Set filter
        self.filter.set_cutoff(cutoff * 19980.0 + 20.0);
        self.filter.set_resonance(resonance * 19.0 + 0.5);

        // Set drive
        self.drive_stage.set_amount(drive);

        // Set envelope based on voice type
        match self.voice_type {
            VoiceId::Bd => {
                self.frequency = 30.0 + tune * 50.0;
                self.envelope.set_attack(0.002);
                self.envelope.set_decay(0.1 + decay * 0.4);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.05);
            }
            VoiceId::Sd => {
                self.frequency = 150.0 + tune * 100.0;
                self.envelope.set_attack(0.001);
                self.envelope.set_decay(0.05 + decay * 0.2);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.03);
            }
            VoiceId::Lt | VoiceId::Mt | VoiceId::Ht => {
                let base_freq = match self.voice_type {
                    VoiceId::Lt => 60.0,
                    VoiceId::Mt => 100.0,
                    VoiceId::Ht => 150.0,
                    _ => 100.0,
                };
                self.frequency = base_freq + tune * 80.0;
                self.envelope.set_attack(0.002);
                self.envelope.set_decay(0.1 + decay * 0.3);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.05);
            }
            VoiceId::Rs => {
                self.frequency = 800.0;
                self.envelope.set_attack(0.001);
                self.envelope.set_decay(0.02);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.01);
            }
            VoiceId::Cp => {
                self.frequency = 1200.0;
                self.envelope.set_attack(0.001);
                self.envelope.set_decay(0.03 + decay * 0.1);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.02);
            }
            VoiceId::Cb => {
                self.frequency = 800.0;
                self.envelope.set_attack(0.001);
                self.envelope.set_decay(0.1 + decay * 0.2);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.05);
            }
            VoiceId::Cy => {
                self.frequency = 5000.0;
                self.envelope.set_attack(0.001);
                self.envelope.set_decay(0.2 + decay * 0.5);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.1);
            }
            VoiceId::Oh => {
                self.frequency = 8000.0;
                self.envelope.set_attack(0.001);
                self.envelope.set_decay(0.15 + decay * 0.3);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.08);
            }
            VoiceId::Ch => {
                self.frequency = 8000.0;
                self.envelope.set_attack(0.001);
                self.envelope.set_decay(0.03 + decay * 0.08);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.02);
            }
            VoiceId::Cl => {
                self.frequency = 2000.0;
                self.envelope.set_attack(0.001);
                self.envelope.set_decay(0.005);
                self.envelope.set_sustain(0.0);
                self.envelope.set_release(0.005);
            }
        }
    }

    pub fn set_tune(&mut self, tune: f32) {
        self.tune = tune.clamp(0.0, 1.0);
        self.update_params();
    }

    pub fn set_decay(&mut self, decay: f32) {
        self.decay = decay.clamp(0.0, 1.0);
        self.update_params();
    }

    pub fn set_level(&mut self, level: f32) {
        self.level = level.clamp(0.0, 1.0);
    }

    pub fn set_drive(&mut self, drive: f32) {
        self.drive = drive.clamp(0.0, 1.0);
        self.update_params();
    }

    pub fn set_filter(&mut self, cutoff: f32) {
        self.filter_cutoff = cutoff.clamp(0.0, 1.0);
        self.update_params();
    }

    pub fn set_resonance(&mut self, resonance: f32) {
        self.filter_resonance = resonance.clamp(0.0, 1.0);
        self.update_params();
    }

    pub fn trigger(&mut self) {
        self.envelope.trigger();
        self.phase = 0.0;
    }

    // Generate next sample
    pub fn process(&mut self) -> f32 {
        let env = self.envelope.process();
        
        if env < 0.001 {
            return 0.0;
        }

        // Generate oscillator signal
        let signal = match self.voice_type {
            VoiceId::Bd | VoiceId::Lt | VoiceId::Mt | VoiceId::Ht => {
                // Sine wave with pitch sweep
                let sweep = 1.0 - env * 0.3;
                self.phase += (self.frequency * sweep) / SAMPLE_RATE;
                self.phase.sin()
            }
            VoiceId::Sd => {
                // Triangle + noise
                self.phase += self.frequency / SAMPLE_RATE;
                let tri = (self.phase.fract() * 4.0 - 2.0).abs() - 1.0;
                let noise = (js_sys::Math::random() as f32 * 2.0 - 1.0) * env;
                tri * 0.6 + noise * 0.4
            }
            VoiceId::Rs => {
                // Short triangle
                self.phase += self.frequency / SAMPLE_RATE;
                (self.phase.fract() * 4.0 - 2.0).abs() - 1.0
            }
            VoiceId::Cp => {
                // Noise bursts
                (js_sys::Math::random() as f32 * 2.0 - 1.0)
            }
            VoiceId::Cb => {
                // Dual square waves
                self.phase += self.frequency / SAMPLE_RATE;
                let s1 = if self.phase.fract() < 0.5 { 1.0 } else { -1.0 };
                let s2 = if (self.phase * 1.5).fract() < 0.5 { 1.0 } else { -1.0 };
                (s1 + s2) * 0.5
            }
            VoiceId::Cy | VoiceId::Oh | VoiceId::Ch => {
                // Filtered noise
                (js_sys::Math::random() as f32 * 2.0 - 1.0)
            }
            VoiceId::Cl => {
                // Short click
                self.phase += self.frequency / SAMPLE_RATE;
                if self.phase < 0.01 { 1.0 } else { 0.0 }
            }
        };

        // Apply envelope
        let shaped = signal * env;

        // Signal chain: filter -> drive -> DAC
        let filtered = self.filter.process(shaped);
        let driven = self.drive_stage.process(filtered);
        let output = self.dac.process(driven * self.level);

        output
    }

    pub fn is_active(&self) -> bool {
        self.envelope.value > 0.001
    }
}

// === MIXER ===
// Analog mixing bus with crosstalk
#[wasm_bindgen]
pub struct AnalogMixer {
    voices: Vec<DrumVoice>,
    master_level: f32,
    crosstalk: f32,
    bus_compression: f32,
}

#[wasm_bindgen]
impl AnalogMixer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let voice_types = vec![
            VoiceId::Bd, VoiceId::Sd, VoiceId::Lt, VoiceId::Mt,
            VoiceId::Ht, VoiceId::Rs, VoiceId::Cp, VoiceId::Cb,
            VoiceId::Cy, VoiceId::Oh, VoiceId::Ch, VoiceId::Cl,
        ];
        
        Self {
            voices: voice_types.into_iter().map(DrumVoice::new).collect(),
            master_level: 0.8,
            crosstalk: 0.02, // 2% crosstalk between adjacent channels
            bus_compression: 0.1,
        }
    }

    pub fn trigger_voice(&mut self, index: usize) {
        if index < self.voices.len() {
            self.voices[index].trigger();
        }
    }

    pub fn set_voice_param(&mut self, index: usize, param: &str, value: f32) {
        if index >= self.voices.len() {
            return;
        }
        let voice = &mut self.voices[index];
        match param {
            "tune" => voice.set_tune(value),
            "decay" => voice.set_decay(value),
            "level" => voice.set_level(value),
            "drive" => voice.set_drive(value),
            "filter" => voice.set_filter(value),
            "resonance" => voice.set_resonance(value),
            _ => {}
        }
    }

    pub fn set_master_level(&mut self, level: f32) {
        self.master_level = level.clamp(0.0, 1.0);
    }

    // Process all voices and mix
    pub fn process(&mut self) -> f32 {
        let mut mix = 0.0;
        let mut prev_sample = 0.0;

        for voice in self.voices.iter_mut() {
            let sample = voice.process();
            
            // Add crosstalk from previous channel
            let with_crosstalk = sample + prev_sample * self.crosstalk;
            prev_sample = sample;
            
            mix += with_crosstalk;
        }

        // Bus compression (soft knee)
        if mix.abs() > 0.8 {
            let excess = mix.abs() - 0.8;
            let compressed = 0.8 + excess / (1.0 + excess * 5.0);
            mix = mix.signum() * compressed;
        }

        // Master level
        mix * self.master_level
    }

    pub fn get_voice_level(&self, index: usize) -> f32 {
        if index < self.voices.len() {
            self.voices[index].envelope.value
        } else {
            0.0
        }
    }
}

// === SEQUENCER ===
#[wasm_bindgen]
pub struct Sequencer {
    pattern: Vec<Vec<bool>>, // [voice][step]
    current_step: usize,
    length: usize,
    swing: f32,
    bpm: f32,
}

#[wasm_bindgen]
impl Sequencer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            pattern: vec![vec![false; 16]; 12],
            current_step: 0,
            length: 16,
            swing: 0.52,
            bpm: 90.0,
        }
    }

    pub fn toggle_step(&mut self, voice: usize, step: usize) {
        if voice < 12 && step < self.length {
            self.pattern[voice][step] = !self.pattern[voice][step];
        }
    }

    pub fn set_step(&mut self, voice: usize, step: usize, active: bool) {
        if voice < 12 && step < self.length {
            self.pattern[voice][step] = active;
        }
    }

    pub fn advance(&mut self) -> usize {
        let step = self.current_step;
        self.current_step = (self.current_step + 1) % self.length;
        step
    }

    pub fn get_current_step(&self) -> usize {
        self.current_step
    }

    pub fn get_active_voices(&self, step: usize) -> Vec<usize> {
        let mut active = Vec::new();
        for voice in 0..12 {
            if self.pattern[voice][step] {
                active.push(voice);
            }
        }
        active
    }

    pub fn set_bpm(&mut self, bpm: f32) {
        self.bpm = bpm.clamp(60.0, 180.0);
    }

    pub fn set_swing(&mut self, swing: f32) {
        self.swing = swing.clamp(0.5, 0.75);
    }

    pub fn clear(&mut self) {
        for voice in self.pattern.iter_mut() {
            for step in voice.iter_mut() {
                *step = false;
            }
        }
    }

    pub fn clear_voice(&mut self, voice: usize) {
        if voice < 12 {
            for step in self.pattern[voice].iter_mut() {
                *step = false;
            }
        }
    }
}

// === WASM INITIALIZATION ===
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
