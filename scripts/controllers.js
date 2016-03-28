var app = angular.module('internalApp', ['ngCookies', 'ngRoute', 'ngSanitize']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: './views/login.html',
        controller: 'LoginController'
    });
    $routeProvider.when('/admin', {
        templateUrl: './views/admin.html',
        controller: 'AdminController'
    });
    $routeProvider.when('/editor', {
        templateUrl: './views/editor.html',
        controller: 'EditorController'
    });
    $routeProvider.when('/editor/uploaders', {
        templateUrl: './views/editor-uploaders.html',
        controller: 'EditorUploaderController'
    });
    $routeProvider.when('/editor/news', {
        templateUrl: './views/editor-news.html',
        controller: 'EditorNewsController'
    });
    $routeProvider.when('/editor/news/edit', {
        templateUrl: './views/editor-news-edit.html',
        controller: 'EditorNewsEditController'
    });
    $routeProvider.when('/editor/quiz/:type', {
        templateUrl: './views/editor-quiz.html',
        controller: 'EditorQuizController'
    });
    $routeProvider.when('/editor/quiz/:type/:id', {
        templateUrl: './views/editor-quiz-questions.html',
        controller: 'EditorQuizQuestionsController'
    });
    $routeProvider.when('/editor/quiz/:type/question/:id', {
        templateUrl: './views/editor-quiz-question-edit.html',
        controller: 'EditorQuizQuestionEditController'
    });
    $routeProvider.when('/uploader', {
        templateUrl: './views/uploader.html',
        controller: 'UploaderController'
    });
    $routeProvider.when('/uploader/news/update', {
        templateUrl: './views/uploader-news-update.html',
        controller: 'UploaderNewsUpdateController'
    });
    $routeProvider.when('/uploader/quiz/home/:type', {
        templateUrl: './views/uploader-quiz.html',
        controller: 'UploaderQuizController'
    });
    $routeProvider.when('/uploader/quiz/:mode/:type', {
        templateUrl: './views/uploader-quiz-office.html',
        controller: 'UploaderQuizOfficeController'
    });
    $routeProvider.when('/', {
        
    });
    $routeProvider.otherwise({
        redirectTo: '/uploader'
    });
}]);


app.constant('domainName', ' https://prod.api.preppo.in');

app.constant('contentTypes', ['News' , 'News Quiz', 'Content', 'Content Quiz']);

app.factory('categoryConstants', function() {
    var exams = ['PO', 'Clerk', 'SSC'];
    var subjects = {
        '': [],
        'PO': ['English', 'Quantitative Aptitude', 'Reasoning Ability'],
        'Clerk': ['English', 'Quantitative Aptitude', 'Reasoning Ability'],
        'SSC': ['English', 'Quantitative Aptitude', 'Reasoning Ability']
    };
    var prepType = ['Individual', 'Complete'];
    var basicContentType = ['Theory', 'Quiz'];
    var CAContentType = ['News Updates', 'Quiz'];
    var completeTestType = ['Practice Test', 'Live Mock Test'];
    
    var fac = {
        exams: exams,
        subjects: subjects,
        prepType: prepType,
        basicContentType: basicContentType,
        CAContentType: CAContentType,
        completeTestType: completeTestType
    };
    return fac;
});

app.factory('quizData', function() {
    var quizId = "";
    var quizName = "";
    var quizType = "";
    var quizCSVData = [];
    var quizPublishDate = {};
    var lang = "english";
    
    var quizData = {
        id: quizId,
        name: quizName,
        type: quizType,
        publishDate: quizPublishDate,
        csvData: quizCSVData,
        lang: lang
    };
    
    return quizData;
});

app.factory('editorData', function() {
    var obj = {
        lastTabOpened: "uploaded"
    };
    return obj;
});

app.controller('MainController', ['$scope', '$cookies', '$location', '$http', 'domainName', function($scope, $cookies, $location, $http, domainName) {
    $scope.name = $cookies.get("name");
    $scope.role = $cookies.get("role");
    $scope.loading = false;
    
    if($scope.name == undefined || $scope.name == "") {
        $scope.loggedIn = false;
        $location.path('/login');
    }
    else {
        $scope.loggedIn = true;
        if($scope.role == "admin") {
            $location.path('/admin');
        }
        else if($scope.role == "editor") {
            $location.path('/editor');
        }
        else if($scope.role == "uploader") {
            $location.path('/uploader');
        }
    }
    console.log("name : " + $scope.name);
    $scope.logout = function() {
        $scope.loading = true;
        var url = domainName + "/v1/admin/logout";
        $http.get(url).then(function successCallback(response){
            $scope.name = undefined;
            $scope.role = undefined;
            $scope.loggedIn = false;
            $location.path('/login');
            $cookies.remove('name');
            $cookies.remove('role');
            $scope.loading = false;
        }, function errorCallback(response){
            $scope.loading = false;
            alert("Check internet connection and try again.");
        });  
    };
    
}]);

