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
var previousOrientation;
// var cameraExit;
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
        document.addEventListener("resume", onResume, false);
  
        universalLinks.subscribe('linkFunctionHandler',linkFunctionHandler);
    },


    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var patientNameDisplay = parentElement.querySelector('#patient_name');

        console.log('Received Event: ' + id);
    }
};

function onResume(){
    console.log("====================PROGRAM RESUMES====================================");
}

window.addEventListener("orientationchange", function() {
    console.log(screen.orientation.type); // e.g. portrait
});


function linkFunctionHandler(eventData){

    //pass the eventData to global variable
    window.eventData = eventData;

    console.log("this subscribed function is executed");

    //display patient name
    var patientName = decodeURIComponent(eventData.params['patient']);
    var patientNameDisplay = document.querySelector("#patient_name");
    patientNameDisplay.textContent = patientName;

    //display consultation number
    var consNumber = eventData.params['code'];
    var consNumberDisplay = document.querySelector("#consultation_number");
    consNumberDisplay.textContent = consNumber;

    // remove the 2 buttons from html body
    // var buttonContainer = document.querySelector("#buttonContainer");
    var divButtonPatient = document.getElementById("divButtonPatient");
    var divButtonTreatment = document.getElementById("divButtonTreatment");

    if(divButtonPatient){
        divButtonPatient.parentNode.removeChild(divButtonPatient);
    }

    if(divButtonTreatment){
        divButtonTreatment.parentNode.removeChild(divButtonTreatment);
    }

    //add 2 new buttons everytime a new link is passed to the app
    addButtons();

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

    //create div container for the 2 buttons
    var divButtonPatient = document.createElement("DIV");
    divButtonPatient.setAttribute("id","divButtonPatient");
    divButtonPatient.classList.add("content-padded");
    divButtonPatient.appendChild(takePatientPicsButton);

    var divButtonTreatment = document.createElement("DIV");
    divButtonTreatment.setAttribute("id","divButtonTreatment");
    divButtonTreatment.classList.add("content-padded");
    divButtonTreatment.appendChild(takeTreatmentSheetPicsButton);


    //add the 2  buttons to home view
    document.body.append(divButtonPatient,divButtonTreatment);


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

/* ========================================
    FUNCTIONS TO REACT TO BUTTON CLICKS
   ========================================
*/


function takePatientPictures(){
    console.log("takePatientPictures button function is executed");
    var parentDirectory = "Patient Pictures"
    takingPictures(window.eventData,parentDirectory);

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
        var newRightMargin = (50 - (23/parentWidth * 100)) + "%";

        console.log("divButtonPatient parent container has a width of" + parentWidth);
        console.log("newRightMargin value is " + newRightMargin);

        $("#divButtonPatient").css("margin-right",newRightMargin);

    }


}

function takeTreatmentSheetPictures(){
    console.log("takeTreatmentSheetPictures button function is executed");
    var parentDirectory = "Treatment Sheet Pictures"
    takingPictures(window.eventData,parentDirectory);

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
        var newRightMargin = (50 - (33/parentWidth * 100)) + "%";

        console.log("divButtonTreatment parent container has a width of" + parentWidth);
        console.log("newRightMargin value is " + newRightMargin);

        $("#divButtonTreatment").css("margin-right",newRightMargin);
    }

}


/*
=================================
TAKING PICTURE FUNCTION
=================================
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