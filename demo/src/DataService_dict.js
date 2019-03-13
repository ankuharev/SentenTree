import { json as d3Json, text as d3Text } from 'd3-request';

import { srtParseRows } from './srt_deep';

import { dictParseRows } from './dict_deep';

function pushTextHeader(text, keyControl) {
	if (!keyControl.includes(text))
		keyControl.push(text);
}

function parseText(text) {
	if (text.trim().indexOf(' ') > 0) {
		return '';
	}

	return text;
}

export function loadFile(file, callback) {
  const chunks = file.split('.');
  const ext = chunks[chunks.length-1].toLowerCase();

  if (ext === 'srt') {
    d3Text(file, (error, data) => {
      if (error) callback(error);

      const rows = srtParseRows(data)
        .map(([id, text, count]) => ({
          id,
          text,
          count,
        }));

      callback(error, rows);
    });
  } else if (ext === 'txt') {
    d3Text(file, (error, data) => {
      if (error) callback(error);

      const rows = dictParseRows(data)
        .map(([key, none, descr, count]) => ({
          key : parseText(key),
          descr,
          count: count || 1,
        }))
		.filter((entry) => (entry.key.length > 0)
		);

      callback(error, rows.reverse());
    });
  }
}