app.controller('LoginController', ['$scope', '$http', '$cookies', '$location', 'domainName', function($scope, $http, $cookies, $location, domainName){
    $http.defaults.withCredentials = true;
    $scope.login = {
        email : "",
        password : ""
    };
    $scope.successfulTry = true;
    
    $scope.signIn = function() {
        $scope.$parent.loading = true;
        var data = {
            email: $scope.login.email,
            password: $scope.login.password
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        var url = domainName + "/v1/admin/login";
        $http.post(url, data, config).then(function successCallback(response){
            var data = response.data;
            var date = new Date("October 13, 9999 11:13:00");
            $cookies.put('name', data.name, {expires: date});
            $cookies.put('role', data.role, {expires: date});
            $scope.$parent.name = data.name;
            $scope.$parent.role = data.role;
            $scope.$parent.loggedIn = true;
            
            if(data.role == "admin") {
                $location.path('/admin');
            }
            else if(data.role == "editor") {
                $location.path('/editor');
            }
            else if(data.role == "uploader") {
                $location.path('/uploader');
            }
            $scope.successfulTry = true;
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            if(response.data.error == "INVALID_CREDENTIALS") {
                $scope.successfulTry = false;
            }
            else {
                $scope.successfulTry = true;
            }
            $scope.$parent.loading = false;
            console.log(JSON.stringify(response));
        });
    }
}]);

app.controller('AdminController', ['$scope', '$http', '$location', 'domainName', function($scope, $http, $location, domainName){
    $scope.users = [];
    $scope.usersRetrieved = false;
    $scope.newUser = {
        name: "",
        role: "uploader",
        email: "",
        password: ""
    };
    $scope.selectedUserForDeletion = -1;
    $scope.userCreationTry = true;
    
    $scope.$parent.loading = true;
    $http.defaults.withCredentials = true;
    var url = domainName + "/v1/admin/users";
    $http.get(url).then(function successCallback(response){
        $scope.users = response.data;
        $scope.usersRetrieved = true;
        $scope.$parent.loading = false;
    }, function errorCallback(response){
        $scope.$parent.loading = false;
        alert("Unable to fetch data. Check internet connection");
    });

    $scope.showDeleteUserModal = function(index) {
        $scope.selectedUserForDeletion = index;
        $('#deleteUserModal').modal('show');
    }
    
    $scope.showCreateUserModal = function() {
        $scope.userCreationTry = true;
        $scope.newUser = {
            name: "",
            role: "uploader",
            email: "",
            password: ""
        };
        $('#createNewUserModal').modal('show');
    }
    
    $scope.deleteUser = function() {
        $scope.$parent.loading = true;
        var userId = $scope.users[$scope.selectedUserForDeletion]._id;
        var url = domainName + "/v1/admin/users/" + userId;
        $http.delete(url).then(function successCallback(response){
            $scope.users.splice($scope.selectedUserForDeletion, 1);
            $scope.selectedUserForDeletion = -1;
            $('#deleteUserModal').modal('hide');
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            $('#deleteUserModal').modal('hide');
            alert("Unable to delete user. Check internet connection.");
        });
    }
    
    $scope.closeDeleteUserModal = function() {
        $scope.selectedUserForDeletion = -1;
        $('#deleteUserModal').modal('hide');
    }
    
    $scope.closeCreateUserModal = function() {
        $('#createNewUserModal').modal('hide');
    }
    
    $scope.createNewUser = function() {
        $scope.$parent.loading = true;
        var data = {
            name: $scope.newUser.name,
            role: $scope.newUser.role,
            email: $scope.newUser.email,
            password: $scope.newUser.password
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var url = domainName + "/v1/admin/users";
        $http.post(url, data, config).then(function successCallback(response){
            var data = response.data;
            $scope.users.unshift(data);
            $('#createNewUserModal').modal('hide');
            //$scope.newUserForm.$setPristine();
            $scope.newUser = {
                name: "",
                role: "uploader",
                email: "",
                password: ""
            };
            $scope.userCreationTry = true;
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            if(response.data.error == "DUPLICATE") {
                $scope.userCreationTry = false;
            }
            else {
                $scope.userCreationTry = true;
            }
            $scope.$parent.loading = false;
            alert("Unable to create user. Check internet connection.");
            console.log(JSON.stringify(response));
        });
    }
    
    $scope.refreshTabularData = function() {
        $scope.$parent.loading = true;
        var url = domainName + "/v1/admin/users";
        $http.get(url).then(function successCallback(response){
            $scope.users = response.data;
            $scope.usersRetrieved = true;
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Unable to fetch data. Check internet connection");
        });
    }
}]);


app.controller('EditorController', ['$scope', 'contentTypes', '$location', 'editorData', function($scope, contentTypes, $location, editorData) {
    $scope.contentTypes = contentTypes;
    
    $scope.viewUploaders = function() {
        $location.path('/editor/uploaders');
    }
    
    $scope.viewRequests = function(contentType) {
        $('#chooseContentTypeModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        if(contentType == "News") {
            editorData.lastTabOpened = "uploaded";
            $location.path('/editor/news');
        }
        else if(contentType == "News Quiz") {
            editorData.lastTabOpened = "uploaded";
            $location.path('/editor/quiz/news');
        }
        else if(contentType == "Content Quiz") {
            editorData.lastTabOpened = "uploaded";
            $location.path('/editor/quiz/content');
        }
        else {
            //yo
        }
    }
    
}]);

app.controller('EditorUploaderController', ['$scope', '$http', '$location', 'domainName', function($scope, $http, $location, domainName){
    $scope.uploaders = [];
    $scope.uploadersRetrieved = false;
    $scope.newUploader = {
        name: "",
        email: "",
        password: ""
    };
    $scope.userCreationTry = true;
    $scope.selectedUploaderForDeletion = -1;
    $http.defaults.withCredentials = true;
    
    $scope.$parent.loading = true;
    var url = domainName + "/v1/admin/users";
    $http.get(url).then(function successCallback(response){
        $scope.uploaders = response.data;
        $scope.uploadersRetrieved = true;
        $scope.$parent.loading = false;
    }, function errorCallback(response){
        $scope.$parent.loading = false;
        alert("Unable to fetch data. Check internet connection.");
        console.log(JSON.stringify(response));
    });
    
    $scope.createNewUploader = function() {
        $scope.$parent.loading = true;
        var data = {
            name: $scope.newUploader.name,
            role: "uploader",
            email: $scope.newUploader.email,
            password: $scope.newUploader.password
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var url = domainName + "/v1/admin/users";
        $http.post(url, data, config).then(function successCallback(response){
            var data = response.data;
            $scope.uploaders.unshift(data);
            $('#createNewUploaderModal').modal('hide');
            //$scope.newUserForm.$setPristine();
            $scope.newUploader = {
                name: "",
                email: "",
                password: ""
            };
            $scope.userCreationTry = true;
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            if(response.data.error == "DUPLICATE") {
                $scope.userCreationTry = false;
            }
            else {
                $scope.userCreationTry = true;
            }
            $scope.$parent.loading = false;
            alert("Unable to create new user. Check internet connection.");
            console.log(JSON.stringify(response));
        });
    }
    
    $scope.showDeleteUploaderModal = function(index) {
        $scope.selectedUploaderForDeletion = index;
        $('#deleteUploaderModal').modal('show');
    }
    
    $scope.showCreateUserModal = function() {
        $scope.userCreationTry = true;
        $scope.newUploader = {
            name: "",
            email: "",
            password: ""
        };
        $('#createNewUploaderModal').modal('show');
    }
    
    $scope.deleteUploader = function() {
        $scope.$parent.loading = true;
        var userId = $scope.uploaders[$scope.selectedUploaderForDeletion]._id;
        var url = domainName + "/v1/admin/users/" + userId;
        $http.delete(url).then(function successCallback(response){
            $scope.uploaders.splice($scope.selectedUploaderForDeletion, 1);
            $scope.selectedUploaderForDeletion = -1;
            $('#deleteUploaderModal').modal('hide');
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Unable to delete user. Check internet connection.");
        });
    }
    
    $scope.closeDeleteUserModal = function() {
        $scope.selectedUploaderForDeletion = -1;
        $('#deleteUploaderModal').modal('hide');
    }
    
    $scope.closeCreateUserModal = function() {
        $('#createNewUploaderModal').modal('hide');
    }
    
    $scope.refreshTabularData = function() {
        $scope.$parent.loading = true;
        var url = domainName + "/v1/admin/users";
        $http.get(url).then(function successCallback(response){
            $scope.uploaders = response.data;
            $scope.uploadersRetrieved = true;
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Unable to fetch data. Check internet connection.");
        });
    }
    
}]);

app.controller('EditorNewsController', ['$scope', '$http', 'domainName', 'EditorNewsFactory', '$location', 'editorData', function($scope, $http, domainName, EditorNewsFactory, $location, editorData) {
    $http.defaults.withCredentials = true;
    $scope.fetchLimit = 20;
    $scope.news = {
        uploaded: [],
        approved: [],
        published: []
    };
    
    $scope.newsStatus = {
        uploaded: 1,
        approved: 1,
        published: 1
    }; // 1-not updated, 2-updating, 3-updated
    
    $scope.disableRefresh = {
        uploaded: false,
        approved: false,
        published: false
    };
    
    $scope.toBeDeleted = {
        index: -1,
        type: ''
    };
    
    $scope.newsPublishIndex = -1;
    
    $scope.visibleTab = editorData.lastTabOpened;
    $scope.viewingLang = "english";
    
    function load() {
        if($scope.news[$scope.visibleTab].length == 0 && !$scope.disableRefresh[$scope.visibleTab]) {
            $scope.$parent.loading = true;
            var type = $scope.visibleTab;
            $scope.disableRefresh[type] = true;
            var config = {
                headers: {
                    'Content-Type' : 'application/json'
                },
                params: {
                    'status': $scope.visibleTab,
                    'limit': $scope.fetchLimit
                }
            };
            var url = domainName + "/v1/admin/news";
            $http.get(url, config).then(function successCallback(response){
                var newsArr = response.data;
                $scope.news[type] = newsArr;
                if(newsArr.length <$scope.fetchLimit) {
                    $scope.newsStatus[type] = 3;
                }
                else {
                    $scope.newsStatus[type] = 1;
                }
                $scope.disableRefresh[type] = false;
                $scope.$parent.loading = false;
            }, function errorCallback(response){
                $scope.newsStatus[type] = 1;
                $scope.disableRefresh[type] = false;
                $scope.$parent.loading = false;
                alert("Unable to fetch data. Check internet.");
                console.log(JSON.stringify(response));
            });
        }
    } 
    load();
    $scope.load = load;

    $scope.refresh = function(type) {
        if($scope.news[type].length == 0) {
            $scope.load();
        }
        else {
            $scope.disableRefresh[type] = true;
            var refTime = (type == 'uploaded')?$scope.news[type][0].createdAt:$scope.news[type][0].updatedAt;
            var config = {
                headers: {
                    'Content-Type' : 'application/json'
                },
                params: {
                    'status': type,
                    'gt': refTime
                }
            };

            var url = domainName + "/v1/admin/news";
            $http.get(url, config).then(function successCallback(response){
                var newsArr = response.data;
                $scope.news[type] = newsArr.concat($scope.news[type]);
                $scope.disableRefresh[type] = false;
                console.log("Data refreshed for tab : " + $scope.visibleTab);
            }, function errorCallback(response){
                console.log(JSON.stringify(response));
                $scope.disableRefresh[type] = false;
                alert("Unable to fetch data. Check internet.");
            });
        }
    };
    
    $scope.tabChanged = function() {
        if($scope.news[$scope.visibleTab].length>0) {
            $scope.refresh($scope.visibleTab);
        }
        else {
            $scope.load();
        }
    };
    
    $scope.showMore = function(type) {
        $scope.newsStatus[type] = 2;
        var refTime = (type == 'uploaded')?$scope.news[type][$scope.news[type].length - 1].createdAt:$scope.news[type][$scope.news[type].length - 1].updatedAt;
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
            params: {
                'status': type,
                'lt': refTime,
                'limit': $scope.fetchLimit
            }
        };
        
        var url = domainName + "/v1/admin/news";
        $http.get(url, config).then(function successCallback(response){
            var newsArr = response.data;
            $scope.news[type] = $scope.news[type].concat(newsArr);
            if(newsArr.length <$scope.fetchLimit) {
                $scope.newsStatus[type] = 3;
            }
            else {
                $scope.newsStatus[type] = 1;
            }
        }, function errorCallback(response){
            $scope.newsStatus[type] = 1;
            alert("Unable to fetch data. Check internet.");
            console.log(JSON.stringify(response));
        });
    };
    
    $scope.openEditWindow = function(type, index) {
        EditorNewsFactory.newsArr = $scope.news[type];
        EditorNewsFactory.type = type;
        EditorNewsFactory.index = index;
        editorData.lastTabOpened = $scope.visibleTab;
        $location.path('/editor/news/edit');
    }
    
    $scope.publishNews = function() {
        $scope.$parent.loading = true;
        var data = {
            status: 'published'
        };
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
        };

        var url = domainName + "/v1/admin/news/" + $scope.news['approved'][$scope.newsPublishIndex]._id;

        $http.put(url, data, config).then(function successCallback(response){
            $scope.news['approved'].splice($scope.newsPublishIndex, 1);
            $('#publishNewsModal').modal('hide');
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $('#publishNewsModal').modal('hide');
            console.log(JSON.stringify(response));
            $scope.$parent.loading = false;
            alert("Unable to save changes. Check internet connection.");
        });
    };
    
    $scope.confirmPublishNews = function(index) {
        $scope.newsPublishIndex = index;
        $('#publishNewsModal').modal('show');
    };
    
    $scope.deleteNews = function() {
        $scope.$parent.loading = true;
        var newsId = $scope.news[$scope.toBeDeleted.type][$scope.toBeDeleted.index]._id;
        var url = domainName + "/v1/admin/news/" + newsId;
        $http.delete(url).then(function successCallback(response){
            $scope.news[$scope.toBeDeleted.type].splice($scope.toBeDeleted.index, 1);
            $('#deleteNewsModal').modal('hide');
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            $('#deleteNewsModal').modal('hide');
            alert("Unable to delete user. Check internet connection.");
        });
    };
    
    $scope.showDeleteNewsModal = function(index, type) {
        $scope.toBeDeleted.index = index;
        $scope.toBeDeleted.type = type;
        
        $('#deleteNewsModal').modal('show');      
    };
    
}]);

app.factory('EditorNewsFactory', function() {
    return {newsArr: [], type: "", index: -1};
});

app.controller('EditorNewsEditController', ['$scope', '$http', 'domainName', 'EditorNewsFactory', '$window', function($scope, $http, domainName, EditorNewsFactory, $window) {
    //$scope.type = EditorNewsFactory.type;
    console.log("//"+JSON.stringify(EditorNewsFactory)+"\\");
    $scope.type = EditorNewsFactory.type;
    $scope.newsUpdateData = {
        content: {
            english: {
                heading: EditorNewsFactory.newsArr[EditorNewsFactory.index].content.english.heading,
                points: EditorNewsFactory.newsArr[EditorNewsFactory.index].content.english.points.slice()
            },
            hindi: {
                heading: EditorNewsFactory.newsArr[EditorNewsFactory.index].content.hindi.heading,
                points: EditorNewsFactory.newsArr[EditorNewsFactory.index].content.hindi.points.slice()
            }
        },
        publishDate: new Date(EditorNewsFactory.newsArr[EditorNewsFactory.index].publishDate)
    };
    
    $scope.categories = ["Award and honours", "Important International events", "Important Political events", "Books and authors", "Committees and commissions", "Submits and conferences", "Economic updates", "Budget and economic Survey", "Sports and Games", "Science and Technology", "Environmental conventions and updates", "miscellaneous"];
    
    $scope.isSelected = [];
    for(var i=0; i<$scope.categories.length; i++) {
        $scope.isSelected.push(false);
    }
    if(EditorNewsFactory.newsArr[EditorNewsFactory.index].categories) {
        for(var i=0; i<EditorNewsFactory.newsArr[EditorNewsFactory.index].categories.length; i++) {
            var index = $scope.categories.indexOf(EditorNewsFactory.newsArr[EditorNewsFactory.index].categories[i]);
            if(index>=0) {
                $scope.isSelected[index] = true;
            }
        }
    }
    
    if(EditorNewsFactory.newsArr[EditorNewsFactory.index].tags) {
        $scope.tags = EditorNewsFactory.newsArr[EditorNewsFactory.index].tags.toString();
    }
    else {
        $scope.tags = "";
    }
    
    $scope.imageInfo = {
        imageMobile: {},
        imageWeb: {}
    };
    $scope.imageTypes = ['imageMobile', 'imageWeb'];
    
    for(var i=0; i<$scope.imageTypes.length; i++) {
        if(EditorNewsFactory.newsArr[EditorNewsFactory.index][$scope.imageTypes[i]]) {
            $scope.imageInfo[$scope.imageTypes[i]].imageUrl = EditorNewsFactory.newsArr[EditorNewsFactory.index][$scope.imageTypes[i]];
            $scope.imageInfo[$scope.imageTypes[i]].showChooseFile = false;
        }
        else {
            $scope.imageInfo[$scope.imageTypes[i]].imageUrl = "";
            $scope.imageInfo[$scope.imageTypes[i]].showChooseFile = true;
        }

        $scope.imageInfo[$scope.imageTypes[i]].isImageFileChosen = false;
        $scope.imageInfo[$scope.imageTypes[i]].chosenFileUploadStatus = 0;  // 0-nothing, 1-uploading, 2-upload failed, 3-successfully uploaded
        $scope.imageInfo[$scope.imageTypes[i]].chosenFile = null;
        $scope.imageInfo[$scope.imageTypes[i]].uploadedFileURL = "";
    }
    
    $scope.isCreating = {
        english: false,
        hindi: false
    };
    $scope.isEditing = {
        english: false,
        hindi: false
    };
    $scope.indexBeingEdited = {
        english: -1,
        hindi: -1
    };
    $scope.langDetails = 'english';
    
    $scope.showshowshow = function(imageType) {
        $scope.imageInfo[imageType].showChooseFile = true;  
    };
    
    $scope.preparePreview = function(input, imageType) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.imageInfo[imageType].isImageFileChosen = true;
                $scope.imageInfo[imageType].chosenFileUploadStatus = 1;
                $scope.imageInfo[imageType].chosenFile = input.files[0];
                $scope.$apply();
                $scope.fileUpload(imageType);
            }
            reader.readAsDataURL(input.files[0]);
        }
        else {
            $scope.imageInfo[imageType].chosenFileUploadStatus = 0;
            $scope.imageInfo[imageType].chosenFile = null;
            $scope.imageInfo[imageType].isImageFileChosen = false;
            $scope.imageInfo[imageType].uploadedFileURL = "";
            $scope.$apply();
        }
    };
    
    $scope.retry = function(imageType) {
        $scope.imageInfo[imageType].chosenFileUploadStatus = 1;
        $scope.imageInfo[imageType].fileUpload();
    };
    
    $scope.fileUpload = function(imageType) {
        $http.defaults.withCredentials = false;
        var uploadUrl = "https://storage.googleapis.com/public-prod-preppo/news/" + Math.random().toString(36).substr(2, 9) + '_' + $scope.imageInfo[imageType].chosenFile.name;
        var fd = new FormData();
        fd.append('file', $scope.imageInfo[imageType].chosenFile);
        
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data, status, header, config) {
            $scope.imageInfo[imageType].chosenFileUploadStatus = 3;
            $scope.imageInfo[imageType].uploadedFileURL = uploadUrl;
        })
        .error(function(data, status, header, config) {
            $scope.imageInfo[imageType].chosenFileUploadStatus = 2;
        });
    };
    
    $scope.removeFile = function(imageType) {
        $scope.imageInfo[imageType].chosenFileUploadStatus = 0;
        $scope.imageInfo[imageType].chosenFile = null;
        $scope.imageInfo[imageType].isImageFileChosen = false;
        $scope.imageInfo[imageType].uploadedFileURL = "";
        var control = $('#news-' + imageType + '-edit');
        control.replaceWith( control = control.clone( true ) );
    };
    
    $scope.createNewDetail = function(lang) {
        if(lang == 'english') {
            $scope.isCreating.english = true;
            CKEDITOR.instances.editor3.setData("");
        }
        else {
            $scope.isCreating.hindi = true;
            CKEDITOR.instances.editor4.setData("");
        }
    };
    
    $scope.save = function(lang) {
        var data;
        if(lang == 'english') {
            data = CKEDITOR.instances.editor3.getData();
            console.log("data : " + data);
        }
        else {
            data = CKEDITOR.instances.editor4.getData();
            console.log("data : " + data);
        }
        data.replace("<strong>", "<b>");
        data.replace("</strong>", "</b>");
        data.replace("<em>", "<i>");
        data.replace("</em>", "</i>");
        
        if($scope.isCreating[lang]) {
            $scope.newsUpdateData.content[lang].points.push(data);
            $scope.isCreating[lang] = false;
        }
        else {
            $scope.newsUpdateData.content[lang].points[$scope.indexBeingEdited[lang]] = data;
            $scope.isEditing[lang] = false;
        }
    };
    
    $scope.edit = function(index, lang) {
        $scope.isEditing[lang] = true;
        $scope.indexBeingEdited[lang] = index;
        if(lang == 'english') {
            CKEDITOR.instances.editor3.setData($scope.newsUpdateData.content[lang].points[index]);    
        }
        else {
            CKEDITOR.instances.editor4.setData($scope.newsUpdateData.content[lang].points[index]);
        }
        
    };
    
    $scope.remove = function(index, lang) {
        $scope.newsUpdateData.content[lang].points.splice(index, 1);
    };
    
    $scope.prepareData = function() {
        var data = {
            content: $scope.newsUpdateData.content,
            publishDate: $scope.newsUpdateData.publishDate
        };
        
        for(var i=0; i<$scope.imageTypes.length; i++) {
            if($scope.imageInfo[$scope.imageTypes[i]].showChooseFile) {
                if($scope.imageInfo[$scope.imageTypes[i]].isImageFileChosen && $scope.imageInfo[$scope.imageTypes[i]].chosenFileUploadStatus == 3) {
                    data[$scope.imageTypes[i]] = $scope.imageInfo[$scope.imageTypes[i]].uploadedFileURL;
                }
                else {
                    data[$scope.imageTypes[i]] = "";
                }
            }
            else {
                data[$scope.imageTypes[i]] = $scope.imageInfo[$scope.imageTypes[i]].imageUrl;
            }
        }

        var selectedCategories = [];
        for(var i=0; i<$scope.isSelected.length; i++) {
            if($scope.isSelected[i]) {
                selectedCategories.push($scope.categories[i]);
            }
        }
        
        data['categories'] = selectedCategories;

        var tags = $scope.tags.split(",");
        for(var i=tags.length-1; i>=0; i--) {
            tags[i] = tags[i].trim();
            if(tags[i] == "") {
                tags.splice(i, 1);   
            }
        }
        data['tags'] = tags;
        return data;
    }
    
    function simonGoBack() {
        $window.history.back();
    }
    
    $scope.submitButtonTitle = {
        'uploaded': 'Save and Approve',
        'approved': 'Save Changes',
        'published': 'Save Changes'
    };
    
    $scope.submit = function() {
        if(($scope.imageInfo['imageWeb'].showChooseFile && $scope.imageInfo['imageWeb'].chosenFileUploadStatus == 1) || ($scope.imageInfo['imageMobile'].showChooseFile && $scope.imageInfo['imageMobile'].chosenFileUploadStatus == 1)) {
            alert("Image upload in process.");
            return;
        }
        $scope.$parent.loading = true;
        var data = $scope.prepareData();
        if(EditorNewsFactory.type == 'uploaded') {
            data['status'] = 'approved';
        }
        
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            }
        };
        
        var url = domainName + "/v1/admin/news/" + EditorNewsFactory.newsArr[EditorNewsFactory.index]._id;
        
        $http.defaults.withCredentials = true;
        
        $http.put(url, data, config).then(function successCallback(response) {
            EditorNewsFactory.newsArr.splice(EditorNewsFactory.index, 1);
            simonGoBack();
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Check internet connection.");
            console.log(JSON.stringify(response));
        });
    };
    
    $scope.cancel = function() {
        simonGoBack();
    };
    
}]);

