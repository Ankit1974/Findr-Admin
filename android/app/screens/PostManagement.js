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
// } from 'react-native';
// import {
//   collection,
//   getDocs,
//   deleteDoc,
//   doc,
//   query,
//   orderBy,
//   where,
// } from 'firebase/firestore';
// import { db } from '../../../firebaseConfig';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import moment from 'moment';

// const PostManagement = () => {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');

//   useEffect(() => {
//     fetchPosts();
//   }, [filter]);

//   const fetchPosts = async () => {
//     try {
//       let postsQuery;
//       if (filter === 'reported') {
//         postsQuery = query(
//           collection(db, 'projects'),
//           where('reportCount', '>', 0),
//           orderBy('reportCount', 'desc'),
//           orderBy('createdAt', 'desc')
//         );
//       } else if (filter === 'deleted') {
//         postsQuery = query(
//           collection(db, 'projects'),
//           where('status', '==', 'deleted'),
//           orderBy('createdAt', 'desc')
//         );
//       } else {
//         postsQuery = query(
//           collection(db, 'projects'),
//           orderBy('createdAt', 'desc')
//         );
//       }

//       const snapshot = await getDocs(postsQuery);
//       const postList = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setPosts(postList);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching posts:', error);
//       Alert.alert('Error', 'Failed to fetch posts');
//       setLoading(false);
//     }
//   };

//   const handleDeletePost = async (postId) => {
//     Alert.alert(
//       'Delete Post',
//       'Are you sure you want to delete this post?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await deleteDoc(doc(db, 'projects', postId));
//               setPosts(posts.filter(post => post.id !== postId));
//               Alert.alert('Success', 'Post deleted successfully');
//             } catch (error) {
//               console.error('Error deleting post:', error);
//               Alert.alert('Error', 'Failed to delete post');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const FilterButton = ({ title, value }) => (
//     <TouchableOpacity
//       style={[
//         styles.filterButton,
//         filter === value && styles.filterButtonActive,
//       ]}
//       onPress={() => setFilter(value)}
//     >
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

//   const renderPost = ({ item }) => {
//     const postContent =
//       typeof item.content === 'object'
//         ? item.content?.text || '[Invalid content]'
//         : item.content || '[No content]';

//     return (
//       <View style={styles.postCard}>
//         <View style={styles.postHeader}>
//           <View style={styles.postHeaderLeft}>
//             <Text style={styles.postAuthor}>{item.authorName || 'Unknown Author'}</Text>
//             <Text style={styles.postDate}>
//               {item.createdAt?.toDate
//                 ? moment(item.createdAt.toDate()).format('MMM DD, YYYY HH:mm')
//                 : 'No Date'}
//             </Text>
//           </View>
//           {item.reportCount > 0 && (
//             <View style={styles.reportBadge}>
//               <MaterialIcons name="flag" size={16} color="#DC2626" />
//               <Text style={styles.reportCount}>{item.reportCount}</Text>
//             </View>
//           )}
//         </View>

//         {item.imageUrl && (
//           <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
//         )}

//         <Text style={styles.postContent}>{postContent}</Text>

//         <View style={styles.postFooter}>
//           <View style={styles.postStats}>
//             <MaterialIcons name="thumb-up" size={16} color="#6B7280" />
//             <Text style={styles.statText}>{item.likes || 0}</Text>
//             <MaterialIcons name="comment" size={16} color="#6B7280" />
//             <Text style={styles.statText}>{item.comments || 0}</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={() => handleDeletePost(item.id)}
//           >
//             <MaterialIcons name="delete" size={20} color="#DC2626" />
//             <Text style={styles.deleteButtonText}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4875E1" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.filterContainer}>
//         <FilterButton title="All Posts" value="all" />
//         <FilterButton title="Reported" value="reported" />
//         <FilterButton title="Deleted" value="deleted" />
//       </View>

//       <FlatList
//         data={posts}
//         renderItem={renderPost}
//         keyExtractor={item => item.id}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No posts found</Text>
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
//   filterContainer: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   filterButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     marginRight: 8,
//     backgroundColor: '#F3F4F6',
//   },
//   filterButtonActive: {
//     backgroundColor: '#4875E1',
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
//   postCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   postHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   postHeaderLeft: {
//     flex: 1,
//   },
//   postAuthor: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   postDate: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   reportBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEE2E2',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   reportCount: {
//     color: '#DC2626',
//     fontSize: 12,
//     fontWeight: '500',
//     marginLeft: 4,
//   },
//   postImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   postContent: {
//     fontSize: 14,
//     color: '#374151',
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   postFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   postStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statText: {
//     marginLeft: 4,
//     marginRight: 12,
//     color: '#6B7280',
//   },
//   deleteButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     borderRadius: 8,
//     backgroundColor: '#FEE2E2',
//   },
//   deleteButtonText: {
//     color: '#DC2626',
//     marginLeft: 4,
//     fontWeight: '500',
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: '#6B7280',
//     marginTop: 24,
//   },
// });

// export default PostManagement;


// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
// import firestore from '@react-native-firebase/firestore';

// const PostManagement = () => {
//   const [reportedPosts, setReportedPosts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchReportedPosts = async () => {
//     try {
//       const snapshot = await firestore().collection('ReportedPosts').get();
//       const posts = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setReportedPosts(posts);
//     } catch (error) {
//       console.error('Error fetching reported posts:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deletePost = async (postId) => {
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete this post?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await firestore().collection('ReportedPosts').doc(postId).delete();
//               setReportedPosts(prev => prev.filter(post => post.id !== postId));
//               Alert.alert('Post deleted successfully');
//             } catch (error) {
//               console.error('Error deleting post:', error);
//               Alert.alert('Error deleting post');
//             }
//           },
//         },
//       ]
//     );
//   };

//   useEffect(() => {
//     fetchReportedPosts();
//   }, []);

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.content}><Text style={styles.label}>Content:</Text> {item.content}</Text>
//       <Text><Text style={styles.label}>Author:</Text> {item.author}</Text>
//       <Text><Text style={styles.label}>Reported Reason:</Text> {item.reportedReason}</Text>
//       <TouchableOpacity onPress={() => deletePost(item.id)} style={styles.deleteButton}>
//         <Text style={styles.deleteText}>Delete Post</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Reported Posts</Text>
//       {loading ? (
//         <ActivityIndicator size="large" color="#000" />
//       ) : reportedPosts.length === 0 ? (
//         <Text style={styles.empty}>No reported posts</Text>
//       ) : (
//         <FlatList
//           data={reportedPosts}
//           keyExtractor={(item) => item.id}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 100 }}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff' },
//   header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
//   card: {
//     backgroundColor: '#f1f1f1',
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 12,
//   },
//   content: { fontSize: 16, marginBottom: 6 },
//   label: { fontWeight: 'bold' },
//   deleteButton: {
//     marginTop: 10,
//     backgroundColor: '#e53935',
//     padding: 8,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   deleteText: { color: '#fff', fontWeight: 'bold' },
//   empty: { marginTop: 20, fontSize: 16, color: '#666' },
// });

// export default PostManagement;
