$(document).ready(function() {
  var
    i = 0,
    $bg = $('.bg'),
    $div,
    baseUrl = '/assets/img/stills/',
    imgExtension = '.jpg';

  while (++i < 50) {
    $div = $('<div></div>');
    // $div.css({ 'background-image': baseUrl + 1 + imgExtension });
    $div.css({ 'background-image': 'url(' + baseUrl + getRandomInt(1, 20) + '.jpg)' });
    $bg.append($div);
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
});