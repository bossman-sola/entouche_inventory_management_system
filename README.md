# Entouche Inventory Management System

Frontend application for the **Entouche Inventory Management System**, an enterprise inventory and warehouse management platform designed to manage inventory, warehouse operations, stock movements, approvals, reporting, notifications, users, and administrative workflows.

The frontend is built with **React and Vite** and communicates with the Entouche Inventory Management System REST API.

---

## Features

### Dashboard

The dashboard provides an overview of inventory and warehouse operations, including:

- Inventory statistics
- Stock levels
- Recent inventory activity
- Warehouse information
- Operational summaries
- Inventory alerts
- Quick access to major workflows

### Item Management

- View inventory items
- Create items
- Edit item information
- View item details
- Item images
- Categories
- Units of measure
- Suppliers
- Reorder levels
- Unit costs
- Stock availability
- Inventory valuation

### Inventory Transactions

Provides a centralized history of inventory movements, including:

- Receipts
- Transfers
- Adjustments
- Stock count reconciliations
- Incoming stock movements
- Outgoing stock movements
- Quantity changes
- Inventory value changes

### Receipts

Supports the complete receiving workflow:

```text
Draft
  ↓
Submitted
  ↓
Approved
  ↓
Received
```

Features include:

- Create receipts
- Add receipt items
- Supplier information
- Purchase order information
- Delivery information
- Submit for approval
- Approve receipts
- Receive inventory
- Cancel receipts
- View receipt details

### Transfers

Supports inventory movement between warehouses and locations.

```text
Draft
  ↓
Pending Approval
  ↓
Approved
  ↓
Completed
```

Features include:

- Create transfers
- Select source warehouse/location
- Select destination warehouse/location
- Add inventory items
- Submit transfers
- Approve or reject transfers
- Complete transfers
- Cancel transfers
- View transfer details

### Inventory Adjustments

Supports controlled inventory corrections.

Features include:

- Inventory increases
- Inventory decreases
- Adjustment reasons
- Adjustment approval workflow
- Approval and rejection
- Cancellation
- Adjustment valuation
- Inventory reconciliation

### Stock Counts

Supports physical inventory counting and reconciliation.

```text
Draft
  ↓
Requested
  ↓
In Progress
  ↓
Pending Review
  ↓
Completed
```

Features include:

- Full stock counts
- Cycle counts
- Spot counts
- Counter assignment
- Physical quantity entry
- Variance detection
- Count submission
- Approval workflow
- Rejection
- Recount requests
- Inventory reconciliation

### Warehouse Management

- Warehouse overview
- Warehouse locations
- Receiving areas
- Storage areas
- Inventory availability by location
- Location management

### Reports

Provides operational and management reporting for inventory activities.

Reports may include:

- Inventory reports
- Stock movement reports
- Inventory valuation
- Warehouse reports
- Inventory activity
- Operational summaries

### Data Import

Supports bulk inventory imports.

Features include:

- Excel file upload
- Import progress
- Import history
- Successful row tracking
- Failed row tracking
- Partial import handling
- Error reports
- Import completion notifications

### Users & Roles

Provides administrative user management.

Primary roles include:

- System Administrator
- Warehouse Manager
- Inventory Officer
- Management Viewer

Frontend functionality is displayed based on the authenticated user's permissions.

> Authorization is also enforced by the backend API. Hiding an action in the frontend is not considered a security control.

### Notifications

The application includes an in-app notification system for events such as:

- Low stock alerts
- Reorder alerts
- Receipts awaiting approval
- Receipt completion
- Transfers awaiting approval
- Transfer approval
- Transfer completion
- Adjustment approval
- Stock count requests
- Stock count variances
- Data import completion
- Data import failures
- User creation
- System maintenance

### Audit Logs

Administrative users can review system activity and operational events through the audit log interface.

### Settings

The Settings module provides configuration for:

- Company information
- Company branding
- Company logo
- Warehouses
- Notifications
- Integrations
- Security
- Audit settings
- System maintenance

### Company Branding

Company branding can be configured from Settings.

The uploaded company logo is stored by the backend and can be displayed throughout the application, including:

