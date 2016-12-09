export default function createNodeIterator(root, whatToShow, filter = null) {
  let document = root.ownerDocument;
  var iter = document.createNodeIterator(root, whatToShow, filter, false);
  return typeof(iter.referenceNode) === 'undefined' ? shim(iter, root) : iter;
}


function shim(iter, root) {
  var _referenceNode = root;
  var _pointerBeforeReferenceNode = true;

  return Object.create(NodeIterator.prototype, {
    root: {
      get: () => iter.root
    },

    whatToShow: {
      get: () => iter.whatToShow
    },

    filter: {
      get: () => iter.filter
    },

    referenceNode: {
      get: () => _referenceNode
    },

    pointerBeforeReferenceNode: {
      get: () => _pointerBeforeReferenceNode
    },

    detach: {
      get: () => iter.detach
    },

    nextNode: {
      value: () => {
        let result = iter.nextNode();
        _pointerBeforeReferenceNode = false;
        if (result === null) {
          return null;
        } else {
          _referenceNode = result;
           return _referenceNode;
        }
      }
    },

    previousNode: {
      value: () => {
        let result = iter.previousNode();
        _pointerBeforeReferenceNode = true;
        if (result === null) {
           return null;
        } else {
          _referenceNode = result;
           return _referenceNode;
        }
      }
    }
  });
}
