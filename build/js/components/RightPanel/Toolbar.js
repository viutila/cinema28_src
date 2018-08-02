import $ from 'jquery';
import React from "react";
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';

import { lang } from '../MultiLanguage/MultiLanguage';
import 'css/Toolbar.css';
import TypeSelector from './TypeSelector';

export default class Toolbar extends React.Component {

    /***************
     * Constructor *
     ***************/

    constructor() {
        super();
        this.toogleFilter = this.toogleFilter.bind(this);
        this.toogleMode = this.toogleMode.bind(this);
        this.getFilter = this.getFilter.bind(this);
        this.getMode = this.getMode.bind(this);
        this.state = {
            filter: MainStore.getFilter(),
            mode: MainStore.getMode()
        }
    }

    /*********************
     * Lifecycle Methods *
     *********************/

    componentWillMount() {
        MainStore.on('changeFilter', this.getFilter);
        MainStore.on('changeMode', this.getMode);
    }

    componentWillUnmount() {
        MainStore.removeListener('changeFilter', this.getFilter);
        MainStore.removeListener('changeMode', this.getMode);
    }

    /*************************************
     * Click Handlers and Event Handlers *
     *************************************/

    toogleFilter() {
        if (MainStore.isShowFilter() === true) {
            MainActions.hideFilter();
        } else {
            MainActions.showFilter();
        }
    }

    toogleMode() {
        if (MainStore.isShowMode() === true) {
            MainActions.hideMode();
        } else {
            MainActions.showMode();
        }
    }

    

    toogleMediaPlaylist() {
        if (MainStore.isShowMediaPlaylist() === true) {
            MainActions.hideMediaPlaylist();
        } else {
            /*if (MainActions.getCookie("CINEMA_MPLT_SHOW")==null)
                MainActions.toogleMPLTutorial();*/
            
            MainActions.showMediaPlaylist();
        }
    }

    /*****************************
     * Getter Methods for Render *
     *****************************/

    getFilterText() {
        const filterTextObj = {
            'all': lang.getLang('All'),
            'onair': lang.getLang('In Use'),
            'idle': lang.getLang('Idle')
        };
        return this.state.filter in filterTextObj ? filterTextObj[this.state.filter] : '';
    }

    getFilterIcon() {
        return this.state.filter === 'all' ? 'img/toolbar/slice/filter_0.svg' : 'img/toolbar/slice/filter_1.svg';
    }

    getModeIcon() {
        const iconObj = {
            'thumbnail': 'img/toolbar/slice/detailmode_list_1.svg',
            'list': 'img/toolbar/slice/toolbar_listview_normal.png',
            'simple': 'img/toolbar/slice/simplemode_list_1.svg',
            'virtual': 'img/toolbar/slice/toolbar_virtualdeviceview_normal.png'
        };
        return this.state.mode in iconObj ? iconObj[this.state.mode] : 'img/dummy.png';
    }

    getFilter() {
        this.setState({
            filter: MainStore.getFilter()
        });
    }

    getMode() {
        this.setState({
            mode: MainStore.getMode()
        });
    }

    /**********
     * Render *
     **********/

    render() {
        return (
            <div style={style.divToolbar}>
                <div style={{position:'relative',height:'100%',marginLeft:'60px'}}>
                    <button id='modeSelector' className='btn01' onClick={this.toogleMode} data-tip={lang.getLang('Change view mode')}>
                        <img id='modeSelector' src={this.getModeIcon() } style={style.btnMode} data-tip={lang.getLang('Change view mode')} draggable='false' />
                        <img id='modeSelector' src='img/arrow/arrowdown_0.svg' style={style.btnTriangle} draggable='false' />
                    </button>

                    <div style={style.divVerticalLine}></div>

                    <div style={style.divIconFilter}>
                        <img src={this.getFilterIcon() } style={style.iconFilter} data-tip={lang.getLang('Filter')} draggable='false' />
                    </div>
                    
                    <div style={style.divFilter}>
                        <div id='btnSelectFilter' key='btnSelectFilter' className='divSelect' onClick={this.toogleFilter}>
                            <p style={style.pFilter}>{this.getFilterText()}</p>
                            <img id='btnSelectFilter' src='img/arrow/arrowdown_0.svg' style={{position:'absolute',top:'8px',right:'8px'}} />
                        </div>
                    </div>

                    <TypeSelector />
                </div>
                <button id='mediaPlaylist' 
                        //className='btnMedialist' 
                        key='mediaPlaylist' 
                        onClick={this.toogleMediaPlaylist.bind(this) } 
                        data-tip={lang.getLang('Media list')} 
                        className='btnOpenMediaList'
                >
                    <img src='img/control_btn/playlist_0.svg' style={{marginRight:'10px'}} />
                    <p
                        style={{
                            color:'#FFFFFF',
                            fontSize:'14px',
                            margin:'0',
                            textOverflow:'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            maxWidth: '100px',
                        }}
                    >
                        {lang.getLang('Media list')}
                    </p>
                    <img src='img/arrow/arrowdown_0.svg' style={{marginLeft:'10px'}} />
                </button>
            </div>
        );
    }
};

const style = {
    divToolbar: {
        position: 'relative',
        width: '100%',
        height: '40px',
        //borderTop: '1px solid #D3D3D3',
        borderRight: 'none',
        //borderBottom: '1px solid #D3D3D3',
        borderLeft: 'none',
        //backgroundColor: '#F5F5F5',
        backgroundColor: 'rgb(31, 39, 64)',
        minWidth: '680px',
    },
    btnMode: {
        width: '25px',
    },
    btnTriangle: {
        margin: '0 0 0 3px'
    },
    divVerticalLine: {
        position: 'absolute',
        left: '45px',
        top: '10px',
        //width: '10px',
        height: '20px',
        borderTop: 'none',
        borderRight: '1px solid #D3D3D3',
        borderBottom: 'none',
        borderLeft: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    divIconFilter: {
        position: 'absolute',
        height: '100%',
        left: '51px',
        top: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        msFlexAlign: 'center',
        msFlexPack: 'center',
    },
    iconFilter: {
        width: '14px',
        height: '14px'
    },
    divFilter: {
        position: 'absolute',
        top: '8px',
        left: '70px',
        height: '24px',
        minWidth: '120px',
    },
    pFilter: {
        fontSize: '14px',
        lineHeight: '23px',
        margin: '0 0 0 8px',
        color:'#FFFFFF',
        cursor: 'pointer'
    },
};