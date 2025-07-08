export const loadAudioWorklet = async (audioContext: AudioContext) => {
  try {
    await audioContext.audioWorklet.addModule('/src/audio-worklets/AudioProcessor.ts');
    console.log('AudioWorklet module loaded successfully.');
  } catch (e) {
    console.error('Error loading AudioWorklet module:', e);
  }
};