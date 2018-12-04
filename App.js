/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import firebase from 'react-native-firebase';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {

  /* only request permission */
  requestPermissionNotify = ()=> {
    firebase.messaging().requestPermission()
    .then(() => {
      // User has authorised
      console.log(`permisos OK!`)
    })
    .catch(error => {
      // User has rejected permissions
      console.log(`error requestPermission: ${error}`)
    });
  }

  /* only has getToken */
  getTokenNotify = ()=> {
    firebase.messaging().getToken()
    .then(fcmToken => {
      if (fcmToken) {
        // user has a device token
        console.log(`Token: ${fcmToken}`)
      } else {
        // user doesn't have a device token yet
        console.log(`Token not Device!`)
      } 
    });
  }

  /* only has permission */
  hasPermissionNotify = ()=> {
    firebase.messaging().hasPermission()
    .then(enabled => {
      if (enabled) {
        // user has permissions
        this.getTokenNotify()
      } else {
        // user doesn't have permission
        this.requestPermissionNotify()
      } 
    });

    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
      // Process your token as required
      console.log('onTokenRefreshListener')
    });

  }

  setupNotify = ()=> {
    /* Permission, getToken */
    this.hasPermissionNotify()

    /* config channel */
    const channel = new firebase.notifications.Android.Channel(
      'channelId',
      'Channel Name',
      firebase.notifications.Android.Importance.Max
    ).setDescription('A natural description of the channel');
    firebase.notifications().android.createChannel(channel);

    // the listener returns a function you can use to unsubscribe
    this.unsubscribeFromNotificationListener = firebase.notifications().onNotification((notification) => {
      if (Platform.OS === 'android') {
        this.androidNotify(notification)
      } else if (Platform.OS === 'ios') {
        this.iosNotify(notification)
      }
    });

  }
  
  androidNotify = (notification)=> {
    const localNotification = new firebase.notifications.Notification({
      sound: 'default',
      show_in_foreground: true,
    })
    .setNotificationId(notification.notificationId)
    .setTitle(notification.title)
    .setSubtitle(notification.subtitle)
    .setBody(notification.body)
    .setData(notification.data)
    .android.setChannelId('channelId') // e.g. the id you chose above
    .android.setSmallIcon('ic_stat_notification') // create this icon in Android Studio
    .android.setColor('#000000') // you can set a color here
    .android.setPriority(firebase.notifications.Android.Priority.High);

    firebase.notifications()
      .displayNotification(localNotification)
      .catch(err => console.error(err));
  }

  iosNotify = (notification) => {
    const localNotification = new firebase.notifications.Notification()
          .setNotificationId(notification.notificationId)
          .setTitle(notification.title)
          .setSubtitle(notification.subtitle)
          .setBody(notification.body)
          .setData(notification.data)
          .ios.setBadge(notification.ios.badge);

        firebase.notifications()
          .displayNotification(localNotification)
          .catch(err => console.error(err));
  }
  
  componentDidMount() {

    //initialized notify in Background and Foreground
    this.setupNotify()

  }

  componentWillUnmount() {
    // this is where you unsubscribe
    this.unsubscribeFromNotificationListener();
    this.onTokenRefreshListener();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native with FireBase!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
