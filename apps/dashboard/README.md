# Loondry Web Admin Dashboard

A modern, high-performance laundry Point of Sales (POS) management panel built with **Vite, React, TypeScript, and shadcn/ui**. It communicates with the Laravel REST API backend to process orders, manage customers, configure services, and handle loyalty/voucher redemptions.

---

## 🚀 Key Features

* **POS Transaction System**: Easily place orders, calculate pricing based on service rates and weights, and print invoices.
* **Order Tracking**: Real-time progress updates for orders (Queue, Washing, Ironing, Ready to Pick Up, Completed).
* **Customer Management**: Profile registries, tracking phone numbers, and managing accumulated loyalty points.
* **Loyalty & Vouchers**: Set point-exchange voucher templates and review redemption logs.
* **Service Master Catalog**: Manage washing/dry cleaning service types, unit types, and pricing.
* **Broadcast Notifications**: Target and dispatch notification campaigns to customer segments. Choose between In-App Inbox, Mobile Push Alert, or both, filter by demographics (gender, religion, age), and attach custom horizontal banner images (under 2MB).
* **Seamless Navigation**: Zero-latency page switching powered by a custom client-side prefetching and caching layer.
* **Dark Mode**: Complete light and dark mode styling with automatic theme persistence.

---

## ⌨️ Cashier Keyboard Shortcuts

To maximize operation speed, the dashboard is equipped with dedicated keyboard shortcuts to let cashiers work entirely without a mouse.

| Shortcut | Action | Context |
| :--- | :--- | :--- |
| **`F2`** or **`Alt + N`** | Open New Order Form | Global |
| **`F3`** or **`Alt + C`** | Open Register Customer Form | Global |
| **`Esc`** | Close Open Form/Drawer | Global |
| **`Ctrl + Enter`** | Submit Active Form | Inside any input fields |
| **`/` (Slash)** | Focus Search Bar | Global (When not typing) |
| **`Alt + 1`** | Navigate to Dashboard | Global |
| **`Alt + 2`** | Navigate to Transactions | Global |
| **`Alt + 3`** | Navigate to Customers | Global |
| **`Alt + 4`** | Navigate to Services | Global |
| **`Alt + 5`** | Navigate to Vouchers | Global |

*Form elements are designed with semantic tab indexes, focus rings, and full keyboard focus access (including custom select lists and file uploads).*

---

## 🛠️ Installation & Getting Started

### Prerequisites

* **Node.js**: >= 20.x
* **npm** or **yarn**
* **REST API Backend**: Make sure the backend server (Laravel) is running.

### 1. Setup Dependencies
From the repository root, navigate into the dashboard folder and install packages:
```bash
cd apps/dashboard
npm install
```

### 2. Environment Configuration
Create a local `.env` file by copying the example template:
```bash
cp .env.example .env
```
Open `.env` and set your API backend host:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Running Development Server
Launch the hot-reloading development server:
```bash
npm run dev
```
The application will default to [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
To compile a minimized production bundle:
```bash
npm run build
```
This generates optimized HTML, CSS, and JS assets in the `dist` directory.

---

## 📂 Folder Structure

```
apps/dashboard/
├── public/                 # Static assets
├── src/
│   ├── components/         # Page Views & Action Forms
│   │   ├── ui/             # Accessible UI Primitives (shadcn/base-ui)
│   │   ├── DashboardView.tsx
│   │   ├── POSView.tsx
│   │   ├── CustomersView.tsx
│   │   ├── ServicesView.tsx
│   │   ├── VouchersView.tsx
│   │   └── ...
│   ├── lib/
│   │   └── api.ts          # Axios-like Fetch wrapper & Caching layer
│   ├── App.tsx             # Main Layout shell & Keyboard listener
│   ├── index.css           # Core styling and theme configuration
│   └── main.tsx            # React application entry point
├── .env.example
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 🔌 API & Caching Layer

The dashboard handles API requests inside `src/lib/api.ts`. To prevent double-fetching on page prefetching, a lightweight client-side cache is integrated:
* **GET Requests**: Responses are cached for 5 seconds. If the application requests the same endpoint within this window (e.g., when transitioning tabs), it loads instantly.
* **Mutations**: Any write requests (`POST`, `PUT`, `DELETE`) automatically purge the cache to guarantee the cashier always sees fresh, up-to-date data.
