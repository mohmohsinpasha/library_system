import React from 'react';
import { Clock } from 'lucide-react';

const CurrentLoansTable = ({ member, handleReturn, handleRenew }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <Clock className="w-5 h-5" />
      Current Loans for {member.name}
    </h2>
    {member.currentLoans.length === 0 ? (
      <p className="text-gray-500">No current loans</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Checkout Date</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {member.currentLoans.map(loan => {
              const isOverdue = loan.isOverdue();
              const daysOverdue = loan.getDaysOverdue();
              return (
                <tr key={loan.item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{loan.item.title}</td>
                  <td className="px-4 py-3">{loan.item.itemType}</td>
                  <td className="px-4 py-3">{loan.checkoutDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3">{loan.dueDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {isOverdue ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        On time
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReturn(loan.item.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Return
                      </button>
                      <button
                        onClick={() => handleRenew(loan.item.id)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                      >
                        Renew
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default CurrentLoansTable;
