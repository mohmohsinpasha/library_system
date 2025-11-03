class LibraryItem {
  constructor(id, title, itemType) {
    this.id = id;
    this.title = title;
    this.itemType = itemType;
    this.isCheckedOut = false;
    this.checkoutHistory = [];
    this.reservations = [];
    this.currentLoan = null;
  }

  get totalCheckouts() { return this.checkoutHistory.length; }
  get isPopular() { return this.totalCheckouts > 10; }
  get baseLoanPeriod() { throw new Error('Must implement baseLoanPeriod in subclass'); }
  get lateFeePerDay() { throw new Error('Must implement lateFeePerDay in subclass'); }

  getLoanPeriod() {
    let period = this.baseLoanPeriod;
    if (this.isPopular) period -= 2;
    return Math.max(period, 1);
  }

  canBeCheckedOut() { return !this.isCheckedOut; }

  checkout(member, date = new Date()) {
    if (!this.canBeCheckedOut()) throw new Error(`${this.title} is already checked out`);
    const loan = new Loan(this, member, date);
    this.isCheckedOut = true;
    this.currentLoan = loan;
    this.checkoutHistory.push({ memberId: member.id, date });
    return loan;
  }

  returnItem(returnDate = new Date()) {
    if (!this.isCheckedOut) throw new Error(`${this.title} is not checked out`);
    const loan = this.currentLoan;
    loan.processReturn(returnDate);
    this.isCheckedOut = false;
    this.currentLoan = null;

    if (this.reservations.length > 0) {
      const nextReservation = this.reservations.shift();
      nextReservation.notify();
    }
    return loan;
  }

  addReservation(member) {
    if (!this.isCheckedOut) throw new Error('Cannot reserve an available item');
    const reservation = new Reservation(this, member);
    this.reservations.push(reservation);
    return reservation;
  }

  canBeRenewed() { return this.reservations.length === 0; }
}

class Book extends LibraryItem {
  constructor(id, title, author, isbn) {
    super(id, title, 'Book');
    this.author = author;
    this.isbn = isbn;
  }
  get baseLoanPeriod() { return 14; }
  get lateFeePerDay() { return 10.00; }
}

class DVD extends LibraryItem {
  constructor(id, title, director, duration) {
    super(id, title, 'DVD');
    this.director = director;
    this.duration = duration;
  }
  get baseLoanPeriod() { return 7; }
  get lateFeePerDay() { return 10.00; }
}

class Magazine extends LibraryItem {
  constructor(id, title, issue, publishDate) {
    super(id, title, 'Magazine');
    this.issue = issue;
    this.publishDate = publishDate;
  }
  get baseLoanPeriod() { return 3; }
  get lateFeePerDay() { return 10; }
}

class Member {
  constructor(id, name, membershipType = 'standard') {
    this.id = id;
    this.name = name;
    this.membershipType = membershipType;
    this.currentLoans = [];
    this.loanHistory = [];
    this.outstandingFees = 0;
    this.reservations = [];
  }

  get maxLoans() { return this.membershipType === 'premium' ? 8 : 5; }

  canCheckout() {
    if (this.currentLoans.length >= this.maxLoans) return { allowed: false, reason: 'Maximum loan limit reached' };
    if (this.outstandingFees > 10) return { allowed: false, reason: 'Outstanding fees exceed INR 10' };
    return { allowed: true };
  }

  checkoutItem(item, date = new Date()) {
    const checkStatus = this.canCheckout();
    if (!checkStatus.allowed) throw new Error(checkStatus.reason);
    const loan = item.checkout(this, date);
    this.currentLoans.push(loan);
    this.loanHistory.push(loan);
    return loan;
  }

  returnItem(item, returnDate = new Date()) {
    const loanIndex = this.currentLoans.findIndex(l => l.item.id === item.id);
    if (loanIndex === -1) throw new Error('Item not found in current loans');
    const loan = this.currentLoans[loanIndex];
    item.returnItem(returnDate);
    this.currentLoans.splice(loanIndex, 1);
    if (loan.lateFee > 0) this.outstandingFees += loan.lateFee;
    return loan;
  }

