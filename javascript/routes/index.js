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
/* Post Search Page */
router.post("/search", (req, res) => {
  //Fetch to the Api
  apiFetch(req.body.state,req.body.city)
  .then(response => {
    response.forEach(data => {
      let newDate = dateFormat(data.date)
      let votingmethods = data['district-divisions'][0]['voting-methods']
      let voting_obj =  {
        method: []
      }
      votingmethods.forEach(choice => {
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
      res.render('search', {
        title: 'Election Information',
         description: `${data.description}`,
         date: `${newDate}`,
         type: `${data.type = data.type.replace(data.type[0], data.type[0].toUpperCase())}`,
         authority_level: `${data['district-divisions'][0]['election-authority-level']}`,
         polling_place_url: `${data['polling-place-url']}`,
         sourcenotes: `${data.source.notes}`,
         method: voting_obj.method
        }) 
    } )  
  }) 
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
