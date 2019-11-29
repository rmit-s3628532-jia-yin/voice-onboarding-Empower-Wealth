// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
// const request = require('request');
const rp = require('request-promise');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  // console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  // console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    const session = {'name': 'session', 'lifespan': 10000, 'parameters': {
      'session_id': agent.session,
      'client_name': agent.originalRequest.payload.name,
      'ew_id': agent.originalRequest.payload.ew_id
    }};
    agent.setContext(session);
  }
  
  // function languageHandler(agent) {
  //   const language = agent.parameters.language;
  //   const programmingLanguage = agent.parameters.ProgrammingLanguage;
  //   if (language) {
  //       agent.add(`From webhook: Wow! I didn't know you knew ${language}`);
  //   } else if (programmingLanguage) {
  //       agent.add(`From webhook: ${programmingLanguage} is cool`);
  //   } else {
  //       agent.add(`From webhook: What language do you know?`);
  //   }
  // }

  function endConversation(agent) {
    // var session = agent.getContext('session');
    // const data = JSON.stringify(session);

    // console.log(data);
    // request({
    //     url: "http://josiahchoi.com/myjson",
    //     method: "POST",
    //     json: true,   // <--Very important!!!
    //     body: data
    // }, function (error, response, body){
    //     console.log(body);
    // });
    const data = createJson(agent);

    console.log(data);

    var options = {
        method: 'GET',
        uri: 'http://titan.csit.rmit.edu.au/~S3589434/project/results.php?json=' + data,
        //json: true // Automatically stringifies the body to JSON
    };

    return rp(options)
    .then(parsedBody => {
        // POST succeeded...
        console.log('SUCCESS! Posted', data);
        return null;
    })
    .catch(err => {
        // POST failed...
        console.log(err);
        return null;
    });
  }
  
  function employment(agent) {
    
    const bool = agent.parameters['employed-answer'];
    
    const gotBool = bool.length > 0;

    console.log(bool);
    console.log(gotBool);
    
    if(bool == "employed") {
      agent.setContext('salary',3);
      agent.add("And what is your annual salary?");
    } else if (bool == "unemployed")
      agent.add("Alright, lets move over to the next question. Do you have a partner or spouse?");
    else
      agent.add("I could not get that, are you employed or unemployed?");
    
  }
  
  function partner(agent) {
    
	const partnerBool = agent.parameters['partner-bool'];
    
    console.log(partnerBool == "yes");
    console.log(partnerBool === "yes");
    console.log(partnerBool);
    
    if(partnerBool == "yes") {
      agent.add("And what is your partners yearly salary?");
    } else {
      agent.add("Alright. Lets go over your expenses quickly. What is roughly your annual expenditure on bills?");
    }
    
  }

  // this is the last intent
  // suammarise what the user has said and tells them they can change the answers 
  function summary(agent) {
    const session = agent.getContext("session");
    var answers = session.parameters;
    var response = "";

    // remove every key which ends with ".original"
    for (var key in answers) {
      if (key.endsWith(".original")) {
        delete answers[key];
      }
    }
    console.log(answers);

    // ### plug the answers into the template ###

    // employment
    if (typeof answers["employed-salary"] !== 'undefined') {
      response += "Your salary is " + answers["employed-salary"] + " dollars a year. ";
    }

    // partner
    if (typeof answers["partner-salary"] !== 'undefined') {
      response += "and your partner's salary is " + answers["partner-salary"] + " dollars a year. ";
    }

    // expenses
    if (typeof answers["expenses-bills-timeunit"] !== 'undefined') {
      response += "Your expenses on bills is " + answers["expenses-bills-amount"] + " dollars " +  answers["expenses-bills-timeunit"] + ". ";
    }
    else {
      response += "Your expenses on bills is " + answers["expenses-bills-amount"] + "dollars. ";
    }

    // other spendings
    if (typeof answers["expenses-spendings-timeunit"] !== 'undefined') {
      response += "Expenses on other spendings is " + answers["expenses-spendings-amount"] + " dollars " + answers["expenses-spendings-timeunit"] + ". ";
    }
    else {
      response += "Expenses on other spendings is " + answers["expenses-spendings-amount"] + "dollars. ";
    }

    // home
    if (typeof answers["home-value"] !== 'undefined') {
      response += "Your home is worth " + answers["home-value"] + " dollars. ";
    }

    // savings
    response += "Your savings are " + answers["savings-amount"] + " dollars. ";

    // other assets
    response += "Your other assets are worth " + answers["other-assets-amount"] + " dollars. ";

    // loans
    if (typeof answers["loan-balance"] !== 'undefined') {
      response += "Your remaining loan balance is " + answers["loan-balance"] + " dollars anually and ";
      response += "your loan repayments are " + answers["loan-repayment"] + " dollars anually. ";
    }

    // respond using the template above
    agent.add("Thank you for your patience. That's all we need. Here's what we've recorded: " + response + " Are you satisfied with your answers?");
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('End Conversation', endConversation);
  intentMap.set('employment', employment);
  intentMap.set('partner', partner);

  intentMap.set('other-assets - no', summary);
  intentMap.set('loan-repayment', summary);
  // end conversation when any of the following intents is matched
  intentMap.set('satisfied - yes', endConversation);
  intentMap.set('loan-repayment - yes', endConversation);

  agent.handleRequest(intentMap);
});

// get the user data from the agent and convert it to JSON file
function createJson(agent) {
  var data = {};
 
  data.time = new Date().getTime();
 
  const session = agent.getContext("session");
  data.session_id = session.parameters.session_id;
  data.intent = agent.intent;
  
  var answers = session.parameters;

  // remove unused data
  delete answers.session_id;
   // remove every key which ends with ".original"
  for (var key in answers) {
    if (key.endsWith(".original")) {
      delete answers[key];
      }
  }
  data.answers = answers;

  data = JSON.stringify(data);
  return data;
}
