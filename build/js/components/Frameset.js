import React from "react";
//import Bootstrap from "bootstrap";
import * as MainActions from "../actions/MainActions";
import LoginStore from "../stores/LoginStore";
import * as LoginAction from "../actions/LoginAction";
import { lang } from './MultiLanguage/MultiLanguage';
import 'css/Frameset.css';
import FilterSelector from './RightPanel/FilterSelector';
import ModeSelector from './RightPanel/ModeSelector';
import FontAwesome from 'react-fontawesome';
import BluetoothPanel from './RightPanel/BluetoothPanel/BluetoothPanel';
import CustomScrollBar01 from './Common/CustomScrollBar01';

export default class Frameset extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            //isLogin : ((MainActions.getSid() != null)?true:false),
            isLogin: this.props.isLogin,
            isShowDropdownMenu : LoginStore.getIsShowDropdownMenu(),
            isShowLogout : LoginStore.getIsShowLogout(),
            loginUserName : LoginStore.getUserName(),
            userIconPath : LoginStore.getUserIconPath(),
            refreshBtnStyle: {animation: ''},
        }
    }

    getIsLoginStatus(){
        return (this.state.isLogin?style.divDisplayBlock:style.divDisplayNone);
    }
    getIsLoginStatus2() {
        return (this.state.isLogin?style.divRefreshHelp:style.divDisplayNone);
    }

    getIsLoginStatus3() {
        return (this.state.isLogin ? null : style.divDisplayNone);
    }

    getIsLoginStatus4() {
        return (this.state.isLogin ? null : {marginTop: '16px'});
    }

    getIsLoginStatus5() {
        return (this.state.isLogin ? {display:'block'} : {display:'none'});
    }

    getIsShowDropdownMenu(){
        return (this.state.isShowDropdownMenu?style.dropdownMenu:style.divDisplayNone);
    }

    getIsShowAdmin(){
        let isInWindow = false;
        if(window.parent != window){
            isInWindow = true;
        }
        return (isInWindow?style.divDisplayNone:style.UserInfoBox);
    }

    getIsShowLogout(){
        return (this.state.isShowLogout?style.userDropdownIcon:style.divDisplayNone);
    }

    componentWillMount(){
        LoginStore.on("validateAuthPass", () => {
            this.setState({
                isLogin : LoginStore.getValidateAuthPass(),
                loginUserName : LoginStore.getUserName(),
            });
            this.setUserIconPath();
        });
        LoginStore.on("isShowLogout", () => {
            this.setState({
                isShowLogout : LoginStore.getIsShowLogout(),
            })
        });
        LoginStore.on("isShowDropdownMenu", () => {
            this.setState({
                isShowDropdownMenu : LoginStore.getIsShowDropdownMenu(),
            })
        });
        LoginStore.on("getUserIconPath", () => {
            this.setState({
                userIconPath : LoginStore.getUserIconPath(),
            });
        });
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isLogin: nextProps.isLogin,
        })
    }

    setUserIconPath(){
        LoginAction.getUserIconPath();
        
    }

    toggleDropdownMenu(){
        if(!this.state.isShowDropdownMenu){
            LoginAction.toggleDropdownMenu(true);
        }else{
            LoginAction.toggleDropdownMenu(false);
        }
    }

    doLogout(){
        LoginAction.doLogout();
    }

    toogleAbout() {
        MainActions.showAbout();
    }

    toogleHelp() {
        MainActions.showHelp();
    }

    toogleQuickStart() {
        MainActions.showQuickStart();
    }

    toogleSchool() {
        MainActions.showSchool();
    }

    refreshClick() {
        MainActions.refreshPage();

        this.setState({
            refreshBtnStyle: {animation: 'spin 1s linear 2'}
        });
        setTimeout(function() {
            this.setState({
                refreshBtnStyle: {animation: ''}
            }); 
        }.bind(this), 2000);
    }

    changeLang(v) {
        console.log("change Language:",v);
        this.refreshClick();
        lang.changeLang(v);
        MainActions.setCookie("cinema28_lang",v,1000);
    }

    renderMoreMenu() {
        var languageMenu = null;
        const langAry = [ 
            ['ENG','English'],
            ['SCH','简体中文'],
            ['TCH','繁體中文'],
            ['CZE','Czech'],
            ['DAN','Dansk'],
            ['GER','Deutsch'],
            ['SPA','Español'],
            ['FRE','Français'],
            ['ITA','Italiano'],
            ['JPN','日本語'],
            ['KOR','한글'],
            ['NOR','Norsk'],
            ['POL','Polski'],
            ['RUS','Русский'],
            ['FIN','Suomi'],
            ['SWE','Svenska'],
            ['DUT','Nederlands'],
            ['TUR','Turk dili'],
            ['THA','ไทย'],
            ['POR','Português'],
            ['HUN','Magyar'],
            ['GRK','Ελληνικά'],
            ['ROM','Română'],
        ];
        
        if(window.parent == window){
            var cinema28Lang = MainActions.getCookie("cinema28_lang");
            var listAry = [];
            langAry.forEach((element,i)=>{
                var tmp;
                if (element[0] == cinema28Lang) {
                    tmp = (
                        <li key={i+777}>
                            <img src='img/frameset/slice/toolbar_dropdown_select_normal.png' style={{position:'absolute',margin:'6px 0 0 10px'}} />
                            <a style={{lineHeight:'28px',padding:'0 35px',margin:'8px 0',cursor:'pointer'}} onClick={this.changeLang.bind(this,element[0])}>{element[1]}</a>
                        </li>
                    );
                } else {
                    tmp = (<li key={i+777}><a style={{lineHeight:'28px',padding:'0 35px',margin:'8px 0',cursor:'pointer'}} onClick={this.changeLang.bind(this,element[0])}>{element[1]}</a></li>);
                }
                listAry.push(tmp);
            })
            languageMenu = (
                <li class="dropdown-submenu">
                    <a style={{...this.getIsLoginStatus4(),lineHeight:'28px',padding:'0 22px',marginBottom:'8px',cursor:'pointer'}}>
                        <img src='img/frameset/slice/framset_language.svg' style={style.menuTitleImage} />
                        {lang.getLang('Language')}
                        <FontAwesome
                            name='angle-right'
                            style={{fontSize:'22px',color:'#6d6d6d',position:'absolute',top:'2px',right:'20px'}}
                        />
                    </a>
                    <ul class="dropdown-menu dropdown-menu-frameset scrollable-menu dropdown-menu01 dropdown-menu02" style={{right:'100%',left:'auto'}}>
                        {listAry}
                    </ul>
                </li>
            )
        }

        return (
            <div style={style.divMore}>
                <button className="btnMore" id="More_FrameSet" role="button" data-toggle="dropdown" data-tip={lang.getLang('More')} >
                </button>
                <ul
                    class="dropdown-menu multi-level dropdown-menu-frameset dropdown-menu01"
                    role="menu"
                    aria-labelledby="dropdownMenu"
                >
                    <li>
                        <a
                            style={{
                                ...this.getIsLoginStatus3(),
                                lineHeight:'28px',
                                padding:'0 22px',
                                marginTop:'16px',
                                marginBottom:'8px',
                                cursor:'pointer'
                            }}
                            onClick={this.toogleQuickStart.bind(this)}
                        >
                            <img src='img/frameset/slice/frameset_quick_start.svg' style={style.menuTitleImage} />
                            {lang.getLang('Quick Start')}
                        </a>
                    </li>
                    {/*<li>
                        <a style={{...this.getIsLoginStatus3(),lineHeight:'28px',padding:'0 22px',marginBottom:'8px',cursor:'pointer'}} onClick={this.toogleSchool.bind(this)}>
                            <img src='img/school/hat_small.svg' style={style.menuTitleImage} />{lang.getLang('Little Tutor')}
                        </a>
                    </li>*/}
                    {languageMenu}
                    <li>
                        <a
                            style={{
                                lineHeight:'28px',
                                padding:'0 22px',
                                marginBottom:'8px',
                                cursor:'pointer'
                            }}
                            onClick={this.toogleHelp.bind(this)}
                        >
                            <img src="img/frameset/slice/frameset_help.svg" style={style.menuTitleImage} />
                            {lang.getLang('Online help')}
                        </a>
                    </li>
                    <li>
                        <a
                            style={{
                                lineHeight:'28px',
                                padding:'0 22px',
                                marginBottom:'16px',
                                cursor:'pointer'
                            }}
                            onClick={this.toogleAbout.bind(this)}
                        >
                            <img src='img/frameset/slice/frameset_about.svg' style={style.menuTitleImage} />
                            {lang.getLang('About')}
                        </a>
                    </li>
                </ul>
            </div>
        );
    }

    renderLogo() {
        var rst = null;
        var isInWindow = (window.parent == window) ? true : false;
		var nasLang = MainActions.getCookie("nas_lang");
		var cinema28Lang = MainActions.getCookie("cinema28_lang");

        rst = this.ifTch()
            ? (<img src='img/frameset/logo_text_cht.svg' style={style.wordImgTCH} draggable='false' />) 
            : (<img src='img/frameset/logo_text_en.svg' style={style.wordImgTCH} draggable='false' />) ;
        return rst;
    }

    ifTch() {
        var rst = null;
        var isInWindow = (window.parent == window) ? true : false;
		var nasLang = MainActions.getCookie("nas_lang");
		var cinema28Lang = MainActions.getCookie("cinema28_lang");

		if (isInWindow) {
            rst = cinema28Lang === 'TCH';
		} else {
            rst = nasLang === 'TCH';
		}
        return rst;
    }

    clickDW() {
        MainActions.toggleDeviceWizard(true);
    }

    render() {
        /*let betaUrl = this.ifTch()
            ? 'https://www.qnap.com/event/2017/cinema28-beta-and-partnership-proposal-program/zh-tw/'
            : 'https://www.qnap.com/event/2017/cinema28-beta-and-partnership-proposal-program/en/';*/
        return (
            <div style={style.divFrameset}>
                <div style={style.divGradient}></div>
                <div style={style.divMain}>
                    <div
                        style={{
                            position: 'absolute',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            msFlexAlign: 'center',
                            msFlexPack: 'center',
                        }}
                    >
                        
                        { this.renderLogo() }
                        
                        {   // For Beta Version
                            /*<img src="img/frameset/beta.svg" style={{height:'26px'}} draggable='false' alt=""/>*/
                        }
                    </div>
                    { this.renderMoreMenu() }

                    <div style={this.getIsLoginStatus2()}>
                        <button className="btnRefresh" onClick={this.refreshClick.bind(this)} data-tip={lang.getLang('Refresh')} style={this.state.refreshBtnStyle} />
                        {/*<button style={style.btnHelp} data-tip={lang.getLang('Online help')} onClick={this.toogleHelp.bind(this)} />*/}
                    </div>

                    <div style={this.getIsLoginStatus()}>
                        <div style={style.floatRight}>
                            <div style={this.getIsShowAdmin()}>
                                {/*<div style={style.boxline}></div>*/}
                                <div style={{...style.userIcon,backgroundImage:'url('+this.state.userIconPath+')'}}></div>
                                <div id="logoutMenuUserName" style={style.userName} onClick={this.toggleDropdownMenu.bind(this)}>{this.state.loginUserName}</div>
                                <div id="logoutMenu" style={this.getIsShowLogout()} onClick={this.toggleDropdownMenu.bind(this)}>
                                    <img id="logoutMenuImg" src='img/arrow/arrowdown_0.svg' onClick={this.toggleDropdownMenu.bind(this)} />
                                    <ul style={this.getIsShowDropdownMenu()}>
                                        <li key={123} className='dropdownLi' onClick={this.doLogout.bind(this)}>
                                            <a key="dropdownItem" className='dropdownItem'>
                                                <img src='img/frameset/slice/Logout.png' style={style.menuTitleImage} />
                                                {lang.getLang('Logout')}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {   //For Beta Version
                        /*<div style={this.getIsLoginStatus5()}>
                            <div style={{
                                    position: 'absolute',
                                    right: '340px',
                                    top: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    msFlexAlign: 'center',
                                    msFlexPack: 'center',
                                }}
                            >
                                <img src="img/frameset/join_beta_0.svg" style={{marginRight:'5px'}} draggable='false' />
                                <a
                                    className='whiteLinkBeta'
                                    href={betaUrl}
                                    target="_blank"
                                    draggable='false'
                                    data-tip={lang.getLang('Join Beta program')}
                                >
                                    {lang.getLang('Join Beta program')}
                                </a>
                            </div>
                        </div>*/
                    }

                    <div style={this.getIsLoginStatus5()}>
                        <BluetoothPanel />
                    </div>

                    <div style={this.getIsLoginStatus5()}>
                        <button 
                            className='btnDeviceWizard' 
                            onClick={this.clickDW.bind(this)} 
                            style={{position:'absolute',top:'8px',right:'240px'}}
                            data-tip={lang.getLang('Device Wizard')}
                        />
                    </div>
                    
                </div>
                <FilterSelector />
                <ModeSelector />
            </div>
        );
    }
};

