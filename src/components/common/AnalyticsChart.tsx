import { useEffect, useRef } from 'react';

interface AnalyticsChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
  showLabels?: boolean;
}

export default function AnalyticsChart({ 
  data, 
  labels, 
  color = '#2d5df6', 
  height = 200,
  showLabels = true 
}: AnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Find max value for scaling
    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw bars
    const barWidth = (chartWidth / data.length) * 0.6;
    const barGap = (chartWidth / data.length) * 0.4;

    data.forEach((value, index) => {
      const x = padding + (chartWidth / data.length) * index + barGap / 2;
      const barHeight = ((value - minValue) / (maxValue - minValue)) * chartHeight;
      const y = canvas.height - padding - barHeight;

      // Draw bar
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top
      if (showLabels) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);

        // Draw label at bottom
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.fillText(labels[index], x + barWidth / 2, canvas.height - padding + 15);
      }
    });

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

  }, [data, labels, color, height, showLabels]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={height}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
}

// Line chart variant
interface LineChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}

export function LineChart({ data, labels, color = '#2d5df6', height = 200 }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = canvas.height - padding - ((value - minValue) / (maxValue - minValue)) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = color;
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = canvas.height - padding - ((value - minValue) / (maxValue - minValue)) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw labels
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x, canvas.height - padding + 15);
    });

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

  }, [data, labels, color, height]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={height}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
}
