# Purple Shopping (OSMS) - Development Plan

## Project Overview

**Purple Shopping** is a comprehensive web-based Online Shop Management System (OSMS) designed for small sellers in Myanmar wh### 🔄 Current Status: Complete User Management System (Phase 1.2)
The project now has comprehensive multi-project architecture with full user management capabilities:
- **Complete User Lifecycle**: Create, edit, remove, and re-invite users with proper validation
- **Admin Role Management**: Role switching between admin/agent with permission verification
- **Smart User Handling**: Automatic detection of new vs. existing users during invitations
- **Database Integrity**: Proper handling of unique constraints and soft delete patterns
- **Enhanced Security**: Service role client usage with admin permission checks
- Modern, scalable architecture supporting multiple projects per user
- **Project Management**: Centralized listing and project-specific dashboards  
- **Dynamic Routing**: Project-aware navigation and layouts
- Professional UI/UX foundation with clean layout separation
- Complete database schema with multi-tenant security
- Authentication system with project-specific authorization
- Type-safe development environment with Next.js 15 compatibility
- **Clean Architecture**: Removed unused components and sidebar trigger functionalitysocial media for sales. The system automates core workflows including item management, orders, payments, and customer messaging through an integrated Telegram chatbot and mini-app.

### Key Project Constraints
- **Timeline**: 10-day development sprint for undergraduate final year project
- **Approach**: MVP/Pilot version focusing on core functionality demonstration
- **Target**: Working features over production robustness
- **Scope**: Basic validation and security, not bulletproof systems

## Current Project State

### ✅ Completed Infrastructure

#### 1. **Tech Stack Setup**
- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 + Shadcn UI components
- **Backend**: Supabase (PostgreSQL + Authentication + RLS)
- **State Management**: Zustand for client-side state
- **Validation**: Zod schemas
- **Type Safety**: TypeScript with strict configuration

#### 2. **Multi-Project Architecture** ✅
- **Project Listing**: Central dashboard at `/dashboard` showing all user projects
- **Dynamic Routes**: Project-specific dashboards at `/dashboard/[project-id]/`
- **Project Switching**: Seamless navigation between multiple projects
- **Role-Based Access**: Project-specific permissions and user role management
- **Enhanced Data Layer**: Support for multiple projects per user with proper security
- **Navigation System**: Project-aware sidebar and navigation components

#### 3. **Complete User Management System** ✅
- **User CRUD Operations**: Full create, read, update, delete operations for project users
- **Role Management**: Admin can change user roles between admin/agent with EditUserDialog
- **User Removal**: Soft delete with confirmation dialogs and proper audit trail
- **Smart Re-invitation**: Support for re-adding removed users without constraint violations
- **Invitation System**: New user invitations via email and existing user reactivation
- **Admin Security**: All operations require admin role with self-protection mechanisms
- **Database Integrity**: Service role client usage with proper RLS bypass after permission checks
- **Enhanced UX**: Contextual success messages, loading states, and error handling

#### 4. **Project Structure**
- Modern Next.js 15 app directory structure with dynamic routes
- Clean separation of concerns (components, hooks, lib, app routes)
- Multi-project route organization and layouts
- Proper TypeScript configuration
- ESLint, Prettier, and Husky for code quality
- Development workflow with build-only testing

#### 5. **Database Architecture (Comprehensive)**
**Multi-tenant system with project-based organization:**

**Core Tables:**
- `projects` - Main organizational unit for businesses/shops
- `user_roles` - User permissions within projects (admin/agent roles)
- `categories` - Product categorization
- `items` - Product inventory with stock management
- `item_prices` - Pricing history and variants
- `item_images` - Product image management
- `customers` - Customer information
- `customer_addresses` - Shipping addresses
- `orders` - Order lifecycle management (8 status states)
- `order_items` - Order line items
- `invoices` - Billing and payment tracking
- `cart_items` - Shopping cart functionality
- `chat_messages` - Telegram integration messaging
- `stock_movements` - Inventory tracking

**Advanced Features:**
- Row Level Security (RLS) policies for multi-tenancy
- Database triggers for updated_at timestamps
- Comprehensive indexing for performance
- JSONB fields for flexible data (addresses, dimensions)
- Enum types for status management
- Foreign key relationships with proper cascading

#### 6. **Authentication System**
- **Complete auth flow**: Login, signup, password reset, email confirmation
- **UI Components**: Professional auth forms with Purple Shopping branding
- **Security**: Supabase Auth with middleware-based session management
- **Redirect Handling**: Proper routing between auth and protected routes
- **Error Handling**: User-friendly error messages and loading states

