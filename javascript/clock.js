// Copyright (c) 2013, Dipanjan Mukherjee

// Initialization code is at the bottom
;(function (document, Date) {
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December']

  , DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday']

  , zeroPad = function (number) {
    /* Add a zero before the @param number if it is less than 10 less than 10
     * @return {string} since that is what will be fed into the DOM. */
    return number < 10 ? "0" + number : number;
  }

  , setupTime = function (selector) {
    /* Calculate current time and put that time as innerHTML into 
     * @param selector.  Also setTimeout for repeating this every 30 seconds. */
    var today = new Date()
      , h = today.getHours()
      , m = today.getMinutes();

    // add a zero in front of numbers<10
    m = zeroPad(m);
    h = zeroPad(h);

    document.getElementById(selector).innerHTML = h + ":" + m;

    // Call this function every half minute, since time in hh:mm doesn't change
    // all that frequently. :)
    t = setTimeout(function () { setupTime(selector); },3000);
  }

  , setupDate = function (selector) {
    /* Calculate current date and put that date as innerHTML into 
     * @param selector. This is a very optimistic function since there is no
     * setTimeout call here. */
    var today = new Date()
      , w = today.getDay()
      , d = today.getDate()
      , m = today.getMonth();

    // Add a zero to date
    d = zeroPad(d);

    document.getElementById(selector).innerHTML = DAYS[w] + ", " + d + " " + MONTHS[m];
  };

  // Initialization
  document.addEventListener('DOMContentLoaded', function () {
    setupTime('time');
    setupDate('date');
  });
})(document, Date);
