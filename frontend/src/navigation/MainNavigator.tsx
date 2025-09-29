import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import AdultsDashboard from '../screens/dashboard/AdultsDashboard';
import BusinessDashboard from '../screens/dashboard/BusinessDashboard';
import ChildrenDashboard from '../screens/dashboard/ChildrenDashboard';
import TeensDashboard from '../screens/dashboard/TeensDashboard';
import AIModeScreen from '../screens/main/AIModeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Import main learning screens
import ModulesScreen from '../screens/main/ModulesScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import ModuleDetailScreen from '../screens/main/ModuleDetailScreen';
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

// Import admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import SimpleAdminDashboardScreen from '../screens/admin/SimpleAdminDashboardScreen';
import AdminContentManagementScreen from '../screens/admin/AdminContentManagementScreen';
import KidsContentManagementScreen from '../screens/admin/KidsContentManagementScreen';
import ContentUploadScreen from '../screens/admin/ContentUploadScreen';
import QuizManagementScreen from '../screens/admin/QuizManagementScreen';
import SpeakingCoachManagementScreen from '../screens/admin/SpeakingCoachManagementScreen';
import SentenceBuilderManagementScreen from '../screens/admin/SentenceBuilderManagementScreen';
import VideoQuizSequenceScreen from '../screens/admin/VideoQuizSequenceScreen';
import VideoUploadScreen from '../screens/admin/VideoUploadScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminModuleDetailScreen from '../screens/admin/AdminModuleDetailScreen';
import ModuleManagementScreen from '../screens/admin/ModuleManagementScreen';
import EnhancedLessonManagementScreen from '../screens/admin/EnhancedLessonManagementScreen';

import { RootStackParamList } from '../types';
import { useAppSelector } from '../hooks/redux';

const Stack = createStackNavigator<RootStackParamList>();

// Dynamic Dashboard Selector Component
function DynamicDashboard({ navigation }: { navigation: any }) {
  const { user } = useAppSelector((state) => state.auth);
  
  // Check if user is admin first
  if (user?.role === 'admin') {
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
        name="QuizManagement" 
        component={QuizManagementScreen}
        options={{ title: 'Quiz Management' }}
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
        name="UserManagement" 
        component={UserManagementScreen}
        options={{ title: 'User Management' }}
      />
      <Stack.Screen 
        name="ModuleManagement" 
        component={ModuleManagementScreen}
        options={{ title: 'Module Management' }}
      />
      <Stack.Screen 
        name="EnhancedLessonManagement" 
        component={EnhancedLessonManagementScreen}
        options={{ title: 'Lesson Management' }}
      />
      <Stack.Screen 
        name="AdminModuleDetail" 
        component={AdminModuleDetailScreen}
        options={{ title: 'Admin Module Detail' }}
      />
     
    </Stack.Navigator>
  );
}




