import "./ConfirmDeleteModal.css";

type ConfirmDeleteModalProps = {
  itemName: string;
  itemType: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmDeleteModal({ itemName, itemType, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <div className="confirm-delete-backdrop" onClick={onCancel}>
      <section className="confirm-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-delete-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="confirm-delete-close" onClick={onCancel} aria-label="Close delete confirmation">x</button>
        <div className="confirm-delete-icon" aria-hidden="true">!</div>
        <h2 id="confirm-delete-title">Delete {itemType}?</h2>
        <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
        <small>This action cannot be undone. The {itemType.toLowerCase()} and its related data will be permanently removed.</small>
        <div className="confirm-delete-actions">
          <button type="button" className="confirm-delete-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="confirm-delete-submit" onClick={onConfirm}>Delete {itemType}</button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmDeleteModal;
