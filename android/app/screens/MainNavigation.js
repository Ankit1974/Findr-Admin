import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CreatedUsersScreen from './CreatedUsersScreen';
//import ReportScreen from './ReportScreen';
import PostManagement from './PostManagement';
import DashboardScreen from './DashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Dashboard':
            iconName = 'dashboard';
            break;
          case 'Reports':
            iconName = 'report-problem';
            break;
          case 'Posts':
            iconName = 'post-add';
            break;
          default:
            iconName = 'circle';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4875E1',
      tabBarInactiveTintColor: 'gray',
      headerShown: true,
      tabBarStyle: {
        paddingBottom: 5,
        height: 60,
      },
      headerStyle: {
        backgroundColor: '#4875E1',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ title: 'Dashboard Overview' }}
    />
    {/* <Tab.Screen 
      name="Reports" 
      component={ReportScreen}
      options={{ title: 'Report Management' }}
    /> */}
    {/* <Tab.Screen 
      name="Posts" 
      component={PostManagement}
      options={{ title: 'Post Management' }}
    /> */}
  </Tab.Navigator>
);

const MainNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
          name="CreatedUser" 
          component={CreatedUsersScreen} 
          options={{
            headerShown: true,
            title: 'User Creation By Date',
            headerStyle: { backgroundColor: '#4875E1' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigation;
