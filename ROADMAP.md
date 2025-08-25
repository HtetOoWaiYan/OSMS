# Purple Shopping (OSMS) - Development Roadmap

## Overview
This roadmap outlines the implementation phases for Purple Shopping, transitioning from the current foundation to a fully functional MVP within a 10-day development timeline.

### Dual Application Architecture
Purple Shopping consists of two integrated applications:
- **🖥️ Dashboard** (`/dashboard/`) - Project listing and selection interface
- **🖥️ Project Dashboard** (`/dashboard/[project-id]/`) - Project-specific management interface for business owners and staff  
- **📱 Mini-App** (`/app/`) - Customer-facing Telegram Web App for shopping and ordering

### Multi-Project Support ✅
**Enhanced Architecture for Scalability:**
- **Project Listing**: Central dashboard showing all user projects with roles
- **Dynamic Routes**: Project-specific dashboards via `/dashboard/[project-id]/` 
- **Clean Layout Separation**: Project listing has Purple Shopping header, project pages have streamlined sidebar
- **Role-Based Access**: Project-specific permissions and role management
- **Simplified Navigation**: Always-visible sidebar without toggle complexity
- **Type-Safe Components**: Required projectId parameters throughout navigation components

## Current Status: Phase 1.3 Complete ✅
**Foundation, Multi-Project Infrastructure, User Management & Item Management System** - All infrastructure, database schema, authentication, UI framework, clean multi-project architecture, comprehensive user management system, and complete item management system completed.

### Recent Updates: Bug Fixes & Optimizations ✅
- **Critical Filter Logic Bug Fixed**: Resolved issue where items weren't appearing due to incorrect filter application
- **Database Query Optimization**: Enhanced item retrieval with LEFT JOIN to include items without active price records
- **Type Safety Improvements**: Updated type definitions for better null handling and compatibility
- **Code Cleanup**: Removed debug code and unused imports for production readiness

---

## Phase 1: Core Data Operations (Days 1-3)
**Priority: Get data flowing through the system**

### 1.1 Project Management & User Setup

#### **Project Creation Flow** ✅
**What we need from user:**
- [x] **Required Fields:**
  - Project name (shop/business name)
  - Telegram bot token (with guidance link)
  - Optional: Project description
- [x] **Implementation Details:**
  - New users with no projects get onboarding flow
  - Onboarding guides through first project creation
  - Project creation form integrated into onboarding
  - Provide clear instructions: "How to create a Telegram Bot" link
  - Link to BotFather guide: https://core.telegram.org/bots/tutorial
  - **Multi-Project Support**: Users can create multiple projects
  - **Important**: Guide user through BotFather process:
    1. Start chat with @BotFather
    2. Send `/newbot` command
    3. Follow prompts to name bot
    4. Copy the bot token provided
    5. Paste token into our form
- [x] **Technical Tasks:**
  - Create onboarding flow for new users (no projects exist)
  - Multi-step onboarding: Welcome → Bot Setup Guide → Project Creation
  - Create server action: `createProject(name, botToken, description?)`
  - Redirect to specific project dashboard after creation
  - Auto-assign creator as admin role in `user_roles` table
  - Validate bot token format (should start with number:string)
  - Store project in `projects` table with `telegram_bot_token`
  - **Enhanced**: Support for multiple projects per user

#### **Project Selection & Management** ✅  
- [x] **Multi-Project Dashboard:**
  - Project listing page at `/dashboard` showing all user projects
  - Project cards display name, description, role, and creation/update dates
  - "Open Project" buttons navigate to project-specific dashboard
  - "New Project" button for creating additional projects
- [x] **Dynamic Project Routes:**
  - Project-specific dashboards at `/dashboard/[project-id]/`
  - All management pages scoped to specific project context
  - Project-aware navigation and breadcrumbs
- [x] **Project Switching:**
  - "Switch Project" link in project dashboard sidebar
  - Seamless navigation between multiple user projects
  - Project context maintained throughout user session

#### **Project Settings Management** ✅
- [x] **Settings Page Implementation:**
  - Complete settings page at `/dashboard/settings`
  - Accessible via user profile dropdown in sidebar footer
  - Project information form with validation and error handling
  - Bot token display with masking and visibility toggle
- [x] **Project Update Functionality:**
  - Server action for updating project name, description, and bot token
  - Admin-only access control with proper permission checking
  - Service role client usage for secure database mutations
  - Data access layer following Next.js security best practices
- [x] **UI Components:**
  - Professional settings form with real-time validation
  - Masked bot token display with show/hide toggle
  - Project details panel showing creation and update timestamps
  - Success/error feedback with user-friendly messages

