// Copyright (c) 2013, Dipanjan Mukherjee
;(function (document, chrome, history, location, localStorage) {
  var active = false; // Flag to offset the history router setup

  var treeModel = {
    /* Within this context, the treeModel is a singleton instance. It didn't
     * really require a constructor, and so wasn't given one. Since only this
     * script will have anything to do with this model, a singleton pattern
     * plain and simple works without causing any confusion. */
    'selector' : undefined,
    'tree'     : undefined,
    'switchTo' : function (id) {
      // Creates a new tree view with Id at root. If no id passed, uses bookmarks'
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
        // Store in localStorage for persistence in the newtab page
        localStorage.setItem('sane-tab-bookmark-pin-id', id);
        chrome.bookmarks.getSubTree(id, setTreeCallback);
      }
    }
  };

  var localLinkClicker = function (e) {
    /* Applied as an onclick to any link that references local states in the
     * bookmarks domain. Uses the link's href value to figure out the state and
     * uses HTML5 pushstates to update the state in the application without
     * reload. */

    // Manages history.push state
    history.pushState(null, null, e.target.href);

    var rId = e.target.href.split('root:')[1];
    treeModel.switchTo(rId);

    e.preventDefault();
    e.stopPropagation();
  }

  var historyRouter = function (e) {
    /* Route "popstate" changes through this bugger. Attach to the popstate
     * event on this page and it will figure out the requested state of the
     * application from the url and update that state. Serves as the back
     * button catcher for the pushstate system.
     */
    if (!active) {
      /* To ensure that the primary popstate event on page load isn't routed
       * through this function since that causes very unusual problems that I
       * don't fully understand.
       *
       * For eg, not having this check in place causes preexisting state (in
       * localStorage) to be ignored. Probably because 
       *
       * a) treeModel might not be prepared yet.
       *
       *   and / or
       *
       * b) the default url doesn't have any state information encoded.
       */
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

      pin.onclick = localLinkClicker;

      li.appendChild(pin);
   } else {
     // add the link 
     a.href = bookmarkTreeNode.url;

     // add a favicon
     var favicon = document.createElement('i');
     favicon.className = 'bookmark-favicon';
     favicon.style.backgroundImage = 'url(chrome://favicon/' + bookmarkTreeNode.url + ')';
     
     a.appendChild(favicon);
   }


    a.innerHTML += bookmarkTreeNode.title;

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

  // Initialization
  document.addEventListener('DOMContentLoaded', function () {
    setupBookmarks('bookmarks-list');
    window.addEventListener('popstate', historyRouter);

    // Listen to the "Undo" button.
    document.getElementsByClassName('back')[0].onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();

      history.go(-1);
    };

    document.getElementById('top').onclick = localLinkClicker;
  });
})(document, chrome, history, location, localStorage);
