/**
 * Round Detail Screen
 * Detailed view of a ward round
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getWardRound} from '../../services/api';
import {showMessage} from 'react-native-flash-message';

const RoundDetailScreen = ({route}) => {
  const {roundId} = route.params;
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRound();
  }, []);

  const loadRound = async () => {
    try {
      const response = await getWardRound(roundId);
      if (response.success) {
        setRound(response.round);
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Failed to load round details',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  if (!round) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Round not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{round.title || 'Ward Round'}</Text>
        <Text style={styles.subtitle}>
          {formatDate(round.date)} at {round.time || '09:00 AM'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Round Information</Text>
        <InfoRow icon="person" label="Doctor" value={round.doctor || 'N/A'} />
        <InfoRow icon="location-on" label="Ward" value={round.ward || 'N/A'} />
        <InfoRow
          icon="people"
          label="Total Patients"
          value={round.patientCount || 0}
        />
        <InfoRow
          icon="check-circle"
          label="Completed"
          value={round.completedPatients || 0}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.notesText}>{round.notes || 'No notes available'}</Text>
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

const formatDate = date => {
  if (!date) return 'Today';
  const d = new Date(date);
  return d.toLocaleDateString();
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
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
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default RoundDetailScreen;
