

function CreateCtrl ($scope, $location, CarsService) {
  $scope.action = 'Add'
  $scope.save = function() {
    CarsService.save($scope.car, function() {
      $location.path('/')
    })
  }  
}

function ListCtrl ($scope, $http, CarsService) {
  var index = -1;

  //for pagination and searching
  $scope.limit = 25
  $scope.offset = 0 //this is the same as: (current page - 1)
  $scope.total = 0
  $scope.pageCount = 0

  $scope.cars = CarsService.query()

  $scope.index = index; //currently selected element
  $scope.selectedId = -1; //actual id of selected car

  $http.get('/api/cars/total').success(function(body) {
    $scope.total = body.total
    $scope.pageCount = Math.floor($scope.total / $scope.limit) 
    if ($scope.total % $scope.limit !== 0)
      $scope.pageCount += 1
  })


  $scope.select = function(i) {
    $scope.index = index
    index = i
    $scope.selectedId = $scope.cars[index]._id
  }

  $scope.delete = function() {
    if (index >= 0) {
      CarsService.delete({_id: $scope.cars[index]._id})
      $scope.cars.splice(index, 1)
    }
  }

  $scope.loadPage = function (pg) {
    $scope.offset = pg - 1
    $scope.cars = CarsService.query({offset: $scope.offset, limit: $scope.limit})
  }

}

function EditCtrl ($scope, $location, $routeParams, CarsService) {
  var _id = $routeParams._id;
  CarsService.get({_id: _id}, function(resp) {
    $scope.car = resp.content  
  })
  $scope.action = "Update"


  $scope.save = function() {
    CarsService.update({_id: _id}, $scope.car, function() {
      $location.path('/')
    })
  }
}

