/**
 * Sample React Native App
 *
 * adapted from App.js generated by the following command:
 *
 * react-native init example
 *
 * https://github.com/facebook/react-native
 */

 import React, { useState, useEffect } from 'react';
 import {StyleSheet, Text, TextInput, View, Button, NativeModules, Alert, ScrollView, NativeEventEmitter } from 'react-native';
 import { sha512 } from 'js-sha512';
 const { PayUBizSdk } = NativeModules;
 
 export default App= () => {
 
     const [environment, setEnvironment] = useState(0 + "");
     const [key, setKey] = useState('smsplus');
     const [merchantSalt, setMerchantSalt] = useState('1b1b0');
     const [merchantName, setMerchantName] = useState("Rashan vala");
     const [amount, setAmount] = useState("1.00");
     const [productInfo, setProductInfo] = useState('productInfo');
     const [firstName, setFirstName] = useState('firstName');
     const [email, setEmail] = useState('test@gmail.com');
     const [phone, setPhone] = useState('');//Put your mobile number for testing
     const [sUrl, surl] = useState('https://payu.herokuapp.com/ios_success');
     const [fUrl, furl] = useState('https://payu.herokuapp.com/ios_failure');
     const [udf1, setUdf1] = useState('udf1');
     const [udf2, setUdf2] = useState('udf2');
     const [udf3, setUdf3] = useState('udf3');
     const [udf4, setUdf4] = useState('udf4');
     const [udf5, setUdf5] = useState('udf5');
     const [showAlert, setShowAlert] = useState(false);
 
     displayAlert = (title, value) => {
         if (showAlert == false) {
             console.log('displayAlert ' + title + ' ' + value);
             setShowAlert(true);
             Alert.alert(title, value); 
         }
         setShowAlert(false);
     }
     
     //Register eventEmitters here
     useEffect(() => {
         const eventEmitter = new NativeEventEmitter(PayUBizSdk);
         onPayUSuccessListener = eventEmitter.addListener('onPayUSuccess', onPayUSuccess);
         onPayUFailureListener = eventEmitter.addListener('onPayUFailure', onPayUFailure);
         onPayUCancelListener = eventEmitter.addListener('onPayUCancel', onPayUCancel);
         payUGenerateHashListener = eventEmitter.addListener('generateHash', generateHash);
         PayUBizSdk.getInstance(createSDKConfig());
    //Unregister eventEmitters here
         return () => {
            console.log("Unsubscribed!!!!")
            onPayUSuccessListener.remove();
            onPayUFailureListener.remove();
            onPayUCancelListener.remove();
            payUGenerateHashListener.remove();
       }

     }, [merchantSalt])
 
     onPayUSuccess = (e) => {
         console.log(e);
         displayAlert('onPayUSuccess', JSON.stringify(e));
     }
     onPayUFailure = (e) => {
         console.log(e);
         displayAlert('onPayUFailure', JSON.stringify(e));
     }
     onPayUCancel = (e) => {
         console.log(e);
         displayAlert('onPayUCancel', JSON.stringify(e));
     }
     generateHash = (e) => {
        console.log('generateHash - '  + e);
         console.log(e.hashName);
         console.log(e.hashString);
         sendBackHash(e.hashName, e.hashString + merchantSalt);
     }

     createSDKConfig = () => {
     
        var config = {
            merchantName: merchantName,
            key: key,
            phone: phone,
            email: email
        }
        return config
    }

     createPaymentParams = () => {
         var txnId = new Date().getTime().toString();
         var payUPaymentParams = {
            transactionId: txnId,
            amount: amount,
            firstName: firstName,
            surl: sUrl,
            furl: fUrl,
            productInfo: productInfo,
            udf1: udf1,
            udf2: udf2,
            udf3: udf3,
            udf4: udf4,
            udf5: udf5
         }
         return payUPaymentParams;
     }
     //Used to send back hash generated to SDK
     sendBackHash = (hashName, hashData) => {
         console.log(hashName);
         var hashValue = calculateHash(hashData);
         var result = {'hashName':hashName, [hashName]: hashValue };
         console.log(result);
         PayUBizSdk.hashGenerated(result);
     }
     calculateHash = (data) => {
         console.log(data);
         var result = sha512(data);
         console.log(result);
         return result;
     }
     
     launchPayUUPIBolt = () => {
        PayUBizSdk.isUPIBoltSDKAvailable(
            (response) => {
             if (response.isSDKAvailable == 'true'){
                console.log("isSDKAvailable Can do Payment---------");
                PayUBizSdk.payURegisterAndPay(createPaymentParams());
       
             }else {
                console.log("UPI Bol  Not available---------");
             }
            }
            );
     }

     upiBoltSettings = () => {

        PayUBizSdk.isUPIBoltSDKAvailable(
            (response) => {
             if (response.isSDKAvailable == 'true'){
                PayUBizSdk.payUUPIBoltUserSettings();
        
             }else {
                console.log("UPI Bolt not available");
             }
            }
            );
    }



     return (
         <ScrollView style={styles.container}>
             <View >
             <Text style={styles.welcome}>☆ PayUCheckoutPro ☆{'\n'}Sample App</Text> 
             </View> 
             <View style={styles.cell}>
                 <Text style={styles.category}>Merchant Key</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={key} onChangeText={text => { setKey(text)}} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>Merchant Salt</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={merchantSalt} onChangeText={text => { setMerchantSalt(text) }} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>Environment</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={environment} onChangeText={text => { setEnvironment(text) }} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>Enter Amount</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={amount} onChangeText={text => { setAmount(text) }} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>Email</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={email} onChangeText={text => { setEmail(text) }} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>Phone</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={phone} onChangeText={text => { setPhone(text) }} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>UDF1</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={udf1} onChangeText={text => { setUdf1(text) }} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>UDF2</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={udf2} onChangeText={text => { setUdf2(text)}} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>UDF3</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={udf3} onChangeText={text => { setUdf3(text)}} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>UDF4</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={udf4} onChangeText={text => { setUdf4(text)}} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>UDF5</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={udf5} onChangeText={text => { setUdf5(text) }} />
             </View>
             <View style={styles.cell}>
                 <Text style={styles.category}>Merchant Name</Text>
                 <TextInput style={styles.valuesTextInput} defaultValue={merchantName} onChangeText={text => { setMerchantName(text) }} />
             </View>
             <View style={{ flex: 1, marginBottom: 10 }}>
              <Button style={styles.button} title={'Register & Pay'}  onPress={()=>{launchPayUUPIBolt()}} />
            </View>
             <Button style={styles.button} title={'UPI Settings'}  onPress={()=>{upiBoltSettings()}} />
         </ScrollView>
     );
 }
 
 const styles = StyleSheet.create({
     contentContainerStyle: {
         flex: 2,
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: '#F5FCFF',
 
     },
     welcome: {
         fontSize: 20,
         textAlign: 'center',
         margin: 10,
         marginTop: 50,
         marginBottom: 20,
         padding:10,
         backgroundColor: '#6495DD',
         fontWeight:"bold"  
     },
     category: {
         fontSize: 14,
         textAlign: 'left',
         fontWeight: "bold"
     },
     values: {
         fontSize: 14,
         textAlign: 'right'
     },
     valuesTextInput: {
        fontSize: 14,
        textAlign: 'right',
        width:180,
        borderWidth: .5,
        borderRadius: 5,
        padding: 10,
        backgroundColor:'#F2F3F4'
    },
     valuesSwitch: {
        fontSize: 14,
        textAlign: 'right'
    },
     instructions: {
         textAlign: 'center',
         color: '#333333',
         marginBottom: 5,
     },
     cell: {
         flex: 1,
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         margin: 10,
     },
     button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 10,
    },
 });
 
