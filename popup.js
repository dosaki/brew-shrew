var _domain = "http://localhost";
var _oneYear = 31556926;
var _delimiter = "$$!,!$$";
var _cookieDrinks = "favDrinks"

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

var askBrew = function(brew){
  console.log(brew);
}

var deleteFavorite = function(brewId){
  getCookies(_domain, _cookieDrinks, function(drinksValues){
    var drinks = drinksValues.split(_delimiter);
    drinks[brewId]="";
    var newDrinksValues = joinNoNulls(drinks, _delimiter);
    setCookie(_domain, _cookieDrinks, newDrinksValues, _oneYear);
    setUpBrews();
  });
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
      //favButtons = favButtons + "<button id='askFav"+i+"' class='brewButton'>"+drinks[i]+"</button> <button id='delFav"+i+"' class='deleteFav'>x</button>"
    }
  });
}

setUpBrews();

document.getElementById("clearFavBtn").onclick = function(){
  clearFavourites();
  setUpBrews();
};

document.getElementById("addFavBtn").onclick = function(){
  addFavourite();
};


document.getElementById("askBrew").onclick = function(){
  askBrew(document.getElementById("newBrewInput").value);
};
