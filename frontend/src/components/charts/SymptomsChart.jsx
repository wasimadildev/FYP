import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * @param {Object} props
 * @param {Array} props.symptomsData - Array of {name, count}
 */
export default function SymptomsChart({ symptomsData = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || symptomsData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: symptomsData.map((s) => s.name),
        datasets: [
          {
            label: 'Frequency',
            data: symptomsData.map((s) => s.count),
            backgroundColor: [
              'rgba(59, 130, 246, 0.6)',
              'rgba(34, 197, 94, 0.6)',
              'rgba(249, 115, 22, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(168, 85, 247, 0.6)',
            ],
            borderColor: [
              '#3b82f6',
              '#22c55e',
              '#f97316',
              '#ef4444',
              '#a855f7',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [symptomsData]);

  if (symptomsData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        No symptom data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}
