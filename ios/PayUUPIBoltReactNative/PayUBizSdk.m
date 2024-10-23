#import "PayUBizSdk.h"
#import <React/RCTUtils.h>
@import PayUUPIBoltBaseKit;
@import PayUUPIBoltKit;
#import "PayUUPIBoltUIKit/PayUUPIBoltUIKit-Swift.h"



@interface PayUBizSdk()<PayUUPIBoltUIDelegate>

typedef void (^hashCompletionCallback)(NSDictionary<NSString *,NSString *> * _Nonnull);

@property (nonatomic, strong) NSMutableDictionary *hashCallbacks;

@end

@implementation PayUBizSdk
{
  bool hasListeners;
}
NSString *const onPayUSuccess = @"onPayUSuccess";
NSString *const onPayUFailure = @"onPayUFailure";
NSString *const onPayUCancel = @"onPayUCancel";
NSString *const OnError = @"onError";
NSString *const GenerateHash = @"generateHash";
NSString *const permissionCallback = @"permissionCallback";
PayUUPIBoltUIInterface *boltUI;

RCT_EXPORT_MODULE()
RCT_EXPORT_METHOD(hashGenerated:(NSDictionary *)hashDict) {
  @try {
    dispatch_async(dispatch_get_main_queue(), ^{
      hashCompletionCallback callback = [self.hashCallbacks objectForKey:hashDict[@"hashName"]];
      if (callback && hashDict) {
        callback(hashDict);
        [self.hashCallbacks removeObjectForKey:hashDict[@"hashName"]  ];
      }
    });
  } @catch (NSException *exception) {
    [self onPayUError:[PayUBizSdk convertExceptionToError:exception]];
  }
}

RCT_EXPORT_METHOD(isUPIBoltSDKAvailable:(NSDictionary *)config
                  onCallback:(RCTResponseSenderBlock)onCallback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self getInstance:config];
  [boltUI isUPIBoltSDKAvailableWithCallback:^(PayUUPIBoltResponse * _Nonnull response) {
    BOOL sdkAvailable = YES;
    if (response.code == 0) {
      sdkAvailable = YES;
    } else {
      sdkAvailable = NO;
    }
    NSDictionary *result = @{@"isSDKAvailable": sdkAvailable ? @"true" : @"false"};
    onCallback(@[result]);
  }];
  });
}

RCT_EXPORT_METHOD(payURegisterAndPay:(NSDictionary *)config withParam:(NSDictionary *)params) {
  @try {
    
    dispatch_async(dispatch_get_main_queue(), ^{
      [self getInstance:config];
      NSMutableDictionary *mergedDict = [params mutableCopy];
      [mergedDict addEntriesFromDictionary:config];
      [boltUI registerAndPayWithPaymentParamsJSON:mergedDict];
      NSLog(@"%@", config);
      NSLog(@"%@", params);
    });
  }
  @catch (NSException * exception) {
    [self onPayUError:[PayUBizSdk convertExceptionToError:exception]];
  }
}

RCT_EXPORT_METHOD(payUUPIBoltUserSettings:(NSDictionary *)config) {
  @try {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self getInstance:config];
      [boltUI openUPIManagementWithScreenTypeString:@""];
      
      NSLog(@"%@", config);
    });
  }
  @catch (NSException * exception) {
    [self onPayUError:[PayUBizSdk convertExceptionToError:exception]];
  }
}

RCT_EXPORT_METHOD(getInstance:(NSDictionary *)config) {
  @try {
    if (!_hashCallbacks) {
      self.hashCallbacks = [[NSMutableDictionary alloc] init];
    }
    if(!boltUI) {
      UIViewController *rootVc = RCTPresentedViewController();
      NSDictionary * payuConfig = [self updateConfig:config];
      boltUI = [PayUUPIBoltUI initSDKWithParentVC:rootVc configJSON:payuConfig delegate: self];
    }
  }
  @catch (NSException * exception) {
    [self onPayUError:[PayUBizSdk convertExceptionToError:exception]];
  }
}

