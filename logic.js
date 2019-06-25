/* TODO:
1. Create buttons for frequently searched terms
2. Add filter for saved gifs by topic?
3. Fix styling 
4. Clear favorites
5. Make mobile responsive
*/

let CORS = "https://cors-anywhere.herokuapp.com/";
let apiKey = config.API_KEY;

// ajax call to giphy api
function searchGiphys(searchTerm) {
  let queryURL =
    CORS +
    "http://api.giphy.com/v1/gifs/search?q=" +
    searchTerm +
    "&api_key=" +
    apiKey;

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    let data = response.data;
    displayResults(data, searchTerm);
  });
}

// display ajax response to page
function displayResults(data, searchTerm) {
  let $searchResults = $(".search-results");

  // for each response
  for (let i = 0; i < data.length; i++) {
    let $giphyCard = $('<div class="card" style="width: 18em;">');

    let $img = $("<img>"); // create img
    $img.attr({
      src: data[i].images.fixed_height_still.url,
      "data-still": data[i].images.fixed_height_still.url,
      "data-animate": data[i].images.fixed_height.url,
      "data-state": "still",
      class: "card-img-top giphy",
      alt: `${searchTerm}-gif`,
      style: "height: 200px;"
    });

    let $cardBody = $('<div class="card-body"></div>');

    let $rating = $("<strong>" + data[i].rating + "</strong>");
    let $favBtn = $('<button id="fav-btn">&#x2605;</button>');
    $favBtn.attr({
      "data-still": data[i].images.fixed_height_still.url,
      "data-animate": data[i].images.fixed_height.url,
      "data-url": data[i].url,
      "data-id": data[i].id
    });

    $cardBody.append($rating, $favBtn);
    $giphyCard.append($img, $cardBody);
    $searchResults.append($giphyCard);
  }
}

// render favorites to page
function showFavorites(array) {
  $("#favorites").empty();

  let $favorites = $("#favorites");

  // for each object in my savedGifs array (retrieved from localStorage)
  array.forEach(cv => {
    let $div = $("<div class='saved-div'>"); // create div
    let $img = $("<img>"); // create img tag
    let $link = $("<a>"); // creat link tag
    let $delete = $(
      '<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
    ); // create delete button

    $img.attr({
      // add img attributes to img tag
      src: cv.dataStill,
      "data-still": cv.dataStill,
      "data-animate": cv.dataAnimate,
      "data-state": "still",
      class: "saved-giphy",
      style: "width: 100px;",
      alt: "gif-fave"
    });

    $link.attr({ href: cv.dataURL, target: "_blank" }); // add link to a tag
    $link.text("View Link"); // add text to a tag
    $div.attr("data-id", cv.id); // add id to `saved-div`
    $div.append($img, $link, $delete); // append img, link, and delete to div
    $favorites.append($div); // append that div to favorites
  });
};

// check if gif has been saved already using gif id
function verifyIfSaved(array, id) {
  let isSaved;
  array.forEach(cv => {
    if (cv.id === id) {
      isSaved = true;
    } else {
      isSaved = false;
    }
  });
  return isSaved;
};

// animation for heading
function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
};

function getItemLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key))
};

function setItemLocalStorage(key, array) {
    return localStorage.setItem(key, JSON.stringify(array))
};

function applyAnimation(element) {
    let state = element.attr("data-state");
    let stillURL = element.attr("data-still");
    let animateURL = element.attr("data-animate");

    if (state === "still") {
    element.attr({
        src: animateURL,
        "data-state": "animate"
    });
    } else if (state === "animate") {
    element.attr({
        src: stillURL,
        "data-state": "still"
    });
    }
};

$(document).ready(function() {

    let savedGifs = getItemLocalStorage('savedGifs');
        if (!Array.isArray(savedGifs)) {
            savedGifs = [];
            console.log('savedGifs', savedGifs)
        } else {
            showFavorites(savedGifs);
        }

    // on click of 'search' button, render results
    $(".input-group-text").on("click", function() {
        animateCSS('h1', 'headShake');
        $(".search-results").empty();
        searchTerm = $("input:text").val();
        searchGiphys(searchTerm);

    });

    // if what is retrieved from localStorage IS an array, then render our favorite gifs on page load.
    // animate giph if clicked
    $(".search-results").on("click", "#fav-btn", function() {
        event.preventDefault();

        // pull off attributes
        let dataStill = $(this).attr("data-still");
        let dataAnimate = $(this).attr("data-animate");
        let dataURL = $(this).attr("data-url");
        let id = $(this).attr("data-id");

        // saved gif to localStorage 'savedGifs'
        let favGif = {
            id: id,
            dataStill: dataStill,
            dataAnimate: dataAnimate,
            dataURL: dataURL
        };

        // Prevent duplicate saves of same gif/id
        let currentGifs = getItemLocalStorage('savedGifs');
        console.log(currentGifs);

        if (currentGifs === null ) {
            savedGifs.push(favGif);
            setItemLocalStorage('savedGifs', savedGifs);
            showFavorites(savedGifs);
        } else {
            if (!verifyIfSaved(currentGifs, id)) {
                savedGifs.push(favGif);
                setItemLocalStorage('savedGifs', savedGifs);
                showFavorites(savedGifs);
            } else {
                $('.modal').modal();
            }
        }
    });

    // on click of 'x' delete gif from localStorage and remove from page
    $("#favorites").on("click", ".close", function() {
        let id = $(this).parent().attr("data-id");
        let savedGifs = getItemLocalStorage('savedGifs');

        savedGifs.forEach((cv, i) => {
            if (cv.id === id) {
                savedGifs.splice(i, 1); // remove gif from array
                setItemLocalStorage('savedGifs', savedGifs); // set array in localStorage with updated array
            }
        });
        $(this).parent().remove(); // remove from page
    });

    // on click of any giphy in search results, animate
    $(".search-results").on("click", ".giphy", function() { applyAnimation($(this)); });
    // on click of star, save to favorites
    $("#favorites").on("click", ".saved-giphy", function() { applyAnimation($(this)); });
    // on click of 'clear all', clear search results
    $("#clear-all").on("click", function() { $(".search-results").empty(); });

});
