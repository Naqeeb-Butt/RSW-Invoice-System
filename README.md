# Aasko Construction Invoice Management System

A production-level invoice management system built with FastAPI backend and React frontend, featuring Docker containerization and professional dashboard with metrics.

## 🚀 Quick Start Guide

### Prerequisites

Before running the project, ensure you have the following installed:

#### 1. Windows Subsystem for Linux (WSL)
```bash
# Install WSL (run as Administrator)
wsl --install

# Update WSL (already done)
wsl --update
```

#### 2. Docker Desktop for Windows
1. Download Docker Desktop for Windows from https://www.docker.com/products/docker-desktop/
2. Install Docker Desktop with WSL 2 integration
3. Start Docker Desktop and
 ensure it's running
4. Verify installation:
```bash
docker --version
docker-compose --version
```

#### 3. Node.js (for local development)
1. Download Node.js from https://nodejs.org/ (LTS version recommended)
2. Verify installation:
```bash
node --version
npm --version
```

#### 4. Python (for local development)
1. Download Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Verify installation:
```bash
python --version
pip --version
```

## 🏃‍♂️ Running the Application

### Option 1: Docker (Recommended for Production)

1. **Ensure Docker Desktop is running**
2. **Start the application:**
```bash
cd "d:\Invoice System"
docker-compose up --build
```

3. **Access the application:**
- Frontend: http://localhost:2004
- Backend API: http://localhost:2205
- API Documentation: http://localhost:2205/docs

4. **Stop the application:**
```bash
docker-compose down
```

### Option 2: Local Development

#### Backend Setup:
```bash
cd "d:\Invoice System\backend"
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 2205 --reload
```

#### Frontend Setup (in separate terminal):
```bash
cd "d:\Invoice System\frontend"
npm install
set PORT=2004
npm start
```

## 🔐 Default Login Credentials

- **Email**: admin@aasko.com
- **Password**: admin123

## 📁 Project Structure

```
invoice-system/
├── 📂 backend/                    # FastAPI Backend Application
│   ├── 🐍 main.py                 # FastAPI application entry point
│   ├── ⚙️ config.py               # Configuration settings and environment variables
│   ├── 🗄️ models.py               # SQLAlchemy database models
│   ├── 📋 schemas.py              # Pydantic data validation schemas
│   ├── 🔐 auth.py                 # JWT authentication logic
│   ├── 🛠️ utils.py                # Utility functions (calculations, helpers)
│   ├── 🗃️ database.py             # Database connection and session management
│   ├── 📄 requirements.txt        # Python dependencies
│   ├── 🐳 Dockerfile             # Backend Docker configuration
│   └── 🔧 .env                   # Environment variables (do not commit to git)
│
├── 📂 frontend/                   # React Frontend Application
│   ├── 📂 src/
│   │   ├── 📂 pages/              # React page components
│   │   │   ├── 🏠 Dashboard.js    # Main dashboard with metrics and charts
│   │   │   ├── 📄 Invoices.js    # Invoice listing and management
│   │   │   ├── 📝 InvoiceForm.js  # Invoice creation/editing form
│   │   │   ├── 👁️ InvoiceView.js  # Invoice detail view
│   │   │   ├── 👥 Clients.js      # Client listing and management
│   │   │   ├── 📋 ClientForm.js   # Client creation/editing form
│   │   │   └── 🔑 Login.js        # User authentication page
│   │   ├── 📂 components/         # Reusable React components
│   │   │   ├── 🎨 Layout.js       # Main application layout with sidebar
│   │   │   └── ⏳ LoadingSpinner.js # Loading indicator component
│   │   ├── 📂 contexts/           # React Context providers
│   │   │   └── 🔐 AuthContext.js  # Authentication context and state management
│   │   ├── ⚛️ App.js              # Main React application component
│   │   ├── 🎨 index.css           # Global styles and Tailwind CSS imports
│   │   └── 🚀 index.js           # React application entry point
│   ├── 📂 public/                # Static public assets
│   │   └── 📄 index.html         # HTML template
│   ├── 📦 package.json            # Node.js dependencies and scripts
│   ├── 🎨 tailwind.config.js      # Tailwind CSS configuration
│   ├── ⚙️ postcss.config.js       # PostCSS configuration
│   └── 🐳 Dockerfile             # Frontend Docker configuration
│
├── 🐳 docker-compose.yml          # Docker Compose orchestration
├── 📄 README.md                  # This documentation file
└── 🗂️ invoice_template.html      # Original invoice template reference
```

## 🏗️ Architecture Overview

### Backend Architecture (FastAPI)
```
🐍 FastAPI Application
├── 🔐 Authentication Layer
│   ├── JWT Token Management
│   ├── Password Hashing (bcrypt)
│   └── User Authorization
├── 🗄️ Data Layer
│   ├── SQLAlchemy ORM
│   ├── SQLite Database
│   └── Database Models (Users, Clients, Invoices, Items)
├── 📡 API Layer
│   ├── RESTful Endpoints
│   ├── Request/Response Validation
│   └── Error Handling
└── 🛠️ Business Logic
    ├── Invoice Calculations
    ├── Number to Words Conversion
    └── Export/Import Functionality
```