app.controller('EditorQuizController', ['$scope', '$routeParams', '$http', 'domainName', '$location', 'editorData', function($scope, $routeParams, $http, domainName, $location, editorData) {
    $scope.type = $routeParams.type;
    $http.defaults.withCredentials = true;
    $scope.fetchLimit = 20;
    $scope.toBeDeleted = {
        index: -1,
        type: ''
    };
    $scope.quizzes = {
        uploaded: [],
        approved: [],
        published: []
    };
    
    $scope.quizzesStatus = {
        uploaded: 1,
        approved: 1,
        published: 1
    }; // 1-not updated, 2-updating, 3-updated
    
    $scope.disableRefresh = {
        uploaded: false,
        approved: false,
        published: false
    }
    
    $scope.quizPublishIndex = -1;
    
    $scope.visibleTab = editorData.lastTabOpened;
    $scope.viewingLang = "english";
    
    function load() {
        if($scope.quizzes[$scope.visibleTab].length == 0 && !$scope.disableRefresh[$scope.visibleTab]) {
            $scope.$parent.loading = true;
            var type = $scope.visibleTab;
            $scope.disableRefresh[type] = true;
            
            var config = {
                headers: {
                    'Content-Type' : 'application/json'
                },
                params: {
                    'status': $scope.visibleTab,
                    'limit': $scope.fetchLimit
                }
            };
            
            var url = domainName + "/v1/admin/news/quiz";
            $http.get(url, config).then(function successCallback(response){
                var quizzesArr = response.data;
                $scope.quizzes[type] = quizzesArr;
                if(quizzesArr.length <$scope.fetchLimit) {
                    $scope.quizzesStatus[type] = 3;
                }
                else {
                    $scope.quizzesStatus[type] = 1;
                }
                $scope.disableRefresh[type] = false;
                $scope.$parent.loading = false;
            }, function errorCallback(response){
                $scope.quizzesStatus[type] = 1;
                $scope.disableRefresh[type] = false;
                $scope.$parent.loading = false;
                alert("Unable to fetch data. Check internet.");
                console.log(JSON.stringify(response));
            });
        }
    }
    
    load();
    $scope.load = load;
    
    $scope.tabChanged = function() {
        if($scope.quizzes[$scope.visibleTab].length>0) {
            $scope.refresh($scope.visibleTab);
        }
        else {
            $scope.load();
        }
    };
    
    $scope.refresh = function(type) {
        if($scope.quizzes[type].length == 0) {
            $scope.load();
        }
        else {
            $scope.disableRefresh[type] = true;
            var refTime = $scope.quizzes[type][0].updatedAt;
            var config = {
                headers: {
                    'Content-Type' : 'application/json'
                },
                params: {
                    'status': type,
                    'gt': refTime
                }
            };
            var url = domainName + "/v1/admin/news/quiz";
            $http.get(url, config).then(function successCallback(response){
                var quizzesArr = response.data;
                $scope.quizzes[type] = quizzesArr.concat($scope.quizzes[type]);
                $scope.disableRefresh[type] = false;
            }, function errorCallback(response){
                console.log(JSON.stringify(response));
                $scope.disableRefresh[type] = false;
                alert("Unable to fetch data. Check internet.");
            });
        }
    };
    
    $scope.showMore = function(type) {
        $scope.quizzesStatus[type] = 2;
        var refTime = $scope.quizzes[type][$scope.quizzes[type].length - 1].updatedAt;
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
            params: {
                'status': type,
                'lt': refTime,
                'limit': $scope.fetchLimit
            }
        };
        
        var url = domainName + "/v1/admin/news/quiz";
        $http.get(url, config).then(function successCallback(response){
            var quizArr = response.data;
            $scope.quizzes[type] = $scope.quizzes[type].concat(quizArr);
            if(quizArr.length <$scope.fetchLimit) {
                $scope.quizzesStatus[type] = 3;
            }
            else {
                $scope.quizzesStatus[type] = 1;
            }
        }, function errorCallback(response){
            $scope.quizzesStatus[type] = 1;
            console.log(JSON.stringify(response));
            alert("Unable to fetch data. Check internet.");
        });
    };
    
    $scope.showQuestions = function(type, index) {
        editorData.lastTabOpened = $scope.visibleTab;
        $location.path('/editor/quiz/news/'+$scope.quizzes[type][index]._id);
    };
    
    $scope.publishQuiz = function() {
        $scope.$parent.loading = true;
        var data = {
            status: 'published'
        };
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
        };

        var url = domainName + "/v1/admin/news/quiz/" + $scope.quizzes['approved'][$scope.quizPublishIndex]._id;

        $http.put(url, data, config).then(function successCallback(response){
            $scope.quizzes['approved'].splice($scope.quizPublishIndex, 1);
            $('#publishQuizModal').modal('hide');
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $('#publishQuizModal').modal('hide');
            console.log(JSON.stringify(response));
            $scope.$parent.loading = false;
            alert("Unable to save changes. Check internet connection.");
        });
    };
    
    $scope.approveQuiz = function(index) {
        $scope.$parent.loading = true;
        var data = {
            status: 'approved'
        };
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
        };

        var url = domainName + "/v1/admin/news/quiz/" + $scope.quizzes['uploaded'][index]._id;

        $http.put(url, data, config).then(function successCallback(response){
            $scope.quizzes['uploaded'].splice(index, 1);
            $('#publishQuizModal').modal('hide');
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $('#publishQuizModal').modal('hide');
            console.log(JSON.stringify(response));
            $scope.$parent.loading = false;
            alert("Unable to save changes. Check internet connection.");
        }); 
    };
    
    $scope.confirmPublishQuiz = function(index) {
        $scope.quizPublishIndex = index;
        $('#publishQuizModal').modal('show');
    };
    
    $scope.showDeleteQuizModal = function(index, type) {
        $scope.toBeDeleted.index = index;
        $scope.toBeDeleted.type = type;
        
        $('#deleteQuizModal').modal('show');
    };
    
    $scope.deleteQuiz = function() { 
        $scope.$parent.loading = true;
        var quizId = $scope.quizzes[$scope.toBeDeleted.type][$scope.toBeDeleted.index]._id;
        var url = domainName + "/v1/admin/news/quiz/" + quizId;
        $http.delete(url).then(function successCallback(response){
            $scope.quizzes[$scope.toBeDeleted.type].splice($scope.toBeDeleted.index, 1);
            $('#deleteQuizModal').modal('hide');
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            $('#deleteQuizModal').modal('hide');
            alert("Unable to delete user. Check internet connection.");
        });
    };
    
}]);

