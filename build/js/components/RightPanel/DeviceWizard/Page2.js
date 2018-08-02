import React from 'react';
import 'css/DeviceWizard.css';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';

import CustomScrollBar01 from 'js/components/Common/CustomScrollBar01';
import DeviceTypeItem from './DeviceTypeItem';
import HDSLoginPanel from './HDSLoginPanel';
import compare from 'node-version-compare';

export default class Page2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currDevType: this.props.currDevType ? this.props.currDevType : devTypeEnum.hdmi,
            deviceByType: this.props.deviceByType,
            ifShowHdLogin: false,
            hdKey: Math.random(),
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            deviceByType: nextProps.deviceByType
        })
    }

    setCurrDevType(v) {
        this.setState({
            currDevType: v
        })
    }

    renderMenuItem(devType, text) {
        let dMenuItemStyle = {
            width:'100%',
            height:'31px',
            fontSize:'14px',
            color:'#FFF',
            display:'flex',
            alignItems:'center',
            msFlexAlign: 'center',
            borderBottom:'1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer'
        };

        let iconSrc = '';
        for(var key in devTypeEnum) {
            if(devTypeEnum[key] === devType) {
                iconSrc = devIcon[key];
            }
        }
        if (this.state.currDevType === devType) {
            dMenuItemStyle.background = 'linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(26,30,48,0.15) 100%)';
        }
        return (
            <div className='menuItem' style={dMenuItemStyle} onClick={this.setCurrDevType.bind(this,devType)}>
                <img src={iconSrc} style={{margin: '0 5px'}} alt=""/>
                <span>{text}</span>
            </div>
        )
    }

    clickClose() {
        MainActions.toggleDeviceWizard(false);
    }


    getImageSource() {
        let imgSrc = '';
        for(var key in devTypeEnum) {
            if(devTypeEnum[key] === this.state.currDevType) {
                imgSrc = devContentImg[key];
            }
        }
        return (
            <img 
                key={this.state.currDevType} 
                src={imgSrc} 
                style={{animation:'fadeIn 0.3s', minWidth:'200px', minHeight:'200px'}}
            />
        );
    }

    renderAirPlayContent() {
        let imgSrc = this.getImageSource();
        return (
            <div 
                style={{
                    display:'flex',
                    flexDirection:'column',
                    msFlexDirection:'column',
                    alignItems:'flex-start',
                    msFlexAlign: 'start',
                }}
            >
                {imgSrc}
                <div style={{...tStyle,marginTop:'20px'}}>
                    {lang.getLang('WizardMsg18')}
                </div>
                <div style={tStyle}>
                    {lang.getLang('WizardMsg19')}
                </div>
            </div>
        )
    }

    renderAnalogContent() {
        let imgSrc = this.getImageSource();
        return (
            <div 
                style={{
                    display:'flex',
                    flexDirection:'column',
                    msFlexDirection:'column',
                    alignItems:'flex-start',
                    msFlexAlign: 'start'
                }}
            >
                {imgSrc}
                <div 
                    style={{
                        fontSize: '12px',
                        color: '#FFF',
                        lineHeight: '20px',
                        cursor: 'default',
                        animation:'fadeIn 0.8s',
                        width:'420px',
                        marginTop:'20px'
                    }}
                >
                    {lang.getLang('WizardMsg08')}
                </div>
            </div>
        )
    }

    renderBluetoothContent() {
        let imgSrc = this.getImageSource();
        imgSrc.props.style.minHeight = '180px';
        imgSrc.props.style.maxHeight = '180px';

        let str1 = lang.getLang('WizardMsg15');
        str1 = str1.split("https://www.qnap.com/compatibility");
        let link1 = (
            <a className='linkSpan' id="Link" href="https://www.qnap.com/compatibility" target="_blank">
                https://www.qnap.com/compatibility
            </a>
        )

        return (
            <div 
                style={{
                    display:'flex',
                    flexDirection:'column',
                    msFlexDirection:'column',
                    alignItems:'flex-start',
                    msFlexAlign: 'start'
                }}
            >
                {imgSrc}
                <div style={tStyle}>
                    {lang.getLang('WizardMsg10')}
                </div>
                <div style={tStyle}>
                    {lang.getLang('WizardMsg11')}
                </div>
                <div style={tStyle}>
                    {lang.getLang('WizardMsg12')}
                </div>
                <div style={tStyle}>
                    {lang.getLang('WizardMsg13')}
                </div>
                <div style={tStyle}>
                    {lang.getLang('WizardMsg14')}
                </div>
                <div style={{...tStyle,display:'block'}}>
                    {str1[0]}{link1}{str1[1]}
                </div>
            </div>
        )
    }

    renderChromecastContent() {
        let imgSrc = this.getImageSource();
        let str1 = lang.getLang('WizardMsg21');
        str1 = str1.split("Google");
        let link1 = (
            <a className='linkSpan' id="Link" href="https://support.google.com/chromecast/answer/2998456" target="_blank">
                Google
            </a>
        )

        return (
            <div
                style={{
                    display:'flex',
                    flexDirection:'column',
                    msFlexDirection:'column',
                    alignItems:'flex-start',
                    msFlexAlign: 'start',
                    width:'420px'
                }}
            >
                {imgSrc}
                <div style={{...tStyle,marginTop:'20px'}}>
                    {lang.getLang('WizardMsg20')}
                </div>
                <div style={{...tStyle,display:'block'}}>
                    {str1[0]}{link1}{str1[1]}
                </div>
            </div>
        )
    }

    renderDlnaContent() {
        let imgSrc = this.getImageSource();
        let url = MainActions.getCgiOrigin() + '/apps/upnp/';
        let str1 = lang.getLang('WizardMsg17');
        str1 = str1.split("Media Streaming add-on");
        let link1 = (
            <a className='linkSpan' id="Link" href={url} target="_blank">
                Media Streaming add-on
            </a>
        )

        return (
            <div 
                style={{
                    display:'flex',
                    flexDirection:'column',
                    msFlexDirection:'column',
                    alignItems:'flex-start',
                    msFlexAlign: 'start'
                }}
            >
                {imgSrc}
                <div style={{...tStyle,marginTop:'20px'}}>
                    {lang.getLang('WizardMsg16')}
                </div>
                <div style={{...tStyle,display:'block'}}>
                    {str1[0]}{link1}{str1[1]}
                </div>
            </div>
        )
    }

    showHdLogin() {
        this.setState({
            ifShowHdLogin: !this.state.ifShowHdLogin,
            hdKey: Math.random(),
        })
    }

    renderHDPlayerContent() {
        let imgStyle = {
            marginRight:'5px',
            width: '30px',
            height: '30px',
        };
        let imgSrc = {
            enable: 'img/genius/genius_connect.svg',
            disable: 'img/genius/genius_disconnect.svg'
        };

        let pStyle01 = {
            textOverflow:'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxWidth: '230px',
            margin: '0',
        };

		let itemsAry = MainStore.getCheckDep().items;
        let hdStationItem={};
        let hdPlayerItem={};
		itemsAry.forEach(function(item,i){
			if (item.name == "HD_Station"){
				hdStationItem = item;
            }
            if (item.name == "XBMC"){
				hdPlayerItem = item;
			}
        });

        let isHdPlayerVer = compare(hdPlayerItem.version,'14.2.9');

        let r1 = (+hdStationItem.enabled === 1 && +hdStationItem.installed === 1 && isHdPlayerVer >= 0);
        let r2 = (+hdPlayerItem.enabled === 1 && +hdPlayerItem.installed === 1 && isHdPlayerVer >= 0);
        let r3 = (this.state.deviceByType.hdPlayerDevs.length > 0 && isHdPlayerVer >= 0);

        let ifv31c;
        if ( parseFloat(hdStationItem.version) <= 3.1 && hdStationItem.version !== '3.1.C' ) {
            ifv31c = -1;
        } else {
            ifv31c = compare(hdStationItem.version, '3.1.C');
        }

        let r4 = (
            +hdStationItem.enabled === 1
            && +hdStationItem.installed === 1
            && +hdStationItem.login === 1
            && isHdPlayerVer >= 0
        );

        let imgSrcR1 = r1 ? imgSrc.enable : imgSrc.disable;
        let imgSrcR2 = r2 ? imgSrc.enable : imgSrc.disable;
        let imgSrcR3 = r3 ? imgSrc.enable : imgSrc.disable;
        let imgSrcR4 = r4 ? imgSrc.enable : imgSrc.disable;

        let r4Text;
        if (r4) {
            r4Text = (
                <span>
                    {lang.getLang('WizardMsg07')}
                </span>
            );
        } else {
            r4Text = (ifv31c >= 0 && r1 && r2 & r3)
            ? (
                <a className='linkSpan' style={{cursor:'pointer'}} onClick={this.showHdLogin.bind(this)}>
                    {lang.getLang('WizardMsg07')}
                </a>
            )
            : (
                <span>
                    {lang.getLang('WizardMsg07')}
                </span>
            );
        }

        let verHintDiv = null;
        if (ifv31c < 0 || isHdPlayerVer < 0) {
            let hdStationVerText = 'HybridDesk Station 3.1.C';
            let hdPlayerVerText = 'HD Player 14.2.9';
            
            let versionString = lang.getLang('EGMsg01');
            let versionRst = versionString.replace('%Application_Version1',hdStationVerText);
            versionRst = versionRst.replace('%Application_Version2',hdPlayerVerText);
            verHintDiv = (
                <div style={{...tStyle,maxWidth:'400px',marginTop:'20px'}}>
                    {versionRst}
                </div>
            );
        }

        return (
            <div
                style={{
                    display:'flex',
                    alignItems:'center',
                    msFlexAlign: 'center',
                    justifyContent:'center',
                    msFlexPack: 'center',
                    flexDirection:'column',
                    msFlexDirection:'column',
                }}
                key={this.state.hdKey}
            >
                <div style={{display:'flex',alignItems:'center', msFlexAlign: 'center'}}>
                    <img src={devContentImg.hdPlayer} style={{animation:'fadeIn 0.3s'}} />
                    <div>
                        <div style={{...tStyle,lineHeight:'40px'}}>
                            <img src={imgSrcR1} style={imgStyle}/>
                            <p style={pStyle01} data-tip={lang.getLang('WizardMsg04')}>
                                {lang.getLang('WizardMsg04')}
                            </p>
                        </div>
                        <div style={{...tStyle,lineHeight:'40px'}}>
                            <img src={imgSrcR2} style={imgStyle}/>
                            <p style={pStyle01} data-tip={lang.getLang('WizardMsg05')}>
                                {lang.getLang('WizardMsg05')}
                            </p>
                        </div>
                        <div style={{...tStyle,lineHeight:'40px'}}>
                            <img src={imgSrcR3} style={imgStyle}/>
                            <p style={pStyle01} data-tip={lang.getLang('WizardMsg06')}>
                                {lang.getLang('WizardMsg06')}
                            </p>
                        </div>
                        <div style={{...tStyle,lineHeight:'40px'}}>
                            <img src={imgSrcR4} style={imgStyle}/>
                            <p style={pStyle01} data-tip={lang.getLang('r4Text')}>
                                {r4Text}
                            </p>
                        </div>
                    </div>
                </div>
                
                {verHintDiv}
                
            </div>
        )
    }

    renderHdmiAudioContent() {
        let imgSrc = this.getImageSource();
        return (
            <div
                style={{
                    display:'flex',
                    flexDirection:'column',
                    msFlexDirection:'column',
                    alignItems:'flex-start',
                    msFlexAlign: 'start'
                }}
            >
                {imgSrc}
                <div style={{...tStyle,marginTop:'20px'}}>
                    {lang.getLang('WizardMsg02')}
                </div>
                <div style={tStyle}>
                    {lang.getLang('WizardMsg03')}
                </div>
            </div>
        )
    }

    renderUsbContent() {
        let imgSrc = this.getImageSource();
        return (
            <div 
                style={{
                    display:'flex',
                    flexDirection:'column',
                    msFlexDirection:'column',
                    alignItems:'flex-start',
                    msFlexAlign: 'start'
                }}
            >
                {imgSrc}
                <div style={{...tStyle,marginTop:'20px'}}>
                    {lang.getLang('WizardMsg09')}
                </div>
            </div>
        )
    }

    renderContent() {
        switch(this.state.currDevType) {
            case devTypeEnum.airPlay: {
                return this.renderAirPlayContent();
            }
            case devTypeEnum.analog: {
                return this.renderAnalogContent();
            }
            case devTypeEnum.bluetooth: {
                return this.renderBluetoothContent();
            }
            case devTypeEnum.chromecast: {
                return this.renderChromecastContent();
            }
            case devTypeEnum.dlna: {
                return this.renderDlnaContent();
            }
            case devTypeEnum.hdmi: {
                return this.renderHdmiAudioContent();
            }
            case devTypeEnum.hdPlayer: {
                return this.renderHDPlayerContent();
            }
            case devTypeEnum.usb: {
                return this.renderUsbContent();
            }
        }
    }

    render() {
        let d1Style = {
            width: '700px',
            height: '430px',
            backgroundColor: '#1D273E',
            borderRadius: '5px',
            position: 'relative',
            boxShadow: 'rgba(255, 255, 255, 0.4) 0px 0px 20px 0px',
            animation: 'fadeIn 0.3s',
        };

        let d2Style = {
            fontSize:'16px',
            color:'#FFF',
            padding:'25px',
            display: 'flex',
            alignItems: 'center',
            msFlexAlign: 'center'
        };

        let dMenuItemStyle = {
            width:'100%',
            height:'31px',
            fontSize:'14px',
            color:'#FFF',
            display:'flex',
            alignItems:'center',
            msFlexAlign: 'center',
            borderBottom:'1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer'
        };

        return (
            <div style={d1Style}>
                <button 
                    className='closeBtn' 
                    style={{position:'absolute',top:'25px',right:'25px'}}
                    onClick={this.clickClose.bind(this)}
                />
                <div style={d2Style}>
                    <div style={{cursor:'pointer',display:'flex',alignItems:'center',msFlexAlign:'center'}} onClick={this.props.setCurrPage.bind(this,1)}>
                        <button 
                            className='backBtn' 
                            style={{marginRight:'5px'}}
                        />
                        {lang.getLang('Back to device list')}
                    </div>
                   
                </div>
                

                <div style={{display:'flex'}}>
                    <div 
                        style={{
                            width:'170px',
                            display:'flex',
                            flexDirection:'column',
                            msFlexDirection:'column',
                            position:'relative',
                            marginLeft:'25px'
                        }}
                    >
                        {this.renderMenuItem(devTypeEnum.hdmi, lang.getLang('HDMI Audio output'))}
                        {this.renderMenuItem(devTypeEnum.hdPlayer, lang.getLang('HD player'))}
                        {this.renderMenuItem(devTypeEnum.analog, lang.getLang('Audio output'))}
                        {this.renderMenuItem(devTypeEnum.usb, lang.getLang('USB'))}
                        {this.renderMenuItem(devTypeEnum.bluetooth, lang.getLang('Bluetooth'))}
                        {this.renderMenuItem(devTypeEnum.dlna, 'DLNA')}
                        {this.renderMenuItem(devTypeEnum.chromecast, 'Chromecast')}
                        {this.renderMenuItem(devTypeEnum.airPlay, 'AirPlay')}
                    </div>

                    <div 
                        style={{
                            display:'flex',
                            justifyContent:'center',
                            msFlexPack: 'center',
                            width: 'calc(100% - 195px)'
                        }}
                    >
                        {this.renderContent()}
                    </div>
                </div>

                {this.state.ifShowHdLogin ? <HDSLoginPanel backFunc={this.showHdLogin.bind(this)} /> : null}

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

const devIcon = {
    hdmi: 'img/genius/genius_hd.svg',
    hdPlayer: 'img/genius/genius_hd.svg',
    analog: 'img/genius/genius_analog.svg',
    bluetooth: 'img/genius/genius_bluetooth.svg',
    usb: 'img/genius/genius_usb.svg',
    dlna: 'img/genius/genius_dlna.svg',
    airPlay: 'img/genius/genius_airplay.svg',
    chromecast: 'img/genius/genius_chromecast.svg'
}

const tStyle= {
    fontSize: '12px',
    color: '#FFF',
    display:'flex',
    justifyContent:'flex-start',
    alignItems: 'center',
    msFlexAlign: 'center',
    msFlexPack: 'start',
    lineHeight: '20px',
    cursor: 'default',
    animation:'fadeIn 0.8s'
};