// Copyright (c) 2013, Dipanjan Mukherjee
;(function (document, chrome) {
  var filter = function (list, condition) {
    /* Functional programming filter construct.
     *
     * only returns elements of @param list that meet @param condition
     *
     * @param condition is of the form function (element, index) {...}; */
    var rtn = [];

    for (var i=0; i<list.length; i++) {
      if (condition(list[i], i)) {
        rtn.push(list[i]);
      }
    }

    return rtn;
  }; 

  var get128Icon = function (icons) {
    /* Ridiculous way to figure out the icon for 128 size. TODO make a more
     * sensible judgement and also accept 48px icons or atleast don't rely on
     * there *being* a 128px icon. */
    for (var i=0; i<icons.length; i++) {
      if (icons[i].size === 128) {
        return icons[i].url;
      }
    }
  }

  var appsModel = {
    /* Within this context, the appsModel is a singleton instance. It didn't
     * really require a constructor, and so wasn't given one. Since only this
     * script will have anything to do with this model, a singleton pattern
     * plain and simple works without causing any confusion. */

    'selector' : undefined,
    'apps'     : undefined,
    'refresh'  : function () {
      var ul = document.createElement('ul');

      for (var i=0; i<this.apps.length; i++) {
        var a = document.createElement('a')
          , img = document.createElement('img')
          , li = document.createElement('li');

        img.src = get128Icon(this.apps[i].icons);

        a.href = this.apps[i].appLaunchUrl;
        a.appendChild(img);

        li.appendChild(a);
        ul.appendChild(li);
      }

      this.selector.innerHTML = '';
      this.selector.appendChild(ul);
    }
  };

  var setupApps = function (selector) {
    /* Use the chrome.management interface to get a list of all the installed
     * apps, creates a list out of it and pushes it to the DOM inside 
     * @param selector. */
    chrome.management.getAll(function (all) {
      appsModel.selector = document.getElementById(selector);
      appsModel.apps = filter(all, function(app, index) {
        return app.isApp;
      });

      appsModel.refresh();
    });
  };

  // Initialization
  document.addEventListener('DOMContentLoaded', function () {
    setupApps('apps-list');
  });
})(document, chrome);
