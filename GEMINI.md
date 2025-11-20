# CPQ Application - Technical Documentation

## Overview

The CPQ (Configure, Price, Quote) application is a web-based system for managing the quote-to-cash process. It implements a multi-tenant SaaS architecture where each user has isolated data, accessed through Firebase authentication and stored in user-scoped Firestore collections.

**Source**: [DeepWiki - cpq-app](https://deepwiki.com/alejomeek15/cpq-app)

## Core Capabilities

The system enables users to:
- Create and manage quotes with product selection and pricing
- Store and organize client information
- Maintain a product catalog with SKU and pricing management
- Generate PDF quotes for customers
- Track quote status through a board-style workflow
- View analytics and KPIs on a dashboard

## Technology Stack

### Frontend Framework
- **React**: 19.1.1 - UI framework
- **React DOM**: 19.1.1 - DOM rendering
- **Vite**: 7.1.7 - Build tool & development server

### Backend Infrastructure (Firebase)
Firebase provides the entire backend infrastructure:
- **Authentication**: User sign-in and session management
- **Firestore**: NoSQL database for all application data
- **Hosting**: Production deployment

### UI Components & Styling

| Package | Purpose |
|---------|---------|
| Tailwind CSS | Utility-first CSS framework with dark mode support |
| Radix UI | Headless UI primitives (dialogs, dropdowns, tabs) |
| lucide-react | Icon library |
| class-variance-authority | Component variant management |
| tailwind-merge | Tailwind class conflict resolution |

The `tailwind.config.js` defines a custom theme with CSS variables for colors, supporting both light and dark modes through the `class` strategy.

### Key Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| @tanstack/react-table | 8.21.3 | Data tables with sorting, filtering, pagination |
| @dnd-kit/core | 6.3.1 | Drag-and-drop foundation for quote board |
| @dnd-kit/sortable | 10.0.0 | Sortable list items |
| @react-pdf/renderer | 4.3.1 | PDF document generation |
| recharts | 3.3.0 | Dashboard charts and analytics |
| papaparse | 5.5.3 | CSV parsing for client imports |
| date-fns | 4.1.0 | Date formatting and manipulation |

## Application Architecture

### Entry Point (`App.jsx`)

The application entry point orchestrates the entire system lifecycle:

1. **Firebase Initialization**: Loads configuration from `window.firebaseConfig`
2. **Authentication Check**: Uses `useAuth` context hook
3. **Routing Management**: Client-side routing via `route` state variable and `handleNavigate` function
4. **Props Injection**: Passes `db` and `navigate` props to all modules

### Application Shell Components
- `AppSidebar`: Navigation menu
- `SidebarProvider`: Sidebar state management
- `ThemeProvider`: Dark/light mode support
- `Login`: Authentication interface
- `Dashboard`: Main analytics view

## Core Business Modules

The application is organized into five primary business modules:

| Module | File Path | Purpose |
|--------|-----------|---------|
| Dashboard | `src/ui/dashboard.jsx` | Display KPIs, charts, and recent activity |
| Quotes | `src/componentes/cotizador/QuotesPage.jsx` | Create, edit, manage quotes with three view modes |
| Clients | `src/componentes/clientes/ClientesPage.jsx` | Manage customer records, import from CSV |
| Catalog | `src/componentes/catalogo/CatalogoPage.jsx` | Manage products, SKUs, and pricing |
| Settings | `src/componentes/configuracion/SettingsPage.jsx` | Configure payment terms, taxes, quote styles |

## Multi-Tenant Data Model

The application implements a strict multi-tenant architecture where all user data is isolated under `usuarios/{user.uid}`:

**Firestore Collections Structure:**
```
usuarios/
  └── {user.uid}/
      ├── cotizaciones/     # Quotes
      ├── clientes/         # Clients
      ├── productos/        # Products
      └── configuracion/    # Settings
```

**Data Access Pattern:**
1. `useAuth` context provides `user.uid` to components
2. All queries scoped to `usuarios/{user.uid}/{subcollection}`
3. Security rules enforce user isolation at database level

This ensures complete data isolation between tenants with Firebase security rules preventing cross-user access.

## Navigation & Routing

The application uses a custom client-side routing system rather than a dedicated router library:

**Implementation:**
- `route` state stored in `App.jsx`
- `handleNavigate(newRoute, payload)` function for navigation
- `renderRoute()` switch statement renders appropriate component
- `navigate` function passed to all modules

**Example navigation:**
```javascript
navigate('edit-quote', { quoteId: '123' });
```

This allows modules to trigger navigation without importing routing libraries.

## Key Features

### Quote Management System
The most complex subsystem, offering:
- Three view modes: Table, Board (Kanban), and Calendar
- Drag-and-drop quote status management
- PDF generation with customizable templates
- Product selection with pricing calculations
- Status tracking workflow

### Client Management
- CRUD operations for customer records
- CSV import functionality
- Client data linked to quotes
- Search and filtering capabilities

### Product Catalog
- SKU and pricing management
- Product categorization
- Bulk operations support
- Integration with quote creation

### Configuration & Settings
- Payment terms configuration
- Tax settings
- Quote style customization
- User preferences

## Project Structure

```
cpq-app/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite build configuration
├── public/
│   └── firebase-config.js  # Firebase credentials
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Root application component
    ├── context/
    │   └── useAuth.jsx     # Authentication context
    ├── componentes/        # Business modules
    │   ├── cotizador/      # Quote management
    │   ├── clientes/       # Client management
    │   ├── catalogo/       # Product catalog
    │   ├── configuracion/  # Settings
    │   └── login/          # Login page
    └── ui/                 # Reusable UI components
        ├── theme-provider.jsx
        ├── AppSidebar.jsx
        └── ...
```

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Getting Started

For specific setup instructions, see the [Getting Started](https://deepwiki.com/alejomeek15/cpq-app/2-getting-started) section.

For detailed architectural patterns, see [Core Architecture](https://deepwiki.com/alejomeek15/cpq-app/3-core-architecture).

## Additional Documentation

- [Authentication & Security](https://deepwiki.com/alejomeek15/cpq-app/3.2-authentication-and-security)
- [Multi-Tenant Data Model](https://deepwiki.com/alejomeek15/cpq-app/3.3-multi-tenant-data-model)
- [Navigation & Routing](https://deepwiki.com/alejomeek15/cpq-app/3.4-navigation-and-routing)
- [Quote Management System](https://deepwiki.com/alejomeek15/cpq-app/4-quote-management-system)
- [Client Management](https://deepwiki.com/alejomeek15/cpq-app/5-client-management)
- [Product Catalog](https://deepwiki.com/alejomeek15/cpq-app/6-product-catalog)
- [Configuration & Settings](https://deepwiki.com/alejomeek15/cpq-app/8-configuration-and-settings)
- [UI Components & Styling](https://deepwiki.com/alejomeek15/cpq-app/9-deployment-and-infrastructure)

---

*Document generated from [DeepWiki](https://deepwiki.com/alejomeek15/cpq-app) - CPQ Application Documentation*
