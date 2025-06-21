import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Request notification permissions on app load
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    // Listen for notifications
    const notificationListener = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notification permissions to schedule notifications.',
          [{ text: 'OK' }]
        );
        setPermissionGranted(false);
        return;
      }
      
      setPermissionGranted(true);
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // You can leave this as is for local notifications
      })).data;
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }

    return token;
  };

  const scheduleNotification = async () => {
    if (!permissionGranted) {
      Alert.alert(
        'Permission Denied',
        'Notification permission is required to schedule notifications.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Schedule notification for 1-2 minutes in the future
    const trigger = new Date(Date.now() + 1.5 * 60 * 1000); // 1.5 minutes from now

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Scheduled Notification",
        body: "This is your scheduled notification! The app was in the foreground when this was triggered.",
        data: { data: 'goes here' },
      },
      trigger: {
        date: trigger,
      },
    });

    Alert.alert(
      'Notification Scheduled',
      `Notification will appear at ${trigger.toLocaleTimeString()}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Notification Scheduler</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Permission Status:</Text>
          <Text style={[
            styles.statusText,
            { color: permissionGranted ? '#4CAF50' : '#F44336' }
          ]}>
            {permissionGranted ? 'Granted' : 'Denied'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            !permissionGranted && styles.buttonDisabled
          ]}
          onPress={scheduleNotification}
          disabled={!permissionGranted}
        >
          <Text style={styles.buttonText}>Schedule Notification</Text>
        </TouchableOpacity>

        {notification && (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationTitle}>Last Notification:</Text>
            <Text style={styles.notificationText}>
              {notification.request.content.title}
            </Text>
            <Text style={styles.notificationText}>
              {notification.request.content.body}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notificationContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 300,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
