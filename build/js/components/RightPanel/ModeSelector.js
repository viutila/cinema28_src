import React from "react";
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import 'css/ModeSelector.css';

/* Details Mode / Simple Mode */

export default class ModeSelector extends React.Component {

    /***************
     * Constructor *
     ***************/

    constructor() {
        super();
        this.setVisibility = this.setVisibility.bind(this);
        this.clickThumbnailModeHandler = this.clickThumbnailModeHandler.bind(this);
        this.clickListModeHandler = this.clickListModeHandler.bind(this);
        this.clickSimpleModeHandler = this.clickSimpleModeHandler.bind(this);
        this.getShown = this.getShown.bind(this);
        this.getMode = this.getMode.bind(this);
        this.state = {
            shown: MainStore.isShowMode(),
            mode: MainStore.getMode()
        }
    }

    /*********************
     * Lifecycle Methods *
     *********************/

    componentWillMount() {
        MainStore.on('toogleMode', this.getShown);
        MainStore.on('changeMode', this.getMode);
    }

    componentWillUnmount() {
        MainStore.removeListener('toogleMode', this.getShown);
        MainStore.removeListener('changeMode', this.getMode);
    }

    /*************************************
     * Click Handlers and Event Handlers *
     *************************************/

    clickThumbnailModeHandler() {
        MainActions.setMode('thumbnail');
    }

    clickListModeHandler() {
        MainActions.setMode('list');
    }

    clickSimpleModeHandler() {
        MainActions.setMode('simple');
    }

    /*****************************
     * Getter Methods for Render *
     *****************************/

    getShown() {
        this.setState({
            shown: MainStore.isShowMode()
        });
    }

    getMode() {
        this.setState({
            mode: MainStore.getMode()
        });
    }

    getIconStyle(v) {
        if (v === this.state.mode) {
            return style.iconFocus;
        } else {
            return style.iconNormal;
        }
    }

    getTextStyle(v) {
        if (v === this.state.mode) {
            return style.textModeFocus;
        } else {
            return style.textModeNormal;
        }
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
            <div
                id='modeSelector'
                style={{...style.divModeSelector,...isShownStyle}}
            >
                <button
                    key='thumbnail'
                    className='divModeItem'
                    onClick={this.clickThumbnailModeHandler }
                >
                    <img
                        src='img/toolbar/dropdown/slice/check_list_1.svg'
                        style={this.getIconStyle('thumbnail') }
                        draggable='false'
                    />
                    <img
                        src='img/toolbar/slice/detailmode_list_1.svg'
                        style={style.iconMode }
                        draggable='false'
                    />
                    <p style={this.getTextStyle('thumbnail') }>{lang.getLang('Details mode')}</p>
                </button><br />
                <button
                    key='simple'
                    className='divModeItem'
                    onClick={this.clickSimpleModeHandler}
                >
                    <img
                        src='img/toolbar/dropdown/slice/check_list_1.svg'
                        style={this.getIconStyle('simple')}
                        draggable='false'
                    />
                    <img
                        src='img/toolbar/slice/simplemode_list_1.svg'
                        style={style.iconMode}
                        draggable='false'
                    />
                    <p style={this.getTextStyle('simple') }>{lang.getLang('Simple mode')}</p>
                </button><br />
            </div>
        );
    }
};

const style = {
    divModeSelector: {
        position: 'absolute',
        lineHeight: '0px',
        top: '94px',
        left: '60px',
        //border: '1px solid #B0B0B0',
        backgroundColor: '#4B5266',
        padding: '16px 0 16px 0',
        zIndex: '1',
        borderRadius: '4px',
        boxShadow: '0 6px 12px rgba(0,0,0,0.175)',
        opacity: '0',
        transition: 'all 0.3s ease',
    },

    iconFocus: {
        width: '22px',
        height: '22px',
        visibility: 'inherit',
    },

    iconNormal: {
        width: '22px',
        height: '22px',
        visibility: 'hidden'
    },

    iconMode: {
        width: '22px',
        height: '22px',
    },

    textModeFocus: {
        float: 'left',
        display: 'inline-block',
        fontSize: '14px',
        lineHeight: '28px',
        fontWeight: '600',
        margin: '0 0 0 10px',
        color: '#FFFFFF'
    },

    textModeNormal: {
        float: 'left',
        display: 'inline-block',
        fontSize: '14px',
        lineHeight: '28px',
        margin: '0 0 0 10px',
        color: '#FFFFFF'
    },
};
