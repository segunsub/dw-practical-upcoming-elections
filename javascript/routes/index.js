var express = require('express');
var router = express.Router();
var us_states = require('../us_state.js');
const fetch = require('node-fetch');
const { response } = require('express');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Find My Election', states: us_states });
});
// Date format function to help simplify the date.
function dateFormat(input){
  return new Date(input).toDateString()
}
//Function votingLinks adds keys to the object for easy access to voting choices.
function votingLinks(votingmethods,voting_obj,data) {
  votingmethods.forEach(choice => {
    if(choice.type === 'early-voting' && choice.start){
      voting_obj.early_link = true
      if(choice.url){
        voting_obj.early_link_true = true
      }
      voting_obj.url = choice.url
      voting_obj.early_Start = dateFormat(choice.start)
      voting_obj.early_End = dateFormat(choice.end)
    }
    if(choice.type === 'by-mail'){
      voting_obj.by_Mail = true
      if(choice['ballot-request-deadline-received'])voting_obj.mail_Endate = true
      voting_obj.mail_Url = choice['ballot-request-form-url']
      voting_obj.deadline = dateFormat(choice['ballot-request-deadline-received'])
    }
    choice.type = choice.type.replace(choice.type[0], choice.type[0].toUpperCase())
    voting_obj.method.push(choice.type)
  })
  Object.keys(data).forEach(link => {
    if(data.source === undefined) {
      if(link.includes('url')) {
        data.source.notes = data[link]
      }
  }
  })
}
//renderer function for sending data to the html page.
function renderer(res,response) {
response.forEach(data => {
    let newDate = dateFormat(data.date)
    let votingmethods = data['district-divisions'][0]['voting-methods']
    let voting_obj =  {
      method: []
    }
    votingLinks(votingmethods,voting_obj,data) 
    res.render('search', {
      title: 'Election Information',
       description: `${data.description}`,
       date: `${newDate}`,
       type: `${data.type = data.type.replace(data.type[0], data.type[0].toUpperCase())}`,
       authority_level: `${data['district-divisions'][0]['election-authority-level']}`,
       polling_place_url: `${data['polling-place-url']}`,
       sourcenotes: `${data.source.notes}`,
       method: voting_obj.method,
       early_link: voting_obj.early_link,
       early_link_true: voting_obj.early_link_true,
       mail_Endate: voting_obj.mail_Endate,
       early_voting_link: `${voting_obj.url}`,
       early_start: `${voting_obj.early_Start}`,
       early_end: `${voting_obj.early_End}`,
       mail_Vote: voting_obj.by_Mail,
       by_Mail_Link: `${voting_obj.mail_Url}`,
       mail_Deadline: `${voting_obj.deadline}`
      }) 
  } )  

}
/* Post Search Page */
router.post("/search", (req, res) => {
  //Fetch to the Api
  apiFetch(req.body.state,req.body.city)
  .then(response =>renderer(res,response)) 
})
async function apiFetch(state,place) {
  state = state.toLowerCase()
  place = place.toLowerCase()
  place = place.replace(' ', '_')
  const requestOption = {
    headers:  {"Accept": "application/json"}
  }
  const response = await fetch(`https://api.turbovote.org/elections/upcoming?district-divisions=ocd-division/country:us/state:${state}/place:${place}`,requestOption);
  const responsejson = await response.json()
  return responsejson ;
}
module.exports = router;
