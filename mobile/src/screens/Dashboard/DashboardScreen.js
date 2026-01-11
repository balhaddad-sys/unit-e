/**
 * Dashboard Screen
 * Main overview and statistics
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getDashboardStats} from '../../services/api';
import {useAuth} from '../../context/AuthContext';

const DashboardScreen = ({navigation}) => {
  const {user} = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Doctor'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Icon name="person" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="people"
          title="Total Patients"
          value={stats?.totalPatients || 0}
          color="#3b82f6"
          onPress={() => navigation.navigate('Patients')}
        />
        <StatCard
          icon="assignment"
          title="Ward Rounds"
          value={stats?.activeRounds || 0}
          color="#15803d"
          onPress={() => navigation.navigate('WardRounds')}
        />
        <StatCard
          icon="psychology"
          title="AI Consultations"
          value={stats?.aiConsultations || 0}
          color="#8b5cf6"
          onPress={() => navigation.navigate('AI')}
        />
        <StatCard
          icon="local-hospital"
          title="Critical Cases"
          value={stats?.criticalCases || 0}
          color="#ef4444"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon="person-add"
            title="Add Patient"
            onPress={() => navigation.navigate('AddPatient')}
          />
          <ActionButton
            icon="camera-alt"
            title="Scan Lab"
            onPress={() => navigation.navigate('LabScan')}
          />
          <ActionButton
            icon="assignment-add"
            title="New Round"
            onPress={() => navigation.navigate('WardRounds')}
          />
          <ActionButton
            icon="chat"
            title="AI Consult"
            onPress={() => navigation.navigate('AI')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {stats?.recentActivities?.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        )) || (
          <Text style={styles.emptyText}>No recent activities</Text>
        )}
      </View>
    </ScrollView>
  );
};

const StatCard = ({icon, title, value, color, onPress}) => (
  <TouchableOpacity
    style={[styles.statCard, {borderLeftColor: color}]}
    onPress={onPress}>
    <Icon name={icon} size={32} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </TouchableOpacity>
);

const ActionButton = ({icon, title, onPress}) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={styles.actionIconContainer}>
      <Icon name={icon} size={28} color="#15803d" />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({activity}) => (
  <View style={styles.activityItem}>
    <View style={styles.activityIcon}>
      <Icon name={activity.icon || 'info'} size={20} color="#15803d" />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityText}>{activity.text}</Text>
      <Text style={styles.activityTime}>{activity.time}</Text>
    </View>
  </View>
);

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#15803d',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#15803d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: '1%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});

export default DashboardScreen;
