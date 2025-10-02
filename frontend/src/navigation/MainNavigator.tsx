import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import AdultsDashboard from '../screens/adultdashboard/AdultsDashboard';
import BusinessDashboard from '../screens/dashboard/BusinessDashboard';
import ChildrenDashboard from '../screens/dashboard/ChildrenDashboard';
import TeensDashboard from '../screens/dashboard/TeensDashboard';
import AIModeScreen from '../screens/main/AIModeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Import main learning screens
import ModulesScreen from '../screens/main/ModulesScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import ModuleDetailScreen from '../screens/main/ModuleDetailScreen';
import LessonDetailScreen from '../screens/main/LessonDetailScreen';
import TopicContentScreen from '../screens/main/TopicContentScreen';
import VideoQuizScreen from '../screens/main/VideoQuizScreen';
import QuizScreen from '../screens/main/QuizScreen';

// Import other main screens
import GrammarCheckScreen from '../screens/main/GrammarCheckScreen';
import SpeechPracticeScreen from '../screens/main/SpeechPracticeScreen';
import LiveTranslationScreen from '../screens/main/LiveTranslationScreen';
import CareerScenariosScreen from '../screens/main/CareerScenariosScreen';
import SentenceBuilderGameScreen from '../screens/main/SentenceBuilderGameScreen';
import SpeakingCoachPracticeScreen from '../screens/main/SpeakingCoachPracticeScreen';
import AIFinanceScreen from '../screens/main/AIFinanceScreen';
import AIPersonalTutorScreen from '../screens/main/AIPersonalTutorScreen';
import CommunicationEnglishScreen from '../screens/main/CommunicationEnglishScreen';
import SoftSkillsScreen from '../screens/main/SoftSkillsScreen';
import AchievementScreen from '../screens/main/AchievementScreen';

// Import admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import SimpleAdminDashboardScreen from '../screens/admin/SimpleAdminDashboardScreen';

// Import adult admin screens
import AdultAdminDashboardScreen from '../screens/adultadmin/AdminDashboardScreen';
import AdultSimpleAdminDashboardScreen from '../screens/adultadmin/SimpleAdminDashboardScreen';
import AdminContentManagementScreen from '../screens/admin/AdminContentManagementScreen';
import KidsContentManagementScreen from '../screens/admin/KidsContentManagementScreen';
import ContentUploadScreen from '../screens/admin/ContentUploadScreen';
import SpeakingCoachManagementScreen from '../screens/admin/SpeakingCoachManagementScreen';
import SentenceBuilderManagementScreen from '../screens/admin/SentenceBuilderManagementScreen';
import VideoQuizSequenceScreen from '../screens/admin/VideoQuizSequenceScreen';
import VideoUploadScreen from '../screens/admin/VideoUploadScreen';
import AdminModuleDetailScreen from '../screens/admin/AdminModuleDetailScreen';
import EnhancedLessonManagementScreen from '../screens/admin/EnhancedLessonManagementScreen';
import CategoryModuleManagementScreen from '../screens/admin/CategoryModuleManagementScreen';
import AIFinanceManagementScreen from '../screens/admin/AIFinanceManagementScreen';
import SoftSkillsManagementScreen from '../screens/admin/SoftSkillsManagementScreen';
import BrainstormingManagementScreen from '../screens/admin/BrainstormingManagementScreen';
import MathManagementScreen from '../screens/admin/MathManagementScreen';
import LoginManagementScreen from '../screens/admin/LoginManagementScreen';
import AchievementManagementScreen from '../screens/admin/AchievementManagementScreen';
import ExamManagementScreen from '../screens/admin/ExamManagementScreen';
import TopicDetailScreen from '../screens/admin/TopicDetailScreen';
import TopicStudyScreen from '../screens/main/TopicStudyScreen';
import ExamStatisticsScreen from '../screens/admin/ExamStatisticsScreen';
import ExamTakingScreen from '../screens/main/ExamTakingScreen';
import ExamResultsScreen from '../screens/main/ExamResultsScreen';
import CertificatesScreen from '../screens/main/CertificatesScreen';
import CertificationsPage from '../screens/main/CertificationsPage';

import { RootStackParamList } from '../types';
import { useAppSelector } from '../hooks/redux';

const Stack = createStackNavigator<RootStackParamList>();

