import React from "react";
import MainStore from "../stores/MainStore";
import * as MainActions from "../actions/MainActions";
import DevicePanel from './RightPanel/ThumbnailView/DevicePanel';
import SimplePanel from './RightPanel/SimpleView/SimplePanel';
import NotificationSystem from 'react-notification-system';
import MediaPlaylist from './RightPanel/MediaList/MediaPlaylist';

export default class MainPanel extends React.Component {
    constructor() {
        super();
        this.refreshPage = this.refreshPage.bind(this);
        this.changeType = this.changeType.bind(this);
        this.getMode = this.getMode.bind(this);
        this.setDevices = this.setDevices.bind(this);
        this.recNotification = this.recNotification.bind(this);
        this.setDevices = this.setDevices.bind(this);

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);

        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleMouseMoveGhostDiv = this.handleMouseMoveGhostDiv.bind(this);

        this.isDown = false;
        this.isDrag = false;
        this.ghostDiv = null;

        let tmpDevByType = _.cloneDeep(MainStore.getDeviceByType());
        this.handleBtDeviceArray(tmpDevByType);
        this.handleHdDeviceArray(tmpDevByType);

        this.state = {
            type: MainStore.getType(),
            refreshFlag: false,
            mode: MainStore.getMode(),
            key: Math.random(),
            deviceByType: tmpDevByType,
            firstTimeIn: true,
            gPageX: 0,
            gPageY: 0

        }

        this._notificationSystem = null;
    }

    componentWillMount() {
        MainStore.on("chageType", this.changeType);
        MainStore.on("refreshPage", this.refreshPage);
        MainStore.on('changeMode', this.getMode);
        MainStore.on('pushNotification', this.recNotification);
        MainStore.on('updateDevice', this.setDevices);
        MainActions.getDevices2();
        MainActions.toogleLoadingMask(true);

        //window.addEventListener('mousedown',this.handleMouseDown);
        //window.addEventListener('mouseup',this.handleMouseUp);
        /*window.addEventListener('mousemove',this.handleMouseMove);
        window.addEventListener('dragstart',this.handleDragStart);
        window.addEventListener('dragend',this.handleDragEnd);
        window.addEventListener('dragover',this.handleDragOver);*/
    }

    componentDidMount() {
        MainActions.getUserData("QS");
        MainActions.getBtAdapterScan();
    }

    componentWillUnmount() {
        MainStore.removeListener("refreshPage", this.refreshPage);
        MainStore.removeListener("chageType", this.changeType);
        MainStore.removeListener("changeMode", this.getMode);
        MainStore.removeListener('pushNotification', this.recNotification);
        MainStore.removeListener('updateDevice', this.setDevices);
    }

    // ******* Handle Mouse Move Test *******

    handleMouseMove(e) {
        
        if (this.isDown) {
            console.log('handleMouseMove',e.pageY, e.pageX);
            this.setState({
                gPageX: e.pageX,
                gPageY: e.pageY
            })
        }
    }

    handleMouseDown(e) {
        console.log('handleMouseDown',e.pageY, e.pageX);
        this.isDown = true;
        /*if (this.isDown && this.isDrag) {
            e.preventDefault();
        }*/
    }

    handleMouseUp(e) {
        console.log('handleMouseUp',e.pageY, e.pageX);
        this.isDown = false;
    }

    handleMouseMoveGhostDiv(e) {
        console.log('handleMouseMoveGhostDiv',e.pageY, e.pageX);
    }

    handleDragStart(e) {
        this.isDrag = true;
        console.log('handleDragStart',e.pageY, e.pageX);
    }

    handleDragEnd(e) {
        this.isDrag = false;
        console.log('handleDragEnd',e.pageY, e.pageX);

    }

    handleDragOver(e) {
        if (this.isDrag) {
            console.log('handleDragOver',e.pageY, e.pageX);
            this.ghostDiv.style.top = e.pageY + 'px';
            this.ghostDiv.style.left = e.pageX + 'px';
            //this.ghostDiv.addEventListener('mousemove',this.handleMouseMoveGhostDiv);
        }
    }

    // ******* Handle Mouse Move Test End *******

    setDevices() {
        if (this.state.firstTimeIn){
          window.setTimeout(
            ()=>{MainActions.toogleLoadingMask(false);}
          )
          this.setState({
            firstTimeIn: false
          });
        }
    
        let tmpDevByType = _.cloneDeep(MainStore.getDeviceByType());
        this.handleBtDeviceArray(tmpDevByType);
        this.handleHdDeviceArray(tmpDevByType);

        this.setState({
          deviceByType: tmpDevByType,
        });
    }

    handleBtDeviceArray(argAry) {
        let btDevArray = argAry.bluetoothDevs;
        for (let i = btDevArray.length - 1; i >= 0; i--) {
            if (btDevArray[i].connected !== 'Yes') {
                btDevArray.splice(i,1);
            }
        }
    }

    handleHdDeviceArray(argAry) {
        let hdDevArray = argAry.hdPlayerDevs;
        if (MainStore.getCheckDep()!==null) {
            let itemsAry = MainStore.getCheckDep().items;
            let hdStationItem={};
            itemsAry.forEach(function(item,i){
                if (item.name == "HD_Station"){
                    hdStationItem = item;
                }
            });
            for (let i = hdDevArray.length - 1; i >= 0; i--) {
                if (+hdStationItem.login !== 1)
                    hdDevArray.splice(i,1);
            }
        } else {
            for (let i = hdDevArray.length - 1; i >= 0; i--) {
                hdDevArray.splice(i,1);
            }
        }
    }

    refreshPage() {
        setTimeout(()=>{
            this.setState({
                key: Math.random(),
                refreshFlag: true,
            });
            MainActions.toogleLoadingMask(true);
        });
        
        setTimeout(()=>{
            this.setState({
                //key: Math.random(),
                refreshFlag: false,
            });
            MainActions.toogleLoadingMask(false);
        },2000);
    }

    changeType() {
        this.setState({
            type: MainStore.getType()
        });
    }

    getMode() {
        this.setState({
            mode: MainStore.getMode()
        });
    }

    renderViewByMode() {
        const domObj = {
            'thumbnail': <DevicePanel deviceByType={this.state.deviceByType} type={this.state.type} />,
            'simple': <SimplePanel deviceByType={this.state.deviceByType} type={this.state.type} />
        }
        return this.state.mode in domObj ? domObj[this.state.mode] : null;
    }

    _addNotification(event) {
        event.preventDefault();
        this._notificationSystem.addNotification({
            message: 'Notification message',
            level: 'success'
        });
    }

    recNotification(msg) {
        try {
            this._notificationSystem.addNotification({
                message: msg,
                level: 'info',
                position: 'tc',
                dismissible: true,
                autoDismiss: 5,
            });
        } catch(e) {
            console.log(e);
        }
    }

    renderRefreshLoadingMask() {
        let o = this.state.refreshFlag ? 1 : 0;
        let v = this.state.refreshFlag ? 'visible' : 'hidden';
        const dStyle = {
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: '88px',
            left: '0',
            background: '#1F2740',
            transition: 'all ease 0.3s',
            opacity: o,
            visibility: v,
        };
        return (<div style={dStyle}></div>);
    }

    render() {
        
        //this.setType('HDMI');
        /*return this.state.refreshFlag === true
        ? (<div style={divMainPanel}></div>)
        : (*/
        return (
            <div style={divMainPanel}>
                {this.renderViewByMode()}
                <MediaPlaylist key={ this.state.key } />
                <NotificationSystem ref={(obj)=>{this._notificationSystem = obj}} style={notyStyle} />
                {this.renderRefreshLoadingMask()}
                {/*<button onClick={this._addNotification.bind(this)} style={{position:'absolute',top:'120px'}}>Add notification</button>*/}
                {/*<div style={{position:'absolute'}} ref={(obj)=>{this.ghostDiv = obj}}>
                    <div class="info">
                        <img src="https://pbs.twimg.com/profile_images/1498221863/Jodis_Gifts_logo_hi_res_normal.jpg" alt="info" />
                    </div>
                </div>*/}
            </div>
        );
    }
};

