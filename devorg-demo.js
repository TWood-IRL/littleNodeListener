const axios = require('axios');
const { CometD } = require('cometd');
const { adapt: adaptCometD } = require('cometd-nodejs-client');

adaptCometD();

const fullsharedConfig = {
  apiUrl: 'https://tomwoodhousegs0-dev-ed.lightning.force.com',
  cometdUrl: 'https://tomwoodhousegs0-dev-ed.lightning.force.com/cometd/48.0',
}

async function run() {

  const opportunity1Id = process.argv[2] || 'orgId'; 

  const { apiUrl, cometdUrl } = fullsharedConfig;

  const response = await axios.get(apiUrl + '/login', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const token = response.data.body;   //Access token 
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
        connection.subscribe(`/topic/Opportunity?Id=${opportunityId}`, //Channel
          (cometdApplication) => {
            console.log(`I have got an update from /topic/Opportunity?Id=${opportunityId}
Here are the raw contents:`, cometdApplication, '\n');
          });

      });
    } else {
      console.log(response);
    }
  });
}

run();
