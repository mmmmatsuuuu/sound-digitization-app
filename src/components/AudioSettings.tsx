import React from 'react';
import {
  FormControl,
  FormLabel,
  Paper,
  Typography,
  Box,
  Button,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';

interface AudioSettingsProps {
  sampleRate: number;
  bitDepth: number;
  setSampleRate: (rate: number) => void;
  setBitDepth: (depth: number) => void;
  duration: number;
  isRecording: boolean;
  audioURL: string | null;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  handlePlay: () => void;
  handleStopPlayback: () => void;
  isPlaying: boolean;
  handleExport: () => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({
  sampleRate,
  bitDepth,
  setSampleRate,
  setBitDepth,
  duration,
  isRecording,
  audioURL,
  handleStartRecording,
  handleStopRecording,
  handlePlay,
  handleStopPlayback,
  isPlaying,
  handleExport,
}) => {
  const handleSampleRateChange = (event: any) => {
    setSampleRate(parseInt(event.target.value, 10));
  };

  const handleBitDepthChange = (event: any) => {
    setBitDepth(parseInt(event.target.value, 10));
  };

  const calculateDataAmount = () => {
    if (duration === 0) return 0;
    const dataAmountBits = sampleRate * bitDepth * duration;
    const dataAmountBytes = dataAmountBits / 8;
    return dataAmountBytes;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes.toFixed(0)} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  const dataSizeInBytes = calculateDataAmount();

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        border: '1px solid #ccc',
        borderRadius: 2, 
      }}
    >
      <Typography variant="h6" gutterBottom>
        音声コントロールと設定
      </Typography>

      {/* 録音セクション */}
      <Box sx={{ my: 2, mb: 6 }}>
        <Typography variant="subtitle1">録音</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleStartRecording} disabled={isRecording}>録音開始</Button>
          <Button variant="outlined" color="secondary" onClick={handleStopRecording} disabled={!isRecording}>録音停止</Button>
        </Stack>
        {audioURL && <audio src={audioURL} controls style={{ width: '100%', marginTop: '10px' }}/>}
      </Box>


      <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap' }}>
        <FormControl component="fieldset" sx={{ minWidth: 200 }}>
          <InputLabel id="sampling-frequency-label">サンプリング周波数</InputLabel>
          <Select
            labelId="sampling-frequency-label"
            id="sampling-frequency-select"
            value={sampleRate.toString()}
            label="サンプリング周波数"
            onChange={handleSampleRateChange}
          >
            <MenuItem value={44100}>元の音質 (44.1kHz)</MenuItem>
            <MenuItem value={22050}>半分の音質 (22.05kHz)</MenuItem>
            <MenuItem value={16000}>16kHz</MenuItem>
            <MenuItem value={8000}>8kHz</MenuItem>
            <MenuItem value={4000}>4kHz</MenuItem>
            <MenuItem value={2000}>2kHz</MenuItem>
            <MenuItem value={1000}>1kHz</MenuItem>
            <MenuItem value={500}>500Hz</MenuItem>
          </Select>
        </FormControl>
        <FormControl component="fieldset" sx={{ minWidth: 200 }}>
          <InputLabel id="bit-depth-label">量子化ビット数</InputLabel>
          <Select
            labelId="bit-depth-label"
            id="bit-depth-select"
            value={bitDepth.toString()}
            label="量子化ビット数"
            onChange={handleBitDepthChange}
          >
            <MenuItem value={16}>元の滑らかさ (16bit)</MenuItem>
            <MenuItem value={12}>12bit</MenuItem>
            <MenuItem value={8}>8bit</MenuItem>
            <MenuItem value={4}>4bit</MenuItem>
            <MenuItem value={2}>2bit</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 再生セクション */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1">再生</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={handlePlay} disabled={!audioURL || isPlaying}>再生</Button>
          <Button variant="outlined" onClick={handleStopPlayback} disabled={!isPlaying}>停止</Button>
        </Stack>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">
          推定データサイズ ({duration.toFixed(2)}秒): {dataSizeInBytes.toFixed(0)} B ({formatBytes(dataSizeInBytes)})
        </Typography>
      </Box>
      <Box sx={{ my: 2 }}>
        <Button variant="contained" onClick={handleExport} disabled={!audioURL}>WAVエクスポート</Button>
      </Box>
    </Paper>
  );
};

export default AudioSettings;
