import srt from "./srt";

var tsv = srt("\t");

export var tsvParse = tsv.parse;
export var tsvParseRows = tsv.parseRows;
export var tsvFormat = tsv.format;
export var tsvFormatRows = tsv.formatRows;
