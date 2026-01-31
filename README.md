# 💎 Smart Expense Splitter - Frontend Service

A modern, responsive, and aesthetic Single Page Application (SPA) built with **React** and **Vite**, featuring a premium **Glassmorphism** design system.

## ✨ Features

-   **🎨 Glassmorphic UI**: Premium translucent cards, dynamic gradients, and smooth interactions.
-   **📱 Fully Responsive**: Mobile-first design that adapts seamlessly to phones, tablets, and desktops.
-   **⚡ Vite Powered**: Lightning-fast development server and production builds.
-   **📊 Data Visualization**: Interactive charts for spending distribution (Food vs Rent vs Travel).
-   **🔔 Notification Center**: Real-time in-app alerts for new expenses and group invites.
-   **📸 OCR Integration**: Upload bill images and review parsed data instantly.
-   **🌓 Dynamic UX**: Loading skeletons, animated transitions, and interactive hover effects.

## 🛠️ Tech Stack

-   **Core**: React 18, Vite
-   **Styling**: Plain CSS (Variables, Flexbox/Grid, Animations)
-   **Routing**: React Router DOM v6
-   **Icons**: Lucide React
-   **Charting**: Recharts
-   **HTTP Client**: Axios

## ⚙️ Installation & Setup

### Prerequisites
-   Node.js 18+
-   NPM or PNPM

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/smart-expense-splitter-frontend.git
cd smart-expense-splitter-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
# URL of your running backend (Local or Production)
VITE_API_URL=http://localhost:8000/api/v1
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` to view the app.

## 🚀 Deployment (Vercel)

This project is optimized for deployment on Vercel.

1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Set the Environment Variable:
    -   `VITE_API_URL`: `https://your-backend-service.onrender.com/api/v1`
4.  Deploy!

`vercel.json` is included to handle Client-Side Routing (SPA fallback).

## 📂 Project Structure

```
src/
├── components/      # Reusable UI components (Navbar, Modals, Cards)
├── pages/          # Full page views (Dashboard, GroupDetail, Login)
├── services/       # API wrapper functions (auth, expenses, groups)
└── index.css       # Global variables & responsive styles
```

## 🤝 Contributing
Open a PR to suggest UI improvements or new features!
