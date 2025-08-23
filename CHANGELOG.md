# Purple Shopping (OSMS) - Changelog

All notable changes to the Purple Shopping project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Complete User Management System (Phase 1.2) ✅
- **Full User CRUD Operations**: Complete user lifecycle management for project teams
  - **User Role Editing**: Admin can change user roles between "admin" and "agent" via EditUserDialog
  - **User Removal**: Admin can remove users from projects with confirmation dialog (soft delete)
  - **User Re-invitation**: Support for re-adding previously removed users to projects
  - **Invitation Resending**: Admin can resend invitations to pending users
- **Advanced User Management Features**:
  - **Smart User Detection**: System automatically detects existing vs. new users during invitation
  - **Existing User Support**: Fixed "user already registered" error for re-inviting removed users
  - **Contextual Success Messages**: Different messages for new invitations vs. user reactivations
  - **Database Constraint Handling**: Proper handling of unique(user_id, project_id) constraints
- **Enhanced Security & Validation**:
  - **Admin-Only Operations**: All user management operations require admin role verification
  - **Self-Protection**: Users cannot edit their own role or remove themselves from projects
  - **Service Role Client**: Consistent use of service role client for all user operations
  - **Input Validation**: Comprehensive Zod schemas for all user management operations
- **UI/UX Improvements**:
  - **Conditional Actions**: Different dropdown options for pending vs. confirmed users
  - **Confirmation Dialogs**: AlertDialog component for destructive operations (user removal)
  - **Loading States**: Proper loading indicators and disabled states during operations
  - **Error Handling**: User-friendly error messages with actionable guidance
- **Data Layer Architecture**:
  - **Enhanced Data Functions**: `updateUserRole()`, `removeUserFromProject()`, `resendUserInvitation()`
  - **Server Actions**: Type-safe server actions with proper validation and error handling
  - **Audit Trail**: Maintains updated_at timestamps and user activity history
  - **Soft Delete Pattern**: Preserves user data history while allowing reactivation

#### Clean Architecture Improvements ✅
- **Layout Separation**: Moved Purple Shopping header from shared layout to project listing page only
  - `/dashboard` route now has Purple Shopping header with logo and user welcome
  - `/dashboard/[project-id]/*` routes have clean sidebar-only layout without header conflicts
  - Resolved UI collision between PageHeader and SidebarInset components
- **Sidebar Simplification**: Removed sidebar trigger functionality for cleaner UX
  - Always-visible sidebar in project context without collapse/expand complexity
  - Removed hamburger menu button and related SidebarTrigger components
  - Streamlined project navigation with permanent sidebar access
- **Component Cleanup**: Removed unused and redundant code from architectural changes
  - Deleted unused PageHeader component (no longer used after layout restructuring)
  - Cleaned up imports and dependencies throughout the codebase
  - Made projectId required parameter in AppSidebar and NavUser components
  - Removed conditional logic for projectId since it's always available in project context
- **Type Safety Improvements**: Enhanced component interfaces for better reliability
  - Required projectId in sidebar and navigation components eliminates edge cases
  - Simplified URL generation without conditional project ID checks
  - More predictable component behavior in project-specific contexts

#### Multi-Project Architecture (Phase 1.1+) ✅
- **Dynamic Project Routes**: Restructured dashboard from `/dashboard` to `/dashboard/[project-id]/`
  - Project listing page at `/dashboard` showing all user's projects with roles
  - Dynamic project-specific dashboard routes with project context
  - Project switching capability via "Switch Project" link in sidebar
  - Each project has its own isolated management interface
- **Enhanced Data Access Layer**: Multi-project support throughout the application
  - `getUserProjects()` function to fetch all projects for a user
  - Updated project creation to support multiple projects per user
  - Removed single-project MVP constraint for scalable architecture
  - Enhanced permissions checking with project-specific access control
- **Project-Aware Navigation**: Updated UI components for multi-project support
  - Sidebar displays current project name and "Switch Project" functionality
  - Project-specific navigation URLs (e.g., `/dashboard/[id]/items`, `/dashboard/[id]/settings`)
  - User profile dropdown with project-specific settings links
  - Enhanced project listing with role badges and creation/update timestamps

#### Project Management & User Setup (Phase 1.1) ✅
- **Project Creation Flow**: Complete onboarding system for new users
  - Multi-step onboarding: Welcome → Bot Setup Guide → Project Creation
  - Telegram Bot setup guidance with @BotFather integration
  - Project creation form with validation and error handling
  - Automatic admin role assignment for project creators
- **Project Settings Management**: Complete settings interface ✅
  - Settings page at `/dashboard/[project-id]/settings` accessible via user profile dropdown
  - Project information form with name, description, and bot token editing
  - Masked bot token display with show/hide functionality
  - Admin-only access control with permission verification
  - Real-time form validation with success/error feedback
  - Project details panel with creation and update timestamps
