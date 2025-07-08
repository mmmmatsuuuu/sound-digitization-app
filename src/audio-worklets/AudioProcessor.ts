// @ts-ignore
class AudioProcessor extends AudioWorkletProcessor {
  private targetSampleRate: number;
  private targetBitDepth: number;

  constructor() {
    super();
    // Initialize with default values, which will be updated by the 'init' message
    this.targetSampleRate = 44100; // Default to common sample rate
    this.targetBitDepth = 16;    // Default to common bit depth

    // @ts-ignore
    this.port.onmessage = (event) => {
      if (event.data.type === 'init') {
        this.targetSampleRate = event.data.sampleRate;
        this.targetBitDepth = event.data.bitDepth;
      }
    };
  }

  /**
   * Processes input audio data, performing resampling and quantization.
   * This is a custom implementation within the AudioWorklet, using basic signal processing.
   * For higher quality or more complex scenarios, dedicated libraries or OfflineAudioContext
   * for offline processing would be more suitable.
   */
  process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || input.length === 0 || !output || output.length === 0) {
      return true;
    }

    const inputChannelData = input[0]; // Assuming mono input
    const outputChannelData = output[0];

    // @ts-ignore
    const currentContextSampleRate = sampleRate; // Global `sampleRate` in AudioWorklet scope

    // Calculate the resampling ratio
    const ratio = currentContextSampleRate / this.targetSampleRate;

    for (let i = 0; i < outputChannelData.length; i++) {
      const inputIndex = i * ratio;
      const x1 = Math.floor(inputIndex);
      const x2 = x1 + 1;

      let interpolatedValue = 0;

      if (x2 < inputChannelData.length) {
        // Linear interpolation for resampling
        const y1 = inputChannelData[x1];
        const y2 = inputChannelData[x2];
        interpolatedValue = y1 + (inputIndex - x1) * (y2 - y1);
      } else if (x1 < inputChannelData.length) {
        // If x2 is out of bounds, just use the last available sample
        interpolatedValue = inputChannelData[x1];
      } else {
        // If both x1 and x2 are out of bounds, fill with zero
        interpolatedValue = 0;
      }

      // Basic bit depth conversion (quantization)
      let quantizedValue = interpolatedValue;
      if (this.targetBitDepth > 0) {
        const maxVal = Math.pow(2, this.targetBitDepth - 1) - 1; // For signed values, range is -maxVal to +maxVal
        // Scale to integer range, round, then scale back to float range
        quantizedValue = Math.round(interpolatedValue * maxVal) / maxVal;
      }

      outputChannelData[i] = quantizedValue;
    }

    return true;
  }
}

// @ts-ignore
registerProcessor('audio-processor', AudioProcessor);