- (NSDictionary *)updateConfig:(NSDictionary *)config {
  NSMutableDictionary *dict = [config mutableCopy];
  NSDate *currentDate = [NSDate date];
  NSTimeInterval timeInSeconds = [currentDate timeIntervalSince1970];
  long long timeInMillis = (long long)(timeInSeconds * 1000);
  NSString *timeInMillisString = [NSString stringWithFormat:@"%lld", timeInMillis];
  
  dict[@"pluginTypes"] = @[@"AXIS"];
  dict[@"refId"] = timeInMillisString;
  dict[@"isProduction"] = @true;
  return  dict;
  
}


#pragma mark - PayUCheckoutProDelegate Methods
- (void)generateHashFor:(NSDictionary<NSString *,NSString *> * _Nonnull)param onCompletion:(void (^ _Nonnull)(NSDictionary<NSString *,NSString *> * _Nonnull))onCompletion {
  [self.hashCallbacks setObject:onCompletion forKey:param[@"hashName"]];
  [self sendEventWithName:GenerateHash body:param];
}

- (void)onPayUError:(NSError * _Nullable)error {
  NSDictionary *errorDict = [NSDictionary dictionaryWithObjectsAndKeys:
                             error.localizedDescription, @"errorMsg",
                             nil];
  [self sendEventWithName:onPayUFailure body:errorDict];
}

- (void)onPayUCancelWithIsTxnInitiated:(BOOL)isTxnInitiated {
  NSDictionary *response = [NSDictionary dictionaryWithObjectsAndKeys:
                            [NSNumber numberWithBool:isTxnInitiated], @"isTxnInitiated",
                            nil];
  [self sendEventWithName:onPayUCancel body:response];
}

- (void)onPayUFailureWithResponse:(PayUUPIBoltResponse *)response {
  NSMutableDictionary *dict = [NSMutableDictionary new];
  [dict setValue: @(response.code) forKey:@"code"];
  [dict setValue:response.message forKey:@"message"];
  [dict setValue:response.result forKey:@"result"];
  [self sendEventWithName:onPayUFailure body:dict];
}

- (void)onPayUSuccessWithResponse:(PayUUPIBoltResponse *)response {
  NSMutableDictionary *dict = [NSMutableDictionary new];
  [dict setValue: @(response.code) forKey:@"code"];
  [dict setValue:response.message forKey:@"message"];
  [dict setValue:response.result forKey:@"result"];
  [self sendEventWithName:onPayUSuccess body:dict];
}

#pragma mark - RCTEventEmitter methods

-(NSArray<NSString *> *)supportedEvents {
  return @[onPayUSuccess, onPayUFailure, onPayUCancel, OnError, GenerateHash, permissionCallback];
}

// Will be called when this module's first listener is added.
-(void)startObserving {
  hasListeners = YES;
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving {
  hasListeners = NO;
}

- (void)sendEventWithName:(NSString *)name body:(id)body{
  if (hasListeners) {
    [super sendEventWithName:name body:body];
  }
}

+(NSError *)convertExceptionToError:(NSException *)exception{
  NSMutableDictionary * info = [NSMutableDictionary dictionary];
  [info setValue:exception.name forKey:@"ExceptionName"];
  [info setValue:exception.reason forKey:@"ExceptionReason"];
  [info setValue:exception.callStackReturnAddresses forKey:@"ExceptionCallStackReturnAddresses"];
  [info setValue:exception.callStackSymbols forKey:@"ExceptionCallStackSymbols"];
  [info setValue:exception.userInfo forKey:@"ExceptionUserInfo"];
  
  NSError *error = [[NSError alloc] initWithDomain:@"com.payu.bizReactNativeWrapper" code:100 userInfo:info];
  return error;
}

@end
