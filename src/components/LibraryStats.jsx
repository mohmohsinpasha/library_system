import React from 'react';

const LibraryStats = ({ library, availableItems, overdueItems }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Library Stats</h2>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
        <span className="text-gray-700">Total Items</span>
        <span className="font-bold text-blue-600">{library.catalog.size}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-green-50 rounded">
        <span className="text-gray-700">Available</span>
        <span className="font-bold text-green-600">{availableItems.length}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-red-50 rounded">
        <span className="text-gray-700">Overdue</span>
        <span className="font-bold text-red-600">{overdueItems.length}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
        <span className="text-gray-700">Total Members</span>
        <span className="font-bold text-purple-600">{library.members.size}</span>
      </div>
    </div>
  </div>
);

export default LibraryStats;
