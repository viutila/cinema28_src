import React from "react";
import Modal from "react-modal";
import $ from 'jquery';

import CommonStore from "js/stores/CommonStore";
import * as CommonActions from "js/actions/CommonActions";
import 'css/popup.css';
import { lang } from '../MultiLanguage/MultiLanguage';

export default class MsgPopupCover extends React.Component{
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

            pcRadio: 'cover',
	    }
	}

	componentWillMount() {
		CommonStore.on("toggleMsgPopupCover",this.toggleMsgPopup);
	}

	componentWillUnmount() {
		CommonStore.removeListener("toggleMsgPopupCover",this.toggleMsgPopup);
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
			CommonActions.toggleMsgPopupCover(false);
		}
	}

	doNoEvent() {
		if(this.state.nEvent != null){
			this.state.nEvent();
		}else{
			CommonActions.toggleMsgPopupCover(false);
		}
    }

	closePopup() {
		CommonActions.toggleMsgPopupCover(false);
    }

    doChooseEvent() {

        switch (this.state.pcRadio) {
            case "cover":
                if(this.state.yEvent != null){
                    this.state.yEvent();
                }
                break;
            case "add":
                if(this.state.nEvent != null){
                    this.state.nEvent();
                }
                break;
        }
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
				return (<div className="footer">
                            <button className="yesBtnStyle" onClick={this.doChooseEvent.bind(this)}>{yBtnText}</button>
                        </div>);
			case "N" :
				return (<div className="footer">
                            <button className="noBtnStyle" onClick={this.doNoEvent}>{nBtnText}</button>
                        </div>);
    	}
    }

    radioClickFunc(v) {
        this.setState({
            pcRadio: v
        })
    }

	render() {
		return(
			<div>
				<Modal isOpen={this.state.isOpen} overlayClassName="OverlayForMsgPopup" className="msgPopup msgPopupHDMI" contentLabel="Modal">
					<div>
						<button className="msgCloseIcon i_msgClose" onClick={this.closePopup.bind(this)}></button>
						<div className="content">
							<div className={"msgBox i_"+this.state.msgType}>{this.state.msg}</div>

                            <p onClick={this.radioClickFunc.bind(this,'cover')} style={{marginLeft:'48px'}}>
                                <RadioButton name="cover" 
                                    clickFunc={this.radioClickFunc.bind(this)} 
                                    currentName={this.state.pcRadio} 
                                    key={Math.random()}/>
                                &nbsp;
                                {lang.getLang('Overwrite')}
                            </p>
                            
                            <p onClick={this.radioClickFunc.bind(this,'add')} style={{marginLeft:'48px'}}>
                                <RadioButton name="add" 
                                    clickFunc={this.radioClickFunc.bind(this)} 
                                    currentName={this.state.pcRadio} 
                                    key={Math.random()}/>
                                &nbsp;
                                {lang.getLang('Append to the end')}
                            </p>

						</div>
						{this.renderBtnPanel()}
					</div>
				</Modal>
			</div>
		)
	}
}

class RadioButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imgSrc: this.props.name == this.props.currentName ? "img/btn_radio/btn_radio_pressed.png" : "img/btn_radio/btn_radio.png"
        }
        
    }
    handleClick() {

        this.props.clickFunc(this.props.name);
    }
    handleMouseOver() {
        switch (this.state.imgSrc)
        {
            case "img/btn_radio/btn_radio.png":
                this.setState({
                    imgSrc: "img/btn_radio/btn_radio_over.png"
                })
                break;
            case "img/btn_radio/btn_radio_pressed.png":
                this.setState({
                    imgSrc: "img/btn_radio/btn_radio_pressedover.png"
                })
                break;
        }
    }
    handleMouseOut() {
        switch (this.state.imgSrc)
        {
            case "img/btn_radio/btn_radio.png":
            case "img/btn_radio/btn_radio_over.png":
                this.setState({
                    imgSrc: "img/btn_radio/btn_radio.png"
                })
                break;
            case "img/btn_radio/btn_radio_pressed.png":
            case "img/btn_radio/btn_radio_pressedover.png":
                this.setState({
                    imgSrc: "img/btn_radio/btn_radio_pressed.png"
                })
                break;
        }
    }
    render() {
        return(
            <img
                style={{marginTop:'-2px',width:'12px',height:'12px'}}
                src={this.state.imgSrc}
                onClick={this.handleClick.bind(this)}
                onMouseOver={this.handleMouseOver.bind(this)}
                onMouseOut={this.handleMouseOut.bind(this)}
            />
        );
    }
}