app.controller('EditorQuizQuestionsController', ['$scope', '$routeParams', '$http', 'domainName', 'EditorQuestionService', '$window', '$location', function($scope, $routeParams, $http, domainName, EditorQuestionService, $window, $location) {
    $http.defaults.withCredentials = true;
    $scope.quiz = {};
    $scope.questions = [];
    $scope.quizId = $routeParams.id;
    $scope.quizPublishDate = new Date("2016-02-01");
    $scope.quizType = "";
    $scope.quizName = "";
    $scope.questionDeleteIndex = -1;
    
    function fetchData() {
        $scope.$parent.loading = true;
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
        };
        
        var url = domainName + "/v1/admin/news/quiz/" + $scope.quizId;
        $http.get(url).then(function successCallback(response){
            $scope.quiz = response.data.quiz;
            $scope.quizName = $scope.quiz.nickname;
            $scope.quizPublishDate = new Date($scope.quiz.publishDate);
            $scope.quizType = $scope.quiz.type;
            $scope.questions = response.data.questionList;
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Unable to fetch data. Check internet.");
        });   
    }
    fetchData();
    
    $scope.simonGoBack = function() {
        $window.history.back();
    }
    
    $scope.saveQuizData = function() {
        $scope.$parent.loading = true;
        var data = {
            nickname: $scope.quizName,
            publishDate: $scope.quizPublishDate,
            type: $scope.quizType
        };
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            }
        };

        var url = domainName + "/v1/admin/news/quiz/" + $scope.quizId;

        $http.put(url, data, config).then(function successCallback(response) {
            $scope.quiz.nickname = $scope.quizName;
            $scope.quiz.publishDate = $scope.quizPublishDate;
            $scope.quiz.type = $scope.quizType;
            $scope.$parent.loading = false;
            alert("Quiz data saved successfully");
        }, function errorCallback(response) {
            $scope.$parent.loading = false;
            alert("Unable to save changes. Check internet connection.");
        });
    };
    
    $scope.deleteQuestion = function() {
        $scope.$parent.loading = true;
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
            params: {
                'quizId': $scope.quizId
            }
        };
        
        var url = domainName + "/v1/admin/news/quizquestion/" + $scope.questions[$scope.questionDeleteIndex]._id;
        
        $http.delete(url, config).then(function successCallback(response){
            $scope.questions.splice($scope.questionDeleteIndex, 1);
            $scope.$parent.loading = false;
            $('#deleteQuestionModal').modal('hide');
            alert("Question removed successfully");
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            $('#deleteQuestionModal').modal('hide');
            alert("Unable to save changes. Check internet connection.");
        });
    };
    
    $scope.confirmDeleteQuestion = function(index) {
        $scope.questionDeleteIndex = index;
        $('#deleteQuestionModal').modal('show');
    };
    
    $scope.openEditWindow = function(index) {
        if(index == -1) {
            EditorQuestionService.quiz = $scope.quiz;
            EditorQuestionService.type = "new";
            EditorQuestionService.question = {};
            $location.path('/editor/quiz/news/question/new');
        }
        else {
            EditorQuestionService.quiz = $scope.quiz;
            EditorQuestionService.type = "edit";
            EditorQuestionService.question = $scope.questions[index];
            $location.path('/editor/quiz/news/question/'+$scope.questions[index]._id);
        }
    };
    
    $scope.processCSV = function(input) {
        if (input.files && input.files[0]) {
            var file = input.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(event) {
                var csv = event.target.result;
                $scope.quizCSVData = $.csv.toArrays(csv);
            };
            reader.onerror = function(){ alert('Unable to read ' + file.fileName); };
        }
    };
    
}]);

