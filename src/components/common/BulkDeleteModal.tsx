import './ConfirmDeleteModal.css';
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface BulkDeleteModalProps {
  count: number;
  itemType: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function BulkDeleteModal({ count, itemType, onCancel, onConfirm, isDeleting = false }: BulkDeleteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const modalContent = (
    <div className="confirm-delete-backdrop" onClick={onCancel}>
      <section
        className="confirm-delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulk-delete-title"
        aria-describedby="bulk-delete-description"
        ref={modalRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-delete-close"
          onClick={onCancel}
          aria-label="Close delete confirmation"
          disabled={isDeleting}
        >
          x
        </button>
        <div className="confirm-delete-icon" aria-hidden="true">!</div>
        <h2 id="bulk-delete-title">Delete {count} {itemType}{count > 1 ? 's' : ''}?</h2>
        <p id="bulk-delete-description">
          Are you sure you want to delete <strong>{count} {itemType}{count > 1 ? 's' : ''}</strong>?
        </p>
        <small>
          This action cannot be undone. All selected {itemType.toLowerCase()}s and their related data will be permanently removed.
        </small>
        <div className="confirm-delete-actions">
          <button type="button" className="confirm-delete-cancel" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button
            type="button"
            className="confirm-delete-submit"
            onClick={onConfirm}
            disabled={isDeleting}
            ref={confirmButtonRef}
          >
            {isDeleting ? "Deleting..." : `Delete ${count} ${itemType}${count > 1 ? 's' : ''}`}
          </button>
        </div>
      </section>
    </div>
  );

  return createPortal(modalContent, document.body);
}
