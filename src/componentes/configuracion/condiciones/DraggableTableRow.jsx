import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableRow } from '@/ui/table.jsx';

export const DraggableTableRow = ({ rowId, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners} data-state={isDragging && "dragging"}>
      {children}
    </TableRow>
  );
};