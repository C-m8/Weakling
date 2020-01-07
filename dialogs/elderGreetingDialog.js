export const elderFirstTimeDialog = [{
        id: 'greetings',
        text: 'Oh, there you are! I\'ve been searching for you! What is it this time? Collecting rocks and herbs? Sneaking into the dungeon? How many times have I told you to keep away from' +
            'that place... One day it will get you into trouble and then who will be taking the goods to Caltor then? It is important for the whole village, you know. I am not young enough anymore to go alone; who knows how soon it will be when you have to do it all by yourself...',
        replies: [{
                text: 'I am sorry Guarthh, I just got carried away... Did you know that if you squeeze sour grass over the blackolite powder...',
                successTriggers: 'greetings2',
            }]
    }, {
        id: 'greetings2',
        text: 'Yeah...that is exactly what I am talking about - once something gets into your head it\'s really hard to get rid of it... The important question is - are you ready for the trip? Did you pick up ' +
            'baskets from Aunt Nahkha?',
        replies: [{
                text: 'Uhh...she was not ready yet so I decided to see what this blackolite can be used for...',
                successTriggers: 'greetings3',
            }]
    }, {
        id: 'greetings3',
        text: 'Now is not the time - the sun is high already and we have to hurry to make it back before dark. Go check on her again and come back - this time with the baskets. ' +
            'Oh, and don\'t forget to pick up whatever Hargkakh managed to dig out - we will need every coin we can collect if we want to be ready for the winter...',
        replies: [{
                text: 'Okay...I will be right back.',
                callbackParam: 'fastEnd'
            }]
    }];
export const elderSecondTimeDialog = [{
        id: 'greetings',
        text: 'So? Did you bring baskets and stones?',
        replies: [{
                text: 'Not yet, but I\'m on my way - Nahkha\'s cave is the one to the south, while Hargkakh digs near the fields southeast, right?',
                successTriggers: 'greetings2',
            }]
    }, {
        id: 'greetings2',
        text: 'No! He finished digging there a week ago... Just follow the road to the north from here. Go toward the peak and you will see the entrance. He should be somewhere around there...',
        replies: [{
                text: 'Oh yeah! I\'ll be right back!',
                callbackParam: 'fastEnd'
            }]
    }];
export const elderGoodsObtainedDialog = [{
        id: 'greetings',
        text: 'So? Did you bring the baskets and stones?',
        replies: [{
                text: 'Yes, everything is ready. We can go now.',
                successTriggers: 'greetings2',
            }]
    }, {
        id: 'greetings2',
        text: 'Finally - I expect that you remember the way, so let\'s get going. Oh, and this time, please just follow the road - no checking glades, no catching bugs. We are pretty late already, so let\'s just get to Caltor, offload the goods and be done with it.',
        replies: [{
                text: 'As you say, Elder...',
                callbackParam: 'readyToGo'
            }]
    }];
//# sourceMappingURL=elderGreetingDialog.js.map