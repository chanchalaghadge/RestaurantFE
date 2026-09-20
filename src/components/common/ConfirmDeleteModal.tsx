import "./ConfirmDeleteModal.css";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ConfirmDeleteModalProps = {
  itemName: string;
  itemType: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

function ConfirmDeleteModal({ itemName, itemType, onCancel, onConfirm, isDeleting = false }: ConfirmDeleteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the confirm button when modal opens
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }

    // Trap focus within modal
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
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
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
        <h2 id="confirm-delete-title">Delete {itemType}?</h2>
        <p id="confirm-delete-description">
          Are you sure you want to delete <strong>{itemName}</strong>?
        </p>
        <small>
          This action cannot be undone. The {itemType.toLowerCase()} and its related data will be permanently removed.
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
            {isDeleting ? "Deleting..." : `Delete ${itemType}`}
          </button>
        </div>
      </section>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ConfirmDeleteModal;
