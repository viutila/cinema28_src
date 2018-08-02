import EventEmitter from "events";
import dispatcher from "../dispatcher";

import * as CommonActions from "../actions/CommonActions";

class CommonStore extends EventEmitter{
	constructor(){
		super();

		this.msgStore = {
			isOpen: false,
			msgType: 'info',
			msg: 'a lot msg in here...',
			btnType: 'Both',
			yText: 'Yes',
			nText: 'No',
			yEvent: null,
			nEvent: null
		}
	}

	getMsgInfo() {
		var params = {
			isOpen: this.msgStore.isOpen,
			msgType: this.msgStore.msgType,
			msg: this.msgStore.msg,
			btnType: this.msgStore.btnType,
			yText: this.msgStore.yText,
			nText: this.msgStore.nText,
			yEvent: this.msgStore.yEvent,
			nEvent: this.msgStore.nEvent
		};
		return params;
	}
	
	toggleMsgPopup(isOpen, msgType, msg, btnType, yText, yEvent, nText, nEvent) {
		this.msgStore.isOpen = isOpen;
		if(isOpen){
			this.msgStore.msgType = (msgType == null)? 'info' : msgType;
			this.msgStore.msg = (msg == null)? 'msg...' : msg;
			this.msgStore.btnType = (btnType == null)? 'Both' : btnType;
			this.msgStore.yText = (yText == null)? 'Yes' : yText;
			this.msgStore.yEvent = (yEvent == null)? null : yEvent;
			this.msgStore.nText = (nText == null)? 'No' : nText;
			this.msgStore.nEvent = (nEvent == null)? null : nEvent;
		}else{
			this.msgStore.msgType = 'info';
			this.msgStore.msg = 'msg...';
			this.msgStore.btnType = 'Both';
			this.msgStore.yText = 'Yes';
			this.msgStore.yEvent = null;
			this.msgStore.nText = 'No';
			this.msgStore.nEvent = null;
		}
		
		this.emit('toggleMsgPopup');
	}

	toggleMsgPopupHDMI(isOpen, msgType, msg, btnType, yText, yEvent, nText, nEvent) {
		this.msgStore.isOpen = isOpen;
		if(isOpen){
			this.msgStore.msgType = (msgType == null)? 'info' : msgType;
			this.msgStore.msg = (msg == null)? 'msg...' : msg;
			this.msgStore.btnType = (btnType == null)? 'Both' : btnType;
			this.msgStore.yText = (yText == null)? 'Yes' : yText;
			this.msgStore.yEvent = (yEvent == null)? null : yEvent;
			this.msgStore.nText = (nText == null)? 'No' : nText;
			this.msgStore.nEvent = (nEvent == null)? null : nEvent;
		}else{
			this.msgStore.msgType = 'info';
			this.msgStore.msg = 'msg...';
			this.msgStore.btnType = 'Both';
			this.msgStore.yText = 'Yes';
			this.msgStore.yEvent = null;
			this.msgStore.nText = 'No';
			this.msgStore.nEvent = null;
		}
		
		this.emit('toggleMsgPopupHDMI');
	}

	toggleMsgPopupCover(isOpen, msgType, msg, btnType, yText, yEvent, nText, nEvent) {
		this.msgStore.isOpen = isOpen;
		if(isOpen){
			this.msgStore.msgType = (msgType == null)? 'info' : msgType;
			this.msgStore.msg = (msg == null)? 'msg...' : msg;
			this.msgStore.btnType = (btnType == null)? 'Both' : btnType;
			this.msgStore.yText = (yText == null)? 'Yes' : yText;
			this.msgStore.yEvent = (yEvent == null)? null : yEvent;
			this.msgStore.nText = (nText == null)? 'No' : nText;
			this.msgStore.nEvent = (nEvent == null)? null : nEvent;
		}else{
			this.msgStore.msgType = 'info';
			this.msgStore.msg = 'msg...';
			this.msgStore.btnType = 'Both';
			this.msgStore.yText = 'Yes';
			this.msgStore.yEvent = null;
			this.msgStore.nText = 'No';
			this.msgStore.nEvent = null;
		}
		
		this.emit('toggleMsgPopupCover');
	}

	handleActions(action){
		switch (action.type){
			case "TOGGLE_MSG_POPUP":
				this.toggleMsgPopup(action.isOpen, action.msgType, action.msg,
									action.btnType, action.yText, action.yEvent, action.nText, action.nEvent);
				break;
			case "TOGGLE_MSG_POPUP_HDMI":
				this.toggleMsgPopupHDMI(action.isOpen, action.msgType, action.msg,
									action.btnType, action.yText, action.yEvent, action.nText, action.nEvent);
				break;
			case "TOGGLE_MSG_POPUP_COVER":
				this.toggleMsgPopupCover(action.isOpen, action.msgType, action.msg,
									action.btnType, action.yText, action.yEvent, action.nText, action.nEvent);
				break;
		}
	}

}

const commonStore = new CommonStore;
dispatcher.register(commonStore.handleActions.bind(commonStore));
export default commonStore;