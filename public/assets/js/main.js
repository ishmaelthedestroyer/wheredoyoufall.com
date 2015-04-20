$(document).ready(function() {

  /* ==========================================================================
     Local variables
     ========================================================================== */

  var

    /**
     * photos to display in the mosaic
     * @type {Array}
     */
    photos = [],

    /**
     * jquery selector
     * @type {jQuery|HTMLElement}
     */
    $bg = $('.bg'),

    /**
     * width of the window
     * @type {Number}
     */
    windowWidth = 0,

    /**
     * height of the window
     * @type {Number}
     */
    windowHeight = 0,

    /** iterator, placeholder variables */
    i, k, ref, len;

  /* ==========================================================================
     Helper functions
     ========================================================================== */

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * determines the number of titles based off of the screen width & height
   */
  function createTiles() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    $.each($bg.children(), function(index, tile) {
      $(tile).remove();
    })

    i = 0;
    var
      tileSize = 200,
      smallerTile = tileSize - 40,
      numTiles = (windowWidth * windowHeight) / (smallerTile * smallerTile);

    while (++i < Math.ceil(numTiles)) {
      k = getRandomInt(0, photos.length - 1);
      ref = $('<div></div>');
      ref.css({ 'background-image': 'url(' + photos[k] + ')' });
      $bg.append(ref);
    }
  }

  /**
   * returns an array of photos, the initial dataset for the mosaic while loading from twitter
   * @returns {Array}
   */
  function loadBasePhotos() {
    var queue = [];
    k = 0;

    while (21 > k++) {
      queue.push('/assets/img/stills/' + k + '.jpg');
    }

    return queue;
  }

  /**
   * loads tweets from the server
   * @param onSuccess {Function} function to call on success
   * @param onFailure {Function} function to call on failure
   */
  function loadTweets(onSuccess, onFailure) {
    $.get('/tweets').done(onSuccess).fail(onFailure);
  }

  /**
   * takes an array of tweets, returns images from the statuses
   * @param tweets {Array} array of tweets
   * @returns {Array} array of photos
   */
  function parseImagesFromTweets(tweets) {
    var queue = [];
    var l = 0;
    $.each(tweets, function(index, tweet) {
      ++l;
      if (!tweet || !tweet.entities || !tweet.entities.media || !(tweet.entities.media instanceof Array)) {
        return;
      }

      $.each(tweet.entities.media, function(index, media) {
        queue.push(media.media_url);
      });
    });

    return queue;
  }

  /**
   * animated transition; chooses a photo in the mosaic at random, animates it out, and replaces it with a new random photo
   */
  function animateTransition() {
    var
      $photo = $bg.find('div:nth-child(' + getRandomInt(0, $bg.children().length) + ')'),
      newImg = photos[getRandomInt(0, photos.length - 1)];

    $photo.animate({ opacity: 0.2 }, 750, function() {
      $photo.css({ 'background-image': 'url(' + newImg + ')' });
      $photo.animate({ opacity: 1 }, 500);
    });
  }

  /* ==========================================================================
     Initialization logic
     ========================================================================== */

  // load initial photos, add to `photos` array
  $.each(loadBasePhotos(), function(index, photo) {
    photos.push(photo);
  });

  // create mosaic of photos
  createTiles();

  // listen for window resize to create more tiles
  $(window).resize(createTiles);

  // animate the mosaic
  setInterval(animateTransition, 400);

  // load the tweets from the server
  loadTweets(function(data) { // on success callback
    var
    // parse images from the tweets
      newImages = parseImagesFromTweets(data.statuses),

    // get the number of default photos
      numDefaultImages = photos.length;

    i = 0;

    // replace as many of the default images as possible
    while (newImages.length > i++) {
      if (numDefaultImages > 0) {
        --numDefaultImages;
        photos.splice(0, 1);
      }

      photos.push(newImages[i]);
    }

    // reset images with `createTiles`
    createTiles();
  }, function(err) { // on failure callback
    console.log('Error loading Tweets.');
    console.log(err);
  });
});