- Main application sidebar
- Sign-in screen
- Settings
- Other branded areas

---

## Technology Stack

The frontend uses:

- **React**
- **Vite**
- **JavaScript**
- **React Router**
- **Axios**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide React**

The application communicates with a separate **Laravel REST API**.

---

## Requirements

Before running the frontend locally, make sure you have:

- Node.js
- npm
- Git
- Access to a running Entouche API environment

A current Node.js LTS release is recommended.

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
```

Enter the project directory:

```bash
cd <project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file if one does not already exist:

```bash
cp .env.example .env
```

Configure the API URL:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Use the appropriate API endpoint for your environment.

For example:

```env
# Local
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Production and staging API URLs should be configured through the appropriate deployment environment.

Do not commit sensitive environment configuration to Git.

---

## Running the Application

Start the Vite development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

Typically:

```text
http://localhost:5173
```

---

## Production Build

Create a production build:

```bash
npm run build
```

The generated production files will be placed in:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

---

## API Integration

The frontend communicates with the Entouche backend through the REST API.

API requests are centralized through the application's API layer.

A typical request flow is:

```text
React Component
      ↓
Feature Hook / Service
      ↓
API Client
      ↓
Axios
      ↓
Entouche REST API
      ↓
Laravel Backend
```

This keeps HTTP logic separate from UI components and makes API behavior easier to maintain.

---

## Authentication

Authentication is handled through the Entouche API.

After successful authentication, the frontend stores the access token according to the application's authentication implementation and sends it with protected requests.

Protected API requests use:

```http
Authorization: Bearer ACCESS_TOKEN
```

Unauthenticated users are redirected to the sign-in interface where appropriate.

---

## Authorization

The application uses role and permission information supplied by the backend to determine which functionality should be available to each user.

Example roles:

### System Administrator

Full administrative access.

### Warehouse Manager

Operational management and approval capabilities.

### Inventory Officer

Day-to-day inventory operations.

### Management Viewer

Primarily read-only management access.

Permission-sensitive functionality may include:

- Creating records
- Editing records
- Submitting records
- Approving records
- Rejecting records
- Completing operational workflows
- Managing users
- Managing system settings

The backend remains the authoritative source for authorization.

---

## Project Structure

The exact structure may evolve, but the frontend follows a feature-oriented architecture similar to:

```text
src/
├── assets/
│   ├── icons/
│   └── images/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── items/
│   ├── receipts/
│   ├── transfers/
│   ├── adjustments/
│   ├── stock-counts/
│   ├── reports/
│   ├── users/
│   ├── data-import/
│   ├── audit/
│   └── settings/
│
├── shared/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── utilities/
│
├── App.jsx
└── main.jsx
```

---

## API Layer

Shared API communication is centralized rather than placing raw Axios requests throughout UI components.

For example:

```text
shared/api/
└── entoucheApi.js
```

Feature-specific API modules may wrap the shared API client:

```text
features/settings/api/
features/items/api/
features/transfers/api/
```

This architecture helps maintain:

- Consistent authentication
- Consistent error handling
- Reusable API calls
- Centralized API configuration
- Cleaner React components

---

## Inventory Workflow

The application provides interfaces for the major inventory lifecycle:

```text
Receive
   ↓
Store
   ↓
Move
   ↓
Adjust
   ↓
Count
   ↓
Reconcile
   ↓
Report
```

Inventory-changing operations are performed through controlled workflows rather than directly modifying stock quantities from the frontend.

---

## Error Handling

API errors should be handled through the centralized API layer whenever possible.

The frontend may display:

- Validation errors
- Authentication errors
- Authorization errors
- Inventory availability errors
- Server errors
- Import errors
- Network errors

User-facing messages should provide useful information without exposing sensitive server details.

---

## File Uploads

The frontend supports file uploads for functionality such as:

- Inventory imports
- Item images
- Company logos

File uploads use `FormData` and `multipart/form-data` requests where required by the backend.

---

## Company Logo

Administrators can upload a company logo from the Settings interface.

The frontend sends the selected image to the API:

```text
Settings
   ↓
