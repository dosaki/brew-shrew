// See http://src.chromium.org/viewvc/chrome/trunk/src/chrome/common/extensions/docs/examples/extensions/gmail/background.js

getBrewerUrl(){
  return "http://localhost:8585/kettle/brewer"
}

indicateBrewer(){
  if (!localStorage.hasOwnProperty('hasBrewer')) {
    chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
    chrome.browserAction.setBadgeText({text:""});
  }
  else {
    chrome.browserAction.setBadgeBackgroundColor({color:[208, 0, 24, 255]});
    chrome.browserAction.setBadgeText({
      text: localStorage.hasBrewer === "true" ? localStorage.unreadCount : ""
    });
  }
}