#### 7. **Multi-Project Dashboard Foundation** ✅
- **Project Listing**: Central dashboard showing all user projects with roles and metadata
- **Dynamic Project Routes**: Project-specific management interfaces at `/dashboard/[project-id]/`
- **Clean Layout Separation**: Project listing has Purple Shopping header, project pages have sidebar only
- **Simplified Navigation**: Removed sidebar trigger for always-visible sidebar in project context
- **UI Framework**: Professional project cards and streamlined project-specific navigation
- **Access Control**: Project-specific permission checking and role-based features
- **Required Parameters**: ProjectId required in all sidebar/navigation components for type safety

## Development Environment & Testing

### **Development Server Restrictions**
- **❌ NEVER run `npm run dev`** - Development server is disabled for this project
- **✅ Use `npm run build`** - To test implementation and check for compilation errors
- **✅ Use `npm run test`** - To run tests and validate functionality
- **Rationale**: Prevents accidental exposure of development endpoints and ensures production-like testing

### **Testing & Validation Workflow**
1. **Build Test**: Run `npm run build` after making changes
2. **Type Check**: Ensure TypeScript compilation passes
3. **Functionality Test**: Use `npm run test` for automated tests
4. **Manual Validation**: Test forms and database operations through build output

#### 8. **Development Environment**
- **Database**: Supabase local development setup
- **Migrations**: Version-controlled database schema
- **Type Generation**: Auto-generated TypeScript types from database
- **Code Quality**: Linting, formatting, pre-commit hooks
- **Package Management**: Modern dependencies with security updates
- **Build-Only Testing**: Use build process to validate implementation

#### 9. **Project Structure & Architecture**
The application follows a clear separation of concerns with two main entry points:

```
src/
├── app/
│   ├── app/                    # � Telegram Mini-App Entry Point
│   │   ├── layout.tsx         # Mini-app layout (optimized for Telegram)
│   │   ├── page.tsx           # Mini-app home page
│   │   ├── catalog/           # Product browsing for customers
│   │   ├── cart/              # Shopping cart functionality
│   │   └── checkout/          # Order completion
│   │
│   ├── dashboard/             # 🖥️ Dashboard Entry Point (Shop Management)
│   │   ├── (home)/            # Dashboard home routes
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   ├── page.tsx       # Dashboard overview
│   │   │   ├── items/         # Inventory management
│   │   │   ├── orders/        # Order processing
│   │   │   └── users/         # Customer & team management
│   │   └── auth/              # Authentication pages
│   │       ├── login/         # Shop owner/staff login
│   │       ├── sign-up/       # New shop registration
│   │       └── [auth-pages]   # Password reset, etc.
│   │
│   ├── api/                   # API endpoints
│   │   ├── webhook/           # Telegram webhook handlers
│   │   └── [other-apis]       # Additional API routes
│   │
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
│
├── components/
│   ├── ui/                    # Shadcn UI components (buttons, cards, etc.)
│   ├── providers/             # Application providers (QueryProvider, etc.)
│   ├── dashboard/             # Dashboard-specific components
│   ├── mini-app/              # Mini-app specific components
│   ├── shared/                # Shared components between apps
│   └── [auth-components]      # Authentication forms
│
├── lib/
│   ├── supabase/              # Database clients & types
│   ├── telegram/              # Telegram bot utilities
│   ├── utils.ts               # General utilities
│   └── validations/           # Zod schemas
│
└── hooks/                     # Custom React hooks
    ├── use-mobile.ts          # Mobile detection
    ├── use-query-hooks.ts     # TanStack Query hooks (client-side only)
    └── [custom-hooks]         # App-specific hooks

supabase/
├── migrations/                # Database version control
└── schemas/                   # Schema definitions (14 tables)
```

### **Multi-Project Dashboard Route Structure Explained**

#### **Project Management Flow:**
```
/dashboard/                         # 📋 PROJECT LISTING
├── Shows all projects user has access to
├── Role badges (admin/agent) for each project  
├── "New Project" button → onboarding
└── "Open Project" → /dashboard/[project-id]/

/dashboard/[project-id]/            # 🖥️ PROJECT-SPECIFIC DASHBOARD
├── layout.tsx                      # Sidebar with project context + auth
├── page.tsx                        # Project overview (items, orders, users stats)
├── items/                          # Project inventory management
├── orders/                         # Project order processing  
├── users/                          # Project team management
└── settings/                       # Project-specific configuration
```

