import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

const AvailableItemsPanel = ({
  availableItems, handleCheckout, selectedItem, setSelectedItem, library, handleReserve
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <BookOpen className="w-5 h-5" />
      Available Items
    </h2>
    <div className="mb-4 flex gap-3">
      <select
        value={selectedItem || ''}
        onChange={e => setSelectedItem(e.target.value)}
        className="flex-1 p-2 border rounded"
      >
        <option value="">Select an item to checkout...</option>
        {availableItems.map(item => (
          <option key={item.id} value={item.id}>
            {item.title} ({item.itemType}) - {item.getLoanPeriod()} days
            {item.isPopular ? ' [POPULAR]' : ''}
          </option>
        ))}
      </select>
      <button
        onClick={handleCheckout}
        disabled={!selectedItem}
        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Checkout
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {library.catalog.size === 0 ? (
        <p className="text-gray-500">No items in catalog</p>
      ) : (
        Array.from(library.catalog.values()).map(item => (
          <div
            key={item.id}
            className={`p-4 border rounded-lg ${
              item.isCheckedOut ? 'bg-gray-50 border-gray-300' : 'bg-white border-indigo-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{item.title}</h3>

            </div>
            <p className="text-sm text-gray-600 mb-2">{item.itemType}</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Loan period: {item.getLoanPeriod()} days</div>
              <div>Late fee: INR {item.lateFeePerDay}/day</div>
              <div>Times checked out: {item.totalCheckouts}</div>
            </div>
            {item.isCheckedOut ? (
              <div className="mt-3">
                <span className="text-xs text-red-600 font-medium">Currently checked out</span>
                <button
                  onClick={() => handleReserve(item.id)}
                  className="mt-2 w-full px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Reserve ({item.reservations.length} in queue)
                </button>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Available
              </div>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

export default AvailableItemsPanel;
