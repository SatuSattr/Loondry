# Loondry Mobile Client

A premium React Native mobile application for Loondry customers, built with **Expo, Expo Router, TypeScript, and TailwindCSS (NativeWind)**. It allows customers to track their laundry orders in real-time, view their loyalty points, redeem vouchers, and receive push notifications when their laundry is ready for pickup.

---

## 🚀 Key Features

* **Real-time Order Progress**: Check laundry status (Queue, Washing, Ironing, Ready to Pick Up, Completed) with visual condition photos uploaded by operators.
* **Loyalty Points & Vouchers**: View points balance, redeem points for discount vouchers, and access redeemed vouchers directly inside the app.
* **Push & In-App Notifications**: Receive real-time pop-up alerts on status updates (such as when an order changes to "Siap Diambil") and administrative targeted broadcasts.
* **Onboarding Walkthrough**: A smooth, interactive sliding onboarding introduction for first-time users.
* **Profile Management**: View and edit profile information, change login password, and upload a custom avatar.
* **Interactive Dark Mode**: Sleek user experience matching the system theme or manually toggleable.

---

## 🛠️ Installation & Getting Started

### Prerequisites

* **Node.js**: >= 20.x
* **npm** or **yarn**
* **REST API Backend**: Ensure the Laravel API server is running.
* **Android Studio / Xcode**: Required for running Development builds.

### 1. Setup Dependencies
From the repository root, navigate into the mobile folder and install packages:
```bash
cd apps/mobile
npm install
```

### 2. Configure Environment variables
Create a `.env` file in the root of `apps/mobile/` and set the backend base API URL:
```env
EXPO_PUBLIC_API_URL=http://<your-machine-local-ip>:8000/api
```
*Note: Do not use `localhost` or `127.0.0.1` when testing on physical mobile devices; use your local network IP (e.g. `192.168.1.100`).*

### 3. Setup Push Notifications (Firebase FCM)
To receive remote push notifications, Android requires Firebase Cloud Messaging credentials:
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Add an **Android App** using package name `com.satusattr.mobile`.
3. Download `google-services.json` and place it in `apps/mobile/google-services.json`.
4. Ensure `google-services.json` is listed in your `.gitignore` to prevent committing it.
5. In `app.json`, verify the configuration points to the file:
   ```json
   "android": {
     "googleServicesFile": "./google-services.json",
     "package": "com.satusattr.mobile"
   }
   ```
6. Regenerate native files:
   ```bash
   npx expo prebuild --clean
   ```

### 4. Running the App

#### Running in Expo Go (Limited push notification support)
```bash
npm run start
```

#### Running a Development Build (Recommended for Push Notifications)
To compile the application as a native package and run it on a connected device/emulator:
```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## 📂 Folder Structure

```
apps/mobile/
├── assets/             # Images, custom fonts, and logo assets
├── app/                # Expo Router pages (Walkthrough, Login, Tabs, Dashboard, Vouchers)
│   ├── (auth)/         # Login screen
│   ├── (app)/          # Tabs shell (Dashboard, Notifications Inbox, Vouchers, Profile)
│   ├── _layout.tsx     # Root shell & Global Toast handler
│   └── index.tsx       # Entry point route controller
├── context/
│   └── AppContext.tsx  # Centralized global state, Authentication, and Push Token handler
├── scratch/            # Development helper scripts
├── src/
│   └── api.ts          # Axios fetch client wrapping Sanctum auth and route calls
├── app.json            # Expo project configuration
└── package.json        # Dependencies list
```
