import local_storage = require('./storage');
import logging = require('../../../third_party/uproxy-lib/logging/logging');
import metrics_module = require('./metrics');
import uproxy_core_api = require('../interfaces/uproxy_core_api');
import user_interface = require('../interfaces/ui');

var log :logging.Log = new logging.Log('globals');

export var storage = new local_storage.Storage();

export var STORAGE_VERSION = 1;
export var MESSAGE_VERSION = 1;

export var DEFAULT_STUN_SERVERS = [
  {urls: ['stun:stun.services.mozilla.com']},
  {urls: ['stun:stun.stunprotocol.org']},
  {urls: ['stun:stun.l.google.com:19302']},
  {urls: ['stun:stun1.l.google.com:19302']},
  {urls: ['stun:stun2.l.google.com:19302']},
  {urls: ['stun:stun3.l.google.com:19302']},
  {urls: ['stun:stun4.l.google.com:19302']},
];

  // Initially, the STUN servers are a copy of the default.
  // We need to use slice to copy the values, otherwise modifying this
  // variable can modify DEFAULT_STUN_SERVERS as well.
export var settings :uproxy_core_api.GlobalSettings = {
  description: '',
  stunServers: DEFAULT_STUN_SERVERS.slice(0),
  hasSeenSharingEnabledScreen: false,
  hasSeenWelcome: false,
  allowNonUnicast: false,
  mode: user_interface.Mode.GET,
  version: STORAGE_VERSION,
  statsReportingEnabled: false
};

export var natType :string = '';

export var loadSettings :Promise<void> =
  storage.load<uproxy_core_api.GlobalSettings>('globalSettings')
    .then((storedSettings :uproxy_core_api.GlobalSettings) => {
      log.info('Loaded global settings', storedSettings);
      // If no custom STUN servers were found in storage, use the default
      // servers.
      settings.stunServers = storedSettings.stunServers;
      if (!settings.stunServers
          || settings.stunServers.length == 0) {
        settings.stunServers = DEFAULT_STUN_SERVERS.slice(0);
      }
      // Set all booleans to values from storage, or default to false if
      // missing from storage.
      settings.hasSeenSharingEnabledScreen =
          storedSettings.hasSeenSharingEnabledScreen || false;
      settings.hasSeenWelcome = storedSettings.hasSeenWelcome || false;
      settings.allowNonUnicast = storedSettings.allowNonUnicast || false;
      settings.statsReportingEnabled =
          storedSettings.statsReportingEnabled || false;

      // Restore mode if it is available in storage.
      if (typeof storedSettings.mode != 'undefined') {
        settings.mode = storedSettings.mode;
      }
    }).catch((e) => {
      log.info('No global settings loaded', e.message);
    });

export var metrics = new metrics_module.Metrics(storage);
