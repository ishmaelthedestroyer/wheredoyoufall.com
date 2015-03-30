$(document).ready(function() {
  var
    cwLarge = Raphael.colorwheel($('.color-wheel.large')[0], 300).color('#a6927e'),
    cwSmall = Raphael.colorwheel($('.color-wheel.small')[0], 100).color('#a6927e');

  var update = function(color) {
    var
      $h1 = $('h1'),
      $overlay = $('.overlay'),
      $rays = $('.sunburst b'),
      r = Math.floor(color.r),
      g = Math.floor(color.g),
      b = Math.floor(color.b),
      a = 0.6,
      newColor = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + 0.3 + ')';

    // $h1.css({ color: color.hex });
    $rays.css({ 'border-color': 'transparent ' + newColor });
    $overlay.css({ 'background-color': newColor });

    console.log(color, newColor);
  };

  cwLarge.onchange(update);
  cwSmall.onchange(update);

  update({ r: '166', g: '146', b: '126', hex: '#a6927e' });

  $('#form-email').submit(function(e) {
    e.preventDefault();
    e.stopPropagation();

    alert('This doesn\'t do anything yet lol.');
  });
});