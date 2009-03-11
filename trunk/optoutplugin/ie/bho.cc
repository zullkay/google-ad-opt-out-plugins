// Copyright 2009 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include <atlstr.h>
#include <time.h>
#include <wininet.h>
#include "bho.h"


// Sets the doubleclick.net cookie to id=OPT_OUT. The expiration time is the
// current time, to which delta_days is added.
// Use a negative delta_days to delete the cookie.
void SetCookie(int delta_days) {
  time_t expiration = time(NULL) + delta_days * 3600 * 24;
  struct tm timeinfo;
  gmtime_s(&timeinfo, &expiration);

  const int kBufferSize = 50;
  wchar_t date_buffer[kBufferSize];
  wcsftime(date_buffer, kBufferSize, L"%a,%d-%b-%Y %X GMT", &timeinfo);

  ATL::CString cookie_data;
  cookie_data.Format(L"id = OPT_OUT; expires = %s", date_buffer);

  InternetSetCookie(L"http://doubleclick.net", NULL, cookie_data);
}


// Implementation of IObjectWithSiteImpl::SetSite.
STDMETHODIMP CPersistentOptOutBHO::SetSite(IUnknown* site) {
  if (site != NULL) {
    HRESULT hr = site->QueryInterface(IID_IWebBrowser2,
                                      reinterpret_cast<void **>(&web_browser_));
    if (SUCCEEDED(hr)) {
      hr = DispEventAdvise(web_browser_);
      advised_ = true;
    }
  } else {  // site == NULL
    if (advised_) {
      DispEventUnadvise(web_browser_);
      advised_ = false;
    }
    web_browser_.Release();
  }
  return IObjectWithSiteImpl<CPersistentOptOutBHO>::SetSite(site);
}

// If enabled, refreshes the opt-out cookie before a page is loaded.
// This only applies to top-level documents (not to frames).
void STDMETHODCALLTYPE CPersistentOptOutBHO::BeforeNavigate(
    IDispatch *disp,
    VARIANT *url,
    VARIANT *flags,
    VARIANT *target_frame_name,
    VARIANT *post_data,
    VARIANT *headers,
    VARIANT_BOOL *cancel) {
  if (web_browser_ != NULL && disp != NULL) {
    ATL::CComPtr<IUnknown> unknown1;
    ATL::CComPtr<IUnknown> unknown2;
    if (SUCCEEDED(web_browser_->QueryInterface(
                      IID_IUnknown, reinterpret_cast<void**>(&unknown1))) &&
        SUCCEEDED(disp->QueryInterface(
                      IID_IUnknown, reinterpret_cast<void**>(&unknown2)))) {
      if (unknown1 == unknown2) {
        SetCookie(90);  // Expires in 3 months.
      }
    }
  }
}
