import { Platform, StyleSheet, Text, TextInput, View, Button, NativeModules, Alert, Switch, ScrollView, PermissionsAndroid, DeviceEventEmitter, NativeEventEmitter } from 'react-native';
import { sha512 } from 'js-sha512';
const { PayUBizSdk } = NativeModules;
const sleep = m => new Promise(r => setTimeout(r, m))

module.exports = async taskData => {
    // do stuff
    await sendBackHash(taskData.hashName, taskData.hashString + "1b1b0");
  };
   //Used to send back hash generated to SDK
   sendBackHash = async (hashName, hashData) => {
   
    console.log(hashName);
    var hashValue = calculateHash(hashData);
    var result = { [hashName]: hashValue };
    console.log(result);
    PayUBizSdk.hashGenerated(result);

    
}
calculateHash = (data) => {
    console.log(data);
    var result = sha512(data);
    console.log(result);
    return result;
}