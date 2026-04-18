# Crymad Cash — 85 Screens Build Checklist

## AUTH PAGES (8 files)

### 1. Auth Layout `(auth)/layout.tsx`
- [ ] Centered glass card container
- [ ] Crymad Cash logo at top
- [ ] Living background visible behind
- [ ] Decorative energy arcs at card edges

### 2. Login `/login`
- [ ] Email input field
- [ ] Password input with show/hide toggle
- [ ] "Forgot Password?" link → /forgot-password
- [ ] "Sign In" button with loading spinner state
- [ ] Error message display (inline)
- [ ] "Create Account" link → /register

### 3. Register `/register`
- [ ] Personal/Business toggle (pill switch)
- [ ] Email field
- [ ] Password with strength indicator (weak/medium/strong bar)
- [ ] Confirm Password with mismatch indicator
- [ ] Privacy Policy checkbox + link
- [ ] Terms checkbox + link
- [ ] "Sign Up" button
- [ ] Business fields (Company Name, Reg Number, Business Type) shown conditionally
- [ ] "Already have an account?" link → /login

### 4. Verify Email `/register/verify-email`
- [ ] Large email SVG illustration
- [ ] "Check Your Email" heading
- [ ] Email displayed in mono font
- [ ] "Resend Email" button with 60s cooldown timer
- [ ] "Back to Login" link
- [ ] Floating particle decorations around icon

### 5. Complete Registration `/register/complete`
- [ ] 3-step progress dots
- [ ] Step 1: First Name, Last Name, Date of Birth
- [ ] Step 2: Phone with country code, Address (Street, City, State, Zip, Country)
- [ ] Step 3: Language dropdown (14 languages), profile summary
- [ ] Back/Continue/Complete buttons
- [ ] Animated step transitions

### 6. KYC `/register/kyc`
- [ ] Shield icon with pulse animation
- [ ] "Identity Verification" heading
- [ ] Status indicator (Not Started/Pending/Approved/Rejected)
- [ ] "Start Verification" button
- [ ] "Skip for Now" link → /dashboard
- [ ] 3 info cards: Takes ~5 min, Gov ID required, Up to 48hrs

### 7. Forgot Password `/forgot-password`
- [ ] Key/lock icon
- [ ] Email input
- [ ] "Send Reset Link" button with loading state
- [ ] Success state: "Check your email" with email icon
- [ ] "Back to Login" link

### 8. 2FA Verification `/login/verify-2fa`
- [ ] "Two-Factor Authentication" heading
- [ ] 6 individual digit inputs (auto-focus next)
- [ ] "Verify" button with loading state
- [ ] "Resend Code" with 30s countdown
- [ ] "Back to Login" link

---

## DASHBOARD PAGES (16 files + inline modals)

### 9. Dashboard Home `/dashboard` ✅ DONE
- [x] Profile card with avatar ring, name, email, date
- [x] "PERSONAL ACCOUNT" badge with shimmer
- [x] KYC verified dot
- [x] Tab bar (8 tabs)
- [x] 3 Wallet capsules with breathing SVG rings
- [x] Connection lines with traveling dots
- [x] Total balance bar
- [x] Quick actions (Send, Receive, Swap, Pay Bills)
- [x] Activity timeline feed (5 transactions)
- [x] Welcome card with gradient text + orbit decoration

### 10. E-Wallet `/e-wallet`
- [ ] Wallet header: icon, name, verified badge, balance "$0.00"
- [ ] 4 action buttons: Internal Transfer, Withdraw to Bank, Withdraw to Crypto, Withdraw to Card
- [ ] Transaction table: ID, Reference, Amount, Fee, Email, Status, Date
- [ ] Filter dropdown + search + pagination (5+ sample rows)
- [ ] Info card with feature badges
- [ ] InternalTransferModal: recipient, amount, description, Send/Cancel
- [ ] BankWithdrawalModal: beneficiary selector, amount, currency, Withdraw/Cancel
- [ ] CryptoWithdrawalModal: token selector, network, address, amount, OTP step
- [ ] CardLoadModal: card selector, amount, OTP step