#### **Project Selection**
- [x] **Single Project Only (MVP Constraint):**
  - Limit to one project per user in UI
  - No project switching interface needed
  - Users with existing project go directly to dashboard
- [x] **New User Onboarding:**
  - Check if user has project on login/dashboard access
  - If no project: redirect to onboarding flow
  - If project exists: direct to dashboard
  - Onboarding includes: Welcome → Bot Setup Guide → Project Creation
- [x] **Post-Creation Flow:**
  - After successful project creation → redirect to dashboard
  - Dashboard shows proper project data and navigation
  - No option to create additional projects in UI
- [x] **Future Enhancement (Post-MVP):**
  - Multi-project support can be added later
  - Database already supports multiple projects per user
  - UI just needs to enforce single project limitation

#### **Default Admin Role Assignment**
- [x] **Auto-assignment Logic:**
  - Project creator automatically gets 'admin' role
  - Insert into `user_roles` table: `(user_id, project_id, role: 'admin', is_active: true)`
  - Admin can invite others later as 'agent' or 'admin'

#### **User Role Management** ✅
- [x] **Team Member Invitation & Management:**
  - Complete user invitation system with email input and role selection
  - Send invitation emails via Supabase Auth with proper error handling
  - Support for both new user registration and existing user invitation
  - Smart detection of existing vs new users for proper invitation flow
  - Admin and agent role assignment during invitation process
  - Re-invitation support for existing users with duplicate handling
- [x] **Comprehensive User Operations:**
  - **Create**: Invite new team members with role selection (admin/agent)
  - **Read**: Display user list with email, role, status, and join dates
  - **Update**: Edit user roles (admin ↔ agent) with validation
  - **Delete**: Remove users from project with soft delete architecture
  - **Re-invite**: Resend invitations to pending or inactive users
- [x] **Advanced User Management Interface:**
  - Professional data table with user information and actions
  - Dropdown actions menu (Edit Role, Remove User, Resend Invitation)
  - Edit role modal dialog with form validation
  - Confirmation dialogs for destructive actions (remove user)
  - Real-time status updates and success/error feedback
  - Admin-only access control with permission validation
- [x] **Role-based Permission System:**
  - Comprehensive permission helper: `checkUserPermission(userId, projectId, action)`
  - Admin permissions: manage items, orders, users, project settings
  - Agent permissions: manage items, orders (no user management access)
  - Server-side permission validation in all user management actions
  - Row-level security policies for data access control
- [x] **Technical Implementation:**
  - Server actions: create, update role, remove user, resend invitation
  - Data access layer with service role client for admin operations
  - Zod validation schemas for all user management operations
  - Type-safe user management with comprehensive error handling
  - Integration with Supabase Auth and custom user role system

### 1.3 Item Management System ✅

#### **CRUD Operations for Items** ✅
**Core Item Data Required:**
- [x] **Essential Fields:**
  - Item name (required)
  - Description (optional, textarea)
  - Price (current selling price)
  - Stock quantity (integer, default 0)
  - Category selection (dropdown from categories)
- [x] **Optional Fields for MVP:**
  - SKU (auto-generate if empty: PROJ-001, PROJ-002...)
  - Weight (for shipping, optional)
  - Tags (array of strings, for search)
  - Min stock level (for low stock alerts)
  - Featured item status (boolean, with star indicators)
  - Discount percentage (with auto-calculation of selling price)
- [x] **Implementation Tasks:**
  - Create item form with validation (Zod schema)
  - Server action: `createItem()`, `updateItem()`, `deleteItem()`
  - Item list page with search, filters, and bulk operations
  - Item detail/edit page with professional UX
  - Soft delete (set `is_active: false` instead of hard delete)
  - Bulk status updates (active/inactive toggle)

#### **Upload and Manage Product Images** ✅
- [x] **Image Upload System:**
  - Supabase Storage for images with public bucket configuration
  - Multiple images per item (stored in `item_images` table)
  - Image upload component with drag-drop functionality
  - Image preview and delete/restore functionality
  - 1MB file size limit with client and server validation
- [x] **Image Management:**
  - Set primary image (first image as default)
  - Display order management for multiple images
  - Real thumbnail images in items table (no more placeholders)
  - Image optimization and storage integration
  - Display images in item cards and detail views
  - Public URL generation for direct image access

#### **Inventory Management** ✅
- [x] **Stock Quantity Tracking:**
  - Current stock display in item list with visual indicators
  - Stock adjustment capability in item forms
  - Minimum stock level alerts and low stock indicators
  - Stock movement logging preparation in `stock_movements` table
