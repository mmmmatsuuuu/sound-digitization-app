export const drawWaveform = (canvas: HTMLCanvasElement, audioBuffer: AudioBuffer, targetSampleRate: number, targetBitDepth: number) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const originalData = audioBuffer.getChannelData(0);
  const originalSampleRate = audioBuffer.sampleRate;

  ctx.clearRect(0, 0, width, height);

  // --- Data Processing for Visualization ---
  const resampleRatio = originalSampleRate / targetSampleRate;
  const resampledLength = Math.floor(originalData.length / resampleRatio);
  const processedData = new Float32Array(resampledLength);

  for (let i = 0; i < resampledLength; i++) {
    const originalIndex = i * resampleRatio;
    const indexPrev = Math.floor(originalIndex);
    // Simple nearest-neighbor for a blocky look, could also use interpolation
    let sample = originalData[indexPrev];

    // Quantization
    if (targetBitDepth > 0) {
      const maxVal = Math.pow(2, targetBitDepth - 1) - 1;
      sample = Math.round(sample * maxVal) / maxVal;
    }
    processedData[i] = sample;
  }

  // --- Drawing Logic for Blocky Waveform ---
  ctx.fillStyle = '#000';
  const amp = height / 2;

  // Calculate the width of each "bar" to make it look blocky
  const barWidth = Math.max(1, width / processedData.length);

  ctx.beginPath();
  for (let i = 0; i < processedData.length; i++) {
    const x = (i / processedData.length) * width;
    const y = (1 - processedData[i]) * amp;

    ctx.rect(x, y, barWidth, 2); // Draw a small rectangle for each sample point
  }
  ctx.fill();

  // Draw vertical stems for each sample point to enhance the blocky feel
  ctx.strokeStyle = '#000';
  ctx.lineWidth = barWidth; // Make lines slightly thinner than the bar width
  ctx.beginPath();
  for (let i = 0; i < processedData.length; i++) {
    const x = (i / processedData.length) * width + barWidth / 2;
    const y = (1 - processedData[i]) * amp;
    ctx.moveTo(x, amp);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
};