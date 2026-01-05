# Restaurant Ordering System  
CSCI426 – Advanced Web Programming (Project Phase 2)

## Project Description

This project is a full-stack restaurant ordering web application developed as part of  
**CSCI426 – Advanced Web Programming (Project Phase 2)**.

The system allows customers to browse the menu, place orders, and submit feedback.  
An admin dashboard is provided for managing orders and customer feedback.  
The backend is built using **Node.js** and **Express.js**, with **MySQL** used for data storage.  
Email notifications are sent upon successful order creation.

---

## Technologies Used

### Frontend
- React.js
- Axios
- HTML, CSS

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Other Tools
- Nodemailer (Email notifications)
- Git & GitHub

---

## Features

- Dynamic menu fetching from backend
- Customer order submission with automatic total calculation
- Email notification on order creation
- Customer feedback submission
- Admin dashboard for managing orders and feedback
- Responsive design (desktop & mobile)

---

## Application Pages

- Home
- Menu
- About
- Contact
- Order
- Order Confirmation
- Admin Dashboard
- Login

---

## REST API Endpoints

| Method | Endpoint                | Description                 |
|--------|-------------------------|-----------------------------|
| GET    | /api/items              | Retrieve menu items         |
| POST   | /api/orders             | Create a new order          |
| GET    | /api/orders/admin       | Retrieve all orders (Admin) |
| PATCH  | /api/orders/admin/:id   | Update order status         |
| DELETE | /api/orders/admin/:id   | Delete order                |
| POST   | /api/feedback           | Submit feedback             |
| GET    | /api/feedback/admin     | Retrieve feedback           |
| DELETE | /api/feedback/admin/:id | Delete feedback             |

---

## Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
npm install
Create a .env file in the backend directory:

env
Copy code
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
Start the backend server:

bash
Copy code
npm start
Frontend Setup
Navigate to the frontend folder:

bash
Copy code
cd frontend
npm install
npm start

Screenshots

Home Page
![Home Page](image.png)

Menu Page
![Menu Page](image-1.png)

Order Page
![Order Page](image-2.png)

Admin Dashboard
![Admin Page](image-3.png)

## 🌐 Live Demo
Frontend (Vercel):
https://restaurant-ordering-system-nu.vercel.app/

⚠️ Note: The backend is not deployed online due to hosting constraints.
The full backend implementation is available in the GitHub repository and runs locally.

Author
Mostafa Diab
CSCI426 – Advanced Web Programming