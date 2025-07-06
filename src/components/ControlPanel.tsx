import { Paper, Typography, Box, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface ControlPanelProps {
  sampleRate: string;
  setSampleRate: (value: string) => void;
  bitDepth: string;
  setBitDepth: (value: string) => void;
  isRecording: boolean;
  audioURL: string | null;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
}

export const ControlPanel = ({ 
  sampleRate, setSampleRate, bitDepth, setBitDepth, isRecording, audioURL, handleStartRecording, handleStopRecording 
}: ControlPanelProps) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">コントロール</Typography>
      
      {/* 録音セクション */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1">録音</Typography>
        <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={handleStartRecording} disabled={isRecording}>録音開始</Button>
        <Button variant="outlined" color="secondary" onClick={handleStopRecording} disabled={!isRecording}>停止</Button>
      </Box>

      {/* 再生セクション */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1">再生</Typography>
        <Button variant="contained" sx={{ mr: 1 }} disabled={!audioURL}>再生</Button>
        <Button variant="outlined" disabled={!audioURL}>停止</Button>
        {audioURL && <audio src={audioURL} controls style={{ width: '100%', marginTop: '10px' }}/>}
      </Box>

      {/* 設定セクション */}
      <Box sx={{ my: 2 }}>
        <FormControl fullWidth>
          <InputLabel>サンプリング周波数</InputLabel>
          <Select
            value={sampleRate}
            label="サンプリング周波数"
            onChange={(e) => setSampleRate(e.target.value)}
            disabled={isRecording}
          >
            <MenuItem value="44100">元の音質 (44100 Hz)</MenuItem>
            <MenuItem value="22050">半分の音質 (22050 Hz)</MenuItem>
            <MenuItem value="11025">1/4の音質 (11025 Hz)</MenuItem>
            <MenuItem value="5513">1/8の音質 (5513 Hz)</MenuItem>
            <MenuItem value="2756">1/16の音質 (2756 Hz)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControl fullWidth>
          <InputLabel>量子化ビット数</InputLabel>
          <Select
            value={bitDepth}
            label="量子化ビット数"
            onChange={(e) => setBitDepth(e.target.value)}
            disabled={isRecording}
          >
            <MenuItem value="16bit">元の滑らかさ (16bit)</MenuItem>
            <MenuItem value="8bit">粗い音質 (8bit)</MenuItem>
            <MenuItem value="4bit">さらに粗い音質 (4bit)</MenuItem>
            <MenuItem value="2bit">とても粗い音質 (2bit)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* データ量表示 */}
      <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1">データ量</Typography>
          <Typography variant="body1">約 0.0 MB</Typography>
      </Box>

    </Paper>
  );
};