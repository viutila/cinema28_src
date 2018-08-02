import React from "react";
import 'css/DeviceWizard.css';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import MainStore from 'js/stores/MainStore';
import LoginStore from "js/stores/LoginStore";
import * as MainActions from 'js/actions/MainActions';

//import CustomScrollBar01 from '../../Common/CustomScrollBar01';
//import DeviceTypeItem from './DeviceTypeItem';

export default class HDSLoginPanel extends React.Component {
    constructor(props) {
        super(props);
        this.loginHDSDone = this.loginHDSDone.bind(this);
        this.state = {
            userName: MainActions.getCookie('CINEMA28_REMM')=="1" ? MainActions.getCookie('CINEMA28_USERNAME') : '',
            password: MainActions.getCookie('CINEMA28_REMM')=="1" ? LoginStore.ezDecode( MainActions.getCookie('CINEMA28_PASSWORD') )  : '',
            ifLoginClick: false,
            ifLoginFailed: false,
        }
    }

    componentWillMount() {
        MainStore.on('loginHDSDone', this.loginHDSDone);
    }
    componentWillUnmount() {
        MainStore.removeListener('loginHDSDone', this.loginHDSDone);
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

    checkHDSLogin() {
        if (this.getIfHdStationLogin()) {
            console.log('checkHDSLogin Done!');
            this.setState({
                ifLoginClick: false
            });
            this.props.backFunc();
        } else {
            console.log('Try checkHDSLogin!');
            setTimeout(function() {
                this.checkHDSLogin();
            }.bind(this), 3000);
        }
    }

    loginHDSDone(resData) {
        if (+resData.ret_code === -1 && resData.mg === "failed to login hds") {
            this.setState({
                ifLoginClick: false,
                ifLoginFailed: true,
            });
        } else if (+resData.ret_code === 0) {
            setTimeout(function() {
                this.checkHDSLogin();
            }.bind(this), 3000);
        }
        
    }

    handleUserNameChange(e) {
        this.setState({
            userName: e.target.value
        });
    }

    handlePasswordChange(e) {
        this.setState({
            password: e.target.value
        });
    }

    getEncodeStr(v){
        return LoginStore.createEncode(v);
    }

    doLogin() {
        this.setState({
            ifLoginClick: true,
            ifLoginFailed: false,
        });
        let uname = this.getEncodeStr(this.state.userName);
        let pwd = this.getEncodeStr(this.state.password);
        MainActions.loginHds(uname, pwd);
    }

    renderLoadingMask() {
        let d1Style = {
            position:'absolute',
            width:'100%',
            height:'100%',
            top:'0',
            left: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            msFlexAlign: 'center',
            msFlexPack: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)'
        }
        let divLoadingStyle = {
            position: 'absolute',
            padding: '24px',
            maxWidth: '300px',
            overflow: 'hidden',
            color: '#FFF',
            zIndex: '20',
            border: '1px solid #FFF',
            backgroundColor: 'rgba(0,0,0,0.6)',
            fontSize: '16px',
            animation: '0.5s loading01 1',
        };
        return this.state.ifLoginClick
        ? (
            <div style={d1Style}>
                <div style={divLoadingStyle}>
					<img src='img/loading Q_21.gif' />
					<span style={{paddingLeft: '16px'}}>{lang.getLang('Loading')}...</span>
				</div>
            </div>
        ) : null;
    }

    getErrMsgStyle() {
        let rstStyle = {
            fontSize: '14px',
            color: '#FD9444',
            visibility: this.state.ifLoginFailed ? 'visible' : 'hidden',
            width: '240px',
            marginTop:'20px'
        };
        return rstStyle;
    }

    _handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            console.log('do Login HD Station');
            e.target.blur();
            this.doLogin();
        }
    }

    render() {
        let d1Style = {
            display:'flex',
            alignItems:'center',
            msFlexAlign: 'center',
            position: 'absolute',
            top: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#1D273E'
        };
        let d2Style = {
            display:'flex',
            flexDirection: 'column',
            msFlexDirection:'column',
        };
        let d3Style = {
            fontSize:'16px',
            color:'#FFF',
            padding:'25px',
            position: 'absolute',
            top: '0',
        };
        let pStyle = {
            margin: '0 0 10px 0',
            fontSize: '14px',
            lineHeight: '20px',
            color: '#FFF',
        };
        let bStyle = {
            width:'240px',
            height:'36px',
            marginTop:'20px'
        };

        
        return (
            <div style={d1Style}>

                <div style={d3Style}>
                    <div 
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            msFlexAlign: 'center'
                        }} 
                        onClick={this.props.backFunc.bind(this)}
                    >
                        <button 
                            className='backBtn' 
                            style={{marginRight:'5px'}}
                        />
                        {lang.getLang('Back to device list')}
                    </div>
                </div>

                <img src='img/genius/genius_pic_hdplayer.svg' style={{animation:'fadeIn 0.3s',margin:'0 50px 0 100px'}} />

                <div style={d2Style}>

                    <p style={pStyle}>{lang.getLang('Username')}</p>
                    <input 
                        type="text" 
                        key="inputFocusUn" 
                        value={this.state.userName} 
                        className='divAccountBoxUserName' 
                        onChange={this.handleUserNameChange.bind(this)} 
                        placeholder={lang.getLang('Username')} 
                        onKeyPress={this._handleKeyPress.bind(this)}
                    />

                    <p style={{...pStyle,marginTop:'15px'}}>{lang.getLang('Password')}</p>
                    <input 
                        type='password' 
                        key="inputFocusPw" 
                        value={this.state.password} 
                        className='divAccountBoxUserPassword' 
                        onChange={this.handlePasswordChange.bind(this)} 
                        placeholder={lang.getLang('Password')} 
                        onKeyPress={this._handleKeyPress.bind(this)}
                    />

                    <div style={this.getErrMsgStyle()}>{lang.getLang('Msg27')}</div>

                    <button 
                        key="loginBtn" 
                        className='divLoginBtn' 
                        style={bStyle}
                        onClick={this.doLogin.bind(this)}
                    >
                    {lang.getLang('Login')}
                    </button>

                    {this.renderLoadingMask()}
                </div>
            </div>
        )
    }
}