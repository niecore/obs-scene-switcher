angular.module("app", ['dndLists', 'rzModule']).controller("SimpleDemoController", function ($scope, $http) {

    $scope.models = {
        connectedToObs: false,
        conntectedToTwitch: false,
        selected: [],
        lists: { "available": [], "active": []}
    };

    $scope.slider = {
      value: 60,
      options: {
        floor: 30,
        ceil: 90,
        onEnd: function(sliderId, modelValue, highValue, pointerType) {
           $http.put("/api/interval", { 'interval': modelValue * 1000 }).success(function(result) {
                // no action
           }).error(function() {
               console.log("Put Interval Error");
           });
        }
      }
    }   

  // Function to get the data
  $scope.getData = function(){
    $http.get("/api/available")
        .success(function(data) {
            $scope.models.lists.available = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
    });

    $http.get("/api/active")
        .success(function(data) {
            $scope.models.lists.active = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
    });
 
    $http.get("/api/interval")
        .success(function(data) {
            $scope.slider. value = data / 1000;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
    });

    $http.get("/api/connectionStatus")
        .success(function(data) {
            $scope.models.connectedToObs = data.connectedToObs;
            $scope.models.conntectedToTwitch = data.conntectedToTwitch;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
    });         
  };

  $scope.getData();

  // Run function every second
  setInterval($scope.getData, 1000);     

    // Model to JSON for demo purpose
    $scope.$watch('models', function(model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);



    $scope.toggle = function(list, item) {
       var retval = true;
       $http.put("/api/toggle", { 'toggle': item }).success(function(result) {
           console.log(result);
       }).error(function() {
           console.log("Put Toggle Error");
           retval = false;
       });

        // Return false here to cancel drop. Return true if you insert the item yourself.
        return retval;
    };
});