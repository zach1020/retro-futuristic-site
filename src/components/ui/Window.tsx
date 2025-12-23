import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import { X, Minus } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  isActive,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  initialPosition = { x: 50, y: 50 },
  initialSize = { width: 500, height: 400 }
}) => {
  const nodeRef = useRef(null);
  const isMobile = useIsMobile();
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: Number(initialSize.width),
    height: Number(initialSize.height)
  });

  const [isClosing, setIsClosing] = useState(false);
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({});
  const boxRef = useRef<HTMLDivElement>(null);

  // Reset size if switching from mobile to desktop (optional, but good practice)
  useEffect(() => {
    if (!isMobile) {
      setSize({
        width: Number(initialSize.width),
        height: Number(initialSize.height)
      });
    }
  }, [isMobile, initialSize.width, initialSize.height]);

  // Check if window is visible (not fully minimized/hidden)
  // We keep it mounted but maybe hide it if user wants?
  // Actually, we want it to persist. 

  useEffect(() => {
    if (isMinimized) {
      // Minimize Animation (Genie)
      const btn = document.getElementById(`taskbar-btn-${id}`);
      if (btn && boxRef.current) {
        const boxRect = boxRef.current.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();

        const dx = (btnRect.left + btnRect.width / 2) - (boxRect.left + boxRect.width / 2);
        const dy = (btnRect.top + btnRect.height / 2) - (boxRect.top + boxRect.height / 2);

        setAnimationStyle({
          transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)', // Genie ease
          transform: `translate(${dx}px, ${dy}px) scale(0)`,
          opacity: 0,
          pointerEvents: 'none'
        });
      }
    } else {
      // Restore Animation
      setAnimationStyle({
        transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        transform: 'translate(0, 0) scale(1)',
        opacity: 1,
        pointerEvents: 'auto'
      });

      // Optional: clear styles after animation to keep clean state
      // But keeping them is fine as 'translate(0,0)' is neutral.
    }
  }, [isMinimized, id]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 500);
  };

  // if (isMinimized) return null; // REMOVED: Keep mounted for animation

  // Mobile check... mobile logic might need update if we want genie there too, 
  // but usually mobile just hides. Let's keep mobile simple for now or applied there too?
  // The user asked for "macos genie", usually desktop concept.
  // Mobile view return early if needed, or we adapt it.
  // Let's stick to the existing mobile view but fix the 'return null' issue.

  if (isMobile) {
    if (isMinimized) return null; // Keep mobile simple for now
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: 'calc(100dvh - 48px)', // Dynamic viewport height - taskbar
          zIndex: zIndex + 100, // Ensure it's on top on mobile
          display: 'flex',
          flexDirection: 'column'
        }}
        className={`win98-box ${isClosing ? 'window-closing' : ''}`}
        onClick={onFocus}
      >
        {/* Mobile Title Bar */}
        <div
          className={`win98-title-bar ${isActive ? 'active' : 'inactive'}`}
        >
          <div className="win98-title-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}> {/* Larger gap for touch */}
            <button
              className="win98-btn"
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              style={{ padding: '4px 8px' }} // Larger touch target
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <button
              className="win98-btn"
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              style={{ padding: '4px 8px' }} // Larger touch target
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <Draggable
      handle=".window-handle"
      defaultPosition={initialPosition}
      nodeRef={nodeRef}
      onMouseDown={onFocus}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        style={{
          position: 'absolute',
          zIndex: zIndex,
          // Hide completely if minimized and animation done? 
          // We rely on opacity: 0 from animationStyle
          visibility: isMinimized && animationStyle.opacity === 0 ? 'hidden' : 'visible'
        }}
      >
        <Resizable
          width={size.width}
          height={size.height}
          onResize={(_, data) => setSize(data.size)}
          minConstraints={[300, 200]}
          maxConstraints={[1200, 900]}
          handle={<span className="react-resizable-handle react-resizable-handle-se" />}
        >
          <div
            ref={boxRef}
            className={`win98-box ${isClosing ? 'window-closing' : ''}`}
            style={{
              width: size.width,
              height: size.height,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--win-gray)',
              position: 'relative', // For handle positioning
              ...animationStyle
            }}
            onClick={onFocus}
          >
            {/* Title Bar */}
            <div
              className={`win98-title-bar ${isActive ? 'active' : 'inactive'} window-handle`}
              style={{ cursor: 'default' }}
            >
              <div className="win98-title-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>{title}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', backgroundColor: '#fff', border: '1px solid #000', padding: '1px' }}>
                <button
                  className="win98-btn"
                  onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                  style={{ padding: '0px 2px', minWidth: '16px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0, boxShadow: 'none', border: '1px solid black' }}
                >
                  <Minus size={10} strokeWidth={3} />
                </button>
                <button
                  className="win98-btn"
                  onClick={(e) => { e.stopPropagation(); handleClose(); }}
                  style={{ padding: '0px 2px', minWidth: '16px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0, boxShadow: 'none', border: '1px solid black' }}
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
};

