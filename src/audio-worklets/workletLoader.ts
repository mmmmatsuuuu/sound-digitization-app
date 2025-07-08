import AudioProcessorWorklet from './AudioProcessor.ts?url';

export const loadAudioWorklet = async (audioContext: AudioContext) => {
  try {
    await audioContext.audioWorklet.addModule(AudioProcessorWorklet);
    console.log('AudioWorklet module loaded successfully.');
  } catch (e) {
    console.error('Error loading AudioWorklet module:', e);
  }
};