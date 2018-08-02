import React from "react";
import 'css/BluetoothPanel.css';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import DeviceItem from './DeviceItem';
import compare from 'node-version-compare';

export default class BluetoothPanel extends React.Component {
    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
        this.getBtDevices = this.getBtDevices.bind(this);
        this.getBtAdapterScanDone = this.getBtAdapterScanDone.bind(this);
        this.doBtPairDone = this.doBtPairDone.bind(this);
        this.doBtRemoveDone = this.doBtRemoveDone.bind(this);
        this.doBtConnectDone = this.doBtConnectDone.bind(this);
        this.getDetectBtDevicesMd = this.getDetectBtDevicesMd.bind(this);
        this.getCheckDepDone = this.getCheckDepDone.bind(this);
        this.getBtScanFail = this.getBtScanFail.bind(this);

        this.state = {
            isOpenPanel: false,
            isEnter: false,
            isScanning: false,
            btDevices: [],
            btDevicesMd: [],
            isAdapter: null,
            isMusicStationInstall: null,
        };
        
        this.detectBtFirstTime = false;
    }

    componentWillMount() {
        MainStore.on('getBtScanDone', this.getBtDevices);
        MainStore.on('getBtAdapterScanDone', this.getBtAdapterScanDone);
        MainStore.on('doBtPairDone', this.doBtPairDone);
        MainStore.on('doBtRemoveDone', this.doBtRemoveDone);
        MainStore.on('doBtConnectDone', this.doBtConnectDone);
        MainStore.on('getDetectBtDevicesMd', this.getDetectBtDevicesMd);
        MainStore.on("getCheckDepDone", this.getCheckDepDone);

        MainStore.on('getBtScanFail', this.getBtScanFail);

        
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClick, false);
        let ifMusicStation = this.checkStationDep("MusicStation");
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClick, false);

        MainStore.removeListener('getBtScanDone', this.getBtDevices);
        MainStore.removeListener('getBtAdapterScanDone', this.getBtAdapterScanDone);
        MainStore.removeListener('doBtPairDone', this.doBtPairDone);
        MainStore.removeListener('doBtRemoveDone', this.doBtRemoveDone);
        MainStore.removeListener('doBtConnectDone', this.doBtConnectDone);
        MainStore.removeListener('getDetectBtDevicesMd', this.getDetectBtDevicesMd);
        MainStore.removeListener("getCheckDepDone", this.getCheckDepDone);

        MainStore.removeListener('getBtScanFail', this.getBtScanFail);
    }

    getCheckDepDone() {
        let ifMusicStation = this.checkStationDep("MusicStation");
        if (!ifMusicStation && this.state.isMusicStationInstall !== ifMusicStation) {
            this.setState({
                isOpenPanel: true
            },()=>{
                setTimeout(()=>{
                    this.setState({
                        isOpenPanel: false
                    })
                },5000)
            });
        }
        this.setState({
            isMusicStationInstall: ifMusicStation
        })
    }
    
    openStationInner(v) {
        var obj = MainStore.getCheckDep();
        var itemsAry = obj.items;
        var availableFlag = false;

        switch(v) {
            case "Music Station":{
                itemsAry.forEach(function(item,i){
                if (item.name == "MusicStation"){
                    if (item.enabled == "1" && item.installed == "1")
                        availableFlag = true;
                        return false;
                    }
                })
                if (availableFlag) {
                    window.qMessageClient.fn.openApp({appId:'musicStation',config:{path:'/test'}});
                } else {
                    window.qMessageClient.fn.openApp({
                        appId:'qpkg',
                        config:{
                        config:{
                            install : 'musicStation',
                            all : true,
                            runMore:true
                        }
                    }});
                }
                break;
            }
        }
    }

    getDetectBtDevicesMd() {
        //console.log('getDetectBtDevices');
        if (!this.detectBtFirstTime) {
            this.setState({
                btDevices: MainStore.getBtDevicesMd(),
            })
            this.detectBtFirstTime = true;
        }

        this.setState({
            btDevicesMd: MainStore.getBtDevicesMd()
        })

        /*let curBtDevAry = this.state.btDevices;
        let btDevMd = MainStore.getBtDevicesMd();
        
        if (curBtDevAry.length === 0) {
            this.setState({
                btDevices: btDevMd,
            })
        } else {
            for (let i=0; i<curBtDevAry.length; i++) {
                for (let j=0; j<btDevMd.length; j++) {
                    if (curBtDevAry[i].id===btDevMd[j].id) {
                        curBtDevAry[i] = btDevMd[j];
                    }
                }
            }
            this.setState({
                btDevices: curBtDevAry,
            })
            console.log(curBtDevAry);
        }*/
    }

    getBtScanFail() {
        this.setState({
            isScanning: false
        });
    }

    getBtDevices() {
        console.log('getBtDevices',MainStore.getBtDevices());
        this.setState({
            btDevices: MainStore.getBtDevices(),
            btDevicesMd: MainStore.getBtDevices(),
            isScanning: false
        });
    }

    doBtPairDone(devId) {
        console.log('doBtPairDone',MainStore.getBtDevices());
        this.setState({
            btDevices: MainStore.getBtDevices()
        });
    }

    doBtRemoveDone(devId) {
        console.log('doBtRemoveDone',MainStore.getBtDevices());
        this.setState({
            btDevices: MainStore.getBtDevices(),
        });
    }

    doBtConnectDone(devId) {
        console.log('doBtConnectDone',MainStore.getBtDevices());
        this.setState({
            btDevices: MainStore.getBtDevices(),
        });
    }

    getBtAdapterScanDone(adapterFlag) {
        if (!adapterFlag && adapterFlag !==this.state.isAdapter) {
            this.setState({
                isOpenPanel: true
            },()=>{
                setTimeout(()=>{
                    this.setState({
                        isOpenPanel: false
                    })
                },5000)
            });
        }
        this.setState({
            isAdapter: adapterFlag
        });
    }

    handleClick(e) {
        if (!this.state.isEnter) {
            this.setState({
                isOpenPanel: false
            })
        }
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
    
    checkStationVer(stationName) {
		var obj = MainStore.getCheckDep();
        if (obj==null) {return false;}
		var itemsAry = obj.items;
        var rst = false;
        let curVersion = '';
        const supportVersion = '5.0.9';
		itemsAry.forEach(function(item,i){
            if (item.name == stationName) {
                if ( +item.enabled == 1 && +item.installed == 1 ) {
                    rst = true;
                    curVersion = item.version;
                }
            }
        })
        if (rst) {
            rst = (compare(curVersion, supportVersion) >= 0);
            return rst;
        } else {
            return false;
        }
    }

    renderNoMusicStation() {
        return (
            <div
                style={{
                    height:'70px',
                    cursor:'default',
                    color:'#4C4C4C',
                    ...style.noMusicStationDiv,
                    alignItems:'center'
                }}
            >
                {lang.getLang('btPanelMsg01')}
            </div>
        )
    }

    renderNoSupportMusicStation() {
        return (
            <div
                style={{
                    height:'70px',
                    cursor:'default',
                    color:'#4C4C4C',
                    ...style.noMusicStationDiv,
                    alignItems:'center'
                }}
            >
                {lang.getLang('btPanelMsg02')}
            </div>
        )
    }

    renderInstallMusicStation() {
        var isInWindow = (window.parent == window) ? true : false;
		var str = lang.getLang('btPanelMsg03');
		var res = str.split("App Center");

        var link = isInWindow 
        ? "App Center" 
        : (<a style={{cursor:'pointer'}} onClick={this.openStationInner.bind(this,"Music Station")}>App Center</a>);

		var rst = (
            <div style={{marginTop:'10px',cursor:'default',color:'#5E5E5E',fontSize:'12px',width:'290px'}}>
				{res[0]}{link}{res[1]}
            </div>
        );

        return (
            <div style={{flexDirection:'column',msFlexDirection:'column',...style.noMusicStationDiv}}>
                <div style={{marginTop:'10px',cursor:'default',color:'#4C4C4C',fontSize:'14px',width:'290px'}}>
                    {lang.getLang('btPanelMsg04')}
                </div>
                {rst}
                <div style={{marginBottom:'10px'}}>
                    <img src='img/bt_panel/pic_musicstation.svg' style={{float:'right'}} />
                </div>
                
            </div>
        )
    }

    renderNoConnectAdapter() {
        return (
            <div 
                style={{
                    flexDirection:'column',
                    msFlexDirection:'column',
                    height:'115px',
                    ...style.noMusicStationDiv,
                    position: 'relative'
                }}
            >
                <div style={{marginTop:'10px',color:'#4C4C4C',fontSize:'14px',cursor:'default',width:'240px'}}>
                    {lang.getLang('btPanelMsg05')}
                </div>
                <div style={{marginTop:'10px',color:'#5E5E5E',fontSize:'12px',cursor:'default',width:'240px'}}>
                    {lang.getLang('btPanelMsg06')}
                </div>
                <div style={{position:'absolute', right: '0', top: '0'}}>
                    <img src='img/bt_panel/pic_connectbluetooth_2.svg' style={{width:'80px'}} />
                </div>
                <div style={{position: 'absolute', top: '20px', right: '10px'}}>
                    <img src='img/bt_panel/pic_connectbluetooth_1.svg' />
                </div>
                
            </div>
        )
    }

    renderScanning() {
        return (
            <div 
                style={{
                    ...style.noMusicStationDiv,
                    height:'70px',
                    position:'relative',
                    background: 'linear-gradient(to right,#aa69b5,#7c509a,#374368)',
                    alignItems:'center'
                }}
            >

                <div style={{color:'#FFFFFF',fontSize:'14px',cursor:'default'}}>
                    {lang.getLang('btPanelMsg07')}
                </div>

                <div 
                    style={{
                        position:'absolute',
                        height:'100%',
                        width:'66px',
                        overflow:'hidden',
                        top: '0',
                        right:'20px',
                        ...style.flexCenter
                    }}
                >
                    <div class="loader-line-mask">
                        <div class="loader-line"></div>
                    </div>
                    <img src='img/bt_panel/pic_bluetooth.svg' style={{width:'17px',height:'30px'}} />
                </div>
                
            </div>
        )
    }

    doPairCallBack(id) {

    }

    renderScanningDone() {
        let devCount = this.state.btDevices.length;
        let tmpDevicesArray = this.state.btDevices;
        let devicesItemArray = [];
        tmpDevicesArray.forEach((device,i)=>{
            let deviceMdAry = _.filter(this.state.btDevicesMd,{id:device.id});
            let deviceMd = deviceMdAry.length===0 ? null : deviceMdAry[0];
            //console.log('deviceMd',deviceMd);
            devicesItemArray.push(<DeviceItem key={device.id} devObj={device} devMd={deviceMd} />)
        });

        let searchDevCntStr = lang.getLang('btPanelMsg09');
        searchDevCntStr = searchDevCntStr.replace('$count',devCount);

        return (
            <div>
                <div style={{...style.noMusicStationDiv,
                    height:'70px',
                    position:'relative',
                    background: 'linear-gradient(to right,#aa69b5,#7c509a,#374368)',
                    flexDirection: 'column',
                    msFlexDirection:'column',
                    borderRadius: '0'
                }}>

                    <div
                        style={{
                            color:'#FFFFFF',
                            marginTop:'10px',
                            fontSize:'14px',
                            width:'265px',
                            cursor:'default',
                            textOverflow:'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            maxWidth: '250px',
                        }}
                        data-tip={lang.getLang('btPanelMsg08')}
                    >
                        {lang.getLang('btPanelMsg08')}
                    </div>
                    <div style={{color:'#FFFFFF',marginTop:'10px',fontSize:'12px',width:'265px',cursor:'default'}}>
                        {searchDevCntStr}
                    </div>

                    <div 
                        style={{
                            position:'absolute',
                            height:'100%',
                            overflow:'hidden',
                            right:'20px',
                            top: '0px',
                            ...style.flexCenter
                        }}
                    >
                        <img src='img/bt_panel/pic_bluetooth.svg' style={{width:'17px',height:'30px'}} />
                    </div>
                    
                </div>
                <div style={{borderBottomLeftRadius: '5px',borderBottomRightRadius: '5px',overflow:'hidden'}}>
                    {devicesItemArray}
                </div>
            </div>
            
        )
    }

    renderNoDetect() {
        return (
            <div style={{...style.noMusicStationDiv,
                position:'relative',
                background: 'linear-gradient(to right,#aa69b5,#7c509a,#374368)',
                flexDirection: 'column',
                msFlexDirection:'column',
                paddingBottom: '15px',
            }}>

                <div style={{color:'#FFFFFF',marginTop:'10px',fontSize:'14px',width:'calc(100% - 60px)',cursor:'default'}}>
                    {lang.getLang('No devices detected')}
                </div>
                <div style={{color:'#FFFFFF',marginTop:'10px',fontSize:'12px',width:'calc(100% - 60px)',cursor:'default'}}>
                    {lang.getLang('btPanelMsg11')}
                </div>

                <div 
                    style={{
                        position:'absolute',
                        height:'100%',
                        overflow:'hidden',
                        top: '0',
                        right:'30px',
                        ...style.flexCenter
                    }}
                >
                    <img src='img/bt_panel/pic_bluetooth.svg' style={{width:'17px',height:'30px'}} />
                </div>
                
            </div>
        )
    }

    renderScanBtn() {
        let ifMusicStation = this.checkStationDep("MusicStation");
        let ifMusicStationVer = this.checkStationVer("MusicStation");
        let scanBtn;
        if (ifMusicStation) {
            if (ifMusicStationVer) {
                if (this.state.isAdapter) {
                    if (this.state.isScanning) {
                        /*scanBtn = (
                            <button 
                                className='stdButtonBt' 
                                style={{position:'absolute',right:'15px'}} 
                                onClick={null}
                            >
                            停止掃描
                            </button>
                        );*/
                        scanBtn = (
                            <button 
                                className='stdButtonBtDis' 
                                style={{position:'absolute',top:'5px',right:'15px',...style.flexCenter}} 
                                onClick={null}
                            >
                                <div class="object object_one"></div>
                                <div class="object object_two"></div>
                                <div class="object object_three"></div>
                            </button>
                        );
                    } else {
                        scanBtn = (
                            <button 
                                className='stdButtonBt' 
                                style={{position:'absolute',top:'5px',right:'15px',lineHeight:'20px'}} 
                                onClick={this.scanBtDevices.bind(this)}
                            >
                            {lang.getLang('Scan')}
                            </button>
                        );
                    }
                } else {
                    scanBtn = null;
                }
            } else {
                scanBtn = null;
            }
        } else {
            scanBtn = null;
        }
        return scanBtn;
    } 

    renderBelowDiv() {
        let rst;
        let ifMusicStation = this.checkStationDep("MusicStation");
        let ifMusicStationVer = this.checkStationVer("MusicStation");
        if (ifMusicStation) {
            if (ifMusicStationVer) {
                if (this.state.isScanning) {
                    rst = this.renderScanning();
                } else {
                    if (this.state.btDevices.length !== 0) {
                        rst = this.renderScanningDone();
                    } else if (!this.state.isAdapter) {
                        rst = this.renderNoConnectAdapter();
                    } else {
                        rst = this.renderNoDetect();
                    }
                }
            } else {
                rst = this.renderNoSupportMusicStation();
            }
        } else {
            //rst = this.renderNoMusicStation();
            rst = this.renderInstallMusicStation();
        }
        return rst;
    }


    renderBtPanel() {
        let ifShow = this.state.isOpenPanel 
            ? {visibility: 'visible',opacity: '1'}
            :{visibility: 'hidden',opacity: '0'};
        let ifMusicStation = this.checkStationDep("MusicStation");
        let scanBtn = this.renderScanBtn();
        let belowDiv = this.renderBelowDiv();
        return (
            <div style={{...ifShow,...style.btPanelDiv}}>
                <div className='arrow_box_bt'>
                    <div style={style.titleDiv}>
                        <span style={{fontSize:'13px',color:'FFFFFF',cursor:'default'}}>
                            {lang.getLang('Bluetooth device')}
                        </span>
                        {scanBtn}
                    </div>
                    {/*this.renderNoMusicStation()*/}
                    {/*this.renderInstallMusicStation()*/}
                    {/*this.renderNoConnectAdapter()*/}
                    {/*this.renderScanning()*/}
                    {belowDiv}
                </div>
            </div>
        )
    }

    scanBtDevices() {
        MainActions.getBtScan();
        this.setState({
            btDevices: [],
            isScanning: true
        })
    }

    btnClick() {
        this.setState({
            isOpenPanel: !this.state.isOpenPanel
        })
    }

    enterHandle(v) {
        this.setState({
            isEnter: v
        })
    }

    countConnectDevices() {
        let tmpDevicesArray = this.state.btDevices;
        let cnt = 0;
        tmpDevicesArray.forEach((device,i)=>{
            cnt = device.connected === 'Yes' ? cnt+1 : cnt;
        })
        return cnt;
    }

    renderTriggerBtn() {
        let rst = null;
        let imgScr = '';
        let devCount = this.countConnectDevices();
        let circleNumberDiv = devCount > 0 
            ? (
                <div style={style.bubbleCircle}>
                    {devCount}
                </div>
            )
            : null;
        let btncln = 'triggerBtnDefault';
        let dotLeft = null, dotRight = null;
        if (this.state.isAdapter) {
            if (this.state.isScanning) {
                dotLeft = (
                    <div style={style.flexCenter}>
                        <div class="object object_three" style={style.triggerBtnDot}></div>
                        <div class="object object_two" style={style.triggerBtnDot}></div>
                    </div>
                );
                dotRight = (
                    <div style={{...style.flexCenter,marginLeft:'10px'}}>
                        <div class="object object_two" style={style.triggerBtnDot}></div>
                        <div class="object object_three" style={style.triggerBtnDot}></div>
                    </div>
                )
            } else {
                
            }
        } else {

        }
        rst = (
            <div
                className={btncln}
                style={{...style.triggerBtn,...style.flexCenter}}
                onClick={this.btnClick.bind(this)}
                data-tip={lang.getLang('Bluetooth Device Settings')}
            >
                {dotLeft}
                {circleNumberDiv}
                {dotRight}
            </div>
        )
        return rst;
    }

    render() {
        return (
            <div onMouseEnter={this.enterHandle.bind(this,true)} onMouseLeave={this.enterHandle.bind(this,false)}>
                {this.renderTriggerBtn()}
                {this.renderBtPanel()}
            </div>
        )
    }
}

