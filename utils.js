
exports.getIP = function () {

  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) return alias.address;
    }
  }

  return '0.0.0.0';
};

// Push Notification for parse-server on stalk session server.
exports.getPushConfig = function () {

	// https://github.com/yongjhih/docker-parse-server/blob/master/index.js

	var gcmId = process.env.GCM_ID;
	var gcmKey = process.env.GCM_KEY;

	var iosPushConfigs = new Array();
	var isFile = function(f) {
	    var b = false;
	    try {
	        b = fs.statSync(f).isFile();
	    } catch (e) {
	    }
	    return b;
	}

	var productionBundleId = process.env.PRODUCTION_BUNDLE_ID;
	var productionPfx = process.env.PRODUCTION_PFX || '/certs/production-pfx.p12';
	productionPfx = isFile(productionPfx) ? productionPfx : null;
	var productionCert = process.env.PRODUCTION_CERT || '/certs/production-pfx-cert.pem';
	productionCert = isFile(productionCert) ? productionCert : null;
	var productionKey = process.env.PRODUCTION_KEY || '/certs/production-pfx-key.pem';
	productionKey = isFile(productionKey) ? productionKey : null;

	var productionPushConfig;
	if (productionBundleId && (productionPfx || (productionCert && productionKey))) {
	    productionPushConfig = {
	        pfx: productionPfx,
	        cert: productionCert,
	        key: productionKey,
	        bundleId: productionBundleId,
	        production: true
	    };
	    iosPushConfigs.push(productionPushConfig);
	}

	var devBundleId = process.env.DEV_BUNDLE_ID;
	var devPfx = process.env.DEV_PFX || '/certs/dev-pfx.p12';
	devPfx = isFile(devPfx) ? devPfx : null;
	var devCert = process.env.DEV_CERT || '/certs/dev-pfx-cert.pem';
	devCert = isFile(devCert) ? devCert : null;
	var devKey = process.env.DEV_KEY || '/certs/dev-pfx-key.pem';
	devKey = isFile(devKey) ? devKey : null;

	var devPushConfig;
	if (devBundleId && (devPfx || (devCert && devKey))) { // exsiting files if not null
	    devPushConfig = {
	        pfx: devPfx,
	        cert: devCert,
	        key: devKey,
	        bundleId: devBundleId,
	        production: false
	    };
	    iosPushConfigs.push(devPushConfig);
	}

	if(process.env.APNS_BUNDLES_ID && process.env.APNS_BUNDLES_P12 && process.env.APNS_BUNDLES_PROD) {
	    var APNSBundlesId = process.env.APNS_BUNDLES_ID.split(',').map(function(entry) {
	        return entry.trim();
	    });
	    var APNSBundlesP12 = process.env.APNS_BUNDLES_P12.split(',').map(function(entry) {
	        return entry.trim();
	    });
	    var APNSBundlesProd = process.env.APNS_BUNDLES_PROD.split(',').map(function(entry) {
	        return entry.trim();
	    });
	    if(APNSBundlesId.length === APNSBundlesP12.length && APNSBundlesP12.length === APNSBundlesProd.length) {
	        for (var i = 0; i < APNSBundlesId.length; i++) {
	            APNSpushConfig = {
	                pfx: APNSBundlesP12[i],
	                bundleId: APNSBundlesId[i],
	                production: (APNSBundlesProd[i] === 'true' ? true : false)
	            };
	            iosPushConfigs.push(APNSpushConfig);
	        }
	    }
	}



	var pushConfig = {};
	if (gcmId && gcmKey) {
	    pushConfig.android = {
	        senderId: gcmId,
	        apiKey: gcmKey
	    }
	}
	if (iosPushConfigs.length > 0) {
	    pushConfig.ios = iosPushConfigs;
	    //console.log('Multiple iOS push configurations.')
	}
	console.log(pushConfig);

	return pushConfig;
}
