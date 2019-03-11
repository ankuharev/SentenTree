import { keyBy, uniq } from 'lodash';

const NLTK_FILTER_WORDS = [
//'good',
'mean',
//'either',
'dead',
'treat',
'reason',
'rash',
'tumor',
'lung',
'kidney',
'apparently',
'chest',
'eventually',
'guilt',
'boring',
'ankle',
'decent',
'wonder',
'weird',
'pretend',
'sore',
'swelling',
'renal',
'owe',
'lupus',
'barely',
'handle',
'thyroid',
'fair',
'honor',
'odds',
//'whether',
'clot',
'platelets',
'fungal',
'faith',
'marrow',
'pretending',
'tissue',
'consent'
]; 

export default class DictionaryFilter {
  constructor({
  } = {}) {
	//this.filterWords = NLTK_FILTER_WORDS;
    //this.regex = new RegExp(`^(${this.filterWords.join('|')})$`);
  }

  test(word) {
    return this.regex.test(word);
  }
  
  filterTree(dictWords) {
	this.filterWords = dictWords; //NLTK_FILTER_WORDS;
    this.regex = new RegExp(`^(${this.filterWords.join('|')})$`);
  }
}

let dictFilter = null;
DictionaryFilter.getDefault = () => {
  if (!dictFilter) {
    dictFilter = new DictionaryFilter();
  }
  return dictFilter;
};
