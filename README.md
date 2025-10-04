# gfash

gfash is a modern e-commerce multi-boutique web application built with **React** for the frontend and **Express + MongoDB** for the backend. It allows managing stores, products, and users seamlessly.

## Features

- create and manage boutique
- Add, update, and delete products via a personalized dashboard
- User and seller authentication with otp
- user and seller forgot password and reset password flows
- User registration, login, and OTP verification
- Access and refresh token management with secure cookies
- Shopping cart and orders management
- Image uploads with image kit
- RESTful API with Express
- Form validation

## Main User Routes

`/register` POST User registration  
`/verify` POST OTP verification / user activation  
`/login` POST User login  
`/forgot-password` POST Forgot password  
`/verify-forgot-password` POST Verify OTP for forgot password  
`/reset-password` POST Reset user password  
`/refresh-token` GET Refresh JWT token via secure cookie

## Technologies Used

- **Frontend:** React, Nextjs,Typescript, tanstack, react-query, axios, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, Prisma, Redis for secondary database
- **Authentication:** JWT, secure cookies, OTP
- **Devops:** Docker for containerization
- **Image Storage:** Image uploads via ImageKit
- **API Documentation:** Swagger
- **Tools:** Nodemailer, ejs, kafka, Microservices (monorepo)

**Clone the repository**
git clone https://github.com/SuperLoveDev/gfash.git
