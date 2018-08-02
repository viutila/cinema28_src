import React from "react";
import Modal from "react-modal";
import $ from 'jquery';

import CommonStore from "js/stores/CommonStore";
import * as CommonActions from "js/actions/CommonActions";
import 'css/popup.css';

export default class MsgPopup extends React.Component{
	constructor() {
	    super();
	    this.toggleMsgPopup = this.toggleMsgPopup.bind(this);
	    this.closePopup = this.closePopup.bind(this);
	    this.doYesEvent = this.doYesEvent.bind(this);
	    this.doNoEvent = this.doNoEvent.bind(this);

	    this.state = {
	        isOpen: CommonStore.getMsgInfo().isOpen,
	        msgType: CommonStore.getMsgInfo().msgType,
	        btnType: CommonStore.getMsgInfo().btnType,
	        yBtnText: CommonStore.getMsgInfo().yText,
	        yEvent: CommonStore.getMsgInfo().yEvent,
	        nBtnText: CommonStore.getMsgInfo().nText,
	        nEvent: CommonStore.getMsgInfo().nEvent,
	        msg: CommonStore.getMsgInfo().msg,
	    }
	}

	componentWillMount() {
		CommonStore.on("toggleMsgPopup",this.toggleMsgPopup);
	}

	componentWillUnmount() {
		CommonStore.removeListener("toggleMsgPopup",this.toggleMsgPopup);
	}

	toggleMsgPopup() {

		var data = CommonStore.getMsgInfo();
		this.setState({
			isOpen: CommonStore.getMsgInfo().isOpen,
	        msgType: CommonStore.getMsgInfo().msgType,
	        btnType: CommonStore.getMsgInfo().btnType,
	        yBtnText: CommonStore.getMsgInfo().yText,
	        yEvent: CommonStore.getMsgInfo().yEvent,
	        nBtnText: CommonStore.getMsgInfo().nText,
	        nEvent: CommonStore.getMsgInfo().nEvent,
	        msg: CommonStore.getMsgInfo().msg
		});
		
	}

	doYesEvent() {
		if(this.state.yEvent != null){
			this.state.yEvent();
		}else{
			CommonActions.toggleMsgPopup(false);
		}
	}

	doNoEvent() {
		if(this.state.nEvent != null){
			this.state.nEvent();
		}else{
			CommonActions.toggleMsgPopup(false);
		}
    }

	closePopup() {
		if(this.state.nEvent != null){
			this.state.nEvent();
		}
		CommonActions.toggleMsgPopup(false);
    }

    renderBtnPanel() {
    	var btnType = this.state.btnType;
    	var yBtnText = (this.state.yBtnText == '') ? 'Yes' : this.state.yBtnText;
    	var nBtnText = (this.state.nBtnText == '') ? 'No' : this.state.nBtnText;

    	switch(btnType) {
    		case "Both":
    			return (<div className='footer'>
							<button className='yesBtnStyle' onClick={this.doYesEvent}>{yBtnText}</button>
							<button className='noBtnStyle' onClick={this.doNoEvent}>{nBtnText}</button>
						</div>);
			case "Y" :
				return (<div className="footer"><button className="yesBtnStyle" onClick={this.doYesEvent}>{yBtnText}</button></div>);
			case "N" :
				return (<div className="footer"><button className="noBtnStyle" onClick={this.doNoEvent}>{nBtnText}</button></div>);
    	}
    }

	render() {
		return(
			<div>
				<Modal isOpen={this.state.isOpen} overlayClassName="OverlayForMsgPopup" className="msgPopup" contentLabel="Modal">
					<div>
						<button className="msgCloseIcon i_msgClose" onClick={this.closePopup.bind(this)}></button>
						<div className="content">
							<div className={"msgBox i_"+this.state.msgType}>{this.state.msg}</div>
						</div>
						{this.renderBtnPanel()}
					</div>
				</Modal>
			</div>
		)
	}
}