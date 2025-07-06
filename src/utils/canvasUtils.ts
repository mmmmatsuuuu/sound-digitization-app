export const drawWaveform = (canvas: HTMLCanvasElement, audioBuffer: AudioBuffer, targetSampleRate: number, targetBitDepth: number) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const originalData = audioBuffer.getChannelData(0); // Assuming mono for simplicity
  const originalSampleRate = audioBuffer.sampleRate;

  ctx.clearRect(0, 0, width, height);

  // Draw waveform
  ctx.fillStyle = '#000'; // Use fillStyle for bars

  const amp = height / 2;

  // Calculate how many original samples correspond to one pixel on the canvas
  // This ensures the entire audio duration is mapped to the canvas width
  const samplesPerPixel = originalData.length / width;

  // Calculate the visual downsampling ratio
  const visualSampleRatio = originalSampleRate / targetSampleRate;

  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;

    // Determine the range of original samples for the current pixel column
    const startOriginalIndex = Math.floor(i * samplesPerPixel);
    const endOriginalIndex = Math.min(originalData.length, Math.floor((i + 1) * samplesPerPixel));

    for (let j = startOriginalIndex; j < endOriginalIndex; j++) {
      // Only consider samples that would exist at the targetSampleRate for visual representation
      // This is a simplified visual downsampling.
      if (j % visualSampleRatio < 1) { 
        let datum = originalData[j];

        // Apply quantization for visualization
        if (targetBitDepth > 0) {
          const maxVal = Math.pow(2, targetBitDepth - 1) - 1; // For signed values
          datum = Math.round(datum * maxVal) / maxVal;
        }

        if (datum < min) {
          min = datum;
        }
        if (datum > max) {
          max = datum;
        }
      }
    }

    // Draw a filled rectangle (bar) for each pixel column
    const yMin = (1 + min) * amp;
    const yMax = (1 + max) * amp;
    ctx.fillRect(i, yMin, 1, yMax - yMin);
  }

  
  
};