- **Data Access Layer**: Following Next.js security best practices ✅
  - Comprehensive project data access functions
  - **Service Role Client Pattern**: All mutations use `createServiceRoleClient()` after permission checks
  - **Regular Client Pattern**: All reads and permission checks use `createClient()` with RLS
  - User role management and permission checking
  - RLS policy compliance and multi-tenant security
  - Type-safe database operations with proper error handling
  - **"server-only" imports**: All data access layer files protected from client-side access
- **Server Actions**: Thin wrapper pattern for form handling ✅
  - Project creation action with Zod validation and dynamic project redirection
  - Project update action with proper authentication and authorization
  - User project status checking with multi-project awareness
  - Proper error handling and user feedback
- **UI Components**: Professional onboarding and multi-project experience ✅
  - Welcome page with feature overview
  - Step-by-step Telegram bot creation guide
  - Project creation form with bot token validation
  - Project listing cards with role indicators and access buttons
  - Settings form with masked token display and update functionality
  - Progress indicators and navigation between steps
  - Error handling with user-friendly messages
  - Responsive design for desktop and mobile

#### Technical Implementation ✅
- **Route Architecture**: Next.js 15 dynamic routes with proper param handling
  - Async params support for Next.js 15 compatibility
  - Type-safe route parameters with Promise-based param access
  - Project-specific layouts with authentication and authorization
- **Validation Schemas**: Zod schemas for project creation and bot token validation
- **Updated Navigation**: Project-aware navigation with dynamic URLs
- **Database Integration**: Enhanced integration with projects and user_roles tables
- **Security Enhancements**: Service role client implementation for secure mutations
- **Development Guidelines**: Critical security patterns and build-only testing requirements

#### Development Environment & Security ✅
- **Critical Development Guidelines**: 
  - ❌ `npm run dev` strictly forbidden for security
  - ✅ `npm run build` for implementation testing and validation
  - ✅ `npm run test` for automated functionality testing
- **Database Security Pattern**: 
  - Service role client for all mutations after permission verification
  - Regular client for reads and authentication checks
  - Explicit "server-only" imports for all data access layer files
- **Build-Only Testing**: Production-like testing without development server exposure

### Planned
- Item management CRUD operations (Phase 1.3)
- Order processing workflow (Phase 2)
- Customer management system (Phase 2)
- Dashboard analytics and reporting (Phase 3)
- Telegram bot integration (Phase 4)
- Mini-app development (Phase 4)

### Fixed ✅
- **User Management Service Role Client Issues**: Fixed "User not found in project" errors
  - Root cause: Using regular client with RLS for user existence checks in admin operations  
  - Solution: Use service role client for all user lookup operations after admin verification
  - Maintains security: Admin permissions verified first, then bypass RLS for broader access
- **Existing User Re-invitation**: Fixed "user already registered" error for removed users
  - Root cause: `inviteUserByEmail` fails for users already in Supabase Auth
  - Solution: Two-path logic - skip email invitation for existing users, just reactivate role
  - Enhanced UX: Contextual success messages for new vs. reactivated users
- **Database Constraint Violations**: Fixed unique constraint errors in user_roles table
  - Root cause: Attempting to INSERT new records for existing (user_id, project_id) pairs
  - Solution: Smart detection and UPDATE existing inactive records instead of INSERT
  - Data integrity: Preserves audit trail while preventing constraint violations
- **Project Update Error**: Fixed PGRST116 error when updating project information
  - Root cause: RLS policies preventing mutations with regular client
  - Solution: Use service role client for mutations after permission verification
  - Security maintained: Permission checks still performed with regular client + RLS
- **Form Input Conflicts**: Resolved duplicate input names in settings form
- **Bot Token Display**: Implemented secure masking with optional visibility toggle

---

## [0.1.0] - 2025-08-19 - Foundation Complete

### Added
#### Infrastructure & Setup
- Initial Next.js 15 project setup with React 19
- TypeScript configuration with strict mode
- Tailwind CSS v4 integration
- Shadcn UI component library setup
- ESLint, Prettier, and Husky for code quality
- Package.json with all required dependencies

#### Database Architecture
- Comprehensive Supabase database schema (14+ tables)
- Multi-tenant architecture with project-based organization
- Row Level Security (RLS) policies for data isolation
- Database migrations and type generation
- Enum types for status management (orders, payments, etc.)
- JSONB fields for flexible data storage
- Proper indexing and foreign key relationships

#### Authentication System
- Complete auth flow (login, signup, password reset)
- Email confirmation system
- Professional auth forms with branding
- Supabase Auth integration
- Middleware-based session management
- Protected route system

