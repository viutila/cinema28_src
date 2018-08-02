import React from "react";
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import 'css/ModeSelector.css';

/* 全部 播放中 閒置 filter */

export default class FilterSelector extends React.Component {

    /***************
     * Constructor *
     ***************/

    constructor() {
        super();
        this.setVisibility = this.setVisibility.bind(this);
        this.getShown = this.getShown.bind(this);
        this.getFilter = this.getFilter.bind(this);
        this.devicesNumByStreamingStatus = this.devicesNumByStreamingStatus.bind(this);
        this.state = {
            shown: MainStore.isShowFilter(),
            filter: MainStore.getFilter(),
            devicesNumByStreamingStatus: MainStore.getDevicesNumByStreamingStatus()
        }
    }

    /*********************
     * Lifecycle Methods *
     *********************/

    componentWillMount() {
        this.setVisibility();
        MainStore.on('toogleFilter', this.getShown);
        MainStore.on('changeFilter', this.getFilter);
        MainStore.on('updateDevicesNumByStreamingStatus', this.devicesNumByStreamingStatus)
    }

    componentWillUnmount() {
        MainStore.removeListener('toogleFilter', this.getShown);
        MainStore.removeListener('changeFilter', this.getFilter);
        MainStore.removeListener('updateDevicesNumByStreamingStatus', this.devicesNumByStreamingStatus);
    }

    /*************************************
     * Click Handlers and Event Handlers *
     *************************************/
    clickAllFilterHandler(v) {
        if (this.state.devicesNumByStreamingStatus[v]===0) {
            return false;
        } else {
            MainActions.setFilter(v);
        }
    }
    /*****************************
     * Getter Methods for Render *
     *****************************/

    getShown() {
        this.setState({
            shown: MainStore.isShowFilter()
        });
    }

    getFilter() {
        this.setState({
            filter: MainStore.getFilter()
        });
    }

    devicesNumByStreamingStatus() {
        this.setState({
            devicesNumByStreamingStatus: MainStore.getDevicesNumByStreamingStatus()
        });
    }

    getIconStyle(v) {
        if (v === this.state.filter) {
            return style.iconFocus;
        } else {
            return style.iconNormal;
        }
    }

    getTextStyle(v) {
        if (v === this.state.filter) {
            return style.textFilterFocus;
        } else {
            if (this.state.devicesNumByStreamingStatus[v]===0) {
                return style.textFilterDisable;
            } else {
                return style.textFilterNormal;
            }
            
        }
    }

    getBtnClassName(v) {
        let devCnt = this.state.devicesNumByStreamingStatus[v];

        return devCnt===0
            ? 'divFilterItemDisable'
            : 'divFilterItem';

    }

    setVisibility() {
        let rst = {};
        if (this.state.shown) {
            rst = {
                visibility: 'visible',
                opacity: '1'
            }
        } else {
            rst = {
                visibility: 'hidden',
                opacity: '0'
            }
        }
        return rst;
    }

    /**********
     * Render *
     **********/

    render() {
        let isShownStyle =  this.setVisibility();
        return (
            <div id='filterSelector' style={{...style.divFilterSelector,...isShownStyle}}>
                <button key='all' className={this.getBtnClassName('all')} onClick={this.clickAllFilterHandler.bind(this,'all')}>
                    <img
                        src='img/toolbar/dropdown/slice/check_list_1.svg'
                        style={this.getIconStyle('all') }
                    />
                    <p style={this.getTextStyle('all') } >
                        {lang.getLang('All')} ({this.state.devicesNumByStreamingStatus['all']})
                    </p>
                </button><br />
                <button key='onair' className={this.getBtnClassName('onair')} onClick={this.clickAllFilterHandler.bind(this,'onair')}>
                    <img
                        src='img/toolbar/dropdown/slice/check_list_1.svg'
                        style={this.getIconStyle('onair') }
                    />
                    <p style={this.getTextStyle('onair') } >
                        {lang.getLang('In Use')} ({this.state.devicesNumByStreamingStatus['onair']})
                    </p>
                </button><br />
                <button key='idle' className={this.getBtnClassName('idle')} onClick={this.clickAllFilterHandler.bind(this,'idle')}>
                    <img
                        src='img/toolbar/dropdown/slice/check_list_1.svg'
                        style={this.getIconStyle('idle') }
                    />
                    <p style={this.getTextStyle('idle') } >
                        {lang.getLang('Idle')} ({this.state.devicesNumByStreamingStatus['idle']})
                    </p>
                </button><br />
            </div>
        );
    }
};

const style = {
    divFilterSelector: {
        position: 'absolute',
        lineHeight: '0px',
        top: '91px',
        left: '129px',
        border: '1px solid rgba(0,0,0,0.15)',
        backgroundColor: '#4B5266',
        padding: '16px 0 16px 0',
        zIndex: '1',
        minWidth: '122px',
        borderRadius:'4px',
        boxShadow: '0 6px 12px rgba(0,0,0,0.175)',
        transition: 'all 0.3s ease',
    },

    iconFocus: {
        width: '22px',
        height: '22px',
        visibility: 'inherit'
    },

    iconNormal: {
        width: '22px',
        height: '22px',
        visibility: 'hidden'
    },

    textFilterFocus: {
        float: 'left',
        display: 'inline-block',
        fontSize: '14px',
        lineHeight: '28px',
        fontWeight: '600',
        margin: '0 0 0 14px',
        color: '#FFFFFF'
    },

    textFilterNormal: {
        float: 'left',
        display: 'inline-block',
        fontSize: '14px',
        lineHeight: '28px',
        margin: '0 0 0 14px',
        color: '#FFFFFF'
    },
    textFilterDisable: {
        float: 'left',
        display: 'inline-block',
        fontSize: '14px',
        lineHeight: '28px',
        margin: '0 0 0 14px',
        color: 'rgba(255,255,255,0.25)',
        cursor: 'default'
    },
};