const style = {
    menuTitleImage:{
        marginTop: '-4px',
        marginRight: '14px',
        width: '16px',
        height: '16px',
    },
    divRefreshHelp: {
        position: 'relative',
        margin: '10px 15px 0 0',
        border: '0',
        float: 'right'
    },
    divDisplayNone: {
        display: 'none',
    },
    divDisplayBlock: {
        display: 'block',
        position: 'relative',
    },
    divFrameset: {
        position: 'relative',
        height: '54px',
        minWidth: '760px',
    },
    divGradient: {
        position: 'relative',
        height: '8px',
        backgroundColor: 'rgb(31, 39, 64)',
    },
    divMain: {
        position: 'relative',
        height: '46px',
        backgroundColor: 'rgb(31, 39, 64)',
    },
    iconImg: {
        position: 'relative',
        width: '28px',
        height: '28px',
        left: '30px',
    },
    wordImgTCH: {
        position: 'relative',
        marginLeft: '60px'
    },
    divTitle: {
        position: 'absolute',
        height: '28px',
        left: '70px',
        margin: '8px 0 0 0'
    },
    titleText: {
        fontWeight: 'bold',
        color: '#194dac',
        fontSize: '24px',
        lineHeight: '28px'
    },
    btnHelp: {
        position: 'relative',
        width: '20px',
        height: '20px',
        marginRight: '15px',
        border: '0',
        background: 'url(img/frameset/slice/frameset_help.png) top left / cover no-repeat',
    },

    divMore: {
        position: 'relative',
        width: '20px',
        height: '20px',
        margin: '10px 25px 0 0',
        border: '0',
        float: 'right',
    },

    floatRight: {
        float: 'right',
        marginTop:'10px'

    },
    divDisplayInlineBlock:{
        display: 'inline-block',
    },
    UserInfoBox:{
        display: 'inline-block',
        marginRight: '20px',
        marginLeft: '25px',
        verticalAlign:'bottom',
        position: 'relative'
    },
    userIcon: {
        width: '27px',
        height: '27px',
        backgroundSize: '100%',
        display: 'inline-block',
        verticalAlign:'middle',
        marginLeft: '25px',
        marginRight: '15px',
        backgroundImage: 'url(img/frameset/slice/frameset_admin_normal.svg)'
    },
    userName: {
        display: 'inline-block',
        verticalAlign:'middle',
        cursor: 'pointer',
        color: '#FFFFFF',
    },
    userDropdownIcon: {
        display: 'inline-block',
        verticalAlign:'middle',
        position: 'relative',
        cursor: 'pointer',
        paddingLeft: '5px',
    },
    boxline: {
        border: '1px solid #2f2f2f',
        bottom: '-9px',
        height: '30px',
        position: 'absolute',
        width: '1px',
    },
    dropdownMenu: {
        listStyle: 'none',
        position: 'absolute',
        top: '30px',
        right: '0',
        zIndex: '5',
        backgroundColor:'#FFFFFF',
        outline:'1px solid #b0b0b0',
        padding:'16px 0',
        width:'160px',
    },
};