app.factory('EditorQuestionService', function() {
    return {quiz: {}, type: "", question: {}};
});

app.controller('EditorQuizQuestionEditController', ['$scope', '$routeParams', '$http', 'domainName', 'EditorQuestionService', '$window', function($scope, $routeParams, $http, domainName, EditorQuestionService, $window) {
    $http.defaults.withCredentials = true;
    $scope.quiz = EditorQuestionService.quiz;
    $scope.type = EditorQuestionService.type;
    $scope.quesLang = "english";
    $scope.question = {};
    $scope.difficultyIndices = [{text: "Not Specified", value: 0}, {text: "Easy", value: 1}, {text: "Medium", value: 2}, {text: "Difficult", value: 3}];
    
    function questionReset() {
        var question = EditorQuestionService.question;
        var langs = ['english', 'hindi'];
        var options = {
            english: ["", "", "", ""],
            hindi: ["", "", "", ""]
        };
        var statement = {
            english: "",
            hindi: ""
        };
        var correct_answer = {
            english: 0,
            hindi: 0
        };
        var solution = {
            english: "",
            hindi: ""
        };
        var level = 0;
        var id = question._id;
        
        if($scope.type == 'edit') {
            level = question.level;
            for(var i=0; i<langs.length; i++) {
                statement[langs[i]] = question.content[langs[i]].questionString;
                for(var j=0; j<question.content[langs[i]].options.length; j++) {
                    options[langs[i]][j] = question.content[langs[i]].options[j].optionString;
                    solution[langs[i]] = question.content[langs[i]].solution;
                    if(question.content[langs[i]].options[j].correct) {
                        correct_answer[langs[i]] = j+1;   
                    }
                }
            }
        }
        
        $scope.question = {
            id: id,
            statement: statement,
            options: options,
            correctAnswer: correct_answer,
            level: level,
            solution : solution
        };
        $scope.quesLang = "english";
    };
    questionReset();
    
    $scope.save = function() {
        $scope.$parent.loading = true;
        var content = {};
        var langs = ['english', 'hindi'];
        for(var i=0; i<langs.length; i++) {
            content[langs[i]] = {
                questionString: $scope.question.statement[langs[i]],
                options: [],
                solution: $scope.question.solution[langs[i]]
            };
            for(var j=0; j<$scope.question.options[langs[i]].length; j++) {
                content[langs[i]].options.push({optionString: $scope.question.options[langs[i]][j], correct: ($scope.question.correctAnswer[langs[i]] == j+1)});
            }
        }
        
        var data = {
            content: content,
            level: $scope.question.level,
            status: 'approved'
        };
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
        };
        
        var url = domainName + "/v1/admin/news/quizquestion/" + $scope.question.id;
        
        $http.put(url, data, config).then(function successCallback(response){
            $scope.$parent.loading = false;
            alert("Question saved successfully");
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Unable to save changes. Check internet connection.");
        });
    };
    
    $scope.create = function() {
        $scope.$parent.loading = true;
        var langs = ['english', 'hindi'];
        var content = {};
        for(var i=0; i<langs.length; i++) {
            content[langs[i]] = {
                questionString: $scope.question.statement[langs[i]].trim(),
                options: [],
                solution: $scope.question.solution[langs[i]]
            };
            for(var j=0; j<$scope.question.options[langs[i]].length; j++) {
                content[langs[i]].options.push({optionString: $scope.question.options[langs[i]][j].trim(), correct: ($scope.question.correctAnswer[langs[i]] == j+1)});
            }
        }
        
        var data = {
            content: content,
            level: $scope.question.level,
            status: 'approved'
        };
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
            params: {
                'quizId': $scope.quiz._id
            }
        };
        
        var url = domainName + "/v1/admin/news/quizquestion";
        
        $http.post(url, data, config).then(function successCallback(response){
            $scope.$parent.loading = false;
            alert("Question saved successfully");
            $window.history.back();
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Check internet connection.");
        }); 
    };
    
    $scope.close = function() {
        $window.history.back();
    };
    
}]);

