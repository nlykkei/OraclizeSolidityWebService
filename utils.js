function intTo32BigEndianString(n) {
    var result = String.fromCharCode((n >> 24) & 0xFF);
    result += String.fromCharCode((n >> 16) & 0xFF);
    result += String.fromCharCode((n >> 8) & 0xFF);
    result += String.fromCharCode((n >> 0) & 0xFF);
    
    return result;
}

function intTo16BigEndianString(n) {
    var result = String.fromCharCode((n >> 8) & 0xFF);
    result += String.fromCharCode((n >> 0) & 0xFF);
    
    return result;
}

module.exports = {
    intTo32BigEndianString: intTo32BigEndianString,
    intTo16BigEndianString: intTo16BigEndianString
}