const express = require('express');
const router = express.Router();
const us_states = require('../us_state.js');
//used helper js to abstract process for readability
const helper = require('../helper.js')
const { response } = require('express');
const { renderHtml } = require('../helper.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Find My Election', states: us_states });
});

//renderElectionData function for sending data to the html page.
function renderElectionData(res,response) {
  /*if statement checks for empty response  Which can happen when the user searches for past election.*/
  if(response.length == 0) {
    let found = false
    res.render('search', {
      found,
      description: 'Election Information Not Found'})
  }
response.forEach(data => {
    let newDate = helper.dateFormat(data.date)
    let votingmethods = data['district-divisions'][0]['voting-methods']
    // object to save checks and information for renderHtml
    const voting_obj =  {
      method: []
    }
    //helper function to set all links 
    helper.getElectionLinks(votingmethods,voting_obj,data) 
    //helper function to render information to the user
    helper.renderHtml(res,data,newDate,voting_obj)

  } )  

}
/* Post Search Page */
router.post("/search", (req, res) => {
  //Fetch to the Api
  helper.apiFetch(req.body.state,req.body.city)
  .then(response =>renderElectionData(res,response)) 
})

module.exports = router;