Select Company Logo
   ↓
Multipart Upload
   ↓
Laravel API
   ↓
Cloud Image Storage
   ↓
Logo URL Stored in Settings
   ↓
Frontend Branding Updated
```

The company logo can then be used throughout the application.

---

## Notifications

The application provides an in-app notification interface.

Notifications can open contextual dialogs for relevant resources such as:

- Receipts
- Transfers
- Adjustments
- Stock counts
- Imports
- Users
- System maintenance

Notification data is supplied by the backend API.

---

## Responsive Interface

The application is designed primarily as an enterprise web application and includes responsive behavior for different screen sizes.

Major interface elements include:

- Collapsible application sidebar
- Responsive tables
- Dialogs and modals
- Notification drawer
- Filter controls
- Pagination
- Forms
- Dashboard cards

---

## Development Guidelines

When adding a new frontend feature:

1. Identify the relevant feature/module.
2. Add API integration through the API layer.
3. Keep business/API logic out of presentation components where practical.
4. Implement loading and error states.
5. Apply permission checks where required.
6. Add appropriate validation.
7. Test the complete backend workflow.
8. Verify responsive behavior.
9. Test production builds before deployment.

---

## Code Quality

Before committing changes, run the project's configured checks where applicable:

```bash
npm run lint
```

Create a production build to detect build-time issues:

```bash
npm run build
```

A successful local development session does not necessarily guarantee a successful production build, particularly on environments with case-sensitive file systems.

---

## Security

Frontend security practices include:

- Do not commit secrets or credentials
- Do not expose backend API secrets
- Do not place private API credentials in `VITE_*` variables
- Treat frontend environment variables as publicly accessible
- Use HTTPS in production
- Do not rely on hidden buttons for authorization
- Validate permissions on the backend
- Avoid exposing sensitive server error information
- Keep dependencies updated

> Any value bundled into a Vite frontend can potentially be inspected by users. Sensitive credentials must remain on the backend.

---

## Deployment

The frontend can be deployed to platforms that support static Vite applications.

The application can be deployed using services such as:

- Netlify
- Vercel
- AWS
- Azure
- Other static web hosting platforms

Typical deployment process:

```bash
npm install
npm run build
```

Build directory:

```text
dist
```

The deployment environment should provide the appropriate:

```env
VITE_API_URL=
```

---

## Backend API

This repository contains the **frontend application only**.

The backend is maintained in a separate repository and is responsible for:

- Authentication
- Authorization
- Database operations
- Inventory calculations
- Stock movements
- Approval workflows
- Notifications
- File processing
- Image uploads
- Audit logging
- System settings

---

## Environment Separation

Development, staging, and production environments should use separate API configuration.

Example:

```text
Development Frontend
        ↓
Development API

Staging Frontend
        ↓
Staging API

Production Frontend
        ↓
Production API
```

Always verify the active API environment before performing production-sensitive operations.

---

## Troubleshooting

### API requests are failing

Verify:

```env
VITE_API_URL=
```

and confirm the backend is running and accessible.

### Authentication fails

Verify:

- API URL
- User credentials
- Backend availability
- Access token handling
- CORS configuration

### Changes to `.env` are not reflected

Restart the Vite development server:

```bash
npm run dev
```

Vite environment variables are loaded when the development server starts.

### Production build fails but development works

Run:

```bash
npm run build
```

locally and check for:

- Incorrect import paths
- Filename capitalization differences
- Missing dependencies
- ESLint errors
- Environment configuration issues

---

## Ownership

The Entouche Inventory Management System was **designed and developed by Skiplab Innovation**.

The underlying software, source code, reusable components, and intellectual property are subject to the applicable software development and licensing agreement.

Unauthorized copying, redistribution, resale, or commercial use of this software is prohibited except where expressly permitted by the applicable agreement.

---

## Developed By

**Skiplab Innovation**

Software solutions for modern business operations.

---

## License

This software is proprietary.

Copyright © 2026 **Skiplab Innovation**. All rights reserved.

Use, modification, reproduction, redistribution, sublicensing, or commercial exploitation of this software is subject to the applicable software development and licensing agreement.