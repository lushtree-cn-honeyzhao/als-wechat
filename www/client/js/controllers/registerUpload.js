
/**
 *
 *资料认证
 */

angular.module('app.controllers').controller('RegisterUploadController',
    ['$scope', 'app.api.http', '$location','wx','$ionicPopup','$state','Storage','loginWithCode','$stateParams','$rootScope','ENV',
    function ($scope, http, $location,wx,$ionicPopup,$state,Storage,loginWithCode,$stateParams,$rootScope,ENV) {

        var model = $scope.model = {
            user:{
                idImg:'img/peoplePhotoUpload.png',
                driversImg:'img/driverPhotoUpload.png'
            },
            uploadType:'',
            approveFlag:true/*等于true是可以上传的*/
        }

        function imgReplace(data){
            if(data.user.idImg){
                data.user.idImg = ENV.api+http.withAutoCode(data.user.idImg)
            }
            if(data.user.driversImg){
                data.user.driversImg = ENV.api+http.withAutoCode(data.user.driversImg)
            }
        }

        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.initData();
        });

        $scope.initData = function(){
            model.uploadType = $stateParams.uploadType
            http.get('userGetUserInfo').success(function(data, status, headers, config) {
                if(data.status > 0){
                    imgReplace(data)
                    model.user = data.user;
                    console.log('userGetUserInfo:'+JSON.stringify(model.user))
                    //-1:待上传证件 0审核中 1 已通过 2 未审核通过
                    //model.approveFlag=true
                    if(model.user.approveStatus ==-1 || model.user.approveStatus==2){
                        model.approveFlag=true
                    }
                    if(model.user.approveStatus==1 || model.user.approveStatus==0){
                        model.approveFlag=false
                    }
                }
            })
    }

    $scope.upload = function (what) {
        if(!model.approveFlag) return
        wx.uploadImg(what,function(url){//成功
            if(what=='peoplePhoto'){
                model.user.idImg =ENV.api+http.withAutoCode(url)
                console.log('路径为:'+model.user.idImg)
            }else if(what=='driverPhoto'){
                model.user.driversImg =ENV.api+http.withAutoCode(url)
                console.log('路径为:'+model.user.driversImg)
            }else if (what== 'headImg'){
                model.user.headImg =ENV.api+http.withAutoCode(url)
                console.log('路径为:'+model.user.headImg)
            }
        },function(){//失败
            $ionicPopup.alert({
                title: '提示',
                template: "图片上传失败，请稍后再试",
                okText: '确定'
            })
        })
    }

    $scope.OnSavedriversLicense = function(){
        var paramData =  {driversLicense: model.user.driversLicense}
        http.post('savedriversLicense',paramData).success(function(data, status, headers, config) {
            if (data.status > 0) {
                $ionicPopup.alert({
                    title: '提示',
                    template: "提交成功！我们会在半小时之内审核您的证件，请您耐心等待。",
                    okText: '确定'
                }).then(function(){
                    $rootScope.go_url('tabs.home');
                })
            } else if (data.status <= 0) {
                $ionicPopup.alert({
                    title: '提示',
                    template: data.message,
                    okText: '确定'
                })
            }
        });
    }




}]);
