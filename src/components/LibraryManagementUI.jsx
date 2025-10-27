import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Book, DVD, Library, Magazine, Member } from '../model/library';
import MemberPanel from './MemberPanel';
import LibraryStats from './LibraryStats';
import ActivityLog from './ActivityLog';
import CurrentLoansTable from './CurrentLoansTable';
import AvailableItemsPanel from './AvailableItemsPanel';

const LibraryManagementUI = () => {
    const [library] = useState(() => {
        const lib = new Library('Community Library');
        const book1 = new Book('B004', 'The White Tiger', 'Aravind Adiga', '1234');
        const book2 = new Book('B005', 'The God of Small Things', 'Arundhati Roy', '5678');
        const book3 = new Book('B006', 'Midnight’s Children', 'Salman Rushdie', '7868');
        for (let i = 0; i < 12; i++) {
            book1.checkoutHistory.push({ memberId: `M${i}`, date: new Date() });
        }
        lib.addItem(book1);
        lib.addItem(book2);
        lib.addItem(book3);
        lib.addItem(new DVD('D001', 'Inception', 'Christopher Nolan', 148));
        lib.addItem(new Magazine('M001', 'National Geographic', 'Vol 244 No 1', '2024-01'));
        lib.addMember(new Member('MEM001', 'Ahmed', 'standard'));
        lib.addMember(new Member('MEM002', 'Mohsin', 'premium'));
        lib.addMember(new Member('MEM003', 'Jhon', 'standard'));
        return lib;
    });

    const [selectedMember, setSelectedMember] = useState('MEM001');
    const [selectedItem, setSelectedItem] = useState(null);
    const [logs, setLogs] = useState([]);

    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
    };

    const handleCheckout = () => {
        try {
            if (!selectedItem) {
                addLog('Please select an item', 'error');
                return;
            }
            const loan = library.checkoutItem(selectedMember, selectedItem);
            addLog(` Checked out "${loan.item.title}" to ${loan.member.name}. Due: ${loan.dueDate.toLocaleDateString()}`, 'success');
            setSelectedItem(null);
        } catch (error) {
            addLog(` ${error.message}`, 'error');
        }
    };

    const handleReturn = (itemId) => {
        try {
            const loan = library.returnItem(selectedMember, itemId, new Date());
            const feeMsg = loan.lateFee > 0 ? ` Late fee: INR ${loan.lateFee.toFixed(2)}` : '';
            addLog(` Returned "${loan.item.title}".${feeMsg}`, 'success');
        } catch (error) {
            addLog(` ${error.message}`, 'error');
        }
    };

    const handleRenew = (itemId) => {
        try {
            const member = library.getMember(selectedMember);
            member.renewItem(itemId);
            addLog(` Renewed item successfully`, 'success');
        } catch (error) {
            addLog(` ${error.message}`, 'error');
        }
    };

    const handleReserve = (itemId) => {
        try {
            const member = library.getMember(selectedMember);
            const item = library.getItem(itemId);
            member.reserveItem(item);
            addLog(` Reserved "${item.title}"`, 'success');
        } catch (error) {
            addLog(` ${error.message}`, 'error');
        }
    };

    const handlePayFees = () => {
        try {
            const member = library.getMember(selectedMember);
            if (member.outstandingFees === 0) {
                addLog('No outstanding fees', 'info');
                return;
            }
            member.payFees(member.outstandingFees);
            addLog(` Paid INR ${member.outstandingFees.toFixed(2)} in fees`, 'success');
        } catch (error) {
            addLog(` ${error.message}`, 'error');
        }
    };

    const member = library.getMember(selectedMember);
    const availableItems = library.getAvailableItems();
    const overdueItems = library.getOverdueItems();

    return (
        <div className="min-h-screen  from-blue-50 to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-indigo-900 mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8" />
                        Library - Management System
                    </h1>

                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <MemberPanel
                        library={library}
                        selectedMember={selectedMember}
                        setSelectedMember={setSelectedMember}
                        handlePayFees={handlePayFees}
                        member={member}
                    />
                    <LibraryStats
                        library={library}
                        availableItems={availableItems}
                        overdueItems={overdueItems}
                    />
                    <ActivityLog logs={logs} />
                </div>
                <CurrentLoansTable
                    member={member}
                    handleReturn={handleReturn}
                    handleRenew={handleRenew}
                />
                <AvailableItemsPanel
                    availableItems={availableItems}
                    handleCheckout={handleCheckout}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    library={library}
                    handleReserve={handleReserve}
                />
            </div>
        </div>
    );
};

export default LibraryManagementUI;
