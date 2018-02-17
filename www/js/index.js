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
var parentDirectory;
var maxHeight = 0;
var maxWidth = 0;
var patientPicsButtonPressed = false;
var treatmentSheetPicsButtonPressed = false;
var cameraActive = false;
var flashMode = "off";


// var cameraExit;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    //Bind Event Listeners
    bindEvents:function(){
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("backbutton", backButtonPressed, false);
        document.addEventListener("pause", onPause, false);

    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        console.log("Device is ready for work");
        this.receivedEvent('patientDetail');
  
        universalLinks.subscribe('linkFunctionHandler',linkFunctionHandler);
    },


    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var patientNameDisplay = parentElement.querySelector('#patient_name');

        console.log('Received Event: ' + id);
    }
};

window.addEventListener("orientationchange", function() {
    console.log(screen.orientation.type); // e.g. portrait

    //restart the camera when screen orientation changes
    if(cameraActive){
      console.log("orientation change detected, restarting camera");
      stopCamera();
      startCamera(window.eventData);
    }

});

function onPause(){

    //lock the screen orientation if the camera is active
    // if(cameraActive){
    //     screen.orientation.lock(screen.orientation.type);
    // }
}

function onResume(){
    console.log("<<<<<<<RESUME THE APP>>>>>>>>>");


    //restart the camera when orientation changes
    if(cameraActive){
      console.log("App resumes, restarting camera");
      // screen.orientation.unlock();
      stopCamera();
      startCamera(window.eventData);
    }

}

function backButtonPressed(){

    //if the camera is active, get rid of the camera
    if(cameraActive){

        CameraPreview.stopCamera();

        console.log("camera is stopped");

        //remove the camera and flash button
        $('#cameraIcon').remove();
        $("#flashButton").remove();

        cameraActive = false;

        // document.body.classList.remove("noDisplay");
        $("body").children().show();

        //set the background color of body to white when camera exits
        $("body").css("background-color","white");

        //allow the device to go to sleep again
        window.plugins.insomnia.allowSleepAgain();

    }else{
        navigator.app.exitApp();
    }
}

function doubleDigit(dateOrTime){
  if(dateOrTime.length < 2){
    dateOrTime = "0" + dateOrTime; 
  }

  return dateOrTime;

}


function linkFunctionHandler(eventData){



    /* 
      ====================================
          GET RID OF CAMERA INTERFACE 
      ====================================
    */

    resetCameraInterface();



    //pass the eventData to global variable
    window.eventData = eventData;
    resetButtonsPressed();

    console.log("this subscribed function is executed");

    //display patient name
    var patientName = decodeURIComponent(eventData.params['patient']);
    var patientNameDisplay = document.querySelector("#patient_name");
    patientNameDisplay.textContent = patientName;

    //display consultation number
    var consNumber = eventData.params['code'];
    var consNumberDisplay = document.querySelector("#consultation_number");
    consNumberDisplay.textContent = consNumber;

    // remove all buttons from html body
    $("#divButtonPatient,#divButtonTreatment,#divButtonExit").remove();

    //add 2 new buttons everytime a new link is passed to the app
    addButtons();

    //get the focus mode that is currently used by the camera device
    CameraPreview.getFocusMode(function(currentFocusMode){
      console.log("The device current focus mode is " + currentFocusMode);
    });

}


