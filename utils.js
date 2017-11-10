/**
 * Encodes an integer as a 32-bit big-endian string.
 *
 * @param {int} n integer.
 * @returns {string} 32-bit big-endian string. 
 */
function intTo32BigEndianString(n) {
    var result = String.fromCharCode((n >> 24) & 0xFF);
    result += String.fromCharCode((n >> 16) & 0xFF);
    result += String.fromCharCode((n >> 8) & 0xFF);
    result += String.fromCharCode((n >> 0) & 0xFF);
    
    return result;
}

/**
 * Encodes an integer as a 16-bit big-endian string.
 *
 * @param {int} n integer.
 * @returns {string} 16-bit big-endian string. 
 */
function intTo16BigEndianString(n) {
    var result = String.fromCharCode((n >> 8) & 0xFF);
    result += String.fromCharCode((n >> 0) & 0xFF);
    
    return result;
}

module.exports = {
    intTo32BigEndianString: intTo32BigEndianString,
    intTo16BigEndianString: intTo16BigEndianString
}