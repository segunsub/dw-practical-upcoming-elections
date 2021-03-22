const fetch = require('node-fetch');
const helper_Function = {
   // Date format function to help simplify the date.
    dateFormat(input){
        return new Date(input).toDateString()
      },
   //Function getElectionLinks adds keys to the object for easy access to voting choices.
    getElectionLinks(votingmethods,voting_obj,data) {
        votingmethods.forEach(choice => {
          if(choice.type === 'early-voting' && choice.start){
            voting_obj.early_link = true
            if(choice.url){
              voting_obj.early_link_true = true
            }
            voting_obj.url = choice.url
            voting_obj.early_Start = this.dateFormat(choice.start)
            voting_obj.early_End = this.dateFormat(choice.end)
          }
          if(choice.type === 'by-mail'){
            voting_obj.by_Mail = true
            if(choice['ballot-request-deadline-received'])voting_obj.mail_Endate = true
            voting_obj.mail_Url = choice['ballot-request-form-url']
            voting_obj.deadline = this.dateFormat(choice['ballot-request-deadline-received'])
          }
          choice.type = choice.type.replace(choice.type[0], choice.type[0].toUpperCase())
          voting_obj.method.push(choice.type)
        })
        Object.keys(data).forEach(link => {
          if(data.source.notes === undefined) {
            if(link.includes('website')){
              data.source.notes = data[link]
            }else if(link.includes('url')) {
              data.source.notes = data[link]
            }
        }
        })
      },
   //Fetch function to get Election data
    async apiFetch(state,place) {
          //remove common extra space at the end of place
          if(place[place.length - 1] === ' ') {
              place = place.slice(0, -1)
          } 
        state = state.toLowerCase()
        place = place.toLowerCase()
        place = place.replace(/ /g, '_')
        place = place.replace(/[.*+\-?^${}()|[\]\\ 1-9]/g, '')
        const requestOption = {
          headers:  {"Accept": "application/json"}
        }
        const response = await fetch(`https://api.turbovote.org/elections/upcoming?district-divisions=ocd-division/country:us/state:${state}/place:${place}`,requestOption);
        const responsejson = await response.json()
        return responsejson ;
      },
   //render the html with data from Api
    renderHtml(res,data,newDate,voting_obj) {
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
      }
}

module.exports = helper_Function