//ripped from https://www.mediacollege.com/internet/javascript/text/count-words.html
function extractSubstr(str: string, regexp: RegExp) {
    return str.replace(/[^\w\s]|_/g, '')
        .replace(/\s+/g, ' ')
        .toLowerCase().match(regexp) || [];
}

export function countWords(message: string) {
    // message = message.replace(/(^\s*)|(\s*$)/gi,"");
	// message = message.replace(/[ ]{2,}/gi," ");
	// message = message.replace(/\n /,"\n");
	// return message.split(' ').length;
	return extractSubstr(message, /\S+/g).length;
}