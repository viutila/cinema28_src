import React from "react";
import ReactTooltip from 'react-tooltip';

import 'css/DeviceWizard.css';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';

import CustomScrollBar01 from 'js/components/Common/CustomScrollBar01';
import DeviceTypeItem from './DeviceTypeItem';
import Page2 from './Page2';

export default class DeviceWizard extends React.Component {
    constructor(props) {
        super(props);
        this.setDevices = this.setDevices.bind(this);
        this.state = {
            deviceByType: this.getDeviceObj(),
            currPage: 1,
            currDevType: null,
        }
    }

    getDeviceObj() {
        let tmpDevByType = _.cloneDeep(MainStore.getDeviceByType());
        let btDevArray = tmpDevByType.bluetoothDevs;
        for (let i = btDevArray.length - 1; i>=0; i--) {
          if (btDevArray[i].connected !== 'Yes') {
            btDevArray.splice(i,1);
          }
        }
        let dlnaDevices = _.filter(tmpDevByType.networkDevs, {subtype:"DLNA"});
        let airPlayDevices = _.filter(tmpDevByType.networkDevs, {subtype:"AirPlay"});
        let chromecastDevices = _.filter(tmpDevByType.networkDevs, {subtype:"Chromecast"});

        tmpDevByType.dlnaDevs = dlnaDevices;
        tmpDevByType.airPlayDevs = airPlayDevices;
        tmpDevByType.chromecastDevs = chromecastDevices;
        
        return tmpDevByType;
    }

    componentWillMount() {
        MainStore.on('updateDevice', this.setDevices);
    }

    componentWillUnmount() {
        MainStore.removeListener('updateDevice', this.setDevices);
    }

    setDevices() {
        let tmpDevByType = this.getDeviceObj();
        this.setState({
          deviceByType: tmpDevByType,
        });
    }

    clickClose() {
        MainActions.toggleDeviceWizard(false);
    }

    setCurrPage(v) {
        ReactTooltip.hide();
        this.setState({
            currPage: v
        });
    }

    setCurrDevType(v) {
        ReactTooltip.hide();
        this.setState({
            currDevType: v,
            currPage: 2,
        });
    }

    renderPage1() {
        let d1Style = {
            width: '750px',
            height: '400px',
            backgroundColor: '#1D273E',
            borderRadius: '5px',
            position: 'relative',
            boxShadow: 'rgba(255, 255, 255, 0.4) 0px 0px 20px 0px',
            animation: 'fadeIn 0.3s',
        };

        let ipStyle = {
            display:'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            msFlexPack: 'center',
            msFlexAlign: 'center',
            msFlexWrap: 'wrap',
        };

        return (
            <div style={d1Style} key={this.state.currPage}>
                <div style={{fontSize:'16px',color:'#FFF',padding:'25px 70px 25px 25px', cursor:'default'}}>
                    {lang.getLang('WizardMsg01')}
                </div>
                <button 
                    className='closeBtn' 
                    style={{position:'absolute',top:'25px',right:'25px'}}
                    onClick={this.clickClose.bind(this)}
                />

                <div>
                    <div style={ipStyle}>
                        <DeviceTypeItem devType={devTypeEnum.analog} devTypeAry={this.state.deviceByType.analogDevs} clickFunc={this.setCurrDevType.bind(this)} />
                        <DeviceTypeItem devType={devTypeEnum.bluetooth} devTypeAry={this.state.deviceByType.bluetoothDevs} clickFunc={this.setCurrDevType.bind(this)} />
                        <DeviceTypeItem devType={devTypeEnum.hdPlayer} devTypeAry={this.state.deviceByType.hdPlayerDevs} clickFunc={this.setCurrDevType.bind(this)} />
                        <DeviceTypeItem devType={devTypeEnum.hdmi} devTypeAry={this.state.deviceByType.hdmiDevs} clickFunc={this.setCurrDevType.bind(this)} />
                        <DeviceTypeItem devType={devTypeEnum.usb} devTypeAry={this.state.deviceByType.usbDevs} clickFunc={this.setCurrDevType.bind(this)} />
                        <DeviceTypeItem devType={devTypeEnum.dlna} devTypeAry={this.state.deviceByType.dlnaDevs} clickFunc={this.setCurrDevType.bind(this)} />
                        <DeviceTypeItem devType={devTypeEnum.airPlay} devTypeAry={this.state.deviceByType.airPlayDevs} clickFunc={this.setCurrDevType.bind(this)} />
                        <DeviceTypeItem devType={devTypeEnum.chromecast} devTypeAry={this.state.deviceByType.chromecastDevs} clickFunc={this.setCurrDevType.bind(this)} />
                    </div>
                </div>

                <div 
                    className='whiteLink'
                    style={{
                        fontSize:'14px',
                        position:'absolute',
                        bottom:'20px',
                        right:'25px',
                        cursor: 'pointer',
                        lineHeight:'14px',
                    }}
                    onClick = {this.setCurrPage.bind(this,2)}
                >
                    {lang.getLang('More device tips')}
                </div>

            </div>
        )
    }

    render() {
        let maskStyle = {
            width: '100%',
            height:'100%',
            position:'absolute',
            top: '0',
            left: '0',
            backgroundColor: 'rgba(0,0,0,0.4)',
            display:'flex',
            justifyContent: 'center',
            alignItems: 'center',
            msFlexAlign: 'center',
            msFlexPack: 'center',
        };

        return (
            <div style={maskStyle}>
                {
                    this.state.currPage === 1
                    ? this.renderPage1()
                    : (
                        <Page2 
                            deviceByType={this.state.deviceByType} 
                            setCurrPage={this.setCurrPage.bind(this)} 
                            currDevType={this.state.currDevType}
                        />
                    )
                }

            </div>
        )
    }
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

const devContentImg = {
    hdmi: 'img/genius/genius_pic_hdmi.svg',
    hdPlayer: 'img/genius/genius_pic_hdplayer.svg',
    analog: 'img/genius/genius_pic_analog.svg',
    bluetooth: 'img/genius/genius_pic_bluetooth.svg',
    usb: 'img/genius/genius_pic_usb.svg',
    dlna: 'img/genius/genius_pic_dlna.svg',
    airPlay: 'img/genius/genius_pic_appletv.svg',
    chromecast: 'img/genius/genius_pic_chromecast.svg'
}