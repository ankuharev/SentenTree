import { json as d3Json, text as d3Text } from 'd3-request';

import { tsvParseRows } from 'd3-dsv';

function pushTextHeader(text, keyControl) {
	if (!keyControl.includes(text))
		keyControl.push(text);
}

function parseTextHeader(id, name, text, keyControl, key) {
	if (id == 'Hid')
		return ''; // text;
	
	if (name.length == 5 && isNaN(id)){
        let learn = name.substring(0,2).toLowerCase();
        //let nativ = name.substring(3).toLowerCase();
        let pref = id.substring(0,2).toLowerCase();
        if (!(learn == pref)) // || nativ == pref))
        //if (!(learn == pref || nativ == pref))
            return '';
    }

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

	return text.split(' ',1)[0];
}

function parseText(id, name, text, keyControl, key, headers) {
	if (id == 'id')
		return text;
	
	if (name.length == 5 && isNaN(id)){
        let learn = name.substring(0,2).toLowerCase();
        let nativ = name.substring(3).toLowerCase();
        let pref = id.substring(0,2).toLowerCase();
        if (!(learn == pref || nativ == pref))
            return '';
    }

    let header = text.split(' ',1)[0];
    if (headers.indexOf(header) == -1)
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

	return text;
}

function cleanCount(count) {
  if (count && !isNaN(count) && count < 10)
	  return 10;
  return count;
}

export function loadFile(name, file, keyControl, key, callback) {
  const chunks = file.split('.');
  const ext = chunks[chunks.length-1].toLowerCase();

  //if (name.length > 2) 
	//  name = '';
		  
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

      const rows_header = tsvParseRows(data)
        .map(([id, text, count]) => ({
          id: 'H'+id,
          text: parseTextHeader(id, name, text, keyControl, key),
          count: +cleanCount(count*20)
        }))
        .filter((data) => data.text.length > 0);

      const headers = rows_header
        .map((data) => data.text)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      const rows = tsvParseRows(data)
        .map(([id, text, count]) => ({
          id,
          text: parseText(id, name, text, keyControl, key, headers),
          count: +cleanCount(count)
        }))
        .filter((data) => data.text.length > 0);

        callback(error, rows.slice(0,1).concat(rows_header).concat(rows.slice(1)));
    });
  }
}
