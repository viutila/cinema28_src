import React from "react";
import Draggable from 'react-draggable';
import * as MainActions from "../../actions/MainActions";
import MainStore from '../../stores/MainStore';
import { lang } from '../MultiLanguage/MultiLanguage';

export default class DeviceInfoPopUp extends React.Component {
	constructor(props) {
        super(props);
		this.state = {
			deviceName: this.props.data.name,
			nickName: this.props.data.nickname,
			connectDevice: this.props.data.connected,
			localDisplay: this.props.data.allow_apps,
			devId: this.props.data.id,
			type: this.props.data.type,
			subType: this.props.data.subtype,
			showEditDeviceIcon: false,
			deviceIconIndex:this.props.iconIndex,
			ifEnterIconEdit: false,
		}

		this.iconSrc = [
			'img/station_icon/ic_file_station_380.png',
			'img/station_icon/ic_photo_station_380.png',
			'img/station_icon/ic_music_station_380.png',
			'img/station_icon/ic_video_station_380.png',
		];
		
		this.SSMTobj = {
			audioHDMI: "Music / Video",
			playerHDMI: "Photo / Music / Video",
			analog: "Music / Video (" + lang.getLang('Audio only') + ")",
			usb: "Music / Video (" + lang.getLang('Audio only') + ")",
			bluetooth: "Music",
			dlna: "Photo / Music / Video",
			airPlay: "Photo / Music / Video",
			chromeCast: "Photo / Music / Video"
		}
    }

    aboutCloseClick() {
		MainActions.toogleDeviceInfo();
	}

	editDeviceIcon() {
		this.setState({
			showEditDeviceIcon: !this.state.showEditDeviceIcon
		});
	}

	setDeviceIcon(index){
		this.setState({
			deviceIconIndex: index,
			showEditDeviceIcon: !this.state.showEditDeviceIcon
		});
	}

	applyDeviceInfo(){
		var tmpStr;
		tmpStr = (this.state.nickName) ? this.state.nickName : " ";
		MainActions.applyDeviceInfo(this.state.devId, tmpStr, this.state.deviceIconIndex);
	}

	nickNameOnChange(event) {
        var value = event.target.value;
        this.setState({
            nickName: value
        })
    }

	nickNameOnBlur() {
		// var tmpStr;
		// tmpStr = (this.state.nickName) ? this.state.nickName : " ";
		// MainActions.renameDevNickName(this.state.devId, tmpStr);
	}

	renderStationIconsHDPlayer() {
		var tmpAry = [];
		this.iconSrc.forEach(function(iconSrc,i) {
            tmpAry.push(<img src={iconSrc} key={i} style={stationIcon} />);
        });
		return tmpAry;
	}

	renderStationIconsHDAudio() {
		var cAry = [1,0,1,1];
		var tmpAry = [];
		this.iconSrc.forEach(function(iconSrc,i) {
            (cAry[i]==1) ? tmpAry.push(<img src={iconSrc} key={i} style={stationIcon} />) : false;
        });
		return tmpAry;
	}

	handleIconImgArray(indexAry) {
		var tmpAry = [];
		this.iconSrc.forEach(function(iconSrc,i) {
            (indexAry[i]==1) ? tmpAry.push(<img src={iconSrc} key={i} style={stationIcon} />) : false;
        });
		return tmpAry;
	}

	getDeviceName() {
		let r = this.state.deviceName;
		if (this.state.type === 'HDMI') {
			let idxHdmi = r.indexOf('HDMI');
			if (idxHdmi > -1) {
				let tmpSplit = r.split(' ');
				r = tmpSplit[0] + ' Audio ' + tmpSplit[1];
			}
		}
		return r;
	}

	enterEditHandle() {
		this.setState({
			ifEnterIconEdit: true
		})
	}

	leaveEditHandle() {
		this.setState({
			ifEnterIconEdit: false
		})
	}

	renderIconEditDiv() {
		let ifEditDivVis = this.state.ifEnterIconEdit ? 'visible' : 'hidden';
		return (
			<div style={iconOutterDiv} 
				 onMouseEnter={this.enterEditHandle.bind(this)} 
				 onMouseLeave={this.leaveEditHandle.bind(this)}
				 onClick={this.editDeviceIcon.bind(this)}
			>
				<div style={{width:'80px',backgroundColor:'rgb(31,39,64)'}}>
					<img src={deviceIcon[this.state.deviceIconIndex]} style={{width:'70px',height:'60px',margin:'0 5px 0 5px'}} />
				</div>
				<div style={{...editDiv,visibility: ifEditDivVis}}>
					<div style={{height:'100%',display:'flex',justifyContent:'center',msFlexPack: 'center'}}>
						<span style={{marginLeft:'10px'}}>Edit</span>
						<img style={{margin:'0 5px'}} src='img/control_btn/pen_0.svg' />
					</div>
				</div>
			</div>
		);
	}

