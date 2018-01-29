angular.module("app", ['dndLists']).controller("SimpleDemoController", function ($scope, $http) {

    $scope.models = {
        selected: [],
        lists: { "available": [], "active": []}
    };


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

    // Model to JSON for demo purpose
    $scope.$watch('models', function (model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);

});