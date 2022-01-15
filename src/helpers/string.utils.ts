export class StringUtils {
    /**
     * helper method to trim whitespaces from string.
     * If the input is null, returns empty string
     *
     * @static
     * @param {string} str
     * @returns {string}
     *
     * @memberOf StringUtils
     */
    static trim(str: string): string {
      if (!str) {
        return "";
      }
      return str.trim();
    }
  
    /**
     * removes non-ASCII characters from the given string and trims it
     *
     * @static
     * @param {string} str
     * @returns {string}
     *
     * @memberOf StringUtils
     */
    static sanitize(str: string): string {
      if (!str) {
        return str;
      }
      return StringUtils.trim(str.replace(/[^\x20-\x7e\x0a\x0d]/g, ""));
    }
  
    /**
     * returns true if the given string is null/undefined or empty after trim
     *
     * @static
     * @param {string} str
     * @returns {boolean}
     *
     * @memberOf StringUtils
     */
    static isEmpty(str: string): boolean {
      return typeof str === "undefined" || str === null || str.trim().length === 0;
    }
  
    static isValidEmail(email: string): boolean {
      let emailExpression: RegExp = /([0-9a-zA-Z]+[-._+&'])*[0-9a-zA-Z]+@([-0-9a-zA-Z]+[.])+[a-zA-Z]{2,6}/;
      return emailExpression.test(email);
    }
  
    static countWildCards(str: string): number {
      let matches: RegExpMatchArray = str.match(/\*/gi);
      if (matches) {
        return matches.length;
      } else {
        return 0;
      }
    }
  
    /**
     * appends given messages into one string delimited by <BR>, limits number of messages appended to optional parameter maxMessages 
     * @static
     * @param {string[]} messages 
     * @param {number} [maxMessages=0] 
     * @returns {string} 
   
     */
    static formatListOfMessages(messages: string[], maxMessages = 0, delimiter = "<BR>"): string {
      if (!messages.length) {
        return "";
      }
      let maxLoop = maxMessages > 0 && maxMessages < messages.length ? maxMessages : messages.length;
      let formattedMsg = "";
      for (let i = 0; i < maxLoop; i++) {
        if (i !== 0) {
          formattedMsg = formattedMsg + delimiter;
        }
        formattedMsg = formattedMsg + messages[i];
      }
      if (maxLoop < messages.length) {
        formattedMsg = formattedMsg + delimiter + "..and more...";
      }
      return formattedMsg;
    }

    static getParameterByName(name: string) {
      // S. Warsa - had to use javascript here to get access to URL params without routing...
      let url: string = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
      let results = regex.exec(url);
      if (results === null || results.length === 0) {
        return null;
      }
      if (results[2] === null || results[2].length === 0) {
        return '';
      }
      let decodedUri: string = decodeURIComponent(results[2].replace(/\+/g, " "));
      return decodedUri;
    }
  }
  