#### **Next.js 15 Dynamic Route Implementation:**
- **Async Params**: `params: Promise<{ 'project-id': string }>` for Next.js 15 compatibility
- **Project Context**: Each route receives project-id and validates user access
- **Layout Inheritance**: Project-specific layouts with authentication and project verification
- **Navigation**: Project-aware sidebar with dynamic URLs and "Switch Project" functionality

#### **Multi-Project Architecture Benefits:**
- **Scalability**: Users can manage multiple shops/businesses
- **Role Isolation**: Different roles per project (admin in one, agent in another)
- **Data Separation**: Complete isolation between projects via RLS policies
- **Flexible Growth**: Easy to add new projects without architectural changes

#### **Key Implementation Notes:**
- **Cannot put `page.tsx` in `/dashboard/`** - Would create conflicting routes with `(home)/page.tsx`
- **`(home)/page.tsx`** serves as the actual `/dashboard` entry point
- **Route groups** organize code without affecting URLs
- **Layout inheritance** flows down from group layout files
- **New dashboard routes** should go inside `(home)` group for sidebar layout

### �🔄 Current Status: Basic Structure Ready
The project has a solid foundation with:
- Modern, scalable architecture
- **Dual entry points**: Dashboard for shop management, Mini-app for customers
- Professional UI/UX foundation
- Complete database schema
- Authentication system
- Multi-tenant security model
- Type-safe development environment

### 🚧 What's Missing (Implementation Phase)

The current state has **multi-project structure with business logic ready for implementation** - all the architectural pieces are in place including multi-project support, but actual data operations and business workflows need to be implemented.

## Next Steps

**📋 Detailed Roadmap**: See [`ROADMAP.md`](./ROADMAP.md) for the complete 5-phase development plan.

**📝 Change Tracking**: See [`CHANGELOG.md`](./CHANGELOG.md) for detailed version history and progress tracking.

### Quick Overview - Implementation Phases:
1. **Phase 1 (Days 1-3)**: Core Data Operations - Items, Categories, Projects
2. **Phase 2 (Days 4-5)**: Order Management - Orders, Customers, Payments  
3. **Phase 3 (Days 6-7)**: Dashboard & Analytics - Real data, reporting
4. **Phase 4 (Days 8-9)**: Telegram Integration - Bot, messaging, notifications
5. **Phase 5 (Day 10)**: Polish & Deployment - Testing, optimization, production

## Technical Implementation Details

### Database Operations Pattern

#### **CRITICAL: Supabase Client Usage Rules**
- **READ Operations (SELECT)**: Use `createClient()` - Regular client with RLS policies
- **WRITE Operations (INSERT/UPDATE/DELETE)**: Use `createServiceRoleClient()` - Service role bypasses RLS
- **Security First**: Always verify permissions BEFORE using service role client
- **Server-Only**: All database operations must have `"server-only"` import

```typescript
// Data Access Layer Pattern (src/lib/data/items.ts)
import "server-only";
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function getItem(itemId: string) {
  const supabase = await createClient(); // Regular client for reads
  
  // Authentication check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Database operation with RLS (auto-enforced project access)
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createItem(data: CreateItemData) {
  const supabase = await createClient(); // For auth/permission checks
  const supabaseAdmin = await createServiceRoleClient(); // For mutations
  
  // STEP 1: Authentication check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // STEP 2: Permission verification (using regular client with RLS)
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role, project_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();
  
  if (!userRole) throw new Error('No project access');
  
  // STEP 3: Data mutation (using service role client - bypasses RLS)
  const { data: item, error } = await supabaseAdmin
    .from('items')
    .insert({
      ...data,
      project_id: userRole.project_id, // Explicitly set project_id
    })
    .select()
    .single();
    
  if (error) throw error;
  return item;
}

// Server Action (src/lib/actions/items.ts)
import { createItem } from '@/lib/data/items';
import { createItemSchema } from '@/lib/validations/items';

export async function createItemAction(formData: FormData) {
  try {
    // Input validation
    const validatedData = createItemSchema.parse({
      name: formData.get('name'),
      price: Number(formData.get('price')),
      // ... other fields
    });
    
    // Call data layer
    const item = await createItem(validatedData);
    
    // Success response
    return { success: true, data: item };
  } catch (error) {
    // Error handling and user-friendly messages
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create item' 
    };
  }
}
```

### Component Architecture
- **Server Components** for data fetching and SEO
- **Client Components** for interactivity
- **Data Access Layer** for all database operations and security
- **Server Actions** as thin wrappers for form handling
- **Zustand** for client-side state management
- **Zod** schemas for type-safe validation

### Data Fetching Strategy
- **Server-side fetching (PRIMARY)**: Always fetch data in server components when possible
  - Better performance (no client-server round trips)
  - SEO friendly
  - Automatic error handling
  - Direct database access through data access layer
