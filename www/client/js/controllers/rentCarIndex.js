'use strict';

angular.module('app.controllers').controller('RentCarIndexController',
    ['$scope','$rootScope','Storage','$ionicPopup','wx',
        function ($scope, $rootScope,Storage,$ionicPopup,wx) {
            $scope.goBuy=function(){
                if(Storage.getUserInfo() ){
                    if (Storage.getUserInfo().approveStatusStr=='审核通过'){
                        $rootScope.go_url('buyDayPack')
                    }else{
                        $ionicPopup.alert({
                            title: '提示',
                            // template:Storage.getUserInfo().approveStatusStr+'...无法购买' ,
                            template:'亲，证件审核通过后才能购买' ,
                            okText: '确定'
                        })
                    }
                }
                //else {
                //    $rootScope.go_url('buyDayPack')
                //}
            }

            /*
              初始化微信分享信息
             */
            $scope.initWxInfo = function(){

                if(Storage.getUserInfo() && Storage.getUserInfo().userFriendCode){
                    var code ='invitedby' + Storage.getUserInfo().userFriendCode
                    var title = '你租车，我买单！';
                    //var desc = '领阿拉善智能监控租车代金券礼包！租一天只需50元！用我的邀请就行！';
                    var desc = '领阿拉善智能监控租车代金券礼包！首单0元！用我的邀请就行！';
                    var link ='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx86612bd2abefc6fa&redirect_uri=http%3A%2F%2Fev-easy.com%2Fwechat%2F%23%2Fsignup_dcgj'+'%3FinvitedBy%3D' + code + '&response_type=code&scope=snsapi_base#wechat_redirect&state=';
                    //var link ='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx86612bd2abefc6fa&redirect_uri=http%3A%2F%2Fev-easy.com%2Fwechat%2F' +'%3finvitedBy%3D' + code + '&response_type=code&scope=snsapi_base#wechat_redirect';
                    //link = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx86612bd2abefc6fa&redirect_uri=http%3A%2F%2Fev-easy.com%2Fwechat%2F%3Fdebug%3Dtrue%26clientId%3Dzz' +'%26invitedBy%3D' + code + '&response_type=code&scope=snsapi_base#wechat_redirect';
                    //var imgUrl = 'http://ev-easy.com/wechat/img/dcgj/dcgj_logo.jpeg';
                    var imgUrl = 'http://ev-easy.com/wechat/img/dcgj/dcgj_logo2.png';
                    console.log(link)

                    wx.sharePage(title,desc,link,imgUrl);
                }

            }
            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.initWxInfo();
            });
        }
]);