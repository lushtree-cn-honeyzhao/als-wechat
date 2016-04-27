/**
 * Created by cc on 15-8-9.
 */
angular.module('app.services').factory('wx',
    ['app.api.http', '$ionicPopup', 'Storage','$rootScope',
        function (http, $ionicPopup, Storage,$rootScope) {
            var debug = false;
            var wxObj = null;
            var apiList = [
                "onMenuShareTimeline",
                "onMenuShareAppMessage",
                "onMenuShareQQ",
                "onMenuShareWeibo",
                "startRecord",
                "stopRecord",
                "onVoiceRecordEnd",
                "playVoice",
                "pauseVoice",
                "stopVoice",
                "onVoicePlayEnd",
                "uploadVoice",
                "downloadVoice",
                "chooseImage",
                "previewImage",
                "uploadImage",
                "downloadImage",
                "translateVoice",
                "getNetworkType",
                "openLocation",
                "getLocation",
                "hideOptionMenu",
                "showOptionMenu",
                "hideMenuItems",
                "showMenuItems",
                "hideAllNonBaseMenuItem",
                "showAllNonBaseMenuItem",
                "closeWindow",
                "scanQRCode",
                "chooseWXPay",
                "openProductSpecificView",
                "addCard",
                "chooseCard",
                "openCard"
            ];

            //var availableApi = null
            //wx.checkJsApi({
            //    jsApiList: apiList, // 需要检测的JS接口列表，所有JS接口列表见附录2,
            //    success: function(res) {
            //        // 以键值对的形式返回，可用的api值true，不可用为false
            //        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
            //        if(res.errMsg == 'checkJsApi:ok'){
            //            availableApi = res.checkResult
            //        }
            //    }
            //});
            /**
             * 传入一个function,参数为配置好的wx对象
             * 可以直接使用
             * @param fn
             */
            function run(fn,error) {
                if (wxObj != null) {
                    fn(wxObj)
                } else {
                    http.post('getSignature', {
                        //url: window.location.origin + window.location.pathname
                        url: window.location.href.split('#')[0]
                    }).success(function (data) {
                        if (data.status == 200) {
                            wx.error(function(res){
                                if (angular.isFunction(error)) {
                                    error(res)
                                }else{
                                    $ionicPopup.alert({
                                        template: '微信JS配置失败<br>'+JSON.stringify(res),
                                        okText: '确定'
                                    })
                                }
                            })
                            wx.ready(function () {
                                if (angular.isFunction(fn)) {
                                    wxObj = wx
                                    fn(wx)
                                }
                            })
                            wx.config({
                                debug: debug,
                                appId: data.js.appId,
                                timestamp: data.js.timestamp,
                                nonceStr: data.js.nonceStr,
                                signature: data.js.signature,
                                jsApiList: apiList
                            });
                        } else {
                            $ionicPopup.alert({
                                template: '不存在的jsApi',
                                okText: '确定'
                            })
                        }
                    });
                }
            }

            //通知服务器上传成功
            function notifyDownload(serverId, what,success,fail) {
                http.post('downloadPhoto', {
                    serverId: serverId,
                    type: what
                }).success(function (data) {
                    if (data.status == 200) {
                        success(data.imgUrl)
                        //if(what=='peoplePhoto'){
                        //    $rootScope._USER.idImg =data.imgUrl
                        //
                        //}else if(what=='driverPhoto'){
                        //    $rootScope._USER.driversImg =data.imgUrl
                        //}else if (what== 'headImg'){
                        //    $rootScope._USER.headImg =data.imgUrl
                        //}
                        /*$ionicPopup.alert({
                            template: '上传成功',
                            okText: '确定'
                        })*/
                        console.log("上传成功")
                    } else {
                        fail()
                        $ionicPopup.alert({
                            template: '上传失败',
                            okText: '确定'
                        })
                        console.log("上传失败")
                    }
                })
            }

            //上传图片
            function uploadImage(what,success,fail) {
                var images = {
                    localId: [],
                    serverId: []
                };
                //上传图片
                function upload(wx, i, length) {
                    wx.uploadImage({
                        localId: images.localId[i],
                        success: function (res) {
                            i++;
                            //alert('已上传：' + i + '/' + length);
                            images.serverId.push(res.serverId);
                            notifyDownload(res.serverId, what,success,fail)
                            if (i < length) {
                                upload(wx, i, length);
                            }
                        },
                        fail: function (res) {
                            alert('上传图片失败');
                        }
                    });
                }

                //选择图片
                run(function (wx) {
                    wx.chooseImage({
                        success: function (res) {
                            images.localId = res.localIds;
                            if (images.localId.length == 0) {
                                alert('请先使用 chooseImage 接口选择图片');
                                return;
                            }
                            var i = 0, length = images.localId.length;
                            upload(wx, i, length);
                        },
                        fail: function (res) {
                            alert('选择图片失败' + JSON.stringify(res));
                        }
                    });
                })
            }

            //分享
            function wechatShare(shareData){
                run(function (wx) {
                    wx.onMenuShareAppMessage(shareData);
                    wx.onMenuShareTimeline(shareData);
                    wx.onMenuShareQQ(shareData);
                    wx.onMenuShareWeibo(shareData);
                })
            }

            return {
                wx: function (wx,error) {
                    run(wx,error)
                },
                uploadImg: function (what,success,fail) {
                    uploadImage(what,success,fail)
                },
                sharePage: function (title,desc,link,imgUrl) {
                    var shareData = {
                        //title: "'"+title+"'",
                        //desc: "'"+desc+"'",
                        //link: "'"+link+"'",
                        //imgUrl: "'"+imgUrl+"'",
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function(){
                        }
                    }
                    wechatShare(shareData)
                }
            }

        }]);

