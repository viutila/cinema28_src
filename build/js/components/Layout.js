import React from "react";
import Frameset from "./Frameset";
import Toolbar from './RightPanel/Toolbar';
import MainPanel from "./MainPanel";
import LoginPage from "./LoginPage";

import MainStore from "../stores/MainStore";
import LoginStore from "../stores/LoginStore";

import * as MainActions from "../actions/MainActions";
import * as LoginAction from "../actions/LoginAction";

import Draggable from 'react-draggable';

import NoDeviceDetect from './Common/NoDeviceDetect';
import QuickStart from './Common/QuickStart';
import School from './Common/School';
import About from './Common/About';
import DeviceInfoPopUp from './Common/DeviceInfoPopUp';
import PortLocation from './Common/PortLocation';
import MediaPlaylistTutorial from './Common/MediaPlaylistTutorial';

import CommonStore from "../stores/CommonStore";
import MsgPopup from "./Common/MsgPopup";
import MsgPopupHDMI from "./Common/MsgPopupHDMI";
import MsgPopupCover from "./Common/MsgPopupCover";

import MSAddonPopUp from './Common/MSAddonPopUp';
import Help from './Common/Help';
import DeviceWizard from './RightPanel/DeviceWizard/DeviceWizard.js';
import Cinema28Disable from './Common/Cinema28Disable';

import { lang } from './MultiLanguage/MultiLanguage';
import BrowsePathPanel from './RightPanel/MediaList/BrowsePathPanel';
import ReactTooltip from 'react-tooltip';

export default class Layout extends React.Component {

	constructor() {
        super();
        this.state = {
            //showPlaylist: PlaylistStore.isShown(),
			
			validateAuthPass : LoginStore.getValidateAuthPass(),
			toogleMsgPopUp: false,
			deviceInfoPopUp: false,
			deviceInfoData: null,

			tooglePLPopUp: false,
			portLocationObj: null,
			key: Math.random(),

			showAbout: false,
			showQuickStart: false,
			showSchool: false,
			showMediaPlaylistTutorial: false,
			showLoadingMask: false,
			showMSAddOn: false,
			showDeviceWizard: false,
			showC28Disable: false,

			toogleMsgPopUpHDMI: false,
			toogleMsgPopUpCover: false,

			

			language: null,

			noDeviceDetect: false,
			showHelp: false,

			ifBrowsePathPanel: false,

			divLoadingStyle: divLoading,

			keyBBP: Math.random()
        };

		this.toogleLoadingMask = this.toogleLoadingMask.bind(this);

		this.getCheckDepDone = this.getCheckDepDone.bind(this);

		this.changeLangDone = this.changeLangDone.bind(this);

		this.getUserDataDone = this.getUserDataDone.bind(this);

		this.detectDevices = this.detectDevices.bind(this);
		
		this.refreshBPP = this.refreshBPP.bind(this);
    }

	layoutClicked(e) {
		if (e.target.id !== 'btnSelectFilter' && e.target.parentElement.id !== 'btnSelectFilter') {
			MainActions.hideFilter();
			//console.log('Yes.');
		} else {
			//console.log('No.');
		}

		if (e.target.id !== 'logoutMenu' && e.target.id !== 'logoutMenuUserName' && e.target.id !== 'logoutMenuImg') {
			LoginAction.toggleDropdownMenu(false);
		}

		if (e.target.id !== 'modeSelector') {
			MainActions.hideMode();
		} else {
		}
	}

	getValidateAuthPass(){
		return this.state.validateAuthPass;
	}

	ifHelp() {
		return this.state.showHelp ? (
			<Help />
		) : null;
	}

	ifNoDeviceDetect() {
		return this.state.noDeviceDetect ? (
			<NoDeviceDetect />
		) : null;
	}

	ifAbout() {
		return this.state.showAbout ? (
			<About />
		) : null;
	}

	ifQuickStart() {
		return this.state.showQuickStart ? (
			<QuickStart />
		) : null;
	}

	ifSchool() {
		return this.state.showSchool ? (
			<School />
		) : null;
	}

	ifshowMSAddOn() {
		return this.state.showMSAddOn ? (
			<MSAddonPopUp />
		) : null;
	}

	ifPortLocation() {
		return this.state.tooglePLPopUp ? (
			<PortLocation devName={this.state.portLocationObj.name} x={this.state.portLocationObj.x} y={this.state.portLocationObj.y} />
		) : null;
	}

	ifMsgPopUp() {
		return this.state.toogleMsgPopUp ? (
			<MsgPopup />
		) : null;
	}

	ifHDMIMsgPopUp() {
		return this.state.toogleMsgPopUpHDMI ? (
			<MsgPopupHDMI />
		) : null;
	}

	ifCoverMsgPopUp() {
		return this.state.toogleMsgPopUpCover ? (
			<MsgPopupCover />
		) : null;
	}

	ifDeviceInfo() {
		return this.state.deviceInfoPopUp ? (
			<DeviceInfoPopUp data={this.state.deviceInfoData} iconIndex={MainStore.getDeviceIcon(this.state.deviceInfoData.id)}/>
		) : null;
	}

