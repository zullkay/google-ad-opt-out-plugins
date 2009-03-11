/*
 * Copyright 2009 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Firefox plugin to save advertising opt-out
 * preference permanently.
 * @author vali@google.com (Valentin Gheorghita)
 */

/**
 * Check if third party cookies are disabled.
 * @return {boolean} True if they are disabled.
 */
function AdvertisingOptOut_ThirdPartyCookiesDisabled() {
  return Components.classes['@mozilla.org/preferences-service;1'].
      getService(Components.interfaces.nsIPrefBranch).
      getIntPref('network.cookie.cookieBehavior') != 0;
}

/**
 * Check if the user should be opt out, and in affirmative case the cookie
 * is installed.
 */
function AdvertisingOptOut_OptOut() {
  if (!AdvertisingOptOut_ThirdPartyCookiesDisabled()) {
    var ios = Components.classes['@mozilla.org/network/io-service;1'].
        getService(Components.interfaces.nsIIOService);
    var prefService = Components.classes['@mozilla.org/preferences-service;1'].
        getService(Components.interfaces.nsIPrefService);
    var prefOptOut = prefService.getBranch('extensions.advertisingoptout.');
    var cookieUri = ios.newURI(
        prefOptOut.getCharPref('google.url'), null, null);
    var cookieSvc = Components.classes['@mozilla.org/cookieService;1'].
        getService(Components.interfaces.nsICookieService);
    cookieSvc.setCookieString(cookieUri, null,
                              prefOptOut.getCharPref('google.cookie'), null);
  }
}

/**
 * Listener variable for cookie deleted.
 */
var AdvertisingOptOut_CookieListener =
{
  observe: function(subject, topic, data) {
    if (topic == 'cookie-changed') {
      if (data == 'cleared' || data == 'deleted') {
        AdvertisingOptOut_OptOut();
      }
    }
  }
};

/**
 * Load the extension.
 */
function AdvertisingOptOut_Load() {
  Components.classes['@mozilla.org/observer-service;1'].
      getService(Components.interfaces.nsIObserverService).
      addObserver(AdvertisingOptOut_CookieListener, 'cookie-changed', false);
  var period = Components.classes['@mozilla.org/preferences-service;1'].
      getService(Components.interfaces.nsIPrefBranch).
      getIntPref('extensions.advertisingoptout.checkPeriodInS');
  window.setInterval(AdvertisingOptOut_OptOut, period * 1000);
  AdvertisingOptOut_OptOut();
}

/**
 * Unload the extension.
 */
function AdvertisingOptOut_Unload() {
  Components.classes['@mozilla.org/observer-service;1'].
      getService(Components.interfaces.nsIObserverService).
      removeObserver(AdvertisingOptOut_CookieListener, 'cookie-changed');
}
