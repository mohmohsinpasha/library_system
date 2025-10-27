# React Library Management System

A **component-based React application** that simulates a full-featured **Library Management System** built using **domain-driven design (DDD)** principles.  
It includes books, members, loans, reservations, renewals, and fee management all handled in-memory with realistic business logic.

---

##  Features

- Domain driven architecture (Book, Member, Loan, Reservation models)
- Checkout, Return, Renew, and Reserve library items
- Automatic overdue detection and late fee calculation
- Multiple member types (Standard, Premium) with different limits
- Fee payment tracking
- Library statistics dashboard
- Activity log for all actions
- Fully componentized React UI

---


Each **model** defines business rules and relationships.  
Each **component** focuses on a specific UI function.

---

## Installation & Setup

### 1️ Clone the Repository
```bash
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system
npm i
npm start
