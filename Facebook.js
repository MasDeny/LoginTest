import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';

class FacebookButton extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
    };
  }

  signInFB = async () => {
    try {
      let login = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (login.isCancelled) {
        console.log('Login cancelled');
      } else {
        AccessToken.getCurrentAccessToken().then(async (data) => {
          const token = data.accessToken.toString();
          const ipAddr = await (await axios.get('http://ip-api.com/json/')).data;
          let device = {
            'name': await DeviceInfo.getDeviceName(),
            'brand': await DeviceInfo.getBrand(),
            'ip': ipAddr.query,
            'location': ipAddr.city,
            'timezone': ipAddr.timezone,
          };
          axios.post('https://idingar.com/api/v1/auth/facebook/callback', device, {
            headers: {
              'Content-Type': 'application/json',
              'x-facebook-token': token,
            },
          })
            .then((response) => {
              console.log(response.data);
            }, (error) => {
              console.log(error);
            });
          // this.getCurrentUserInfo(token);
        });
      }
    } catch (error) {
      console.error('Handle Login with facebook error: ', error);
    }
  }

  // getCurrentUserInfo = (token) => {
  //   const userParams = { fields: { string: 'id,name,first_name,last_name,picture,email' } };
  //   const userProfileRequest = new GraphRequest(
  //     '/me',
  //     { token, parameters: userParams },
  //     (error, user) => {
  //       if (error) {
  //         console.error('Handle user infos error: ', error);
  //       } else {
  //         this.setState({userInfo: user});
  //         console.log((user, { fromFacebook: true, facebookToken: token }));
  //         console.log(this.state.userInfo);
  //       }
  //     },
  //   );
  //   new GraphRequestManager().addRequest(userProfileRequest).start();
  // }

  render() {
    return (
      <TouchableOpacity onPress={this.signInFB} style={styles.roundButton}>
        <Icon name="facebook" size={30} color={'white'}/>
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
    backgroundColor: 'blue',
    margin: 10,
    fontWeight: 'bold',
  },
});

export default FacebookButton;
