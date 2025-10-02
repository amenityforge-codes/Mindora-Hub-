# English Learning & Life-Skills Platform

A comprehensive English learning platform tailored for India across four main user segments: Children (6–12), Teens (12–18), Adults & College students (18+), and Business professionals (25+). The platform includes additional life-skill modules: Communication (English), Use of AI, Finance Management, Soft Skills, Brainstorming & Math.

## 🚀 Features

### Core Learning Modules
- **Age-specific learning tracks** (6-12, 12-18, 18+, Business)
- **Weekly content uploads** by admin
- **Progress tracking** with detailed analytics
- **AI-powered features** (grammar checking, speech feedback)
- **Quiz system** with multiple question types
- **Audio/video lessons** with transcripts
- **Spaced repetition** for vocabulary
- **Badge system** and achievements

### Life Skills Modules
- **Communication (English)** - Advanced conversational practice
- **Use of AI** - AI tools for writing and productivity
- **Finance Management** - Personal finance basics
- **Soft Skills** - Time management, interviews, email etiquette
- **Brainstorming & Math** - Problem-solving in English

### User Dashboards
- **Student Dashboard** - Learning paths, progress tracking
- **Business/Professional Dashboard** - Case studies, business English
- **Admin Dashboard** - Content management, analytics
- **Global Resources** - Community, templates, live sessions

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB Atlas** for database
- **JWT** authentication with refresh tokens
- **AWS S3** for file storage
- **Redis** for caching and queues
- **Firebase** for push notifications

### Frontend
- **Expo React Native** for mobile app
- **Redux Toolkit** for state management
- **React Navigation** for routing
- **React Native Paper** for UI components
- **TypeScript** for type safety

## 📁 Project Structure

```
english-learning-platform/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, validation
│   └── server.js         # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── screens/      # App screens
│   │   ├── navigation/   # Navigation setup
│   │   ├── store/        # Redux store
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── theme/        # App theming
│   └── App.tsx           # Main app component
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v20.19.4 or higher)
- MongoDB Atlas account
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio / Xcode (for mobile development)

### 1. Initial Setup
Run the complete setup script to create admin user and sample content:
```bash
npm run setup
```

This will:
- ✅ Connect to MongoDB Atlas
- ✅ Create admin user with credentials
- ✅ Add sample modules for all age groups
- ✅ Set up the complete platform

### 2. Admin Login Credentials
- **Email**: `amenityforge@gmail.com`
- **Password**: `Amenity`
- **Role**: `admin`

### Backend Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd english-learning-platform
npm install
```

2. **Environment setup:**
```bash
cp env.example .env
# Edit .env with your MongoDB Atlas URI and other configurations
```

3. **Start the server:**
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
npm install
```

2. **Start the Expo development server:**
```bash
npx expo start
```

3. **Run on device/simulator:**
- Install Expo Go app on your phone
- Scan the QR code from the terminal
- Or press `a` for Android emulator, `i` for iOS simulator

## 📱 App Features

### Authentication
- User registration with age range selection
- JWT-based authentication
- Password reset functionality
- Role-based access control

### Learning Experience
- **Module Browser** - Filter by age, type, difficulty
- **Lesson Player** - Video/audio with transcripts
- **Quiz System** - Multiple choice, fill-in-blank, speaking
- **Progress Tracking** - Detailed analytics and streaks
- **AI Features** - Grammar checking, speech feedback

### Admin Features
- **Content Upload** - Weekly content packages
- **User Management** - View and manage users
- **Analytics Dashboard** - Usage statistics
- **Notification System** - Send announcements

## 🗄 Database Models

### User Model
- Profile information and preferences
- Progress tracking and achievements
- Subscription management
- Role-based permissions

### Module Model
- Content metadata and media
- Age range and difficulty
- Weekly package associations
- Analytics and engagement

### Progress Model
- User progress per module
- Quiz attempts and scores
- Bookmarks and notes
- Time tracking

### Quiz Model
- Questions with multiple types
- Settings and time limits
- Analytics and statistics
- Auto-generation support

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Get current user

### Content
- `GET /api/content` - Get modules with filters
- `GET /api/content/:id` - Get specific module
- `GET /api/content/weekly/:week/:year` - Weekly content
- `GET /api/content/search` - Search modules

### Progress
- `GET /api/progress` - User progress overview
- `POST /api/progress` - Update progress
- `POST /api/progress/:id/quiz` - Submit quiz
- `POST /api/progress/:id/bookmark` - Add bookmark

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/modules` - Create module
- `POST /api/admin/weekly-package` - Create weekly package
- `GET /api/admin/users` - User management

## 🤖 AI Integration

### Grammar Checking
- Real-time grammar correction
- Style suggestions
- Readability scores

### Speech Analysis
- Pronunciation feedback
- Fluency scoring
- Accent detection

### Content Generation
- Auto-generate quiz questions
- Summarize long content
- Translate between languages

## 📊 Analytics & Reporting

### User Analytics
- Learning progress tracking
- Engagement metrics
- Completion rates
- Time spent analysis

### Content Analytics
- Module performance
- Drop-off points
- User feedback
- Popular content

### Admin Reports
- User growth
- Content effectiveness
- System usage
- Revenue metrics

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- Role-based access control
- Secure file upload handling

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Deploy to AWS ECS/DigitalOcean/Heroku
4. Set up Redis instance
5. Configure AWS S3 for file storage

### Frontend Deployment
1. Build Expo app for production
2. Submit to app stores (iOS/Android)
3. Configure push notifications
4. Set up analytics tracking

## 📈 Roadmap

### Phase 1 (MVP) - 8-12 weeks
- ✅ Core app structure
- ✅ Authentication system
- ✅ Basic module system
- ✅ Progress tracking
- ✅ Admin dashboard

### Phase 2 - 4-6 weeks
- 🔄 AI integration
- 🔄 Advanced analytics
- 🔄 Push notifications
- 🔄 Offline support

### Phase 3 - 6-8 weeks
- 📋 Live sessions
- 📋 Community features
- 📋 Advanced AI features
- 📋 Premium subscriptions

### Phase 4 - 4-6 weeks
- 📋 Mobile app optimization
- 📋 Advanced reporting
- 📋 Integration with external tools
- 📋 Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- React Native and Expo teams
- MongoDB Atlas
- React Native Paper
- All contributors and testers

---

**Built with ❤️ for English learners in India**
#   M I N D O R A - H U B 
 
 #   M I N D O R A - H U B 
 
 #   M i n d o r a - H u b 
 
 