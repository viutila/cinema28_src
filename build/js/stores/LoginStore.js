const $ = require('jquery');
import EventEmitter from "events";
import dispatcher from "../dispatcher";

import * as MainActions from "../actions/MainActions";

class LoginStore extends EventEmitter {
    constructor(){
        super();
        this.state={
            isAuthPass : true,
            isShowPasswordEye : false,
            validateAuthPass : false,
            loginUserName : '',
            showLoginLoadingBar : true,
            isShowLogout : false,
            isShowDropdownMenu : false,
            userIconPath : 'img/frameset/slice/frameset_admin_normal.svg',
        }
        this.doCheckIsShowLogout();
        this.doValidateUserSid();
    }

    setIsShowEye(){
        this.state.isShowPasswordEye = !this.state.isShowPasswordEye;
        this.emit('togglePasswordEye');
    }

    setUserName(v,userName){
        this.state.validateAuthPass = v;
        this.state.loginUserName = userName;
        this.emit('validateAuthPass');
    }

    setShowLoginLoadingBar(b){
        this.state.showLoginLoadingBar = b;
        this.emit('showLoginLoadingBar');
    }

    setIsShowLogout(b){
        this.state.isShowLogout = b;
        this.emit('isShowLogout');
    }

    setIsShowDropdownMenu(b){
        this.state.isShowDropdownMenu = b;
        this.emit('isShowDropdownMenu');
    }

    setIconPath(v){
        this.state.userIconPath = v;
        this.emit('getUserIconPath');
    }

    setIsAuthPass(b){
        this.state.isAuthPass = b;
        this.emit('isAuthPass');
    }

    getUserIconPath(){
        return this.state.userIconPath;
    }

    getIsShowLogout(){
        return this.state.isShowLogout;
    }

    getIsShowEye(){
        return this.state.isShowPasswordEye;
    }

    getValidateAuthPass(){
        return this.state.validateAuthPass;
    }

    getUserName(){
        return this.state.loginUserName;
    }

    getShowLoginLoadingBar(){
        return this.state.showLoginLoadingBar;
    }

    getIsShowDropdownMenu(){
        return this.state.isShowDropdownMenu;
    }

    getIsAuthPass(){
        return this.state.isAuthPass;
    }

    setIsAuthPass2(b){
        this.state.isAuthPass = b;
        //this.emit('isAuthPass');
    }

    setValidateAuthPass(b) {
        this.state.validateAuthPass = b;
    }

    sidNullReload() {
        this.setIsAuthPass2(true);
        this.setValidateAuthPass(false);
        this.state.showLoginLoadingBar = false;
        this.emit("sidNullReload");
    }

    handleActions(action){
        switch(action.type){
            case "TOGGLE_PASSWORDEYE" : {
                this.setIsShowEye();
                break;
            }
            case "VALIDATE_USERSID" : {
                this.doValidateUserSid();
                break;
            }
            case "DO_LOGIN" : {
                this.doLogin(action.value);
                break;
            }
            case "TOGGLE_DROPDOWNMENU" : {
                this.setIsShowDropdownMenu(action.value);
                break;
            }
            case "GET_USER_ICONPATH" : {
                this.doGetUserIconPath();
                break;
            }
            case "DO_LOGOUT" : {
                this.doLogout();
                break;
            }
            case "SID_NULL_RELOAD": {
                this.sidNullReload();
                break;
            }
        }
    }

    doLogin(data){
        const apiUrl = MainActions.getCgiOrigin() + '/cgi-bin/authLogin.cgi?user='+data.userName+'&pwd='+data.password+'&remme='+data.remmeChecked+'&secure='+data.secureChecked;
        let isRemmCheck = data.remmeChecked == "1" ? true : false;
        if (isRemmCheck) {
            MainActions.setCookie("CINEMA28_REMM",1,1000);
            MainActions.setCookie("CINEMA28_USERNAME",data.userName,1000);
            MainActions.setCookie("CINEMA28_PASSWORD",data.password,1000);
        } else {
            MainActions.delCookie('CINEMA28_REMM');
            MainActions.delCookie('CINEMA28_USERNAME');
            MainActions.delCookie('CINEMA28_PASSWORD');
        }
        this.serverRequest = $.get(apiUrl, function (result) {

            let isAuthPass = ($(result).find('authPassed').text() == '1' ? true:false);
            let userName = $(result).find('username').text();

            if(isAuthPass){

                if(window.parent == window){
                    MainActions.setCookie("CINEMA_SID",$(result).find('authSid').text(),1000);
                    this.setIsShowLogout(true);
                } else if (MainActions.getCookie('CINEMA_SID') === null) {
                    MainActions.setCookie("CINEMA_SID",$(result).find('authSid').text(),1000);
                }
                
                setTimeout(()=>{
                    this.setUserName(isAuthPass,userName);
                },1000);
                
            }
            this.setIsAuthPass(isAuthPass);
            this.setShowLoginLoadingBar(isAuthPass);

        }.bind(this));
    }