	renderHDMIdiv() {
		var audioIconAry = this.handleIconImgArray([1,0,1,1]);
		var playerIconAry = this.handleIconImgArray([1,1,1,1]);

		return (
			<div style={divAbout}>
				<div style={{width: '100%',height: '58px',top: '0',borderBottom: '1px solid #b0b0b0',cursor: 'move',backgroundColor: '#1F2740'}}>
					<span style={{position: 'relative',lineHeight:'58px',left:'35px',fontSize:'20px',color: '#FFFFFF',float:'left'}}>{lang.getLang('Device information')}</span>
					<div id="divClose" class="btnClose" onClick={this.aboutCloseClick.bind(this)} />
				</div>
				<div style={{textAlign:'left',margin:'0 35px 44px 35px',paddingTop:'20px',fontSize:'14px', color: '#2f2f2f', display:'table'}}>
					<div style={{display:'table-row-group'}}>
						<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={{display:'table-cell',padding:'0 20px 10px 0'}}>{lang.getLang('Device')}:</div>
							<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.getDeviceName()}</div>
						</div>

						<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={{display:'table-cell',padding:'0 20px 10px 0'}}>{lang.getLang('Name')}:</div>
							<div style={{display:'table-cell'}}>
								<input id="input_nickName" style={textInput} type="text" autoComplete="off" placeholder="" maxLength="16" onChange={this.nickNameOnChange.bind(this)} onBlur={this.nickNameOnBlur.bind(this)} value={this.state.nickName} />
							</div>
						</div>

						<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={td1}>
								<p style={pStyle1} data-tip={lang.getLang('Connected device')}>
									{lang.getLang('Connected device')}:
								</p>
							</div>
							<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.state.connectDevice}</div>
						</div>

						{/*<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={td1}>Local display:</div>
							<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.state.localDisplay}</div>
						</div>*/}

