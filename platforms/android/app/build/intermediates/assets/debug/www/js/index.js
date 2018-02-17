/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var eventData;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    //Bind Event Listeners
    bindEvents:function(){
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        console.log("Device is ready for work");
        this.receivedEvent('deviceready');
        // universalLinks.subscribe('openNewsListPage',app.onNewsListPageRequested);
        // universalLinks.subscribe('openNewsDetailedPage',app.onNewsDetailedPageRequested);
        // universalLinks.subscribe('launchedAppFromLink',app.onApplicationDidLaunchFromLink);
        universalLinks.subscribe('takingPictures',takingPictures);
    },


    //openNewsListPage event handler
    // onNewsListPageRequested: function(eventData){
    //     console.log('Showing list of awesome news');

    //     //do some work to show list of news
    // },

    //openNewsDetailedPage event handler
    // onNewsDetailedPageRequested: function(eventData){
    //     console.log('Showing to user details page: ' + eventData.path);

    //     //do some work to show detailed page
    // },

    // onApplicationDidLaunchFromLink: function(eventData){
    //     console.log("Did launch app from link " + eventData.url);
    // },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function takingPictures(eventData){

    // Define the options for camera
    // this.eventData = eventData;
    var options = { correctOrientation: true};

    navigator.camera.getPicture(function cameraSuccessCallBack(imageFileURI){
        console.log("the image file URI is " + imageFileURI);
        console.log("The URL that opened the camera is " + eventData.url);
        console.log("The URL path component that opened the camera is " + eventData.url);
        console.log("The type query parameter passed is " + eventData.params['type']);
        console.log("The consultation number parameter passed is " + eventData.params['code']);

        //save consultation and date/time number in a variable
        var consNumber = eventData.params['code'];
        var consFolderName = "cons_" + consNumber;
        var originalFileName = imageFileURI.substring(imageFileURI.lastIndexOf('/') + 1);
        var newImageName = consNumber + "_" + originalFileName;



        //print out the new image name [THIS IS JUST A TEST!]
        console.log("The new image name is " + newImageName);


        /*
        =======================================================
         THIS SECTION BELOW IS MEANT TO MOVE THE IMAGE FILE TO:
            <android app storage>/images/cons_[consNumber]/ 
        =======================================================
        */

        window.resolveLocalFileSystemURL(imageFileURI,function(fileEntry){

            //create a new URI for the new fileEntry object to be moved to
            var newParentDirectory = cordova.file.externalApplicationStorageDirectory;

            //THIS IS JUST A TEST -- print out the full path of the image file entry
            console.log("The file entry path is " + fileEntry.fullPath);




            //move the image fileEntry to the new directory
            window.resolveLocalFileSystemURL(newParentDirectory,function(rootDirEntry){
                rootDirEntry.getDirectory("images", {create: true}, function(imgDirEntry){
                    imgDirEntry.getDirectory(consFolderName, {create: true}, function(consDirEntry){

                        //move the image file to this sub directory
                        fileEntry.moveTo(consDirEntry,newImageName,function(newImageFileEntry){

                            //print out the path of the new image file entry object
                            console.log("The new image's file path is " + newImageFileEntry.fullPath);

                        }, function(Error){

                            //print out error message if there's something wrong with the moveTo method
                            console.log("There's an error in moveTo method");

                        });

                    }, onErrorCreatingConsDirEntry);
                }, onErrorCreatingImagesDirEntry);

            }, onErrorSavingToRootDirectory);

        },onErrorResolveURL);


        /*
        ==========================================
             COLLECTION OF ERROR CALLBACKS
        ==========================================
        */
        //print out error message
        var onErrorSavingToRootDirectory = function(){
            console.log("There is an error creating fileEntry object");
        }

        //print out error message
        var onErrorResolveURL= function(){
            console.log("There is an error resolving URL");
        }

        var onErrorCreatingConsDirEntry = function(){
            console.log("There is an error creating the consultation directory entry");
        }

        var onErrorCreatingImagesDirEntry = function(){
            console.log("There is an error creating the images directory entry");
        }



        //take more pictures
        takingPictures(eventData);

    },cameraError,options);
}

function cameraError(errorMessage){
    console.log("The camera has an error:" + errorMessage);
}



app.initialize();