#### UI Components & Layout
- Modern dashboard layout with sidebar navigation
- Responsive design patterns for both desktop and mobile
- Professional auth forms with Purple Shopping branding
- User profile management components
- Loading states and error boundaries
- **Dual application structure**: Dashboard + Telegram Mini-App entry points
- Mobile-responsive navigation optimized for different contexts

#### Database Tables Implemented
- `projects` - Main organizational unit
- `user_roles` - Multi-tenant user permissions
- `categories` - Product categorization
- `items` - Product inventory management
- `item_prices` - Pricing history and variants
- `item_images` - Product image management
- `customers` - Customer information
- `customer_addresses` - Shipping addresses
- `orders` - Order lifecycle management
- `order_items` - Order line items
- `invoices` - Billing and payment tracking
- `cart_items` - Shopping cart functionality
- `chat_messages` - Telegram integration prep
- `stock_movements` - Inventory tracking

#### Security Features
- Row Level Security policies for all tables
- Project-based data isolation
- Authentication guards for protected routes
- Input validation patterns
- Error handling without information leakage

#### Development Environment
- Local Supabase development setup
- Database migration system
- TypeScript type generation from database
- Hot reload development workflow
- Pre-commit hooks for code quality

### Technical Specifications
- **Frontend**: Next.js 15 with App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand (ready for implementation)
- **Validation**: Zod schemas
- **Date/Time**: Luxon library
- **Package Manager**: npm
- **Node Version**: 20+

### Project Structure
```
src/
├── app/                    # Next.js 15 App Router
│   ├── app/               # 📱 Telegram Mini-App Entry Point
│   │   ├── layout.tsx     # Mini-app optimized layout
│   │   ├── page.tsx       # Customer shopping interface
│   │   ├── catalog/       # Product browsing
│   │   ├── cart/          # Shopping cart
│   │   └── checkout/      # Order completion
│   ├── dashboard/         # 🖥️ Dashboard Entry Point
│   │   ├── (home)/        # Management pages
│   │   │   ├── items/     # Inventory management
│   │   │   ├── orders/    # Order processing
│   │   │   └── users/     # Customer & team management
│   │   └── auth/          # Authentication pages
│   └── api/               # API endpoints & webhooks
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── mini-app/         # Mini-app specific components
│   └── shared/           # Shared components
├── lib/                  # Utility libraries
│   ├── supabase/         # Database client setup
│   └── telegram/         # Bot utilities (prepared)
└── hooks/                # Custom React hooks

supabase/
├── migrations/           # Database migrations
└── schemas/             # Schema definitions (14 files)
```

### Database Schema Highlights
- **Multi-tenant**: Every table scoped to project_id
- **Order Management**: 8-state order lifecycle
- **Inventory**: Stock tracking with movement history
- **Flexible**: JSONB fields for addresses, dimensions
- **Scalable**: Proper indexing and relationship design
- **Secure**: Comprehensive RLS policies

---

## Development Notes

### Current State (v0.1.0 + Clean Multi-Project Architecture)
- **Status**: Foundation complete + Multi-project architecture implemented + Layout architecture cleaned
- **Next Phase**: Core data operations with project-specific context (Items, Orders, Customers)
- **Architecture**: Multi-project infrastructure with clean layout separation + simplified navigation patterns
- **Security**: Multi-tenant RLS policies active + project-aware service role client pattern implemented
- **UI**: Professional project listing and streamlined project-specific dashboard framework ready
- **Testing**: Build-only validation process established (no development server)

### Known Limitations
- Dashboard shows placeholder data (implementation needed)
- No business logic implementation yet for items/orders
- Telegram integration prepared but not implemented
- File upload system ready but not connected
- Payment integration framework ready

### Technical Notes
- **Database Security**: Service role client pattern implemented for all mutations
- **Development Restrictions**: Development server (`npm run dev`) disabled for security
- **Testing Approach**: Build-only validation ensures production-like testing
- **RLS Compliance**: Regular client handles all reads with proper access control
- **"server-only" Protection**: All data access layer files secured from client exposure

### Migration Notes
- Database schema is production-ready
- RLS policies tested and functional
- All tables properly indexed
- Foreign key relationships established
- Triggers for updated_at timestamps active

---

## Future Releases

### [0.2.0] - Planned - Core Data Operations
- Item management CRUD operations
- Category management system
- Basic inventory tracking
- User project management (✅ Settings already implemented)

### [0.3.0] - Planned - Order Management
- Complete order processing workflow
- Customer management system
- Payment method handling
- Order status management

### [0.4.0] - Planned - Analytics & Reporting
- Dashboard with real data
- Sales analytics
- Inventory reports
- Customer insights

### [0.5.0] - Planned - Telegram Integration
- Basic Telegram bot
- Order processing via chat
- Product catalog sharing
- Customer notifications

### [1.0.0] - Planned - MVP Release
- Production-ready application
- Complete feature set
- Documentation
- Deployment ready
