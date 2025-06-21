import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  
} from 'react-native';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { LineChart, BarChart } from 'react-native-chart-kit';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenWidth < 360;
  const isMediumScreen = screenWidth >= 360 && screenWidth < 400;
  const cardWidth = screenWidth < 600 ? (isSmallScreen ? '100%' : '48%') : '23%';
  const chartHeight = screenWidth < 360 ? 180 : screenWidth < 400 ? 200 : screenWidth < 600 ? 220 : 280;
  const chartPadding = isSmallScreen ? 8 : 16;
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeReports: 0,
    newUsersToday: 0
  });
  const [userGrowth, setUserGrowth] = useState({
    labels: [],
    data: [],
  });
  const [userActivity, setUserActivity] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    data: [0, 0, 0, 0, 0],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().then(() => setRefreshing(false));
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Fetch total posts
      const postsSnapshot = await getDocs(collection(db, 'projects'));
      const totalPosts = postsSnapshot.size;

      // Fetch active reports
      const reportsRef = collection(db, 'admin', 'reports', 'userReports');
      const activeReportsQuery = query(reportsRef, where('status', '==', 'active'));
      const reportsSnapshot = await getDocs(activeReportsQuery);
      const activeReports = reportsSnapshot.size;

      // Calculate new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersQuery = query(
        collection(db, 'users'),
        where('profileData.profileHeader.createdAt', '>=', today)
      );
      const newUsersSnapshot = await getDocs(newUsersQuery);
      const newUsersToday = newUsersSnapshot.size;

      // Calculate user growth for the last 5 days
      const dates = [];
      const counts = [];
      for (let i = 4; i >= 0; i--) {
        const date = moment().subtract(i, 'days');
        dates.push(date.format('DD/MM'));
        const dayStart = date.startOf('day').toDate();
        const dayEnd = date.endOf('day').toDate();
        const dayQuery = query(
          collection(db, 'users'),
          where('profileData.profileHeader.createdAt', '>=', dayStart),
          where('profileData.profileHeader.createdAt', '<=', dayEnd)
        );
        const daySnapshot = await getDocs(dayQuery);
        counts.push(daySnapshot.size);
      }

      // Calculate user activity by day of week
      const activityData = [0, 0, 0, 0, 0]; // Mon-Fri
      const postsArray = postsSnapshot.docs;
      
      postsArray.forEach(post => {
        const postDate = post.data().createdAt?.toDate();
        if (postDate) {
          const dayIndex = postDate.getDay() - 1; // 0 = Monday
          if (dayIndex >= 0 && dayIndex < 5) { // Only count Mon-Fri
            activityData[dayIndex]++;
          }
        }
      });

      setUserActivity({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        data: activityData,
      });

      setStats({
        totalUsers,
        totalPosts,
        activeReports,
        newUsersToday,
      });

      setUserGrowth({
        labels: dates,
        data: counts,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, onPress }) => {
    const CardContent = (
      <LinearGradient
        colors={[color + '15', color + '05']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, isSmallScreen && styles.smallScreenCardTitle]}>{title}</Text>
            <Text style={[styles.cardValue, { color }, isSmallScreen && styles.smallScreenCardValue]}>{value}</Text>
            {trend && (
              <View style={styles.trendContainer}>
                <MaterialIcons
                  name={trend > 0 ? 'trending-up' : 'trending-down'}
                  size={isSmallScreen ? 14 : 16}
                  color={trend > 0 ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.trendText,
                    { color: trend > 0 ? '#10B981' : '#EF4444' },
                    isSmallScreen && styles.smallScreenTrendText,
                  ]}
                >
                  {Math.abs(trend)}% from last week
                </Text>
              </View>
            )}
          </View>
          <MaterialIcons 
            name={icon} 
            size={isSmallScreen ? 28 : isMediumScreen ? 32 : 40} 
            color={color} 
            style={styles.cardIcon} 
          />
        </View>
      </LinearGradient>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: color, width: cardWidth }]}
          activeOpacity={0.8}
          onPress={onPress}
        >
          {CardContent}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.card, { borderLeftColor: color, width: cardWidth }]}>
        {CardContent}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4875E1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: isSmallScreen ? 8 : 16 }
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4875E1']}
          tintColor="#4875E1"
        />
      }
    >

      <View style={[
        styles.statsContainer,
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: isSmallScreen ? 8 : 18,
        }
      ]}>
        
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon="people"
          color="#4875E1"
          trend={12}
          onPress={() => navigation.navigate('CreatedUser')}
        />
        
        <StatCard
          title="Total Posts"
          value={stats.totalPosts.toLocaleString()}
          icon="post-add"
          color="#10B981"
          trend={8}
        />
        <StatCard
          title="Active Reports"
          value={stats.activeReports}
          icon="report-problem"
          color="#F59E0B"
          trend={-5}
        />
        <StatCard
          title="New Users Today"
          value={stats.newUsersToday}
          icon="person-add"
          color="#EC4899"
          trend={15}
        />
      </View>

      <View style={[styles.chartCard, { padding: chartPadding }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[
              styles.chartTitle,
              isSmallScreen && styles.smallScreenChartTitle
            ]}>User Growth Trend</Text>
            <Text style={[
              styles.chartSubtitle,
              isSmallScreen && styles.smallScreenChartSubtitle
            ]}>Last 5 days</Text>
          </View>
          <View style={styles.chartLegend}>
            <View style={[
              styles.legendItem,
              isSmallScreen && styles.smallScreenLegendItem
            ]}>
              <View style={[styles.legendDot, { backgroundColor: '#4875E1' }]} />
              <Text style={[
                styles.legendText,
                isSmallScreen && styles.smallScreenLegendText
              ]}>New Users</Text>
            </View>
          </View>
        </View>
        <LineChart
          data={{
            labels: userGrowth.labels,
            datasets: [
              {
                data: userGrowth.data,
                color: (opacity = 1) => `rgba(72, 117, 225, ${opacity})`,
                strokeWidth: 3,
              },
            ],
          }}
          width={screenWidth - (isSmallScreen ? 24 : screenWidth < 600 ? 48 : 64)}
          height={chartHeight}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(72, 117, 225, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#ffffff',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              strokeWidth: 1,
              stroke: 'rgba(229, 231, 235, 0.6)',
            },
            formatYLabel: (value) => Math.round(value).toString(),
            formatXLabel: (value) => value.split('/')[0],
            yAxisInterval: 1,
          }}
          bezier
          style={styles.chart}
          withHorizontalLines={true}
          withVerticalLines={false}
          withDots={true}
          withShadow={false}
          segments={4}
          yAxisSuffix=""
          fromZero
        />
      </View>

      <View style={[styles.chartCard, { padding: chartPadding }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[
              styles.chartTitle,
              isSmallScreen && styles.smallScreenChartTitle
            ]}>User Activity Distribution</Text>
            <Text style={[
              styles.chartSubtitle,
              isSmallScreen && styles.smallScreenChartSubtitle
            ]}>Daily Post Activity Analysis</Text>
          </View>
          <View style={styles.chartLegend}>
            <View style={[
              styles.legendItem,
              styles.activityLegendItem,
              isSmallScreen && styles.smallScreenLegendItem
            ]}>
              <View style={[styles.legendDot, { backgroundColor: '#4875E1' }]} />
              <Text style={[
                styles.legendText,
                styles.activityLegendText,
                isSmallScreen && styles.smallScreenLegendText
              ]}>Posts</Text>
            </View>
          </View>
        </View>
        <BarChart
          data={{
            labels: userActivity.labels,
            datasets: [{
              data: userActivity.data,
            }]
          }}
          width={screenWidth - (isSmallScreen ? 24 : screenWidth < 600 ? 48 : 64)}
          height={chartHeight}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(72, 117, 225, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.6,
            fillShadowGradient: '#4875E1',
            fillShadowGradientOpacity: 1,
            propsForBackgroundLines: {
              strokeDasharray: '',
              strokeWidth: 1,
              stroke: 'rgba(229, 231, 235, 0.6)',
            },
            propsForLabels: {
              fontSize: isSmallScreen ? 8 : isMediumScreen ? 10 : 12,
              fontWeight: '600',
            },
          }}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          fromZero={true}
          flatColor={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: Platform.OS === 'ios' ? 28 : 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsContainer: {
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardGradient: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 4,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: Platform.OS === 'ios' ? 24 : 20,
    fontWeight: 'bold',
  },
  cardIcon: {
    opacity: 0.8,
    marginRight: -10,
    fontSize: Platform.OS === 'ios' ? 40 : 32,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    marginLeft: 4,
  },
  chartCard: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.12)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartHeader: {
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  chartSubtitle: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    color: '#6B7280',
    letterSpacing: 0.25,
  },
  chart: {
  marginHorizontal: -9, // or remove this style entirely if unnecessary
  borderRadius: 12,
},

  chartLegend: {
    flexDirection: 'row',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(72, 117, 225, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    color: '#4875E1',
    fontWeight: '500',
  },
  activityChart: {
    paddingVertical: 8,
    marginTop: 8,
    
  },
  activityLegendItem: {
    backgroundColor: 'rgba(72, 117, 225, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activityLegendText: {
    fontSize: Platform.OS === 'ios' ? 13 : 11,
    fontWeight: '600',
  },
  smallScreenCardTitle: {
    fontSize: 11,
    marginBottom: 4,
  },
  smallScreenCardValue: {
    fontSize: 18,
  },
  smallScreenTrendText: {
    fontSize: 9,
  },
  smallScreenChartTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  smallScreenChartSubtitle: {
    fontSize: 11,
  },
  smallScreenLegendItem: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  smallScreenLegendText: {
    fontSize: 10,
  },
});

export default DashboardScreen;