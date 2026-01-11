/**
 * Profile Screen
 * User profile and account management
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../context/AuthContext';
import {showMessage} from 'react-native-flash-message';

const ProfileScreen = ({navigation}) => {
  const {user} = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    specialization: user?.specialization || '',
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      showMessage({
        message: 'Success',
        description: 'Profile updated successfully',
        type: 'success',
      });
      setEditing(false);
      setLoading(false);
    }, 1000);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={60} color="#fff" />
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="camera-alt" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role || 'Doctor'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Icon name="edit" size={24} color="#15803d" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={formData.name}
            onChangeText={text => updateField('name', text)}
            editable={editing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={formData.email}
            onChangeText={text => updateField('email', text)}
            editable={editing}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={formData.phone}
            onChangeText={text => updateField('phone', text)}
            editable={editing}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Department</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={formData.department}
            onChangeText={text => updateField('department', text)}
            editable={editing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Specialization</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={formData.specialization}
            onChangeText={text => updateField('specialization', text)}
            editable={editing}
          />
        </View>

        {editing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditing(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="people" size={32} color="#3b82f6" />
            <Text style={styles.statValue}>145</Text>
            <Text style={styles.statLabel}>Patients Treated</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="assignment" size={32} color="#15803d" />
            <Text style={styles.statValue}>32</Text>
            <Text style={styles.statLabel}>Ward Rounds</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="psychology" size={32} color="#8b5cf6" />
            <Text style={styles.statValue}>89</Text>
            <Text style={styles.statLabel}>AI Consultations</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={32} color="#f59e0b" />
            <Text style={styles.statValue}>97%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <TouchableOpacity style={styles.securityItem}>
          <Icon name="lock" size={24} color="#15803d" />
          <Text style={styles.securityItemText}>Change Password</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.securityItem}>
          <Icon name="security" size={24} color="#15803d" />
          <Text style={styles.securityItemText}>Two-Factor Authentication</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.securityItem}>
          <Icon name="devices" size={24} color="#15803d" />
          <Text style={styles.securityItemText}>Manage Devices</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#15803d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  roleText: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#15803d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#87ceaa',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  securityItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});

export default ProfileScreen;
