

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
  $scope.limit = 25;
  $scope.offset = 0; //this is the same as: (current page - 1)
  $scope.total = 0;
  $scope.pageCount = 0;
  $scope.sortColumn = "title";
  $scope.sortReverse = false;
  $scope.search = "";

  $scope.cars = CarsService.query();

  $scope.index = index; //currently selected element
  $scope.selectedId = -1; //actual id of selected car

  function loadPageNumber() {
    $http.get('/api/cars/total',{params: {search: $scope.search}}).success(function(body) {
        $scope.total = body.total;
        $scope.pageCount = Math.floor($scope.total / $scope.limit);
        if ($scope.total % $scope.limit !== 0)
        $scope.pageCount += 1;
    });
  }

  loadPageNumber();

  $scope.select = function(i) {
    $scope.index = index;
    index = i;
    $scope.selectedId = $scope.cars[index]._id;
  }

  $scope.delete = function(index) {
    if (index >= 0) {
      CarsService.delete({_id: $scope.cars[index]._id});
      $scope.cars.splice(index, 1);
    }
  }

  $scope.onChangeSearch = function() {
    loadPageNumber();
    $scope.loadPage($scope.offset + 1); // reload
  }

  $scope.sortBy = function(sortBy) {
    $scope.sortReverse = $scope.sortColumn == sortBy ? !$scope.sortReverse : false;
    $scope.sortColumn = sortBy;
    $scope.loadPage($scope.offset + 1); // reload
  }

  $scope.loadPage = function (pg) {
    $scope.offset = pg - 1;
    $scope.cars = CarsService.query({offset: $scope.offset, limit: $scope.limit, orderBy: $scope.sortColumn, reverse: $scope.sortReverse, search: $scope.search});
  }

}


function EditCtrl ($scope, $upload, $location, $routeParams, CarsService) {
  var _id = $routeParams._id;

  CarsService.get({_id: _id}, function(resp) {
    $scope.car = resp.content;
    $scope.car.imgUploadId = null;
  })

  $scope.action = "Update";

  $scope.save = function() {
    CarsService.update({_id: _id}, $scope.car, function() {
      $location.path('/');
    })
  }

  $scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      //console.log(file);
      //console.log($upload);
      $scope.upload = $upload.upload({
        url: '/api/cars/upload', //upload.php script, node.js route, or servlet url
        // method: POST or PUT,
        // headers: {'headerKey': 'headerValue'}, withCredential: true,
        //data: {myObj: $scope.myModelObj},
        headers: {},
        file: file,
        // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
        //fileFormDataName: myFile,
        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
        //formDataAppender: function(formData, key, val){} 
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log("success");
        console.log(data);
        $scope.car.imgUploadId = data.imgUploadId;
      });
      //.error(...)
      //.then(success, error, progress); 
    }
  };

}

