# Productr Backend

Backend for **Productr**, a product management system that supports OTP authentication, secure APIs, and cloud-based image uploads.

Frontend Repo: https://github.com/shreebhagwan03/productr-frontend

## Tech Stack
- Node.js
- Express
- MongoDB
- JWT Authentication
- Cloudinary
- Multer
- Nodemailer


## Features
- OTP-based Login & Signup
- JWT Authorization
- Protected Routes
- Product Create / Update / Delete APIs
- Image Upload to Cloudinary
- Publish / Unpublish Products

## Setup

Create a file named `.env` in the root folder and add:

PORT=5000  
MONGO_URI=your_mongo_connection  
JWT_SECRET=your_secret  

CLOUD_NAME=your_cloud_name  
CLOUD_API_KEY=your_key  
CLOUD_API_SECRET=your_secret  

EMAIL_USER=your_email  
EMAIL_PASS=your_password  

Then run:

npm install  
npm start  


## Important
Do NOT upload your `.env` file to GitHub.  
Make sure `.env` is inside `.gitignore`.

---

## Author
Shree Bhagwan Swami
