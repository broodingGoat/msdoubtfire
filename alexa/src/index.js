var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.dynamoDBTableName = 'msdoubtfire';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

// consumes time events as comma seperated string & gives last time in human readable form
function getLastEventTime(event_string){
    return new Date(event_string.split(',').slice(-1)[0]);
}

// consumes time events as a comma seperated string & gives average interval between events
function getEventIntervalAverage(event_string){
    event_string_arr = event_string.split(',');
    event_string_arr_len = event_string_arr.length;
    interval_counter = 0 // demonimator for calc avg
    interval_diff_sum = 0 // sum of interval differences
    for (i=0 ; i <event_string_arr_len ; i++ ){
      if (i < event_string_arr_len - 1){
        var event1 = new Date(event_string_arr[i]);
        var event2 = new Date(event_string_arr[i+1]);
        diff = event2 - event1;
        interval_diff_sum = interval_diff_sum + diff;
        interval_counter = interval_counter + 1;
      }
    }
    interval_avg = interval_diff_sum / interval_counter ;
    interval_avg_in_min = Math.floor(interval_avg / 60e3);
    console.log(interval_avg_in_min);
    return interval_avg_in_min ;
}


var handlers = {
    'RecordChangedDiaper': function () {
       // **** Expressions ****
       var msdoubtfire_says = "";
       // future feature - pick up random primary_responses, each with different emotive expression
       var primary_response = "Little pumpkin’s bummy is all clean & shiny! I will enter the time of change.";
       // future feature - predective response should be a generated string pulled from DB. These would be updated by another job, based on analytics on existing data
       var predective_response_1 = "... By the way I think we are running low on diapers ... Please tell me to order after you have checked." ;
       var predective_response_2 = "  Also, dear you have been fabulous, now please take some rest.";
       msdoubtfire_says = primary_response;

       // **** Data updates ****
       // fetchs previous diaper change events & append with latest. Should try using StringSet type attribute. Not sure how to reference using alex-sdk. Use resulted in return of [object Object]
       this.attributes['diaper_change_event'] = this.attributes['diaper_change_event'] + "," + this.event.request.timestamp;
       console.log("updated diaper change event" + getLastEventTime(this.attributes['diaper_change_event']));
       // update the diaper use counter and baby task counter. baby task counter is to keep track of work done by parent. used to remind that they need to request. future feature - should be predective, based on past usage, behavior and personal energy level
       this.attributes['diaper_use_counter'] = this.attributes['diaper_use_counter'] + 1;
       this.attributes['daily_baby_task_counter'] = this.attributes['daily_baby_task_counter'] + 1;
       console.log("updating diaper use counter & baby task counter");


       // **** Response generation ****
       if (this.attributes['diaper_use_counter'] > this.attributes['diaper_order_alert']){
          msdoubtfire_says = msdoubtfire_says + predective_response_1;
       }
       if (this.attributes['daily_baby_task_counter'] > 5){
          msdoubtfire_says = msdoubtfire_says + predective_response_2;
       }
       // card information
        var cardTitle = "Diaper Change Tracker";
        var cardContent = "Diaper Changed at " + this.event.request.timestamp;

        // emit
        this.emit(':tellWithCard', msdoubtfire_says, cardTitle, cardContent);
        this.emit(':responseReady'); // Called after the response is built but before it is returned to the Alexa service. Calls :saveState. Can be overridden.
        this.emit(':saveState', true); // Handles saving the contents of this.attributes and the current handler state to DynamoDB and then sends the previously built response to the Alexa service. Override if you wish to use a different persistence provider. The second attribute is optional and can be set to 'true' to force saving.
        //this.emit(':saveStateError'); // Called if there is an error while saving state. Override to handle any errors yourself.
    },

    'RecordPoop': function () {
       // **** Expressions ****
       var msdoubtfire_says = "";
       // future feature - pick up random primary_responses, each with different emotive expression
       var primary_response = "That is one little poopy maker! I will record the poopy time.";
       // future feature - predective response should be a generated string pulled from DB. These would be updated by another job, based on analytics on existing data
       var predective_response_1 = "...he has been pooping quite a bit." ;
       var predective_response_2 = "...Also, honey you have been doing this for some time, please take some rest.";
       msdoubtfire_says = primary_response;

       // **** Data updates ****
       // fetchs previous poop events & append with latest. Should try using StringSet type attribute. Not sure how to reference using alex-sdk. Use resulted in return of [object Object]
       this.attributes['poop_event'] = this.attributes['poop_event'] + "," + this.event.request.timestamp;

       console.log("updated last poop event");
       // update the daily_poop counter and baby task counter. baby task counter is updated by .25 since checking poop is lesser effort thand diaper change. future feature - should be predective, based on past usage, behavior and personal energy level
       this.attributes['daily_poop_counter'] = this.attributes['daily_poop_counter'] + 1;
       this.attributes['daily_baby_task_counter'] = this.attributes['daily_baby_task_counter'] + 0.25;
       console.log("updating daily_poop_counter counter & baby task counter");



       // **** Response generation ****
       if (this.attributes['daily_poop_counter'] > this.attributes['predective_daily_poop_expected_counter']){
         msdoubtfire_says = msdoubtfire_says + predective_response_1;
       }
       if (this.attributes['daily_baby_task_counter'] > 5){
         msdoubtfire_says = msdoubtfire_says + predective_response_2;
       }
       // card information
        var cardTitle = "Baby Pooped";
        var cardContent = "Baby Pooped at " + this.event.request.timestamp;

        // emit
        this.emit(':tellWithCard', msdoubtfire_says, cardTitle, cardContent);
        this.emit(':responseReady'); // Called after the response is built but before it is returned to the Alexa service. Calls :saveState. Can be overridden.
        this.emit(':saveState', true); // Handles saving the contents of this.attributes and the current handler state to DynamoDB and then sends the previously built response to the Alexa service. Override if you wish to use a different persistence provider. The second attribute is optional and can be set to 'true' to force saving.
        //this.emit(':saveStateError'); // Called if there is an error while saving state. Override to handle any errors yourself.
    },

    'RecordBabySleep': function () {
       // **** Expressions ****
       var msdoubtfire_says = "";
       // future feature - pick up random primary_responses, each with different emotive expression
       var primary_response = "Sweet dreams little one! I will write the time of baby's sleep.";
       // future feature - predective response should be a generated string pulled from DB. These would be updated by another job, based on analytics on existing data
       var predective_response_1 = " On another note, baby would probably sleep for " + this.attributes['predective_baby_sleep_duration'] + " hours. So, you should catch up some sleep as well!" ;
       msdoubtfire_says = primary_response;

       // **** Data updates ****
       // fetchs previous poop events & append with latest. Should try using StringSet type attribute. Not sure how to reference using alex-sdk. Use resulted in return of [object Object]
       this.attributes['baby_sleep_event'] = this.attributes['baby_sleep_event'] + "," + this.event.request.timestamp;
       console.log("updated sleep event");
       // update the daily_poop counter and baby task counter. baby task counter is updated by 1 since putting baby to sleep takes effort. future feature - should be predective, based on past, behavior and personal energy level
       this.attributes['daily_baby_task_counter'] = this.attributes['daily_baby_task_counter'] + 1;
       console.log("updating baby task counter");

       // **** Response generation ****

       if (this.attributes['daily_baby_task_counter'] > 8){
         msdoubtfire_says = msdoubtfire_says + predective_response_1;
       }
       // card information
        var cardTitle = "Baby Slept";
        var cardContent = "Baby Slept at " + this.event.request.timestamp;

        // emit
        this.emit(':tellWithCard', msdoubtfire_says, cardTitle, cardContent);
        this.emit(':responseReady'); // Called after the response is built but before it is returned to the Alexa service. Calls :saveState. Can be overridden.
        this.emit(':saveState', true); // Handles saving the contents of this.attributes and the current handler state to DynamoDB and then sends the previously built response to the Alexa service. Override if you wish to use a different persistence provider. The second attribute is optional and can be set to 'true' to force saving.
        //this.emit(':saveStateError'); // Called if there is an error while saving state. Override to handle any errors yourself.
    },

    'BabyNotSleeping': function () {
       // **** Expressions ****
       var msdoubtfire_says = "";
       // future feature - pick up random primary_responses, each with different emotive expression
       var primary_response = "Oh! Dear! My child! Let me see how baby has been doing";
       // future feature - predective response should be a generated string pulled from DB. These would be updated by another job, based on analytics on existing data

       msdoubtfire_says = primary_response;

       // **** Data updates ****
       // Check if baby has been sleeping properly or not by seeing if his average sleep is less than predective_baby_sleep_duration
       sleeping_avg = getEventIntervalAverage(this.attributes['baby_sleep_event']);
       predicted_sleep_avg = this.attributes['predective_baby_sleep_duration'];
       if (sleeping_avg <  predicted_sleep_avg * 60){
         var predective_response = " .. Baby has been sleeping for on an average " + sleeping_avg + " minutes. Which is less than the expected " +  predicted_sleep_avg + " hours of sleep. Tell me to put on some white noise. Will help the baby sleep better!";
       } else {
         var predective_response = "..... Ok! I just checked and didnt find anything inconsistent. Do you want me to play some music to help sleep?";
       }
       msdoubtfire_says = msdoubtfire_says + predective_response;
       console.log("suggested for lack of sleep. Sleeping average " + sleeping_avg + " minutes. Predicted sleep avg" + predicted_sleep_avg);



       // card information
        var cardTitle = "Suggested on baby sleep";
        var cardContent = "Suggested on baby sleep. Current Sleeping Average" + sleeping_avg + " min. Expected Sleeping Average " + predicted_sleep_avg + "hours";

        // emit
        this.emit(':tellWithCard', msdoubtfire_says, cardTitle, cardContent);
        this.emit(':responseReady'); // Called after the response is built but before it is returned to the Alexa service. Calls :saveState. Can be overridden.
        this.emit(':saveState', true); // Handles saving the contents of this.attributes and the current handler state to DynamoDB and then sends the previously built response to the Alexa service. Override if you wish to use a different persistence provider. The second attribute is optional and can be set to 'true' to force saving.
        //this.emit(':saveStateError'); // Called if there is an error while saving state. Override to handle any errors yourself.
    },
    'GetLastDiaperChange': function () {
       // **** Expressions ****
       var msdoubtfire_says = "";
       // future feature - pick up random primary_responses, each with different emotive expression
       var primary_response = "Let me see when baby was last changed.";
       // future feature - predective response should be a generated string pulled from DB. These would be updated by another job, based on analytics on existing data

       msdoubtfire_says = primary_response;

       // **** Data updates ****
       // Check if baby has been sleeping properly or not by seeing if his average sleep is less than predective_baby_sleep_duration
       last_diaper_change_time = getLastEventTime(this.attributes['diaper_change_event']);
       predective_response = "...Looks like he was last changed at " + last_diaper_change_time;

       msdoubtfire_says = msdoubtfire_says + predective_response;
       console.log("suggested last diaper change");



       // card information
        var cardTitle = "Last diaper change";
        var cardContent = "Last diaper change at " + last_diaper_change_time;

        // emit
        this.emit(':tellWithCard', msdoubtfire_says, cardTitle, cardContent);
        this.emit(':responseReady'); // Called after the response is built but before it is returned to the Alexa service. Calls :saveState. Can be overridden.
        this.emit(':saveState', true); // Handles saving the contents of this.attributes and the current handler state to DynamoDB and then sends the previously built response to the Alexa service. Override if you wish to use a different persistence provider. The second attribute is optional and can be set to 'true' to force saving.
        //this.emit(':saveStateError'); // Called if there is an error while saving state. Override to handle any errors yourself.
    }



};
