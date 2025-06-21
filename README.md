<<<<<<< HEAD
# Notification Scheduler App

A React Native + Expo app that demonstrates scheduling local foreground notifications using expo-notifications.

## Features

- ✅ Request notification permissions on app load
- ✅ Schedule local notifications 1-2 minutes in the future
- ✅ Show notifications even when app is in foreground
- ✅ Handle permission denial gracefully
- ✅ Clean, modern UI with status indicators
- ✅ Android-specific notification channel configuration

## Requirements

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android device or emulator for testing
- Expo Go app (optional, for development)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd NotificationScheduler
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally (if not already installed):**
   ```bash
   npm install -g @expo/cli
   ```

## Running the App

### For Android Development

1. **Start the development server:**
   ```bash
   npm run android
   ```

2. **Or use Expo CLI:**
   ```bash
   npx expo start
   ```

3. **Then press 'a' to open on Android device/emulator**

### Using Expo Go (Alternative)

1. **Start the development server:**
   ```bash
   npx expo start
   ```

2. **Scan the QR code with Expo Go app on your Android device**

## How to Test

1. **Launch the app** - it will automatically request notification permissions
2. **Grant permissions** when prompted
3. **Tap "Schedule Notification"** button
4. **Wait 1.5 minutes** - the notification will appear even if the app is in the foreground
5. **Check the status indicator** to see if permissions are granted

## Project Structure

```
NotificationScheduler/
├── App.tsx                 # Main app component with notification logic
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── assets/                # App icons and splash screen
```

## Key Dependencies

- `expo-notifications`: For handling local notifications
- `expo-device`: For device detection and permissions
- `expo-constants`: For Expo configuration
- `@notifee/react-native`: For advanced notification features (installed but not used in this simple implementation)

## Technical Implementation

### Notification Configuration
- Uses `expo-notifications` for local notification scheduling
- Configures Android notification channel with high importance
- Sets up notification handler to show alerts even in foreground

### Permission Handling
- Requests notification permissions on app load
- Shows appropriate error messages if permissions are denied
- Disables the schedule button if permissions are not granted

### UI Features
- Real-time permission status indicator
- Disabled button state when permissions are denied
- Shows last received notification details
- Modern, clean design with shadows and proper spacing

## Troubleshooting

### Common Issues

1. **"Must use physical device for Push Notifications"**
   - Use a physical Android device instead of an emulator
   - Or use Expo Go app for testing

2. **Notifications not appearing**
   - Check that notification permissions are granted
   - Ensure the app is not in battery optimization mode
   - Verify notification settings in Android system settings

3. **Build errors**
   - Clear cache: `npx expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Android-Specific Notes

- The app configures a notification channel for Android
- Notifications will appear with vibration and sound
- Works with Android 8.0 (API level 26) and higher

## Bonus Features (Future Enhancements)

- [ ] DateTimePicker for custom notification timing
- [ ] Multiple notification scheduling
- [ ] Notification history
- [ ] Custom notification sounds
- [ ] Background notification handling

## License

This project is created for demonstration purposes.
=======
# Findr
>>>>>>> c0664bc747bfaf2cd492b7977871b7920be3b9ba
