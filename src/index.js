var https = require('https'); //include https
var http = require('http');

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION"); //log this for debugging
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to the My Arduino Home Skill, say turn all lights on or turn all lights off", true), //response for Alexa if you just call the skill without intent
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) { //switch statement to select the right intent
          case "turnAllLightsOn": //if you told alexa to turn all the lights on this will be true
          var endpoint = "https://USERNAME:PASSWORD@WEBSITEURL/lightswitch.php?relayset=1&action=update_relay&house_id=HOUSEID&tkn=WEBSITETOKEN&action_data=11111111111111" //https string to log data to phant phant
          https.get(endpoint, function (result) { //use https get request to send data to phant
          console.log('Success, with: ' + result.statusCode);
          context.succeed(
           generateResponse( //if you succeeded allow Alexa to tell you state of light
                buildSpeechletResponse("All lights are turned on", true),
                {}
            )
          )
          }).on('error', function (err) {
            console.log('Error, with: ' + err.message);
            context.done("Failed");
          });
            break;

          case "turnAllLightsOff": //the turn all lights off intent
            var endpoint2 = "https://USERNAME:PASSWORD@WEBSITEURL/lightswitch.php?relayset=1&action=update_relay&house_id=HOUSEID&tkn=WEBSITETOKEN&action_data=00000000000000"; // phant string to set light state to off
            https.get(endpoint2, function (result) {
            console.log('Success, with: ' + result.statusCode);
            context.succeed(
                generateResponse( //Alexa response if successful
                 buildSpeechletResponse("All lights are turned off", true),
                    {}
                )
            );
            }).on('error', function (err) {
            console.log('Error, with: ' + err.message);
            context.done("Failed");
            });
            break;

            case "turnLightOn": //the turn selected light on intent
            console.log(event.request.intent.slots.LightOnID.value)
            var temp_location = event.request.intent.slots.LightOnID.value
            var endpoint3 = "https://USERNAME:PASSWORD@WEBSITEURL/lightswitch_alexa.php?relayset=single_light&action=update_relay&house_id=HOUSEID&tkn=WEBSITETOKEN&action_data=1&relay_id=" + event.request.intent.slots.LightOnID.value; // phant string to set light state to on
            var body = ""
            https.get(endpoint3, (response) => {
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                  var data = JSON.parse(body)
                  if(data.error){
                      var errorOutput = data.error.message
                      context.succeed(
                        generateResponse(
                          buildSpeechletResponse(`There was an error. ${errorOutput}`, true),
                          {}
                        )
                      )
                  }else{
                      context.succeed(
                          generateResponse( //Alexa response if successful
                           buildSpeechletResponse(event.request.intent.slots.LightOnID.value + " light turned on", true),
                              {}
                          )
                      );
                  }
                })
            });
            break;

              case "turnLightOff": //the turn selected light off intent
                console.log(event.request.intent.slots.LightOffID.value)
                var temp_location = event.request.intent.slots.LightOffID.value
                var endpoint4 = "https://USERNAME:PASSWORD@WEBSITEURL/lightswitch_alexa.php?relayset=single_light&action=update_relay&house_id=HOUSEID&tkn=WEBSITETOKEN&action_data=0&relay_id=" + event.request.intent.slots.LightOffID.value; // phant string to set light state to on
                var body = ""
                https.get(endpoint4, (response) => {
                    response.on('data', (chunk) => { body += chunk })
                    response.on('end', () => {
                      var data = JSON.parse(body)
                      if(data.error){
                          var errorOutput = data.error.message
                          context.succeed(
                            generateResponse(
                              buildSpeechletResponse(`There was an error. ${errorOutput}`, true),
                              {}
                            )
                          )
                      }else{
                          context.succeed(
                              generateResponse( //Alexa response if successful
                               buildSpeechletResponse(event.request.intent.slots.LightOffID.value + " light turned off", true),
                                  {}
                              )
                          );
                      }
                    })
                });
                break;

                case "getTemp":
                  console.log(event.request.intent.slots.tempID.value)
                  var temp_location = event.request.intent.slots.tempID.value
                  var endpoint = "https://USERNAME:PASSWORD@WEBSITEURL/temps_alexa.php?house_id=HOUSEID&tkn=WEBSITETOKEN&get_temp_for=" + event.request.intent.slots.tempID.value; // ENDPOINT GOES HERE
                  var body = ""
                  https.get(endpoint, (response) => {
                    response.on('data', (chunk) => { body += chunk })
                    response.on('end', () => {
                      var data = JSON.parse(body)
                      if(data.error){
                          var errorOutput = data.error.message
                          context.succeed(
                            generateResponse(
                              buildSpeechletResponse(`There was an error. ${errorOutput}`, true),
                              {}
                            )
                          )
                      }else{
                          var tempOutput = data.temp_data
                          context.succeed(
                            generateResponse(
                              buildSpeechletResponse(`The current temperature for ${temp_location} is ${tempOutput} degrees`, true),
                              {}
                            )
                          )
                      }
                    })
                  });
                  break;

                  case "getGarageStatus":
                    //var garage_location = event.request.intent.slots.tempID.value
                    var endpoint = "https://USERNAME:PASSWORD@WEBSITEURL/garage.php?house_id=HOUSEID&tkn=WEBSITETOKEN&action=garage_data"; // ENDPOINT GOES HERE
                    var body = ""
                    https.get(endpoint, (response) => {
                      response.on('data', (chunk) => { body += chunk })
                      response.on('end', () => {
                        var data = JSON.parse(body)
                        var doorTitle = data.door_title
                        var doorStatus = data.door_status
                        context.succeed(
                          generateResponse(
                            buildSpeechletResponse(`${doorTitle} is currently ${doorStatus}`, true),
                            {}
                          )
                        )
                      })
                    })
                    break;

          default:
            throw "Invalid intent";
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`);
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// builds an Alexa response
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

};

//plays Alexa reponse
generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

};
