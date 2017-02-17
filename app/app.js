var myBetApp = angular.module('myBetApp',[]);

myBetApp.controller('pollsController',['$scope','$http', function($scope, $http){

// Initialization
  // Ticket cost
  $scope.totalAmount = 0;
  // Number of lines
  $scope.totalLines = 0;
  // Stake options
  $scope.options = [{
                      id: 2,
                      label: '£2.00'
                    }, {
                      id: 1,
                      label: '£1.00'
                    }, {
                      id: 0.5,
                      label: '£0.50'
                    }, {
                      id: 0.2,
                      label: '£0.20'
                    }];
  // Seleccted options : first by default
  $scope.selectedOption = $scope.options[0];
  // List of selected selections to make quick ckeck
  $scope.selectedSelectionsId = [];
  // List of selected Selections within their leg. Value to send back through API
  $scope.selectedLegsId = [];

  // Get the list of pools from the API
  $http.get('https://colossusdevtest.herokuapp.com/api/pools.json')
  .then(
    // Success
    function(result){
      $scope.groups = result.data;
      // display dtals of the first pool of the list
      var i = 0;
      var found = false;
      do{
        if($scope.groups[i].pools.length > 0) {
          $scope.updatePool($scope.groups[i].pools[0].id);
          found = true;
        }
        i++;
      }
      while (i<$scope.groups.length && !found);
    },
    // Error
    function(data){
      console.error("API Error :" + angular.toJson(data));
    });

    // Update Pool Details
    $scope.updatePool = function (idPool){
      // Get Pool Details from the API
      var link = 'https://colossusdevtest.herokuapp.com/api/pools/'+idPool+'.json';
      console.log("link : " + link);
      $http.get(link)
      .then(
        // Success
        function(result){
          $scope.clearSelection();
          $scope.selectedPool = result.data;
        },
        // Error
        function(data){
          console.error("API pool : error");
        });
    };

    // Clear the user selection
    $scope.clearSelection = function(legId,selectionId) {
      $scope.selectedLegsId = [];
      $scope.selectedSelectionsId =[];
      $scope.totalLines = 0;
    };
    // Update the user selections
    $scope.updateSelection = function(legId,selectionId) {
      if(!$scope.isSelected(selectionId)){
        var legFound = false;

        angular.forEach($scope.selectedLegsId, function(value, key) {
          if(value.legId === legId){
            legFound = true;

            if(value.selections.indexOf(selectionId) === -1){
              value.selections.push({selectionId: selectionId});
              $scope.selectedSelectionsId.push(selectionId);

            }
          }
        });
        // if the leg is not already selected, we add it to the selections with the selection
        if(!legFound){
          $scope.selectedLegsId.push({
                             legId: legId,
                             selections:[{selectionId: "\'"+selectionId+"\'"}]
                         });
          $scope.selectedSelectionsId.push(selectionId);
        }
        console.log('  $scope.selectedLegsId'+  angular.toJson($scope.selectedLegsId));
      }
      else{ // If selectionId is already selected
        // Remove from selectedSelectionsId
        var index = $scope.selectedSelectionsId.indexOf(selectionId);
        $scope.selectedSelectionsId.splice(index, 1);
        // remove from result
        angular.forEach($scope.selectedLegsId, function(value, key) {
          if(value.legId === legId){
            legFound = true;
            // Remove the leg if this is le last Selection to remove
            if (value.selections.length <= 1){
              $scope.selectedLegsId.splice(key, 1);
            }
            // Remove the selection
            else{
              index = value.selections.indexOf(selectionId);
              value.selections.splice(index, 1);
            }
          }
        });
        //console.log('remove;  $scope.selectedLegsId'+  angular.toJson($scope.selectedLegsId));
      }
      // Calculate Lines
      if($scope.selectedLegsId.length >= 1){ // if there is at least one selection selected
        var lines = 1;
        angular.forEach($scope.selectedLegsId, function(value, key) {
          lines *= value.selections.length;
        });
        $scope.totalLines = lines;
      }
      else{ // if there is no selection
        $scope.totalLines = 0;
      }

    };
    // return true if the selection is selected
    $scope.isSelected = function(selectionId) {
      return $scope.selectedSelectionsId.indexOf(selectionId) !== -1;
    }
    // Send the ticket through the API
    $scope.validateSelection = function(){
      // Creation of the ticket to send
      var tickets = {
        "sendBy:" : "Huu Tri Tran",
        "total_lines": $scope.totalLines,
        "cost": $scope.totalAmount,
        "selectionId": $scope.selectedLegsId
      };
      console.log("tickets : " + JSON.stringify(tickets));
      // Send object thorought the API, but The link seems wrong...
      $http.post('https://colossusdevtest.herokuapp.com/api/', JSON.stringify(tickets), {headers: {'Content-Type': 'application/json'}})
        .then(
          // Success
          function(result){
            //$scope.groups = result.data;
            console.log("API post result : " + JSON.stringify(result));
            alert('Thank you! ');
          },
          // Error
          function(result){
            console.error("API post error :" + JSON.stringify(result));
            alert('Oh no! something happened!\nstatus : '+result.status+'\n error : ' +result.statusText+' \n'+result.data+'\n' +JSON.stringify(result));
          });

    };
}]);
