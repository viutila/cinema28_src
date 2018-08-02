import React from "react";
import Draggable from 'react-draggable';
import * as MainActions from "../../actions/MainActions";
import * as CommonActions from "../../actions/CommonActions";

import { lang } from '../MultiLanguage/MultiLanguage';

export default class Cinema28Disable extends React.Component {
    constructor(props) {
    	super(props);
    }
    
    render() {
        let dStyle = {
            width:'100%',
            height:'100%',
            position: 'absolute',
            top: '0',
            left: '0',
            background: 'url("img/login/stop_pic.svg") top left / cover no-repeat',
            display: 'flex',
            flexDirection: 'column',
            msFlexDirection:'column',
            justifyContent: 'center',
            alignItems: 'center',
            msFlexAlign: 'center',
            msFlexPack: 'center',
        }
        let dStyle2 = {
            color:'#FFF',
            cursor:'default',
            paddingLeft:'15px'
        }
        return (
            <div id="Cinema28Disable" style={dStyle}>
                <div>
                    <img src="img/login/stop_logo.svg" alt=""/>
                    <div style={{...dStyle2,marginTop:'60px',fontSize:'20px'}}>Cinema28 已被停用</div>
                    <div style={{...dStyle2,marginTop:'20px',fontSize:'14px'}}>
                        請以管理員身分前往App Center 啟用 Cinema28
                    </div>
                </div>
            </div>
        )
    }
}