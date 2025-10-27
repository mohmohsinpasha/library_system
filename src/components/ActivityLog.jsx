import React from 'react';

const ActivityLog = ({ logs }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {logs.length === 0 ? (
        <p className="text-gray-400 text-sm">No activity yet</p>
      ) : (
        logs.slice(-5).reverse().map((log, idx) => (
          <div key={idx} className={`text-xs p-2 rounded ${
            log.type === 'success' ? 'bg-green-50 text-green-800' :
            log.type === 'error'   ? 'bg-red-50 text-red-800' :
                                     'bg-gray-50 text-gray-800'
          }`}>
            <span className="text-gray-500">{log.time}</span> {log.message}
          </div>
        ))
      )}
    </div>
  </div>
);

export default ActivityLog;
