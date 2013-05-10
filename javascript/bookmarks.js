// Copyright (c) 2013, Dipanjan Mukherjee
var active = false; // Flag to offset the history router setup

var treeModel = {
  'selector' : undefined,
  'tree'     : undefined,
  'switchTo' : function (id) {
    // Creates a new tree view with Id at root. If no id passed, uses bookmarks
    // root
    var that = this
      , setTreeCallback = function(tree) {
        that.selector.innerHTML = '';  // Clear div
        that.tree = tree;
        that.selector.appendChild(TreeView(tree[0]));
      };

    if (id === undefined) {
      chrome.bookmarks.getTree(setTreeCallback);
    } else {
      // Store in localStorage
      localStorage.setItem('sane-tab-bookmark-pin-id', id);
      chrome.bookmarks.getSubTree(id, setTreeCallback);
    }
  }
};

var pinClicker = function (e) {
  // Manages history.push state
  history.pushState(null, null, e.target.href);

  var rId = e.target.href.split('root:')[1];
  treeModel.switchTo(rId);

  e.preventDefault();
  e.stopPropagation();
}

var historyRouter = function (e) {
  // Route "popstate" changes through this bugger
  console.log(location.pathname);
  if (!active) {
    active = true;
    return;
  }

  var rId = location.pathname.split('root:')[1];
  treeModel.switchTo(rId);
};

var NodeView = function (bookmarkTreeNode) {
  // Parses a single item into an li view
  var li = document.createElement('li')
    , a  = document.createElement('a');

  if (bookmarkTreeNode.url === undefined) {
    // Folder node
    li.className = 'folder';

    // Create a pin button and push that onto the li
    var pin = document.createElement('a');
    pin.className = 'pin';
    pin.href = "/root:" + bookmarkTreeNode.id;
    pin.textContent = "Pin as top";

    pin.onclick = pinClicker;

    li.appendChild(pin);
 } else {
   a.href = bookmarkTreeNode.url;
 }


  a.innerHTML = bookmarkTreeNode.title;

  li.appendChild(a);
  return li;
};

var TreeView = function (node) {
  // Parses the entire tree into a ul > li view
  var ul, li, item = {};

  ul = document.createElement('ul');

  if (node.hasOwnProperty('parentId')) {
    item['parentId'] = node['parentId'];
  }

  item['id']    = node['id'];
  item['title'] = node['title'];
  item['url']   = node['url'];

  // If id is 0, this is the root of all bookmarks
  if (item.id === '0') {
    item.title = 'All bookmarks'
  }

  li = NodeView(item);
  ul.appendChild(li);
  
  if (node.hasOwnProperty('children')) {
    var i=0, children = node['children'], c_ul;

    c_ul = document.createElement('ul');

    for (; i<children.length; i++) {
      var c_li = TreeView(children[i]);

      c_ul.appendChild(c_li);
    }

    ul.appendChild(c_ul);

    // Register tree toggling actions
    li.onclick = function () {
      if (c_ul.className === 'hidden') {
        c_ul.className = '';
      } else {
        c_ul.className = 'hidden';
      }
    };
  } else {
    return li;
  }

  return ul;
};

var setupBookmarks = function (selector) {
  treeModel.selector = document.getElementById(selector);
  pinId = localStorage.getItem('sane-tab-bookmark-pin-id');

  if(pinId === null) {
    treeModel.switchTo(); // Without arguments will get root
  } else {
    treeModel.switchTo("" + pinId);
  };

};

document.addEventListener('DOMContentLoaded', function () {
  setupBookmarks('bookmarks-list');
  window.addEventListener('popstate', historyRouter);

  // Listen to the "Undo" button.
  document.getElementsByClassName('back')[0].onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();

    history.go(-1);
  };

  document.getElementById('top').onclick = pinClicker;
});
