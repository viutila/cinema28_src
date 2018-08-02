import React from "react";
import 'css/DeviceWizard.css';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';

export default class DeviceTypeItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            devCount: this.props.devTypeAry.length,
            devType: this.props.devType
        }

    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            devCount: nextProps.devTypeAry.length,
            devType: nextProps.devType
        })
    }

    getTitleText() {
        
        let rst = '';
        switch (this.state.devType) {
            case devTypeEnum.airPlay: {
                rst = 'AirPlay';
                break;
            }
            case devTypeEnum.analog: {
                rst = lang.getLang('Audio output');
                break;
            }
            case devTypeEnum.bluetooth: {
                rst = lang.getLang('Bluetooth');
                break;
            }
            case devTypeEnum.chromecast: {
                rst = 'Chromecast';
                break;
            }
            case devTypeEnum.dlna: {
                rst = 'DLNA';
                break;
            }
            case devTypeEnum.hdmi: {
                rst = lang.getLang('HDMI Audio output');
                break;
            }
            case devTypeEnum.hdPlayer: {
                rst = lang.getLang('HD player');
                break;
            }
            case devTypeEnum.usb: {
                rst = lang.getLang('USB');
                break;
            }
        }

        return rst;
    }

    getDeviceStatus() {
        let rst = '';
        if (this.state.devCount > 0) {
            if (this.state.devType === devTypeEnum.hdPlayer) {
                let ifLogin = this.getIfHdStationLogin();
                rst = ifLogin ? devStatusEnum.connected : devStatusEnum.notLogin;

            } else {
                rst = devStatusEnum.connected;

            }
        } else {
            rst = devStatusEnum.notConnected;
        }
        return rst;
    }

    getIfHdStationLogin() {
		let obj = MainStore.getCheckDep();
		let itemsAry = obj.items;
        let hdStationItem;
        let rst = false;
		itemsAry.forEach(function(item,i){
			if (item.name == "HD_Station"){
				hdStationItem = item;
			}
        })
        
		if ( 
            +hdStationItem.enabled === 1 && 
            +hdStationItem.installed === 1 && 
            +hdStationItem.login === 1 
        ){
			rst = true;
        }
        return rst;
    }

    getDevStatusSpan() {
        let text = '';
        let dStyle = {};
        let dStyle1 = {
            textOverflow:'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxWidth: '120px',
            display: 'inline-block',
        };
        let devStatus = this.getDeviceStatus();
        switch(devStatus) {
            case devStatusEnum.connected: {
                text = lang.getLang('Connected');
                dStyle = {color:'#4DC85C'};
                break;
            }
            case devStatusEnum.notConnected: {
                text = lang.getLang('Not connected');
                dStyle = {color:'#7F7F7F'};
                break;
            }
            case devStatusEnum.notLogin: {
                text = lang.getLang('Not logged in');
                dStyle = {color:'#FD9444'};
                break;
            }
        }
        return (
            <span style={{...dStyle, ...dStyle1}} data-tip={text}>
                {text}
            </span>
        );
    }

    getDevStatusIcon() {
        let devStatus = this.getDeviceStatus();
        let imgSrc = '';
        switch(devStatus) {
            case devStatusEnum.connected: {
                imgSrc = 'img/genius/status_icon/genius_device_connect.svg';
                break;
            }
            case devStatusEnum.notConnected: {
                imgSrc = 'img/genius/status_icon/genius_device_alert.svg';
                break;
            }
            case devStatusEnum.notLogin: {
                imgSrc = 'img/genius/status_icon/genius_device_connect.svg';
                break;
            }
        }
        let imgStyle = {
            position:'absolute',
            top:'10px',
            right:'10px',
            width: '30px',
            height: '30px'
        };
        return (
            <img src={imgSrc} style={imgStyle} alt=""/>
        )
    }
 
    getUnderLineDiv() {
        let text = '';
        let devStatus = this.getDeviceStatus();
        let dStyle = {
            width: '100%',
            height: '3px',
            position: 'absolute',
            bottom: '0',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
        };

        switch(devStatus) {
            case devStatusEnum.connected: {
                dStyle.background = 'linear-gradient(to right, #32B946 0%, #5CD068 100%)';
                break;
            }
            case devStatusEnum.notConnected: {
                dStyle.background = 'linear-gradient(to right, #B2B2B2 0%, #CFCFCF 100%)';
                break;
            }
            case devStatusEnum.notLogin: {
                dStyle.background = 'linear-gradient(to right, #FE9345 0%, #F3A935 100%)';
                break;
            }
        }

        return (
            <div style={dStyle}></div>
        );
    }

    handleClick() {
        this.props.clickFunc(this.state.devType);
    }


    render() {
        let titleText = this.getTitleText();
        let devStatusSpan = this.getDevStatusSpan();
        let underLineDiv = this.getUnderLineDiv();
        let statusIcon = this.getDevStatusIcon();

        let d1Style = {
            width: 'calc(100% - 40px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize:'12px',
            color:'#4C4C4C',
            padding: '10px 0 0 10px',
            fontWeight: 'bold',
        }

        return (
            <div style={iStyle} onClick={this.handleClick.bind(this)}>
                <div style={d1Style} data-tip={titleText}>
                    {titleText}
                </div>
                <div style={{margin: '10px 0 0 10px',fontSize:'20px'}}>
                    {devStatusSpan}
                </div>
                {underLineDiv}
                {statusIcon}
            </div>
        )
    }
}

const iStyle = {
    width:'150px',
    height:'80px',
    backgroundColor:'#FFF',
    borderRadius: '4px',
    boxShadow: 'rgba(0,0,0,0.2) 0 1px 2px 0',
    display: 'flex',
    flexDirection: 'column',
    msFlexDirection:'column',
    position: 'relative',
    cursor: 'pointer',
    margin: '12.5px'
}

const devTypeEnum = {
    hdmi: 'HDMI',
    hdPlayer: 'HDPLAYER',
    analog: 'ANALOG',
    bluetooth: 'BLUETOOTH',
    usb: 'USB',
    dlna: 'DLNA',
    airPlay: 'AIRPLAY',
    chromecast: 'CHROMECAST'
}

const devStatusEnum = {
    connected: 0,
    notConnected: 1,
    notLogin: 2,
}