require(Modules.AI)

var dialogflow, call, hangup, number, name, ewid;

// Create outbound call as soon as StartScenarios HTTP API arrives
VoxEngine.addEventListener(AppEvents.Started, (e) => {
    // Attention - VoxEngine.customData() maximum size is 200 bytes and must include phone number, name and EW ID - This is not enforced by any
    // code currently
     let data = VoxEngine.customData().split("__"); // we split the input data up based on our predetermined split characters
     number = data[0];
     name = data[1];
     ewid = data[2];
     
     call = VoxEngine.callPSTN(number, "61383758803") // replace CALLER_ID with the number we bought and connected to our application on the Voximplant website
     call.addEventListener(CallEvents.Connected, onCallConnected)
     call.addEventListener(CallEvents.Disconnected, VoxEngine.terminate)
     call.addEventListener(CallEvents.Failed, VoxEngine.terminate)
})

function onCallConnected(e) {
  // Create Dialogflow object
	dialogflow = AI.createDialogflow({
	  lang: DialogflowLanguage.ENGLISH_US
	})
	dialogflow.addEventListener(AI.Events.DialogflowResponse, onDialogflowResponse)
    // Set our payload which will be sent to our Dialogflow agent with our WELCOME event request
    dialogflow.setQueryParameters({payload: {"name":name, "ew_id":ewid}}); 
    // Sending WELCOME event to let the agent says a welcome message
    dialogflow.sendQuery({event : {name: "WELCOME", language_code:"en"}});
    // Playback marker used for better user experience
    dialogflow.addMarker(-300)
    // Start sending media from Dialogflow to the call
    dialogflow.sendMediaTo(call)
    dialogflow.addEventListener(AI.Events.DialogflowPlaybackFinished, (e) => {
      // Dialogflow TTS playback finished. Hangup the call if hangup flag was set to true
      if (hangup) call.hangup()
    })
    dialogflow.addEventListener(AI.Events.DialogflowPlaybackStarted, (e) => {
      // Dialogflow TTS playback started
    })
    dialogflow.addEventListener(AI.Events.DialogflowPlaybackMarkerReached, (e) => {
      // Playback marker reached - start sending audio from the call to Dialogflow
      call.sendMediaTo(dialogflow)
    })
}

// Handle Dialogflow responses
function onDialogflowResponse(e) {
  // If DialogflowResponse with queryResult received - the call stops sending media to Dialogflow
  // in case of response with queryResult but without responseId we can continue sending media to dialogflow
  if (e.response.queryResult !== undefined && e.response.responseId === undefined) {
    call.sendMediaTo(dialogflow)
  } else if (e.response.queryResult !== undefined && e.response.responseId !== undefined) {
  	// Do whatever required with e.response.queryResult or e.response.webhookStatus
        // If we need to hangup because end of conversation has been reached
        if (e.response.queryResult.diagnosticInfo !== undefined && 
           e.response.queryResult.diagnosticInfo.end_conversation == true) {
           hangup = true
        }

    // Telephony messages arrive in fulfillmentMessages array
    if (e.response.queryResult.fulfillmentMessages != undefined) {
    	e.response.queryResult.fulfillmentMessages.forEach((msg) => {
          Logger.write("insideTelephonyRequestFullfillment")
      		if (msg.platform !== undefined && msg.platform === "TELEPHONY") {
            Logger.write("Inside platform is telephony")
          }
    	})
  	}
  }
}