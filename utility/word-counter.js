//ripped from https://www.mediacollege.com/internet/javascript/text/count-words.html
exports.countWords = function(message) {
    message = message.replace(/(^\s*)|(\s*$)/gi,"");
	message = message.replace(/[ ]{2,}/gi," ");
	message = message.replace(/\n /,"\n");
	return message.split(' ').length;
}