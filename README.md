# Purple Shopping (OSMS) - Online Shop Management System

> **🚧 PROJECT DISCLAIMER**
> 
> This project is a **demonstration/MVP version** created as a university project. It is **NOT production-ready** and should not be used in a live business environment. The system may contain bugs, security vulnerabilities, and incomplete features. This is purely an academic submission to showcase technical skills and system design concepts.

## Project Overview

**Purple Shopping** is a comprehensive web-based Online Shop Management System designed for small businesses in Myanmar who primarily use social media platforms for sales. The system consists of two integrated applications:

- **🖥️ Dashboard** - Business management interface for shop owners and staff
- **📱 Telegram Mini-App** - Customer-facing shopping interface integrated with Telegram

### Key Features

- **Multi-Project Support**: Users can manage multiple shops/businesses
- **Complete E-Commerce**: Product catalog, shopping cart, checkout, and payment processing
- **Telegram Integration**: Native Telegram WebApp with bot commands for customer interaction
- **Inventory Management**: Stock tracking, image management, pricing history
- **Order Management**: Complete order lifecycle from cart to delivery
- **Team Collaboration**: Role-based access control (admin/agent)
- **Myanmar Localization**: Phone validation, local payment methods (KBZPay, AYAPay, CBPay)

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **Shadcn UI** - Modern UI component library
- **Zustand** - State management for client-side data

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL database)
- **Supabase Auth** - Authentication and user management
- **Supabase Storage** - File storage for product images
- **Next.js Server Actions** - Server-side API functionality

### Integrations
- **Telegram Bot API** - Customer interaction through Telegram
- **Telegram WebApp** - Mini-app integration within Telegram
- **Myanmar Phone Validation** - Local phone number validation

### Development Tools
- **Node.js 20+** - JavaScript runtime
- **npm** - Package manager
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for code quality

## Prerequisites for Running This Project

### System Requirements
- **Windows 10/11** (64-bit), **Linux**, or **MacOS**
- **8GB RAM** minimum (16GB recommended)
- **2GB free disk space**
- **Stable internet connection** (required for Supabase database)

### Required Software Installation

#### 1. Install Node.js (Required)
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download **Node.js LTS version 20.x or higher**
3. Run the installer with default settings
4. **Important**: Make sure to check "Add to PATH" during installation
5. Restart your computer after installation

**Verify installation** by opening Command Prompt (cmd) and typing:
```cmd
node --version
npm --version
```
You should see version numbers displayed.

#### 2. Install Git (Required for Windows)
1. Visit [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and run the installer
3. Use default settings during installation
4. **Important**: Select "Git from the command line and also from 3rd-party software"

#### 3. Install Visual Studio Code (Recommended)
1. Visit [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Download and install VS Code
3. This will help you view and edit code files

## How to Run This Project

### Step 1: Download the Project
1. **If you have a ZIP file**: Extract it to a folder like `C:\Users\YourName\Desktop\osms`
2. **If using Git**: Open Command Prompt and run:
   ```cmd
   git clone [repository-url]
   cd osms
   ```

### Step 2: Open Command Prompt in Project Folder
1. Navigate to the project folder in File Explorer
2. Click on the address bar and type `cmd`, then press Enter
3. Command Prompt should open in the project directory

### Step 3: Install Project Dependencies
In the command prompt, type:
```cmd
npm install
```
**This will take 2-5 minutes** to download all required packages. Wait for it to complete.

### Step 4: Set Up Environment Variables
1. Look for a file named `.env` or `.env.local` in the project folder
2. **This file contains database credentials and API keys**

### Step 5: Build the Project
```cmd
npm run build
```
**This will take 1-2 minutes** to compile the project. Wait for completion.

### Step 6: Start the Application
```cmd
npm start
```
**Keep this command prompt window open** while using the application.

### Step 7: Access the Application
1. Open your web browser (Chrome, Firefox, or Edge)
2. Go to: [http://localhost:3000](http://localhost:3000)
3. You should see the Purple Shopping landing page

## Important Notes for Evaluation

### What Works
✅ **User authentication and authorization**
✅ **Product management with image uploads**
✅ **Shopping cart and checkout process**
✅ **Order management system**
✅ **Team collaboration features**
✅ **Myanmar phone number validation**
✅ **Responsive design for mobile and desktop**

### Known Limitations
⚠️ **Payment integration is simulated** (not connected to real payment gateways)
⚠️ **Email notifications are not implemented**
⚠️ **Advanced analytics are simplified**
⚠️ **Some error handling is basic**
⚠️ **Performance optimization is minimal**

### Technical Achievements
- **Multi-tenant architecture** supporting multiple businesses
- **Real-time data synchronization** using Supabase
- **Modern React patterns** with server components
- **Type-safe development** with TypeScript
- **Mobile-first responsive design**
- **Integration with external APIs** (Telegram)

## Academic Context

This project demonstrates:
- **Full-stack web development** skills
- **Database design** and management
- **API integration** and third-party services
- **User interface design** principles
- **Project management** and development workflow
- **Understanding of business requirements** and user needs

## License

This project is licensed under a **View-Only Academic License**. See the [LICENSE](./LICENSE) file for details.