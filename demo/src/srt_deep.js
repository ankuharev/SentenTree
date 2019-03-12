import srt from "./srt";

var srt_deep = srt("\t");

export var srtParse = srt_deep.parse;
export var srtParseRows = srt_deep.parseRows;
export var srtFormat = srt_deep.format;
export var srtFormatRows = srt_deep.formatRows;
