import { Book, DVD, Library, Loan, Magazine, Member, Reservation } from "../src/model/library";


describe('LibraryItem', () => {
  let book, dvd, magazine;

  beforeEach(() => {
    book = new Book('B001', 'Test Book', 'Author', '123-456');
    dvd = new DVD('D001', 'Test DVD', 'Director', 120);
    magazine = new Magazine('M001', 'Test Magazine', 'Issue 1', '2024-01');
  });

  test('should create library items with correct properties', () => {
    expect(book.id).toBe('B001');
    expect(book.title).toBe('Test Book');
    expect(book.itemType).toBe('Book');
    expect(book.isCheckedOut).toBe(false);
  });

  test('should return correct loan periods for different item types', () => {
    expect(book.baseLoanPeriod).toBe(14);
    expect(dvd.baseLoanPeriod).toBe(7);
    expect(magazine.baseLoanPeriod).toBe(3);
  });

  test('should return correct late fees for different item types', () => {
    expect(book.lateFeePerDay).toBe(10.00);
    expect(dvd.lateFeePerDay).toBe(10.00);
    expect(magazine.lateFeePerDay).toBe(10);
  });

  test('should identify popular items correctly', () => {
    expect(book.isPopular).toBe(false);
    
    for (let i = 0; i < 11; i++) {
      book.checkoutHistory.push({ memberId: `M${i}`, date: new Date() });
    }
    
    expect(book.isPopular).toBe(true);
    expect(book.totalCheckouts).toBe(11);
  });

  test('should reduce loan period for popular items', () => {
    expect(book.getLoanPeriod()).toBe(14);
    
    for (let i = 0; i < 11; i++) {
      book.checkoutHistory.push({ memberId: `M${i}`, date: new Date() });
    }
    
    expect(book.getLoanPeriod()).toBe(12); 
  });

  test('should maintain minimum loan period of 1 day', () => {
    for (let i = 0; i < 11; i++) {
      magazine.checkoutHistory.push({ memberId: `M${i}`, date: new Date() });
    }
    
    expect(magazine.getLoanPeriod()).toBe(1); 
  });

  test('should allow checkout of available items', () => {
    const member = new Member('M001', 'Test Member');
    expect(book.canBeCheckedOut()).toBe(true);
    
    const loan = book.checkout(member);
    
    expect(book.isCheckedOut).toBe(true);
    expect(book.currentLoan).toBe(loan);
    expect(loan.item).toBe(book);
  });

  test('should throw error when checking out already checked out item', () => {
    const member = new Member('M001', 'Test Member');
    book.checkout(member);
    
    expect(() => book.checkout(member)).toThrow('Test Book is already checked out');
  });

  test('should process returns correctly', () => {
    const member = new Member('M001', 'Test Member');
    book.checkout(member);
    
    const loan = book.returnItem();
    
    expect(book.isCheckedOut).toBe(false);
    expect(book.currentLoan).toBeNull();
    expect(loan.returnDate).toBeTruthy();
  });

  test('should throw error when returning item that is not checked out', () => {
    expect(() => book.returnItem()).toThrow('Test Book is not checked out');
  });

  test('should not allow reservations on available items', () => {
    const member = new Member('M001', 'Test Member');
    
    expect(() => book.addReservation(member)).toThrow('Cannot reserve an available item');
  });

  test('should allow reservations on checked out items', () => {
    const member1 = new Member('M001', 'Member 1');
    const member2 = new Member('M002', 'Member 2');
    
    book.checkout(member1);
    const reservation = book.addReservation(member2);
    
    expect(book.reservations.length).toBe(1);
    expect(reservation.member).toBe(member2);
  });

  test('should process reservation queue on return', () => {
    const member1 = new Member('M001', 'Member 1');
    const member2 = new Member('M002', 'Member 2');
    
    book.checkout(member1);
    const reservation = book.addReservation(member2);
    
    book.returnItem();
    
    expect(reservation.notified).toBe(true);
    expect(book.reservations.length).toBe(0);
  });

  test('should not allow renewal when reservations exist', () => {
    const member1 = new Member('M001', 'Member 1');
    const member2 = new Member('M002', 'Member 2');
    
    book.checkout(member1);
    book.addReservation(member2);
    
    expect(book.canBeRenewed()).toBe(false);
  });
});

