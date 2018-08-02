import $ from 'jquery';
import * as api from '../../actions/api';
import RcSlider from 'rc-slider';
import React from 'react';
import MainStore from '../../stores/MainStore';
import * as MainActions from '../../actions/MainActions';
import * as CommonActions from "../../actions/CommonActions";
import Bootstrap from "bootstrap";
import { lang } from '../MultiLanguage/MultiLanguage';
import _ from 'lodash';
import FontAwesome from 'react-fontawesome';


export default class MoreMenuDevice extends React.Component {

  /**
   * Constructor
   */

    constructor(props) {
        super(props);

        this.state = {
            status: this.props.status,
            deviceInfo: this.props.deviceInfo,
            allDevices: null,
            cStyle: this.props.cStyle,
        };
    }

  /**
   * Lifecycle Methods
   */

    componentWillReceiveProps(nextProps) {
        this.setState({
            status: nextProps.status,
            deviceInfo: nextProps.deviceInfo,
            cStyle: nextProps.cStyle,
        });
    }

    componentDidMount() {
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    toogleDeviceInfo() {
        MainActions.toogleDeviceInfo(this.state.deviceInfo);
    }

    tooglePortLocation(e) {
        let rstName;
        let devName = this.state.deviceInfo.name
        if (this.state.deviceInfo.type === "HDPLAYER")
        {
            if (devName.indexOf('HD Player HDMI-A') > -1) { //For X73
                switch (devName) {
                    case "HD Player HDMI-A-0":
                        rstName = "HDMI 1";
                        break;
                    case "HD Player HDMI-A-1":
                        rstName = "HDMI 2";
                        break;
                    case "HD Player HDMI-A-2":
                        rstName = "HDMI 3";
                        break;
                }
            } else {
                switch (devName) {
                    case "HD Player HDMI1":
                        rstName = "HDMI 1";
                        break;
                    case "HD Player HDMI2":
                        rstName = "HDMI 2";
                        break;
                    case "HD Player HDMI3":
                        rstName = "HDMI 3";
                        break;
                }
            }
            
        } else if (this.state.deviceInfo.type === "HDMI") {
            if (devName.indexOf('HDA ATI HDMI') > -1) { //For X73
                let last6String = devName.substr(devName.length - 6);
                switch (last6String) {
                    case "HDMI 0":
                        rstName = "HDMI 1";
                        break;
                    case "HDMI 1":
                        rstName = "HDMI 2";
                        break;
                    case "HDMI 2":
                        rstName = "HDMI 3";
                        break;
                }
            } else {
                rstName = devName;
            }
        }
        MainActions.tooglePortLocation(rstName, e.clientX, e.clientY);
    }

    togglePopMsg(func1, targetInUseApp) {
		var self = this;
        var msg = lang.getLang('Msg19');
        var res = msg.replace("%user",targetInUseApp);
        CommonActions.toggleMsgPopup(
            true, 
            'info',
            res,
            'Both', 
            lang.getLang('Yes'), 
            lang.getLang('No'),
            function(){
                CommonActions.toggleMsgPopup(false);
                func1();
            },
            function(){
                CommonActions.toggleMsgPopup(false);
            },
        );
    }
    
    toggleOkPopMsg(pMsg) {
        let msg = pMsg;
        CommonActions.toggleMsgPopup(
            true, 
            'info',
            msg,
            'Y', 
            lang.getLang('OK'),
            'No',
            function(){
              CommonActions.toggleMsgPopup(false);
              //func1();
            },
            function(){
              CommonActions.toggleMsgPopup(false);
            }
        );
    }
    
    toggleYesNoDialog(func1,func2,pMsg) {
        let msg = pMsg;
        CommonActions.toggleMsgPopup(
            true, 
            'info',
            msg,
            'Both', 
            lang.getLang('Yes'), 
            lang.getLang('No'),
            function(){
                CommonActions.toggleMsgPopup(false);
                func1();
            },
            function(){
                CommonActions.toggleMsgPopup(false);
                func2();
            }
        );
    }

    getNameHandle(obj) {
        let r = '';
        let nickname = obj.nickname;
        let name = obj.name;
        if (nickname.trim() !== '') {
          r = obj.nickname
        } else {
          r = obj.name;
        }
        return r;
      }

    dropHdPlayerFunc(pObj) {
        let targetDevObj = pObj;
        let curDevId = this.state.deviceInfo.id;
        let fromListTitle = this.state.deviceInfo.list_title;
        //MainActions.stopDevice(targetDevObj.id);
        MainActions.switchPlaySend(curDevId, targetDevObj.id, fromListTitle);
        setTimeout(
            function() {
                let notyMsg = lang.getLang('NotificationMsg02');
                notyMsg = notyMsg.replace('%device(A)', this.getNameHandle(this.state.deviceInfo));
                notyMsg = notyMsg.replace('%device(B)', this.getNameHandle(targetDevObj));
                MainActions.switchPlay(curDevId, targetDevObj.id, fromListTitle);
                MainActions.pushNotification(notyMsg);
            }.bind(this)
            ,4000
        );
    }

    dropHdPlayerHDMIAudioInUseFunc(pObj, pHDMIAudioDev) {
        let targetDevObj = pObj;
        let curDevId = this.state.deviceInfo.id;
        let fromListTitle = this.state.deviceInfo.list_title;
        //MainActions.stopDevice(targetDevObj.id);
        MainActions.switchPlaySend(curDevId, targetDevObj.id, fromListTitle);
        setTimeout(
            function() {
                MainActions.stopDevice(pHDMIAudioDev.id);
                let notyMsg = lang.getLang('NotificationMsg02');
                notyMsg = notyMsg.replace('%device(A)', this.getNameHandle(this.state.deviceInfo));
                notyMsg = notyMsg.replace('%device(B)', this.getNameHandle(targetDevObj));
                MainActions.switchPlay(curDevId, targetDevObj.id, fromListTitle);
                MainActions.pushNotification(notyMsg);
            }.bind(this)
            ,4000
        );
    }

    onClickCTOhandle(targetDevObj) {
        // Handle Streaming to HDMI Audio
        if (targetDevObj.type === 'HDMI') {
            if (targetDevObj.inuse_apps.indexOf('HD Player') >= 0) {
                let str = lang.getLang('MsgA3');
                str = str.replace(/%app_name/g, targetDevObj.inuse_apps);
                str = str.replace('%device_name', this.getNameHandle(targetDevObj));
                let msg = str;
                this.toggleOkPopMsg(msg);
                return;
            } else if (targetDevObj.inuse_apps.indexOf('HD Station') >= 0) {
                let msg = lang.getLang('MsgA4');
                this.toggleOkPopMsg(msg);
                return;
            } else if (targetDevObj.inuse_apps.indexOf('OceanKTV') >= 0) {
                let msg = lang.getLang('Msg11') + ' ' + lang.getLang('Msg12');
                this.toggleOkPopMsg(msg);
                return;
            } else if (targetDevObj.connected === '' && !targetDevObj.inuse_apps) {
                let str = lang.getLang('MsgA1');
                let msg = str.replace('%device_name', this.getNameHandle(targetDevObj));
                let curDevId = this.state.deviceInfo.id;
                let fromListTitle = this.state.deviceInfo.list_title;
                let notyMsg = lang.getLang('NotificationMsg02');
                notyMsg = notyMsg.replace('%device(A)', this.getNameHandle(this.state.deviceInfo));
                notyMsg = notyMsg.replace('%device(B)', this.getNameHandle(targetDevObj));
                
                this.toggleYesNoDialog(
                    ()=>{
                        MainActions.switchPlaySend(curDevId, targetDevObj.id, fromListTitle);
                        MainActions.switchPlay(curDevId, targetDevObj.id, fromListTitle);
                        MainActions.pushNotification(notyMsg);
                    },
                    ()=>{ return; },
                    msg
                );
                return;
            }
        }
        // Handle Streaming to HDMI Audio End

        // Handle Streaming to HD Player
        if (targetDevObj.type === 'HDPLAYER') {
            let devName = targetDevObj.name;
            let devNumStr = devName.slice(devName.length - 1);
            let devByType = MainStore.getDeviceByType();
            let hdmiDevsObj = devByType.hdmiDevs;
            let hdPlayerDevsObj = devByType.hdPlayerDevs;

            if (devName.indexOf('HD Player HDMI-A') > -1) { //For X73
                switch (devName) {
                  case "HD Player HDMI-A-0":
                    devNumStr = "HDMI 0";
                    break;
                  case "HD Player HDMI-A-1":
                    devNumStr = "HDMI 1";
                    break;
                  case "HD Player HDMI-A-2":
                    devNumStr = "HDMI 2";
                    break;
                }
            }
    
            let corHdmiAudioDevAry = _.filter(
                hdmiDevsObj,
                o => { return o.name.indexOf(devNumStr) >= 0 }
            );
            let otherHdPlayerDevAry = _.filter(
                hdPlayerDevsObj,
                o => { return o.name !== devName }
            );
            if (corHdmiAudioDevAry.length > 0) {  // OceanKTV is using corresponded HDMI audio
                let corHdmiAudioDev = corHdmiAudioDevAry[0];
                if (corHdmiAudioDev.inuse_apps === 'OceanKTV') {
                    let str = lang.getLang('MsgA5');
                    str = str.replace('%device_name_1', this.getNameHandle(targetDevObj));
                    str = str.replace('%device_name_2', this.getNameHandle(corHdmiAudioDev));
                    let msg = str;
                    // '此時 OceanKTV 正在使用中,是否要中斷並改執行 HD Player?';
                    this.toggleYesNoDialog(
                        ()=>{ this.dropHdPlayerFunc(targetDevObj); },
                        ()=>{ return; },
                        msg
                    );
                    return;
                } else if (corHdmiAudioDev.inuse_apps.indexOf('HD Station') >= 0) {
                    let str = lang.getLang('MsgA5');
                    str = str.replace('%device_name_1', this.getNameHandle(targetDevObj));
                    str = str.replace('%device_name_2', this.getNameHandle(corHdmiAudioDev));
                    let msg = str;
                    // '此時 HD Station 應用程式正在使用中,是否要中斷並改執行 HD Player?';
                    this.toggleYesNoDialog(
                        ()=>{ this.dropHdPlayerFunc(targetDevObj); },
                        ()=>{ return; },
                        msg
                    );
                    return;
                } else if (corHdmiAudioDev.inuse_apps !== '') {
                    let str = lang.getLang('MsgA2');
                    str = str.replace('%device_name', this.getNameHandle(corHdmiAudioDev));
                    let msg = str;
                    //let msg = '此時 HDMI Audio 正在使用中,是否要中斷並改執行 HD Player?';
                    this.toggleYesNoDialog(
                        ()=>{ this.dropHdPlayerHDMIAudioInUseFunc(targetDevObj, corHdmiAudioDev); },
                        ()=>{ return; },
                        msg
                    );
                    return;
                }
            } else if (otherHdPlayerDevAry.length > 0) { // Other HD Player devices is in use
                let inUseDevAry = _.filter(
                  otherHdPlayerDevAry,
                  o => { return o.inuse_apps !== '' }
                );
                if (inUseDevAry.length > 0) {
                    let inUseDev = inUseDevAry[0];
                    let user = inUseDev.play_owner;
                    let name = inUseDev.name;
                    let str = lang.getLang('MsgA2');
                    let msg = str.replace('%device_name', this.getNameHandle(inUseDev));
                    // '此串流將會取代正在由' + user + '使用中的' + name + '，您確定要繼續播放嗎?';
                    this.toggleYesNoDialog(
                        ()=>{ this.dropHdPlayerFunc(targetDevObj); },
                        ()=>{ return; },
                        msg
                    );
                    return;
                }
            }
        }
        // Handle Streaming to HD Player End

        if (targetDevObj.inuse_apps) { //**** Target device is streming now  */
            this.togglePopMsg(
                ()=>{
                    let curDevId = this.state.deviceInfo.id;
                    let fromListTitle = this.state.deviceInfo.list_title;
                    MainActions.stopDevice(targetDevObj.id);
                    MainActions.switchPlaySend(curDevId, targetDevObj.id, fromListTitle);
                    setTimeout(function() {
                        let notyMsg = lang.getLang('NotificationMsg02');
                        notyMsg = notyMsg.replace('%device(A)', this.getNameHandle(this.state.deviceInfo));
                        notyMsg = notyMsg.replace('%device(B)', this.getNameHandle(targetDevObj));
                        MainActions.switchPlay(curDevId, targetDevObj.id, fromListTitle);
                        MainActions.pushNotification(notyMsg);
                    }.bind(this), 4000);
                    
                },
                targetDevObj.inuse_apps
            );
        } else {
            let curDevId = this.state.deviceInfo.id;
            let fromListTitle = this.state.deviceInfo.list_title;
            let notyMsg = lang.getLang('NotificationMsg02');
            notyMsg = notyMsg.replace('%device(A)', this.getNameHandle(this.state.deviceInfo));
            notyMsg = notyMsg.replace('%device(B)', this.getNameHandle(targetDevObj));

            MainActions.switchPlaySend(curDevId, targetDevObj.id, fromListTitle);
            MainActions.switchPlay(curDevId, targetDevObj.id, fromListTitle);
            MainActions.pushNotification(notyMsg);
        }
    }

    handleLi(device) {
        var tmp;
        let i = Math.random();
        if (device.type == this.state.deviceInfo.type && device.id == this.state.deviceInfo.id) {
            tmp = (
                    <li key={i+999}>
                        <a
                            style={{...style.aStyle, ...style.aStyleSto, color:'#29E1FA'}}
                            data-tip={device.name}
                        >
                            <FontAwesome name='check' style={{fontSize:'12px',color:'#29E1FA',marginRight:'10px'}} />
                            {device.name}
                        </a>
                    </li>
            );
        } else {
            if (device.play_state == "PLAY" || device.inuse_apps != "") {
                tmp = (
                    <li key={i+999}>
                        <a
                            style={{...style.aStyle, ...style.aStyleSto, color:'#29E1FA'}}
                            onClick={this.onClickCTOhandle.bind(this,device)}
                            data-tip={device.name}
                        >
                            {device.name}
                        </a>
                    </li>
                );
            } else {
                tmp = (
                    <li key={i+999}>
                        <a
                            style={{...style.aStyle, ...style.aStyleSto}}
                            onClick={this.onClickCTOhandle.bind(this,device)}
                            data-tip={device.name}
                        >
                            {device.name}
                        </a>
                    </li>
                );
            } 
        }

        return tmp;
    }

    handleLi2(deviceAry) {
        let devNum = deviceAry.length;
        let tmpAry = [];
        if (devNum==0){
            return tmpAry;
        }
        
        deviceAry.forEach((device,i)=>{
            var tmp = this.handleLi(device);;
            tmpAry.push(tmp);
        })
        return tmpAry;
    }

    cumulativeOffset(element) {
        var top = 0, left = 0;
        do {
            top += element.offsetTop  || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while(element);

        return {
            top: top,
            left: left
        };
    }

    getAllDevices(e) {
        //let offsetLeftGG = this.cumulativeOffset(e.target);
        let offsetLeftGG = e.target.getBoundingClientRect().left;
        const minusNum = 550;
        //console.log('cumulativeOffset: ',offsetLeftGG);
        //if (offsetLeftGG.left > 1100 && MainStore.isShowMediaPlaylist() === true) {
        let ifShowMPLdiff = MainStore.isShowMediaPlaylist() ? 320 : 0;
        let diff = document.documentElement.clientWidth - offsetLeftGG - ifShowMPLdiff;
        if (diff > 0 && diff < minusNum) {
            let adjValue = minusNum - diff > 250 ? -250 : -(minusNum - diff);
            e.target.nextElementSibling.style.left = adjValue + 'px';
        } else {
            e.target.nextElementSibling.style.left = '-70px';
        }
        if (this.props.way !== 1) {
            let diffHeight = document.documentElement.clientHeight;
            if (diffHeight < 800) {
                let oriTop = e.target.nextElementSibling.style.top;
                e.target.nextElementSibling.style.top = '-120px';
            } else {
                e.target.nextElementSibling.style.top = '';
            }
        }

        let tmpDevAry = _.cloneDeep(MainStore.getAllDevices());

        for (let i=0; i<tmpDevAry.length; i++) {
            if (tmpDevAry[i].type === 'HDPLAYER' && !this.getIfHdStationLogin()) {
                tmpDevAry.splice(i,1);
            }
        }
        
        this.setState({
            allDevices: tmpDevAry
        },()=>{this.forceUpdate();});
    }

    getIfHdStationLogin() {
        if (MainStore.getCheckDep()!==null) {
            let itemsAry = MainStore.getCheckDep().items;
            let hdStationItem={};
            itemsAry.forEach(function(item,i){
                if (item.name == "HD_Station"){
                    hdStationItem = item;
                }
            });
            return +hdStationItem.login===1;
        } else {
            return false;
        }
    }

    deletePlayListClick() {
        let curDevId = this.state.deviceInfo.id;
        MainActions.deletePlayList(curDevId);
    }

    renderMoreMenu() {
        var tmpAllDevices = this.state.allDevices;

        let devHDMI = _.filter(tmpAllDevices, {type: 'HDMI'});
        let devHDPlayer = _.filter(tmpAllDevices, {type: 'HDPLAYER'});
        let devANALOG = _.filter(tmpAllDevices, {type: 'ANALOG'});
        let devUSB = _.filter(tmpAllDevices, {type: 'USB'});
        let devBluetooth = _.filter(tmpAllDevices, {type: 'Bluetooth', connected: 'Yes'});
        let devnetwork = _.filter(tmpAllDevices, {type: 'network'});
        //console.log(devHDMI);


        //******* HDMI device *******//
        let devHDMIAry = [];

        devHDMI.forEach((device,i)=>{
            var tmp;
            let cHDPLAYER = null;
            let levelText = device.name;
            if (device.name.indexOf('HDA ATI HDMI') > -1) { //For X73
                let last6String = levelText.substr(levelText.length - 6);
                switch (last6String) {
                    case 'HDMI 0':
                        devHDPlayer.forEach((device,i)=>{
                            cHDPLAYER = device.name == 'HD Player HDMI-A-0' ? device : cHDPLAYER;
                        })
                        break;
                    case 'HDMI 1':
                        devHDPlayer.forEach((device,i)=>{
                            cHDPLAYER = device.name == 'HD Player HDMI-A-1' ? device : cHDPLAYER;
                        })
                        break;
                    case 'HDMI 2':
                        devHDPlayer.forEach((device,i)=>{
                            cHDPLAYER = device.name == 'HD Player HDMI-A-2' ? device : cHDPLAYER;
                        })
                        break;
                }
            } else {
                switch (device.name) {
                    case 'HDMI 1':
                        devHDPlayer.forEach((device,i)=>{
                            cHDPLAYER = device.name == 'HD Player HDMI1' ? device : cHDPLAYER;
                        })
                        break;
                    case 'HDMI 2':
                        devHDPlayer.forEach((device,i)=>{
                            cHDPLAYER = device.name == 'HD Player HDMI2' ? device : cHDPLAYER;
                        })
                        break;
                    case 'HDMI 3':
                        devHDPlayer.forEach((device,i)=>{
                            cHDPLAYER = device.name == 'HD Player HDMI3' ? device : cHDPLAYER;
                        })
                        break;
                }
            }
            
            
            let hAudioOutput = this.handleLi(device);
            let hHDPlayer = cHDPLAYER ? this.handleLi(cHDPLAYER) : null;
            let j = Math.random();
            /*devHDMIAry.push(
                <li key={j} class="dropdown-submenu">
                    <a style={{...style.aStyle}}>
                        {levelText}
                        <img style={style.angleImg} src='img/control_btn/arrow_r_1.svg' />
                    </a>

                    <ul class="dropdown-menu deviceMoreMenu" style={{...style.ulStyle,right:'100%',left:'auto',top:'0'}}>
                        {hAudioOutput}
                        {hHDPlayer}
                    </ul>
                </li>
            );*/
            devHDMIAry.push(hAudioOutput);
            if (hHDPlayer !== null) {
                devHDMIAry.push(hHDPlayer);
            }
            devHDMIAry.push(<li key={j+79979} class="divider" style={{margin:'5px 0'}}></li>);
        })
        /*
        if (devANALOG.length + devUSB.length + devnetwork.length > 0 && devHDMI.length > 0) {
            devHDMIAry.push(<li key={j+937} class="divider" style={{margin:'5px 0'}}></li>);
        }*/
        //******* HDMI device END *******//

        let j = Math.random();
        devANALOG = this.handleLi2(devANALOG);
        if (devUSB.length + devnetwork.length + devBluetooth.length > 0 && devANALOG.length > 0) {
            devANALOG.push(<li key={j+938} class="divider" style={{margin:'5px 0'}}></li>);
        }

        devUSB = this.handleLi2(devUSB);
        if ( devnetwork.length + devBluetooth.length > 0 && devUSB.length > 0) {
            devUSB.push(<li key={j+939} class="divider" style={{margin:'5px 0'}}></li>);
        }

        devBluetooth = this.handleLi2(devBluetooth);
        if (devnetwork.length > 0 && devBluetooth.length > 0) {
            devBluetooth.push(<li key={j+940} class="divider" style={{margin:'2px 0'}}></li>);
        }
        
        devnetwork = this.handleLi2(devnetwork);

        var ifPortLocation = this.state.deviceInfo.type == "HDMI" || this.state.deviceInfo.type === "HDPLAYER";
        var ifPLSvg = MainStore.getPlSvg();
        ifPortLocation = ifPortLocation & ifPLSvg;
        
        let wayTop = this.props.way === 1 ? {top: '-120px'} : null;

        /* Detect Browsers */
        let isIE = /*@cc_on!@*/false || !!document.documentMode;
        let isEdge = !isIE && !!window.StyleMedia;
        let ua = navigator.userAgent.toLowerCase(); 
        let isFirefox = ua.indexOf('firefox') > -1;
        let isChrome = false;
        if (ua.indexOf('safari') != -1) { 
          if (ua.indexOf('chrome') > -1) {
            // Chrome
            isChrome = true;
          } else {
            // Safari
          }
        }
        /* Detect Browsers */

        let bstyle = this.props.type === 'Simple' ? {verticalAlign:'baseline'} : null;

        return (
            <div class="btn-group dropdown" style={{marginLeft:'20px',...this.state.cStyle}}>
                <button
                    key="btnMore"
                    className="btnMoreThumb"
                    style={bstyle}
                    id="dLabel989"
                    role="button"
                    onClick = {this.getAllDevices.bind(this)}
                    data-toggle="dropdown"
                    data-tip={lang.getLang('More')}
                >
                </button>

                <ul
                    class="dropdown-menu multi-level deviceMoreMenu"
                    style={{...style.ulStyle,...wayTop}}
                    role="menu"
                    aria-labelledby="dropdownMenu"
                >
                    <li class="dropdown-submenu">
                        <a
                            style={{...style.aStyle, ...style.longTextAStyle}}
                            data-tip={lang.getLang('Stream to another device')}
                        >
                            {lang.getLang('Stream to another device')} 
                            <img style={style.angleImg} src='img/control_btn/arrow_r_1.svg' />
                        </a>

                        <ul class="dropdown-menu deviceMoreMenu scrollable-menu-more" style={style.ulStyle}>
                            {devHDMIAry}
                            {devANALOG}
                            {devUSB}
                            {devBluetooth}
                            {devnetwork}
                        </ul>
                    </li>
                    
                    <li>
                        <a style={{...style.aStyle}} onClick={this.toogleDeviceInfo.bind(this)}>
                            {lang.getLang('Device information')}
                        </a>
                    </li>
                    {
                        ifPortLocation ?
                        <li>
                            <a style={{...style.aStyle}} onClick={this.tooglePortLocation.bind(this)}>
                                {lang.getLang('Port location')}
                            </a>
                        </li>
                        :
                        null
                    }
                    {/*<li>
                        <a style={{...style.aStyle}} onClick={this.deletePlayListClick.bind(this)}>
                            {lang.getLang('Clear playlist')}
                        </a>
                    </li> */}
                    
                    
                </ul>
            </div>
        );
    }

    renderMoreMenuNoStream() {
        var ifPortLocation = this.state.deviceInfo.type == "HDMI" || this.state.deviceInfo.type == "HDPLAYER" ? true : false;
        var ifPLSvg = MainStore.getPlSvg();
        ifPortLocation = ifPortLocation & ifPLSvg;
        let wayTop = this.props.way === 1 ? {top: '-90px'} : null;
        return (
            <div class="btn-group dropdown" style={{marginLeft:'20px',...this.state.cStyle}}>
                <button
                    key="btnMore"
                    style={{verticalAlign:'baseline'}}
                    className="btnMoreThumb"
                    id="dLabel989"
                    role="button"
                    data-toggle="dropdown"
                    data-tip={lang.getLang('More')}
                    onClick={this.getAllDevices.bind(this)}
                >
                </button>

                <ul
                    class="dropdown-menu multi-level deviceMoreMenu"
                    style={{...style.ulStyle,...wayTop}}
                    role="menu"
                    aria-labelledby="dropdownMenu"
                >
                    <li class="dropdown-submenu disabled">
                        <a
                            style={{...style.aStyle,color:'rgba(255,255,255,0.4)',...style.longTextAStyle}}
                            data-tip={lang.getLang('Stream to another device')}
                        >
                            {lang.getLang('Stream to another device')}
                        </a>
                    </li>
                    
                    <li><a style={{...style.aStyle}} onClick={this.toogleDeviceInfo.bind(this)}>{lang.getLang('Device information')}</a></li>
                    {
                        ifPortLocation ?
                        <li><a style={{...style.aStyle}} onClick={this.tooglePortLocation.bind(this)}>{lang.getLang('Port location')}</a></li>
                        :
                        null
                    }
                    
                </ul>
            </div>
        );
    }

  /**
   * Render
   */

    render() {
        var rst;
        switch (this.state.status) {
            case "OCEANKTV":
                rst = this.renderMoreMenuNoStream();
                break;
            case "NOSTREAM":
                rst = this.renderMoreMenuNoStream();
                break;
            case "MUSICSTATION":
                rst = this.renderMoreMenuNoStream();
                break;
            default:
                rst = this.renderMoreMenu();
                break;
            
        }
        return rst;

    }
}

const style= {
    aStyle: {
        lineHeight:'25px',
        padding:'0 30px 0 10px',
        cursor:'pointer',
        fontSize:'14px',
        color:'#ffffff',
        position:'relative'
    },
    aStyleSto: {
        textOverflow:'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '230px',
    },
    longTextAStyle: {
        textOverflow:'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '200px',
    },
    ulStyle: {
        backgroundColor:'#4B5266',
    },
    angleImg: {
        width: '20px',
        height: '20px',
        position: 'absolute',
        right: '7px',
        top: '3px',
    }
}