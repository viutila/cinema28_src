const $ = require('jquery');
import React from "react";

import LoginStore from "js/stores/LoginStore";
import * as LoginAction from "js/actions/LoginAction";
import * as MainActions from "js/actions/MainActions";

import { lang } from './MultiLanguage/MultiLanguage';
import 'css/LoginPage.css';

export default class LoginPage extends React.Component{
    constructor(){
        super();
        this.setToggleEye = this.setToggleEye.bind(this);
        this.setShowLoadingBar = this.setShowLoadingBar.bind(this);
        this.setIsAuthPass = this.setIsAuthPass.bind(this);
        this.state={
            isShowTextClose : false,
            isShowPasswordEye : LoginStore.getIsShowEye(),
            inputType : (LoginStore.getIsShowEye())?'text':'password',
            isAuthPass : LoginStore.getIsAuthPass(),
            isRemmeChecked : MainActions.getCookie('CINEMA28_REMM')=="1" ? true : false,
            isSecureChecked : false,
            showLoginLoadingBar:LoginStore.getShowLoginLoadingBar(),
            userName: MainActions.getCookie('CINEMA28_REMM')=="1" ? MainActions.getCookie('CINEMA28_USERNAME') : '',
            password:MainActions.getCookie('CINEMA28_REMM')=="1" ? LoginStore.ezDecode( MainActions.getCookie('CINEMA28_PASSWORD') )  : '',
        }
    }

    componentDidMount() {
        let isShow = this.state.userName === "" ? false : true;
        this.setState({
            isShowTextClose : isShow,
        });
    }

    handleUserNameChange(e){
        const userName = e.target.value;
        const isShow = userName === "" ? false : true;

        this.setState({
            userName : userName,
            isShowTextClose : isShow,
            userNameDom : e.target
        });
    }

    handleUserPasswordChange(e){
        const password = e.target.value;
        this.setState({password});
    }

    handleRemmeChange(e){
        const isChecked = e.target.checked;
        this.setState({
            isRemmeChecked : isChecked,
        })
    }

    handleSecureChange(e){
        const isChecked = e.target.checked;
        this.setState({
            isSecureChecked : isChecked,
        })
    }

    handleRemmeChangeImg(){
        this.setState({
            isRemmeChecked : !this.state.isRemmeChecked,
        })
    }

    handleSecureChangeImg(){
        this.setState({
            isSecureChecked : !this.state.isSecureChecked,
        })
    }

    componentWillMount(){
        LoginStore.on("togglePasswordEye", this.setToggleEye);
        LoginStore.on("showLoginLoadingBar",this.setShowLoadingBar);
        LoginStore.on("isAuthPass",this.setIsAuthPass);
    }

    componentWillUnmount(){
        LoginStore.removeListener("togglePasswordEye",this.setToggleEye);
        LoginStore.removeListener("showLoginLoadingBar",this.setShowLoadingBar);
        LoginStore.removeListener("isAuthPass",this.setIsAuthPass);
    }

    setIsAuthPass() {
        this.setState({
            isAuthPass : LoginStore.getIsAuthPass(),
        })
    }

    setShowLoadingBar(){
        this.setState({
            showLoginLoadingBar : LoginStore.getShowLoginLoadingBar(),
        })
    }

    setToggleEye(){
        this.setState({
            isShowPasswordEye : LoginStore.getIsShowEye(),
            inputType : (LoginStore.getIsShowEye())?'text':'password',
        });
    }

    toggleEyeStatus(){
        LoginAction.getIsShowEye();
    }

    clearValue(){
        this.setState({
            userName : ""
        })
    }

    getEncodePassword(){
        return LoginStore.createEncode(this.state.password);
    }

    getTextCloseStatus(){
        return ((this.state.isShowTextClose)?style.divAccountTextClose:null);
    }

    getPasswordEyeStatus(){
        return ((this.state.isShowPasswordEye)?'divPasswordEye':'divPasswordEyeOver');
    }

    getInputPasswordStatus(){
        return (this.state.inputType);
    }

    getAuthStatus(){
        return ((this.state.isAuthPass)?style.divVisibleHidden:style.divErrMsg);
    }

