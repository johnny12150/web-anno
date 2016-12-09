import DiffMatchPatch from 'diff-match-patch';
import TextPositionAnchor from 'dom-anchor-text-position';

// The DiffMatchPatch bitap has a hard 32-character pattern length limit.
const CONTEXT_LENGTH = 32;


export default class TextQuoteAnchor {
  constructor(root, exact, context = {}) {
    if (root === undefined) {
      throw new Error('missing required parameter "root"');
    }
    if (exact === undefined) {
      throw new Error('missing required parameter "exact"');
    }
    this.root = root;
    this.exact = exact;
    this.prefix = context.prefix;
    this.suffix = context.suffix;
  }

  static fromRange(root, range) {
    if (range === undefined) {
      throw new Error('missing required parameter "range"');
    }

    let position = TextPositionAnchor.fromRange(root, range);
    return this.fromPositionAnchor(position);
  }

  static fromSelector(root, selector = {}) {
    return new TextQuoteAnchor(root, selector.exact, selector);
  }

  static fromPositionAnchor(anchor) {
    let root = anchor.root;

    let {start, end} = anchor;
    let exact = root.textContent.substr(start, end - start);

    let prefixStart = Math.max(0, start - CONTEXT_LENGTH);
    let prefix = root.textContent.substr(prefixStart, start - prefixStart);

    let suffixEnd = Math.min(root.textContent.length, end + CONTEXT_LENGTH);
    let suffix = root.textContent.substr(end, suffixEnd - end);

    return new TextQuoteAnchor(root, exact, {prefix, suffix});
  }

  toRange(options) {
    return this.toPositionAnchor(options).toRange();
  }

  toSelector() {
    let selector = {
      type: 'TextQuoteSelector',
      exact: this.exact,
    };
    if (this.prefix !== undefined) selector.prefix = this.prefix;
    if (this.suffix !== undefined) selector.suffix = this.suffix;
    return selector;
  }

  toPositionAnchor(options = {}) {
    let {hint} = options;
    let root = this.root;
    let dmp = new DiffMatchPatch();

    dmp.Match_Distance = root.textContent.length * 2;

    // Work around a hard limit of the DiffMatchPatch bitap implementation.
    // The search pattern must be no more than 32 characters.
    let slices = this.exact.match(/(.|[\r\n]){1,32}/g);
    let loc = (hint === undefined) ? ((root.textContent.length / 2) | 0) : hint;
    let start = Number.POSITIVE_INFINITY;
    let end = Number.NEGATIVE_INFINITY;
    let result = -1;

    // If the prefix is known then search for that first.
    if (this.prefix !== undefined) {
      result = dmp.match_main(root.textContent, this.prefix, loc);
      if (result > -1) loc = result + this.prefix.length;
    }

    // Search for the first slice.
    let firstSlice = slices.shift();
    result = dmp.match_main(root.textContent, firstSlice, loc);
    if (result > -1) {
      start = result;
      loc = end = start + firstSlice.length;
    } else {
      throw new Error('no match found');
    }

    // Create a fold function that will reduce slices to positional extents.
    let foldSlices = (acc, slice) => {
      let result = dmp.match_main(root.textContent, slice, acc.loc);
      if (result === -1) {
        throw new Error('no match found');
      }

      // The next slice should follow this one closely.
      acc.loc = result + slice.length;

      // Expand the start and end to a quote that includes all the slices.
      acc.start = Math.min(acc.start, result);
      acc.end = Math.max(acc.end, result + slice.length);

      return acc;
    };

    // Use the fold function to establish the full quote extents.
    // Expect the slices to be close to one another.
    // This distance is deliberately generous for now.
    dmp.Match_Distance = 64;
    let acc = slices.reduce(foldSlices, {
      start: start,
      end: end,
      loc: loc,
    });

    return new TextPositionAnchor(root, acc.start, acc.end);
  }
}
