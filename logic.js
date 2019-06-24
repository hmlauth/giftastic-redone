
/* TODO:
1. Render favorites on page load
2. Create buttons for frequently searched terms
3. Add filter for saved gifs by topic? 
*/

let CORS= "https://cors-anywhere.herokuapp.com/";
// let localStorageIds = [];
// let searchTerms = [];
let apiKey = config.API_KEY;

function searchGiphys(searchTerm) {

    let queryURL = CORS + 'http://api.giphy.com/v1/gifs/search?q=' + searchTerm + '&api_key=' + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
            let data = response.data;
            console.log('data', data);
            displayResults(data, searchTerm);
    });
};

function displayResults(data, searchTerm) {
    console.log(data);
    let $searchResults = $(".search-results");

    // for each response
    for (let i = 0; i < data.length; i++) {

        let $giphyCard = $('<div class="card" style="width: 18em;">');

        let $img = $('<img>'); // create img
        $img.attr({
            'src': data[i].images.fixed_height_still.url,
            'data-still': data[i].images.fixed_height_still.url,
            'data-animate': data[i].images.fixed_height.url,
            'data-state': 'still',
            'class': 'card-img-top giphy',
            'alt': `${searchTerm}-gif`,
            'style': 'height: 200px;'
        }); 

        let $cardBody = $('<div class="card-body"></div>');
        
        let $rating = $('<strong>' + data[i].rating + '</strong>');
        let $favBtn = $('<button id="fav-btn">&#x2605;</button>');
        $favBtn.attr({
            'data-still': data[i].images.fixed_height_still.url,
            'data-animate': data[i].images.fixed_height.url,
            'data-url': data[i].url,
            'data-id': data[i].id
        })

        $cardBody.append($rating, $favBtn);
        $giphyCard.append($img, $cardBody);
        $searchResults.append($giphyCard);
    }
}

function showFavorites(input) {
    console.log('>>>>>', input);
        $('#favorites').empty();

        let $favorites = $('#favorites');
       
        // for each object in my savedGifs array (retrieved from localStorage)
        input.forEach(cv => {
            let $div = $("<div class='saved-div'>"); // create div
            let $img = $('<img>'); // create img tag
            let $link = $('<a>'); // creat link tag
            let $delete = $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>'); // create delete button

            $img.attr({ // add img attributes to img tag
                'src': cv.dataStill,
                'data-still': cv.dataStill,
                'data-animate': cv.dataAnimate,
                'data-state': 'still',
                'class': 'saved-giphy',
                'style': 'width: 100px;',
                'alt': 'gif-fave'
            });

            $link.attr({'href': cv.dataURL, 'target': '_blank'}); // add link to a tag
            $link.text('View Link'); // add text to a tag
            $div.attr('data-id', cv.id); // add id to `saved-div`
            $div.append($img, $link, $delete); // append img, link, and delete to div 
            $favorites.append($div); // append that div to favorites 
       
        });

}

$(document).ready(function() {

    // localStorage.clear();

    $('.input-group-text').on('click', function() {
        $('.search-results').empty();
        searchTerm = $('input:text').val();
        console.log('search term', searchTerm);
        searchGiphys(searchTerm);

    });

    $('#clear-all').on('click', function() {
        $('.search-results').empty();
    });

    $('.search-results').on('click', '.giphy', function() {
        let src = $(this).attr('src');
        let state = $(this).attr('data-state');
        let stillURL = $(this).attr('data-still');
        let animateURL = $(this).attr('data-animate');

        if ( state === 'still') {
            $(this).attr({
                'src': animateURL,
                'data-state': 'animate'
            })
        } else if ( state === 'animate') {
            $(this).attr({
                'src': stillURL,
                'data-state': 'still'
            })
        }
    });

    $('#favorites').on('click', '.saved-giphy', function() {
        let src = $(this).attr('src');
        let state = $(this).attr('data-state');
        let stillURL = $(this).attr('data-still');
        let animateURL = $(this).attr('data-animate');

        if ( state === 'still') {
            $(this).attr({
                'src': animateURL,
                'data-state': 'animate'
            })
        } else if ( state === 'animate') {
            $(this).attr({
                'src': stillURL,
                'data-state': 'still'
            })
        }
    });

    // LOCALSTORAGE
    // Get 'savedGifs' from localStorage. 
    var savedGifs = JSON.parse(localStorage.getItem("savedGifs"));
    console.log('savedGifs', savedGifs);

    // If what is retrieved from localStorage is NOT an array, then set savedGifs to an empty array (now we can push things to it).
    if (!Array.isArray(savedGifs)) {
        savedGifs = [];
    } else {
        showFavorites(savedGifs);
    }

    // if what is retrieved from localStorage IS an array, then render our favorite gifs on page load.

    $('.search-results').on('click', '#fav-btn', function() {
        event.preventDefault();

        let dataStill = $(this).attr('data-still');
        let dataAnimate = $(this).attr('data-animate');
        let dataURL = $(this).attr('data-url');
        let id = $(this).attr('data-id');

        // saved gif to localStorage 'savedGifs'
        let favGif = {
            'id': id,
            'dataStill': dataStill,
            'dataAnimate': dataAnimate,
            'dataURL': dataURL
        };
        
        // TODO: Prevent duplicate saves of same gif/id

        console.log('savedGifs before push', savedGifs)
        savedGifs.push(favGif);
        localStorage.setItem("savedGifs", JSON.stringify(savedGifs));
        showFavorites(savedGifs);
            
    });

    $('#favorites').on('click', '.close', function() {
        let id = $(this).parent().attr('data-id');
        let savedGifs = JSON.parse(localStorage.getItem('savedGifs')); 
        savedGifs.forEach( (cv,i) => { 
            if ( cv.id === id ) {
                savedGifs.splice(i, 1); // remove gif from array
                localStorage.setItem("savedGifs", JSON.stringify(savedGifs)); // set array in localStorage with updated array
            };
        });
        $(this).parent().remove(); // remove from page
    })

});