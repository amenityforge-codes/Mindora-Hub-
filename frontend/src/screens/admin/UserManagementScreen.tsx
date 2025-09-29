import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserManagementScreenProps {
  navigation: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, using sample users');
        setUsers([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            status: 'active',
            joinDate: '2024-01-15',
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'user',
            status: 'active',
            joinDate: '2024-01-20',
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'user',
            status: 'inactive',
            joinDate: '2024-01-25',
          },
        ]);
        return;
      }

      const response = await fetch('http://192.168.200.129:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const backendUsers: User[] = result.data.users.map((user: any) => ({
          id: user._id,
          name: user.name || user.username,
          email: user.email,
          role: user.role || 'user',
          status: user.status || 'active',
          joinDate: new Date(user.createdAt).toISOString().split('T')[0],
        }));
        setUsers(backendUsers);
      } else {
        console.log('Failed to load users from backend, using sample users');
        setUsers([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            status: 'active',
            joinDate: '2024-01-15',
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'user',
            status: 'active',
            joinDate: '2024-01-20',
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'user',
            status: 'inactive',
            joinDate: '2024-01-25',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'active',
          joinDate: '2024-01-15',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'user',
          status: 'active',
          joinDate: '2024-01-20',
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'user',
          status: 'inactive',
          joinDate: '2024-01-25',
        },
      ]);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    Alert.alert(
      'Change Role',
      `Are you sure you want to change this user's role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              if (!token) {
                Alert.alert('Error', 'Authentication required');
                return;
              }

              const response = await fetch(`http://192.168.200.129:5000/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
              });

              if (response.ok) {
                setUsers(users.map(user => 
                  user.id === userId ? { ...user, role: newRole } : user
                ));
                Alert.alert('Success', 'User role updated successfully');
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to update user role');
              }
            } catch (error) {
              console.error('Error updating user role:', error);
              Alert.alert('Error', 'Failed to update user role. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleStatusToggle = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await fetch(`http://192.168.200.129:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        ));
        Alert.alert('Success', `User status updated to ${newStatus}`);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status. Please try again.');
    }
  };

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(user => user.role === selectedRole);

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <MaterialIcons name="people" size={32} color="white" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>User Management</Text>
            </View>
            
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <MaterialIcons
                name={isDarkMode ? "wb-sunny" : "nightlight-round"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerSubtitle}>Manage users, roles, and permissions</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Filter by Role
            </Text>
            <View style={styles.filterButtons}>
              {['all', 'admin', 'user'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterButton,
                    selectedRole === role && styles.filterButtonActive,
                    { backgroundColor: selectedRole === role ? theme.colors.primary : theme.colors.surface }
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    { color: selectedRole === role ? 'white' : theme.colors.onSurface }
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Users List */}
          <View style={styles.usersContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Users ({filteredUsers.length})
            </Text>
            
            {filteredUsers.map((user) => (
              <Card key={user.id} style={[styles.userCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Card.Content style={styles.userCardContent}>
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <MaterialIcons name="person" size={24} color="white" />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
                        {user.name}
                      </Text>
                      <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>
                        {user.email}
                      </Text>
                      <Text style={[styles.userJoinDate, { color: theme.colors.onSurfaceVariant }]}>
                        Joined: {user.joinDate}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        { backgroundColor: user.role === 'admin' ? '#f093fb' : '#4facfe' }
                      ]}
                      onPress={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                    >
                      <Text style={styles.roleButtonText}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        { backgroundColor: user.status === 'active' ? '#43e97b' : '#fa709a' }
                      ]}
                      onPress={() => handleStatusToggle(user.id)}
                    >
                      <Text style={styles.statusButtonText}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginLeft: -24,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  filterContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  usersContainer: {
    padding: 20,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  userCardContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userJoinDate: {
    fontSize: 12,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default UserManagementScreen;
