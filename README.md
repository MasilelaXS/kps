# KPS Portal

A modern, mobile-first web application for Pest Control Operations (PCO) management, built with React, TypeScript, and HeroUI.

## 🚀 Features

### Mobile PCO Portal
- **Dashboard**: Real-time stats for draft reports, today's reports, and upcoming services
- **Reports Management**: Create, edit, and manage fumigation reports with digital signatures
- **Scheduling**: View and manage upcoming service appointments
- **Profile Management**: User settings and account management
- **Offline Support**: Progressive Web App (PWA) capabilities

### Admin Portal
- **User Management**: Manage PCO users and permissions
- **Client Management**: Handle client information and service contracts
- **Chemical Management**: Track chemical inventory and usage
- **Analytics**: Comprehensive reporting and data visualization
- **Report Oversight**: Review and approve PCO submissions

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **UI Framework**: HeroUI (NextUI-based components)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Code Quality**: ESLint, TypeScript

## 📱 Mobile-First Design

The application is designed with a mobile-first approach, featuring:
- Responsive design optimized for mobile devices
- Touch-friendly interfaces
- Bottom navigation for easy thumb access
- Progressive Web App capabilities
- Offline functionality

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kps
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:production` - Build for production with NODE_ENV=production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts and cache
- `npm run analyze` - Analyze bundle size

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (buttons, inputs, etc.)
│   └── layout/          # Layout components (navbar, sidebar)
├── contexts/            # React contexts
├── pages/               # Page components
│   ├── admin/          # Admin portal pages
│   └── mobile/         # Mobile PCO portal pages
├── services/           # API services and HTTP clients
├── stores/             # Zustand state management
├── styles/             # Global styles and CSS
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔑 Key Components

### Authentication
- JWT-based authentication
- Role-based access control (Admin/PCO)
- Secure token storage and refresh

### Mobile Layout
- Responsive navigation with HeroUI components
- Bottom navigation for main app sections
- User profile dropdown with settings and logout

### Report Management
- Multi-step report creation wizard
- Digital signature capture
- Photo attachments
- Chemical usage tracking

### Admin Dashboard
- User management interface
- Report review and approval workflow
- Analytics and reporting tools

## 🎨 UI/UX Features

- **HeroUI Components**: Modern, accessible component library
- **Responsive Design**: Mobile-first with desktop support
- **Dark/Light Mode**: Theme switching capabilities
- **Animations**: Smooth transitions with Framer Motion
- **Toast Notifications**: User feedback with react-hot-toast

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=your_api_endpoint
VITE_APP_NAME=KPS Portal
```

### Tailwind CSS
The project uses Tailwind CSS with custom configuration in `tailwind.config.js` for consistent design system.

## 📦 Build & Deployment

### Production Build
```bash
npm run build:production
```

### Bundle Analysis
```bash
npm run analyze
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## 📋 API Integration

The application integrates with a backend API for:
- User authentication and management
- Report CRUD operations
- Chemical inventory management
- Client data management
- Analytics and reporting

API services are organized in the `src/services/` directory with proper error handling and type safety.

## 🔒 Security

- JWT token-based authentication
- Secure HTTP-only cookie storage
- Input validation and sanitization
- Role-based access control
- API request interceptors for authentication

## 📱 PWA Features

- Offline functionality
- App-like experience on mobile devices
- Push notifications (future enhancement)
- Background sync capabilities

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Run `npm run type-check` to identify TypeScript issues
2. **Lint Errors**: Run `npm run lint:fix` to auto-fix issues
3. **Cache Issues**: Run `npm run clean` to clear build cache

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 👥 Team

- Frontend Development: React/TypeScript specialists
- UI/UX Design: Mobile-first design approach
- Backend Integration: RESTful API integration
- Quality Assurance: Comprehensive testing strategy

---

**Built with ❤️ for efficient pest control management**