//create 2 buttons and add them to html body
function addButtons(){

    console.log("addButtons() function is executed");

    //create 2 buttons to take picture
    var takePatientPicsButton = document.createElement("INPUT")
    takePatientPicsButton.setAttribute("id","patientPicsButton");
    takePatientPicsButton.setAttribute("type","button");
    takePatientPicsButton.setAttribute("value","TAKE PATIENT PICTURES");
    takePatientPicsButton.addEventListener("click",takePatientPictures);
    takePatientPicsButton.className = "btn btn-primary btn-outlined";

    var takeTreatmentSheetPicsButton = document.createElement("INPUT")
    takeTreatmentSheetPicsButton.setAttribute("id","treatmentSheetPicsButton");
    takeTreatmentSheetPicsButton.setAttribute("type","button");
    takeTreatmentSheetPicsButton.setAttribute("value","TAKE TREATMENT SHEET PICTURES");
    takeTreatmentSheetPicsButton.addEventListener("click",takeTreatmentSheetPictures);
    takeTreatmentSheetPicsButton.className = "btn btn-positive btn-outlined";

    var exitButton = document.createElement("INPUT")
    exitButton.setAttribute("id","exitButton");
    exitButton.setAttribute("type","button");
    exitButton.setAttribute("value","EXIT APP");
    exitButton.addEventListener("click",exitApp);
    exitButton.className = "btn btn-negative btn-outlined noDisplay";

    //create div container for the 2 buttons
    var divButtonPatient = document.createElement("DIV");
    divButtonPatient.setAttribute("id","divButtonPatient");
    divButtonPatient.classList.add("content-padded");
    divButtonPatient.appendChild(takePatientPicsButton);

    var divButtonTreatment = document.createElement("DIV");
    divButtonTreatment.setAttribute("id","divButtonTreatment");
    divButtonTreatment.classList.add("content-padded");
    divButtonTreatment.appendChild(takeTreatmentSheetPicsButton);

    //create the exit app button
    var divButtonExit = document.createElement("DIV");
    divButtonExit.setAttribute("id","divButtonExit");
    divButtonExit.classList.add("content-padded");
    divButtonExit.appendChild(exitButton);


    //add the 2  buttons to home view
    document.body.append(divButtonPatient,divButtonTreatment,divButtonExit);


    //add invisible checklist next to both buttons
    var blueCheck = document.createElement("IMG");
    blueCheck.setAttribute("id","blueCheck");
    blueCheck.setAttribute("src","checkButtons/blueCheck.png");
    blueCheck.classList.add("noDisplay");

    var greenCheck = document.createElement("IMG");
    greenCheck.setAttribute("id","greenCheck");
    greenCheck.setAttribute("src","checkButtons/greenCheck.jpg");
    greenCheck.classList.add("noDisplay");


    //check offset of the 2 buttons
    console.log("takePatientPicsButton offsetLeft value is " + takePatientPicsButton.offsetLeft);
    console.log("takeTreatmentSheetPicsButton offsetLeft value is " + takeTreatmentSheetPicsButton.offsetLeft);
    console.log("takePatientPicsButton offsetWidth value is " + takePatientPicsButton.offsetWidth);
    console.log("takeTreatmentSheetPicsButton offsetWidth value is " + takeTreatmentSheetPicsButton.offsetWidth);

    var blueCheckLeftOffset = takePatientPicsButton.offsetLeft + takePatientPicsButton.offsetWidth + "px";
    var greenCheckLeftOffset = takeTreatmentSheetPicsButton.offsetLeft + takeTreatmentSheetPicsButton.offsetWidth + "px";

    console.log("blueCheckLeftOffset is " + blueCheckLeftOffset);
    console.log("greenCheckLeftOffset is " + greenCheckLeftOffset);

    blueCheck.style.left = blueCheckLeftOffset;
    greenCheck.style.left = greenCheckLeftOffset;


    divButtonPatient.appendChild(blueCheck);
    divButtonTreatment.appendChild(greenCheck);

}

/* 
   ========================================
     FUNCTIONS TO REACT TO BUTTON CLICKS
   ========================================
*/


