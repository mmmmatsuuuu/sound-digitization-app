export const loadAudioWorklet = async (audioContext: AudioContext) => {
  try {
    await audioContext.audioWorklet.addModule(new URL('./AudioProcessor.ts', import.meta.url).href);
    console.log('AudioWorklet module loaded successfully.');
  } catch (e) {
    console.error('Error loading AudioWorklet module:', e);
  }
};