	ifMediaPlaylistTutorial() {
		return this.state.showMediaPlaylistTutorial ? (
			<MediaPlaylistTutorial />
		) : null;
	}

	ifLoadingMask() {
		return this.state.showLoadingMask ? (
			<div style={divMask} >
				<div style={this.state.divLoadingStyle}>
					<img src='img/loading Q_21.gif' />
					<span style={{paddingLeft: '16px'}}>{lang.getLang('Loading')}...</span>
				</div>
			</div>
		) : null;
	}

	ifBrowsePathPanel() {
		return (
			<BrowsePathPanel isOpen={ this.state.ifBrowsePathPanel } key={this.state.keyBBP} />
		)
	}

	ifDeviceWizard() {
		return this.state.showDeviceWizard ? (
			<DeviceWizard />
		) : null;
	}

	ifCinema28Disable() {
		return this.state.showC28Disable ? (
			<Cinema28Disable />
		) : null;
	}

	toogleLoadingMask() {
		if (!MainStore.getShowLoadingMask())
		{
			this.setState({
				divLoadingStyle: divLoadingClose
			});

			setTimeout(()=>{
				this.setState({
					showLoadingMask: MainStore.getShowLoadingMask(),
					//divLoadingStyle: divLoading
				})
			},400)
		}
		else
		{
			this.setState({
				showLoadingMask: MainStore.getShowLoadingMask(),
				divLoadingStyle: divLoading
			})
		}

		
	}

	getCheckDepDone() {
		var obj = MainStore.getCheckDep();
		var itemsAry = obj.items;
		var qdmsItem;
		itemsAry.forEach(function(item,i){
			if (item.name == "QDMS"){
				qdmsItem = item;
			}
		})
		//console.log(qdmsItem);
		if ( +qdmsItem.enabled == 0 || +qdmsItem.installed == 0 ){
			this.setState({
				showMSAddOn: true
			})
		}
	}

	changeLangDone() {
		this.setState({
            key: Math.random(),
        });
		//console.log("changeLangDone");
	}

	getUserDataDone() {
		this.setState({
			showQuickStart: MainStore.getShowQuickStart()
		});
	}

	detectDevices(devNum) {
		if (devNum == 0) {
			this.setState({
				noDeviceDetect: true
			})
		} else {
			if (this.state.noDeviceDetect === true) {
				this.setState({
					noDeviceDetect: false
				})
			}
		}
	}

	componentWillMount() {
		MainStore.setMaxListeners(30);
		LoginStore.on("validateAuthPass", () => {
			
			setTimeout(()=>{ MainActions.getCheckDep(); });
			this.setState({
				validateAuthPass : LoginStore.getValidateAuthPass()
			})
		});

		LoginStore.on("sidNullReload", () => {
			this.setState({
				validateAuthPass : LoginStore.getValidateAuthPass()
			})
		});

		MainStore.on("toogleAbout", () => {
			this.setState({
                showAbout: !this.state.showAbout
            });
		});

		MainStore.on("showBrowsePathPanel", ()=>{
			this.setState({
				ifBrowsePathPanel: !this.state.ifBrowsePathPanel
			})
		})

		MainStore.on("toggleHelp", () => {
			this.setState({
                showHelp: !this.state.showHelp
            });
		});

		MainStore.on("toogleQuickStart", () => {
			this.setState({
                showQuickStart: !this.state.showQuickStart
            });
		});

		MainStore.on("toggleDeviceWizardDone", () => {
			this.setState({
                showDeviceWizard: MainStore.getShowDeviceWizard()
            });
		});

		MainStore.on("cinema28Disable", ()=>{
			this.setState({
				showC28Disable: MainStore.getShowCinema28Disable()
			})
		})

		MainStore.on("toogleSchool", ()=> {
			this.setState({
				showSchool: !this.state.showSchool
			})
		})

		MainStore.on("toogleMPLTutorial", () => {
			this.setState({
                showMediaPlaylistTutorial: !this.state.showMediaPlaylistTutorial
            });
		});

		MainStore.on("toogleDeviceInfo", () => {
			this.setState({
				deviceInfoData: MainStore.getDevInfo(),
                deviceInfoPopUp: !this.state.deviceInfoPopUp
            });
		});

		MainStore.on("tooglePortLocation", () => {
			this.setState({
				deviceInfoData: MainStore.getDevInfo(),
				tooglePLPopUp: !this.state.tooglePLPopUp,
				portLocationObj: MainStore.getPLDevName(),
            });
		});

		CommonStore.on("toggleMsgPopup", () => {
            this.setState({
                toogleMsgPopUp : !this.state.toogleMsgPopUp
            })
        });

		CommonStore.on("toggleMsgPopupHDMI", () => {
            this.setState({
                toogleMsgPopUpHDMI : !this.state.toogleMsgPopUpHDMI
            })
        });

		CommonStore.on("toggleMsgPopupCover", () => {
            this.setState({
                toogleMsgPopUpCover : !this.state.toogleMsgPopUpCover
            })
        });

		MainStore.on("toogleLoadingMask", this.toogleLoadingMask);
		MainStore.on("getCheckDepDone", this.getCheckDepDone);
		MainStore.on("changeLangDone", this.changeLangDone);
		MainStore.on("getUserDataDone", this.getUserDataDone);
		MainStore.on("detectDevices", this.detectDevices);
		MainStore.on("refreshBPP", this.refreshBPP);

		MainActions.getPortLocationSvg();
    }

