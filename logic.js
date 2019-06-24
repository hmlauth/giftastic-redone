
let CORS= "https://cors-anywhere.herokuapp.com/";
let localStorageIds = [];
let searchTerms = [];
let apiKey = config.API_KEY;

function searchGiphys(searchTerm) {
    if (searchTerms.length > 0 && searchTerms.indexOf(searchTerm) > -1 ) {
        let $btn = $('<p>');
        $btn.attr('data-search', searchTerm);
        $('.search-btns').append($btn);

    } else { 

        searchTerms.push(searchTerm);

        let queryURL = CORS + 'http://api.giphy.com/v1/gifs/search?q=' + searchTerm + '&api_key=' + apiKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
                let data = response.data;
                displayResults(data, searchTerm);
        });

    }
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
    console.log('input', input);
    let $favorites = $('#favorites');
    let $div = $("<div class='saved-div'>");
    let $img = $('<img>');
    let $link = $('<a>');
    let $delete = $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');

    $img.attr({
        'src': input[1],
        'data-still': input[1],
        'data-animate': input[2],
        'data-state': 'still',
        'class': 'saved-giphy',
        'style': 'width: 100px;',
        'alt': 'gif-fave'
    });

    $link.attr({'href': input[3], 'target': '_blank'});
    $link.text('View Link');
    $div.attr('data-id', input[0])
    $div.append($img, $link, $delete);
    $favorites.append($div);

}

$(document).ready(function() {

    // localStorage.clear();
    if (localStorageIds.length > 0) {
        localStorageIds.forEach( cv => {
            let gifs = localStorage.getItem(cv);
            showFavorites(JSON.parse(gifs));
        });
    };

    $('.input-group-text').on('click', function() {
        $('.search-results').empty();
        searchTerm = $('input:text').val();
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

    $('.search-results').on('click', '#fav-btn', function() {
        event.preventDefault();
        let dataStill = $(this).attr('data-still');
        let dataAnimate = $(this).attr('data-animate');
        let dataURL = $(this).attr('data-url');
        let id = $(this).attr('data-id');

        if (localStorageIds.indexOf(id) === -1) {
            localStorageIds.push(id);
            let favorites = [id, dataStill, dataAnimate, dataURL];
            localStorage.setItem(id, JSON.stringify(favorites));

            let gifs = localStorage.getItem(id);
            showFavorites(JSON.parse(gifs));
        }
            
    });

    $('#favorites').on('click', '.close', function() {
        console.log($(this).parent().attr('data-id'));
        let id = $(this).parent().attr('data-id')
        localStorage.removeItem(id);
        $(this).parent().remove();
    })

});