function takePatientPictures(){
    console.log("takePatientPictures button function is executed");
    window.parentDirectory = "Patient Pictures"
    startCamera(window.eventData);

    //change the style of the button to button block
    var takePatientPicsButton = document.getElementById("patientPicsButton"); 
    if(takePatientPicsButton.classList.contains("btn-outlined")){

        //replace the button style to btn-block
        takePatientPicsButton.classList.replace("btn-outlined","btn-block");

        // takePatientPicsButton.setAttribute("style","margin-right: -20px;");


        //display the blue check next to the button
        var blueCheck = document.getElementById("blueCheck");
        blueCheck.classList.remove("noDisplay");

        //change the margin-right of divButtonPatient after adding the blue tick 
        var parentWidth = $("#divButtonPatient").parent().width();
        var offset = 23/parentWidth * 100;
        var newRightMargin = (50 - offset) + "%";

        console.log("divButtonPatient parent container has a width of" + parentWidth);
        console.log("newRightMargin value is " + newRightMargin);

        $("#divButtonPatient").css("margin-right",newRightMargin);

        //tell the app that this button has been pressed
        window.patientPicsButtonPressed= true;
        showExitButton();

    }


}

function takeTreatmentSheetPictures(){
    console.log("takeTreatmentSheetPictures button function is executed");
    window.parentDirectory = "Treatment Sheet Pictures"
    // startCamera(window.eventData);
    // takingPictures(window.eventData,parentDirectory);
    startCamera(window.eventData);

    //change the style of the button to button block
    var takeTreatmentSheetPicsButton = document.getElementById("treatmentSheetPicsButton"); 
    if(takeTreatmentSheetPicsButton.classList.contains("btn-outlined")){

        //replace the button style to btn-block
        takeTreatmentSheetPicsButton.classList.replace("btn-outlined","btn-block");

        //display the blue check next to the button
        var greenCheck = document.getElementById("greenCheck");
        greenCheck.classList.remove("noDisplay");

        //change the margin-right of divButtonTreatment after adding the green tick 
        var parentWidth = $("#divButtonTreatment").parent().width();
        var offset = 33/parentWidth * 100;
        var newRightMargin = (50 - offset) + "%";

        console.log("divButtonTreatment parent container has a width of" + parentWidth);
        console.log("newRightMargin value is " + newRightMargin);

        $("#divButtonTreatment").css("margin-right",newRightMargin);

       //tell the app that this button has been pressed
        window.treatmentSheetPicsButtonPressed= true;
        showExitButton();
    }

}

//make the exit button visible
function showExitButton(){

    console.log("=============================================");

    //make the exit button visible
    if(window.treatmentSheetPicsButtonPressed == true  && window.patientPicsButtonPressed == true){
        console.log("BOTH BUTTONS ARE ALREADY PRESSED");
        var exitButton = document.getElementById("exitButton");
        exitButton.classList.remove("noDisplay");
    }
    
    console.log("=============================================");

}

//make both buttonPressed variables false
function resetButtonsPressed(){
    window.patientPicsButtonPressed = false;
    window.treatmentSheetPicsButtonPressed = false;
}

function exitApp(){

    resetButtonsPressed();

    // exit app
    navigator.app.exitApp();

}



/*
=================================
      STARTING THE CAMERA
=================================
*/
function startCamera(eventData){
    console.log("cameraActive boolean is " + cameraActive);

    $('body').css("background-color","transparent");

    var options = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: CameraPreview.CAMERA_DIRECTION.BACK,
      toBack: true,
      tapPhoto: false,
      tapFocus: true,
      previewDrag: false
    }


    
    CameraPreview.startCamera(options, function(){



        //tell the app that the camera is being used
        if(!cameraActive){
            cameraActive = true;


            //hide every child inside body element
            // document.body.classList.add("noDisplay");
            $("body").children().hide();


            //add camera icon at the bottom right to take picture
            var cameraIcon = document.createElement("IMG");
            cameraIcon.addEventListener("click",takePicture);
            cameraIcon.setAttribute("id","cameraIcon");

            //gives the camera ability to turn flash on/off
            var flashButton = document.createElement("IMG");
            flashButton.addEventListener("click",changeFlashMode);
            flashButton.setAttribute("id","flashButton");


            document.body.append(cameraIcon,flashButton);

            //give the camera icon an image
            $("#cameraIcon").attr("src","img/camera_large.png");

            //Give flashButton an image
            if(flashMode == "on"){
              $("#flashButton").attr("src","img/flash_on.png");
              CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.ON);
              console.log("<<<<<<CAMERA FLASH IS ON>>>>");
            }else{
              $("#flashButton").attr("src","img/flash_off.png");
              CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.OFF);
              console.log("<<<<<<CAMERA FLASH IS OFF>>>>");
            }
            // if(flashMode == "on"){
            //   console.log("Flash mode is on");
            // }else{
            //   console.log("Flash mode is on");
            // }

            //prevent device from sleeping
            window.plugins.insomnia.keepAwake();
        }


    });
}

