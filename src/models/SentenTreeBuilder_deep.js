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
    //this._dictToken = token => dictFilter.test(token);
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
    const tokenizedEntries = entries
      .map(entry => ({
        id: entry.id,
        count: entry.count,
        tokens: this._tokenize(entry.text)
          .map(this._transformToken)
          .filter(this._filterToken),
        rawText: entry.text,
      }))
      .filter(entry => entry.tokens.length > 0);
	  
	tokenizedEntries.forEach(function(part, index) {
		this[index].count = dictFilter.test(this[index].tokens)?this[index].count*10:this[index].count;
	}, tokenizedEntries);

    return new TokenizedDataset(tokenizedEntries);
  }

  buildModel(entries, options) {
    return new SentenTreeModel(
      this.buildTokenizedDataset(entries),
      options
    );
  }
}
