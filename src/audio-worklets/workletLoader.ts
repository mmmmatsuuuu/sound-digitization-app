// import workletURL from './AudioProcessor.ts?url';

export const loadAudioWorklet = async (audioContext: AudioContext) => {
  try {
    await audioContext.audioWorklet.addModule("./worklets/AudioProcessor.js");
    console.log('AudioWorklet module loaded successfully.');
  } catch (e) {
    console.error('Error loading AudioWorklet module:', e);
  }
};