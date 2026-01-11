/**
 * Patient Detail Screen
 * Display detailed patient information
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getPatient, deletePatient} from '../../services/api';
import {showMessage} from 'react-native-flash-message';

const PatientDetailScreen = ({route, navigation}) => {
  const {patientId} = route.params;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, []);

  const loadPatient = async () => {
    try {
      const response = await getPatient(patientId);
      if (response.success) {
        setPatient(response.patient);
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Failed to load patient details',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deletePatient(patientId);
      if (response.success) {
        showMessage({
          message: 'Success',
          description: 'Patient deleted successfully',
          type: 'success',
        });
        navigation.goBack();
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Failed to delete patient',
        type: 'danger',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Patient not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.patientName}>{patient.name}</Text>
        <Text style={styles.patientId}>ID: {patient.id}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(patient.status)},
          ]}>
          <Text style={styles.statusText}>{patient.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoRow icon="cake" label="Age" value={patient.age || 'N/A'} />
        <InfoRow icon="wc" label="Gender" value={patient.gender || 'N/A'} />
        <InfoRow icon="phone" label="Contact" value={patient.contact || 'N/A'} />
        <InfoRow
          icon="location-on"
          label="Address"
          value={patient.address || 'N/A'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Information</Text>
        <InfoRow
          icon="local-hospital"
          label="Ward"
          value={patient.ward || 'N/A'}
        />
        <InfoRow
          icon="medical-services"
          label="Diagnosis"
          value={patient.diagnosis || 'N/A'}
        />
        <InfoRow
          icon="healing"
          label="Treatment"
          value={patient.treatment || 'N/A'}
        />
        <InfoRow
          icon="assignment"
          label="Allergies"
          value={patient.allergies || 'None'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vital Signs</Text>
        <View style={styles.vitalsGrid}>
          <VitalCard
            icon="favorite"
            label="Heart Rate"
            value={patient.vitals?.heartRate || '--'}
            unit="bpm"
          />
          <VitalCard
            icon="speed"
            label="Blood Pressure"
            value={patient.vitals?.bloodPressure || '--'}
            unit="mmHg"
          />
          <VitalCard
            icon="thermostat"
            label="Temperature"
            value={patient.vitals?.temperature || '--'}
            unit="°C"
          />
          <VitalCard
            icon="air"
            label="SpO2"
            value={patient.vitals?.spo2 || '--'}
            unit="%"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.notesText}>{patient.notes || 'No notes available'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton}>
          <Icon name="edit" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit Patient</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="delete" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const InfoRow = ({icon, label, value}) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={20} color="#15803d" style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const VitalCard = ({icon, label, value, unit}) => (
  <View style={styles.vitalCard}>
    <Icon name={icon} size={24} color="#15803d" />
    <Text style={styles.vitalValue}>{value}</Text>
    <Text style={styles.vitalUnit}>{unit}</Text>
    <Text style={styles.vitalLabel}>{label}</Text>
  </View>
);

const getStatusColor = status => {
  switch (status?.toLowerCase()) {
    case 'stable':
      return '#15803d';
    case 'critical':
      return '#ef4444';
    case 'improving':
      return '#3b82f6';
    case 'discharged':
      return '#6b7280';
    default:
      return '#f59e0b';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#15803d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  patientId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  vitalUnit: {
    fontSize: 12,
    color: '#666',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#15803d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PatientDetailScreen;
