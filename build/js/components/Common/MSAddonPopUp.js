import React from "react";
import Draggable from 'react-draggable';
import * as MainActions from "../../actions/MainActions";
import * as CommonActions from "../../actions/CommonActions";
import { lang } from '../MultiLanguage/MultiLanguage';

export default class MSAddonPopUp extends React.Component {
	constructor(props) {
		super(props);
	}

	openStationInner() {
		window.qMessageClient.fn.openApp({
			appId:'qpkg',
			config:{
				config:{
					install : 'QDMS',
					all : true,
					runMore:true
				}
			}
		});
    }

	renderText() {
		var isInWindow = (window.parent == window) ? true : false;
		var str = lang.getLang('Msg31');
		var res = str.split("App Center");

		var link = isInWindow 
			? "App Center" 
			: (<a style={{cursor:'pointer'}} onClick={this.openStationInner.bind(this)}>App Center</a>);

		var rst = (<p style={{paddingTop:'15px'}}>
						{res[0]}{link}{res[1]}
					</p>);

		return rst;
	}

	render() {

		return (
			<div id="mask" style={divMask} >
				<div style={divQuickStart}>
					{/* Head */}
					<div style={{width: '100%',textAlign:'left'}}>
						<span style={{position: 'relative',fontSize:'14px',color: '#2f2f2f',fontWeight:'bold'}}>
							{ lang.getLang('Msg30') }
						</span>
					</div>

					{/* Head2 Sub Text */}
					<div style={{width: '100%',textAlign:'left',marginTop:'15px',fontSize:'14px',color:'#2f2f2f'}}>
						<img src='img/multimedia_extension_pack.png' style={{float:'left',margin:'0 15px 0 8px'}} />
						{ this.renderText() }
					</div>

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
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	textAlign: 'center',
	zIndex: '10000001',
	display: 'flex',
    alignItems: 'center',
	justifyContent: 'center',
	msFlexAlign: 'center',
	msFlexPack: 'center',
};

const divQuickStart = {
    zIndex: '9014',
    width: '550px',
    opacity: '1',    
	backgroundColor: '#FAFAFA',
	top: '8%',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	border: '1px solid #b0b0b0',
	display: 'inline-block',
	cursor: 'default',
	padding:'24px'
}