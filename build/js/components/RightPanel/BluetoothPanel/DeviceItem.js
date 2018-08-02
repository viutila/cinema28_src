import React from "react";
import 'css/BluetoothPanel.css';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';

export default class DeviceItem extends React.Component {
    constructor(props) {
        super(props);

        this.doBtConnectDone = this.doBtConnectDone.bind(this);
        this.doBtPairDone = this.doBtPairDone.bind(this);

        this.state = {
            name: this.props.devObj.name,
            connected: this.props.devObj.connected,
            paired: this.props.devObj.paired,
            isPairing: false,
            isRemoving: false,
            isConnecting: false,
        }
        this.recPropsCnt = 0;
    }

    componentWillReceiveProps(nextProps) {


        if (nextProps.devObj.name !== this.state.name) {
            this.setState({
                isPairing: false,
                //isRemoving: false,
                isConnecting: false,
            })
        }

        if (nextProps.devObj.paired === 'Yes') {
            this.setState({
                isPairing: false
            })
        }

        if (nextProps.devObj.connected === 'Yes') {
            this.setState({
                isConnecting: false
            })
        }

        if (nextProps.devMd !== null) {
            if (nextProps.devMd.id === nextProps.devObj.id) {
                //console.log('nextProps.devMd', nextProps.devMd);
                if (nextProps.devMd.connected !== nextProps.devObj.connected) {
                    this.recPropsCnt++;
                    if (this.recPropsCnt > 7) {
                        this.setState({
                            name: nextProps.devMd.name,
                            connected: nextProps.devMd.connected,
                            paired: nextProps.devMd.paired,
                        });
                        nextProps.devObj.connected = nextProps.devMd.connected;
                        this.recPropsCnt = 0;
                        console.log(
                            '%c this.recPropsCnt > 7 in bluetooth deviceitem!',
                            'color: red; font-weight: bold;'
                        );
                    } else {
                        this.setState({
                            name: nextProps.devObj.name,
                            connected: nextProps.devObj.connected,
                            paired: nextProps.devObj.paired,
                        });
                    }
                } else {
                    this.recPropsCnt = 0;
                    this.setState({
                        name: nextProps.devObj.name,
                        connected: nextProps.devObj.connected,
                        paired: nextProps.devObj.paired,
                    });
                }
            }
        } else {
            this.recPropsCnt = 0;
            this.setState({
                name: nextProps.devObj.name,
                connected: nextProps.devObj.connected,
                paired: nextProps.devObj.paired,
            });
        }
    }

    componentWillMount() {
        MainStore.on('doBtConnectDone', this.doBtConnectDone);
        MainStore.on('doBtPairDone', this.doBtPairDone);
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        MainStore.removeListener('doBtConnectDone', this.doBtConnectDone);
        MainStore.removeListener('doBtPairDone', this.doBtPairDone);
    }

    doBtConnectDone(devId) {
        console.log('doBtConnectDone', devId);
        if (devId === this.props.devObj.id) {
            this.setState({
                isConnecting: false
            });
            let doneBtDevice = MainStore.getBtDevices();
            let notyMsg = '';
            doneBtDevice.forEach(function (element) {
                if (element.id === this.props.devObj.id) {
                    if (element.connected === 'Yes') {
                        //notyMsg = '藍芽裝置 ' + element.name + ' 連線成功';
                        notyMsg = lang.getLang('btPanelMsg12');
                        notyMsg = notyMsg.replace('$name', element.name);
                    } else {
                        //notyMsg = '藍芽裝置 ' + element.name + ' 連線失敗';
                        notyMsg = lang.getLang('btPanelMsg13');
                        notyMsg = notyMsg.replace('$name', element.name);
                    }
                }
            }, this);
            setTimeout(() => {
                MainActions.pushNotification(notyMsg);
            });
        }
    }

    doBtPairDone(devId) {
        console.log('doBtPairDone', MainStore.getBtDevices());
        if (devId === this.props.devObj.id) {
            this.setState({
                isPairing: false
            });
            let doneBtDevice = MainStore.getBtDevices();
            let notyMsg = '';
            let notyMsg2 = '';
            doneBtDevice.forEach(function (element) {
                if (element.id === this.props.devObj.id) {
                    if (element.paired === 'Yes') {
                        //notyMsg = '藍芽裝置 ' + element.name + ' 配對成功';
                        notyMsg = lang.getLang('btPanelMsg14');
                        notyMsg = notyMsg.replace('$name', element.name);
                        if (element.connected === 'Yes') {
                            //notyMsg2 = '藍芽裝置 ' + element.name + ' 連線成功';
                            notyMsg = lang.getLang('btPanelMsg12');
                            notyMsg = notyMsg.replace('$name', element.name);
                        }
                    } else {
                        //notyMsg = '藍芽裝置 ' + element.name + ' 配對失敗'; 
                        notyMsg = lang.getLang('btPanelMsg15');
                        notyMsg = notyMsg.replace('$name', element.name);
                    }
                }
            }, this);

            setTimeout(() => {
                MainActions.pushNotification(notyMsg);
            });
            if (notyMsg2) {
                setTimeout(() => {
                    MainActions.pushNotification(notyMsg2);
                });
            }
        }

    }

