angular.module("app", ['dndLists', 'rzModule']).controller("SimpleDemoController", function ($scope, $http) {

    $scope.models = {
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