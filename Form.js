import React, { Component, Fragment } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { firebase } from '@react-native-firebase/app';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';

class FormLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
        email: '',
        password: '',
        token: '',
        };
    }
    _signInForm = async () => {
        const credentials = {
            apiKey: 'AIzaSyCV_35gTfJPaL2YuaS7Emz02dAwliK3898',
            authDomain: 'wallet-316907.firebaseapp.com',
            projectId: 'wallet-316907',
            storageBucket: 'wallet-316907.appspot.com',
            messagingSenderId: '556057239428',
            appId: '1:556057239428:web:1c075a05217e9a472dc7d1',
            measurementId: 'G-LZ7SJZ2TG8',
        };
        if (!firebase.apps.length) {
            firebase.initializeApp(credentials);
        } else {
            firebase.app(); // if already initialized, use that one
        }
        try {
            await messaging().registerDeviceForRemoteMessages();
            const token = await messaging().getToken();
            messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Message handled in the background!', remoteMessage);
            });
            await messaging()
                .subscribeToTopic('news')
                .then(() => console.log('Subscribed to topic!'));
            this.setState({token: token});
            await this._loginProcess();
        } catch (error) {
            console.log(error);
            return false;
        }
    };
    _loginProcess = async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const ipAddr = await (await axios.get('http://ip-api.com/json/')).data;
        let data = {
            'name': await DeviceInfo.getDeviceName(),
            'brand': await DeviceInfo.getBrand(),
            'ip': ipAddr.query,
            'location': ipAddr.city,
            'timezone': ipAddr.timezone,
            'email': this.state.email,
            'password': this.state.password,
            'fcm_token': this.state.token,
        };
        console.log(data);
        axios.post('http://192.168.1.7:5000/api/v1/auth/login', data, {
            headers: headers,
        }).then(res => console.log(res)).catch(err => console.log(err));
    }
    render(){
        return (
            <Fragment>
            <View style={styles.col}>
                <Text style={styles.logo}>Trakteer</Text>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.TextInput}
                        placeholder="Email"
                        placeholderTextColor="#7f828b"
                        onChangeText={(email) => this.setState({email:email})}
                    />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.TextInput}
                        placeholder="Password"
                        placeholderTextColor="#7f828b"
                        secureTextEntry={true}
                        onChangeText={(password) => this.setState({password: password})}
                    />
                </View>
                <TouchableOpacity style={styles.loginBtn} onPress={this._signInForm}>
                    <Text style={styles.loginText}>LOGIN</Text>
                </TouchableOpacity>
            </View>
            </Fragment>
        );
    }
}

const styles = StyleSheet.create({
  col: {
      alignItems: 'center',
      paddingTop: 50,
      paddingBottom: 20,
  },
  logo:{
    fontWeight:'bold',
    fontSize:50,
    color:'#d32f2f',
    marginBottom:40,
  },
  inputView: {
   backgroundColor: 'white',
   borderWidth: 1,
   borderColor:'#d32f2f',
   borderRadius: 10,
   width: '70%',
   height: 45,
   marginBottom: 20,
   alignItems: 'center',
 },

 TextInput: {
   fontWeight: 'bold',
   fontSize: 24,
   height: 50,
   flex: 1,
   padding: 10,
   marginLeft: 20,
 },
 loginBtn:{
   width:'70%',
   borderRadius:10,
   height:50,
   alignItems:'center',
   justifyContent:'center',
   backgroundColor:'#d32f2f',
 },
 loginText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
 },
});

export default FormLogin;
