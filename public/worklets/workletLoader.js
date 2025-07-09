// import workletURL from './AudioProcessor.ts?url';
export const loadAudioWorklet = async (audioContext) => {
    try {
        await audioContext.audioWorklet.addModule("./worklets/AudioProcessor.js");
        console.log('AudioWorklet module loaded successfully.');
    }
    catch (e) {
        console.error('Error loading AudioWorklet module:', e);
    }
};
