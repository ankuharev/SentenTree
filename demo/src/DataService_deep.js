import { json as d3Json, text as d3Text } from 'd3-request';

//import { tsvParseRows } from 'd3-dsv';

import { tsvParseRows } from './srt_deep';

function pushTextHeader(text, keyControl) {
	if (!keyControl.includes(text))
		keyControl.push(text);
}

function parseText(id, name, text, keyControl, key, dictWords) {
	if (id == 'id')
		return text;
	
	if (name.length > 1 && id.substring(0,2) != name)
	  return '';

	if (!isNaN(key)) {
		if (key == 0) {
			let spacePosition = text.indexOf(' ');
			
			if (spacePosition === -1)
				pushTextHeader(text, keyControl);
			else
				pushTextHeader(text.substr(0, spacePosition), keyControl);
		} else if (key > 0) { 
			let keyName = keyControl[key];
			
			if (text.length < keyName.length + 1)
				return '';
			else if (text.substring(0,keyName.length + 1) != (keyName + ' ')) 
				return '';
		}
	}

	if (dictWords.length > 0) {
		if (dictWords.some((word) => text.indexOf(word) > 0)) {
			return text;
		} else {
			return '';
		}
	}
	
	return text;
}

function cleanCount(count) {
  if (count && !isNaN(count) && count < 10)
	  return 10;
  return count;
}

export function loadFile(name, file, keyControl, key, dictWords, callback) {
  const chunks = file.split('.');
  const ext = chunks[chunks.length-1].toLowerCase();

  if (name.length > 2) 
	  name = '';
		  
  if (ext === 'json') {
    d3Json(file, (error, data) => {
      if (error) callback(error);

      const rows = data.map(row => ({
        id: row.id,
        text: parseText(id, name, row.text, keyControl),
        count: +row.count
      }));

      callback(error, rows);
    });
  } else if (ext === 'tsv') {
    d3Text(file, (error, data) => {
      if (error) callback(error);

	  if (key == 0) {
		  keyControl.splice(0,keyControl.length);
		  keyControl.push('*');
	  }

      const rows = tsvParseRows(data)
        .map(([id, text, count]) => ({
          id,
          text: parseText(id, name, text, keyControl, key, dictWords),
          count: +cleanCount(count)
        }));

      callback(error, rows);
    });
  }
}