- **Client-side fetching (LAST RESORT)**: Only use TanStack Query when server-side is not possible
  - Real-time updates needed
  - User-triggered refresh functionality
  - Interactive features requiring immediate feedback
  - Use QueryProvider wrapper for TanStack Query integration

### Data Fetching Implementation Examples

#### **Server-side Fetching (Preferred Pattern):**
```typescript
// Server Component (src/app/dashboard/items/page.tsx)
import { getItems } from '@/lib/data/items';

export default async function ItemsPage() {
  const items = await getItems(); // Direct server-side fetch
  
  return (
    <div>
      <ItemsList items={items} />
    </div>
  );
}

// Data Access Layer (src/lib/data/items.ts)
import "server-only";
import { createClient } from '@/lib/supabase/server';

export async function getItems() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('items').select('*');
  if (error) throw error;
  return data;
}
```

#### **Client-side Fetching (Last Resort with TanStack Query):**
```typescript
// Client Component (src/components/interactive-items.tsx)
"use client";

import { useQuery } from '@tanstack/react-query';
import { getItemsAction } from '@/lib/actions/items';

export function InteractiveItems() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: () => getItemsAction(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading items</div>;
  
  return <ItemsList items={items} />;
}

// Root Layout Provider (src/app/layout.tsx)
import { QueryProvider } from '@/components/providers/query-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

### When to Use Each Approach
- **Use Server Components**: 
  - Initial page loads
  - Static data display
  - SEO-critical content
  - Dashboard pages, lists, forms
- **Use Client Components with TanStack Query**:
  - Real-time data updates
  - User-triggered refresh actions
  - Interactive features requiring immediate feedback
  - Optimistic updates

### Security Considerations
- **Data Access Layer** enforces all security rules and RLS compliance
- **Service Role Client Usage**: Only for mutations after proper authorization checks
- **Permission Verification**: Always check user permissions before using service role client
- **RLS for Reads**: Use regular client for all SELECT operations to enforce row-level security
- **Explicit Project Assignment**: Always set project_id explicitly in service role mutations
- **Server Actions** handle user input validation only
- **Separation of Concerns**: Security logic isolated in data layer
- Input sanitization through Zod schemas
- Error handling prevents information leakage
- Authentication required for all database access

#### **Database Client Usage Rules:**
1. **Regular Client (`createClient()`)** - For authentication, reads, and permission checks
2. **Service Role Client (`createServiceRoleClient()`)** - ONLY for mutations after permission verification
3. **Never bypass security** - Always verify permissions before using service role
4. **Server-only operations** - All database code must have `"server-only"` import

### Performance Optimization
- Database queries optimized with proper indexes
- Next.js server components for reduced client-side JavaScript
- Image optimization for product photos
- Caching strategies for frequently accessed data
- Lazy loading for large data sets

## UI/UX Design Guidelines

### **Design System & Components**
- **Use Shadcn UI defaults only** - No custom styling or themes
- **No gradients** - Stick to solid colors and Shadcn's color palette
- **Modern and simple** - Clean, minimalist interface design
- **Install any Shadcn components** as needed for functionality
- **Consistent spacing** using Tailwind's spacing scale

### **User Experience Principles**
- **UX-friendly text copies** - Clear, concise, and helpful messaging
- **No bloated UI** - Every element serves a purpose
- **Clean and purposeful** - Remove unnecessary visual clutter
- **Scannable content** - Use proper hierarchy and white space
- **Accessible design** - Follow basic accessibility guidelines

### **Content Guidelines**
- **Action-oriented copy** - "Create Item" instead of "Add New Product"
- **Clear error messages** - Explain what went wrong and how to fix it
- **Helpful placeholders** - Guide users with example text
- **Contextual help** - Tooltips and hints where needed
- **Consistent terminology** - Use the same words for same concepts

### **Interface Standards**
- **Form design** - Simple, single-column layouts with clear labels
- **Navigation** - Breadcrumbs and clear page titles
- **Loading states** - Skeleton loaders and progress indicators
- **Empty states** - Helpful messages with clear next actions
- **Data tables** - Clean, sortable, with essential information only
- **Branding** - Use `/public/logo.svg` for all Purple Shopping branding

### **Branding Guidelines**
- **Logo usage** - Use `/public/logo.svg` consistently across the application
- **Placement locations**:
  - Authentication pages (login, signup, password reset)
  - Dashboard header/sidebar
  - Email templates and notifications
  - Error pages and empty states
  - Any branded communications
- **Implementation** - Use Next.js Image component for optimal loading
- **Sizing** - Maintain aspect ratio, typical height: 32px-48px for headers

### **Implementation Notes**
- Use Shadcn components as-is without customization
- Leverage Tailwind utilities for spacing and layout
- Focus on usability over visual flair
- Test with real content, not lorem ipsum
- Prioritize mobile responsiveness

## Database Migration Workflow

### **Supabase CLI Commands**
- **Use direct CLI** - `supabase` command (not `npx supabase`)
- **Ensure CLI is installed globally** for consistent workflow
- **Local development** - Work with local Supabase instance first

### **Schema Change Process**
1. **Generate Migration** 
   ```bash
   supabase db diff -f migration_name
   ```
   - Creates migration file based on schema differences
   - Use descriptive migration names (e.g., `add_item_categories`, `update_order_status`)

2. **Apply to Local Database**
   ```bash
   supabase migration up
   ```
   - Applies pending migrations to local development database
   - Test changes locally before pushing to remote

3. **Push to Remote Project**
   ```bash
   supabase db push
   ```
   - Applies migrations to remote linked Supabase project
   - Use after local testing confirms changes work correctly

### **Best Practices**
- **Test locally first** - Always apply and test migrations locally
- **Descriptive names** - Use clear migration file names
- **Small increments** - Keep migrations focused and atomic  
- **Backup awareness** - Remote pushes affect production data
- **Team coordination** - Communicate schema changes with team

## Server-Side Code Protection

### **"server-only" Import Requirement**
- **All server-side files** must import `"server-only"` at the top
- **Prevents client-side imports** - Ensures server code stays on server
- **Runtime protection** - Throws error if accidentally imported on client

### **Files That Must Include "server-only":**
- **Data Access Layer** - All files in `src/lib/data/`
- **Server Actions** - All files in `src/lib/actions/`
- **Supabase Server Client** - `src/lib/supabase/server.ts`
- **Server Components** - That access database or sensitive operations
- **API Routes** - Backend API endpoint files
- **Middleware** - Server-side middleware functions

### **Implementation Pattern:**
```typescript
import "server-only";