app.controller('UploaderController', ['$scope', 'categoryConstants', '$location', function($scope, categoryConstants, $location) {
    $scope.options = categoryConstants;
    $scope.selects = {
        examType: "",
        currentAffairsType: "",
        prepType: "",
        subjectType: "",
        contentType: "",
        completeTestType: ""
    };
    $scope.mainCategoryRadio = "currentAffairs";
    
    $scope.go = function() {
        if($scope.mainCategoryRadio == 'exam') {
            //kuch nhi filhaal to
        }
        else {
            if($scope.selects.currentAffairsType == 'News Updates') {
                $location.path('/uploader/news/update');
            }
            else if($scope.selects.currentAffairsType == 'Quiz') {
                $location.path('/uploader/quiz/home/news');
            }
            else {
                console.log("ee ka hua !! :O");          
            }
        }
    };
}]);

app.controller('UploaderQuizController', ['$scope', '$routeParams', '$location', 'quizData', '$http', 'domainName', function($scope, $routeParams, $location, quizData, $http, domainName) {
    $http.defaults.withCredentials = true;
    $scope.type = $routeParams.type;
    $scope.homeScreen = true;
    $scope.step = 1;
    $scope.showQuizInfo = false;
    $scope.fileInput = false;
    $scope.fetchLimit = 20;
    $scope.quizzes = [];
    $scope.quizzesStatus = 1;
    $scope.quizName = "";
    $scope.quizType = "";
    $scope.quizPublishDate = new Date("2016-02-01");
    $scope.quizId = "";
    $scope.quizCSVData = [];
    $scope.setStep = 1;
    $scope.lang = "english";
    $scope.quizLength = 0;
    
    $scope.startManualUpload = function() {
        $scope.homeScreen = false;
        $scope.showQuizInfo = true;
    };
    
    $scope.showFileInput = function() {
        $scope.homeScreen = false;
        $scope.fileInput = true;
    };
    
    $scope.nextStep = function(shouldFetchData) {
        if(shouldFetchData) {
            $scope.step = 3;
            $scope.$parent.loading = true;
            var config = {
                headers: {
                    'Content-Type' : 'application/json'
                },
                params: {
                    'status': 'uploaded',
                    'limit': $scope.fetchLimit
                }
            };

            var url = domainName + "/v1/admin/news/quiz";
            $http.get(url, config).then(function successCallback(response){
                $scope.quizzes = response.data;
                if($scope.quizzes.length < $scope.fetchLimit) {
                    $scope.quizzesStatus = 3;
                }
                else {
                    $scope.quizzesStatus = 1;
                }
                $scope.$parent.loading = false;
            }, function errorCallback(response){
                $scope.quizzesStatus = 1;
                $scope.$parent.loading = false;
                alert("Unable to fetch data. Check internet.");
            });
        }
        else {
            $scope.step = 2;
        }
    };
    
    $scope.showMore = function() {
        $scope.quizzesStatus = 2;
        var refTime = $scope.quizzes[$scope.quizzes.length - 1].updatedAt;
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
            params: {
                'status': 'uploaded',
                'lt': refTime,
                'limit': $scope.fetchLimit
            }
        };
        
        var url = domainName + "/v1/admin/news/quiz";
        $http.get(url, config).then(function successCallback(response){
            var quizArr = response.data;
            $scope.quizzes = $scope.quizzes.concat(quizArr);
            if(quizArr.length <$scope.fetchLimit) {
                $scope.quizzesStatus = 3;
            }
            else {
                $scope.quizzesStatus = 1;
            }
        }, function errorCallback(response){
            $scope.quizzesStatus = 1;
            console.log(JSON.stringify(response));
            alert("Unable to fetch data. Check internet.");
        });
    };
    
    $scope.processCSV = function(input) {
        if (input.files && input.files[0]) {
            var file = input.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(event) {
                var csv = event.target.result;
                $scope.quizCSVData = $.csv.toArrays(csv);
                console.log(JSON.stringify($scope.quizCSVData));
                
                if($scope.setStep != 1) {
                    $scope.showQuizInfo = true;
                    $scope.$apply();   
                }
                if($scope.setStep == 3 && $scope.quizLength != $scope.quizCSVData.length-1) {
                    alert("Mismatch in the number of questions.");
                }
            };
            reader.onerror = function(){ alert('Unable to read ' + file.fileName); };
        }
        else {
            if($scope.setStep != 1) {
                $scope.showQuizInfo = false;
                $scope.$apply();
            }
        }
    };
    
    $scope.showConfirmModal = function() {
        $('#RUSModal').modal('show');  
    };
    
    $scope.closeModal = function() {
        $("#RUSModal").modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    };
    
    $scope.createNewQuiz = function(status) {
        console.log("step : " + $scope.setStep);
        console.log("status : " + status);
        if($scope.setStep == 3) {
            console.log("here");
            quizData.name = $scope.quizName;
            quizData.type = $scope.quizType;
            quizData.publishDate = $scope.quizPublishDate;
            quizData.csvData = $scope.quizCSVData;
            quizData.id = $scope.quizId;
            quizData.lang = $scope.lang;
            $("#RUSModal").modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $location.path('/uploader/quiz/file2/' + $scope.type);
        }
        else {
            $scope.$parent.loading = true;
            quizData.name = $scope.quizName;
            quizData.type = $scope.quizType;
            quizData.publishDate = $scope.quizPublishDate;
            var data = {
                type: quizData.type,
                nickname: quizData.name,
                publishDate: quizData.publishDate
            };
            var config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            var url = domainName + "/v1/admin/news/quiz";
            $http.post(url, data, config).then(function successCallback(response){
                var data = response.data;
                console.log(JSON.stringify(data));
                quizData.id = data._id;
                if(status == 'withData') {
                    quizData.csvData = $scope.quizCSVData;
                    quizData.lang = $scope.lang;
                    $("#RUSModal").modal('hide');
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    $location.path('/uploader/quiz/file/' + $scope.type);
                }
                else {
                    quizData.csvData = [];
                    $location.path('/uploader/quiz/manual/' + $scope.type);
                }
                $scope.$parent.loading = false;
            }, function errorCallback(response){
                $scope.$parent.loading = false;
                alert("Unable to create quiz. Check internet connection.");
                console.log(JSON.stringify(response));
            });
        }
    };
    
    $scope.biggie = function(step) {
        console.log("add ques : " + step);
        $scope.setStep = step;
        $scope.homeScreen = false;
        if(step == 1) {
            $scope.showQuizInfo = true;
        }
        else if(step == 2) {
            $scope.fileInput = true;
        }
        else if(step == 3) {
            $scope.fileInput = true;
        }
    };
    
    $scope.addQuestions = function(index) {
        console.log("add ques : " + index);
        var quiz = $scope.quizzes[index];
        $scope.quizName = quiz.nickname;
        $scope.quizPublishDate = new Date(quiz.publishDate);
        $scope.quizType = quiz.type;
        $scope.quizId = quiz._id;
        $scope.quizLength = quiz.questionIdList.length;
        console.log("add ques : " + $scope.quizId);
        $scope.biggie(3);
    };

}]);

