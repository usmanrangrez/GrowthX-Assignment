# 📚 Student Assignment Submission API

This API allows students to submit assignments, with role-based access for users and admins. It features secure authentication, file uploads, and robust validation.

## 🚀 Features
- **User Registration and Authentication**: JWT-based authentication with access and refresh tokens.
- **Role-Based Access Control**: Separate permissions for admins and users.
- **Assignment Submission**: Users can upload assignments, and admins can manage them.
- **File Uploads**: File handling for assignments with Multer.
- **Robust Validation**: Request validation with Joi.
- **Logging**: Application logs using Winston.

---

## 🛠 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/student-assignment-api.git
cd student-assignment-api
```


### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env File
```bash
MONGO_URI = ENTER_YOUR_SECRET_HERE
REDIS_PORT = ENTER_YOUR_SECRET_HERE
REDIS_HOST = ENTER_YOUR_SECRET_HERE
NODE_ENV = ENTER_YOUR_SECRET_HERE
MAX_REDIS_RETRIES =ENTER_YOUR_SECRET_HERE
PORT = ENTER_YOUR_SECRET_HERE
ACCESS_TOKEN_KEY = ENTER_YOUR_SECRET_HERE
REFRESH_TOKEN_KEY = ENTER_YOUR_SECRET_HERE
ACCESS_TOKEN_EXPIRY = ENTER_YOUR_SECRET_HERE
REFRESH_TOKEN_EXPIRY = ENTER_YOUR_SECRET_HERE
BCRYPT_SALT_ROUNDS = ENTER_YOUR_SECRET_HERE
```

### 3. Run a docker container for redis
```bash
# Pull the Redis Stack image
docker pull redis/redis-stack:latest

# Run Redis Stack with UI
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```


### 4. Start the Application
```bash
npm start or npm run dev
```

### 5. Libraries used
```bash
bcrypt		            Password hashing
dotenv		            Environment variable management
express	                Web framework
express-rate-limit		API rate limiting
ioredis		            Redis client
joi		                Data validation
jsonwebtoken		    JWT-based authentication
mongooseMongoDB         ODM
multer                  File upload middleware
winston	                Logging library
helmet	                Adds security-related HTTP headers
hpp	                    Protects against HTTP parameter pollution
```


### 5.  API Endpoints
```bash
Authentication
POST /auth/register - Register a new user.
POST /auth/login - Login and retrieve access/refresh tokens.
POST /auth/refresh - Get new access token using refresh token.
POST /auth/logout - Log out the user (blacklisting previous tokens)
User Routes
GET /user/admins - Fetch all admins (user only).
POST /user/upload - Upload assignment (user only).
Admin Routes
GET /admin/assignments - Fetch all assignments (admin only).
PATCH /admin/assignment/:id - Update assignment status (admin only).
GET /admin/assignment/:id - Download/View assignment file (admin only).