// Copyright (c) 2013, Dipanjan Mukherjee
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
      chrome.bookmarks.getSubTree(id, setTreeCallback);
    }
  }
};

var NodeView = function (bookmarkTreeNode) {
  // Parses a single item into an li view
  var li = document.createElement('li')
    , a  = document.createElement('a');

  if (bookmarkTreeNode.url === undefined) {
    // Folder node
    a.href = '#id'
    li.className = 'folder';

    // Create a pin button and push that onto the li
    var pin = document.createElement('a');
    pin.className = 'pin';
    pin.href = "#mag:" + bookmarkTreeNode.id;
    pin.textContent = "Pin as top";

    pin.onclick = function (e) {
      e.stopPropagation();

      treeModel.switchTo(bookmarkTreeNode.id);
    }

    li.appendChild(pin);
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
  treeModel.switchTo(); // Without arguments will get root
};

document.addEventListener('DOMContentLoaded', function () {
  setupBookmarks('bookmarks-list');
});