app.controller('UploaderQuizOfficeController', ['$scope', '$routeParams', 'quizData', '$http', 'domainName', '$window', function($scope, $routeParams, quizData, $http, domainName, $window) {
    $http.defaults.withCredentials = true;
    
    $scope.type = $routeParams.type;
    $scope.mode = $routeParams.mode;
    
    $scope.quizId = quizData.id;
    $scope.quizName = quizData.name;
    $scope.quizType = quizData.type;
    $scope.quizCSVData = quizData.csvData;
    $scope.quizPublishDate = quizData.publishDate;
    $scope.quizLength = (quizData.csvData.length-1);
    $scope.difficultyIndices = [{text: "Not Specified", value: 0}, {text: "Easy", value: 1}, {text: "Medium", value: 2}, {text: "Difficult", value: 3}];
    $scope.questions = [];
    $scope.currentQuestionIndex = 1;
    $scope.quesLang = "english";
    $scope.isLastQuestion = false;
    $scope.question = {};
    
    function fetchData() {
        $scope.$parent.loading = true;
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
        };
        
        var url = domainName + "/v1/admin/news/quiz/" + $scope.quizId;
        $http.get(url).then(function successCallback(response){
            console.log("hello : " + JSON.stringify(response));
            $scope.questions = response.data.questionList;
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Unable to fetch data. Check internet.");
        });   
    }
    
    function func() {
        if($scope.quizLength ==  $scope.currentQuestionIndex) {
            $scope.isLastQuestion = true;
        }
        else {
            $scope.isLastQuestion = false;
        }

        var array = {
            english: (quizData.lang == 'english')?$scope.quizCSVData[$scope.currentQuestionIndex]:[],
            hindi: (quizData.lang == 'hindi')?$scope.quizCSVData[$scope.currentQuestionIndex]:[]
        };
        console.log("array : " + JSON.stringify(array));
        console.log("array : " + array.english.length);
        console.log("array : " + array.hindi.length);
        var options = {
            english: [],
            hindi: []
        }
        var corr = {
            english: -1,
            hindi: -1
        }
        for(var i=0; i<4; i++) {
            if(quizData.lang == 'english') {
                options.hindi.push($scope.questions[$scope.currentQuestionIndex-1].content.hindi.options[i].optionString);
                if($scope.questions[$scope.currentQuestionIndex-1].content.hindi.options[i].correct) {
                    corr.hindi = i+1;
                }
            }
            else {
                console.log('ques : ' + JSON.stringify($scope.questions[$scope.currentQuestionIndex-1]));
                options.english.push($scope.questions[$scope.currentQuestionIndex-1].content.english.options[i].optionString);
                if($scope.questions[$scope.currentQuestionIndex-1].content.english.options[i].correct) {
                    corr.english = i+1;
                }
            }
        }


        $scope.question = {
            id: $scope.questions[$scope.currentQuestionIndex-1]._id,
            reviewed: {
                english: true,
                hindi: true
            },
            statement: {
                english: (quizData.lang == 'english')?array.english[0]:$scope.questions[$scope.currentQuestionIndex-1].content.english.questionString,
                hindi: (quizData.lang == 'hindi')?array.hindi[0]:$scope.questions[$scope.currentQuestionIndex-1].content.hindi.questionString
            },
            options: {
                english: (quizData.lang == 'english')?array.english.slice(1, 5):options.english,
                hindi: (quizData.lang == 'hindi')?array.hindi.slice(1, 5):options.hindi
            },
            correctAnswer: {
                english: (quizData.lang == 'english')?((array.english[5].trim() == "")?0:parseInt(array.english[5])):corr.english,
                hindi: (quizData.lang == 'hindi')?((array.hindi[5].trim() == "")?0:parseInt(array.hindi[5])):corr.hindi
            },
            level: (quizData.lang == 'english')?((array.english[6].trim() == "")?0:parseInt(array.english[6])):((array.hindi[6].trim() == "")?0:parseInt(array.hindi[6])),
            solution : {
                english: (quizData.lang == 'english')?array.english[7]:$scope.questions[$scope.currentQuestionIndex-1].content.english.solution,
                hindi: (quizData.lang == 'hindi')?array.hindi[7]:$scope.questions[$scope.currentQuestionIndex-1].content.hindi.solution
            }
        };
        
    }
    
    questionReset();
    
    function questionReset() {
        if($scope.mode == 'file') {
            if($scope.quizLength ==  $scope.currentQuestionIndex) {
                $scope.isLastQuestion = true;
            }
            else {
                $scope.isLastQuestion = false;
            }

            var array = {
                english: (quizData.lang == 'english')?$scope.quizCSVData[$scope.currentQuestionIndex]:[],
                hindi: (quizData.lang == 'hindi')?$scope.quizCSVData[$scope.currentQuestionIndex]:[]
            };
            
            $scope.question = {
                reviewed: {
                    english: true,
                    hindi: true
                },
                statement: {
                    english: (quizData.lang == 'english')?array.english[0]:"",
                    hindi: (quizData.lang == 'hindi')?array.hindi[0]:""
                },
                options: {
                    english: (quizData.lang == 'english')?array.english.slice(1, 5):["", "", "", ""],
                    hindi: (quizData.lang == 'hindi')?array.hindi.slice(1, 5):["", "", "", ""],
                },
                correctAnswer: {
                    english: (quizData.lang == 'english')?((array.english[5].trim() == "")?0:parseInt(array.english[5])):0,
                    hindi: (quizData.lang == 'hindi')?((array.hindi[5].trim() == "")?0:parseInt(array.hindi[5])):0
                },
                level: (quizData.lang == 'english')?((array.english[6].trim() == "")?0:parseInt(array.english[6])):((array.hindi[6].trim() == "")?0:parseInt(array.hindi[6])),
                solution : {
                    english: (quizData.lang == 'english')?array.english[7]:"",
                    hindi: (quizData.lang == 'hindi')?array.hindi[7]:""
                }
            };
        }
        else if($scope.mode == 'manual') {
            $scope.question = {
                reviewed: {
                    english: true,
                    hindi: true
                },
                statement: {
                    english: "",
                    hindi: ""
                },
                options: {
                    english: ["", "", "", ""],
                    hindi: ["", "", "", ""]
                },
                correctAnswer: {
                    english: 0,
                    hindi: 0
                },
                level: 0,
                solution : {
                    english: "",
                    hindi: ""
                }
            };   
            $scope.quesLang = "english";
        }
        else if($scope.mode == 'file2') {
            if($scope.currentQuestionIndex == 1) {
                $scope.$parent.loading = true;
                var config = {
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                };

                var url = domainName + "/v1/admin/news/quiz/" + $scope.quizId;
                $http.get(url).then(function successCallback(response){
                    console.log("hello : " + JSON.stringify(response));
                    $scope.questions = response.data.questionList;
                    func();
                    $scope.$parent.loading = false;
                }, function errorCallback(response){
                    $scope.$parent.loading = false;
                    alert("Unable to fetch data. Check internet.");
                });
            }
            else {
                func();
            }
        }
    };
    
    function simonGoBack() {
        $window.history.back();
    }
    
    $scope.nextQuestion = function(isThereANextQuestion) {
        var langs = ['english', 'hindi'];
        $scope.$parent.loading = true;
        var content = {};
        for(var i=0; i<langs.length; i++) {
            content[langs[i]] = {
                questionString: $scope.question.statement[langs[i]].trim(),
                options: [],
                solution: $scope.question.solution[langs[i]]
            };
            for(var j=0; j<$scope.question.options[langs[i]].length; j++) {
                content[langs[i]].options.push({optionString: $scope.question.options[langs[i]][j].trim(), correct: ($scope.question.correctAnswer[langs[i]] == j+1)});
            }
        }
        if($scope.mode == 'file2') {
            var data = {
                content: content,
                level: $scope.question.level,
                status: 'approved'
            };
            var config = {
                headers: {
                    'Content-Type' : 'application/json'
                },
            };

            var url = domainName + "/v1/admin/news/quizquestion/" + $scope.question.id;

            $http.put(url, data, config).then(function successCallback(response){
                $scope.$parent.loading = false;
                $scope.currentQuestionIndex++;
                if(isThereANextQuestion) {
                    questionReset();    
                }
                else {
                    simonGoBack();
                }
            }, function errorCallback(response){
                $scope.$parent.loading = false;
                alert("Unable to save changes. Check internet connection.");
            });
        }
        else {
            var data = {
                content: content,
                level: $scope.question.level
            };
            var config = {
                headers: {
                    'Content-Type' : 'application/json'
                },
                params: {
                    'quizId': $scope.quizId 
                }
            };

            var url = domainName + "/v1/admin/news/quizquestion";

            $http.post(url, data, config).then(function successCallback(response){
                $scope.$parent.loading = false;
                var data = response.data;
                $scope.currentQuestionIndex++;
                if(isThereANextQuestion) {
                    questionReset();    
                }
                else {
                    simonGoBack();
                }
                if($scope.mode == "manual") {
                    alert("Question successfully saved");
                }
            }, function errorCallback(response){
                $scope.$parent.loading = false;
                console.log(JSON.stringify(response));
                alert("Check internet connection.");
            });
        }
    };
    
    $scope.close = function() {
        simonGoBack();  
    };
    
}]);

