var myApp = angular.module('myApp');

myApp.controller('searchController', function ($scope) {
    $scope.query = null;
    
    $scope.resultQuery = null;
    
    $scope.results = null;
    
    $scope.resultVisibility = false;
    
    $scope.loadingVisible = false;
    
    $scope.followingId = [];

    $scope.followingUsers = [];

    $scope.filterUserName = null;

    $scope.sinceId =  null;

    $scope.cb = null;

    $scope.postQuantity = 31;

    $scope.loadingStatus = "No more tweets to load";

    $scope.errorStatus = "Loading lasts longer than usual... Check your's Internet connection, please.";

    $scope.lockScroll = false;

    $scope.timer = null;

    $scope.errorVisible = false;

    $scope.draggingSreenName = null;

    $scope.draggingToAdd = null;

    $scope.pic = null;

    $scope.isChrome = null;

    $scope.isFirefox = null;

    $scope.isExplorer = null;


    $scope.track = 0;

    //
    // Save subscriptions to local storage
    //
    $scope.saveFollowings = function () {
        localStorage.setItem('followScreenName', JSON.stringify($scope.followingId));
        localStorage.setItem('followUsers', JSON.stringify($scope.followingUsers));
    };

    //
    // Load subscriptions from local storage and apply them
    //
    $scope.loadFollowings = function () {
        var localStorageNames = JSON.parse(localStorage.getItem('followScreenName'));
        var localStorageUsers = JSON.parse(localStorage.getItem('followUsers'));
        if(localStorageNames != null && localStorageUsers != null) {
            $scope.followingId = localStorageNames;
            $scope.followingUsers = localStorageUsers;
            // $scope.refreshFollowing();
        }
    };

    //
    // Checks if element exists within an array
    //
    $scope.contains = function (value, array) {
        return array.indexOf(value) > -1;
    };

    //
    // Adds or removes user's ID to list of subscription
    // (depending on it presence in the existing subscriptions)
    //
    $scope.subscribeUnsubsribeUser = function (screenName) {
        if(!$scope.contains(screenName, $scope.followingId)){
            $scope.follow(screenName);
        }
        else {
            var userIndex = $scope.followingId.indexOf(screenName);
            $scope.unfollow(userIndex);
        }
        // $scope.refreshFollowing();
    };

    //
    // Attemps only to subscribe on user
    //
    $scope.subsctibeUser = function (screenName) {
        if(!$scope.contains(screenName, $scope.followingId)){
            $scope.follow(screenName);
        }
    };

    //
    // Attemps only to unsubscribe from user
    //
    $scope.unsubscribeUser = function (screenName) {
        if($scope.contains(screenName, $scope.followingId)){
            var userIndex = $scope.followingId.indexOf(screenName);
            $scope.unfollow(userIndex);
        }
    };


    //
    // Refreshes followingUsers depending on followingId array elements
    //
    $scope.refreshFollowing = function () {
        var arrayLength = $scope.followingId.length;

        $scope.followingUsers = [];

        for(var i = 0; i < arrayLength; i++){
            $scope.follow($scope.followingId[i]);
        }
    };

    //
    // Find user and add it
    //
    $scope.follow = function (screenName) {
        $scope.followingId.push(screenName);
        $scope.getCodeBird().__call( 'users_show',
            {
                screen_name : screenName
            },
            function (data) {
                if(data.screen_name==null || data.screen_name==''){
                    data.screen_name = "Undefinied user";
                }
                $scope.followingUsers.push(data);
                $scope.$apply();
                $scope.saveFollowings();
            },
            true
        );
    };

    //
    // Removes user from specified position in existing array
    //
    $scope.unfollow = function (userIndex) {
        $scope.followingId.splice(userIndex,1);
        $scope.followingUsers.splice(userIndex,1);
        $scope.saveFollowings();
    }

    //
    // Gets date of tweet created in string format
    //
    $scope.dateSubString = function (twitterDate) {
        return twitterDate.substr(4,7);
    };

    //
    // Returns search page to it default state
    //
    $scope.resetSearch = function () {
        $scope.resultVisibility = false;
        $scope.query = '';
    };

    //
    // Gets tweets specified by query
    //
    $scope.getTweets = function () {
        if($scope.query=='' || $scope.query==null){
            return;
        }

        $scope.resultVisibility = false;
        $scope.resultQuery = $scope.query;
        $scope.loadingVisible = true;
        $scope.filterUserName = null;

        $scope.timer = setTimeout($scope.notifyAboutError, 1500);
        $scope.getCodeBird().__call( 'search_tweets',
            {
                q : $scope.query,
                count: $scope.postQuantity
            },
            function (data) {
                $scope.loadData(data);
            },
            true
        );
    };

    //
    // Gets tweets from by user
    //
    $scope.getTweetsFiltered = function (userScreenName) {
        $scope.lockScroll = true;
        $scope.filterUserName = userScreenName;
        $scope.query = userScreenName;
        $scope.resultQuery = "@"+userScreenName;
        $scope.resultVisibility = false;
        $scope.loadingVisible = true;

        console.log($scope.query);

        $scope.timer = setTimeout($scope.notifyAboutError, 1500);
        $scope.getCodeBird().__call( 'search_tweets',
            {
                q: "",
                from: $scope.query,
                count: $scope.postQuantity
            },
            function (data){
                $scope.loadData(data);
            },
            true
        );
    };

    //
    // Notifies user about error
    //
    $scope.notifyAboutError = function () {
        $scope.errorVisible = true;
    };

    //
    // Appends tweets to timeline
    //
    $scope.getMoreTweets = function () {
        if($scope.sinceId==null)
        {
            return;
        }

        $scope.resultQuery = $scope.query;

        if($scope.filterUserName != null){
            $scope.timer = setTimeout($scope.notifyAboutError, 1500);
            $scope.getCodeBird().__call( 'search_tweets',
                {
                    q : "",
                    max_id: $scope.sinceId,
                    from: $scope.filterUserName,
                    count: $scope.postQuantity
                },
                function (data) {
                    $scope.appendData(data);
                },
                true
            );
            return;
        }
        $scope.timer = setTimeout($scope.notifyAboutError, 1500);
        $scope.getCodeBird().__call( 'search_tweets',
            {
                q : $scope.query,
                max_id: $scope.sinceId,
                count: $scope.postQuantity
            },
            function (data) {
                $scope.appendData(data);
            },
            true
        );
    };

    //
    // Assigns data to $scope binding object instance
    //
    $scope.loadData = function(data){
        clearTimeout($scope.timer);
        $scope.errorVisible = false;
        var indexOfLast = data.statuses.length;
        if(indexOfLast==0){
            $scope.results=[];
            $scope.resultVisibility = true;
            $scope.loadingVisible = false;
            $scope.$apply();
            $scope.lockScroll = false;
            return;
        }
        $scope.sinceId = data.statuses[indexOfLast-1].id;
        $scope.results = [];
        $scope.results = $scope.trimDataLast(data);

        $scope.resultVisibility = true;
        $scope.lockScroll = false;
        $scope.$apply();

        console.log($scope.results);

    };

    //
    // Appends data to existing $scope binding object instance
    //
    $scope.appendData = function (data) {
        clearTimeout($scope.timer);
        $scope.errorVisible = false;
        if(data.statuses == null || data.statuses.length <= 0 ||
            data.statuses[0].id == $scope.results.statuses[$scope.results.statuses.length-1].id)
        {
            $scope.loadingVisible = false;
            $scope.$apply();
            return;
        }
        var indexOfLast = data.statuses.length;
        $scope.sinceId = data.statuses[indexOfLast-1].id;
        $scope.results.statuses = $scope.results.statuses.concat($scope.trimDataLast(data).statuses);

        $scope.$apply();
        console.log($scope.results);
    };

    //
    // Returns tweets data object instance without last element in statuses array
    //
    $scope.trimDataLast = function (data) {
        var result = data;
        if(data != null && data.statuses.length > $scope.postQuantity-1){
            result.statuses.pop();
        }
        return result;
    };

    //
    // Returns Codebird object instance
    //
    $scope.getCodeBird = function () {
        if($scope.cb == null) {
            cb = new Codebird;
            cb.setConsumerKey("4CuwV2O3QVMnk6Q9vq42CqV3s", "sum9JBwwA0gLwzWI4x6BcaBOQJbPAsC64A0A2hBKRxMqbWFVc6");
            cb.setToken("739796828720226308-EsiVNJA4Noti0X8BDB26SS3uKQ75Jn6", "OjQpCciR7Tuw80Z5HGGZLUztauKnebSEcb7IGSur39BsG");
        }
        return cb;
    };

    //
    // Occurs when user drags element
    //
    $scope.drag = function (e, screen_name, draggingPurpose) {
        $scope.removePic();

        $scope.pic = e.target.cloneNode(true);

        var coords = e.target.getBoundingClientRect();
        var shiftX = e.clientX - coords.left;
        var shiftY = e.clientY - coords.top;

        $scope.pic.style.position = 'absolute';
        $scope.pic.style.opacity = 0.8;

        $scope.pic.style.zIndex = 10000000;
        $scope.pic.style.pointerEvents = 'none';

        function moveAt(e) {
            document.body.appendChild($scope.pic);
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            $scope.pic.style.left = e.clientX - shiftX + 'px';
            $scope.pic.style.top = e.clientY - shiftY + scrollTop + 'px';
        }

        document.onmousemove = function(e) {
            if($scope.pic!=null){
                moveAt(e);
            }
        };

        document.onmouseup = function (e) {
            $scope.removePic();
        };


        $scope.draggingToAdd = draggingPurpose;
        $scope.draggingScreenName = screen_name;

        console.log($scope.draggingScreenName + " dragging");
    };

    //
    // Occurs when user drops element
    //
    $scope.drop = function (add) {
        console.log($scope.draggingScreenName + " dropping");
        $scope.removePic();
        if($scope.draggingScreenName != null)
        {
            if(add){
                $scope.subsctibeUser($scope.draggingScreenName);
            }else{
                if(!$scope.draggingToAdd){
                    $scope.unsubscribeUser($scope.draggingScreenName);
                }
            }
            $scope.draggingScreenName = null;
        }
    };

    //
    // Removes picture from body child nodes
    //
    $scope.removePic = function () {
        if($scope.pic!=null)
        {
            try {
                document.body.removeChild($scope.pic);
                $scope.pic = null;
            }
            catch (e) {
                $scope.pic=null;
            }

        }
    };

    //
    // Determines browser
    //
    $scope.determineBrowser = function () {
        $scope.isChrome = !!window.chrome && !!window.chrome.webstore;
        $scope.isFirefox = typeof InstallTrigger !== 'undefined';
        $scope.isExplorer = /*@cc_on!@*/!!document.documentMode;
    };

    $scope.determineBrowser();
});

myApp.directive('whenScrollEnds', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var raw;
            if (!scope.isChrome) {
                if (scope.isFirefox) {
                    raw = document.documentElement;
                }
            } else {
                raw = element[0];
            }

            $(window).scroll(function() {

                if (raw.scrollTop + raw.offsetHeight === raw.scrollHeight && scope.lockScroll==false) {
                    scope.$apply(attrs.whenScrollEnds);
                }
            });
        }
    };
});
