import dispatcher from "../dispatcher";

export function getIsShowEye(){
	dispatcher.dispatch({
        type: "TOGGLE_PASSWORDEYE",
    });
}

export function validateUserSid(){
	dispatcher.dispatch({
		type: "VALIDATE_USERSID"
	});
}

export function doLogin(v){
	dispatcher.dispatch({
		type: "DO_LOGIN",
		value: v
	})
}

export function toggleDropdownMenu(b){
	dispatcher.dispatch({
		type: "TOGGLE_DROPDOWNMENU",
		value: b
	})
}

export function getUserIconPath(){
	dispatcher.dispatch({
		type: "GET_USER_ICONPATH"
	})
}

export function doLogout(){
	dispatcher.dispatch({
		type: "DO_LOGOUT"
	})
}