    getShowLogin(){
        return this.state.showLoginLoadingBar
            ? style.divLoadingPanel
            : style.divDisplayNone;
    }

    getShowLoginForm(){
        return (!this.state.showLoginLoadingBar)?style.divContentPanel:style.divDisplayNone;
    }


    loginTodo(e){
        e.preventDefault();
        if(this.state.userName == null){return}
        if(this.state.password == null){return}

        const data={
            userName:this.state.userName,
            password:this.getEncodePassword(),
            remmeChecked:(this.state.isRemmeChecked?'1':'0'),
            secureChecked:(this.state.isSecureChecked?'1':'0'),
        }

        LoginAction.doLogin(data);
        
    }

    renderCheckIcon(type,v) {
        let iStyle = {
            position:'absolute',
            left: '0',
            top: '2px',
            cursor: 'pointer'
        }
        let clickFuncObj = {
            Remme: this.handleRemmeChangeImg.bind(this),
            Secure: this.handleSecureChangeImg.bind(this),
        }
        let clickFunc = clickFuncObj[type];
        return v
        ? (
            <img src='img/login/check_mark_1.svg' style={iStyle} onClick={clickFunc} />
        )
        : (
            <img src='img/login/check_mark_0.svg' style={iStyle} onClick={clickFunc} />
        );
    }

    renderWave() {
        return (
            <div style={{position:'absolute',left:'0',bottom:'0',width:'100%'}}>
                <svg 
                    class="editorial"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink ="http://www.w3.org/1999/xlink"
                    viewBox="0 24 150 28"
                    preserveAspectRatio="none"
                >
                    <defs>
                    <path 
                        id="gentle-wave"
                        d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" 
                    />
                    </defs>
                    <g class="parallax">
                        <use xlinkHref="#gentle-wave" x="50" y="0" fill="rgba(255,255,255,0.2)"/>
                        <use xlinkHref="#gentle-wave" x="50" y="3" fill="rgba(255,255,255,0.4)"/>
                        <use xlinkHref="#gentle-wave" x="50" y="6" fill="rgba(255,255,255,0.7)"/>  
                    </g>
                </svg>
            </div>
            
        )
    }

    render(){

        let d1 = {
            fontSize:'14px',
            color:'#4C4C4C',
            lineHeight:'20px',
            cursor: 'default'
        }
        return(
            <div style={style.divContent}>
                <div style={this.getShowLoginForm()}>
                    <div className='divTutorialBox'>
                        <img src='img/login/login_pic.svg' style={{width:'100%',maxHeight:'450px',animation:'fadeIn 0.3s'}} />
                    </div>
                    <form style={style.divLoginBox} onSubmit={this.loginTodo.bind(this)}>
                        {/*<div style={style.divTitle}>
                            <span style={style.divSpanBold}>Cinema 28</span>
                        </div>*/}
                        <div>
                            <div style={{...d1,marginTop:'40px'}}>
                                {lang.getLang('Username')}
                            </div>
                            <div style={style.divRelative}>
                                <input type="text" key="inputFocusUn" value={this.state.userName} className='divAccountBoxUserName' onChange={this.handleUserNameChange.bind(this)} placeholder={lang.getLang('Username')} />
                                <div onClick={this.clearValue.bind(this)} style={this.getTextCloseStatus()}></div>
                            </div>

                            <div style={{...d1,marginTop:'15px'}}>
                                {lang.getLang('Password')}
                            </div>
                            <div style={style.divRelative}>
                                <input key="inputFocusPw" value={this.state.password} type={this.getInputPasswordStatus()} className='divAccountBoxUserPassword' onChange={this.handleUserPasswordChange.bind(this)} placeholder={lang.getLang('Password')} />
                                <div onClick={this.toggleEyeStatus.bind(this)} className={this.getPasswordEyeStatus()}></div>
                            </div>

                            <div style={{marginTop:'25px'}}>
                                <div style={{position:'relative'}}>
                                    <input type="checkbox" checked={this.state.isRemmeChecked} onChange={this.handleRemmeChange.bind(this)} style={style.divInputCheckbox} id="rememStatus"/>
                                    {this.renderCheckIcon('Remme',this.state.isRemmeChecked)}
                                    <label for="rememStatus" id="rememLabel" style={style.divLabel}>{lang.getLang('Remember me')}</label>
                                </div>
                                {/*<div style={{position:'relative',marginTop:'5px'}}>
                                    <input type="checkbox" checked={this.state.isSecureChecked} onChange={this.handleSecureChange.bind(this)} style={style.divInputCheckbox} id="secureStatus"/>
                                    {this.renderCheckIcon('Secure',this.state.isSecureChecked)}
                                    <label for="secureStatus" id="secureLabel" style={style.divLabel}>{lang.getLang('Secure login')}</label>
                                </div>*/}
                            </div>
                            <div style={this.getAuthStatus()}>{lang.getLang('Msg27')}</div>
                        </div>
                        <div style={style.divBtnBox}>
                            <button key="loginBtn" type="submit" className='divLoginBtn'>{lang.getLang('Login')}</button>
                        </div>
                    </form>
                </div>

                {this.renderWave()}
                
                <div style={this.getShowLogin()}>
                    <div style={style.divLoadingQicon}></div>
                    <div style={style.divLoadingTxt}>
                        <div>{lang.getLang('Loading')}...</div>
                    </div>
                </div>
            </div>
        );
    }
}

