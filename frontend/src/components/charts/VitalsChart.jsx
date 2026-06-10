import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * @param {Object} props
 * @param {Array} props.vitalsData - Array of {recordedAt, bloodPressureSystolic, bloodPressureDiastolic, heartRate}
 */
export default function VitalsChart({ vitalsData = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || vitalsData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const sorted = [...vitalsData].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: sorted.map((v) => new Date(v.recordedAt).toLocaleDateString()),
        datasets: [
          {
            label: 'Systolic BP',
            data: sorted.map((v) => v.bloodPressureSystolic),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.3,
          },
          {
            label: 'Diastolic BP',
            data: sorted.map((v) => v.bloodPressureDiastolic),
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.3,
          },
          {
            label: 'Heart Rate',
            data: sorted.map((v) => v.heartRate),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [vitalsData]);

  if (vitalsData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        No vitals data available
      </div>
    );
  }

  return (
    <div className="h-80">
      <canvas ref={canvasRef} />
    </div>
  );
}
