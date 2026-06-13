# Loondry Session Checkpoint 🚀

This checkpoint is created to give the next AI agent immediate, granular technical context about the current state of the **Loondry** project, the changes implemented during this session, and the next steps. **Do not scan the entire codebase; read this file first.**

---

## 🏗️ Project Architecture & Stack
This is a monorepo located at `F:/.RyanN/Loondry` containing:

1. **`apps/api` (Backend)**:
   - Framework: **Laravel (PHP)**
   - Database: Relational Database (accessed via Laravel Eloquent ORM).
   - Testing: Run tests using `php artisan test`.
   
2. **`apps/dashboard` (Frontend)**:
   - Core Stack: **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4** (using `@tailwindcss/vite` plugin).
   - Components & Primitives: Custom components built using **`@base-ui/react`** (specifically `Menu` primitives).
   - State & API fetching: Managed through a helper client class `api` in `apps/dashboard/src/lib/api.ts`.
   
3. **`apps/mobile` (Mobile Workspace)**:
   - Mobile application files.

---

## 🏆 Detailed Technical Changes & Fixes in this Session

### 1. Dropdown Layout Shift Bug (Fixed)
* **Affected Components**:
  * **Service Selection Dropdown** in `TransactionForm.tsx`
  * **Gender Selection Dropdown** in `CustomerForm.tsx`
  * **Unit & Status Dropdown** in `ServiceForm.tsx`
  * **Discount Type & Status Dropdown** in `VoucherForm.tsx`
* **Root Cause**:
  * The custom `<DropdownMenu>` component wraps `@base-ui/react/menu` primitives.
  * When a menu is toggled open, `@base-ui/react` inserts invisible focus sentinel `<span>` tags (`tabindex="-1"`, `aria-hidden="true"`) to capture and cycle keyboard tab focuses.
  * In Tailwind CSS, utility spacing classes like `space-y-1` or `space-y-4` compile to direct child sibling margin selectors (e.g. `& > * + * { margin-top: 0.25rem; }`).
  * Since the `<DropdownMenu>` was placed directly inside containers with `space-y-*` classes, these invisible sentinels became direct siblings of the input/labels, receiving a `margin-top` values (e.g. `0.25rem` or `1.25rem`). This added phantom vertical height to the container flow, translating/pushing down all content below it.
* **The Solution**:
  * Wrapped the `<DropdownMenu>` component inside a plain, un-styled `<div>` wrapper in each affected form.
  * Because the wrapper `<div>` has no `space-y-*` classes, any sentinels injected by `@base-ui/react` inside it are shielded from the sibling margin selectors. The sentinel retains a flat height of `0px` with no margins, preventing any layout shifting or translation.
