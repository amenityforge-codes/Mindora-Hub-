import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../services/api';

interface Certificate {
  _id: string;
  certificateNumber: string;
  studentName: string;
  examTitle: string;
  score: number;
  percentage: number;
  grade: string;
  issueDate: string;
  expiryDate?: string;
  isActive: boolean;
  isVerified: boolean;
  status: 'generated' | 'sent' | 'downloaded' | 'expired' | 'revoked';
  downloadCount: number;
  lastDownloadedAt?: string;
  exam: {
    _id: string;
    title: string;
    category: string;
  };
}

const CertificatesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyNumber, setVerifyNumber] = useState('');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      console.log('Loading certificates with API service...');
      const data = await apiService.get('/certificates');
      
      console.log('Certificates API response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        const certificatesList = data.data.certificates;
        setCertificates(certificatesList);
        console.log('Certificates loaded successfully:', certificatesList.length);
      } else {
        throw new Error(data.message || 'Failed to load certificates');
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      Alert.alert('Error', 'Failed to load certificates. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCertificates();
    setRefreshing(false);
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      // Track download
      await apiService.post(`/certificates/${certificateId}/download`);
      
      Alert.alert(
        'Download Started',
        'Your certificate download has started. Check your downloads folder.',
        [
          {
            text: 'OK',
            onPress: () => {
              // In a real implementation, this would trigger the actual download
              console.log('Certificate download initiated for:', certificateId);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error downloading certificate:', error);
      Alert.alert('Error', 'Failed to download certificate');
    }
  };

  const handleVerifyCertificate = async () => {
    if (!verifyNumber.trim()) {
      Alert.alert('Error', 'Please enter a certificate number');
      return;
    }

    try {
      const data = await apiService.get(`/certificates/verify/${verifyNumber.trim()}`);
      
      if (data.success) {
        const certificate = data.data.certificate;
        Alert.alert(
          'Certificate Verified',
          `Certificate Number: ${certificate.certificateNumber}\nStudent: ${certificate.studentName}\nExam: ${certificate.examTitle}\nScore: ${certificate.score}\nGrade: ${certificate.grade}\nIssue Date: ${new Date(certificate.issueDate).toLocaleDateString()}\nStatus: ${certificate.isActive ? 'Valid' : 'Invalid'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Certificate not found or invalid');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      Alert.alert('Error', 'Failed to verify certificate');
    } finally {
      setShowVerifyModal(false);
      setVerifyNumber('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return '#3B82F6';
      case 'sent': return '#10B981';
      case 'downloaded': return '#8B5CF6';
      case 'expired': return '#EF4444';
      case 'revoked': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return 'description';
      case 'sent': return 'send';
      case 'downloaded': return 'download-done';
      case 'expired': return 'schedule';
      case 'revoked': return 'block';
      default: return 'description';
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const renderCertificateCard = ({ item }: { item: Certificate }) => {
    const issueDate = new Date(item.issueDate);
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
    const isExpired = expiryDate && new Date() > expiryDate;
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <View style={[styles.certificateCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <View style={styles.certificateInfo}>
            <Text style={[styles.certificateTitle, { color: theme.colors.text }]}>
              {item.examTitle}
            </Text>
            <Text style={[styles.studentName, { color: theme.colors.textSecondary }]}>
              {item.studentName}
            </Text>
            <Text style={[styles.certificateNumber, { color: theme.colors.primary }]}>
              #{item.certificateNumber}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <MaterialIcons name={statusIcon} size={16} color="white" />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.certificateDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="grade" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Grade: {item.grade} ({item.percentage}%)
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Issued: {issueDate.toLocaleDateString()}
            </Text>
          </View>
          
          {expiryDate && (
            <View style={styles.detailRow}>
              <MaterialIcons 
                name="event" 
                size={16} 
                color={isExpired ? '#EF4444' : theme.colors.primary} 
              />
              <Text style={[
                styles.detailText, 
                { color: isExpired ? '#EF4444' : theme.colors.text }
              ]}>
                Expires: {expiryDate.toLocaleDateString()}
                {isExpired && ' (Expired)'}
              </Text>
            </View>
          )}
          
          {item.downloadCount > 0 && (
            <View style={styles.detailRow}>
              <MaterialIcons name="download" size={16} color={theme.colors.primary} />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Downloaded {item.downloadCount} time(s)
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleDownloadCertificate(item._id)}
            disabled={!item.isActive || item.status === 'revoked'}
          >
            <MaterialIcons name="download" size={16} color="white" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
            onPress={() => {
              Alert.alert(
                'Certificate Details',
                `Certificate Number: ${item.certificateNumber}\nStudent: ${item.studentName}\nExam: ${item.examTitle}\nScore: ${item.score}\nGrade: ${item.grade}\nIssue Date: ${issueDate.toLocaleDateString()}\nStatus: ${item.status}\nVerified: ${item.isVerified ? 'Yes' : 'No'}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <MaterialIcons name="info" size={16} color="white" />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderVerifyModal = () => (
    <Modal
      visible={showVerifyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowVerifyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.verifyModal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Verify Certificate
            </Text>
            <TouchableOpacity
              onPress={() => setShowVerifyModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.verifyContent}>
            <Text style={[styles.verifyText, { color: theme.colors.textSecondary }]}>
              Enter the certificate number to verify its authenticity:
            </Text>
            
            <TextInput
              style={[styles.verifyInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={verifyNumber}
              onChangeText={setVerifyNumber}
              placeholder="Enter certificate number"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="characters"
            />
            
            <TouchableOpacity
              style={[styles.verifyButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleVerifyCertificate}
            >
              <Text style={styles.verifyButtonText}>Verify Certificate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Certificates
        </Text>
        <TouchableOpacity
          onPress={() => setShowVerifyModal(true)}
          style={styles.verifyButton}
        >
          <MaterialIcons name="verified" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search certificates..."
          placeholderTextColor={theme.colors.textSecondary}
        />
        
        <View style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.filterText, { color: theme.colors.text }]}>
            Status: {filterStatus}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={16} color={theme.colors.text} />
        </View>
      </View>

      <FlatList
        data={filteredCertificates}
        renderItem={renderCertificateCard}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="description" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No certificates found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Complete exams to earn certificates!
            </Text>
          </View>
        )}
      />

      {renderVerifyModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifyButton: {
    padding: 4,
  },
  filters: {
    padding: 16,
    gap: 12,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  certificateCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 14,
    marginBottom: 4,
  },
  certificateNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  certificateDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyModal: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  verifyContent: {
    gap: 16,
  },
  verifyText: {
    fontSize: 16,
    lineHeight: 22,
  },
  verifyInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verifyButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CertificatesScreen;