    doValidateUserSid(){
        let sid,userName;

        if(MainActions.getCookie('NAS_SID')){
            sid = MainActions.getCookie('NAS_SID');
        /*} else if (sessionStorage.getItem('NAS_SID')) {
            sid = sessionStorage.getItem('NAS_SID');*/
        } else {
            if (MainActions.getCookie('CINEMA_SID')){
                sid = MainActions.getCookie('CINEMA_SID');
            }
        }

        const apiUrl = MainActions.getCgiOrigin() + '/cgi-bin/authLogin.cgi?sid='+sid;
        this.serverRequest = $.get(apiUrl, function (result) {

            const isAuthPass = ($(result).find('authPassed').text() == '1' ? true:false);
            userName = $(result).find('username').text();
            this.setShowLoginLoadingBar(isAuthPass);
            this.setUserName(isAuthPass,userName);

        }.bind(this));
    }

    doGetUserIconPath(){
        let sid;
        if(MainActions.getCookie('NAS_SID')){
            sid = MainActions.getCookie('NAS_SID');
        /*} else if (sessionStorage.getItem('NAS_SID')) {
            sid = sessionStorage.getItem('NAS_SID');*/
        }else {
            sid = MainActions.getCookie('CINEMA_SID');
        }
        if(sid){
            const apiUrl = MainActions.getCgiOrigin() + '/cgi-bin/userConfig.cgi?func=outputBgImgTh&imgbgName=portrait.jpg&sid='+sid;
            const iconPath = '/cgi-bin/userConfig.cgi?func=outputBgImgTh&imgbgName=portrait.jpg&sid='+sid;
            this.serverRequest = $.get(apiUrl, function (result) {

                if(result){
                    this.setIconPath(iconPath);
                }

            }.bind(this));
        }
        
    }

    doCheckIsShowLogout(){
        let isShowLogout = false;
        if(MainActions.getCookie("NAS_SID") == null){
            if(MainActions.getCookie("CINEMA_SID") != null && MainActions.getCookie("CINEMA_SID") != ''){
                isShowLogout = true;
                this.setIsShowLogout(true);
            }
        }
    }

    doLogout(){
        if(window.parent == window){
            MainActions.delCookie('CINEMA_SID');
            location.reload();
        }
    }

    ezEncode(str){
        const ezEncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let out, i, len;
        let c1, c2, c3;
        str = this.utf16to8(str);
        len = str.length;
        i = 0;
        out = "";
        while(i < len)
            {
                c1 = str.charCodeAt(i++) & 0xff;
                if(i == len)
                {
                    out += ezEncodeChars.charAt(c1 >> 2);
                out += ezEncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
                }
                c2 = str.charCodeAt(i++);
                if(i == len)
                {
                out += ezEncodeChars.charAt(c1 >> 2);
                out += ezEncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += ezEncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
                }
                c3 = str.charCodeAt(i++);
                out += ezEncodeChars.charAt(c1 >> 2);
                out += ezEncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += ezEncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                out += ezEncodeChars.charAt(c3 & 0x3F);
            }
        return out;
    }

    ezDecode(str){
        var c1, c2, c3, c4;
        var i, len, out;

        const ezDecodeChars = new Array(
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
            52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
            -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
            15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
            -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
        

        str = this.utf8to16(str);
        len = str.length;
        i = 0;
        out = "";
        while(i < len) {
                /* c1 */
                do {
                    c1 = ezDecodeChars[str.charCodeAt(i++) & 0xff];
                } while(i < len && c1 == -1);
                if(c1 == -1)
                break;
            
                /* c2 */
                do {
                c2 = ezDecodeChars[str.charCodeAt(i++) & 0xff];
                } while(i < len && c2 == -1);
                if(c2 == -1)
                break;
            
                out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
            
                /* c3 */
                do {
                c3 = str.charCodeAt(i++) & 0xff;
                if(c3 == 61)
                        return out;
                c3 = ezDecodeChars[c3];
                } while(i < len && c3 == -1);
                if(c3 == -1)
                break;
            
                out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
            
                /* c4 */
                do {
                c4 = str.charCodeAt(i++) & 0xff;
                if(c4 == 61)
                        return out;
                c4 = ezDecodeChars[c4];
                } while(i < len && c4 == -1);
                if(c4 == -1)
                break;
                out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    }

    utf16to8(str){
        let out, i, len, c;
        out = "";
        len = str.length;
        for (i=0; i<len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } 
            else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >>6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >>0) & 0x3F));

            }
            else {
                out += String.fromCharCode(0xC0 | ((c >>6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >>0) & 0x3F));
            }
        }
        return out;
    }

    utf8to16(str) {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = str.length;
        i = 0;
        while(i < len) {
            c = str.charCodeAt(i++);
            switch(c >> 4)
            {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
                out += str.charAt(i-1);
                break;
            case 12: case 13:
            // 110x xxxx 10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
            // 1110 xxxx10xx xxxx10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                ((char2 & 0x3F) << 6) |
                ((char3 & 0x3F) << 0));
            }
        }
        return out;
    }

    createEncode(v){
        return this.ezEncode(v);
    }

}

const loginStore = new LoginStore;
dispatcher.register(loginStore.handleActions.bind(loginStore));
//window.dispatcher = dispatcher;
export default loginStore;