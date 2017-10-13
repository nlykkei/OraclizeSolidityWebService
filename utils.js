function intTo256BigEndianString(n) {
    var result = "";
    
    for (var i = 0; i < 28; i++) {
        result += String.fromCharCode(0x00);
    }
    
    result += String.fromCharCode((n >> 24) & 0xFF);
    result += String.fromCharCode((n >> 16) & 0xFF);
    result += String.fromCharCode((n >> 8) & 0xFF);
    result += String.fromCharCode((n >> 0) & 0xFF);
    
    return result;
}

function intTo32BigEndianString(n) {
    var result = "";

    result += String.fromCharCode((n >> 24) & 0xFF);
    result += String.fromCharCode((n >> 16) & 0xFF);
    result += String.fromCharCode((n >> 8) & 0xFF);
    result += String.fromCharCode((n >> 0) & 0xFF);
    
    return result;
}

function intTo16BigEndianString(n) {
    var result = "";

    result += String.fromCharCode((n >> 8) & 0xFF);
    result += String.fromCharCode((n >> 0) & 0xFF);
    
    return result;
}

module.exports = {
    intTo256BigEndianString: intTo256BigEndianString,
    intTo32BigEndianString: intTo32BigEndianString,
    intTo16BigEndianString: intTo16BigEndianString
}