const triggerBtnIcon = {
    disable: 'img/bt_panel/bluetooth_disable.svg',
    enable: 'img/bt_panel/bluetooth_enable.svg',
    detection: 'img/bt_panel/bluetooth_detection.svg',
    scanning: 'img/bt_panel/bluetooth_connection.svg'
}

const style = {
    triggerBtn: {
        position: 'absolute',
        right: '280px',
        top: '8px',
        cursor: 'pointer',
    },
    titleDiv: {
        height:'30px',
        width:'100%',
        backgroundColor:'#374368',
        color:'#FFFFFF',
        display:'flex',
        alignItems:'center',
        msFlexAlign: 'center',
        paddingLeft:'15px',
        //borderRadius:'5px',
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
    },
    noMusicStationDiv: {
        width:'100%',
        color:'#4C4C4C',
        fontSize:'13px',
        display:'flex',
        paddingLeft:'15px',
        background: 'linear-gradient(to bottom, #E6E5E5 0%, #FFFFFF 100%)',
        borderBottomLeftRadius: '5px',
        borderBottomRightRadius: '5px',
    },
    bubbleCircle: {
        position:'absolute',
        right: '0px',
        top: '0px',
        borderRadius: '50%',
        width: '13px',
        height: '13px',
        padding: '1px 0px 0px 0px',
        background: '#FF5252',
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: '10px',
        cursor: 'default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        msFlexAlign: 'center',
        msFlexPack: 'center',
        cursor: 'pointer'
    },
    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        msFlexAlign: 'center',
        msFlexPack: 'center',
    },
    triggerBtnDot: {
        width: '2px',
        height: '2px'
    },
    btPanelDiv: {
        position:'absolute',
        right:'0',
        top:'46px',
        width:'320px',
        zIndex: '999',
        transition: 'all 0.3s ease',
    }
}