// Rest of your server-side code
import { createClient } from '@/lib/supabase/server';

export async function getItems() {
  // Server-only database operations
}
```

### **Benefits:**
- **Security** - Prevents accidental client-side exposure of server code
- **Bundle optimization** - Keeps server code out of client bundles
- **Development safety** - Early error detection for incorrect imports
- **Clear boundaries** - Explicit separation between server and client code

## Success Criteria for MVP

**Note**: Detailed success criteria and implementation phases are documented in [`ROADMAP.md`](./ROADMAP.md).

### Core Functionality Status
1. ✅ User can register and authenticate
2. ⏳ User can create and manage a shop project  
3. ⏳ User can add, edit, and manage inventory items
4. ⏳ User can process customer orders end-to-end
5. ⏳ User can track order status and customer information
6. ⏳ Basic Telegram bot responds to commands
7. ⏳ Dashboard provides meaningful business insights

## Development Notes for Implementation Team

### Key Architectural Decisions
1. **Multi-tenant by design** - Every operation scoped to project_id
2. **RLS for security** - Database-level access control for reads only
3. **Service Role for mutations** - All INSERT/UPDATE/DELETE operations use service role client after permission verification
4. **Data Access Layer pattern** - Security and database logic separated with "server-only" imports
5. **Server Actions as thin wrappers** - Input validation and user feedback only
6. **Server-side data fetching** - Primary approach using server components for better performance and SEO
7. **Client-side fetching as last resort** - TanStack Query only when server-side is not possible
8. **Progressive enhancement** - Core functionality first, polish later
9. **Build-only testing** - No development server, use build process for validation

### Database Operation Security Pattern
```typescript
// REQUIRED PATTERN for all database mutations:
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

### Code Quality Standards
- TypeScript strict mode enabled
- Zod validation for all inputs
- **"server-only" imports** for all database operations
- **Service role client** for all mutations with permission verification first
- **Regular client** for reads and permission checks only
- Data Access Layer for all database operations
- Consistent error handling patterns
- Component composition over inheritance
- Server Actions as input validators only
- Proper loading and error states

### Testing Strategy
- **Build testing**: Use `npm run build` to validate implementation
- **No development server**: Never use `npm run dev` for testing
- Manual testing of complete user workflows through build output
- Database constraint testing
- Authentication flow validation
- RLS policy verification for read operations
- Service role client security verification
- Telegram webhook testing (when implemented)

This development plan provides a clear roadmap from the current foundation to a fully functional MVP, prioritizing core business value while maintaining code quality and scalability for future enhancements.
