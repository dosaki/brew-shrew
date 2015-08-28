var _domain = "http://localhost";
var _oneYear = 31556926;
var _delimiter = "$$!,!$$";
var _cookieDrinks = "favDrinks";
var _cookiePerson = "userName";
var _preparer = "";
var _serverUrl = "http://localhost:8585/";
var _url = _serverUrl + "kettle/";
var _intervalIsSet = false;

var makeRequest = function(url, data, callBack){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      callBack(xhr);
    }
  }
  xhr.open('GET', url + "?" + data);
  xhr.send();
}


var getCookies = function(domain, name, callback) {
  chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
    if(callback) {
      if(cookie){
        callback(cookie.value);
      }
      else{
        callback(null);
      }
    }
  });
}

var setCookie = function(domain, name, value, expiry) {
  chrome.cookies.set({ url: domain, name: name, value: value, expirationDate: (new Date().getTime()/1000) + expiry });
}

var isEmpty = function(value){
  return value === undefined || value === null || value === "" || value.length === 0
}

var joinNoNulls = function(list, delimiter){
  var joinedList = "";
  for(var i=0; i<list.length; i++){
    if(!isEmpty(list[i])){
      if(isEmpty(joinedList)){
        joinedList = list[i];
      }
      else{
        joinedList = joinedList + _delimiter + list[i];
      }
    }
  }
  return joinedList;
}

var message = function(text, type){
  document.getElementById("messages").style.display = "block"
  document.getElementById("messages").innerHTML = text;
  document.getElementById("messages").className = "messages " + type;

  setTimeout(function(){
    document.getElementById("messages").style.display = "none"
    document.getElementById("messages").className = "";
  }, 4000);
}

var clearFavourites = function(){
  setCookie(_domain, _cookieDrinks, null, _oneYear);
}

var addFavourite = function(){
  getCookies(_domain, _cookieDrinks, function(drinksValues){
    var newFavList = drinksValues;
    var newFav = document.getElementById("newBrewInput").value;
    document.getElementById("newBrewInput").value = "";

    if(!isEmpty(newFav)){
      if(isEmpty(drinksValues)){
        newFavList = newFav;
      }
      else{
        newFavList = newFavList + _delimiter + newFav
      }
      setCookie(_domain, _cookieDrinks, newFavList, _oneYear);

      setUpBrews();
    }
  });
}

var deleteFavorite = function(brewId){
  getCookies(_domain, _cookieDrinks, function(drinksValues){
    var drinks = drinksValues.split(_delimiter);
    drinks[brewId] = "";
    var newDrinksValues = joinNoNulls(drinks, _delimiter);
    setCookie(_domain, _cookieDrinks, newDrinksValues, _oneYear);
    setUpBrews();
  });
}

var askBrew = function(brew){
  getCookies(_domain, _cookiePerson, function(person){
    makeRequest(_url + "addBrew", "brewName=" + encodeURI(brew) + "&personName=" + encodeURI(person), function(data){
      var success = data.status === 200;
      if(success){
        message("Someone will (hopefully) make you a " + brew + "!", "success");
      }
      else{
        message("Oops... I think I lost your " + brew + ".", "fail");
      }
    });
  });
}

var prepareKettle = function(){
  getCookies(_domain, _cookiePerson, function(person){
    checkPreparer(function(preparer){
      if(person === preparer || isEmpty(preparer)){
        makeRequest(_url + "turnOn", "personName="+person, function(){
          message("I'll let people know then.", "success");
        });
      }
      else{
        message("It looks like " + preparer + " is already boiling some water.", "fail");
      }

      document.getElementById("prepareKettle").disabled = "true";
    });
  });
}

var checkPreparer = function(callback){
  makeRequest(_url + "brewer", "", function(data){
    if(data.status === 200){
      _preparer = data.response;
    }
    callback(_preparer);
  });
}

var setUser = function(username){
  setCookie(_domain, _cookiePerson, username, _oneYear)
}

var setUpBrews = function(drinksValues){
  getCookies(_domain, _cookieDrinks, function(drinksValues){
    var usuals = document.getElementById("usuals");
    usuals.innerHTML = "";
    if(isEmpty(drinksValues)){
      usuals.style.display = "none";
      return;
    }

    usuals.style.display = "block";

    var drinks = drinksValues.split(_delimiter);

    for(var i=0; i<drinks.length; i++){
      var drinkButton = document.createElement("button");
      drinkButton.className="brewButton";
      drinkButton.id="askFav"+i;
      drinkButton.innerHTML=drinks[i];
      drinkButton.addEventListener("click", function(){
        askBrew(this.innerHTML);
      });

      var drinkDelButton = document.createElement("button");
      drinkDelButton.className="deleteFav";
      drinkDelButton.id="delFav"+i;
      drinkDelButton.innerHTML="x";
      drinkDelButton.addEventListener("click", function(){
        deleteFavorite(this.id.replace("delFav", ""));
      });

      usuals.appendChild(drinkButton);
      usuals.appendChild(drinkDelButton);
    }
  });
}

var loadUser = function(){
  getCookies(_domain, _cookiePerson, function(personValue){
    document.getElementById("personName").value = personValue;
  });
}

loadUser();
setUpBrews();

document.getElementById("clearFavBtn").onclick = function(){
  clearFavourites();
  setUpBrews();
};

document.getElementById("addFavBtn").onclick = function(){
  addFavourite();
};

document.getElementById("personName").onkeypress = function(e){
  if (13 === e.keycode || 13 === e.which) { //Enter key
    this.blur();
  }
};

document.getElementById("personName").onblur = function(){
  setUser(this.value);
}

document.getElementById("newBrewInput").onkeypress = function(e){
  if (13 === e.keycode || 13 === e.which) { //Enter key
    askBrew(this.value);
    this.value = "";
  }
};

document.getElementById("askBrew").onclick = function(){
  askBrew(document.getElementById("newBrewInput").value);
};

document.getElementById("prepareKettle").onclick = function(){
  prepareKettle();
};


if(!_intervalIsSet){
  setInterval(function(){
    checkPreparer(function(){});
  }, 10000);
  _intervalIsSet = true;
}
