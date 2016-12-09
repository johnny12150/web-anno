const E_SHOW = 'Argument 1 of seek must use filter NodeFilter.SHOW_TEXT.';
const E_WHERE = 'Argument 2 of seek must be a number or a Text Node.';


export default function seek(iter, where) {
  if (iter.whatToShow !== NodeFilter.SHOW_TEXT) {
    throw new Error(E_SHOW);
  }

  let count = 0;
  let node = iter.referenceNode;
  let predicates = null;

  if (isNumber(where)) {
    predicates = {
      forward: () => count < where,
      backward: () => count > where
    };
  } else if (isText(where)) {
    predicates = {
      forward: () => before(node, where),
      backward: () => !iter.pointerBeforeReferenceNode || after(node, where)
    };
  } else {
    throw new Error(E_WHERE);
  }

  while (predicates.forward() && (node = iter.nextNode()) !== null) {
    count += node.textContent.length;
  }

  while (predicates.backward() && (node = iter.previousNode()) !== null) {
    count -= node.textContent.length;
  }

  return count;
}


function isNumber(n) {
  return !isNaN(parseInt(n)) && isFinite(n);
}


function isText(node) {
  return node.nodeType === Node.TEXT_NODE;
}


function before(ref, node) {
  return node.compareDocumentPosition(ref) & Node.DOCUMENT_POSITION_PRECEDING;
}


function after(ref, node) {
  return node.compareDocumentPosition(ref) & Node.DOCUMENT_POSITION_FOLLOWING;
}
