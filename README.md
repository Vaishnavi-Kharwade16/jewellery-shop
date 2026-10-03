# 💎 Jewellery Shop – MERN E-Commerce Website

A full-stack jewellery e-commerce web application built with the MERN stack. The project includes customer shopping features, authentication, product management, cart and wishlist functionality, order management, reviews, and Razorpay test payment integration.

## 🌐 Live Demo

- **Frontend:** https://jewellery-shop-seven-vert.vercel.app/
- **Backend API:** https://jewellery-shop-3-bdm0.onrender.com/

## ✨ Features

### 👤 Customer Features
- User registration and login
- JWT-based authentication
- Browse jewellery products
- View product details
- Add products to cart
- Update and remove cart items
- Wishlist functionality
- Checkout
- Razorpay test payment integration
- Order history
- Product reviews
- Address management

### 🛠️ Admin Features
- Admin authentication and role-based access
- Admin dashboard
- Add products
- Edit products
- Deactivate products
- Manage product inventory
- View customer orders
- Update order status

### 💳 Payment
- Razorpay test-mode integration
- Payment order creation
- Payment verification
- Order creation after successful payment
- Cart clearing after successful order creation

## 🧰 Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- PDFKit
- Razorpay

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure

```text
jewellery-shop/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── .env
│   └── package.json
└── README.md
```

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd jewellery-shop
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
PORT=5000
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔐 Environment Variables

### Backend

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWT authentication tokens |
| `RAZORPAY_KEY_ID` | Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret |
| `PORT` | Backend server port |

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL |

**Never commit `.env` files or API/payment secrets to GitHub.**

## 🔑 Authentication

The application uses JWT-based authentication.

- Customers receive a JWT after successful login.
- The token is stored on the frontend.
- Axios sends the token in the `Authorization` header.
- Protected backend routes verify the token.
- Admin functionality uses role-based authorization.

## 🛒 Main User Flow

```text
Register / Login
      ↓
Browse Products
      ↓
View Product
      ↓
Add to Cart / Wishlist
      ↓
Checkout
      ↓
Razorpay Test Payment
      ↓
Payment Verification
      ↓
Order Created
      ↓
My Orders
      ↓
Cart Cleared
```

## 👨‍💼 Admin Flow

```text
Admin Login
     ↓
Admin Dashboard
     ↓
Manage Products
     ├── Add Product
     ├── Edit Product
     └── Deactivate Product

     ↓
Manage Orders
     └── Update Order Status
```

## 🔌 Important API Routes

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Products

```text
GET    /api/products
GET    /api/products/:id
GET    /api/products/admin
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Cart

```text
GET    /api/cart
POST   /api/cart
PUT    /api/cart/:productId
DELETE /api/cart/:productId
```

### Wishlist

```text
GET    /api/wishlist
POST   /api/wishlist
DELETE /api/wishlist/:productId
```

### Orders

```text
POST /api/orders
GET  /api/orders
```

### Payment

```text
POST /api/payment/create-order
POST /api/payment/verify
```

### Reviews

```text
GET  /api/reviews/:productId
POST /api/reviews
```

## 🚀 Deployment

### Frontend

Production frontend:

https://jewellery-shop-seven-vert.vercel.app/

Production environment variable:

```env
VITE_API_URL=https://jewellery-shop-3-bdm0.onrender.com
```

### Backend

Production API:

https://jewellery-shop-3-bdm0.onrender.com/

### Database

MongoDB Atlas is used as the production database.

## 🧪 Payment Testing

The application uses Razorpay test mode. No real money should be used for testing.

## 📌 Project Highlights

- Full-stack MERN e-commerce application
- REST API architecture
- JWT authentication
- Role-based admin access
- MongoDB database integration
- Shopping cart and wishlist
- Product reviews
- Order management
- Razorpay payment integration
- Vercel + Render deployment
- Environment-based configuration
- Responsive frontend UI

## 📄 License

This project was developed as an academic/project submission and demonstration of full-stack web development skills.
