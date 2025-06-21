// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
//   RefreshControl,
//   Platform,
// } from 'react-native';
// import {
//   collection,
//   getDocs,
//   updateDoc,
//   doc,
//   query,
//   orderBy,
//   where,
//   Timestamp,
// } from 'firebase/firestore';
// import { db } from '../../../firebaseConfig';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import moment from 'moment';

// const ReportScreen = () => {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [filter, setFilter] = useState('active');

//   useEffect(() => {
//     fetchReports();
//   }, [filter]);

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     fetchReports().then(() => setRefreshing(false));
//   }, [filter]);

//   const fetchReports = async () => {
//     try {
//       let reportsQuery;
//       const reportsRef = collection(db, 'admin', 'reports', 'userReports');

//       if (filter === 'active') {
//         reportsQuery = query(
//           reportsRef,
//           where('status', '==', 'active'),
//           orderBy('createdAt', 'desc')
//         );
//       } else if (filter === 'resolved') {
//         reportsQuery = query(
//           reportsRef,
//           where('status', '==', 'resolved'),
//           orderBy('resolvedAt', 'desc')
//         );
//       } else {
//         reportsQuery = query(reportsRef, orderBy('createdAt', 'desc'));
//       }

//       const snapshot = await getDocs(reportsQuery);
//       const reportsList = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setReports(reportsList);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching reports:', error);
//       Alert.alert('Error', 'Failed to fetch reports');
//       setLoading(false);
//     }
//   };

//   const handleAction = async (reportId, action) => {
//     try {
//       const reportRef = doc(db, 'admin', 'reports', 'userReports', reportId);

//       const resolutionMap = {
//         warn: 'warning',
//         ban: 'ban',
//         dismiss: 'dismissed',
//       };

//       await updateDoc(reportRef, {
//         status: 'resolved',
//         resolution: resolutionMap[action],
//         resolvedAt: Timestamp.now(),
//         resolvedBy: 'admin',
//       });

//       Alert.alert('Success', `Report marked as ${resolutionMap[action]}`);
//       await fetchReports();
//     } catch (error) {
//       console.error('Error handling report:', error);
//       Alert.alert('Error', 'Failed to process action');
//     }
//   };

//   const FilterButton = ({ title, value }) => (
//     <TouchableOpacity
//       style={[
//         styles.filterButton,
//         filter === value && styles.filterButtonActive,
//       ]}
//       onPress={() => setFilter(value)}
//     >
//       <MaterialIcons
//         name={
//           value === 'active'
//             ? 'warning'
//             : value === 'resolved'
//             ? 'check-circle'
//             : 'list'
//         }
//         size={20}
//         color={filter === value ? '#FFFFFF' : '#6B7280'}
//         style={styles.filterIcon}
//       />
//       <Text
//         style={[
//           styles.filterButtonText,
//           filter === value && styles.filterButtonTextActive,
//         ]}
//       >
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );

