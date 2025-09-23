//ripped from https://www.mediacollege.com/internet/javascript/text/count-words.html
export function countWords(message: string) {
    message = message.replace(/(^\s*)|(\s*$)/gi,"");
	message = message.replace(/[ ]{2,}/gi," ");
	message = message.replace(/\n /,"\n");
	return message.split(' ').length;
}