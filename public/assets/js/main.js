$(document).ready(function() {
  var cw = Raphael.colorwheel($('.color-wheel')[0], 500).color('#F00');
  cw.onchange(function(color) {
    var
      $overlay = $('.overlay'),
      r = Math.floor(color.r),
      g = Math.floor(color.g),
      b = Math.floor(color.b),
      a = 0.6,
      newColor = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';

    $overlay.css({
      'background-color': newColor
    });

    console.log(newColor);
  });
});