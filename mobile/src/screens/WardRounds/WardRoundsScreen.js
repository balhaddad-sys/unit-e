/**
 * Ward Rounds Screen
 * Manage ward rounds
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getWardRounds} from '../../services/api';
import {showMessage} from 'react-native-flash-message';

const WardRoundsScreen = ({navigation}) => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      const response = await getWardRounds();
      if (response.success) {
        setRounds(response.rounds || []);
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Failed to load ward rounds',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRounds();
  };

  const renderRoundItem = ({item}) => (
    <TouchableOpacity
      style={styles.roundCard}
      onPress={() => navigation.navigate('RoundDetail', {roundId: item.id})}>
      <View style={styles.roundHeader}>
        <View style={styles.roundIconContainer}>
          <Icon name="assignment" size={28} color="#15803d" />
        </View>
        <View style={styles.roundInfo}>
          <Text style={styles.roundTitle}>{item.title || 'Ward Round'}</Text>
          <Text style={styles.roundDate}>
            {formatDate(item.date)} at {item.time || '09:00 AM'}
          </Text>
        </View>
        <View
          style={[
            styles.roundStatus,
            {backgroundColor: getRoundStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{item.status || 'Pending'}</Text>
        </View>
      </View>

      <View style={styles.roundDetails}>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color="#666" />
          <Text style={styles.detailText}>
            Doctor: {item.doctor || 'Not assigned'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.detailText}>Ward: {item.ward || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="people" size={16} color="#666" />
          <Text style={styles.detailText}>
            Patients: {item.patientCount || 0}
          </Text>
        </View>
      </View>

      <View style={styles.roundFooter}>
        <Text style={styles.progressText}>
          Progress: {item.completedPatients || 0}/{item.patientCount || 0}
        </Text>
        <Icon name="chevron-right" size={24} color="#15803d" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rounds}
        renderItem={renderRoundItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment-turned-in" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No ward rounds scheduled</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const getRoundStatusColor = status => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '#15803d';
    case 'in-progress':
      return '#3b82f6';
    case 'pending':
      return '#f59e0b';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

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
  listContainer: {
    padding: 10,
  },
  roundCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  roundIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roundInfo: {
    flex: 1,
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roundDate: {
    fontSize: 12,
    color: '#666',
  },
  roundStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roundDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  roundFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#15803d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default WardRoundsScreen;
