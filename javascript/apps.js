// Copyright (c) 2013, Dipanjan Mukherjee

var filter = function (list, condition) {
  var rtn = [];

  for (var i=0; i<list.length; i++) {
    if (condition(list[i], i)) {
      rtn.push(list[i]);
    }
  }

  return rtn;
}; 

var get128Icon = function (icons) {
  for (var i=0; i<icons.length; i++) {
    if (icons[i].size === 128) {
      return icons[i].url;
    }
  }
}

var appsModel = {
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
  chrome.management.getAll(function (all) {
    appsModel.selector = document.getElementById(selector);
    appsModel.apps = filter(all, function(app, index) {
      return app.isApp;
    });

    appsModel.refresh();
  });
};

document.addEventListener('DOMContentLoaded', function () {
  setupApps('apps-list');
});
