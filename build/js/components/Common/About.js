import React from "react";
import Draggable from 'react-draggable';
import MainStore from 'js/stores/MainStore';
import * as MainActions from "js/actions/MainActions";
import { lang } from 'js/components/MultiLanguage/MultiLanguage';

export default class About extends React.Component {

	constructor(props) {
    	super(props);
    	this.getBuildVersionDone = this.getBuildVersionDone.bind(this);

		this.state = {
			buildVersion: {
				app_ver: '',
				build_date: '',
			}
		}
	}

	componentWillMount() {
        MainStore.on('getBuildVersionDone', this.getBuildVersionDone);
		MainActions.getBuildVersion();
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        MainStore.removeListener('getBuildVersionDone', this.getBuildVersionDone);
    }

	getBuildVersionDone() {
		this.setState({
			buildVersion: MainStore.getBuildVersion()
		})
	}

    aboutCloseClick() {
		MainActions.hideAbout();
	}
    
    render() {
		return this.state.buildVersion ?
		(
            <div>
				<div id="mask" style={divMask} >
				<Draggable bounds="body" cancel="#Link" cancel="#divClose">
					<div style={divAbout}>
						<div style={{width: '100%',height: '40px',top: '0',borderBottom: '1px solid #b0b0b0',cursor:'move'}}>
							<img src='img/about/ic_info.png' style={{position: 'relative',left:'18px',top:'10px',float:'left'}} />
							<span style={{position: 'relative',left:'24px',top:'8px',fontSize:'18px',color: '#000000',float:'left'}}>{lang.getLang('About')}</span>
							<div id="divClose" class="btnClose" onClick={this.aboutCloseClick.bind(this)} />
						</div>
						<div>
							<div style={{position: 'relative',margin:'0px auto',width: '68px', height: '68px',top:'30px',verticalAlign: 'middle', backgroundImage: 'url("img/about/Cinema28_68.png")'}}></div>
							<div style={{position: 'relative',margin:'0px auto',top:'64px',fontSize:'24px',fontWeight:'bold',color:'#194dac',textAlign:'center',paddingBottom:'14px',width:'180px',borderBottom:'1px solid #b1b1b1'}}>
								Cinema28
							</div>
							<div style={{position: 'relative',margin:'0px auto',fontSize:'12px',color:'#262626',fontWeight:'normal',textAlign:'center',top:'78px'}}>
								Version {this.state.buildVersion.app_ver} ({this.state.buildVersion.build_date})
							</div>
							<div style={{position: 'absolute',width:'100%',margin:'0px auto',fontSize:'12px',color:'#262626',fontWeight:'normal',textAlign:'left',bottom:'24px',paddingLeft:'18px'}}>
								<div style={{float:'left',position:'absolute',bottom:'0'}}>
									<img src='img/about/ic_qnap.png' />
									<a id="Link" href="http://www.qnap.com/" target="_blank">
										<span className='linkSpan' style={{marginLeft:'6px'}}>www.qnap.com</span>
									</a>
									<span style={{display:'block',marginTop:'6px',fontSize:'10px',color:'#262626'}}>Copyright ©2016 QNAP Systems, Inc. All Rights Reserved.</span>
								</div>
								<div style={{float:'left',position:'absolute',bottom:'14px',right:'18px'}}>
									<img src='img/about/ic_qts_smallicon.png' />
								</div>
							</div>
						</div>
					</div>
				</Draggable>
				</div>
			</div>
        ) : null;
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
	display: 'flex',
    alignItems: 'center',
	justifyContent: 'center',
	msFlexAlign: 'center',
	msFlexPack: 'center',
	zIndex: '2'
};

const divAbout = {
	position: 'relative',
    zIndex: '9014',
    width: '360px',
	height: '414px',
    opacity: '1',    
	backgroundColor: '#FAFAFA',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	border: '1px solid #b0b0b0',
	display: 'inline-block',
	cursor: 'default'
}