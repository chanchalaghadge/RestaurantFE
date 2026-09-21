import { useState } from 'react';
import { createPortal } from 'react-dom';

interface OrderHistoryEntry {
  id: string;
  orderId: number;
  action: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

interface OrderHistoryModalProps {
  orderId: number;
  onClose: () => void;
}

export default function OrderHistoryModal({ orderId, onClose }: OrderHistoryModalProps) {
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  const mockHistory: OrderHistoryEntry[] = [
    {
      id: '1',
      orderId,
      action: 'Status Changed',
      previousValue: 'Pending',
      newValue: 'Preparing',
      changedBy: 'John Smith',
      changedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      orderId,
      action: 'Item Added',
      previousValue: '',
      newValue: 'Pizza Margherita x2',
      changedBy: 'John Smith',
      changedAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      orderId,
      action: 'Customer Updated',
      previousValue: 'Jane Doe',
      newValue: 'Jane Smith',
      changedBy: 'Admin',
      changedAt: new Date(Date.now() - 10800000).toISOString()
    }
  ];

  // Simulate API call
  setTimeout(() => {
    setHistory(mockHistory);
    setLoading(false);
  }, 500);

  const modalContent = (
    <div className="modal-backdrop animated-backdrop" onClick={onClose}>
      <div className="modal-content order-history-modal animated-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-compact">
          <h2>Order #${orderId} History</h2>
          <button className="modal-close-compact" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="modal-loading-compact">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="modal-empty-compact">No history available</div>
        ) : (
          <div className="history-list-compact">
            {history.map((entry) => (
              <div key={entry.id} className="history-item-compact">
                <div className="history-header-compact">
                  <span className="history-action-compact">{entry.action}</span>
                  <span className="history-time-compact">
                    {new Date(entry.changedAt).toLocaleString()}
                  </span>
                </div>
                <div className="history-details-compact">
                  {entry.previousValue && (
                    <div className="history-change-compact">
                      <span className="change-label-compact">Previous:</span>
                      <span className="change-value-compact previous">{entry.previousValue}</span>
                    </div>
                  )}
                  <div className="history-change-compact">
                    <span className="change-label-compact">New:</span>
                    <span className="change-value-compact new">{entry.newValue}</span>
                  </div>
                </div>
                <div className="history-footer-compact">
                  <span className="history-user-compact">Changed by: {entry.changedBy}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-footer-compact">
          <button className="secondary-button-compact" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
