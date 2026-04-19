# VenueSync 🏟️

**VenueSync** is a modern, real-time stadium management and fan experience platform. Built with a sleek dark glass-morphism aesthetic, it consolidates live operations, food & beverage ordering, and interactive venue mappings into one seamless dashboard.

## 🚀 Features

- **Interactive 3D-Style Stadium Map:** A fully interactive map displaying real-time capacities, wait times, and crowd density for gates, food courts, stands, and more.
- **AI-Powered Pathfinding:** Get step-by-step navigation algorithms to route fans from their seats to amenities avoiding congested zones.
- **Express Food Ordering:** Zero-queue ordering system supporting Seat Delivery and QR Express Pickup.
- **Real-Time Ecosystem (Firebase):** Live syncing of orders, stadium zones, and instant authentication via Firestore & Firebase Auth (Email and Google).
- **Operations & Analytics Tab:** Dedicated metrics, dynamic local weather widget, and live event timelines for stadium operators.

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), React, Tailwind CSS (Custom Dark-Theme CSS architecture)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Firestore Real-time database, Firebase Authentication)
- **UI & Icons:** Custom SVG implementations and inline [Lucide](https://lucide.dev/) Icons.

## ⚙️ Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/venuesync.git
   cd venuesync
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Firebase configuration credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Firebase Configuration Note
To ensure the authentication flow works locally:
1. Go to your Firebase Console -> **Authentication** -> **Sign-in method**.
2. Enable both **Email/Password** and **Google** providers.

## 📝 License
This project is licensed under the MIT License.