function stopCamera(){
    CameraPreview.stopCamera();
}

function changeFlashMode(){

  //toggle flash mode on/off
  if(flashMode == "on"){
    flashMode = "off";
    $("#flashButton").attr("src","img/flash_off.png");
    CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.OFF);

  }else{
    flashMode = "on";
    $("#flashButton").attr("src","img/flash_on.png");
    CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.ON);
  }

}


/*
=========================
 TAKING PICTURE FUNCTION
=========================

*/
function takePicture(){


    //get the array of supported picture sizes on the device
    CameraPreview.getSupportedPictureSizes(function(dimensions){

        //get the maximum supported resolution
        for(var i = 0; i < dimensions.length; i++){
            //this is just to see if there are any changes is android studio
            // alert("The resolution of dimension array [" + i + "]" + " is " + dimensions[i].width+ " x " + dimensions[i].height);
            if(dimensions[i].height > maxHeight && dimensions[i].width > maxWidth){
                maxHeight = dimensions[i].height;
                maxWidth = dimensions[i].width;
            }
        }
        // maxWidth = maxWidth * 4;
        // maxHeight = maxHeight * 4;

        console.log("maximum resolution supported by the camera is " + maxWidth + " x " + maxHeight);
        // alert("The maximum resolution chosen by OmniaCam app is " + maxWidth + " x " + maxHeight);
        console.log("maxWidth is " + maxWidth);
        console.log("maxHeight is " + maxHeight);

        CameraPreview.takePicture({height:maxHeight, width:maxWidth, quality: 100}, function(picture){


            var contentType = "image/jpg";
            var parentDirectory = window.parentDirectory;
            var date = new Date();

            var consNumber = window.eventData.params['code'];
            var consFolderName = "cons_" + consNumber;

            //construct a new date/time stamp for the image file
            var fullDate = date.getFullYear().toString() + 
                            doubleDigit((date.getMonth() + 1).toString()) + 
                            doubleDigit(date.getDate().toString());
            var timeStamp = doubleDigit(date.getHours().toString()) + 
                            doubleDigit(date.getMinutes().toString()) + 
                            doubleDigit(date.getSeconds().toString()) + "-" + 
                            date.getMilliseconds().toString();

            var dateTimeStamp = fullDate + "_" + timeStamp;


            //provide a new name for the image
            var newImageName = consNumber + "_" + dateTimeStamp + ".jpg";
            console.log("the newImageName is " + newImageName);

            cordova.plugins.diagnostic.getExternalSdCardDetails(function(sdCardArray){

                //save to external SD card if there's any on the device
                if(sdCardArray.length > 0){
                    sdCardArray.forEach(function(sdCard){
                        if(sdCard.canWrite && sdCard.type == "application"){

                            saveToNewPath2(newImageName,sdCard.filePath,consFolderName,parentDirectory,picture,contentType);
                        }
                    });

                //otherwise, save it to the device's internal storage 
                //with root folder as the new parent directory
                } else{
                    saveToNewPath2(newImageName,cordova.file.externalRootDirectory,consFolderName,parentDirectory,picture,contentType);
                }

            }, function(error){
                console.error(error);
                console.log("Have trouble with storing in SD Card");
            });
        }); 

    });

    //check the values of maxHeight and maxWidth variables
    // console.log("maxHeight is " + maxHeight);
    // console.log("maxWidth is " + maxWidth);

}

