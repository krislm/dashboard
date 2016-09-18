angular.module('SimpleRESTIonic.controllers', [])

    .controller('LoginCtrl', function (Backand, $state, $rootScope, LoginService) {
        var login = this;

        function signin() {
            LoginService.signin(login.email, login.password)
                .then(function (result) {
                    console.warn(result);
                    LoginService.user = result;
                    onLogin();
                }, function (error) {
                    console.log(error)
                })
        }

        function anonymousLogin(){
            LoginService.anonymousLogin();
            onLogin();
        }

        function onLogin(){
            $rootScope.$broadcast('authorized');
            login.email = '';
            login.password = '';
            $state.go('tab.dashboard');
        }

        function signout() {
            LoginService.signout()
                .then(function () {
                    //$state.go('tab.login');
                    login.email = '';
                    login.password = '';
                    $rootScope.$broadcast('logout');
                    $state.go($state.current, {}, {reload: true});
                })

        }

        login.signin = signin;
        login.signout = signout;
        login.anonymousLogin = anonymousLogin;
    })

    .controller('DashboardCtrl', function (ItemsModel, CommentsModel, LoginService, $rootScope) {
        var vm = this;

        vm.objects = [];
        vm.newComment = '';
        vm.activeItemIndex = -1;

        vm.getItemComments = getItemComments;
        vm.createComment = createComment;
        vm.delete = deleteObject;
        vm.getAll = getAll;

        activate();

        function activate() {
            getAll();
        }


        function getItemComments(itemIndex, itemId) {
            ItemsModel.comments(itemId)
                .then(function(result) {
                    vm.comments = result.data;
                    vm.activeItemIndex = itemIndex;
                });
        }

        function createComment(item) {
            var comment = {
                author: LoginService.user.firstName,
                content: vm.newComment,
                item: item.id
            };
            CommentsModel.create(comment)
                .then(function (result) {
                    console.warn(result);
                    item.isCommenting = false;
                    item.comments.push(comment);
                });
        }

        function getAll() {
            ItemsModel.all()
                .then(function (result) {
                    vm.items = result.data.data;
                });
        }

        function deleteObject(id) {
            ItemsModel.delete(id)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
        }
    })

    .controller('PostCtrl', function (ItemsModel, $rootScope) {
        var vm = this;

        vm.objects = [];
        vm.edited = null;
        vm.isEditing = false;
        vm.isCreating = false;
        vm.getAll = getAll;
        vm.create = create;
        vm.update = update;
        vm.setEdited = setEdited;
        vm.isCurrent = isCurrent;
        vm.cancelEditing = cancelEditing;
        vm.cancelCreate = cancelCreate;
        vm.isAuthorized = false;

        /*function goToBackand() {
            window.location = 'http://docs.backand.com';
        }*/

        function getAll() {
            ItemsModel.all()
                .then(function (result) {
                    vm.data = result.data.data;
                });
        }

        function clearData(){
            vm.data = null;
        }

        function create(object) {
            ItemsModel.create(object)
                .then(function (result) {
                    cancelCreate();
                    getAll();
                });
        }

        function update(object) {
            ItemsModel.update(object.id, object)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
        }

        function initCreateForm() {
            vm.newObject = {name: '', description: ''};
        }

        function setEdited(object) {
            vm.edited = angular.copy(object);
            vm.isEditing = true;
        }

        function isCurrent(id) {
            return vm.edited !== null && vm.edited.id === id;
        }

        function cancelEditing() {
            vm.edited = null;
            vm.isEditing = false;
        }

        function cancelCreate() {
            initCreateForm();
            vm.isCreating = false;
        }

        $rootScope.$on('authorized', function () {
            vm.isAuthorized = true;
            getAll();
        });

        $rootScope.$on('logout', function () {
            clearData();
        });

        if(!vm.isAuthorized){
            $rootScope.$broadcast('logout');
        }

        initCreateForm();
        getAll();

    });

