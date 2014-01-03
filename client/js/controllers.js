
function ListCtrl($scope, $rootScope, $location, $http, CarsService) {
  var index = -1; // selected item index

  //for pagination and searching
  $scope.limit = 25;
  $scope.total = 0;
  $scope.pageCount = 0;
  $scope.page = Number(($location.search()).page) || 1;
  $scope.sortColumn = ($location.search()).sortBy || "title";
  $scope.sortReverse = ($location.search()).reverse == "1";
  $scope.search = ($location.search()).search || "";

  $scope.cars = null;

  $scope.index = index; //currently selected element
  $scope.selectedId = -1; //actual id of selected car

  /** Reload the current page */
  function reload() {
    // Load the number of pages
    $http.get('/api/cars/total',{params: {search: $scope.search}}).success(function(body) {
        $scope.total = body.total;
        $scope.pageCount = Math.floor($scope.total / $scope.limit);
        if ($scope.total % $scope.limit !== 0)
            $scope.pageCount += 1;
        if ($scope.page > $scope.pageCount)
            $scope.page = $scope.pageCount;
        if ($scope.page < 1)
            $scope.page = 1;
        // Load the current page
        $scope.loadPage($scope.page);
    });
  }

  /** Select an item */
  $scope.select = function(i) {
    $scope.index = index;
    index = i;
    $scope.selectedId = $scope.cars[index]._id;
  }

  /** Delete an item */
  $scope.delete = function(index) {
    if (index >= 0) {
      CarsService.delete({_id: $scope.cars[index]._id});
      $scope.cars.splice(index, 1);
    }
  }

  /** Triggered when the search string is changed */
  $scope.onChangeSearch = function() {
    reload();
  }

  /** Change sort direction */
  $scope.sortBy = function(sortBy) {
    $scope.sortReverse = $scope.sortColumn == sortBy ? !$scope.sortReverse : false;
    $scope.sortColumn = sortBy;
    reload();
  }

  /** Load a page */
  $scope.loadPage = function(page) {
    index = -1;
    $scope.index = index;
    $scope.page = page;
    $scope.cars = CarsService.query({offset: $scope.page - 1, limit: $scope.limit, orderBy: $scope.sortColumn, reverse: $scope.sortReverse, search: $scope.search});
    // Set the page parameters
    $location.search({search: $scope.search,
                      reverse: $scope.sortReverse ? "1" : "0",
                      sortBy: $scope.sortColumn,
                      page: $scope.page});
    if ($rootScope.navigationHistory == undefined)
        $rootScope.navigationHistory = [];
    $rootScope.navigationHistory.push($location.$$url);
    $rootScope.navigationHistory = $rootScope.navigationHistory.slice(-50);
  }

  $scope.$on('$routeChangeSuccess', function() {
    if ($rootScope.navigationHistory == undefined)
        $rootScope.navigationHistory = [];
    $rootScope.navigationHistory.push($location.$$url);
    $rootScope.navigationHistory = $rootScope.navigationHistory.slice(-50);
  });

  reload();

}


function EditCtrl($scope, $rootScope, $upload, $location, $routeParams, CarsService) {
  var _id;

  function back() {
    if ($rootScope.navigationHistory == undefined)
        $rootScope.navigationHistory = [];
    var prevUrl = $rootScope.navigationHistory.length > 1 ? $rootScope.navigationHistory.splice(-2)[0] : "/";
    $location.url(prevUrl);
  };

  /** Save (update or create) */
  $scope.save = function() {
    if (_id != null) { // update existing item
        CarsService.update({_id: _id}, $scope.car, function() {
            back();
        });
    } else { // create new item
        CarsService.save($scope.car, function() {
            back();
        });
    }
  }
 
  /** Cancel */
  $scope.cancel = function () {
    back();
  };

  /** File upload */
  $scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      //console.log(file);
      //console.log($upload);
      $scope.upload = $upload.upload({
        url: '/api/cars/upload',
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
    }
  };

  /** Init function */
  this.initialize = this.initialize || function () {
    // Load the item
    _id = $routeParams._id;
    CarsService.get({_id: _id}, function(resp) {
        $scope.car = resp.content;
        $scope.car.imgUploadId = null;
    });
    // Set the title
    $scope.action = "Update";
    // Trigger
    $scope.$on('$routeChangeSuccess', function() {
        if ($rootScope.navigationHistory == undefined)
            $rootScope.navigationHistory = [];
        $rootScope.navigationHistory.push($location.$$url);
        $rootScope.navigationHistory = $rootScope.navigationHistory.slice(-50);
    });
  }

  this.initialize();

}

function CreateCtrl($injector, $scope, $rootScope, $upload, $location, $routeParams, CarsService) {

  /** Init function */
  this.initialize = this.initialize || function () {
      _id = null;
      // Set the title
      $scope.action = 'Add';
  }

  // Inherits from the EditCtrl
  $injector.invoke(EditCtrl, this, {
    $scope: $scope,
    $rootScope: $rootScope,
    $upload: $upload,
    $location: $location,
    $routeParams: $routeParams,
    CarsService: CarsService
  });
  
}