/*
=======================================
 ALTERNATIVE TAKING PICTURE FUNCTION
=======================================
*/

function takingPictures(eventData,parentDirectory){


    // Define the options for camera
    // this.eventData = eventData;
    var options = { correctOrientation: true,
                    quality: 100};


    console.log("takingPictures() function is executed");

    navigator.camera.getPicture(function cameraSuccessCallBack(result){


        // convert JSON string to JSON Object
        var thisResult = JSON.parse(result);

        // convert json_metadata JSON string to JSON Object 
        var metadata = JSON.parse(thisResult.json_metadata);

        //extract image file URI from the JSON object 
        var imageFileURI = thisResult.filename; 

        //get date and time stamp and format it accordingly
        var dateTimeStamp = metadata.datetime;
        dateTimeStamp = dateTimeStamp.replace(/\s/g, '_');
        dateTimeStamp = dateTimeStamp.replace(/:/g, '');

        console.log("the image file URI is " + imageFileURI);
        console.log("The URL that opened the camera is " + eventData.url);
        console.log("The URL path component that opened the camera is " + eventData.url);
        console.log("The type query parameter passed is " + eventData.params['type']);
        console.log("The consultation number parameter passed is " + eventData.params['code']);
        console.log("The date and time stamp is " + dateTimeStamp);


        //save consultation and date/time number in a variable
        var consNumber = eventData.params['code'];
        var consFolderName = "cons_" + consNumber;
        var imageFormat = imageFileURI.substring(imageFileURI.lastIndexOf('.'));
        var newImageName = consNumber + "_" + dateTimeStamp + imageFormat;

        console.log("The new image name is " + newImageName);


        /*
        ===============================================================================================================
                                  THIS SECTION BELOW IS MEANT TO MOVE THE IMAGE FILE TO:
                  <root directory folder>/consImages/cons_[consNumber]/{Patient Pictures OR Treament Sheet Pictures}
        ===============================================================================================================
        */

        window.resolveLocalFileSystemURL(imageFileURI,function(fileEntry){


            cordova.plugins.diagnostic.getExternalSdCardDetails(function(details){

                //save to external SD card if there's any on the device
                if(details.length > 0){
                    details.forEach(function(detail){
                        if(detail.canWrite && detail.type == "application"){

                            saveToNewPath(fileEntry,newImageName,detail.filePath,consFolderName,parentDirectory);
                        }
                    });

                //otherwise, save it to the device's internal storage 
                //with root folder as the new parent directory
                } else{
                    saveToNewPath(fileEntry,newImageName,cordova.file.externalRootDirectory,consFolderName,parentDirectory);
                }

            }, function(error){
                console.error(error);
                console.log("Have trouble with storing in SD Card");
            });
          
        },onErrorGettingImageFileEntry);


        //take more pictures
        takingPictures(eventData,parentDirectory);

    },cameraExit,options);


};

function resetCameraInterface(){

  //get rid of camera button and flash icon
  $("#cameraIcon").remove();
  $("#flashButton").remove();

  stopCamera();

  cameraActive = false;

  //reset the background color of body to white 
  $("body").css("background-color","white");

}

/**
 * Convert a base64 string in a Blob according to the data and contentType.
 * 
 * @param b64Data {String} Pure base64 string without contentType
 * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
 * @param sliceSize {Int} SliceSize to process the byteCharacters
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 * @return Blob
 */
function b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);

          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }

          var byteArray = new Uint8Array(byteNumbers);

          byteArrays.push(byteArray);
      }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}


/**
 * Create a Image file according to its database64 content only.
 * 
 * @param folderpath {String} The folder where the file will be created
 * @param newImageName {String} The name of the file that will be created
 * @param content {Base64 String} Important : The content can't contain the following string (data:image/png[or any other format];base64,). Only the base64 string is expected.
 */