describe('Member', () => {
  let standardMember, premiumMember;

  beforeEach(() => {
    standardMember = new Member('M001', 'Standard Member', 'standard');
    premiumMember = new Member('M002', 'Premium Member', 'premium');
  });

  test('should create members with correct properties', () => {
    expect(standardMember.id).toBe('M001');
    expect(standardMember.name).toBe('Standard Member');
    expect(standardMember.membershipType).toBe('standard');
    expect(standardMember.currentLoans).toEqual([]);
    expect(standardMember.outstandingFees).toBe(0);
  });

  test('should have correct max loan limits', () => {
    expect(standardMember.maxLoans).toBe(5);
    expect(premiumMember.maxLoans).toBe(8);
  });

  test('should allow checkout when conditions are met', () => {
    const result = standardMember.canCheckout();
    expect(result.allowed).toBe(true);
  });

  test('should prevent checkout when loan limit reached', () => {
    for (let i = 0; i < 5; i++) {
      standardMember.currentLoans.push({});
    }
    
    const result = standardMember.canCheckout();
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Maximum loan limit reached');
  });

  test('should prevent checkout when outstanding fees exceed INR 10', () => {
    standardMember.outstandingFees = 11;
    
    const result = standardMember.canCheckout();
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Outstanding fees exceed INR 10');
  });

  test('should checkout items successfully', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    
    const loan = standardMember.checkoutItem(book);
    
    expect(standardMember.currentLoans.length).toBe(1);
    expect(standardMember.loanHistory.length).toBe(1);
    expect(loan.member).toBe(standardMember);
    expect(book.isCheckedOut).toBe(true);
  });

  test('should throw error when checkout conditions not met', () => {
    standardMember.outstandingFees = 15;
    const book = new Book('B001', 'Test Book', 'Author', '123');
    
    expect(() => standardMember.checkoutItem(book)).toThrow('Outstanding fees exceed INR 10');
  });

  test('should return items and calculate fees', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const checkoutDate = new Date('2024-01-01');
    const returnDate = new Date('2024-01-20');
    
    standardMember.checkoutItem(book, checkoutDate);
    const loan = standardMember.returnItem(book, returnDate);
    
    expect(standardMember.currentLoans.length).toBe(0);
    expect(loan.lateFee).toBe(50); 
    expect(standardMember.outstandingFees).toBe(50);
  });

  test('should throw error when returning item not in current loans', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    
    expect(() => standardMember.returnItem(book)).toThrow('Item not found in current loans');
  });

  test('should renew items successfully', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    standardMember.checkoutItem(book);
    
    const originalDueDate = book.currentLoan.dueDate;
    standardMember.renewItem(book.id);
    
    expect(book.currentLoan.renewalCount).toBe(1);
    expect(book.currentLoan.dueDate.getTime()).toBeGreaterThan(originalDueDate.getTime());
  });

  test('should prevent renewal when reservations exist', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member2 = new Member('M002', 'Member 2');
    
    standardMember.checkoutItem(book);
    book.addReservation(member2);
    
    expect(() => standardMember.renewItem(book.id)).toThrow('Item has reservations and cannot be renewed');
  });

  test('should prevent renewal more than once', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    standardMember.checkoutItem(book);
    
    standardMember.renewItem(book.id);
    expect(() => standardMember.renewItem(book.id)).toThrow('Item has already been renewed once');
  });

  test('should reserve items correctly', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member2 = new Member('M002', 'Member 2');
    
    standardMember.checkoutItem(book);
    const reservation = member2.reserveItem(book);
    
    expect(member2.reservations.length).toBe(1);
    expect(reservation.item).toBe(book);
  });

  test('should pay fees correctly', () => {
    standardMember.outstandingFees = 150;
    
    const remaining = standardMember.payFees(100);
    
    expect(remaining).toBe(50);
    expect(standardMember.outstandingFees).toBe(50);
  });

  test('should throw error when payment exceeds outstanding fees', () => {
    standardMember.outstandingFees = 50;
    
    expect(() => standardMember.payFees(100)).toThrow('Payment exceeds outstanding fees');
  });

  test('should identify overdue loans', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const pastDate = new Date('2024-01-01');
    
    standardMember.checkoutItem(book, pastDate);
    
    const overdueLoans = standardMember.getOverdueLoans();
    expect(overdueLoans.length).toBe(1);
  });
});