const divMainPanel = {
    height: 'calc(100% - 94px)',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    msFlexPack: 'center',
    background: '#1F2740',
};

const defaultColors = {
    success: {
        rgb: '94, 164, 0',
        hex: '#5ea400'
    },
    error: {
        rgb: '236, 61, 61',
        hex: '#ec3d3d'
    },
    warning: {
        rgb: '235, 173, 23',
        hex: '#ebad1a'
    },
    info: {
        rgb: '54, 156, 199',
        hex: '#369cc7'
    }
};

const defaultShadowOpacity = '0.9';
const defaultWidth = 360;

const notyStyle = {
    NotificationItem: { // Override the notification item
        DefaultStyle: { // Applied to every notification, regardless of the notification level
            margin: '5px 0 0',
            padding: '10px 15px'
        },

        success: { // Applied only to the success notification item
            color: 'red'
        },

        info: {
            //borderTop: '2px solid ' + defaultColors.info.hex,
            border: '0px solid #FFFFFF',
            backgroundColor: '#0373DD',
            color: '#FFFFFF',
            borderRadius: '5px',
            width: 'fit-content',
            minWidth: '240px',
            /*WebkitBoxShadow: '0 0 1px rgba(' + defaultColors.info.rgb + ',' + defaultShadowOpacity + ')',
            MozBoxShadow: '0 0 1px rgba(' + defaultColors.info.rgb + ',' + defaultShadowOpacity + ')',
            boxShadow: '0 0 1px rgba(' + defaultColors.info.rgb + ',' + defaultShadowOpacity + ')'*/
        }
    },

    Wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        msFlexAlign: 'center',
        msFlexPack: 'center',
        /* width: 100%; */
        height: '50px',
        top: '54px',
        position: 'absolute',
    },

    Containers: {
        DefaultStyle: {
            fontFamily: 'inherit',
            position: 'fixed',
            /*width: defaultWidth,*/
            padding: '0 10px 10px 10px',
            zIndex: 9998,
            WebkitBoxSizing: 'border-box',
            MozBoxSizing: 'border-box',
            boxSizing: 'border-box',
            height: 'auto',
        },
        tc: {
            top: '89px',
            bottom: 'auto',
            margin: '0 auto',
            width: 'auto',
            left: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            msFlexAlign: 'center',
            msFlexPack: 'center',
            flexDirection: 'column',
            msFlexDirection:'column',
        },

    },

  MessageWrapper: {
    DefaultStyle: {
      margin: 0,
      padding: 0,
      textAlign: 'center'
    }
  },

  Dismiss: {
    DefaultStyle: {
      fontFamily: 'Arial',
      fontSize: '0px',
      position: 'absolute',
      top: '4px',
      right: '5px',
      lineHeight: '15px',
      backgroundColor: '#dededf',
      color: '#ffffff',
      borderRadius: '50%',
      width: '14px',
      height: '14px',
      fontWeight: 'normal',
      textAlign: 'center'
    },

    success: {
      color: '#f0f5ea',
      backgroundColor: '#b0ca92'
    },

    error: {
      color: '#f4e9e9',
      backgroundColor: '#e4bebe'
    },

    warning: {
      color: '#f9f6f0',
      backgroundColor: '#e1cfac'
    },

    info: {
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0)'
    }
  },
}