* **Updated Files**:
  * [TransactionForm.tsx](file:///F:/.RyanN/Loondry/apps/dashboard/src/components/TransactionForm.tsx) (Line 322)
  * [CustomerForm.tsx](file:///F:/.RyanN/Loondry/apps/dashboard/src/components/CustomerForm.tsx) (Line 193)
  * [ServiceForm.tsx](file:///F:/.RyanN/Loondry/apps/dashboard/src/components/ServiceForm.tsx) (Lines 105, 141)
  * [VoucherForm.tsx](file:///F:/.RyanN/Loondry/apps/dashboard/src/components/VoucherForm.tsx) (Lines 156, 249)

### 2. TypeScript Compilation & Production Build Fixes
* **Problem**: Unused variables and parameter configurations in `POSView.tsx` were failing the Vite/TypeScript build pipeline:
  1. `Keyboard` was imported from `'lucide-react'` but never referenced.
  2. `onOpenShortcuts` prop was declared in the props interface and destructured in `POSView(...)` parameters but never used.
* **Fix**: Cleaned up the unused variable/import in `POSView.tsx` and removed the unused prop from `src/App.tsx` (shortcuts information is toggled on the main `DashboardView.tsx` header instead of `POSView.tsx` as per the user's requirements).
* **Updated Files**:
  * [POSView.tsx](file:///F:/.RyanN/Loondry/apps/dashboard/src/components/POSView.tsx)
  * [App.tsx](file:///F:/.RyanN/Loondry/apps/dashboard/src/App.tsx)
* **Result**: Production compilation (`npm run build`) now runs and succeeds flawlessly with zero warnings/errors.

### 3. Sidebar Form Autofocus on Mount
* **Implementation**: Standardized immediate focus behavior on the first text/number input element when sidebar forms (such as `TransactionForm`, `CustomerForm`, etc.) mount.
* **Method**: Uses standard React `useRef` + `useEffect` hook to call `.focus()` on the primary input field component mount.

### 4. HTML5 Date Conforming Warning
* **Problem**: React logged warnings about invalid date formats (e.g. `2008-11-21T00:00:00.000000Z` does not conform to the required HTML5 date input format `"yyyy-MM-dd"`).
* **Fix**: Formatted all dates retrieved from backend to standard ISO date-only format before feeding them into date inputs:
  ```typescript
  birth_date ? birth_date.substring(0, 10) : ''
  ```

### 5. Payment Timing & Methods Logic
* **Logic**: Added a toggle between "Pay Now (Upfront)" and "Pay Later (Upon Pickup)" (Payment Timing) on `TransactionForm.tsx`.
* **State Behavior**:
  * If payment timing is **Pay Later (pickup)**, the payment methods selector is hidden, and `payment_status` is sent as `'pending'`. The transaction payload leaves the payment method blank (defaults to null) for checkout.
  * If payment timing is **Pay Now (upfront)**, the payment method selector is shown (Cash, Transfer, QRIS), and `payment_status` is sent as `'paid'`.

### 6. Clothes Condition Photo Flow
* **Logic**: Removed the clothes condition photo upload field from the transaction creation wizard (`TransactionForm.tsx`).
* **Replacement**: Added an action button with a camera icon on each transaction row in the POS Transaction Table. Clicking it prompts the user to select and upload a clothes condition photo for that specific transaction.
* **Implementation Details**:
  * Calls backend API endpoint: `api.uploadConditionImages(id, file)`
  * Reloads transaction table data post-upload to display updated status indicators.

### 7. Voucher Application UI Adjustments
* **Change**: Changed the voucher code submission button from Indonesian text ("Terapkan") to a checklist icon (`Check` from `'lucide-react'`).
* **Form Layout Order**: Reordered the sections of `TransactionForm.tsx` to follow this structure:
  1. Select Customer
  2. Service Selector
  3. Weight/Quantity
  4. Payment Period
  5. Payment Method
  6. Voucher Code
  7. Order Summary
  8. Action Buttons (Cancel / Create)

### 8. Localization & English Translations
* **Change**: Standardized UI vocabulary. Translated all remnant Indonesian titles, placeholders, alerts, and badges across frontend components into English.

### 9. Keyboard Shortcuts Sidebar
* **Feature**: Added a Keyboard icon button (`Keyboard` from `'lucide-react'`) in the `POS Dashboard` header next to the statistics refresh button. Clicking this triggers the `onOpenShortcuts` callback to show a sidebar (`SlideOver`) displaying all available keyboard shortcut instructions.

---

## 🏃 Commands Reference (Root directory: `F:\.RyanN\Loondry`)
* **Local Dashboard Dev Server**:
  ```powershell
  cd apps/dashboard
  npm run dev
  ```
* **Production Build for Dashboard**:
  ```powershell
  cd apps/dashboard
  npm run build
  ```
* **Laravel API local server (if needed)**:
  ```powershell
  cd apps/api
  php artisan serve
  ```
* **Run Backend Tests**:
  ```powershell
  cd apps/api
  php artisan test
  ```

---

## 🔮 Next Agent Focus
* The dropdown alignment shifts are completely fixed and build/run sequences compile perfectly.
* Coordinate with the user for any new functional adjustments, styling, or API integration steps.
