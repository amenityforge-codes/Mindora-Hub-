# 🧪 Test Users for English Learning Platform

This document contains all the test user credentials for testing different dashboards and user experiences.

## 📱 How to Access the App

1. **Mobile**: Scan QR code with Expo Go app
2. **Web**: Open `http://localhost:8081`
3. **Admin Panel**: Access admin features with admin credentials

---

## 👶 CHILDREN DASHBOARD (Ages 6-12)

### User 1: Rahul Sharma
- **Email**: `rahul.child@example.com`
- **Password**: `password123`
- **Age Range**: 6-12
- **Location**: Mumbai, Maharashtra
- **Interests**: Grammar, Vocabulary, Speaking
- **Difficulty**: Beginner
- **Profile**: "I love learning English with fun games and stories!"

### User 2: Priya Patel
- **Email**: `priya.child@example.com`
- **Password**: `password123`
- **Age Range**: 6-12
- **Location**: Delhi, Delhi
- **Interests**: Grammar, Vocabulary, Speaking
- **Difficulty**: Beginner
- **Profile**: "Learning English is so much fun!"

**Features to Test:**
- Phonics and basic vocabulary
- Simple grammar lessons
- Interactive games and stories
- Progress tracking with visual rewards

---

## 🧑 TEENS DASHBOARD (Ages 12-18)

### User 1: Arjun Singh
- **Email**: `arjun.teen@example.com`
- **Password**: `password123`
- **Age Range**: 12-18
- **Location**: Bangalore, Karnataka
- **Interests**: Grammar, Writing, Vocabulary
- **Difficulty**: Intermediate
- **Profile**: "Preparing for board exams and improving my English skills"

### User 2: Sneha Reddy
- **Email**: `sneha.teen@example.com`
- **Password**: `password123`
- **Age Range**: 12-18
- **Location**: Hyderabad, Telangana
- **Interests**: Writing, Vocabulary, Speaking
- **Difficulty**: Intermediate
- **Profile**: "Love reading and writing essays in English"

**Features to Test:**
- Advanced grammar and tenses
- Essay writing and composition
- Exam preparation modules
- Critical reading and analysis

---

## 👨 ADULTS DASHBOARD (Ages 18+)

### User 1: Vikram Kumar
- **Email**: `vikram.adult@example.com`
- **Password**: `password123`
- **Age Range**: 18+
- **Location**: Chennai, Tamil Nadu
- **Interests**: Writing, Communication, Vocabulary
- **Difficulty**: Advanced
- **Profile**: "College student working on academic English and professional communication"

### User 2: Anita Desai
- **Email**: `anita.adult@example.com`
- **Password**: `password123`
- **Age Range**: 18+
- **Location**: Pune, Maharashtra
- **Interests**: Writing, Communication, Soft Skills
- **Difficulty**: Advanced
- **Profile**: "Working professional looking to improve business communication skills"

**Features to Test:**
- Academic writing and research
- Professional communication
- Advanced vocabulary and idioms
- Presentation and public speaking

---

## 💼 BUSINESS PROFESSIONALS DASHBOARD

### User 1: Rajesh Gupta
- **Email**: `rajesh.business@example.com`
- **Password**: `password123`
- **Age Range**: Business
- **Location**: Gurgaon, Haryana
- **Interests**: Communication, Soft Skills, Finance
- **Difficulty**: Advanced
- **Profile**: "Senior Manager at IT company, focusing on leadership communication and client relations"

### User 2: Meera Joshi
- **Email**: `meera.business@example.com`
- **Password**: `password123`
- **Age Range**: Business
- **Location**: Ahmedabad, Gujarat
- **Interests**: Communication, Soft Skills, AI
- **Difficulty**: Advanced
- **Profile**: "Marketing Director enhancing presentation skills and cross-cultural communication"

**Features to Test:**
- Business email writing
- Presentation and pitching skills
- Negotiation and leadership communication
- Cross-cultural communication
- AI tools for productivity

---

## 👑 ADMIN DASHBOARD

### Admin User
- **Email**: `amenityforge@gmail.com`
- **Password**: `Amenity`
- **Role**: Admin
- **Access**: Full platform management

**Features to Test:**
- User management and analytics
- Content upload and management
- Weekly content scheduling
- Module creation and publishing
- System analytics and reports

---

## 🧪 Testing Scenarios

### 1. Registration Flow
- Test registration with each age group
- Verify age-appropriate content is shown
- Check profile setup and preferences

### 2. Dashboard Experience
- Login with each user type
- Verify correct dashboard is displayed
- Test navigation and features

### 3. Learning Modules
- Access age-appropriate modules
- Test video/audio playback
- Complete quizzes and track progress

### 4. AI Features
- Grammar checking
- Speech practice and feedback
- Writing assistance
- Vocabulary building

### 5. Progress Tracking
- View learning analytics
- Check streaks and achievements
- Test bookmarking and notes

### 6. Admin Functions
- Upload new content
- Manage users
- View analytics
- Schedule weekly content

---

## 🔧 Troubleshooting

### Common Issues:
1. **Registration fails**: Check password requirements (min 6 characters)
2. **Login issues**: Verify email format and password
3. **Content not loading**: Check backend server is running
4. **CORS errors**: Ensure backend CORS is configured for Expo

### Server Status:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:8081`
- **Health Check**: `http://localhost:5000/api/health`

---

## 📊 Expected User Flows

### Children (6-12):
1. Login → Fun dashboard with games
2. Select phonics lesson → Interactive learning
3. Complete quiz → Visual rewards
4. View progress → Sticker collection

### Teens (12-18):
1. Login → Academic dashboard
2. Choose grammar module → Video lesson
3. Take practice quiz → Detailed feedback
4. Track exam preparation → Progress charts

### Adults (18+):
1. Login → Professional dashboard
2. Access writing module → Interactive exercises
3. Use AI grammar check → Real-time feedback
4. View learning analytics → Detailed reports

### Business Professionals:
1. Login → Business dashboard
2. Practice presentation skills → Video recording
3. Use communication tools → Role-play scenarios
4. Access leadership modules → Case studies

---

## 🎯 Success Criteria

- ✅ All users can register and login
- ✅ Age-appropriate content is displayed
- ✅ Learning modules are accessible
- ✅ Progress tracking works
- ✅ AI features are functional
- ✅ Admin can manage content and users
- ✅ Cross-platform compatibility (mobile/web)

---

*Last Updated: September 2025*
*Platform Version: 1.0.0*