app.controller('UploaderNewsUpdateController', ['$scope', '$http', 'domainName', '$window', function($scope, $http, domainName, $window) {
    $scope.newsUpdateData = {
        content: {
            english: {
                heading: "",
                points: []
            },
            hindi: {
                heading: "",
                points: []
            }
        },
        publishDate: new Date("2016-02-01")
    };
    
    $scope.categories = ["Award and honours", "Important International events", "Important Political events", "Books and authors", "Committees and commissions", "Submits and conferences", "Economic updates", "Budget and economic Survey", "Sports and Games", "Science and Technology", "Environmental conventions and updates", "miscellaneous"];
    $scope.isSelected = [];
    for(var i=0; i<$scope.categories.length; i++) {
        $scope.isSelected.push(false);
    }
    $scope.tags = "";
    
    $scope.imageTypes = ['imageMobile', 'imageWeb'];
    $scope.imageInfo = {
        imageMobile: {
            isImageFileChosen: false,
            chosenFileUploadStatus: 0,  // 0-nothing, 1-uploading, 2-upload failed, 3-successfully uploaded
            chosenFile: null,
            uploadedFileURL: ""
        },
        imageWeb: {
            isImageFileChosen: false,
            chosenFileUploadStatus: 0,  // 0-nothing, 1-uploading, 2-upload failed, 3-successfully uploaded
            chosenFile: null,
            uploadedFileURL: ""
        },
    };
    
    $scope.isCreating = {
        english: false,
        hindi: false
    };
    $scope.isEditing = {
        english: false,
        hindi: false
    };
    $scope.indexBeingEdited = {
        english: -1,
        hindi: -1
    };
    $scope.langDetails = 'english';
    
    $scope.preparePreview = function(input, imageType) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.imageInfo[imageType].isImageFileChosen = true;
                $scope.imageInfo[imageType].chosenFileUploadStatus = 1;
                $scope.imageInfo[imageType].chosenFile = input.files[0];
                $scope.$apply();
                $scope.fileUpload(imageType);
            }
            reader.readAsDataURL(input.files[0]);
        }
        else {
            $scope.imageInfo[imageType].chosenFileUploadStatus = 0;
            $scope.imageInfo[imageType].chosenFile = null;
            $scope.imageInfo[imageType].isImageFileChosen = false;
            $scope.imageInfo[imageType].uploadedFileURL = "";
            $scope.$apply();
        }
    };
    
    $scope.retry = function(imageType) {
        $scope.imageInfo[imageType].chosenFileUploadStatus = 1;
        $scope.fileUpload(imageType);
    };
    
    $scope.fileUpload = function(imageType) {
        $http.defaults.withCredentials = false;
        var uploadUrl = "https://storage.googleapis.com/public-prod-preppo/news/" + Math.random().toString(36).substr(2, 9) + '_' + $scope.imageInfo[imageType].chosenFile.name;
        var fd = new FormData();
        fd.append('file', $scope.imageInfo[imageType].chosenFile);
        
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data, status, header, config) {
            $scope.imageInfo[imageType].chosenFileUploadStatus = 3;
            $scope.imageInfo[imageType].uploadedFileURL = uploadUrl;
        })
        .error(function(data, status, header, config) {
            $scope.imageInfo[imageType].chosenFileUploadStatus = 2;
        });
    };
    
    $scope.removeFile = function(imageType) {
        $scope.imageInfo[imageType].chosenFileUploadStatus = 0;
        $scope.imageInfo[imageType].chosenFile = null;
        $scope.imageInfo[imageType].isImageFileChosen = false;
        $scope.imageInfo[imageType].uploadedFileURL = "";
        var control = $('#news-'+imageType);
        control.replaceWith( control = control.clone( true ) );
    };
    
    $scope.createNewDetail = function(lang) {
        if(lang == 'english') {
            $scope.isCreating.english = true;
            CKEDITOR.instances.editor1.setData("", function() {CKEDITOR.instances.editor1.focus();});
        }
        else {
            $scope.isCreating.hindi = true;
            CKEDITOR.instances.editor2.setData("", function() {CKEDITOR.instances.editor2.focus();});
        }
    };
    
    $scope.save = function(lang) {
        var data;
        if(lang == 'english') {
            data = CKEDITOR.instances.editor1.getData();
        }
        else {
            data = CKEDITOR.instances.editor2.getData();
        }
        data = data.replace("<strong>", "<b>");
        data = data.replace("</strong>", "</b>");
        data = data.replace("<em>", "<i>");
        data = data.replace("</em>", "</i>");
        if($scope.isCreating[lang]) {
            $scope.newsUpdateData.content[lang].points.push(data);
            $scope.isCreating[lang] = false;
        }
        else {
            $scope.newsUpdateData.content[lang].points[$scope.indexBeingEdited[lang]] = data;
            $scope.isEditing[lang] = false;
        }
    };
    
    $scope.edit = function(index, lang) {
        $scope.isEditing[lang] = true;
        $scope.indexBeingEdited[lang] = index;
        if(lang == 'english') {
            CKEDITOR.instances.editor1.setData($scope.newsUpdateData.content[lang].points[index]);
            CKEDITOR.instances.editor1.focus();
        }
        else {
            CKEDITOR.instances.editor2.setData($scope.newsUpdateData.content[lang].points[index]);
            CKEDITOR.instances.editor2.focus();
        }
        
    };
    
    $scope.remove = function(index, lang) {
        $scope.newsUpdateData.content[lang].points.splice(index, 1);
    };
    
    $scope.prepareData = function() {
        var data = {
            content: $scope.newsUpdateData.content,
            publishDate: $scope.newsUpdateData.publishDate
        };
        
        for(var i=0; i<$scope.imageTypes.length; i++) {
            if($scope.imageInfo[$scope.imageTypes[i]].isImageFileChosen && $scope.imageInfo[$scope.imageTypes[i]].chosenFileUploadStatus == 3) {
                data[$scope.imageTypes[i]] = $scope.imageInfo[$scope.imageTypes[i]].uploadedFileURL;
            }
        }

        var selectedCategories = [];
        for(var i=0; i<$scope.isSelected.length; i++) {
            if($scope.isSelected[i]) {
                selectedCategories.push($scope.categories[i]);
            }
        }
        if(selectedCategories.length > 0) {
            data['categories'] = selectedCategories;
        }

        var tags = $scope.tags.split(",");
        for(var i=tags.length-1; i>=0; i--) {
            tags[i] = tags[i].trim();
            if(tags[i] == "") {
                tags.splice(i, 1);   
            }
        }
        if(tags.length>0) {
            data['tags'] = tags;
        }
        return data;
    }
    
    $scope.resetValues = function() {
        var dt = $scope.newsUpdateData.publishDate;
        $scope.newsUpdateData = {
            content: {
                english: {
                    heading: "",
                    points: []
                },
                hindi: {
                    heading: "",
                    points: []
                }
            },
            publishDate: dt
        };

        for(var i=0; i<$scope.categories.length; i++) {
            $scope.isSelected[i] = false;
        }
        $scope.tags = "";

        for(var i=0; i<$scope.imageTypes.length; i++) {
            $scope.imageInfo[$scope.imageTypes[i]].isImageFileChosen = false;
            $scope.imageInfo[$scope.imageTypes[i]].chosenFileUploadStatus = 0;
            $scope.imageInfo[$scope.imageTypes[i]].chosenFile = null;
            $scope.imageInfo[$scope.imageTypes[i]].uploadedFileURL = "";

            var control = $('#news-'+$scope.imageTypes[i]);
            control.replaceWith( control = control.clone( true ) );
        }
        
        $scope.isCreating = {
            english: false,
            hindi: false
        };
        $scope.isEditing = {
            english: false,
            hindi: false
        };
        $scope.indexBeingEdited = {
            english: -1,
            hindi: -1
        };
        $scope.langDetails = 'english';
    };
    
    function simonGoBack() {
        $window.history.back();
    }
    
    $scope.submit = function() {
        if($scope.imageInfo['imageMobile'].chosenFileUploadStatus == 1 || $scope.imageInfo['imageWeb'].chosenFileUploadStatus == 1) {
            alert("Image file is uploading");
            return;
        }
        $scope.$parent.loading = true;
        var data = $scope.prepareData();
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            }
        };
        
        var url = domainName + "/v1/admin/news";
        $http.defaults.withCredentials = true;
        $http.post(url, data, config).then(function successCallback(response){
            $scope.resetValues();
            $scope.$parent.loading = false;
            alert("News update saved successfully.");
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            alert("Check internet connection.");
            console.log(JSON.stringify(response));
        });
    };
    
    $scope.close = function() {
        simonGoBack();  
    };
    
}]);