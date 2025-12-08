# 📘 BookingApp-FE  
*A modern booking management frontend built with React, TypeScript, and Vite.*

BookingApp-FE is a responsive and user-friendly frontend application for managing **bookings, customers, employees, and services**.  
It follows clean architecture principles, strong type safety, and a scalable project structure.

This repository contains the full **client-side application** that communicates with a **.NET backend API**.

---

## 🚀 Features

### 📅 **Booking Management**
- View all bookings  
- View booking details  
- Create new bookings  
- Update existing bookings  
- Cancel bookings / update status  

### 🔎 **Advanced Filtering**
- Filter by date range  
- Filter by booking status  
- Filter by employee  

### 👥 **Customer & Employee Integration**
- Dynamic dropdowns populated from API  
- Displays full names instead of ID values  

### ✔ **Form Validation**
- Required field checks  
- Inline error messages  
- Backend validation support  

### 🎨 **Modern UI/UX**
- Built with **Shadcn UI** + **Tailwind CSS**  
- Clean, minimalistic components  
- Fully responsive layout  

### ⚡ **Data Handling & State**
- **React Query** for caching, loading states, and auto-refetching  
- Custom API service layer with typed requests  
- Strong TypeScript typings across the app  

---

## 🛠 Tech Stack

| Category      | Technology |
|---------------|------------|
| **Framework** | React (TypeScript) |
| **Styling**   | Tailwind CSS, Shadcn UI |
| **State/Data** | React Query |
| **Routing**   | React Router |
| **Build Tool** | Vite |
| **API Layer** | Fetch API + custom wrapper (`apiFetch`) |

---

## 📦 Installation & Setup

### 1️⃣ **Clone the repository**
\`\`\`bash
git clone https://github.com/KristinaK993/BookingApp-FE.git
cd BookingApp-FE
\`\`\`

### 2️⃣ **Install dependencies**
\`\`\`bash
npm install
\`\`\`

### 3️⃣ **Create a .env file**
\`\`\`env
VITE_API_URL=https://localhost:7263/api
\`\`\`

### 4️⃣ **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

**App will be available at:**  
👉 http://localhost:8080

---

## 🔌 Backend Integration

The frontend communicates with a .NET API that exposes endpoints for:

| Resource | Example Endpoint |
|---------|------------------|
| **Bookings** | `GET /bookings?companyId=1` |
| **Customers** | `GET /customers?companyId=1` |
| **Employees** | `GET /employees?companyId=1` |
| **Services** | `GET /services?companyId=1` |

All data fetching and caching is handled through **React Query**.

---

## 📁 Project Structure

```
src/
├─ api/ # API services (bookings, customers, employees, services)
├─ components/ # Shared components + layout
├─ components/ui/ # Shadcn UI components
├─ context/ # Auth and global state
├─ pages/ # App pages (Bookings, BookingDetail, Login, etc.)
├─ types/ # TypeScript models and interfaces
├─ App.tsx # Routing configuration
└─ main.tsx # Application entrypoint
```





Built to be:  
✔ **Scalable**  
✔ **Easy to understand**

---

## 🔮 Future Improvements
Potential enhancements for future versions:

- **Role-based authentication**  
- **Calendar-based booking overview**  
- **Email or push notifications**  
- **Unit tests for UI and services**  
- **Dark mode support**
---




**👩‍💻 Author:**
Kristina K

