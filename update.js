var req = require('request');
var fs = require('fs');

const CONFIG  = './gui-config.json';
const SERVERS = {
  'http://www.ishadowsocks.org': '服务器地址:([^<]*)<.*?端口:(\\d*)<.*?密码:(\\d*)',
  'http://freessr.top'         : '服务器地址:([^<]*)<.*?端口:(\\d*)<.*?密码:([^<]*)',
};

const servers = [];

function loadConfig() {
    return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
}
function saveConfig(jsonObj) {
    fs.writeFile(CONFIG, JSON.stringify(jsonObj), 'utf8');
}

// use request and promise to scrape information
function parseHTML(url) {
  console.log(url);
  return new Promise((resolve, reject) => {
    req(url, function(error, response, body) {
      if (error) {
        // just ignore the error
        console.log(error);
      }
      if (response && response.statusCode === 200) {
        body = body.replace(/[\r\n]/g, '');
        let reg = new RegExp(SERVERS[url], 'g');
        let match = null;
        while((match = reg.exec(body)) !== null) {
          let serv = {
            'server'      : match[1],
            'server_port' : match[2],
            'password'    : match[3],
          };
          servers.push(serv);
        }
      }
      // always mark as resolve
      resolve(true);
    });
  });
}

function update() {
  Promise.all(Object.keys(SERVERS).map(parseHTML)).then( _ => {
    console.log("read all the server.");
    console.log(servers);
    let config = loadConfig();
    console.log(config);
    if (config && servers.length > 0) {
      console.log("Save configuration");
      config.configs = servers;
      saveConfig(config);
    }
  });
}
update();
