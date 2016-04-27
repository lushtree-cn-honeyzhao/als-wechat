'use strict';

angular.module('app.controllers').controller('MessagesController', ['$scope', 'app.api.http', '$timeout', '$ionicPopup','$stateParams',
    function ($scope, http, $timeout, $ionicPopup, $stateParams) {
        $scope.from = $stateParams.from;
        $scope.items = [];
        $scope.hasMoreData = false;

        $scope.moreDataCanBeLoaded = function () {
            return $scope.hasMoreData;
        }

        $scope.readMsg = function(item){
            $ionicPopup.alert({
                title: item.title,
                template: item.content,
                okText: '确定'
            });
        }
        $scope.doRefresh = function () {
            $scope.hasMoreData = false;
            $scope.items = [];
            _loadMoreItems();
        }

        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.doRefresh();
        });

        $scope.loadMoreItems = function(){
            _loadMoreItems();
        }

        function _loadMoreItems() {

            var start = $scope.items.length;

            http.get('currentUserMessage', {
                start: start,
                length: 10
            }).success(function (response) {

                angular.forEach(response.data, function (element) {
                    //$scope.items.unshift(element);
                    $scope.items.push(element);
                    $scope.hasMoreData = true;
                });

                console.log("response.data.length:" + response.data.length)

                $scope.hasMoreData = response.data.length > 0;

            });

            $scope.$broadcast('scroll.infiniteScrollComplete');

        };

    }]);
