export const audioBufferToWav = (buffer: AudioBuffer) => {
  const numOfChan = buffer.numberOfChannels;
  const ambuf = buffer.getChannelData(0);
  const len = ambuf.length * numOfChan;
  const result = new Float32Array(len);
  let offset = 0;
  for (let i = 0; i < ambuf.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      result[offset++] = buffer.getChannelData(channel)[i];
    }
  }

  const sampleRate = buffer.sampleRate;

  const enc = encodeWAV(result, numOfChan, sampleRate);
  return new Blob([enc], { type: 'audio/wav' });
};

function floatTo16BitPCM(input: Float32Array, output: DataView, offset: number) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function encodeWAV(samples: Float32Array, numChannels: number, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(samples, view, 44);

  return view;
}