// Dynamic Dashboard Selector Component
function DynamicDashboard({ navigation }: { navigation: any }) {
  const { user } = useAppSelector((state) => state.auth);
  
  // Check if user is admin first
  if (user?.role === 'admin') {
    // Route to adult admin dashboard if user is adult admin
    if (user?.ageRange === '16+' || user?.email === 'amenityforge-adult@gmail.com') {
      return <AdultSimpleAdminDashboardScreen navigation={navigation} />;
    }
    // Route to children admin dashboard for children admin
    return <SimpleAdminDashboardScreen navigation={navigation} />;
  }
  
  // Select dashboard based on user's age range for regular users
  const getDashboardComponent = () => {
    if (!user?.ageRange) {
      return AdultsDashboard; // Default fallback
    }
    
    switch (user.ageRange) {
      case '6-15':
        return ChildrenDashboard;
      case '16+':
        return AdultsDashboard;
      case 'business':
        return BusinessDashboard;
      default:
        return AdultsDashboard;
    }
  };
  
  const DashboardComponent = getDashboardComponent();
  return <DashboardComponent navigation={navigation} />;
}

// Remove the tab navigator - we'll use stack navigation instead

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Dashboard - Entry point */}
      <Stack.Screen name="Home" component={DynamicDashboard} />
      
      {/* Learning Screens */}
      <Stack.Screen 
        name="Modules" 
        component={ModulesScreen}
        options={{ title: 'Continue Learning' }}
      />
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ title: 'View Progress' }}
      />
      <Stack.Screen 
        name="AIMode" 
        component={AIModeScreen}
        options={{ title: 'AI Mode' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      
      {/* Module and Content Screens */}
      <Stack.Screen 
        name="ModuleDetail" 
        component={ModuleDetailScreen}
        options={{ title: 'Module Details' }}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetailScreen}
        options={{ title: 'Lesson Details' }}
      />
      <Stack.Screen 
        name="TopicContent" 
        component={TopicContentScreen}
        options={{ title: 'Topic Content' }}
      />
      <Stack.Screen 
        name="VideoQuiz" 
        component={VideoQuizScreen}
        options={{ title: 'Video Quiz' }}
      />
      <Stack.Screen 
        name="Quiz" 
        component={QuizScreen}
        options={{ title: 'Quiz' }}
      />
      
      {/* Other main screens */}
      <Stack.Screen 
        name="GrammarCheck" 
        component={GrammarCheckScreen}
        options={{ title: 'Grammar Check' }}
      />
      <Stack.Screen 
        name="SpeechPractice" 
        component={SpeechPracticeScreen}
        options={{ title: 'Speech Practice' }}
      />
      <Stack.Screen 
        name="LiveTranslation" 
        component={LiveTranslationScreen}
        options={{ title: 'Live Translation' }}
      />
      <Stack.Screen 
        name="CareerScenarios" 
        component={CareerScenariosScreen}
        options={{ title: 'Career Scenarios' }}
      />
      <Stack.Screen 
        name="SentenceBuilderGame" 
        component={SentenceBuilderGameScreen}
        options={{ title: 'Sentence Builder' }}
      />
      <Stack.Screen 
        name="SpeakingCoachPractice" 
        component={SpeakingCoachPracticeScreen}
        options={{ title: 'Speaking Coach' }}
      />
      
      {/* AI Feature Screens */}
      <Stack.Screen 
        name="AIFinance" 
        component={AIFinanceScreen}
        options={{ title: 'AI & Finance' }}
      />
      <Stack.Screen 
        name="AIPersonalTutor" 
        component={AIPersonalTutorScreen}
        options={{ title: 'AI Personal Tutor' }}
      />
      <Stack.Screen 
        name="CommunicationEnglish" 
        component={CommunicationEnglishScreen}
        options={{ title: 'Communication English' }}
      />
      <Stack.Screen 
        name="SoftSkills" 
        component={SoftSkillsScreen}
        options={{ title: 'Soft Skills' }}
      />
      <Stack.Screen 
        name="Achievements" 
        component={AchievementScreen}
        options={{ title: 'My Achievements' }}
      />
      <Stack.Screen 
        name="ExamTaking" 
        component={ExamTakingScreen}
        options={{ title: 'Take Exam' }}
      />
      <Stack.Screen 
        name="ExamResults" 
        component={ExamResultsScreen}
        options={{ title: 'Exam Results' }}
      />
      <Stack.Screen 
        name="Certifications" 
        component={CertificationsPage}
        options={{ title: 'Certifications' }}
      />
      <Stack.Screen 
        name="Certificates" 
        component={CertificatesScreen}
        options={{ title: 'My Certificates' }}
      />
      
      {/* Dashboard Screens */}
      <Stack.Screen 
        name="ChildrenDashboard" 
        component={ChildrenDashboard}
        options={{ title: 'Children Dashboard' }}
      />
      <Stack.Screen 
        name="TeensDashboard" 
        component={TeensDashboard}
        options={{ title: 'Teens Dashboard' }}
      />
      <Stack.Screen 
        name="AdultsDashboard" 
        component={AdultsDashboard}
        options={{ title: 'Adults Dashboard' }}
      />
      <Stack.Screen 
        name="BusinessDashboard" 
        component={BusinessDashboard}
        options={{ title: 'Business Dashboard' }}
      />
      
      {/* Admin Screens */}
      <Stack.Screen 
        name="AdminDashboard" 
        component={SimpleAdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      
      {/* Adult Admin Screens */}
      <Stack.Screen 
        name="AdultAdminDashboard" 
        component={AdultSimpleAdminDashboardScreen}
        options={{ title: 'Adult Admin Dashboard' }}
      />
      <Stack.Screen 
        name="AdultAdminContentManagement" 
        component={require('../screens/adultadmin/AdminContentManagementScreen').default}
        options={{ title: 'Adult Content Management' }}
      />
      <Stack.Screen 
        name="AdultAIFinanceManagement" 
        component={require('../screens/adultadmin/AIFinanceManagementScreen').default}
        options={{ title: 'Adult AI & Finance Management' }}
      />
      <Stack.Screen 
        name="AdultSoftSkillsManagement" 
        component={require('../screens/adultadmin/SoftSkillsManagementScreen').default}
        options={{ title: 'Adult Soft Skills Management' }}
      />
      <Stack.Screen 
        name="AdultBrainstormingManagement" 
        component={require('../screens/adultadmin/BrainstormingManagementScreen').default}
        options={{ title: 'Adult Brainstorming Management' }}
      />
      <Stack.Screen 
        name="AdultMathManagement" 
        component={require('../screens/adultadmin/MathManagementScreen').default}
        options={{ title: 'Adult Math Management' }}
      />
      <Stack.Screen 
        name="AdultTopicDetail" 
        component={require('../screens/adultadmin/TopicDetailScreen').default}
        options={{ title: 'Adult Topic Detail' }}
      />
      <Stack.Screen 
        name="AdultModuleManagement" 
        component={require('../screens/adultadmin/AdminModuleDetailScreen').default}
        options={{ title: 'Adult Module Management' }}
      />
      <Stack.Screen 
        name="AdultContentUpload" 
        component={require('../screens/adultadmin/ContentUploadScreen').default}
        options={{ title: 'Adult Content Upload' }}
      />
      <Stack.Screen 
        name="AdultVideoUpload" 
        component={require('../screens/adultadmin/VideoUploadScreen').default}
        options={{ title: 'Adult Video Upload' }}
      />
      <Stack.Screen 
        name="AdultQuizManagement" 
        component={require('../screens/adultadmin/ExamManagementScreen').default}
        options={{ title: 'Adult Quiz Management' }}
      />
      <Stack.Screen 
        name="AdultUserManagement" 
        component={require('../screens/adultadmin/LoginManagementScreen').default}
        options={{ title: 'Adult User Management' }}
      />
      <Stack.Screen 
        name="AdultEnhancedLessonManagement" 
        component={require('../screens/adultadmin/EnhancedLessonManagementScreen').default}
        options={{ title: 'Adult Lesson Management' }}
      />
      <Stack.Screen 
        name="AdultAchievementManagement" 
        component={require('../screens/adultadmin/AchievementManagementScreen').default}
        options={{ title: 'Adult Achievement Management' }}
      />
      <Stack.Screen 
        name="AdultExamManagement" 
        component={require('../screens/adultadmin/ExamManagementScreen').default}
        options={{ title: 'Adult Exam Management' }}
      />
      <Stack.Screen 
        name="AdultExamStatistics" 
        component={require('../screens/adultadmin/ExamStatisticsScreen').default}
        options={{ title: 'Adult Exam Statistics' }}
      />
      <Stack.Screen 
        name="AdultSpeakingCoachManagement" 
        component={require('../screens/adultadmin/SpeakingCoachManagementScreen').default}
        options={{ title: 'Adult Speaking Coach Management' }}
      />
      <Stack.Screen 
        name="AdultSentenceBuilderManagement" 
        component={require('../screens/adultadmin/SentenceBuilderManagementScreen').default}
        options={{ title: 'Adult Sentence Builder Management' }}
      />
      <Stack.Screen 
        name="AdultCertificates" 
        component={require('../screens/adultadmin/AdminContentManagementScreen').default}
        options={{ title: 'Adult Certificate Management' }}
      />
      <Stack.Screen 
        name="AdultAnalytics" 
        component={require('../screens/adultadmin/AdminContentManagementScreen').default}
        options={{ title: 'Adult Analytics' }}
      />
      <Stack.Screen 
        name="AdminContentManagement" 
        component={AdminContentManagementScreen}
        options={{ title: 'Content Management' }}
      />
      <Stack.Screen 
        name="KidsContentManagement" 
        component={KidsContentManagementScreen}
        options={{ title: 'Kids Content Management' }}
      />
      <Stack.Screen 
        name="ContentUpload" 
        component={ContentUploadScreen}
        options={{ title: 'Content Upload' }}
      />
      <Stack.Screen 
        name="SpeakingCoachManagement" 
        component={SpeakingCoachManagementScreen}
        options={{ title: 'Speaking Coach Management' }}
      />
      <Stack.Screen 
        name="SentenceBuilderManagement" 
        component={SentenceBuilderManagementScreen}
        options={{ title: 'Sentence Builder Management' }}
      />
      <Stack.Screen 
        name="VideoQuizSequence" 
        component={VideoQuizSequenceScreen}
        options={{ title: 'Video Quiz Sequence' }}
      />
      <Stack.Screen 
        name="VideoUpload" 
        component={VideoUploadScreen}
        options={{ title: 'Video Upload' }}
      />
      <Stack.Screen 
        name="EnhancedLessonManagement" 
        component={EnhancedLessonManagementScreen}
        options={{ title: 'Lesson Management' }}
      />
      <Stack.Screen 
        name="CategoryModuleManagement" 
        component={CategoryModuleManagementScreen}
        options={{ title: 'Category Module Management' }}
      />
      <Stack.Screen 
        name="AIFinanceManagement" 
        component={AIFinanceManagementScreen}
        options={{ title: 'AI & Finance Management' }}
      />
      <Stack.Screen 
        name="SoftSkillsManagement" 
        component={SoftSkillsManagementScreen}
        options={{ title: 'Soft Skills Management' }}
      />
      <Stack.Screen 
        name="BrainstormingManagement" 
        component={BrainstormingManagementScreen}
        options={{ title: 'Brainstorming Management' }}
      />
      <Stack.Screen 
        name="MathManagement" 
        component={MathManagementScreen}
        options={{ title: 'Math Management' }}
      />
      <Stack.Screen 
        name="LoginManagement" 
        component={LoginManagementScreen}
        options={{ title: 'Login Management' }}
      />
      <Stack.Screen 
        name="AchievementManagement" 
        component={AchievementManagementScreen}
        options={{ title: 'Achievement Management' }}
      />
      <Stack.Screen 
        name="ExamManagement" 
        component={ExamManagementScreen}
        options={{ title: 'Exam Management' }}
      />
      <Stack.Screen 
        name="ExamStatistics" 
        component={ExamStatisticsScreen}
        options={{ title: 'Exam Statistics' }}
      />
      <Stack.Screen 
        name="AdminModuleDetail" 
        component={AdminModuleDetailScreen}
        options={{ title: 'Admin Module Detail' }}
      />
      <Stack.Screen 
        name="TopicDetail" 
        component={TopicDetailScreen}
        options={{ title: 'Topic Management' }}
      />
      <Stack.Screen 
        name="TopicStudy" 
        component={TopicStudyScreen}
        options={{ title: 'Study Materials' }}
      />
     
    </Stack.Navigator>
  );
}




