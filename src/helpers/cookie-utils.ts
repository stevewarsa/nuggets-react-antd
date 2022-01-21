export class CookieUtils {
    public static getCookie(cookieName: string): string {
        let name = cookieName + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }

    public static setCookie(cname: string, cvalue: string, exdays: number) {
        let d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    /**
     * Delete a Cookie
     * @param key name of the cookie
     */
    public static deleteCookie(key: string) {
        // Delete a cookie by setting the date of expiry to yesterday
        let date = new Date();
        date.setDate(date.getDate() - 1);
        document.cookie = escape(key) + '=;expires=' + date;
    }

}