function savebase64AsImageFile(parentDirectory,filename,content,contentType){
    // Convert the base64 string in a Blob
    var DataBlob = b64toBlob(content,contentType);
    
    // console.log("Starting to write the file :3");
    
    window.resolveLocalFileSystemURL(parentDirectory, function(dir) {
        // console.log("Access to the directory granted succesfully");
        dir.getFile(filename, {create:true}, function(file) {
                // console.log("File created succesfully.");
                file.createWriter(function(fileWriter) {
                    // console.log("Writing content to file");
                    fileWriter.write(DataBlob);
                }, function(){
                    console.log('Unable to save file in '+ parentDirectory);
                });
        });
    });
}


//move the image file entry to a new path specified
function saveToNewPath2(newImageName,rootDirectory,consFolderName,parentDirectory,content,contentType){

    var dataBlob = b64toBlob(content,contentType);

    /* 
    ========================================================================
                                SAVE FILE TO:
    <rootDirectory>/Consulation Images/consFolderName/parentDirectory
    ========================================================================
    */
    window.resolveLocalFileSystemURL(rootDirectory,function(rootDirEntry){

        rootDirEntry.getDirectory("Consultation Images", {create: true}, function(imgDirEntry){
            imgDirEntry.getDirectory(consFolderName, {create: true}, function(consDirEntry){
                consDirEntry.getDirectory(parentDirectory, {create: true}, function(parentDirEntry){

                    // console.log("Access to the directory granted succesfully");
                    parentDirEntry.getFile(newImageName, {create:true}, function(file) {
                            // console.log("File created succesfully.");
                            file.createWriter(function(fileWriter) {
                                // console.log("Writing content to file");
                                fileWriter.write(dataBlob);
                            }, function(){
                                console.log('Unable to save file in '+ parentDirectory);
                            });
                    });

                }, onErrorCreatingParentDirEntry);

            }, onErrorCreatingConsDirEntry);
        }, onErrorCreatingImagesDirEntry);

    });

}

//move the image file entry to a new path specified
function saveToNewPath(fileEntry,newImageName,rootDirectory,consFolderName,parentDirectory){

    var rootDirectory = rootDirectory;

    /* SAVE FILE TO:
    <rootDirectory>/Consulation Images/consFolderName/parentDirectory
    */
    window.resolveLocalFileSystemURL(rootDirectory,function(rootDirEntry){

        rootDirEntry.getDirectory("Consultation Images", {create: true}, function(imgDirEntry){
            imgDirEntry.getDirectory(consFolderName, {create: true}, function(consDirEntry){
                consDirEntry.getDirectory(parentDirectory, {create: true}, function(parentDirEntry){

                    // move the file entry to new directory
                    fileEntry.moveTo(parentDirEntry, newImageName, function(newFileEntry){

                        console.log("The new file entry full path is " + newFileEntry.fullPath);

                    }, function(Error){
                        console.log("the move operation has failed");
                    });

                }, onErrorCreatingParentDirEntry);

            }, onErrorCreatingConsDirEntry);
        }, onErrorCreatingImagesDirEntry);

    });

}


/*
==========================================
     COLLECTION OF ERROR CALLBACKS
==========================================
*/


function cameraExit(errorMessage){
    console.log("Exiting camera");
    showExitButton();
}

function onErrorSavingToRootDirectory(){
    console.log("There is an error creating fileEntry object");
}

//print out error message
function onErrorGettingImageFileEntry(){
    console.log("There is an error in the parent directory");
}

function onErrorCreatingConsDirEntry(){
    console.log("There is an error creating the consultation directory entry");
}

function onErrorCreatingImagesDirEntry(){
    console.log("There is an error creating the images directory entry");
}

function onErrorCreatingParentDirEntry(){
    console.log("There is an error creating the parent directory");
}


app.initialize();