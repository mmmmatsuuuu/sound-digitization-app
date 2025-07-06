import { useState, useRef } from 'react';

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export const useAudioProcessor = () => {
  const [sampleRate, setSampleRate] = useState('44100');
  const [bitDepth, setBitDepth] = useState('16bit');
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

        // BlobをAudioBufferに変換
        const arrayBuffer = await audioBlob.arrayBuffer();
        const decodedAudioData = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedAudioData);

        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL(null);
      setAudioBuffer(null);

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

  return {
    sampleRate,
    setSampleRate,
    bitDepth,
    setBitDepth,
    isRecording,
    audioURL,
    audioBuffer, // audioBufferを返す
    handleStartRecording,
    handleStopRecording,
  };
};