						<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={td1}>
								<p style={pStyle1} data-tip={lang.getLang('Supported media type')}>
									{lang.getLang('Supported media type')}:
								</p>
							</div>
							<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}></div>
						</div>

						<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={[td2,{padding:'0 20px 5px 10px'}]}>HDMI Audio</div>
							<div style={{display:'table-cell',padding:'0 10px 5px 10px'}}>Music, Video ({lang.getLang('Audio only')})</div>
						</div>
						<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={[td2,{padding:'0 20px 15px 10px'}]}>
								<p style={pStyle1} data-tip={lang.getLang('Supported apps')}>
									{lang.getLang('Supported apps')}:
								</p>
							</div>
							<div style={{display:'table-cell',padding:'0 10px 15px 10px'}}>{audioIconAry}</div>
						</div>

						<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={[td2,{padding:'0 20px 5px 10px'}]}>HDMI Player</div>
							<div style={{display:'table-cell',padding:'0 10px 5px 10px'}}>Photo, Music, Video</div>
						</div>
						<div style={{display:'table-row',lineHeight:'24px'}}>
							<div style={[td2,{padding:'0 20px 15px 10px'}]}>
								<p style={pStyle1} data-tip={lang.getLang('Supported apps')}>
									{lang.getLang('Supported apps')}:
								</p>
							</div>
							<div style={{display:'table-cell',padding:'0 10px 15px 10px'}}>{playerIconAry}</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderIconSelector(){
		var array = [];
		const style = {
			width: '48px',
			height: '40px',
			display: 'inline-block',
			margin: '0 10px 10px 0',
			cursor:'pointer'
		}
		const style_last = {
			width: '48px',
			height: '40px',
			display: 'inline-block',
			margin: '0 0px 10px 0',
			cursor:'pointer'
		}
		for(let i = 0; i < 10; i++){
			if(i==4 || i==9){
				array.push(<div key={i} data-value={i} style={style_last}><img src={deviceIcon[i]} style={{width:'48px','height':'40px'}} onClick={this.setDeviceIcon.bind(this,i)}/></div>);
			}else{
				array.push(<div key={i} data-value={i} style={style}><img src={deviceIcon[i]} style={{width:'48px','height':'40px'}} onClick={this.setDeviceIcon.bind(this,i)}/></div>);
			}
		}

		return this.state.showEditDeviceIcon ? 
		(<div style={{backgroundColor:'#293940',width:'321px',height:'130px',position:'absolute',top:'98px',left:'140px',padding:'20px 20px'}}>
			{array}
		</div>) : 
		'';
	}

	renderHDMIdiv() {
		var audioIconAry = this.handleIconImgArray([1,0,1,1]);
		var playerIconAry = this.handleIconImgArray([1,1,1,1]);
		var content01, content02;

		if (this.state.type == "HDMI") {
			content01 = "Music, Video (" + lang.getLang('Audio only') + ")";
			content02 = audioIconAry;
		} else if (this.state.type == "HDPLAYER") {
			content01 = "Photo, Music, Video";
			content02 = playerIconAry;
		}

		return (
			<div style={divAbout}>
				<div style={{width: '100%',height: '58px',top: '0',borderBottom: '1px solid #b0b0b0',cursor: 'move',backgroundColor: '#1F2740'}}>
					<span style={{position: 'relative',lineHeight:'58px',left:'35px',fontSize:'20px',color: '#FFFFFF',float:'left'}}>{lang.getLang('Device information')}</span>
					<div id="divClose" class="btnClose" onClick={this.aboutCloseClick.bind(this)} />
				</div>
				<div style={{textAlign:'left',margin:'40px 50px 0px 50px', display:'flex'}}>
					{this.renderIconEditDiv()}
					<div style={{textAlign:'left',margin:'0 0 45px 20px',fontSize:'14px', color: '#2f2f2f', display:'table'}}>
						<div style={{display:'table-row-group'}}>
							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={{display:'table-cell',padding:'0 20px 10px 0'}}>{lang.getLang('Device')}:</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.getDeviceName()}</div>
							</div>

							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={{display:'table-cell',padding:'0 20px 10px 0'}}>{lang.getLang('Name')}:</div>
								<div style={{display:'table-cell'}}>
									<input id="input_nickName" style={textInput} type="text" autoComplete="off" placeholder="" maxLength="16" onChange={this.nickNameOnChange.bind(this)} onBlur={this.nickNameOnBlur.bind(this)} value={this.state.nickName} />
								</div>
							</div>

							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={td1}>
									<p style={pStyle1} data-tip={lang.getLang('Connected device')}>
										{lang.getLang('Connected device')}:
									</p>
								</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.state.connectDevice}</div>
							</div>

							{/*<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={td1}>Local display:</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.state.localDisplay}</div>
							</div>*/}

							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={td1}>
									<p style={pStyle1} data-tip={lang.getLang('Supported media type')}>
										{lang.getLang('Supported media type')}:
									</p>
								</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{content01}</div>
							</div>

							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={td1}>
									<p style={pStyle1} data-tip={lang.getLang('Supported apps')}>
										{lang.getLang('Supported apps')}:
									</p>
								</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{content02}</div>
							</div>
							<button className='stdButton' style={stdBtnInnerStyle} onClick={this.applyDeviceInfo.bind(this)}>Apply</button>
						</div>
					</div>
				</div>
				{this.renderIconSelector()}
			</div>
		);
	}

	renderOthersdiv() {
		var sftStr;
		var sftStationAry = [];
		switch (this.state.type) {
			case "ANALOG":
				sftStr = this.SSMTobj.analog;
				sftStationAry = [1,0,1,1];
				break;
			case "USB":
				sftStr = this.SSMTobj.usb;
				sftStationAry = [1,0,1,1];
				break;
			case "Bluetooth":
				sftStr = this.SSMTobj.bluetooth;
				sftStationAry = [0,0,1,0];
				break;
			
			case "network":
				switch (this.state.subType) {
					case "DLNA":
						sftStr = this.SSMTobj.dlna;
						sftStationAry = [1,1,1,1];
						break;
					case "AirPlay":
						sftStr = this.SSMTobj.airPlay;
						sftStationAry = [1,1,1,1];
						break;
					case "Chromecast":
						sftStr = this.SSMTobj.chromeCast;
						sftStationAry = [1,1,1,1];
						break;
				}
				break;
		}
		var iconImgAry = this.handleIconImgArray(sftStationAry);
		return (
			<div style={divAbout}>
				<div style={{width: '100%',height: '58px',top: '0',borderBottom: '1px solid #b0b0b0',cursor: 'move',backgroundColor: '#1F2740'}}>
					<span style={{position: 'relative',lineHeight:'58px',left:'35px',fontSize:'20px',color: '#FFFFFF',float:'left'}}>{lang.getLang('Device information')}</span>
					<div id="divClose" class="btnClose" onClick={this.aboutCloseClick.bind(this)} />
				</div>
				<div style={{textAlign:'left',margin:'40px 50px 0px 50px', display:'flex'}}>
					{this.renderIconEditDiv()}
					<div style={{textAlign:'left',margin:'0 0 45px 20px',fontSize:'14px', color: '#2f2f2f', display:'table'}}>
						<div style={{display:'table-row-group'}}>
							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={{display:'table-cell',padding:'0 20px 10px 0'}}>{lang.getLang('Device')}:</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.getDeviceName()}</div>
							</div>

							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={{display:'table-cell',padding:'0 20px 10px 0'}}>{lang.getLang('Name')}:</div>
								<div style={{display:'table-cell'}}>
									<input
										id="input_nickName"
										style={textInput}
										type="text"
										autoComplete="off"
										placeholder=""
										maxLength="16"
										onChange={this.nickNameOnChange.bind(this)}
										onBlur={this.nickNameOnBlur.bind(this)}
										value={this.state.nickName}
									/>
								</div>
							</div>

							{/*<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={td1}>{lang.getLang('Connected device')}:</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.state.connectDevice}</div>
							</div>*/}

							{/*<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={td1}>Local display:</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{this.state.localDisplay}</div>
							</div>*/}

							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={td1}>
									<p style={pStyle1} data-tip={lang.getLang('Supported media type')}>
										{lang.getLang('Supported media type')}:
									</p>
								</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{sftStr}</div>
							</div>

							<div style={{display:'table-row',lineHeight:'24px'}}>
								<div style={td1}>
									<p style={pStyle1} data-tip={lang.getLang('Supported apps')}>
										{lang.getLang('Supported apps')}:
									</p>
								</div>
								<div style={{display:'table-cell',padding:'0 10px 10px 10px'}}>{iconImgAry}</div>
							</div>
							<button className='stdButton' style={stdBtnInnerStyle} onClick={this.applyDeviceInfo.bind(this)}>Apply</button>
						</div>
					</div>
					{this.renderIconSelector()}
				</div>
				
			</div>
		);
	}
    
    render() {
		var rst;
		if (this.state.type == "HDMI" || this.state.type == "HDPLAYER")
			rst = this.renderHDMIdiv();
		else
			rst = this.renderOthersdiv();
		
        return (
            <div>
				<div id="mask" style={divMask} >
				<Draggable bounds="body" cancel="#Link" cancel="#divClose,#input_nickName">
					{rst}
				</Draggable>
				</div>
			</div>
        )
    }
}

