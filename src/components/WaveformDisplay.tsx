import { Paper, Typography } from '@mui/material';
import { useRef, useEffect, useCallback } from 'react';
import { drawWaveform } from '../utils/canvasUtils';

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
}

export const WaveformDisplay = ({ audioBuffer }: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas resolution to match its container size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    if (audioBuffer) {
      drawWaveform(canvas, audioBuffer);
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [audioBuffer]);

  // Redraw when buffer changes
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Redraw on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      redraw();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [redraw]);

  return (
    <Paper 
      ref={containerRef} 
      sx={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        overflow: 'hidden' // Hide anything that might spill out
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%' }} 
      />
      {!audioBuffer && (
        <Typography sx={{ position: 'absolute' }}>
          ここに波形が表示されます
        </Typography>
      )}
    </Paper>
  );
};