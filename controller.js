var app = angular.module('myApp', ['ui.router']);


app.config(function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/setup");

    $stateProvider
        .state('index', {
            url: "/index",
            templateUrl: "/html/index.html",
            controller: function($scope, $http){
                $scope.dataArr = $scope.$parent.arr;
                $scope.title = $scope.$parent.title;
            }
        })
});

app.controller('MainCtrl',['$scope', '$http', '$state', function($scope, $http, $state){
    $scope.arr = window.arr;
    $scope.title = window.title;
}]);