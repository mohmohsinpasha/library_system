import React from 'react';
import { User, DollarSign } from 'lucide-react';

const MemberPanel = ({
  library, selectedMember, setSelectedMember, handlePayFees, member
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <User className="w-5 h-5" />
      Select Member
    </h2>
    <select
      value={selectedMember}
      onChange={e => setSelectedMember(e.target.value)}
      className="w-full p-2 border rounded mb-4"
    >
      {Array.from(library.members.values()).map(m => (
        <option key={m.id} value={m.id}>{m.name} ({m.membershipType})</option>
      ))}
    </select>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Current Loans:</span>
        <span className="font-semibold">{member.currentLoans.length} / {member.maxLoans}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Outstanding Fees:</span>
        <span className={`font-semibold ${member.outstandingFees > 10 ? 'text-red-600' : 'text-green-600'}`}>
          INR {member.outstandingFees.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Can Checkout:</span>
        <span className={member.canCheckout().allowed ? 'text-green-600' : 'text-red-600'}>
          {member.canCheckout().allowed ? 'Yes' : 'No'}
        </span>
      </div>
      {member.outstandingFees > 0 && (
        <button
          onClick={handlePayFees}
          className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <DollarSign className="w-4 h-4 inline mr-1" />
          Pay Fees
        </button>
      )}
    </div>
  </div>
);

export default MemberPanel;