    renderIcon() {
        let rst;
        if (this.state.connected === 'Yes' && this.state.paired === 'Yes') {
            rst = <img src={iconImg.blue} />
        } else {
            rst = <img src={iconImg.gray} />
        }
        return rst;
    }

    getConnectedStatus() {
        let rst = '';
        if (this.state.paired === 'Yes') {
            if (this.state.connected === 'Yes') {
                rst = connectStatus.connected
            } else if (this.state.connected === 'No') {
                rst = connectStatus.notConnected
            }
        } else if (this.state.paired === 'No') {
            rst = connectStatus.notPaired
        }
        return rst;
    }

    renderStateText() {
        let rst = '';
        let cStatus = this.getConnectedStatus();
        switch (cStatus) {
            case connectStatus.connected: {
                rst = lang.getLang('Connected');
                break;
            }
            case connectStatus.notConnected: {
                rst = lang.getLang('Not connected');
                break;
            }
            case connectStatus.notPaired: {
                rst = lang.getLang('Not paired');
                break;
            }
        }
        return rst;
    }

    clickBtPair() {
        let adapterId = this.props.devObj.adapter_id;
        let devId = this.props.devObj.id;
        MainActions.doBtPair(devId, adapterId);
        this.setState({
            isPairing: true
        })
    }

    clickBtRemove() {
        let adapterId = this.props.devObj.adapter_id;
        let devId = this.props.devObj.id;
        MainActions.doBtRemove(devId, adapterId);
        this.setState({
            isRemoving: true
        })
    }

    clickBtConnect() {
        let adapterId = this.props.devObj.adapter_id;
        let devId = this.props.devObj.id;
        MainActions.doBtConnect(devId, adapterId);
        this.setState({
            isConnecting: true
        });
        this.recPropsCnt = 0;
    }

    renderBtnDiv() {
        let rst = null;
        let removeBtn = null
        let cStatus = this.getConnectedStatus();
        switch (cStatus) {
            case connectStatus.connected: {
                if (this.state.isRemoving) {
                    rst = (
                        <button className='devActBtnDis' style={style.flexCenter}>
                            <div class="object object_one"></div>
                            <div class="object object_two"></div>
                            <div class="object object_three"></div>
                        </button>
                    );
                } else {
                    rst = <button className='devActBtn' onClick={this.clickBtRemove.bind(this)}>{lang.getLang('Delete')}</button>;
                }
                break;
            }
            case connectStatus.notConnected: {
                if (this.state.isConnecting || this.state.isRemoving) {
                    rst = (
                        <button className='devActBtnDis' style={style.flexCenter}>
                            <div class="object object_one"></div>
                            <div class="object object_two"></div>
                            <div class="object object_three"></div>
                        </button>
                    );
                } else {
                    rst = <button className='devActBtn' onClick={this.clickBtConnect.bind(this)}>{lang.getLang('Connect')}</button>;
                    removeBtn = <button className='devActBtn' style={{marginLeft:'5px'}} onClick={this.clickBtRemove.bind(this)}>{lang.getLang('Delete')}</button>;
                }
                break;
            }
            case connectStatus.notPaired: {
                if (this.state.isPairing || this.state.isRemoving) {
                    rst = (
                        <button className='devActBtnDis' style={style.flexCenter}>
                            <div class="object object_one"></div>
                            <div class="object object_two"></div>
                            <div class="object object_three"></div>
                        </button>
                    );
                } else {
                    rst = <button className='devActBtn' onClick={this.clickBtPair.bind(this)}>{lang.getLang('Pair')}</button>;
                    removeBtn = <button className='devActBtn' style={{marginLeft:'5px'}} onClick={this.clickBtRemove.bind(this)}>{lang.getLang('Delete')}</button>;
                }
                break;
            }
        }

        return (
            <div style={{ position: 'absolute', right: '10px',top: '0',height:'100%', ...style.flexCenter }}>
                {rst}
                {removeBtn}
            </div>
        )
    }

    render() {
        let icon = this.renderIcon();
        let stateText = this.renderStateText();
        return (
            <div 
                style={{
                    height: '50px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    msFlexAlign: 'center',
                    position:'relative'
                }}
            >

                <div style={{ margin: '0 10px 0 15px' }}>{icon}</div>
                <div>
                    <div style={{ fontSize: '12px', color: '#4C4C4C' }}>
                        {this.state.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7F7F7F' }}>
                        {stateText}
                    </div>

                </div>
                {this.renderBtnDiv()}
            </div>
        )
    }
}

const iconImg = {
    blue: 'img/bt_panel/pic_bluetooth_blue.svg',
    gray: 'img/bt_panel/pic_bluetooth_gray.svg',
    connect: 'img/bt_panel/pic_bluetooth_connect.svg',
}

const connectStatus = {
    connected: 0,
    notConnected: 1,
    notPaired: 2,
}

const style = {
    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        msFlexAlign: 'center',
        msFlexPack: 'center',
    }
}