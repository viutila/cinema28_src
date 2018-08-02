export function getCookie(v) {
    var arr = document.cookie.match(new RegExp("(^| )" + v + "=([^;]*)(;|$)"));
    if (arr != null) {
        return unescape(arr[2]);
    }
    return null;
}