const deviceIcon = [
	'img/custom_device_icon/pc_l.svg',
	'img/custom_device_icon/tv_l.svg',
	'img/custom_device_icon/device_l.svg',
	'img/custom_device_icon/joystick_l.svg',
	'img/custom_device_icon/chromecast_l.svg',
	'img/custom_device_icon/notebook_l.svg',
	'img/custom_device_icon/appletv_l.svg',
	'img/custom_device_icon/speaker_1_l.svg',
	'img/custom_device_icon/afu_l.svg',
	'img/custom_device_icon/speaker_bluetooth_l.svg'
];

const divMask = {
	width: '100%',
	height: '100%',
	position: 'absolute',
	top: '0px',
	left: '0px',
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	textAlign: 'center',
	zIndex: '2',
	display: 'flex',
    alignItems: 'center',
	justifyContent: 'center',
	msFlexAlign: 'center',
	msFlexPack: 'center',
};

const divAbout = {
	position: 'relative',
    zIndex: '9014',
    width: '565px',
    opacity: '1',    
	backgroundColor: '#FAFAFA',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	border: '1px solid #b0b0b0',
	display: 'inline-block',
	cursor: 'default'
}

const textInput = {
	width: '200px',
	height: '24px',
	paddingLeft: '10px',
	marginBottom: '0',
	border: '1px solid #e5e5e5',
	backgroundColor: '#FAFAFA'
}

const td1 = {
	display:'table-cell',
	padding:'0 20px 10px 0',
	whiteSpace:'nowrap'
}

const td2 = {
	display:'table-cell',
	whiteSpace:'nowrap',
	color:'#777777',
	fontSize:'13px'
}

const stationIcon = {
	marginLeft: '10px'
}

const editDiv = {
	height: '20px',
	minWidth: '58px',
	backgroundColor: 'rgba(31,39,64,0.75)',
	textAlign:'center',
	color: '#FFF',
	cursor: 'pointer',
	borderRadius: '10px',
	display:'inline-block'
}

const iconOutterDiv = {
	width:'80px',
	height:'80px',
	textAlign: 'center',
	cursor: 'pointer'
}

const stdBtnInnerStyle = {
	backgroundColor: '#1F2740',
	position:'absolute',
	right:'20px',
	bottom:'20px',
	color: '#FFFFFF'
}
const pStyle1 = {
	textOverflow:'ellipsis',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	maxWidth: '145px',
	margin: '0',
}