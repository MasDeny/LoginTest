import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

class GoogleButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pushData: [],
      loggedIn: false,
      userInfo: {},
    };
  }
  componentDidMount() {
    GoogleSignin.configure({
      // scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
      webClientId: '556057239428-d2qp4le5oqmagh3o5h58mkrbp0fn8u89.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      // androidClientId: '556057239428-j7qr2p8jomms1449b9kpf3a93gujmd05.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      hostedDomain: '', // specifies a hosted domain restriction
      loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
      forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login.
      accountName: '', // [Android] specifies an account name on the device that should be used
      // iosClientId: '124018728460-krv1hjdv0mp51pisuc1104q5nfd440ae.apps.googleusercontent.com', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    });
  }

  _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const ipAddr = await (await axios.get('http://ip-api.com/json/')).data;
      let device = {
        'name': await DeviceInfo.getDeviceName(),
        'brand': await DeviceInfo.getBrand(),
        'ip': ipAddr.query,
        'location': ipAddr.city,
        'timezone': ipAddr.timezone,
      };
      axios.post('https://idingar.com/api/v1/auth/google/callback', device, {
        headers: {
          'Content-Type': 'application/json',
          'x-google-token': userInfo.idToken,
        },
      })
        .then((response) => {
          console.log(response.data);
        }, (error) => {
          console.log(error);
        });
      this.setState({ userInfo: userInfo, loggedIn: true });
      console.log(userInfo.user);

    } catch (error) {
      console.log(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log('user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
        console.log('operation (f.e. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        console.log('play services not available or outdated');
      } else {
        // some other error happened
        console.log('some other error happened');
      }
    }
  };

  getCurrentUserInfo = async () => {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.setState({ userInfo });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        // user has not signed in yet
        console.log('user has not signed in yet');
        this.setState({ loggedIn: false });
      } else {
        // some other error
        console.log('some other error happened');
        this.setState({ loggedIn: false });
      }
    }
  };

  signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      this.setState({ user: null, loggedIn: false }); // Remember to remove the user from your app's state as well
    } catch (error) {
      console.error(error);
    }
  };
  render() {
    return (
      <TouchableOpacity onPress={this._signIn} style={styles.roundButton}>
        <Icon name="google" size={30} color={'white'}/>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  roundButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#b71c1c',
    margin: 10,
    fontWeight: 'bold',
  },
});

export default GoogleButton;