- [x] **Low Stock Alerts:**
  - Visual indicators for items below min_stock_level
  - Low stock items highlighting in list view
  - Dashboard preparation for stock alert notifications

#### **Category Management** ✅
- [x] **Simple Category System:**
  - Category name and description
  - One level only (no hierarchy for MVP)
  - CRUD operations: create, edit, delete categories
  - Assign items to categories during creation/editing
  - Category-based item filtering in listings
  - Modal-based category creation from item forms

### 1.4 Data Access Layer ✅

#### **Server Actions Implementation**
- [x] **Data Access Layer Pattern (Next.js Security Best Practice):**
  - Follow pattern from: https://nextjs.org/blog/security-nextjs-server-components-actions
  - Create dedicated data access layer: `src/lib/data/` folder
  - Separate data fetching from server actions
  - Example structure: `src/lib/data/items.ts`, `src/lib/data/categories.ts`, `src/lib/data/projects.ts`
  - Data functions handle all database operations and security checks
  - **CRITICAL: Service Role Client Usage**: Use `createServiceRoleClient()` for all mutations (INSERT/UPDATE/DELETE)
  - **Security Pattern**: Always verify permissions with regular client BEFORE using service role client
- [x] **Server Actions as Thin Wrappers:**
  - Server actions in `src/lib/actions/` call data layer functions
  - Actions handle form validation and user input processing
  - Actions return user-friendly responses and handle redirects
  - Keep business logic in data layer, not in actions
- [x] **Type-safe Database Operations:**
  - Use TypeScript for full type safety with database types
  - Each data function returns typed results with proper error handling
  - Consistent return type: `Promise<{success: boolean, error?: string, data?: T}>`
- [x] **Error Handling Patterns:**
  - Data layer throws errors, actions catch and format them
  - Database constraint errors mapped to user-friendly messages
  - Authentication errors handled with proper redirects
  - Logging for debugging (console.error for now)
- [x] **Input Validation with Zod:**
  - Schema definitions in `src/lib/validations/` folder
  - Validate all server action inputs before calling data layer
  - Data layer assumes inputs are already validated
  - Client-side form validation using same schemas
  - Error messages returned for invalid inputs
- [x] **RLS Policy Compliance:**
  - Data layer handles all RLS policy compliance
  - Regular client (`createClient()`) for reads and permission checks
  - Service role client (`createServiceRoleClient()`) for mutations only
  - All queries automatically filtered by user's project access
  - Use `createClient()` for authenticated operations in data layer only
  - Server actions never directly access database
- [x] **Data Layer Security Pattern:**
  - Data functions verify user authentication and authorization
  - Check user project access before any database operation
  - Return appropriate errors for unauthorized access
  - Verify RLS policies work correctly in testing
  - **"server-only" imports required** for all data access layer files

#### **Client State Management**
- [x] **Zustand Stores for UI State:**
  - Create stores for: current project, user preferences, loading states
  - Item management state: selected items, filters, search query
  - Order management state: cart items, selected customer
  - Store structure: `src/lib/stores/` folder
- [x] **Optimistic Updates:**
  - Item creation: show item in list immediately, rollback on error
  - Stock updates: update UI immediately, sync with server
  - Order status changes: immediate feedback, server confirmation
- [x] **Error Boundary Implementation:**
  - Global error boundary for unhandled errors
  - Form-specific error boundaries for graceful failures
  - Toast notifications for user feedback
  - Error recovery options (retry, go back)

---

## Phase 2: Order Management (Days 4-5)
**Priority: Complete order lifecycle**

### 2.1 Order Creation & Management

#### **Order CRUD Operations**
**Order Data Required:**
- [ ] **Essential Order Fields:**
  - Customer selection (from existing customers or create new)
  - Order items (item + quantity + price at time of order)
  - Payment method (cod, online, kbz_pay, aya_pay, cb_pay, mobile_banking)
  - Shipping address (copy from customer or manual entry)
  - Delivery notes (optional)
- [ ] **Auto-calculated Fields:**
  - Order number (auto-generate: ORD-2025-0001 format)
  - Subtotal (sum of item_price * quantity)
  - Shipping cost (manual input for MVP, auto-calculation later)
  - Tax amount (configurable percentage, default 0 for MVP)
  - Total amount (subtotal + shipping + tax - discount)
- [ ] **Implementation Tasks:**
  - Order creation wizard/form (multi-step for complex orders)
  - Order list with filters (status, date range, customer, payment status)
  - Order detail view with full information and actions
  - Order editing (before confirmation only)
  - Server actions: `createOrder()`, `updateOrder()`, `updateOrderStatus()`

