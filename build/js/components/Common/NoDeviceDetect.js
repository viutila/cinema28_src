import React from "react";
import Draggable from 'react-draggable';
import MainStore from '../../stores/MainStore';
import * as MainActions from "../../actions/MainActions";

import { lang } from '../MultiLanguage/MultiLanguage';

export default class NoDeviceDetect extends React.Component {

	constructor(props) {
    	super(props);
		this.state = {
			pageIndex: 0
		}
        this.imgSrc = [
            'img/nodevice_detect/image_no_device_01_s.svg',
            'img/nodevice_detect/image_no_device_02_s.svg',
            'img/nodevice_detect/image_no_device_03_s.svg'
        ]
	}

    retryClick() {
        MainActions.refreshPage();
    }

    linkClick(v) {
        this.setState({
            pageIndex: v
        })
    }

    renderText() {
        var tmpAry = [];
        switch (this.state.pageIndex) {
            case 0:
                tmpAry.push( <p key='55' style={{fontSize:'14px',fontWeight:'500',margin:'18px 0 0 0',color: '#219ece'}}>{lang.getLang('YourUSBdevices')}</p> );
                tmpAry.push( <p key='33' style={{fontSize:'14px',fontWeight:'normal',color: '#2f2f2f',margin:'0'}}>{lang.getLang('Msg03')}</p> );
                break;
            case 1:
                tmpAry.push( <p key='66' style={{fontSize:'14px',fontWeight:'500',margin:'18px 0 0 0',color: '#219ece'}}>{lang.getLang('Msg04')}</p> );
                tmpAry.push( <p key='77' style={{fontSize:'14px',fontWeight:'normal',color: '#2f2f2f',margin:'0'}}>{lang.getLang('Msg05')}</p> );
                tmpAry.push( <p key='88' style={{fontSize:'14px',fontWeight:'normal',color: '#2f2f2f',margin:'0'}}>{lang.getLang('Msg06')}</p> );
                break;
            case 2:
                tmpAry.push( <p key='99' style={{fontSize:'14px',fontWeight:'500',margin:'18px 0 0 0',color: '#219ece'}}>{lang.getLang('Msg07')}</p> );
                tmpAry.push( <p key='44' style={{fontSize:'14px',fontWeight:'normal',color: '#2f2f2f',margin:'0'}}>{lang.getLang('Msg08')}</p> );
                break;
            
        }
        return tmpAry;
    }

    renderLinks() {
        var tmpAry = [];
        switch (this.state.pageIndex) {
            case 0:
                tmpAry.push( <p key='1' className="linkSpan" style={{margin:'0',fontSize: '14px'}} onClick={this.linkClick.bind(this,1)}>{lang.getLang('Bluetooth device')}</p> );
                tmpAry.push(<br key='333' />);
                tmpAry.push( <p key='2' className="linkSpan" style={{margin:'0 0 20px 0',fontSize: '14px'}} onClick={this.linkClick.bind(this,2)}>{lang.getLang('Network Player device')}</p> );
                break;
            case 1:
                tmpAry.push( <p key='0' className="linkSpan" style={{margin:'0',fontSize: '14px'}} onClick={this.linkClick.bind(this,0)}>{lang.getLang('USB device')}</p> );
                tmpAry.push(<br key='334' />);
                tmpAry.push( <p key='2' className="linkSpan" style={{margin:'0 0 20px 0',fontSize: '14px'}} onClick={this.linkClick.bind(this,2)}>{lang.getLang('Network Player device')}</p> );
                break;
            case 2:
                tmpAry.push( <p key='0' className="linkSpan" style={{margin:'0',fontSize: '14px'}} onClick={this.linkClick.bind(this,0)}>{lang.getLang('USB device')}</p> );
                tmpAry.push(<br key='335' />);
                tmpAry.push( <p key='1' className="linkSpan" style={{margin:'0 0 20px 0',fontSize: '14px'}} onClick={this.linkClick.bind(this,1)}>{lang.getLang('Bluetooth device')}</p> );
                break;
        }
        return tmpAry;
    }
    
    render() {
		return (
            <div>
                <div id="mask" style={divMask} >
                <Draggable bounds="body" cancel="#Link" cancel="#divClose">
                    <div style={divAbout}>

                        <div style={{float:'left'}}>
                            <img src='img/about/ic_info.png' style={{position: 'relative',top:'0px'}} />
                        </div>

                        <div style={{margin:'0 30px',textAlign:'left',overflow:'hidden'}}>
                            <p style={{fontSize:'14px',fontWeight:'bold',margin:'8px 0',color: '#2f2f2f'}}>{lang.getLang('No devices detected')}</p>
                            <p style={{fontSize:'14px',fontWeight:'normal',color: '#2f2f2f',margin:'0'}}>{lang.getLang('Msg01')}</p>
                            <p style={{fontSize:'14px',fontWeight:'normal',color: '#2f2f2f',margin:'0'}}>{lang.getLang('Msg02')}</p>

                            { this.renderText() }

                            <img draggable="false" src={this.imgSrc[this.state.pageIndex]} style={{position: 'relative',margin:'20px 0'}} />
                            { this.renderLinks() }
                        </div>

                        <button className='stdButton' style={{position:'absolute',bottom:'24px',right:'24px'}} onClick={this.retryClick.bind(this)} >{lang.getLang('Retry')}</button>

                    </div>
                </Draggable>
                </div>
            </div>
        );
    }
}

const divMask = {
	width: '100%',
	height: '100%',
	position: 'absolute',
	top: '0px',
	left: '0px',
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    msFlexAlign: 'center',
    msFlexPack: 'center',
    zIndex: '2'
};

const divAbout = {
	position: 'relative',
    zIndex: '9014',
    width: '760px',
	height: '490px',
    opacity: '1',    
	backgroundColor: '#FAFAFA',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	border: '1px solid #b0b0b0',
	display: 'inline-block',
	cursor: 'default',
    padding: '24px',
}