import { useState } from 'react';

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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content order-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order #${orderId} History</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {loading ? (
          <div className="modal-loading">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="modal-empty">No history available</div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div key={entry.id} className="history-item">
                <div className="history-header">
                  <span className="history-action">{entry.action}</span>
                  <span className="history-time">
                    {new Date(entry.changedAt).toLocaleString()}
                  </span>
                </div>
                <div className="history-details">
                  <div className="history-change">
                    <span className="change-label">Previous:</span>
                    <span className="change-value previous">{entry.previousValue || '—'}</span>
                  </div>
                  <div className="history-change">
                    <span className="change-label">New:</span>
                    <span className="change-value new">{entry.newValue}</span>
                  </div>
                </div>
                <div className="history-footer">
                  <span className="history-user">Changed by: {entry.changedBy}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