#### **Customer Management Integration**
- [ ] **Customer Data Required:**
  - Name, phone number (required)
  - Email (optional)
  - Multiple addresses support
  - Customer notes/preferences
- [ ] **Customer Workflow:**
  - Search existing customers during order creation
  - Quick customer creation form within order flow
  - Customer detail page with order history
  - Customer list with search and contact info
- [ ] **Address Management:**
  - Default shipping address per customer
  - Multiple addresses per customer support
  - Address validation (basic format checking)
  - Copy address to order (denormalized for history)

#### **Payment Processing (MVP - Basic)**
- [ ] **Payment Method Selection:**
  - Dropdown with available methods (from enum)
  - Payment status tracking (pending, paid, failed, refunded)
  - Manual payment confirmation (admin marks as paid)
  - Payment notes field for reference numbers
- [ ] **Payment Integration (Future):**
  - For MVP: manual payment tracking only
  - Prepare structure for online payment gateway integration
  - Payment history logging in orders table
  - Receipt generation (simple, text-based)

### 2.2 Order Workflow

#### **Status Management**
**Order Lifecycle (8 States):**
- [ ] **Status Flow Implementation:**
  - `pending` → `confirmed` → `delivering` → `delivered` → `paid` → `done`
  - Alternative flow: `pending` → `cancelled`
  - Status change validation (can't skip states, proper transitions only)
  - Status change logging with timestamps and user who made change
- [ ] **Status Actions:**
  - Confirm Order: pending → confirmed (stock deduction happens here)
  - Start Delivery: confirmed → delivering (generate tracking if needed)
  - Mark Delivered: delivering → delivered (customer confirmation)
  - Payment Received: delivered → paid (manual confirmation)
  - Complete Order: paid → done (final state, no more changes)
  - Cancel Order: any → cancelled (stock restoration if confirmed)
- [ ] **Automated Notifications:**
  - Status change notifications to customer (via Telegram if available)
  - Internal notifications for staff (dashboard alerts)
  - Email notifications (future enhancement)

#### **Shipping Integration (Basic)**
- [ ] **Shipping Cost Management:**
  - Manual shipping cost entry per order
  - Default shipping rates by location (future: automatic calculation)
  - Free shipping threshold option (project setting)
- [ ] **Tracking System:**
  - Manual tracking number entry
  - Tracking status updates (basic text notes)
  - Customer tracking information sharing
- [ ] **Delivery Management:**
  - Delivery date estimation (manual entry)
  - Delivery notes and special instructions
  - Delivery confirmation workflow
  - Failed delivery handling and rescheduling

---

## Phase 3: Dashboard & Analytics (Days 6-7)
**Priority: Business insights and management interface**

### 3.1 Dashboard Enhancement
- [ ] **Real Data Integration**
  - Replace placeholder content with actual metrics
  - Revenue tracking and analytics
  - Inventory summaries
  - Recent activity feeds
- [ ] **Data Visualization**
  - Sales charts and graphs
  - Inventory status indicators
  - Order status distribution
  - Customer activity metrics

### 3.2 Reporting & Export
- [ ] **Reports Generation**
  - Sales reports by date range
  - Inventory reports
  - Customer reports
  - Export to CSV/PDF
- [ ] **Search & Filtering**
  - Advanced search across entities
  - Filter combinations
  - Saved search queries

---

## Phase 4: Telegram Integration (Days 8-9)
**Priority: Customer interaction automation**

### 4.1 Basic Bot Setup
- [ ] **Telegram Bot Creation**
  - Bot token configuration
  - Webhook setup for message handling
  - Basic command structure (/start, /help, /catalog)
- [ ] **Message Processing**
  - Incoming message handling
  - Customer identification and linking
  - Basic product catalog sharing
- [ ] **Order Processing via Telegram**
  - Simple order placement through chat
  - Order confirmation messages
  - Status update notifications

### 4.2 Mini-App Integration (Optional/Advanced)
- [ ] **Telegram Web App Setup**
  - Configure `/app/app/` route as mini-app entry point
  - Telegram WebApp SDK integration
  - Mini-app authentication flow
- [ ] **Customer-Facing Features**
  - Mini-app interface for product browsing (`/app/catalog/`)
  - Shopping cart functionality (`/app/cart/`)
  - Checkout process integration (`/app/checkout/`)
- [ ] **Advanced Features**
  - Image sharing for products
  - Location sharing for delivery
  - Payment integration through mini-app

---

## Phase 5: Polish & Deployment (Day 10)
**Priority: Production readiness**

### 5.1 Testing & Bug Fixes
- [ ] **End-to-End Testing**
  - Complete user workflows (both dashboard and mini-app)
  - Cross-platform testing (desktop dashboard, mobile mini-app)
  - Edge case handling
  - Data consistency checks
- [ ] **UI/UX Polish**
  - Loading states and transitions
  - Error message improvements
  - Responsive design validation (dashboard + mini-app)
  - Accessibility basic compliance

### 5.2 Deployment Preparation
- [ ] **Environment Configuration**
  - Production environment variables
  - Database migration strategy
  - Static asset optimization
- [ ] **Documentation**
  - User guide for shop owners
  - API documentation for integrations
  - Deployment guide

---

## Success Criteria for MVP

### Core Functionality
1. ✅ User can register and authenticate
2. ✅ User can create and manage a shop project
3. ✅ User can add, edit, and manage inventory items with full search/filter functionality
4. ⏳ User can process customer orders end-to-end
5. ⏳ User can track order status and customer information
6. ⏳ Basic Telegram bot responds to commands
7. ⏳ Dashboard provides meaningful business insights

### Technical Criteria
1. ✅ Type-safe throughout (TypeScript + Zod) with enhanced null handling
2. ✅ Secure multi-tenant data isolation with optimized database queries
3. ✅ Modern, responsive user interface with professional search/filter UX
4. ✅ Proper error handling and user feedback with form validation
5. ✅ Basic performance optimization with debounced search and efficient queries
6. ✅ Clean, maintainable code structure with removed debug code and unused imports

### Demonstration Readiness
1. ⏳ Complete user workflow from registration to order fulfillment
2. ✅ Sample data with working item management, search, and filtering capabilities
3. ⏳ Working Telegram bot with basic functionality
4. ✅ Professional presentation-ready interface with polished item management
5. ✅ Documentation for system usage and features with detailed changelog

---

## Risk Mitigation

### High-Risk Areas
1. **Telegram Integration Complexity** - Keep initial bot simple, focus on core commands
2. **Time Constraints** - Prioritize core features, keep advanced features optional
3. **Database Performance** - Use proper indexing, optimize queries early
4. **Authentication Edge Cases** - Test thoroughly, implement proper error handling

### Contingency Plans
- Telegram integration can be simplified to basic webhooks if mini-app proves complex
- Advanced analytics can be replaced with simple counting if time is short
- Payment integration can be mocked for demonstration purposes
- Focus on core shop management if customer-facing features become complex

---

## Implementation Notes

### **Critical Development Guidelines** ⚠️
- **❌ NEVER use `npm run dev`** - Development server is strictly forbidden
- **✅ Use `npm run build`** - For testing implementation and compilation validation
- **✅ Use `npm run test`** - For automated testing and functionality validation
- **🔒 Service Role Client Rule**: All database mutations MUST use `createServiceRoleClient()` 
- **🛡️ Security First**: Always verify permissions with regular client BEFORE using service role
- **📝 "server-only" Required**: All data access layer files must import `"server-only"`

### **Database Operation Security Pattern** 🔐
```typescript
import "server-only";
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function mutateData(data: any) {
  const supabase = await createClient();        // For auth & permissions
  const supabaseAdmin = await createServiceRoleClient(); // For mutations only
  
  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // 2. Verify permissions (using RLS-enabled client)
  const permissionCheck = await supabase.from('user_roles')...
  if (!hasPermission) throw new Error('Access denied');
  
  // 3. Perform mutation (using service role client)
  const result = await supabaseAdmin.from('table').insert(data);
  return result;
}
```

### Priority Order
1. **Items Management** (Core business entity)
2. **Orders & Customers** (Revenue generation)
3. **Dashboard Analytics** (Business insights)
4. **Telegram Integration** (Customer engagement)
5. **Polish & Deploy** (Presentation ready)

### Daily Goals
- **✅ Phase 1.3 Complete**: Foundation, multi-project architecture, user management system, and complete item management system with image upload/display
- **Days 1-3**: Complete data operations, items working
- **Days 4-5**: Orders and customers functional
- **Days 6-7**: Dashboard showing real data and insights
- **Days 8-9**: Basic Telegram bot operational
- **Day 10**: Production-ready demonstration

### Quality Gates
- Each phase must be tested using `npm run build` (never `npm run dev`)
- Database operations must maintain data consistency
- All mutations must use service role client after permission verification
- UI must remain responsive and professional
- Security (RLS + service role pattern) must be verified at each step
- All data access layer functions must have "server-only" imports
