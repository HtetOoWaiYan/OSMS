# Local Online Shop Management System

## Business Requirements Document

# Context

Small sellers in Myanmar primarily use Facebook and TikTok for sales, handling customer communication via Viber, Facebook Messenger, and Telegram. Most workflows are manual or spreadsheet-based, leading to inefficiencies. This system will automate core workflows for small sellers and reduce human errors.

## Typical Customer Journey:

1. Potential customer sees an ad or finds a product via social media search
2. Customer browses/searches the seller’s social media page
3. Customer finds desired product
4. Customer messages the seller (inbox) to inquire
5. If satisfied with product/service, customer places an order
6. Customer pays via:

- Local online payment (KBZPay, AYA Pay, CBPay, mobile banking)
- Cash on delivery (COD)

7. Agent confirms order and sends product to delivery service
8. Order is delivered in 2–3 days (varies by location)
9. For COD orders:

- Delivery service collects payment
- Cash is remitted to agent’s bank/mobile payment account

10. Order is marked complete

# Goal

Provide a user-friendly system that automates \~80% of daily online shop tasks: item management, orders, payments, basic analytics, and customer messaging. Optimized for low-end phones and slow mobile networks.

# Target Audience

- Students or office workers who need a low-cost, easy-to-learn system to manage their new online business.
- Shop owners currently using spreadsheets or notebooks who are overwhelmed by manual data entry and are losing track of orders and inventory.
- Business owners seeking data insights to identify best-selling products, track profitability, and operate more efficiently.

# The Problem to Solve

- **Overselling risk** from inaccurate manual stock tracking
- **Lost orders/poor service** due to untracked order statuses (pending/paid/delivering)
- **Profit/loss uncertainty** from error-prone manual calculations
- **Lost revenue** from unreconciled COD payments
- **Time wasted** on manual invoices/status updates
- **Missed sales** from slow responses to customer inquiries
- **No centralized system** for inventory, customers, or orders

# The Solution & Scope

A comprehensive software system to manage online shop workflows in one place, featuring:

- **Web-based management dashboard**
- **Integrated Telegram chatbot** for customer interactions
- **Telegram mini-app** for browsing/ordering

##### In Scope:

- Dashboard (user roles, item/order/invoice management, analytics)
- Telegram chatbot
- Telegram mini-app for customers

##### Out of Scope:

- Direct payment gateway integration
- Advanced AI agent workflows

# Plan & Timeline

### Phase 1: Research & Planning (July 28 – Aug 8\)

- Idea Creation & Brainstorming _(July 28 – 30\)_
- Competitor & Market Research _(July 31 – Aug 3\)_
- Write BRD _(Aug 4 – 6\)_
- BRD Review & Finalization _(Aug 7 – 8\)_

### Phase 2: Design (Aug 9 – Aug 16\)

- User Journey Mapping _(Aug 9 – 10\)_
- Wireframe & UI/UX Design _(Aug 10 – 16\)_
- System Architecture Design _(Aug 10 – 16\)_

### Phase 3: Implementation (Aug 17 – Aug 24\)

- Development _(Aug 17 – 24\)_

### Phase 4: Testing & Deployment (Aug 25 – Sep 1\)

- Internal Testing _(Aug 25 – 26\)_
- Beta Testing _(Aug 27 – 30\)_
- Release _(September 1\)_

# Components and Features

## Core Features

1. **Management Dashboard** (Web)

- **Users**: Manage admins/agents with permissions
- **Items**: Manage products, pricing, stock
- **Analytics**: Sales, product, and profit reports
- **Orders**: Track order lifecycle
- **Invoices**: View/edit invoices

2. **Chatbot** (Telegram)

- Auto-reply to inquiries (product info, orders, agent requests)
- Send order updates/invoices
- Launch mini-app via buttons

3. **Mini Web App** (Telegram Mini App)

- Browse/search/filter products
- Add to cart & checkout (name/phone/address)
- Choose COD or online payment
- Confirm orders

# Functional Requirements

### Management Dashboard

- **Authentication**: Sign up/login with email \+ password
- **User Roles**:
  - **Admin**: Full project permissions (1 admin/project)
  - **Agent**: Limited permissions (added by admin)
- **Projects**:
  - Create/setup projects
  - Integrate Telegram bot via token
  - Access setup guides/tours
- **Items**: Add/update/remove items (images, name, description, stock)
- **Pricing**: Set/modify prices, discounts, profit margins
- **Orders**: Update status (pending/confirmed/delivering/delivered/paid/done) \+ notes
- **Analytics** (Admin-only):
  - Popular/profitable items
  - Order funnels
  - Monthly profits

### Chatbot

- Auto-reply based on inquiry type (info, orders, agent requests)
- Buttons to launch mini-app
- Send automated:
  - Order status updates
  - Invoices

### Mini Web App

- Browse/search/filter/sort products
- Cart \+ checkout flow
- Payment method selection (COD/online)
- Order confirmation

# Non-Functional Requirements

- **Validation**: Form/checkout input validation
- **Security**: Modern security practices
- **Privacy**: Minimal encrypted data; user consent
- **Usability**: Intuitive for non-technical users
- **Performance**: p95 API latency \< 300ms
- **Availability**: 99.9% uptime
- **Scalability**: Support 10k orders/day
- **Maintainability**: Simple, clean architecture
- **Extensibility**: Easy feature additions
