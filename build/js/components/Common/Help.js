import React from "react";
import Draggable from 'react-draggable';
import * as MainActions from "../../actions/MainActions";
import * as CommonActions from "../../actions/CommonActions";
import { lang } from '../MultiLanguage/MultiLanguage';

export default class Help extends React.Component {
	constructor(props) {
		super(props);
        this.state = {
            divStyle: divQuickStartOpen,
            isShowCloseBtn: true,
        }
	}

    aboutCloseClick() {
        this.setState({
            divStyle: divQuickStartClose,
            isShowCloseBtn: false,
        });
        setTimeout(()=>{
            MainActions.hideHelp();
        },1000);
    }
    
    renderTr(pText, aryStatus) {
        let statusAry = [];
        aryStatus.forEach(function(value,idx) {
            statusAry.push(value === 'X'
                ? <td key={idx+987} style={style.tdRed}>{value}</td>
                : <td key={idx+987} style={style.td}>{value}</td>
            );
        });
        return (
            <tr>
                <td style={style.td}>{pText}</td>
                {statusAry}
            </tr>
        );
    }

    renderTr2(pText1, pText2, pIconSrc, pSptFileType) {
        return (
            <tr>
                <td style={style.td}>{pText1}</td>
                <td style={{...style.td, backgroundColor:'#2F2F2F'}}>
                    <img style={style.icon} src={pIconSrc} alt=""/>
                </td>
                <td style={style.td}>{pText2}</td>
                <td style={style.td}>{pSptFileType}</td>
            </tr>
        );
    }

    renderLi1(pStr){
        return (
            <li>
                <span style={style.span2}>
                    {pStr}
                </span>
            </li>
        );
    }

