$(document).ready(function() {
  var
    i = 0,
    $bg = $('.bg'),
    $div,
    baseUrl = '/assets/img/stills/',
    numPhotos = 21;

  while (++i < 100) {
    $div = $('<div></div>');
    $div.css({ 'background-image': 'url(' + baseUrl + getRandomInt(1, numPhotos) + '.jpg)' });
    $bg.append($div);
  }

  // change random photo periodically
  setInterval(function() {
    var
      $photo = $bg.find('div:nth-child(' + getRandomInt(1, numPhotos) + ')'),
      newImg = baseUrl + getRandomInt(1, numPhotos) + '.jpg';

    $photo.animate({ opacity: 0.2 }, 750, function() {
      $photo.css({ 'background-image': 'url(' + newImg + ')' });
      $photo.animate({ opacity: 1 }, 500);
    });
  }, 1000);

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
});