# AI Code Review App

A full-stack application that provides AI-powered code review, output execution, and chat functionality using Google's Gemini AI.

## 🚀 Features

- **Code Review**: Get detailed AI-powered code reviews with suggestions for improvement
- **Code Execution**: Execute code and see output for multiple programming languages
- **AI Chat**: Interactive chat with AI for coding questions and assistance
- **Multi-language Support**: JavaScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, TypeScript

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google Gemini API key

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd AI-CODE-REVIEW-APP
```

### 2. Setup Backend
```bash
cd Backend
npm install
```

### 3. Setup Frontend
```bash
cd Frontend
npm install
```

### 4. Configure Environment Variables

#### Backend Environment (.env)
Update `Backend/.env` with your Google Gemini API key:
```env
GOOGLE_GEMINI_KEY=your_google_gemini_api_key_here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment (.env)
The frontend `.env` is already configured for development:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start Backend** (Terminal 1):
```bash
cd Backend
npm run dev
# or
node server.js
```

2. **Start Frontend** (Terminal 2):
```bash
cd Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🏗️ Building for Production

### Option 1: Using Build Scripts

#### Windows:
```cmd
build.bat
```

#### Linux/macOS:
```bash
chmod +x build.sh
./build.sh
```

### Option 2: Manual Build

1. **Build Frontend**:
```bash
cd Frontend
npm run build
```

2. **Prepare Backend**:
```bash
cd Backend
npm ci --only=production
```

3. **Configure Production Environment**:
   - Update `Backend/.env.production` with production values
   - Update `Frontend/.env.production` with production API URL

## 🚀 Production Deployment

### Option 1: Traditional Deployment

1. **Run the build script** (creates `dist` folder)
2. **Deploy the `dist` folder** to your server
3. **Start the application**:
```bash
cd dist
npm start
```

### Option 2: Docker Deployment

1. **Build Docker image**:
```bash
docker build -t ai-code-review-app .
```

2. **Run with Docker Compose**:
```bash
# Update Backend/.env.production with your values first
docker-compose up -d
```

3. **With Nginx (Production)**:
```bash
docker-compose --profile production up -d
```

### Option 3: Manual Production Setup

1. **Install dependencies and build**:
```bash
# Backend
cd Backend
npm ci --only=production

# Frontend
cd Frontend
npm ci
npm run build
```

2. **Configure environment**:
   - Set `NODE_ENV=production`
   - Update API URLs and keys

3. **Start with PM2** (recommended):
```bash
npm install -g pm2
cd Backend
pm2 start server.js --name "ai-code-review-app"
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env.production)
```env
GOOGLE_GEMINI_KEY=your_production_api_key
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### Nginx Configuration (Optional)

Use the provided `nginx.conf` for reverse proxy setup with:
- Rate limiting
- Security headers
- SSL termination (configure SSL certificates separately)

## 📁 Project Structure

```
AI-CODE-REVIEW-APP/
├── Backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── App.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.production
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config.js
│   │   └── App.jsx
│   ├── package.json
│   ├── .env
│   └── .env.production
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── build.sh
├── build.bat
└── README.md
```

## 🔒 Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: Configure CORS properly for production
3. **Rate Limiting**: Implement rate limiting (included in nginx.conf)
4. **HTTPS**: Use SSL certificates in production
5. **Environment Variables**: Use secure environment variable management

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
   - Change PORT in `.env` file
   - Kill existing processes: `lsof -ti:3000 | xargs kill`

2. **API key errors**:
   - Verify your Google Gemini API key
   - Check API quotas and billing

3. **Build failures**:
   - Ensure Node.js version 18+
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **CORS errors**:
   - Check FRONTEND_URL in backend .env
   - Verify API_BASE_URL in frontend .env

## 📝 API Endpoints

- `POST /ai/get-review` - Get code review
- `POST /ai/get-output` - Execute code and get output
- `POST /ai/chat` - Chat with AI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
