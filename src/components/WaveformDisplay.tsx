import { Paper, Typography } from '@mui/material';
import { useRef, useEffect, useCallback, useState } from 'react';
import { drawWaveform } from '../utils/canvasUtils';

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
  sampleRate: number;
  bitDepth: number;
}

export const WaveformDisplay = ({ audioBuffer, sampleRate, bitDepth }: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  // Define a base width per second for the waveform
  const pixelsPerSecond = 17640; // 0.1 seconds = 160px, so 1 second = 1600px

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateWidth = () => {
      const newWidth = Math.max(container.clientWidth, (audioBuffer?.duration || 0) * pixelsPerSecond);
      setCanvasWidth(newWidth);
    };

    calculateWidth(); // Initial calculation

    const resizeObserver = new ResizeObserver(() => {
      calculateWidth();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [audioBuffer?.duration, pixelsPerSecond]); // Recalculate when duration changes

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas resolution to the calculated width and its container height
    canvas.width = canvasWidth;
    canvas.height = canvas.clientHeight;

    if (audioBuffer) {
      drawWaveform(canvas, audioBuffer, sampleRate, bitDepth);
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [audioBuffer, sampleRate, bitDepth, canvasWidth]);

  // Redraw when buffer changes or sampleRate/bitDepth/duration/canvasWidth changes
  useEffect(() => {
    redraw();
  }, [redraw]);

  return (
    <Paper 
      ref={containerRef} 
      sx={{ 
        height: '400px',
        width: '600px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        overflowX: 'scroll', // Allow horizontal scrolling
        overflowY: 'hidden', // Hide vertical overflow
        p: 2,
        border: '1px solid #ccc',
        borderRadius: 2,
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ width: `${canvasWidth}px`, height: '100%' }} 
      />
      {!audioBuffer && (
        <Typography sx={{ position: 'absolute' }}>
          ここに波形が表示されます
        </Typography>
      )}
    </Paper>
  );
};