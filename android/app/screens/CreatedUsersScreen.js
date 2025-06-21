import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { BarChart } from 'react-native-chart-kit';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Clipboard from '@react-native-clipboard/clipboard';
import moment from 'moment';

const CreatedUsersScreen = () => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width: windowWidth } = useWindowDimensions();

  const isSmallDevice = windowWidth < 375;
  const isLargeDevice = windowWidth >= 768;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only the latest 100 users, ordered by createdAt descending
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('profileData.profileHeader.createdAt', 'desc'),
          limit(100)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const counts = {};

        users.forEach(user => {
          const profileHeader = user.profileData?.profileHeader;
          const createdAt = profileHeader?.createdAt?.toDate?.();
          if (!createdAt) return;

          const date = moment(createdAt).format('YYYY-MM-DD');
          if (!counts[date]) counts[date] = { date, count: 0, users: [] };

          counts[date].count++;
          counts[date].users.push({
            name: user.name || 'No Name',
            fcmToken: user.fcmToken || 'No FCM Token',
            profileImageUrl: user.profilePicture || null,
            linkedin: profileHeader?.socialLinks?.linkedin || null,
          });
        });

        const sortedData = Object.values(counts).sort((a, b) => b.date.localeCompare(a.date));
        setDailyData(sortedData);
      } catch (err) {
        console.error('Fetching error:', err);
        setError('Unable to fetch users. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => ({
    labels: dailyData.slice(0, isSmallDevice ? 4 : 5).map(item => moment(item.date).format('DD/MM')),
    datasets: [{ data: dailyData.slice(0, isSmallDevice ? 4 : 5).map(item => item.count) }],
  }), [dailyData]);

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#6366F1',
    backgroundGradientTo: '#8B5CF6',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    style: { borderRadius: 16 },
    barPercentage: isSmallDevice ? 0.6 : 0.8,
    propsForLabels: { fontSize: isSmallDevice ? 10 : 12 },
  };

  const copyToClipboard = token => {
    Clipboard.setString(token);
    Alert.alert('Copied', 'FCM Token copied to clipboard!');
  };

  const openLinkedIn = url => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open LinkedIn URL'));
    }
  };

  const getRandomColor = name => {
    const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
    return colors[(name.length || 1) % colors.length];
  };

  const renderAvatar = (url, name = '?') => {
    if (url) {
      return (
        <Image
          source={{ uri: `${url}?${Date.now()}` }}
          style={styles.userAvatar}
          resizeMode="cover"
          onError={e => console.log('Image load error:', e.nativeEvent?.error)}
        />
      );
    }

    return (
      <View style={[styles.defaultAvatar, { backgroundColor: getRandomColor(name) }]}>
        <Text style={styles.avatarText}>{name[0]?.toUpperCase() || '?'}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={[styles.card, { width: isLargeDevice ? '80%' : '95%' }]}>
            {dailyData.length ? (
              <BarChart
                data={chartData}
                width={isLargeDevice ? windowWidth * 0.8 - 40 : windowWidth - 55}
                height={isSmallDevice ? 180 : 220}
                chartConfig={chartConfig}
                style={{ marginVertical: 8, borderRadius: 16 }}
                showValuesOnTopOfBars
                fromZero
              />
            ) : (
              <Text style={styles.noDataText}>No data available.</Text>
            )}
          </View>

          {dailyData.map(item => (
            <View key={item.date} style={[styles.dateCard, { width: isLargeDevice ? '80%' : '95%' }]}>
              <View style={styles.dateHeader}>
                <MaterialIcons name="calendar-today" size={18} color="#4F46E5" />
                <Text style={[styles.dateText, { fontSize: 16 }]}>{item.date}</Text>
                <Text style={[styles.userCount]}>{`(${item.users.length} User${item.users.length !== 1 ? 's' : ''})`}</Text>
              </View>

              {item.users.map((user, index) => (
                <View key={`${user.fcmToken}-${index}`}>
                  <View style={styles.userRow}>
                    {renderAvatar(user.profileImageUrl, user.name)}
                    <Text style={styles.userName}>{user.name}</Text>
                    {user.linkedin && (
                      <TouchableOpacity onPress={() => openLinkedIn(user.linkedin)} style={styles.linkedinIconButton}>
                        <FontAwesome name="linkedin-square" size={22} color="#0A66C2" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.tokenBox}>
                    <Text style={styles.tokenBoxText}>
                      {user.fcmToken === 'No FCM Token' ? 'No FCM Token' : `${user.fcmToken.slice(0, isSmallDevice ? 25 : 30)}...`}
                    </Text>
                    {user.fcmToken !== 'No FCM Token' && (
                      <TouchableOpacity onPress={() => copyToClipboard(user.fcmToken)}>
                        <MaterialIcons name="content-copy" size={20} color="#4F46E5" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {index !== item.users.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginBottom:15,
    color: '#111827',
  },
  dateCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1F2937',
  },
  userCount: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#6B7280',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  userName: {
    marginLeft: 12,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  tokenText: {
    marginTop: 2,
    marginLeft: 26,
    fontSize: 13,
    color: '#9CA3AF',
  },
  tokenBox: {
    marginTop: 4,
    marginLeft: 26,
    backgroundColor: '#F3F4F6',
    padding: 6,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tokenBoxText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  copyIcon: {
    marginLeft: 10,
  },
  divider: {
    marginTop: 10,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  noDataText: {
    textAlign: 'center',
    color: '#6B7280',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  defaultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    marginLeft: 26,
    marginTop: 8,
  },
  linkedinIconButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default CreatedUsersScreen;
