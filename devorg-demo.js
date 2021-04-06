const { CometD } = require('cometd');
const { adapt: adaptCometD } = require('cometd-nodejs-client');
var jsforce = require('jsforce');
require('dotenv').config()

adaptCometD();


var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl : process.env.SALESFORCE_LOGIN_URL
});
async function run() {

  const opportunity1Id = process.argv[2] || 'orgId'; 

  const  cometdUrl  = conn.instanceUrl  + '/cometd/48.0' ;

 
  const token = conn.accessToken;   //Access token 
  if (!token) {
    console.log('Token  failed. Try again');
    return ;
  }

  console.log(`API endpoint: ${cometdUrl}`);

  spawnConnection({ token, cometdUrl }, opportunity1Id);
}

function spawnConnection({ token, cometdUrl }, opportunityId) {
  const connection = new CometD();

  connection.configure({
    requestHeaders: { authorization: `Bearer ${token}` },
    url: cometdUrl,
    appendMessageTypeToURL: false,
  });

  connection.handshake(response => {
    if (response.successful) {
      connection.batch(() => {
        connection.subscribe(`/data/AccountChangeEvent`, //Channel
          (cometdApplication) => {
            console.log(`I have got an update from /data/AccountChangeEvent
            Here are the raw contents:`, cometdApplication, '\n');
          });

      });
    } else {
      console.log(response);
    }
  });
}

conn.login(process.env.SALESFORCE_USERNAME, process.env.SALESFORCE_PASSWORD, function(err, res) {
  if (err) { return console.error(err); }
  run() ; 
});

