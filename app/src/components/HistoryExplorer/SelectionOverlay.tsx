import type { CSSProperties } from 'react';
import type { SelectionRect } from './selectionClassifier';

interface SelectionOverlayProps {
  selection: SelectionRect | null;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function SelectionOverlay({ selection, scale, offsetX, offsetY }: SelectionOverlayProps) {
  if (!selection) return null;

  const style = {
    left: `${offsetX + selection.x * scale}px`,
    top: `${offsetY + selection.y * scale}px`,
    width: `${selection.width * scale}px`,
    height: `${selection.height * scale}px`,
  } satisfies CSSProperties;

  return (
    <div className="history-selection-overlay" style={style}>
      <div className="history-selection-overlay__badge">Selection</div>
    </div>
  );
}
