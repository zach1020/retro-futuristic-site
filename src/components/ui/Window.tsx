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

  // Reset size if switching from mobile to desktop (optional, but good practice)
  useEffect(() => {
    if (!isMobile) {
      setSize({
        width: Number(initialSize.width),
        height: Number(initialSize.height)
      });
    }
  }, [isMobile, initialSize.width, initialSize.height]);

  if (isMinimized) return null;

  if (isMobile) {
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
        className="win98-box"
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
              onClick={(e) => { e.stopPropagation(); onClose(); }}
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
        }}
      >
        <Resizable
          width={size.width}
          height={size.height}
          onResize={(e, data) => setSize(data.size)}
          minConstraints={[300, 200]}
          maxConstraints={[1200, 900]}
          handle={<span className="react-resizable-handle react-resizable-handle-se" />}
        >
          <div
            className="win98-box"
            style={{
              width: size.width,
              height: size.height,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--win-gray)',
              position: 'relative' // For handle positioning
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
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
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