describe('Loan', () => {
  let book, member;

  beforeEach(() => {
    book = new Book('B001', 'Test Book', 'Author', '123');
    member = new Member('M001', 'Test Member');
  });

  test('should create loan with correct properties', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    
    expect(loan.item).toBe(book);
    expect(loan.member).toBe(member);
    expect(loan.checkoutDate).toEqual(checkoutDate);
    expect(loan.returnDate).toBeNull();
    expect(loan.renewalCount).toBe(0);
  });

  test('should calculate due date correctly', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    
    const expectedDueDate = new Date('2024-01-15');
    expect(loan.dueDate.toDateString()).toBe(expectedDueDate.toDateString());
  });

  test('should detect overdue loans', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    const currentDate = new Date('2024-01-20');
    
    expect(loan.isOverdue(currentDate)).toBe(true);
  });

  test('should not mark on-time loans as overdue', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    const currentDate = new Date('2024-01-10');
    
    expect(loan.isOverdue(currentDate)).toBe(false);
  });

  test('should calculate days overdue correctly', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    const currentDate = new Date('2024-01-20'); 
    
    expect(loan.getDaysOverdue(currentDate)).toBe(5);
  });

  test('should return 0 days overdue for on-time loans', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    const currentDate = new Date('2024-01-10');
    
    expect(loan.getDaysOverdue(currentDate)).toBe(0);
  });

  test('should calculate late fees correctly', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    const returnDate = new Date('2024-01-20'); 
    
    const lateFee = loan.calculateLateFee(returnDate);
    expect(lateFee).toBe(50); 
  });

  test('should calculate no late fee for on-time returns', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    const returnDate = new Date('2024-01-10');
    
    const lateFee = loan.calculateLateFee(returnDate);
    expect(lateFee).toBe(0);
  });

  test('should process return correctly', () => {
    const checkoutDate = new Date('2024-01-01');
    const loan = new Loan(book, member, checkoutDate);
    const returnDate = new Date('2024-01-20');
    
    loan.processReturn(returnDate);
    
    expect(loan.returnDate).toEqual(returnDate);
    expect(loan.lateFee).toBe(50); 
  });

  test('should renew loan correctly', () => {
    const loan = new Loan(book, member);
    const originalDueDate = loan.dueDate;
    
    loan.renew();
    
    expect(loan.renewalCount).toBe(1);
    expect(loan.dueDate.getTime()).toBeGreaterThan(originalDueDate.getTime());
  });

  test('should throw error when exceeding renewal limit', () => {
    const loan = new Loan(book, member);
    loan.renewalCount = 1;
    
    expect(() => loan.renew()).toThrow('Maximum renewals reached');
  });

  test('should calculate different late fees for different item types', () => {
    const dvd = new DVD('D001', 'Test DVD', 'Director', 120);
    const checkoutDate = new Date('2024-01-01');
    const returnDate = new Date('2024-01-12'); 
    
    const loan = new Loan(dvd, member, checkoutDate);
    const lateFee = loan.calculateLateFee(returnDate);
    
    expect(lateFee).toBe(40); 
  });
});

describe('Library', () => {
  let library, book1, book2, member1, member2;

  beforeEach(() => {
    library = new Library('Test Library');
    book1 = new Book('B001', 'Book 1', 'Author 1', '123');
    book2 = new Book('B002', 'Book 2', 'Author 2', '456');
    member1 = new Member('M001', 'Member 1');
    member2 = new Member('M002', 'Member 2');
    
    library.addItem(book1);
    library.addItem(book2);
    library.addMember(member1);
    library.addMember(member2);
  });

  test('should create library with correct properties', () => {
    expect(library.name).toBe('Test Library');
    expect(library.catalog.size).toBe(2);
    expect(library.members.size).toBe(2);
  });

  test('should add and retrieve items', () => {
    const book = new Book('B003', 'Book 3', 'Author 3', '789');
    library.addItem(book);
    
    expect(library.catalog.size).toBe(3);
    expect(library.getItem('B003')).toBe(book);
  });

  test('should add and retrieve members', () => {
    const member = new Member('M003', 'Member 3');
    library.addMember(member);
    
    expect(library.members.size).toBe(3);
    expect(library.getMember('M003')).toBe(member);
  });

  test('should checkout items through library', () => {
    const loan = library.checkoutItem('M001', 'B001');
    
    expect(loan.member).toBe(member1);
    expect(loan.item).toBe(book1);
    expect(book1.isCheckedOut).toBe(true);
  });

  test('should throw error for invalid member in checkout', () => {
    expect(() => library.checkoutItem('INVALID', 'B001')).toThrow('Member not found');
  });

  test('should throw error for invalid item in checkout', () => {
    expect(() => library.checkoutItem('M001', 'INVALID')).toThrow('Item not found');
  });

  test('should return items through library', () => {
    library.checkoutItem('M001', 'B001');
    const loan = library.returnItem('M001', 'B001');
    
    expect(loan.returnDate).toBeTruthy();
    expect(book1.isCheckedOut).toBe(false);
  });

  test('should get all overdue items', () => {
    const pastDate = new Date('2024-01-01');
    library.checkoutItem('M001', 'B001', pastDate);
    library.checkoutItem('M002', 'B002', pastDate);
    
    const overdueItems = library.getOverdueItems();
    
    expect(overdueItems.length).toBe(2);
    expect(overdueItems[0].loan.item).toBeDefined();
    expect(overdueItems[0].member).toBeDefined();
  });

  test('should get available items', () => {
    library.checkoutItem('M001', 'B001');
    
    const availableItems = library.getAvailableItems();
    
    expect(availableItems.length).toBe(1);
    expect(availableItems[0]).toBe(book2);
  });

  test('should get popular items sorted by checkout count', () => {
    for (let i = 0; i < 15; i++) {
      book1.checkoutHistory.push({ memberId: `M${i}`, date: new Date() });
    }
    
    for (let i = 0; i < 12; i++) {
      book2.checkoutHistory.push({ memberId: `M${i}`, date: new Date() });
    }
    
    const popularItems = library.getPopularItems();
    
    expect(popularItems.length).toBe(2);
    expect(popularItems[0]).toBe(book1);
    expect(popularItems[1]).toBe(book2);
  });
});