//   const ReportActions = ({ report }) => (
//     <View style={styles.actionButtons}>
//       <TouchableOpacity
//         style={[styles.actionButton, styles.warnButton]}
//         onPress={() => handleAction(report.id, 'warn')}
//       >
//         <LinearGradient
//           colors={['#FCD34D', '#F59E0B']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={styles.actionGradient}
//         >
//           <MaterialIcons name="warning" size={20} color="#FFFFFF" />
//           <Text style={styles.actionButtonText}>Warn User</Text>
//         </LinearGradient>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.actionButton, styles.banButton]}
//         onPress={() => handleAction(report.id, 'ban')}
//       >
//         <LinearGradient
//           colors={['#EF4444', '#DC2626']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={styles.actionGradient}
//         >
//           <MaterialIcons name="block" size={20} color="#FFFFFF" />
//           <Text style={styles.actionButtonText}>Ban User</Text>
//         </LinearGradient>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.actionButton, styles.dismissButton]}
//         onPress={() => handleAction(report.id, 'dismiss')}
//       >
//         <LinearGradient
//           colors={['#9CA3AF', '#6B7280']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={styles.actionGradient}
//         >
//           <MaterialIcons name="close" size={20} color="#FFFFFF" />
//           <Text style={styles.actionButtonText}>Dismiss</Text>
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderReport = ({ item }) => (
//     <View style={styles.reportCard}>
//       <LinearGradient
//         colors={[
//           item.status === 'active' ? '#FEF3C7' : '#F3F4F6',
//           '#FFFFFF',
//         ]}
//         style={styles.reportGradient}
//       >
//         <View style={styles.reportHeader}>
//           <View style={styles.reportInfo}>
//             <View style={styles.reportTypeContainer}>
//               <MaterialIcons
//                 name={
//                   item.reason?.toLowerCase().includes('inappropriate')
//                     ? 'report-problem'
//                     : 'flag'
//                 }
//                 size={20}
//                 color="#DC2626"
//                 style={styles.reportTypeIcon}
//               />
//               <Text style={styles.reportType}>
//                 {item.reason || 'Inappropriate Content'}
//               </Text>
//             </View>
//             <Text style={styles.reportDate}>
//               {moment(item.createdAt?.toDate()).format('MMM DD, YYYY HH:mm')}
//             </Text>
//           </View>
//           <View
//             style={[
//               styles.statusBadge,
//               {
//                 backgroundColor:
//                   item.status === 'active' ? '#FEF3C7' : '#E5E7EB',
//               },
//             ]}
//           >
//             <MaterialIcons
//               name={item.status === 'active' ? 'warning' : 'check-circle'}
//               size={16}
//               color={item.status === 'active' ? '#F59E0B' : '#10B981'}
//             />
//             <Text
//               style={[
//                 styles.statusText,
//                 {
//                   color:
//                     item.status === 'active' ? '#F59E0B' : '#10B981',
//                 },
//               ]}
//             >
//               {item.status}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.userInfo}>
//           <View style={styles.userSection}>
//             <MaterialIcons name="person" size={16} color="#6B7280" />
//             <Text style={styles.label}>Reported User:</Text>
//             <Text style={styles.value}>{item.reportedUserName || 'Unknown'}</Text>
//           </View>
//           <View style={styles.userSection}>
//             <MaterialIcons name="flag" size={16} color="#6B7280" />
//             <Text style={styles.label}>Reported By:</Text>
//             <Text style={styles.value}>{item.reporterName || 'Anonymous'}</Text>
//           </View>
//         </View>

//         <Text style={styles.reportDescription}>{item.proofText}</Text>

//         {item.proofImageUrl && (
//           <Image
//             source={{ uri: item.proofImageUrl }}
//             style={styles.proofImage}
//             resizeMode="cover"
//           />
//         )}

//         {item.status === 'active' && <ReportActions report={item} />}

//         {item.status === 'resolved' && (
//           <View style={styles.resolutionInfo}>
//             <MaterialIcons
//               name={
//                 item.resolution === 'warning'
//                   ? 'warning'
//                   : item.resolution === 'ban'
//                   ? 'block'
//                   : 'check-circle'
//               }
//               size={20}
//               color="#10B981"
//               style={styles.resolutionIcon}
//             />
//             <View>
//               <Text style={styles.resolutionText}>
//                 Resolution: {item.resolution}
//               </Text>
//               <Text style={styles.resolutionDate}>
//                 {moment(item.resolvedAt?.toDate()).format('MMM DD, YYYY HH:mm')}
//               </Text>
//             </View>
//           </View>
//         )}
//       </LinearGradient>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4875E1" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Report Management</Text>
//         <Text style={styles.headerSubtitle}>
//           {filter === 'active'
//             ? 'Active Reports'
//             : filter === 'resolved'
//             ? 'Resolved Reports'
//             : 'All Reports'}
//         </Text>
//       </View>

//       <View style={styles.filterContainer}>
//         <FilterButton title="Active" value="active" />
//         <FilterButton title="Resolved" value="resolved" />
//         <FilterButton title="All" value="all" />
//       </View>

//       <FlatList
//         data={reports}
//         renderItem={renderReport}
//         keyExtractor={item => item.id}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#4875E1']}
//             tintColor="#4875E1"
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <MaterialIcons name="inbox" size={48} color="#D1D5DB" />
//             <Text style={styles.emptyText}>No reports found</Text>
//           </View>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//   },
//   header: {
//     padding: 20,
//     paddingTop: Platform.OS === 'ios' ? 60 : 20,
//     backgroundColor: '#FFFFFF',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#111827',
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   filterContainer: {
//     flexDirection: 'row',
//     padding: 12,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     marginRight: 8,
//     backgroundColor: '#F3F4F6',
//   },
//   filterButtonActive: {
//     backgroundColor: '#4875E1',
//   },
//   filterIcon: {
//     marginRight: 6,
//   },
//   filterButtonText: {
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   filterButtonTextActive: {
//     color: '#FFFFFF',
//   },
//   listContainer: {
//     padding: 16,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   reportCard: {
//     marginBottom: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   reportGradient: {
//     padding: 16,
//   },
//   reportHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   reportInfo: {
//     flex: 1,
//   },
//   reportTypeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   reportTypeIcon: {
//     marginRight: 6,
//   },
//   reportType: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   reportDate: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//     marginLeft: 4,
//     textTransform: 'capitalize',
//   },
//   userInfo: {
//     marginBottom: 12,
//   },
//   userSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   label: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginLeft: 6,
//     marginRight: 4,
//   },
//   value: {
//     fontSize: 14,
//     color: '#111827',
//     fontWeight: '500',
//   },
//   reportDescription: {
//     fontSize: 14,
//     color: '#374151',
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   proofImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//   },
//   actionButton: {
//     flex: 1,
//     marginHorizontal: 4,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   actionGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   actionButtonText: {
//     marginLeft: 6,
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#FFFFFF',
//   },
//   resolutionInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   resolutionIcon: {
//     marginRight: 8,
//   },
//   resolutionText: {
//     fontSize: 14,
//     color: '#10B981',
//     fontWeight: '500',
//   },
//   resolutionDate: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
// });

// export default ReportScreen;
