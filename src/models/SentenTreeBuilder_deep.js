import SentenTreeModel from './SentenTreeModel.js';
import TokenizedDataset from './TokenizedDataset.js';
import WordFilter from './WordFilter.js';
import DictionaryFilter from './WordFilter_deep.js';
import { tokenize } from './tokenize.js';

const identity = x => x;

export default class SentenTreeBuilder {
  constructor() {
    this._tokenize = tokenize;
    this._transformToken = identity;
    const filter = WordFilter.getDefault();
    const dictFilter = DictionaryFilter.getDefault();
    this._dictToken = token => dictFilter.test(token);
    this._filterToken = token => !filter.test(token);
  }

  tokenize(...args) {
    if (args.length === 0) return this._tokenize;
    this._tokenize = args[0];
    return this;
  }

  transformToken(...args) {
    if (args.length === 0) return this._transformToken;
    this._transformToken = args[0];
    return this;
  }

  filterToken(...args) {
    if (args.length === 0) return this._filterToken;
    this._filterToken = args[0];
    return this;
  }

  buildTokenizedDataset(entries) {
    const dictTokenizedEntries = entries
      .map(entry => ({
        id: entry.id+"_10",
        count: entry.count*10,
        tokens: this._tokenize(entry.text)
          .map(this._transformToken)
          .filter(this._dictToken),
        rawText: entry.text,
      }))
      .filter(entry => entry.tokens.length > 0);

    const tokenizedEntries = entries
      .map(entry => ({
        id: entry.id,
        count: entry.count || 1,
        tokens: this._tokenize(entry.text)
          .map(this._transformToken)
          .filter(this._filterToken),
        rawText: entry.text,
      }))
      .filter(entry => entry.tokens.length > 3);
	  
    const tokenEntries = tokenizedEntries.slice(0,1).concat(dictTokenizedEntries).concat(tokenizedEntries.slice(1));
    return new TokenizedDataset(tokenEntries);
  }

  buildModel(entries, options) {
    return new SentenTreeModel(
      this.buildTokenizedDataset(entries),
      options
    );
  }
}
