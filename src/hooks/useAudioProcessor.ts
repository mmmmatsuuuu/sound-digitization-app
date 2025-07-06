import { useState, useRef } from 'react';
import { loadAudioWorklet } from '../audio-worklets/workletLoader';
import { audioBufferToWav } from '../utils/audioExportUtils';

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export const useAudioProcessor = (sampleRate: number, bitDepth: number) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        const arrayBuffer = await audioBlob.arrayBuffer();
        const decodedAudioData = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedAudioData);
        setDuration(decodedAudioData.duration);

        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL(null);
      setAudioBuffer(null);
      setDuration(0);

      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          handleStopRecording();
        }
      }, 10000);

    } catch (err) {
      console.error("マイクへのアクセスが拒否されました。", err);
      alert("マイクへのアクセスを許可してください。");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlay = async () => {
    if (!audioBuffer) {
      console.warn("No audio buffer to play.");
      return;
    }

    if (isPlaying) {
      handleStopPlayback();
    }

    try {
      await loadAudioWorklet(audioContext);

      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;

      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
      workletNode.port.postMessage({
        type: 'init',
        sampleRate: sampleRate,
        bitDepth: bitDepth,
      });

      sourceNode.connect(workletNode);
      workletNode.connect(audioContext.destination);

      sourceNode.onended = () => {
        setIsPlaying(false);
        sourceNode.disconnect();
        workletNode.disconnect();
      };

      sourceNode.start(0);
      setIsPlaying(true);
      audioSourceNodeRef.current = sourceNode;
      audioWorkletNodeRef.current = workletNode;

    } catch (error) {
      console.error("Error during playback:", error);
      setIsPlaying(false);
    }
  };

  const handleStopPlayback = () => {
    if (audioSourceNodeRef.current) {
      audioSourceNodeRef.current.stop();
      audioSourceNodeRef.current.disconnect();
      audioSourceNodeRef.current = null;
    }
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleExport = async () => {
    if (!audioBuffer) {
      console.warn("No audio buffer to export.");
      return;
    }

    try {
      // Create an OfflineAudioContext with the target sample rate
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length * (sampleRate / audioBuffer.sampleRate), // Adjust length for new sample rate
        sampleRate
      );

      // Load the AudioWorklet module into the offline context
      await offlineContext.audioWorklet.addModule('/src/audio-worklets/AudioProcessor.ts');

      const sourceNode = offlineContext.createBufferSource();
      sourceNode.buffer = audioBuffer;

      const workletNode = new AudioWorkletNode(offlineContext, 'audio-processor');
      workletNode.port.postMessage({
        type: 'init',
        sampleRate: sampleRate,
        bitDepth: bitDepth,
      });

      sourceNode.connect(workletNode);
      workletNode.connect(offlineContext.destination);

      sourceNode.start(0);

      // Start rendering and wait for completion
      const processedBuffer = await offlineContext.startRendering();

      const wavBlob = audioBufferToWav(processedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_audio_${sampleRate}hz_${bitDepth}bit.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error during export:", error);
    }
  };

  return {
    isRecording,
    isPlaying,
    audioURL,
    audioBuffer,
    duration,
    handleStartRecording,
    handleStopRecording,
    handlePlay,
    handleStopPlayback,
    handleExport,
  };
};