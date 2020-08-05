// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const axios = require('axios');
const querystring = require('querystring');
const { TeamsActivityHandler, CardFactory } = require('botbuilder');

class TeamsMessagingExtensionsSearchBot extends TeamsActivityHandler {
    async handleTeamsMessagingExtensionQuery(context, query) {
    //


  var list; 
  var searchQuery = query.parameters[0].value;
  searchQuery = searchQuery+"";
 console.log(searchQuery);  
  var url = "https://agents.farmers.com/search.html?qp="+searchQuery;
  console.log(url);
  var agentList = await axios.request({
        responseType: 'json',
        url: url,
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        agentList = [];
        for (var location of response.data.locations) {
            agentList.push({
                photo: location.loc.customByName['Headshot Url'],
                name: location.loc.customByName.AgentName,
                milesToQueryLocation: location.loc.milesToQueryLocation,
                phone: location.loc.phone,
                address1: location.loc.address1,
                address2: location.loc.address2,
                city: location.loc.city,
                state: location.loc.state,
                postalCode: location.loc.postalCode,
                country: location.loc.country,
                zipwhipEnabled: location.loc.customByName['Zipwhip Enrolled'] // Typically null but sometimes true
            });
        }
        list = agentList;        
        //console.log(agentList);
        
    });
        //console.log(list);
        
        const response = await axios.get(`http://registry.npmjs.com/-/v1/search?${ querystring.stringify({ text: searchQuery, size: 8 }) }`);

        const attachments = [];
        list.forEach(obj => {
            const heroCard = CardFactory.heroCard(obj.name);
            const preview = CardFactory.heroCard(obj.name,obj.milesToQueryLocation + " Miles Away");
            var distanceText =  obj.phone +" In "+obj.city+", "+obj.state;
            preview.content.tap = { type: 'invoke', value: { name: obj.name, phone: distanceText} };
            const attachment = { ...heroCard, preview };
            attachments.push(attachment);
        });

        return {
            composeExtension: {
                type: 'result',
                attachmentLayout: 'list',
                attachments: attachments
            }
        };
    }

    async handleTeamsMessagingExtensionSelectItem(context, obj) {
        return {
            composeExtension: {
                type: 'result',
                attachmentLayout: 'list',
                attachments: [CardFactory.thumbnailCard(obj.name, obj.phone)]
            }
        };
    }
}

module.exports.TeamsMessagingExtensionsSearchBot = TeamsMessagingExtensionsSearchBot;