### 11. E-Wallet Beneficiaries `/e-wallet/beneficiaries`
- [ ] Table: Name, Bank, Account (masked), Currency, Status, Actions
- [ ] "Add Beneficiary" button → modal
- [ ] AddBeneficiaryModal: name, bank, account/IBAN, SWIFT, currency, country
- [ ] Edit + Delete modals
- [ ] Empty state illustration

### 12. Crypto `/crypto`
- [ ] Crypto wallet header with balance
- [ ] Action Row 1: Deposit, Withdraw, Buy, Sync
- [ ] Action Row 2: Withdraw to Card, Withdraw to Bank, Swap
- [ ] Custodial wallets grid (BTC, ETH, USDT, USDC, SOL, BNB) with real icons
- [ ] Deposit addresses list with network badges + copy buttons
- [ ] Crypto transactions table with TxHash column
- [ ] DepositModal: network selector, QR placeholder, address, copy
- [ ] WithdrawModal: token, network, address, amount, OTP
- [ ] BuyCryptoModal: fiat amount, crypto selector, rate preview
- [ ] SwapModal: from/to tokens, estimate, OTP, processing state
- [ ] CardLoadFromCryptoModal
- [ ] BankWithdrawFromCryptoModal

### 13. Cards `/cards`
- [ ] KYC gate (3 states: no_account, kyc_pending, approved)
- [ ] Physical Card visual (gradient, Mastercard logo, masked number, name, expiry, balance)
- [ ] Virtual Card visual (different gradient)
- [ ] Per-card actions: Load, Lock/Unlock, Activate, View Details
- [ ] "Order New Card" button → /cards/order
- [ ] Card transactions table
- [ ] Info card with features
- [ ] LoadCardModal: wallet source, amount, OTP
- [ ] LockCardModal: reason, OTP
- [ ] ActivateCardModal: 16-digit card number input
- [ ] CredentialsModal: OTP step, then show number/CVV/expiry with 30s auto-hide

### 14. Card Setup `/cards/setup`
- [ ] Full form: First/Middle/Last Name, Cardholder names
- [ ] Gender radio, DOB, Place of Birth, Occupation
- [ ] Phone + country code, full address fields
- [ ] Submit + Cancel buttons
- [ ] Success confirmation state

### 15. Order Cards `/cards/order`
- [ ] Virtual vs Physical card selection (2 large cards)
- [ ] Fee quote breakdown
- [ ] Wallet source selector with balance
- [ ] OTP step
- [ ] "Place Order" button
- [ ] Success confirmation

### 16. Card Fees `/cards/fees`
- [ ] Fee schedule table: Order, Load, Transaction, Other fees
- [ ] Amount + description per fee
- [ ] Important notice footer

### 17. Orders `/orders`
- [ ] PENDING/COMPLETED tab bar
- [ ] Orders table: Order Number, Status, Amount, Title, Total, Date, Actions
- [ ] Filter + search + pagination (5+ rows)
- [ ] OrderDetailModal: summary, items, fees, payment timeline
- [ ] RefundModal: reason, amount, submit

### 18. Transactions `/transactions`
- [ ] INTERNAL/CRYPTO/BANK WITHDRAWAL/CARDS sub-tabs
- [ ] Table: ID, Reference, Amount, Fee, Email, Status, Date, Completed Date
- [ ] Different sample data per tab (6+ rows each)
- [ ] Filter + search + reset + pagination
- [ ] TransactionDetailModal: full info, status timeline, crypto TxHash

### 19. Subscriptions `/subscriptions`
- [ ] PENDING/ACTIVE/COMPLETED tabs
- [ ] Table: Reference, Status, Product, Cost, Fees, Total, Expiry, Start, Interval, etc.
- [ ] SubscriptionDetailModal: info, payment history, next billing
- [ ] CancelSubscriptionModal: warning, reason, confirm

### 20. Reports `/reports`
- [ ] Filters: date range, transaction type, wallet type
- [ ] "Generate Report" button
- [ ] Summary cards: Inflow, Outflow, Net, Count
- [ ] Report table with sample data
- [ ] "Export CSV" button + pagination

