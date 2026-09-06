// אייקוני הניווט - קווי מתאר פשוטים שיורשים את צבע הטקסט (currentColor),
// כדי שהתפריט יישאר בגווני הספיה של האתר במקום אמוג'ים צבעוניים.
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ children, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      {children}
    </svg>
  );
}

export function IconCandidates({ className }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c0-3.6 3.4-5.6 7.5-5.6s7.5 2 7.5 5.6" />
    </Svg>
  );
}

export function IconMatches({ className }) {
  return (
    <Svg className={className}>
      <path d="M12 20.2s-7.2-4.3-7.2-9A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 7.2 2.6c0 4.7-7.2 9-7.2 9z" />
    </Svg>
  );
}

export function IconTasks({ className }) {
  return (
    <Svg className={className}>
      <rect x="4.5" y="3.8" width="15" height="16.4" rx="2.6" />
      <path d="M8.4 9.4l1.7 1.7 3.4-3.4M8.4 15.6l1.7 1.7 3.4-3.4" />
    </Svg>
  );
}

export function IconQuestions({ className }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M9.7 9.6a2.4 2.4 0 0 1 4.6.9c0 1.6-2.3 2-2.3 3.4" />
      <path d="M12 17.3h.01" />
    </Svg>
  );
}

export function IconManage({ className }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.1 14.2a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a1.9 1.9 0 1 1 0-3.8h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5v-.3a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.5 1z" />
    </Svg>
  );
}

export function IconLock({ className }) {
  return (
    <Svg className={className}>
      <rect x="4.8" y="10.4" width="14.4" height="10" rx="2.6" />
      <path d="M8.4 10.4V7.6a3.6 3.6 0 0 1 7.2 0v2.8" />
      <path d="M12 14.4v2.2" />
    </Svg>
  );
}

export function IconSchedule({ className }) {
  return (
    <Svg className={className}>
      <rect x="3.6" y="5" width="16.8" height="15.2" rx="2.6" />
      <path d="M3.6 9.4h16.8M8.4 3.4v3.2M15.6 3.4v3.2" />
      <path d="M8 13.2h3.2M8 16.6h6.6" />
    </Svg>
  );
}

// לב מלא - מסך הסיום של הטופס החיצוני
export function IconHeart({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 20.6s-7.6-4.6-7.6-9.6a4.2 4.2 0 0 1 7.6-2.5 4.2 4.2 0 0 1 7.6 2.5c0 5-7.6 9.6-7.6 9.6z" />
    </svg>
  );
}