  renewItem(itemId) {
    const loan = this.currentLoans.find(l => l.item.id === itemId);
    if (!loan) throw new Error('Item not found in current loans');
    if (!loan.item.canBeRenewed()) throw new Error('Item has reservations and cannot be renewed');
    if (loan.renewalCount >= 1) throw new Error('Item has already been renewed once');
    loan.renew();
    return loan;
  }

  reserveItem(item) {
    const reservation = item.addReservation(this);
    this.reservations.push(reservation);
    return reservation;
  }

  payFees(amount) {
    if (amount > this.outstandingFees) throw new Error('Payment exceeds outstanding fees');
    this.outstandingFees -= amount;
    return this.outstandingFees;
  }

  getOverdueLoans() {
    const now = new Date();
    return this.currentLoans.filter(loan => loan.isOverdue(now));
  }
}

class Loan {
  constructor(item, member, checkoutDate = new Date()) {
    this.item = item;
    this.member = member;
    this.checkoutDate = new Date(checkoutDate);
    this.dueDate = this.calculateDueDate();
    this.returnDate = null;
    this.lateFee = 0;
    this.renewalCount = 0;
  }

  calculateDueDate() {
    const due = new Date(this.checkoutDate);
    due.setDate(due.getDate() + this.item.getLoanPeriod());
    return due;
  }

  isOverdue(currentDate = new Date()) {
    return !this.returnDate && currentDate > this.dueDate;
  }

  getDaysOverdue(currentDate = new Date()) {
    if (!this.isOverdue(currentDate)) return 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    const timeDiff = currentDate.getTime() - this.dueDate.getTime();
    const daysLate = Math.ceil(timeDiff / msPerDay);
    return daysLate;
  }

  calculateLateFee(returnDate = new Date()) {
    const daysOverdue = this.getDaysOverdue(returnDate);
    return daysOverdue * this.item.lateFeePerDay;
  }

  processReturn(returnDate = new Date()) {
    this.returnDate = new Date(returnDate);
    this.lateFee = this.calculateLateFee(returnDate);
  }

  renew() {
    if (this.renewalCount >= 1) throw new Error('Maximum renewals reached');
    this.renewalCount++;
    const newDueDate = new Date(this.dueDate);
    newDueDate.setDate(newDueDate.getDate() + this.item.getLoanPeriod());
    this.dueDate = newDueDate;
  }
}

class Reservation {
  constructor(item, member, reservationDate = new Date()) {
    this.item = item;
    this.member = member;
    this.reservationDate = new Date(reservationDate);
    this.notified = false;
  }
  notify() { this.notified = true; }
}

class Library {
  constructor(name) {
    this.name = name;
    this.catalog = new Map();
    this.members = new Map();
  }

  addItem(item) { this.catalog.set(item.id, item); }
  addMember(member) { this.members.set(member.id, member); }
  getItem(itemId) { return this.catalog.get(itemId); }
  getMember(memberId) { return this.members.get(memberId); }

  checkoutItem(memberId, itemId, date) {
    const member = this.getMember(memberId);
    const item = this.getItem(itemId);
    if (!member) throw new Error('Member not found');
    if (!item) throw new Error('Item not found');
    return member.checkoutItem(item, date);
  }

  returnItem(memberId, itemId, returnDate) {
    const member = this.getMember(memberId);
    const item = this.getItem(itemId);
    if (!member) throw new Error('Member not found');
    if (!item) throw new Error('Item not found');
    return member.returnItem(item, returnDate);
  }

  getOverdueItems() {
    const overdueLoans = [];
    this.members.forEach(member => {
      const overdue = member.getOverdueLoans();
      overdueLoans.push(...overdue.map(loan => ({
        member, loan
      })));
    });
    return overdueLoans;
  }

  getAvailableItems() {
    return Array.from(this.catalog.values()).filter(item => !item.isCheckedOut);
  }

  getPopularItems() {
    return Array.from(this.catalog.values())
      .filter(item => item.isPopular)
      .sort((a, b) => b.totalCheckouts - a.totalCheckouts);
  }
}

export {
  LibraryItem, Book, DVD, Magazine,
  Member, Loan, Reservation, Library
};