	refreshBPP() {
		this.setState({
			keyBBP: Math.random()
		})
	}

	checkStationDep(stationName) {
		var obj = MainStore.getCheckDep();
        if (obj==null) {return false;}
		var itemsAry = obj.items;
        var rst = false;

		itemsAry.forEach(function(item,i){
            if (item.name == stationName) {
                if ( +item.enabled == 1 && +item.installed == 1 ) {
                    rst = true;
                }
            }
		})
        return rst;
    }

	componentDidMount() {
		//MainActions.getCheckDep();
		setInterval(()=>{
			if (LoginStore.getValidateAuthPass()) {
				MainActions.getCheckDep();
			}
		}, 10000);
		setInterval(()=>{
			if (LoginStore.getValidateAuthPass()) {
				let ifMusicStation = this.checkStationDep("MusicStation");
				if (ifMusicStation) {
					MainActions.getBtAdapterScan();
				}
			}
		}, 30000);
		//MainActions.getUserData("QS");

		var isInWindow = (window.parent == window) ? true : false;
		var nasLang = MainActions.getCookie("nas_lang");
		var cinema28Lang = MainActions.getCookie("cinema28_lang");

		if (isInWindow) {
			if (cinema28Lang != null) {
				lang.changeLang(cinema28Lang);
			} else {
				lang.changeLang('ENG');
				MainActions.setCookie('cinema28_lang', 'ENG', 1000);

			}
		} else {
			if (nasLang != null) {
				lang.changeLang(nasLang);
			} else {
				let browLang = lang.getBrowserLang();
				lang.changeLang(browLang);
			}

			// Create QMessageClient
    		window.qMessageClient = new QMessageClient();
		}
	}

	componentDidUpdate(prevProps, prevState) {
        ReactTooltip.rebuild();
    }

	render() {
		const divLayout = {
			height: '100%',
			position: 'relative',
			overflow: 'hidden',
		};

		if(this.getValidateAuthPass()){
			return (
				<div id="layout" style={divLayout} onClick={this.layoutClicked.bind(this) } >
					<Frameset isLogin={true} />
					<Toolbar />
					<MainPanel />
					{ this.ifNoDeviceDetect() }
					{ this.ifAbout() }
					{ this.ifQuickStart() }
					{ this.ifSchool() }
					{ this.ifshowMSAddOn() }
					{ this.ifMsgPopUp() }
					{ this.ifHDMIMsgPopUp() }
					{ this.ifCoverMsgPopUp() }
					{ this.ifDeviceInfo() }
					{ this.ifPortLocation() }
					{ this.ifMediaPlaylistTutorial() }
					{ this.ifHelp() }
					{ this.ifBrowsePathPanel() }
					{ this.ifLoadingMask() }
					{ this.ifDeviceWizard() }
					{ this.ifCinema28Disable()}
					<ReactTooltip class='ReactTooltipClass' place="bottom" type="light" effect="float" delayShow={500} />
				</div>
			);
		} else {
			return (
				<div style={divLayout} onClick={this.layoutClicked.bind(this) } >
					<Frameset isLogin={false} />
					<LoginPage />
					{ this.ifAbout() }
				</div>
			);
		}
	}
}

const divMask = {
	width: '100%',
	height: '100%',
	position: 'absolute',
	top: '0px',
	left: '0px',
	backgroundColor: 'rgba(0, 0, 0, 0.1)',
	textAlign: 'center',
	zIndex: '9015',
};

const divLoading = {
	position: 'absolute',
	padding: '24px',
	maxWidth: '300px',
	overflow: 'hidden',
	color: 'rgb(255, 255, 255)',
	zIndex: '10000000',
	border: '1px solid rgb(255, 255, 255)',
	top: 'calc((100% - 78px) / 2)',
	left: 'calc((100% - 178px) / 2)',
	backgroundColor: 'rgba(0,0,0,0.6)',
	fontSize: '16px',
	animation: '0.5s loading01 1',
};

const divLoadingClose = {
	position: 'absolute',
	padding: '24px',
	maxWidth: '300px',
	overflow: 'hidden',
	color: 'rgb(255, 255, 255)',
	zIndex: '10000000',
	border: '1px solid rgb(255, 255, 255)',
	top: 'calc((100% - 78px) / 2)',
	left: 'calc((100% - 178px) / 2)',
	backgroundColor: 'rgba(0,0,0,0.6)',
	fontSize: '16px',
	animation: '0.5s loading02 1',
};