import React from "react";
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import { lang } from '../MultiLanguage/MultiLanguage';
import 'css/TypeSelector.css';

/* Overall, HDMI, HD Player, Analog..... */

export default class TypeSelector extends React.Component {

    /***************
     * Constructor *
     ***************/

    constructor(props) {
        super(props);
        this.getType = this.getType.bind(this);
        this.setDevices = this.setDevices.bind(this);
        this.state = {
            type: MainStore.getType(),
        }
    }

    /*********************
     * Lifecycle Methods *
     *********************/

    componentWillMount() {
        MainStore.on('chageType', this.getType);
        MainStore.on('updateDevice', this.setDevices);
    }

    componentWillUnmount() {
        MainStore.removeListener('chageType', this.getType);
        MainStore.removeListener('updateDevice', this.setDevices);
    }

    /*************************************
     * Click Handlers and Event Handlers *
     *************************************/
    setType(v) {
        MainActions.setType(v);
    }

    setDevices() {
        this.setState({
            deviceByType: MainStore.getDeviceByType()
        });
    }

    /*****************************
     * Getter Methods for Render *
     *****************************/

    getType() {
        this.setState({
            type: MainStore.getType()
        });
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

    /**********
     * Render *
     **********/

    render() {
        let deviceByType = this.state.deviceByType;
        if (deviceByType === undefined)
            return null;
        
        let listAry = [];
        let titleStr;

        let btAvaiDevices = _.filter(deviceByType.bluetoothDevs,{connected:'Yes'});
        let btAvaiDevicesLength = btAvaiDevices.length;

        let hdAvaiDevicesLength = this.getIfHdStationLogin()
            ? deviceByType.hdPlayerDevs.length
            : 0;

        let deviceNumOverview = deviceByType.hdmiDevs.length + 
                                //deviceByType.hdPlayerDevs.length + 
                                hdAvaiDevicesLength + 
                                deviceByType.analogDevs.length + 
                                deviceByType.usbDevs.length + 
                                //deviceByType.bluetoothDevs.length + 
                                btAvaiDevicesLength +
                                deviceByType.networkDevs.length;
        let typeAry = [
            ['Overview', lang.getLang('Overview'), deviceNumOverview],
            ['HDMI', lang.getLang('HDMI'), deviceByType.hdmiDevs.length],
            ['HDPlayer', lang.getLang('HD player'), hdAvaiDevicesLength],
            ['ANALOG', lang.getLang('Line Out'), deviceByType.analogDevs.length],
            ['USB', lang.getLang('USB'), deviceByType.usbDevs.length],
            ['Bluetooth', lang.getLang('Bluetooth'), btAvaiDevicesLength],
            ['network', lang.getLang('Network Player'), deviceByType.networkDevs.length]
        ];
        typeAry.forEach((element,i)=>{
            let tmp;
            if (element[0] == this.state.type)
            {
                tmp = 
                    (
                        <li key={i+777}>
                            <img 
                                src='img/toolbar/dropdown/slice/check_list_1.svg' 
                                style={{position:'absolute',width:'22px',height:'22px',margin:'3px 0 0 10px'}}
                            />
                            <a style={{...style.ddLiA, fontWeight:'600'}}>{element[1]} ({element[2]})</a>
                        </li>
                    );
                titleStr = element[1];
            } else if (element[2] === 0) {  //***** Disabled */
                tmp = (<li key={i+777} class="disabled">
                        <a style={style.ddLiAdisabled}>{element[1]} ({element[2]})</a>
                   </li>);
            } else {
                tmp = (<li key={i+777}>
                        <a style={style.ddLiA} onClick={this.setType.bind(this,element[0])}>{element[1]} ({element[2]})</a>
                   </li>);
            }
            listAry.push(tmp);
        });
        return (
            <div style={style.divFilter}>
                <div className='divSelect' role="button" data-toggle="dropdown">
                    <p style={style.pFilter}>{titleStr}</p>
                    <img src='img/arrow/arrowdown_0.svg' style={{position:'absolute',top:'8px',right:'8px'}} />
                </div>
                <ul
                    class="dropdown-menu"
                    style={style.dropDownStyle}
                    role="menu"
                    aria-labelledby="dropdownMenu"
                >
                    {listAry}
                </ul>
            </div>
        );
    }
};

const style = {
    pFilter: {
        fontSize: '14px',
        lineHeight: '23px',
        margin: '0 0 0 8px',
        color: '#FFFFFF',
        cursor: 'pointer'
    },
    ddLiA: {
        lineHeight:'28px',
        padding:'0 22px 0 36px',
        cursor:'pointer',
        color: '#FFFFFF',
        fontSize: '14px'
    },
    ddLiAdisabled: {
        lineHeight:'28px',
        padding:'0 22px 0 36px',
        cursor:'default',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '14px'
    },
    dropDownStyle: {
        top:'28px',
        left:'-2px',
        minWidth:'150px',
        margin:'0',
        padding:'16px 0',
        backgroundColor:'#4B5266',
        borderRadius:'4px'
    },
    divFilter: {
        position: 'absolute',
        top: '8px',
        left: '200px',
        height: '24px',
        minWidth: '150px',
    }
};