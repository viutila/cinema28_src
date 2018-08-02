import React from "react";
import Draggable from 'react-draggable';
import * as MainActions from "../../actions/MainActions";
import * as CommonActions from "../../actions/CommonActions";

import { lang } from '../MultiLanguage/MultiLanguage';

export default class MediaPlaylistTutorial extends React.Component {
	constructor(props) {
		super(props);
	}

    componentDidMount() {
        MainActions.setCookie("CINEMA_MPLT_SHOW",true,1000);
    }

	finishOnClick() {
        MainActions.toogleMPLTutorial();
	}

    cbOnclickFunc(v) {
        if (v){
            MainActions.delCookie('CINEMA_MPLT_SHOW');
            
        } else {
            MainActions.setCookie("CINEMA_MPLT_SHOW",true,1000);
        }
        
    }

	render() {
		return (
			<div>
				<div id="mask" style={divMask} >
					<Draggable bounds="body" cancel="#Link" cancel="#divClose">
						<div style={divQuickStart}>
							{/* Head */}
							<div style={{width: '100%',height: '35px',top: '0'}}>
								<div id="divClose" class="btnCloseBlack" onClick={this.finishOnClick.bind(this)} />
							</div>
							{/* Main */}
							<div style={{width: '100%',top: '0',padding:'0 35px'}}>
								<img draggable="false" src='img/media_playlist/media-playlist-animation.gif' />
							</div>
                            <div style={{width: '100%',marginTop: '10px',textAlign:'left',paddingLeft:'35px'}}>
                                <CheckBox checked={true} clickFunc={this.cbOnclickFunc.bind(this)} imgStyle={{position:'relative'}} />
                                <span style={{color:'#ffffff',marginLeft:'10px'}}>{lang.getLang('Msg18')}</span>
                            </div>

                            <div style={{width: '100%',marginTop: '20px',marginBottom: '24px',textAlign:'right',padding:'0 35px'}}>
                                <button className='stdButton' onClick={this.finishOnClick.bind(this)}>{lang.getLang('Close')}</button>
                            </div>
						</div>
					</Draggable>
				</div>
			</div>
		)
	}
}

class CheckBox extends React.Component {
    constructor(props) {
        super(props);
        
        switch (this.props.checked)
        {
            case true:
                this.state = {
                    checked: this.props.checked,
                    imgSrc: "img/media_playlist/checkbox_black/btn_checkbox_pressed_black.png"
                }
                break;
            case false:
                this.state = {
                    checked: this.props.checked,
                    imgSrc: "img/media_playlist/checkbox_black/btn_checkbox_black.png"
                }
                break;
        }
        
    }
    componentWillReceiveProps(nextProps) {}
    handleClick() {
        switch (this.state.checked)
        {
            case true:
                this.setState({
                    checked: false,
                    imgSrc: "img/media_playlist/checkbox_black/btn_checkbox_black.png"
                })
                break;
            case false:
                this.setState({
                    checked: true,
                    imgSrc: "img/media_playlist/checkbox_black/btn_checkbox_pressed_black.png"
                })
                break;
        }
        var flag = this.state.checked;
        if (this.props.clickFunc != null)
            this.props.clickFunc(flag);
    }
    handleMouseOver() {
        switch (this.state.checked)
        {
            case false:
                this.setState({
                    imgSrc: "img/media_playlist/checkbox_black/btn_checkbox_over_black.png"
                })
                break;
            case true:
                this.setState({
                    imgSrc: "img/media_playlist/checkbox_black/btn_checkbox_pressedover_black.png"
                })
                break;
        }
    }
    handleMouseOut() {
        switch (this.state.checked)
        {
            case false:
                this.setState({
                    imgSrc: "img/media_playlist/checkbox_black/btn_checkbox_black.png"
                })
                break;
            case true:
                this.setState({
                    imgSrc: "img/media_playlist/checkbox_black/btn_checkbox_pressed_black.png"
                })
                break;
        }
    }
    render() {
        return(
            <img src={this.state.imgSrc} onClick={this.handleClick.bind(this)} onMouseOver={this.handleMouseOver.bind(this)} onMouseOut={this.handleMouseOut.bind(this)} style={this.props.imgStyle} />
        );
    }
}

const divMask = {
	width: '100%',
	height: '100%',
	position: 'absolute',
	top: '0px',
	left: '0px',
	textAlign: 'center',
    zIndex: '2'
};

const divQuickStart = {
	position: 'relative',
    zIndex: '9014',
    opacity: '1',    
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
	top: '8%',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	display: 'inline-block',
	cursor: 'default'
}