	render() {
        let oh10 = lang.getLang('OnlineHelpMsg11');
        let strSplit01 = oh10.split("$img1");

        return (
            <div id="mask" style={divMask} >
                <div style={this.state.divStyle}>
                    {/* Head1 - Cinema28 Online Help */}
                    <div
                        style={{
                            width: '100%',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'baseline',
                            msFlexAlign: 'center',
                            msFlexPack: 'baseline',
                        }}
                    >
                        <img src='img/help_icon.png' />
                        <span style={{position: 'relative',fontSize:'24px',color: '#918c80',marginLeft:'12px'}}>
                            Cinema28 {lang.getLang('Online help')}
                        </span>
                        <div
                            id="divClose"
                            class="btnClose"
                            style={{display: this.state.isShowCloseBtn ? 'block' : 'none'}}
                            onClick={this.aboutCloseClick.bind(this)}
                        />
                    </div>

                    <div style={{height:'calc(100% - 86px)',overflow:'auto',paddingRight: '20px',margin: '15px 0'}}>

                        {/* Head2 Sub Text - Overview */}
                        <div style={divBlock}>
                            <p style={pTitle}>
                                {lang.getLang('OnlineHelpStr01')}
                            </p>
                            <p style={pText}>
                                {lang.getLang('OnlineHelpMsg01')}
                                &nbsp;
                                {lang.getLang('OnlineHelpMsg02')}
                            </p>
                        </div>
                        {/* Head2 Sub Text - System Requirements */}
                        <div style={divBlock}>
                            <p style={pTitle}>
                                {lang.getLang('OnlineHelpStr02')}
                            </p>

                            <ul style={{listStyle:'square', color: '#c0d630'}}>
                                {this.renderLi1(lang.getLang('OnlineHelpMsg03'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg04'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg05'))}
                            </ul>
                            <p style={pText}>
                                {lang.getLang('OnlineHelpMsg20')}
                            </p>
                        </div>
                        
                        {/* Head2 Sub Text - Media List */}
                        <div style={divBlock}>
                            <p style={pTitle}>{lang.getLang('OnlineHelpStr03')}</p>
                            <p style={pText}>
                                {lang.getLang('OnlineHelpMsg06')}&nbsp;{lang.getLang('OnlineHelpMsg07')}
                            </p>
                            <ul style={{listStyle:'square', color: '#c0d630'}}>
                                <li>
                                    <span style={style.span2}>
                                        {lang.getLang('OnlineHelpStr04')}
                                    </span>
                                </li>
                            </ul>
                            <table style={{fontSize:'12px',marginBottom:'20px',width:'100%'}}>
                                <thead>
                                    <tr style={{backgroundColor:'#DBE5F1'}}>
                                        <th style={{...style.th, width:'20%'}}>{lang.getLang('OnlineHelpStr05')}</th>
                                        <th style={{...style.th, width:'16%'}}>{lang.getLang('OnlineHelpStr06')}</th>
                                        <th style={{...style.th, width:'25%'}}>{lang.getLang('OnlineHelpStr07')}</th>
                                        <th style={{...style.th, width:'39%'}}>{lang.getLang('OnlineHelpStr08')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.renderTr2(
                                            lang.getLang('HD player'),
                                            lang.getLang('HD player'),
                                            "img/device_icon/slice/hdmi_audio.svg",
                                            lang.getLang('Photo') + ' / ' + lang.getLang('Music') + ' / ' + lang.getLang('Video')
                                        )
                                    }
                                    {
                                        this.renderTr2(
                                            lang.getLang('OnlineHelpStr10'),
                                            lang.getLang('OnlineHelpStr10'),
                                            "img/device_icon/slice/hdmi_player.svg",
                                            lang.getLang('Music') + ' / ' + lang.getLang('Video') + ' (' + lang.getLang('OnlineHelpStr19') + ')'
                                        )
                                    }
                                    {
                                        this.renderTr2(
                                            lang.getLang('OnlineHelpStr11'),
                                            lang.getLang('OnlineHelpStr17'),
                                            "img/device_icon/slice/analog.svg",
                                            lang.getLang('Music') + ' / ' + lang.getLang('Video') + ' (' + lang.getLang('OnlineHelpStr19') + ')'
                                        )
                                    }
                                    {
                                        this.renderTr2(
                                            lang.getLang('USB'),
                                            lang.getLang('OnlineHelpStr18'),
                                            "img/device_icon/slice/usb.svg",
                                            lang.getLang('Music') + ' / ' + lang.getLang('Video') + ' (' + lang.getLang('OnlineHelpStr19') + ')'
                                        )
                                    }
                                    {
                                        this.renderTr2(
                                            lang.getLang('Bluetooth'),
                                            lang.getLang('OnlineHelpStr18'),
                                            "img/device_icon/slice/bluetooth.svg",
                                            lang.getLang('Music')
                                        )
                                    }
                                    {
                                        this.renderTr2(
                                            lang.getLang('OnlineHelpStr14'),
                                            lang.getLang('OnlineHelpStr18'),
                                            "img/device_icon/slice/dlna.svg",
                                            lang.getLang('Photo') + ' / ' + lang.getLang('Music') + ' / ' + lang.getLang('Video')
                                        )
                                    }
                                    {
                                        this.renderTr2(
                                            lang.getLang('OnlineHelpStr15'),
                                            lang.getLang('OnlineHelpStr18'),
                                            "img/device_icon/slice/airplay.svg",
                                            lang.getLang('Photo') + ' / ' + lang.getLang('Music') + ' / ' + lang.getLang('Video')
                                        )
                                    }
                                    {
                                        this.renderTr2(
                                            lang.getLang('OnlineHelpStr16'),
                                            lang.getLang('OnlineHelpStr18'),
                                            "img/device_icon/slice/chromecast.svg",
                                            lang.getLang('Photo') + ' / ' + lang.getLang('Music') + ' / ' + lang.getLang('Video')
                                        )
                                    }
                                    
                                </tbody>
                            </table>
                            <ul style={{listStyle:'square', color: '#c0d630'}}>
                                <li>
                                    <span style={style.span2}>
                                        {lang.getLang('OnlineHelpStr20')}
                                    </span>
                                </li>
                            </ul>
                            <table style={{fontSize:'12px',marginBottom:'20px',width:'100%'}}>
                                <thead>
                                    <tr>
                                        <th style={style.th}></th>
                                        <th style={style.th}>{lang.getLang('OnlineHelpStr14')}</th> 
                                        <th style={style.th}>{lang.getLang('OnlineHelpStr21')}</th>
                                        <th style={style.th}>{lang.getLang('OnlineHelpStr16')}</th>
                                        <th style={style.th}>{lang.getLang('OnlineHelpStr22')}</th> 
                                        <th style={style.th}>{lang.getLang('OnlineHelpStr23')}</th>
                                        <th style={style.th}>{lang.getLang('OnlineHelpStr10')}</th>
                                        <th style={style.th}>{lang.getLang('HD player')}</th> 
                                        <th style={style.th}>{lang.getLang('Bluetooth')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.renderTr(lang.getLang('OnlineHelpStr24'),['O','O','O','O','O','O','O','O'])}
                                    {this.renderTr(lang.getLang('OnlineHelpStr12'),['O','O','O','O','O','O','O','O'])}
                                    {this.renderTr(lang.getLang('OnlineHelpStr26'),['O','O','O','O','O','O','O','O'])}
                                    {this.renderTr(lang.getLang('OnlineHelpStr27'),['O','O','O','O','O','O','X','O'])}
                                    {this.renderTr(lang.getLang('OnlineHelpStr28'),['O','O','O','O','O','O','O','O'])}
                                    {this.renderTr(lang.getLang('OnlineHelpStr29'),['O','O','O','O','O','O','X','X'])}
                                    {this.renderTr(lang.getLang('OnlineHelpStr30'),['O','O','O','O','O','O','X','X'])}
                                    {this.renderTr(lang.getLang('OnlineHelpStr31'),['O','O','O','O','O','O','X','X'])}
                                </tbody>
                            </table>
                        </div>

                        {/* Head2 Sub Text - Setting Up Media Devices */}
                        <div style={divBlock}>
                            <p style={pTitle}>
                                {lang.getLang('OnlineHelpStr32')}
                            </p>
                            <p style={pText}>
                                {lang.getLang('OnlineHelpMsg08')}
                                &nbsp;
                                {lang.getLang('OnlineHelpMsg09')}
                            </p>
                            <ol style={{fontSize: '12px'}}>
                                {this.renderLi1(lang.getLang('OnlineHelpMsg10'))}
                                <li>
                                    <span style={style.span2}>
                                        {strSplit01[0]}
                                        <img style={{backgroundColor:'#2F2F2F'}} src="img/genius/type_genis_0.svg" />
                                        {strSplit01[1]}
                                    </span>
                                    <br/>
                                    <span style={style.span1}>
                                        {lang.getLang('OnlineHelpMsg12')}:&nbsp;
                                    </span>
                                    <span style={style.span2}>
                                        {lang.getLang('OnlineHelpMsg13')}
                                    </span>
                                </li>
                                <li>
                                    <span style={style.span2}>
                                        {lang.getLang('OnlineHelpMsg14')}&nbsp;
                                    </span>
                                    <span style={style.span1}>
                                        {lang.getLang('OnlineHelpMsg15')}
                                    </span>
                                </li>
                                {this.renderLi1(lang.getLang('OnlineHelpMsg16'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg17'))}
                            </ol>
                        </div>

                        {/* Head2 Sub Text - Streaming Media Content from Media List */}
                        <div style={divBlock}>
                            <p style={pTitle}>
                                {lang.getLang('OnlineHelpStr33')}
                            </p>
                            <p style={pText}>
                                {lang.getLang('OnlineHelpMsg18')}
                                &nbsp;
                                {lang.getLang('OnlineHelpMsg19')}
                            </p>
                            <ul style={{listStyle:'square', color: '#c0d630'}}>
                                <li>
                                    <span style={style.span1}>
                                        {lang.getLang('OnlineHelpStr34')}
                                    </span>
                                </li>
                                <p style={pText}>
                                    {lang.getLang('OnlineHelpMsg20')}
                                </p>
                                <ul>
                                    {this.renderLi1(lang.getLang('OnlineHelpStr35'))}
                                    {this.renderLi1(lang.getLang('OnlineHelpStr36'))}
                                    {this.renderLi1(lang.getLang('OnlineHelpStr37'))}
                                    {this.renderLi1(lang.getLang('OnlineHelpStr38'))}
                                    {this.renderLi1(lang.getLang('OnlineHelpStr39'))}
                                    {this.renderLi1(lang.getLang('OnlineHelpStr40'))}
                                    {this.renderLi1(lang.getLang('OnlineHelpStr41'))}
                                    {this.renderLi1(lang.getLang('OnlineHelpStr42'))}
                                </ul>
                            </ul>
                            <ul style={{listStyle:'square', color: '#c0d630'}}>
                                <li>
                                    <span style={style.span1}>
                                        {lang.getLang('OnlineHelpStr43')}
                                    </span>
                                </li>
                                <p style={pText}>
                                    {lang.getLang('OnlineHelpMsg21')}
                                    &nbsp;
                                    {lang.getLang('OnlineHelpMsg22')}
                                    &nbsp;
                                    {lang.getLang('OnlineHelpMsg23')}
                                </p>
                            </ul>
                        </div>

                        {/* Head2 Sub Text - Monitoring Media Devices */}
                        <div style={divBlock}>
                            <p style={pTitle}>
                                {lang.getLang('OnlineHelpStr44')}
                            </p>
                            <ul style={{listStyle:'square', color: '#c0d630'}}>
                                <li>
                                    <span style={style.span1}>
                                        {lang.getLang('OnlineHelpStr45')}
                                    </span>
                                </li>
                                <p style={pText}>
                                    {lang.getLang('OnlineHelpMsg24')}
                                    &nbsp;
                                    {lang.getLang('OnlineHelpMsg25')}
                                    &nbsp;
                                    {lang.getLang('OnlineHelpMsg26')}
                                </p>
                                <li>
                                    <span style={style.span1}>
                                        {lang.getLang('OnlineHelpStr46')}
                                    </span>
                                </li>
                                <p style={pText}>
                                    {lang.getLang('OnlineHelpMsg27')}
                                </p>
                            </ul>
                        </div>

                        {/* Head2 Sub Text - Operating Media Devices */}
                        <div style={divBlock}>
                            <p style={pTitle}>
                                {lang.getLang('OnlineHelpStr47')}
                            </p>
                            <p style={pText}>
                                {lang.getLang('OnlineHelpMsg28')}
                            </p>
                            <ul style={{listStyle:'square', color: '#c0d630'}}>
                                {this.renderLi1(lang.getLang('OnlineHelpMsg29'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg30'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg31'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg32'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg33'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg34'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg35'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg36'))}
                                {this.renderLi1(lang.getLang('OnlineHelpMsg37'))}
                                <ul>
                                    {this.renderLi1(lang.getLang('OnlineHelpMsg38'))}
                                    {this.renderLi1(lang.getLang('OnlineHelpMsg39'))}
                                </ul>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
		)
	}
}

const divMask = {
	width: '100%',
	height: '100%',
	position: 'absolute',
	top: '0px',
	left: '0px',
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	textAlign: 'right',
	zIndex: '10000001',
};

const divQuickStartOpen = {
    zIndex: '9014',
    width: '518px',
	height: '100%',
    opacity: '1',
	backgroundColor: '#FAFAFA',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	border: '1px solid #c6c6c6',
	display: 'inline-block',
	cursor: 'default',
	padding:'0 0 0 30px',
    animation: '1s helpPanelOpening 1',
}

const divQuickStartClose = {
    zIndex: '9014',
    width: '0',
	height: '0',
    opacity: '1',    
	backgroundColor: '#FAFAFA',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	border: '1px solid #c6c6c6',
	display: 'inline-block',
	cursor: 'default',
	padding:'0',
    animation: '1s helpPanelClosing 1',
}

const pTitle = {
    position: 'relative',
    fontSize:'17px',
    color: '#000000',
    fontWeight:'bold',
    borderBottom: '1px solid #c6c6c6',
    paddingBottom:'10px'
}

const pText = {
    fontSize:'12px',
    color: '#2e2e2e'
}

const pTitle2 = {
    fontSize:'13px',
    fontWeight: 'bold',
    color: '#000'
}

const divBlock = {
    width: '100%',
    top: '0',
    textAlign:'left',
    marginTop:'25px'
}

const style = {
    td: {
        border: '1px solid #dddddd',
        textAlign: 'center',
    },
    tdRed: {
        border: '1px solid #dddddd',
        textAlign: 'center',
        color: 'red'
    },
    th: {
        border: '1px solid #dddddd',
        textAlign: 'center',
        width: '10%',
        wordBreak: 'break-all'
    },
    icon: {
        width: '30px',
        height: '30px',
    },
    span1: {
        fontWeight:'bolder',
        color: '#2e2e2e',
        fontSize: '12px'
    },
    span2: {
        color: '#2e2e2e',
        fontSize: '12px'
    }
}