### 21. Banking Portal `/banking`
- [ ] "Welcome to Personal Banking" heading
- [ ] 6 benefit cards (Payable, Receivable, Treasury, On/Off Ramp, Remittance, Global Payments)
- [ ] "Get Started" button → SubscriptionModal
- [ ] SubscriptionModal: $9 + $4.95/mo info
- [ ] PaymentModal: wallet selector, fee breakdown, confirm

### 22. Banking Dashboard `/banking/dashboard`
- [ ] Account info card (number, routing, SWIFT, status)
- [ ] 6 feature cards with "Coming Soon" badges
- [ ] Recent banking activity feed (3 items)

### 23. Help/FAQs `/help`
- [ ] "How can we help?" heading
- [ ] Search bar with icon
- [ ] Category tabs: GENERAL/E-WALLET/BANKING/CRYPTO/CARDS
- [ ] FAQ accordion (6+ items per category, 30+ total)
- [ ] Expandable answers with smooth animation

### 24. Notifications `/notifications`
- [ ] Filter: All/Read/Unread
- [ ] "Mark All as Read" button
- [ ] Notification cards: icon, title, description, timestamp, read/unread dot
- [ ] 6 sample notifications (varied types)
- [ ] Click to expand + mark as read

---

## PROFILE & SECURITY (2 modals from nav dropdown)

### 25. Profile Modal
- [ ] Full Name (editable), KYC status + Start button
- [ ] Status badge, Account Type, Country, Language dropdown
- [ ] Phone (editable), Email (read-only)
- [ ] Edit/Save toggle, Close button

### 26. Security Modal
- [ ] 2FA section: status + Enable/Disable toggle
- [ ] Disable Account section: warning, type "DISABLE" confirmation
- [ ] Close button

---

## BUSINESS-ONLY PAGES (5 files + modals)

### 27. Team Management `/team`
- [ ] Team table: Name, Email, Role badge, Status, Joined, Actions
- [ ] 5 sample members
- [ ] "Invite Member" + "Batch Import" buttons
- [ ] Search + role filter + pagination
- [ ] InviteModal: email, role, permissions checkboxes
- [ ] BatchImportModal: CSV upload, preview
- [ ] EditRoleModal, RemoveModal

### 28. Payouts `/payouts`
- [ ] PENDING APPROVAL/PROCESSING/COMPLETED/CANCELLED tabs
- [ ] Payouts table with multi-currency data (9+ rows across tabs)
- [ ] Pending: Approve/Reject buttons
- [ ] "New Payout" + "Batch Payout" buttons
- [ ] CreatePayoutModal: recipient, amount, currency, reference, process immediately checkbox
- [ ] BatchPayoutModal: CSV upload, preview, total
- [ ] PayoutDetailModal: info, status timeline, webhook status

### 29. Recurring Payments `/recurring-payments`
- [ ] Card-based layout (not table) — 4 sample cards
- [ ] Each: recipient, amount, cycle badge, wallet type, next date, Pause/Edit/Cancel
- [ ] CreateRecurringModal: recipient, amount, cycle, wallet type, dates
- [ ] EditRecurringModal, CancelRecurringModal
- [ ] Empty state

### 30. Rewards `/rewards`
- [ ] Rewards wallet balance card (prominent)
- [ ] PAYOUTS/DEBITS/HISTORY tabs
- [ ] Payouts: Issue + Batch buttons, history table
- [ ] Debits: Debit button, table with Refund actions
- [ ] History: combined log with filters
- [ ] IssueRewardModal, BatchRewardModal, DebitRewardModal, RefundDebitModal

### 31. API Settings `/settings/api`
- [ ] API Credentials: masked key, copy, regenerate
- [ ] Webhook Config: URL, event checkboxes, test, save
- [ ] Webhook Logs table (4 rows, click for payload)
- [ ] Integration Guide: Node.js/PHP/Python code snippets with tab selector
- [ ] RegenerateKeyModal, PayloadModal

---

**TOTAL: 31 page files + 40+ inline modals + tab states = 85 screens**
