# Copilot Instructions for Online Shop Management System (Purple Shopping)

## Project Overview

Purple Shopping is a comprehensive web-based management system designed for small sellers in Myanmar who primarily use social media for sales. The system automates core workflows including item management, orders, payments, and customer messaging through an integrated Telegram chatbot and mini-app.

## Project Context & Scope

**This is an undergraduate final year project with a 10-day development timeline.**

**MVP/Pilot Version Approach:**

- Focus on core functionality demonstration rather than production robustness
- Prioritize working features over enterprise-grade error handling
- Implement basic validation and security, not bulletproof systems
- Use simple, straightforward solutions over complex optimizations
- Code quality should be clean and readable, but doesn't need to handle all edge cases
- Basic testing is sufficient - comprehensive test coverage is not required
- Performance should be reasonable for demo purposes, not optimized for high load
- UI should be functional and presentable, not pixel-perfect
- Error messages can be simple and technical rather than user-friendly
- Focus on happy path scenarios; edge cases can be noted as future enhancements

## Architecture & Tech Stack

### Frontend

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **State Management**: Zustand for client-side state
- **Date/Time**: Luxon for date manipulation
- **Validation**: Zod for schema validation

### Backend

- **Database**: Supabase
- **Authentication**: Supabase Auth
- **API**: Next.js server components & server actions

### Development Tools

- **TypeScript**: Strict typing throughout
- **Linting**: ESLint with Next.js and Prettier
- **Formatting**: Prettier

## Development Guidelines

### Rapid Development Approach

- To add a Shadcn UI component, use:
  `npx shadcn@latest add button` (replace `button` with the desired component)

### Code Style

- Follow Next.js 15 app directory structure
- Implement server components where possible
- Use Shadcn UI components with Tailwind CSS v4
- Apply consistent naming: kebab-case for files, PascalCase for components

### Database Design

- **Schema Management**: Use Supabase's declarative database schemas with SQL migrations
  - Store schema definitions in `supabase/schemas/` directory
- **Row-Level Security**: Only implement RLS for tables queried from client-side

### Security & Privacy

- Use data access layer pattern for server-side database queries
- Implement RLS only for client-accessed tables
- Validate inputs using Zod schemas
- User management with Supabase Auth

## Error Handling

- Implement comprehensive error boundaries
- Provide meaningful error messages
- Log errors for debugging
- Handle network failures gracefully
- Implement retry mechanisms for critical operations
