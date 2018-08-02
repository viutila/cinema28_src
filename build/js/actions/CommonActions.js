import dispatcher from "../dispatcher";

/*
	Message popup

	@ params:
	isOpen: true, false - toggle popup
	msgType: 'info', 'warning', 'help', 'error', 'charging', 'ok', 'remind' - for popup icon, default: 'info'
	msg: 'a lot msg in here...'
	btnType: 'Both' - show yes & no button , default 'Both'
		     'Y' - only yes button
		     'N' - only no button
	yText: 'Yes' - button name , default: 'Yes'
	nText: 'No' - button name , default: 'No'
	yEvent: call function event,
	nEvent: call function event

	@ example:
	CommonActions.toggleMsgPopup(
		true, 
		'warning',
        'You are about to delete selected Thing Type/s. Once deleted, these could not be recovered. Are you sure. you want to continue?',
        'Both', 
        'Yes', 
        'Cancel',
        function(){ CommonActions.toggleMsgPopup(false); }
        function(){ ThingTypeActions.createThingTypes(); }
    );
 */

export function toggleMsgPopup(b, msgType, msg, btnType, yText, nText, yEvent, nEvent){
	dispatcher.dispatch({
		type: "TOGGLE_MSG_POPUP",
		isOpen: b,
		msgType: msgType,
		msg: msg,
		btnType: btnType,
		yText: yText,
		yEvent: yEvent,
		nText: nText,
		nEvent: nEvent
	});
}

export function toggleMsgPopupHDMI(b, msgType, msg, btnType, yText, nText, yEvent, nEvent){
	dispatcher.dispatch({
		type: "TOGGLE_MSG_POPUP_HDMI",
		isOpen: b,
		msgType: msgType,
		msg: msg,
		btnType: btnType,
		yText: yText,
		yEvent: yEvent,
		nText: nText,
		nEvent: nEvent
	});
}

export function toggleMsgPopupCover(b, msgType, msg, btnType, yText, nText, yEvent, nEvent){
	dispatcher.dispatch({
		type: "TOGGLE_MSG_POPUP_COVER",
		isOpen: b,
		msgType: msgType,
		msg: msg,
		btnType: btnType,
		yText: yText,
		yEvent: yEvent,
		nText: nText,
		nEvent: nEvent
	});
}

