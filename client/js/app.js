
var CarApp = angular.module('CarApp', ['ngRoute', 'ngResource', 'angularFileUpload'])

CarApp.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {controller: ListCtrl, templateUrl: '/partials/list.html'}) 
    .when('/edit/:_id', {controller: EditCtrl, templateUrl: '/partials/details.html'})
    .when('/new', {controller: CreateCtrl, templateUrl: '/partials/details.html'})
    .otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true)
})

CarApp.factory('CarsService', function($resource) {
  return $resource('/api/cars/:_id', {_id: '@_id'}, {update: {method: 'PUT'}})
})

