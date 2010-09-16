/*
 * Copyright 2010 Google Inc.
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

var DOUBLECLICK_DOMAIN = 'doubleclick.net';
var DOUBLECLICK_URL = 'http://' + DOUBLECLICK_DOMAIN + '/';

/**
 * Set opt out cookie.
 */
function optOut(store_id) {
  chrome.experimental.cookies.set({name: "id",
                                   value: "OPT_OUT", 
                                   domain: "." + DOUBLECLICK_DOMAIN,
                                   url: DOUBLECLICK_URL,
                                   expirationDate : 1920499146,
                                   storeId: store_id});
}

/**
 * Clear all cookies set for the domain doubleclick.net.
 */
function clearCookies(store_id) {
  chrome.experimental.cookies.getAll({domain: "." + DOUBLECLICK_DOMAIN},
      function(cookies) {
        for (var i = 0; i < cookies.length; i++) {
          chrome.experimental.cookies.remove({url: DOUBLECLICK_URL,
                                              name: cookies[i].name,
                                              storeId: store_id});
        }
      }
  );
}

/**
 * Listener for cookies.onChanged.
 */
function onCookieChanged(evt) {
  if (evt.removed &&
      evt.cookie.domain == "." + DOUBLECLICK_DOMAIN &&
      evt.cookie.name == "id") {
    optOut(evt.cookie.storeId);
  }
}

chrome.experimental.cookies.getAllCookieStores(function(cookie_stores) {
  for (var i = 0; i < cookie_stores.length; i++) {
    clearCookies(cookie_stores[i].id);
    optOut(cookie_stores[i].id);
  }
});
chrome.experimental.cookies.onChanged.addListener(onCookieChanged);