const style = {
    divLoadingPanel:{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        msFlexAlign: 'center',
        msFlexPack: 'center',
        width: '100%'
    },
    divLoadingQicon:{ 
        position: 'relative',
        background: 'rgba(0, 0, 0, 0) url("img/login/loading_Q_21.gif") no-repeat scroll 0 0' ,
        width:'21px',
        height:'21px',
    },
    divLoadingTxt:{ 
        position: 'relative',
        color: 'white',
        fontSize:'26px',
        marginLeft: '15px'
    },
    divContent : {
        margin:' 0 auto',
        height:'calc(100% - 54px)',
        //background: 'rgb(31, 39, 64)',
        backgroundImage: 'linear-gradient(-225deg, rgb(39, 49, 66) 0%, rgb(60, 64, 97) 34%, rgb(60, 64, 98) 64%, rgb(44, 52, 73) 100%)',
        //paddingTop:'40px',
        minHeight: '540px',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        msFlexAlign: 'center',
        position: 'relative'
    },
    divContentPanel : {
        //width: '1000px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        msFlexAlign: 'center',
        msFlexPack: 'center',
        zIndex: '2',
    },
    divTutorialP : {
        fontSize: '24px',
        marginBottom: '14px',
        padding: '0',
        textAlign: 'center',
        width: '400px',
    },
    divTutorialSmall : {
        fontSize: '13px',
        lineHeight: '20px',
        width: '400px',
    },
    divLoginBox : {
        position: 'relative',
        width:' 400px',
        height:' 400px',
        backgroundColor:'#FFF',
        borderRadius:'4px',
        display: 'flex',
        flexDirection: 'column',
        msFlexDirection:'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        msFlexAlign: 'center',
        msFlexPack: 'start',
        animation:'fadeIn 0.3s',
        
    },
    divTitle : {
        color:' #595757',
        fontSize:' 36px',
        textAlign:' center',
    },
    divSpanBold : {
        fontWeight:' bold',
    },
    divRelative : {
        position: 'relative',
        marginTop: '10px'
        
    },
    divVisibleHidden : {
        visibility: 'hidden',
        width: '240px'
    },
    divDisplayNone : {
        display: 'none',
    },
    divDisplayBlock : {
        display: 'block',
    },

    divAccountTextClose : {
        background: 'rgba(0, 0, 0, 0) url("img/login/btn_text_close.png") no-repeat left center' ,
        height: '100%',
        position: 'absolute',
        right: '5px',
        top: '0px',
        width: '14px',
        cursor:'pointer',
    },
    divInputCheckbox : {
        opacity: '0',
    },
    divLabel : {
        fontSize:' 14px',
        verticalAlign:' middle',
        color:' #4C4C4C',
        fontWeight: 'normal',
        cursor: 'pointer',
        paddingLeft: '14px'
    },
    divErrMsg : {
        fontSize:' 14px',
        color:' #ff5a00',
        visibility: 'unset',
        width: '240px'
    },
    divBtnBox : {
        marginTop: '20px'
    },
}