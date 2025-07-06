import { Container, Typography, Grid } from '@mui/material';
import { useAudioProcessor } from './hooks/useAudioProcessor';
import { WaveformDisplay } from './components/WaveformDisplay';
import AudioSettings from './components/AudioSettings';
import React from 'react';

function App() {
  const [sampleRate, setSampleRate] = React.useState(44100);
  const [bitDepth, setBitDepth] = React.useState(16);
  const audioProcessor = useAudioProcessor(sampleRate, bitDepth);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mx: 'auto', mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🔈 音声のデジタル化体験ツール 🔈
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <AudioSettings 
            sampleRate={sampleRate}
            bitDepth={bitDepth}
            setSampleRate={setSampleRate}
            setBitDepth={setBitDepth}
            duration={audioProcessor.duration}
            isRecording={audioProcessor.isRecording}
            audioURL={audioProcessor.audioURL}
            handleStartRecording={audioProcessor.handleStartRecording}
            handleStopRecording={audioProcessor.handleStopRecording}
            handlePlay={audioProcessor.handlePlay}
            handleStopPlayback={audioProcessor.handleStopPlayback}
            isPlaying={audioProcessor.isPlaying}
            handleExport={audioProcessor.handleExport}
          />
        </Grid>
        <Grid item xs={12} md={9}>
          <WaveformDisplay 
            audioBuffer={audioProcessor.audioBuffer}
            sampleRate={sampleRate}
            bitDepth={bitDepth}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;