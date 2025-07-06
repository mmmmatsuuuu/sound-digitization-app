import { Container, Typography, Grid } from '@mui/material';
import { useAudioProcessor } from './hooks/useAudioProcessor';
import { ControlPanel } from './components/ControlPanel';
import { WaveformDisplay } from './components/WaveformDisplay';

function App() {
  const audioProcessor = useAudioProcessor();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        音声波形エディタ
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ControlPanel {...audioProcessor} />
        </Grid>
        <Grid item xs={12} md={8}>
          <WaveformDisplay audioBuffer={audioProcessor.audioBuffer} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;