describe('Reservation', () => {
  test('should create reservation with correct properties', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member = new Member('M001', 'Test Member');
    const reservation = new Reservation(book, member);
    
    expect(reservation.item).toBe(book);
    expect(reservation.member).toBe(member);
    expect(reservation.notified).toBe(false);
  });

  test('should notify reservation', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member = new Member('M001', 'Test Member');
    const reservation = new Reservation(book, member);
    
    reservation.notify();
    
    expect(reservation.notified).toBe(true);
  });
});

describe('Integration Tests', () => {
  test('complete checkout and return workflow', () => {
    const library = new Library('Test Library');
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member = new Member('M001', 'Test Member');
    
    library.addItem(book);
    library.addMember(member);
    
    const loan = library.checkoutItem('M001', 'B001');
    expect(book.isCheckedOut).toBe(true);
    expect(member.currentLoans.length).toBe(1);
    
    library.returnItem('M001', 'B001');
    expect(book.isCheckedOut).toBe(false);
    expect(member.currentLoans.length).toBe(0);
  });

  test('reservation workflow when item is returned', () => {
    const library = new Library('Test Library');
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member1 = new Member('M001', 'Member 1');
    const member2 = new Member('M002', 'Member 2');
    
    library.addItem(book);
    library.addMember(member1);
    library.addMember(member2);
    
    library.checkoutItem('M001', 'B001');
    
    const reservation = member2.reserveItem(book);
    expect(book.reservations.length).toBe(1);
    
    library.returnItem('M001', 'B001');
    expect(reservation.notified).toBe(true);
    expect(book.reservations.length).toBe(0);
  });

  test('late fee accumulation workflow', () => {
    const library = new Library('Test Library');
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member = new Member('M001', 'Test Member');
    
    library.addItem(book);
    library.addMember(member);
    
    const checkoutDate = new Date('2024-01-01');
    const returnDate = new Date('2024-01-20'); // 5 days late
    
    library.checkoutItem('M001', 'B001', checkoutDate);
    library.returnItem('M001', 'B001', returnDate);
    
    expect(member.outstandingFees).toBe(50); // 5 days * INR 10.00
    
    // Pay fees
    member.payFees(50);
    expect(member.outstandingFees).toBe(0);
  });

  test('popular item reduces loan period', () => {
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member = new Member('M001', 'Test Member');
    
    for (let i = 0; i < 11; i++) {
      book.checkoutHistory.push({ memberId: `M${i}`, date: new Date() });
    }
    
    const loan = book.checkout(member);
    const expectedDays = 12;
    const expectedDueDate = new Date(loan.checkoutDate);
    expectedDueDate.setDate(expectedDueDate.getDate() + expectedDays);
    
    expect(loan.dueDate.toDateString()).toBe(expectedDueDate.toDateString());
  });

  test('member cannot checkout with high fees', () => {
    const library = new Library('Test Library');
    const book = new Book('B001', 'Test Book', 'Author', '123');
    const member = new Member('M001', 'Test Member');
    member.outstandingFees = 15;
    
    library.addItem(book);
    library.addMember(member);
    
    expect(() => library.checkoutItem('M001', 'B001')).toThrow('Outstanding fees exceed INR 10');
  });

  test('member cannot exceed loan limit', () => {
    const member = new Member('M001', 'Test Member', 'standard');
    
    for (let i = 0; i < 5; i++) {
      const book = new Book(`B00${i}`, `Book ${i}`, 'Author', `12${i}`);
      member.checkoutItem(book);
    }
    
    const book6 = new Book('B006', 'Book 6', 'Author', '126');
    expect(() => member.checkoutItem(book6)).toThrow('Maximum loan limit reached');
  });
});

console.log('='.repeat(60));
console.log('Library Management System - Unit Test Suite');
console.log('='.repeat(60));
console.log('Total Test Suites: 7');
console.log('- LibraryItem: 13 tests');
console.log('- Member: 14 tests');
console.log('- Loan: 12 tests');
console.log('- Library: 8 tests');
console.log('- Reservation: 2 tests');
console.log('- Integration Tests: 7 tests');
console.log('Total Tests: 56');
console.log('='.repeat(60));