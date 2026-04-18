"use client";

interface Props {
  label: string;
  options: string[];
  onSelect: (value: string) => void;
}

export function FilterDropdown({ label, options, onSelect }: Props) {
  return (
    <>
      <style>{`
        .fd-wrap {
          position: relative;
          display: inline-block;
        }
        .fd-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: var(--surface);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: 0.3s ease-in-out;
          white-space: nowrap;
          min-width: 150px;
          justify-content: space-between;
        }
        .fd-wrap:hover .fd-trigger {
          border-color: var(--primary);
          color: var(--primary);
        }
        .fd-trigger svg {
          transition: 0.3s ease-in-out;
          opacity: 0.5;
        }
        .fd-wrap:hover .fd-trigger svg {
          transform: rotate(180deg);
          opacity: 1;
        }
        .fd-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 100%;
          transform: translateY(10px);
          opacity: 0;
          pointer-events: none;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding-top: 10px;
          z-index: 200;
        }
        .fd-dropdown::after {
          content: "";
          width: 12px;
          height: 12px;
          background: var(--primary);
          top: 3px;
          left: 18px;
          position: absolute;
          display: inline-block;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          z-index: 1;
        }
        .fd-menu {
          padding: 4px 0;
          background: var(--glass-bg-solid, rgba(4,13,10,0.92));
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--primary);
          list-style: none;
          margin: 0;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .fd-option {
          display: block;
          width: 100%;
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(var(--primary-rgb), 0.06);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: 0.2s ease;
        }
        .fd-option:last-child {
          border-bottom: none;
        }
        .fd-option:hover {
          background: rgba(var(--primary-rgb), 0.08);
          color: var(--primary);
          padding-left: 22px;
        }
        .fd-wrap:hover .fd-dropdown {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
      <div className="fd-wrap">
        <div className="fd-trigger">
          {label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <div className="fd-dropdown">
          <div className="fd-menu">
            {options.map((opt) => (
              <button
                key={opt}
                className="fd-option"
                onClick={() => onSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
