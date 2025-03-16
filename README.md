# Chatoms: Realtime Social Chat Application using Socket.io 

A real-time chat application that supports group chats, channels, stories, and file sharing. This project is built with a **Node.js backend** and a **React frontend**, providing a seamless user experience for communication.

## 🚀 Live Demo
- [Click here to use ChatApp](https://chatapp-vmy3.onrender.com).
- Link: https://chatapp-vmy3.onrender.com
---

## 📱Screenshots
![Screenshot 2025-03-17 025131](https://github.com/user-attachments/assets/9bcd2230-5139-4022-a843-dbb479bb69bf)
![Screenshot 2025-03-17 025228](https://github.com/user-attachments/assets/37cf6f9e-da66-4ead-84f1-8ca54f92f54e)


---
## 🚀 Features

- **Authentication**: Secure user registration and login.
- **Real-Time Messaging**: Instantly send and receive messages.
- **Group Chats**: Create and manage chat groups.
- **Channels**: Join and interact in topic-based channels.
- **Stories**: Share images that disappear after 24 hours.
- **File Sharing**: Upload and share files in chats.
- **Profile Management**: Update profile pictures and user details.
- **Media Previews**: View shared images and documents.
- **Search**: Find users, groups, and channels quickly.

---

## 🛠 Tech Stack

### Backend:
- **Node.js** - Server-side runtime.
- **Express.js** - Web framework for building APIs.
- **MongoDB** - NoSQL database for storing user, group, and message data.
- **Mongoose** - ODM for MongoDB.
- **Socket.IO** - Enables real-time communication.
- **Cloudinary** - Media storage for images and videos.

### Frontend:
- **React** - Component-based UI library.
- **Vite** - Fast development build tool.
- **Zustand** - Lightweight state management.
- **React Hot Toast** - User-friendly notifications.
- **Tailwind CSS** - Utility-first CSS framework.

---

## 📦 Installation & Setup

### Prerequisites:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or on a cloud service like MongoDB Atlas)
- [Cloudinary](https://cloudinary.com/) (For media storage)

### Backend Setup:
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies
   ```sh
    npm install
   ```
3. Create a .env file in the backend directory and add the following:
    ```sh
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
4. Start the backend server:
   ```sh
    npm start
   ```

### Frontend Setup:
1. Navigate to the frontend folder:
   ```sh
    cd frontend
   ```
2. Install dependencies:
   ```sh
    npm install
   ```
3. Start the development server:
   ```sh
    npm run dev
   ```

## 📂 Folder Structure
### Backend:
  ```bash
    backend/
    ├── .env                # Environment variables
    ├── package.json        # Backend dependencies
    └── src/
        ├── index.js        # Entry point for the backend
        ├── controllers/    # API controllers
        ├── lib/            # Utility libraries (e.g., database, cloudinary)
        ├── middleware/     # Middleware (e.g., authentication)
        ├── models/         # Mongoose models
        └── routes/         # API routes
  ```
### Frontend:
  ```bash
    frontend/
    ├── public/             # Static assets (e.g., icons, images)
    ├── src/
    │   ├── App.jsx         # Main React component
    │   ├── components/     # Reusable components (e.g., Sidebar, ChatInput)
    │   ├── pages/          # Page components (e.g., ProfilePage, GroupInfoPage)
    │   ├── store/          # Zustand stores for state management
    │   └── lib/            # Utility libraries (e.g., axios instance)
    ├── vite.config.js      # Vite configuration
    └── package.json        # Frontend dependencies
  ```
