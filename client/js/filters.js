
CarApp.filter('mileage', function() {
  return function(input) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
})

//http://stackoverflow.com/questions/11873570/angularjs-for-loop-with-numbers-ranges
CarApp.filter('range', function() {
  return function(input) {
      var lowBound, highBound;
      switch (input.length) {
      case 1:
          lowBound = 0;
          highBound = parseInt(input[0]) - 1;
          break;
      case 2:
          lowBound = parseInt(input[0]);
          highBound = parseInt(input[1]);
          break;
      default:
          return input;
      }
      var result = [];
      for (var i = lowBound; i <= highBound; i++)
          result.push(i);
      return result;
  };
})

