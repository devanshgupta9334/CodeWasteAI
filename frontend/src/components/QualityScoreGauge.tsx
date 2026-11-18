import React from 'react';

interface Props {
  score: number;
  size?: number;
}

export const QualityScoreGauge: React.FC<Props> = ({ score, size = 160 }) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#10b981'; // Green
  let grade = 'A+';
  let label = 'Clean & Efficient';

  if (score >= 90) {
    color = '#10b981';
    grade = 'A+';
    label = 'Excellent Quality';
  } else if (score >= 75) {
    color = '#3b82f6';
    grade = 'B';
    label = 'Good / Maintainable';
  } else if (score >= 60) {
    color = '#f59e0b';
    grade = 'C';
    label = 'Moderate Waste';
  } else {
    color = '#ef4444';
    grade = 'D-';
    label = 'High Code Debt';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1f293d"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {Math.round(score)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Grade {grade}
          </span>
        </div>
      </div>
      <span className="mt-3 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60" style={{ color }}>
        {label}
      </span>
    </div>
  );
};
