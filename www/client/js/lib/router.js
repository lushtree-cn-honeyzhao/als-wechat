/**
 * Created by cc on 15-8-1.
 */

angular.module('app.config').provider('router', ['$stateProvider', '$urlRouterProvider', '$logProvider', '$ionicConfigProvider',
    function config($stateProvider, $urlRouterProvider, $logProvider, $ionicConfigProvider) {
        this.$get = function () {
            return {}
        };

        $ionicConfigProvider.tabs.position('bottom'); // other values: top

        $urlRouterProvider.otherwise("/tab/home");

        $stateProvider
            .state('datePicker', {
                url: "/datePicker",
                templateUrl: "client/templates/common/dateModal.ng.html",
                controller: 'datePicker'
            })

        $stateProvider
            .state('tabs', {
                url: "/tab",
                abstract: true,
                templateUrl: "client/templates/tabs.ng.html"
            })
            .state('tabs.home', {
                url: "/home",
                views: {
                    'rentcar-tab': {
                        controller: 'RentCarIndexController',
                        templateUrl: "client/templates/rentcar/main.ng.html"
                    }
                }
            }).state('tabs.messagelist', {
                url: "/messages/messagelist/{from}",
                authCode: true,
                views: {
                    'message-tab': {
                        controller: 'MessagesController',
                        templateUrl: "client/templates/messages/messagelist.ng.html"
                    }
                }
            }).state('tabs.usercenterMine', {
                url: "/usercenter/mine",
                authCode: true,
                views: {
                    'mine-tab': {
                        controller: 'UserController',
                        templateUrl: "client/templates/usercenter/mine.ng.html"
                    }
                }
            }).state('settingSuggestion', {
                url: '/setting/suggestion',
                templateUrl: 'client/templates/setting/suggestion.ng.html'
            }).state('login', {
                url: '/login',
                controller: 'AppController',
                templateUrl: 'client/templates/common/login.ng.html'
            }).state('signup', {
                url: '/signup',
                controller: 'RegisterController',
                templateUrl: 'client/templates/common/signup.ng.html'
            }).state('signup_dcgj', {
                url: '/signup_dcgj',
                controller: 'RegisterController',
                templateUrl: 'client/templates/common/signup_dcgj.ng.html'
            }).state('dcgj_success', {
                url: '/dcgj_success',
               // controller: 'RegisterController',
                templateUrl: 'client/templates/common/dcgj_success.ng.html'
            }).state('signupUpload', {
                url: '/signupUpload/{uploadType}',
                controller: 'RegisterUploadController',
                templateUrl: 'client/templates/common/signupUpload.ng.html'
            }).state('registerSuccess', {
                url: '/registerSuccess',
                controller: 'RegisterController',
                templateUrl: 'client/templates/common/registerSuccess.ng.html'
            }).state('orders', {
                url: '/orders/{rnd}',
                authCode: true,
                controller: 'RentCarOrdersController',
                templateUrl: 'client/templates/rentcar/orders.ng.html'
            }).state('orderDetails', {
                url: '/orderDetails/{orderId}/{rnd}',
                controller: 'orderDetailsController',
                templateUrl: 'client/templates/rentcar/orderDetails.ng.html'
            }).state('updatePass', {
                url: '/updatePass',
                controller: 'UpdatePassController',
                templateUrl: 'client/templates/common/updatePass.ng.html'
            }).state('forgetPass', {
                url: '/forgetPass',
                controller: 'ForgetPassController',
                templateUrl: 'client/templates/common/forgetPass.ng.html'
            }).state('coupons', {
                url: '/coupons',
                controller: 'CouponsController',
                templateUrl: 'client/templates/usercenter/coupons.ng.html'
            }).state('demoComponents', {
                url: '/demos',
                templateUrl: 'client/templates/demo/components.ng.html'
            }).state('usercenterAccount', {
                url: '/usercenter/account',
                controller: 'AccountController',
                templateUrl: 'client/templates/usercenter/account.ng.html'
            }).state('usercenterAccountRefund', {
                url: '/usercenter/account/refund',
                controller: 'AccountController',
                templateUrl: 'client/templates/usercenter/accountRefund.ng.html'
            }).state('usercenterAccountRecharge', {
                url: '/usercenter/account/recharge',
                controller: 'AccountController',
                templateUrl: 'client/templates/usercenter/accountRecharge.ng.html'
            }).state('demosDatepicker', {
                url: '/demos/datepicker',
                controller: 'DatepickerController',
                templateUrl: 'client/templates/demo/datepicker.ng.html'
            }).state('usercenterUserinfo', {
                url: '/usercenter/userinfo',
                controller: 'UserUpController',
                templateUrl: 'client/templates/usercenter/userInfo.ng.html'
            }).state('helpCenter', {
                url: '/usercenter/helpCenter/{rnd}',
                controller: 'HelpCenterController',
                templateUrl: 'client/templates/usercenter/helpCenter.ng.html'
            }).state('helpContent', {
                url: '/usercenter/helpContent/{id}/{rnd}',
                controller: 'HelpContentController',
                templateUrl: 'client/templates/usercenter/helpContent.ng.html'
            }).state('agreement', {
                url: '/agreement/{registerType}',
                controller: 'AgreementController',
                templateUrl: 'client/templates/common/agreement.ng.html'
            })


        //支付跳转
        $stateProvider.state('payJump', {
            url: '/payJump:orderId',
            templateUrl: 'client/templates/usercenter/payJump.ng.html'
        })
            ////提交订单
            //.state('orderCommitBase', {
            //    url: '/orderCommitBase',
            //    authCode: true,
            //    templateUrl: 'client/templates/rentcar/orderCommit/orderCommit.ng.html'
            //})
            //.state('orderCommitBase.commit', {
            //    url: '/orderCommit',
            //    views: {
            //        'rentInfo': {templateUrl: 'client/templates/rentcar/orderCommit/rentInfo.ng.html'},
            //        'rentDays': {templateUrl: 'client/templates/rentcar/orderCommit/rentDays.ng.html'},
            //        'coupons': {templateUrl: 'client/templates/rentcar/orderCommit/coupons.ng.html'},
            //        'fees': {templateUrl: 'client/templates/rentcar/orderCommit/fees.ng.html'},
            //        'pay': {templateUrl: 'client/templates/rentcar/orderCommit/pay.ng.html'}
            //    }
            //})
            ////白天或晚上租车
            //.state('dayRent', {templateUrl: 'client/templates/rentcar/rent.ng.html'})
            //.state('dayRent.day', {
            //    url: '/rentDay/{when}',
            //    views: {
            //        'carPoints': {templateUrl: 'client/templates/rentcar/carList/carPoints.ng.html'},
            //        'carsList': {templateUrl: 'client/templates/rentcar/carList/carsList.ng.html'}
            //    }
            //})
            // 白天或晚上租车
            .state('rentCarNewOrder', {
                //url: '/rentCar/newOrder/{type}/{rnd}',
                url: '/rentCar/newOrder/{type}/{rnd}',
                controller: 'RentCarNewOrderController',
                templateUrl: 'client/templates/rentcar/rent_selectcar.ng.html'
            }) //提交订单2
            .state('rentCarPreviewOrder', {
                url: '/rentCar/previewOrder/{rnd}',
                controller: 'RentCarPreviewOrderController',
                templateUrl: 'client/templates/rentcar/rent_preview_orders.ng.html'
            })
            .state('payBack', {
                url: '/payBack',
                templateUrl: 'client/templates/rentcar/payBack.ng.html'
            })
            //我的包月包列表
            .state('myPackageList', {
                url: '/servicePackage/mylist',
                controller: 'MyPackListController',
                templateUrl: 'client/templates/rentcar/servicePackage/myPackageList.ng.html'
            })
            //我的包月包列表-详情
            .state('myServicePackages', {
               // url: '/myServicePackages:packageId',
                url: '/myServicePackages/{packageId}',
                controller: 'ServicePackagesController',
                templateUrl: 'client/templates/rentcar/servicePackage/myServicePackages.ng.html'
            })
            //购买白天包月
            .state('buyDayPack', {
                url: '/servicePackage/buyDayPack/{rnd}',
                controller: 'BuyPackageController',
                templateUrl: 'client/templates/rentcar/servicePackage/buyDayPack.ng.html'
            })
            //从首页购买整租包月-包月下单
            .state('packageOrder', {
                //url: '/servicePackage/packageOrder',
                //url: '/servicePackage/packageOrder:packId',
                url: '/servicePackage/packageOrder/{packId}/{rnd}',
                //url: '/servicePackage/packageOrder/:packId',
                controller: 'PackageOrderController',
                templateUrl: 'client/templates/rentcar/servicePackage/packageOrder.ng.html'
            })


    }]);