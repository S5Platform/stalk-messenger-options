var fs    = require('fs');
var path  = require('path');
var argv  = require('optimist').argv;
var utils = require('./utils');

var loadJsonSync = function(filePath) {

  if( filePath ){
    try {
      var data = fs.readFileSync(filePath);
      return JSON.parse(data.toString());
    } catch (ex) {
      console.error('Error starting session server: ' + ex);
      process.exit(1);
    }
  }
  return {};
};

var config = loadJsonSync(argv.config);

var options = {};
options['host'] = argv.host || config.host || process.env.HOST || utils.getIP();
options['port'] = argv.port || config.port || process.env.PORT || 8080;
options['secure'] = config.secure || process.env.SECURE || false; // true(HTTP) or false(HTTPS)

options['zookeeper'] = config.zookeeper || process.env.ZOOKEEPER;
options['redis'] = config.redis || process.env.REDIS;

var homeDir = config.home || process.env.HOME_DIR;
if (homeDir){
  if(homeDir.startsWith("/")){
    options['home'] = homeDir;
  }else{
    return console.error('\n\n [ERROR] home directory must to be full paths from root(/) \n\n');
  }
}

var httpsServerOptions;
if( config.ssl ) {
  httpsServerOptions = {
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert)
  }
}
options['httpsServerOptions'] = httpsServerOptions;

options['type'] = argv.type || config.type || process.env.TYPE || 'session';
if(argv.session) options['type'] = 'session';
if(argv.channel) options['type'] = 'channel';

var protocal = options.secure ? 'https://' : 'http://';  // Don't forget to change to https if needed

/* ONLY FOR SESSION SERVER */
if(options.type == 'session'){

  options['parsePath']        = config.parsePath || process.env.PARSE_PATH || '/parse';
  options['serverURL']        = config.serverUrl || process.env.SERVER_URL || protocal + options.host + ':' + options.port + options.parsePath;
  options['publicServerURL']  = config.publicServerUrl || process.env.PUBLIC_SERVER_URL || protocal + options.host + ':' + options.port + options.parsePath;

  options['mongodb']  = config.mongodb || process.env.MONGODB;
  options['app']      = config.app || process.env.APP_ID || 'STALK';
  options['master']   = config.master || process.env.MASTER_KEY || 's3cR3T';
  options['push']     = utils.getPushConfig(); // @ TODO HAVE TO IMPLEMENT !!
  options['cloud']    = config.cloud || process.env.CLOUD || './lib/cloud/index.js';
  options['appName']  = config.appName || process.env.APP_NAME || options.app;
  options['verifyUserEmails'] = config.verifyUserEmails || !!+(process.env.VERIFY_USER_EMAILS) || false;

  if(config.emailAdapter) options['emailAdapter'] = config.emailAdapter;
  if(process.env.EMAIL_ADAPTER_FILE) options['emailAdapter'] = loadJsonSync(emailAdapterFile);

  if(config.static && config.static.folder){
    options['static'] = {
      path: config.static.path || '/public',
      folder: path.resolve(process.cwd(), config.static.folder)
    };
  }

}

options['logo'] = [
  " ",
  " ,  ",
  " |\\  ",
  " \\ | ",
  "  | \\ /          OPENSOURCE MESSENGER PROJECT",
  "   \\|/    _,                   "+options['type']+" server",
  "    /  __/ /      _____________   __   __ __  ",
  "   | _/ _.'      / __/_  __/ _ | / /  / //_/  ",
  "   |/__/        _\\ \\  / / / __ |/ /__/ ,<    ",
  "    \\          /___/ /_/ /_/ |_/____/_/|_|   ",
  " ",
  " "
].join('\n');

//console.log(options);
if (argv.config) console.log(argv.config, ' >> loaded, completed');

module.exports = options;