### Frontend Architecture (React)
```
⚛️ React Application
├── 🎨 UI Layer
│   ├── Tailwind CSS Styling
│   ├── Responsive Design
│   └── Aasko Construction Branding
├── 🔄 State Management
│   ├── React Context API
│   ├── Authentication State
│   └── Component State
├── 🛣️ Routing
│   ├── React Router
│   ├── Protected Routes
│   └── Navigation
└── 📡 API Communication
    ├── Axios HTTP Client
    ├── JWT Token Handling
    └── Error Management
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=sqlite:///./invoice_system.db

# Security
SECRET_KEY=your-super-secret-key-change-in-production-12345
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# Admin User (auto-created on first run)
ADMIN_EMAIL=admin@aasko.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User

# Company Information
COMPANY_NAME=Aasko Construction
COMPANY_ADDRESS=123 Construction Ave, Building City
COMPANY_PHONE=+1-555-0123
COMPANY_EMAIL=info@aasko.com
COMPANY_WEBSITE=www.aasko.com

# Server Configuration
HOST=0.0.0.0
PORT=2205

# CORS Configuration
BACKEND_CORS_ORIGINS=["http://localhost:2004", "http://127.0.0.1:2004"]
```

### Port Configuration
- **Frontend**: Port 2004
- **Backend**: Port 2205
- **Database**: SQLite file in backend directory

## 📊 Features in Detail

### 🏠 Dashboard Features
- **Real-time Statistics**: Total invoices, revenue, payment status
- **Interactive Charts**: Monthly revenue trends using Recharts
- **Recent Activity**: Latest invoices with quick actions
- **Quick Actions**: Create invoice, export data, add clients
- **Professional Metrics**: KPI cards with icons and colors

### 📄 Invoice Management
- **Professional Forms**: Multi-step invoice creation with validation
- **Line Items**: Dynamic item addition with tax calculations
- **Status Management**: Draft, Sent, Paid, Overdue statuses
- **PDF Generation**: Print-ready invoice layouts
- **Search & Filter**: Advanced filtering by status, client, date
- **Bulk Operations**: Export to Excel, import from Excel

### 👥 Client Management
- **Comprehensive Profiles**: Contact info, tax details, addresses
- **Tax Information**: NTN, GST numbers for compliance
- **Vendor Codes**: Integration with existing systems
- **Relationship Tracking**: Invoice history per client

### 🔐 Security Features
- **JWT Authentication**: Secure token-based access
- **Password Security**: Bcrypt hashing for passwords
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: ORM-based database access

## 🚀 Deployment

### Development Deployment
```bash
# Using Docker (recommended)
docker-compose up --build

# Or locally
# Terminal 1: Backend
cd backend && uvicorn main:app --reload --port 2205

# Terminal 2: Frontend  
cd frontend && npm start
```

### Production Deployment
```bash
# Build and run in production mode
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment-Specific Setup

#### Windows Development
1. Install WSL2 for Docker compatibility
2. Use Windows Terminal for better command line experience
3. Ensure Node.js and Python are in PATH

#### Linux/Mac Development
1. Install Docker Engine directly
2. Use native terminal
3. No special configuration needed

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Docker Desktop not running
# Solution: Start Docker Desktop application

# Port conflicts
# Solution: Change ports in docker-compose.yml

# Build failures
# Solution: Clear Docker cache
docker system prune -a
```

#### Backend Issues
```bash
# Python module not found
# Solution: Install dependencies
pip install -r requirements.txt

# Database permission issues
# Solution: Ensure write permissions in backend directory
```

#### Frontend Issues
```bash
# Node modules missing
# Solution: Install dependencies
npm install

# Port already in use
# Solution: Change PORT environment variable
set PORT=3001 && npm start
```

### Getting Help

1. **Check Logs**: Always check terminal output for error messages
2. **API Documentation**: Visit http://localhost:2205/docs for API testing
3. **Browser Console**: Check F12 developer tools for frontend errors
4. **Network Tab**: Verify API calls are being made correctly

## 📈 Performance Considerations

### Database Optimization
- SQLite is suitable for small to medium deployments
- Consider PostgreSQL for large-scale deployments
- Regular database backups recommended

### Frontend Optimization
- Code splitting implemented with React.lazy
- Images optimized for web
- Tailwind CSS purged in production builds

### API Performance
- Async/await patterns for non-blocking operations
- Database query optimization
- Response caching where appropriate

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Payment gateway integration
- [ ] Mobile app development
- [ ] Email template customization
- [ ] Advanced user roles and permissions

### Technical Improvements
- [ ] Microservices architecture
- [ ] Redis caching layer
- [ ] PostgreSQL migration option
- [ ] Advanced search with Elasticsearch
- [ ] Automated testing suite
- [ ] CI/CD pipeline setup

## 📞 Support

For technical support and questions:

- **Email**: info@aasko.com
- **Documentation**: Available in-app and at API docs endpoint
- **Issues**: Report through internal ticketing system

## 📜 License

This project is proprietary to Aasko Construction. All rights reserved.

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Framework**: FastAPI + React + Docker
