import React from "react";
import ReactDOM from 'react-dom';
import ReactSVG from 'react-svg';
import Draggable from 'react-draggable';
import * as MainActions from "../../actions/MainActions";

export default class PortLocation extends React.Component {
	constructor(props) {
        super(props);
		this.state = {
			devName: this.props.devName,
			x: this.props.x,
			y: this.props.y,
		}
    }

	maskClicked(e) {
		if (e.target.id == 'mask') {
			this.aboutCloseClick();
		}
	}

    aboutCloseClick() {
		MainActions.tooglePortLocation();
	}

	svgCallBackFunc(svg) {
		//console.log(svg);
		$("svg:first").css({"width": "200px","height": "130px", "left": "0", "position": "relative", "opacity": "1", "zIndex":"99999"});
		switch (this.state.devName){
			case "HDMI 1":
				$("#hdmi_02").css("display","none");
				$("#hdmi_03").css("display","none");
				break;
			case "HDMI 2":
				$("#hdmi_01").css("display","none");
				$("#hdmi_03").css("display","none");
				break;
			case "HDMI 3":
				$("#hdmi_01").css("display","none");
				$("#hdmi_02").css("display","none");
				break;
			case "Audio Line Out/Speaker":
				//$("#hdmi_01").css("display","none");
				break;
		}
	}
    
    render() {
        return (
            <div>
				<div id="mask" style={divMask} onClick={this.maskClicked.bind(this) }>
					<Draggable bounds="body" cancel="#Link" cancel="#divClose">
						<div id="divPortLocation" style={{...divAbout,top:this.state.y,left:this.state.x}}>
							<div id="divPLHeader" style={{display:'inline-block',width: '100%',top: '0',paddingBottom:'12px',cursor:'move'}}>
								<span id="spanPL" style={{position: 'relative',left:'10px',top:'12px',fontSize:'13px',color: '#2f2f2f',float:'left'}}>{this.state.devName}</span>
								<div id="divClose" class="btnClose" onClick={this.aboutCloseClick.bind(this)} />
							</div>

							<ReactSVG
								path={'img/device_panel/devices.svg'}
								className={''}
								callback={ (svg) => {this.svgCallBackFunc(svg)} }
							/>

						</div>
					</Draggable>
				</div>
			</div>
        )
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

const divAbout = {
	position: 'absolute',
    zIndex: '9014',
    width: '200px',
	height: '165px',
    opacity: '1',    
	backgroundColor: '#FAFAFA',
	top: '20%',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	border: '1px solid #b0b0b0',
	display: 'inline-block',
	cursor: 'default'
}