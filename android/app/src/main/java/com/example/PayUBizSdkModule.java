package com.example;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.payu.commonmodelssdk.enums.PluginType;
import com.payu.commonmodelssdk.listeners.PayUHashGeneratedListener;
import com.payu.commonmodelssdk.listeners.PayUHashGenerationListener;
import com.payu.commonmodelssdk.model.request.PayUUPIBoltPaymentParams;
import com.payu.commonmodelssdk.model.response.PayUUPIBoltResponse;
import com.payu.upipluginui.PayUUPIBoltUI;
import com.payu.upipluginui.listeners.PayUUPIBoltUICallback;
import com.payu.upipluginui.model.PayUUPIBoltUIConfig;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class PayUBizSdkModule extends ReactContextBaseJavaModule {

    private  ReactContext reactContext;
    private PayUUPIBoltUI boltUI;
    private static PayUHashGeneratedListener payUHashGeneratedListener;

    public PayUBizSdkModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return PayUBizConstants.PAYU_UPI_BOLT_SDK;
    }

    @ReactMethod
    public void getInstance(ReadableMap payUUPIBoltUIConfig){
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override public void run() {
                boltUI = PayUUPIBoltUI.getInstance((AppCompatActivity) reactContext.getCurrentActivity(),
                        getPluginConfig(payUUPIBoltUIConfig), new PayUHashGenerationListener() {
                            @Override
                            public void generateHash(@NonNull HashMap<String, String> hashMap, @NonNull PayUHashGeneratedListener payUHashGeneratedListener) {
                                try {
                                    PayUBizSdkModule.payUHashGeneratedListener =  payUHashGeneratedListener;
                                    WritableMap map = new WritableNativeMap();
                                    for (Map.Entry<String, String> entry : hashMap.entrySet()) {
                                        map.putString(entry.getKey(), entry.getValue());
                                    }
                                    sendResultBack(PayUBizConstants.GENERATE_HASH, map);
                                } catch (Exception e) {
                                    WritableMap map = new WritableNativeMap();
                                    map.putString(PayUBizConstants.ERROR_MSG,PayUBizConstants.GENERIC_MESSAGE);
                                    sendResultBack(PayUBizConstants.ON_PAYU_FAILURE, map);
                                }
                            }
                        });
            }
        });
    }

    @ReactMethod
    public void isUPIBoltSDKAvailable(Callback onCallback) {

        boltUI.isUPIBoltSDKAvailable(new PayUUPIBoltUICallback() {
            @Override
            public void onPayUCancel(boolean isTxnInitiated) {
                WritableMap map = new WritableNativeMap();
                map.putString(PayUBizConstants.IS_SDK_AVAILABLE,"false");
                onCallback.invoke(map);
            }

            @Override
            public void onPayUSuccess(@NonNull PayUUPIBoltResponse response) {
                WritableMap map = new WritableNativeMap();
                map.putString(PayUBizConstants.IS_SDK_AVAILABLE,"true");
                onCallback.invoke(map);
            }

            @Override
            public void onPayUFailure(@NonNull PayUUPIBoltResponse response) {
                WritableMap map = new WritableNativeMap();
                map.putString(PayUBizConstants.IS_SDK_AVAILABLE,"false");
                onCallback.invoke(map);
            }
        });
    }

    @ReactMethod
    public void payURegisterAndPay(ReadableMap payUPaymentParams){
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override public void run() {
                boltUI.registerAndPay(parsePaymentParams(payUPaymentParams), new PayUUPIBoltUICallback() {
                    @Override
                    public void onPayUCancel(boolean isTxnInitiated) {
                        WritableMap map = new WritableNativeMap();
                        map.putString(PayUBizConstants.RESULT_MSG, "onPayUCancel isTxnInitiated" + isTxnInitiated);
                        map.putString(PayUBizConstants.RESULT_CODE, "-1");
                        sendResultBack(PayUBizConstants.ON_PAYU_CANCEL, map);
                    }

                    @Override
                    public void onPayUSuccess(@NonNull PayUUPIBoltResponse response) {
                        WritableMap map = new WritableNativeMap();
                        map.putString(PayUBizConstants.RESULT_MSG, response.getMessage());
                        map.putString(PayUBizConstants.RESULT_CODE, response.getCode() + "");
                        sendResultBack(PayUBizConstants.ON_PAYU_SUCCESS, map);
                    }

                    @Override
                    public void onPayUFailure(@NonNull PayUUPIBoltResponse response) {
                        WritableMap map = new WritableNativeMap();
                        map.putString(PayUBizConstants.RESULT_MSG, response.getMessage());
                        map.putString(PayUBizConstants.RESULT_CODE, response.getCode() + "");
                        sendResultBack(PayUBizConstants.ON_PAYU_FAILURE, map);
                    }
                });
            }
        });
    }

    @ReactMethod
    public void payUUPIBoltUserSettings(){
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override public void run() {
                boltUI.openUPIManagement(new PayUUPIBoltUICallback() {
                    @Override
                    public void onPayUCancel(boolean isTxnInitiated) {
                        WritableMap map = new WritableNativeMap();
                        map.putString(PayUBizConstants.RESULT_MSG, "onPayUCancel isTxnInitiated" + isTxnInitiated);
                        map.putString(PayUBizConstants.RESULT_CODE, "-1");
                        sendResultBack(PayUBizConstants.ON_PAYU_CANCEL, map);
                    }

                    @Override
                    public void onPayUSuccess(@NonNull PayUUPIBoltResponse response) {
                        WritableMap map = new WritableNativeMap();
                        map.putString(PayUBizConstants.RESULT_MSG, response.getMessage());
                        map.putString(PayUBizConstants.RESULT_CODE, response.getCode() + "");
                        sendResultBack(PayUBizConstants.ON_PAYU_SUCCESS, map);
                    }

                    @Override
                    public void onPayUFailure(@NonNull PayUUPIBoltResponse response) {
                        WritableMap map = new WritableNativeMap();
                        map.putString(PayUBizConstants.RESULT_MSG, response.getMessage());
                        map.putString(PayUBizConstants.RESULT_CODE, response.getCode() + "");
                        sendResultBack(PayUBizConstants.ON_PAYU_FAILURE, map);
                    }
                });
            }
        });
    }


    @ReactMethod
    public void hashGenerated(final ReadableMap map) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                HashMap<String, String> valueMap = new HashMap<>();
                ReadableMapKeySetIterator iterator = map.keySetIterator();
                while (iterator.hasNextKey()) {
                    String key = iterator.nextKey();
                    valueMap.put(key, map.getString(key));
                }
                PayUBizSdkModule.payUHashGeneratedListener.onHashGenerated(valueMap);
            }
        });
    }

    private void sendResultBack(String eventName, WritableMap params) {
        Handler handler = new Handler(reactContext.getMainLooper());
        handler.post(new Runnable() {
            @Override
            public void run() {
                PayUBizSdkModule.this.reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(eventName, params);
            }
        });
    }

    private  PayUUPIBoltUIConfig getPluginConfig(ReadableMap payUUPIBoltUIConfig) {
        List<PluginType> pluginList = new ArrayList();
        pluginList.add(PluginType.AXIS);
        PayUUPIBoltUIConfig config = new PayUUPIBoltUIConfig(
                payUUPIBoltUIConfig.getString(PayUBizConstants.MERCHANT_NAME),
                payUUPIBoltUIConfig.getString(PayUBizConstants.KEY),
                payUUPIBoltUIConfig.getString(PayUBizConstants.PHONE),
                payUUPIBoltUIConfig.getString(PayUBizConstants.EMAIL),
                 pluginList,
                true,
                null);
        return config;
    }

  private PayUUPIBoltPaymentParams parsePaymentParams(ReadableMap paymentParamMap) {
        PayUUPIBoltPaymentParams.Builder params = new PayUUPIBoltPaymentParams.Builder();
        params.setProductInfo(paymentParamMap.getString(PayUBizConstants.PRODUCT_INFO));
        params.setAmount(paymentParamMap.getString(PayUBizConstants.AMOUNT));
        params.setFirstName(paymentParamMap.getString(PayUBizConstants.FIRST_NAME));
        params.setSurl(paymentParamMap.getString(PayUBizConstants.SURL));
        params.setFurl(paymentParamMap.getString(PayUBizConstants.FURL));
        params.setUdf1(paymentParamMap.getString(PayUBizConstants.UDF1));
        params.setUdf2(paymentParamMap.getString(PayUBizConstants.UDF2));
        params.setUdf3(paymentParamMap.getString(PayUBizConstants.UDF3));
        params.setUdf4(paymentParamMap.getString(PayUBizConstants.UDF4));
        params.setUdf5(paymentParamMap.getString(PayUBizConstants.UDF5));
        params.setTxnId(paymentParamMap.getString(PayUBizConstants.TRANSACTION_ID));
        return params.build();
    }
}
