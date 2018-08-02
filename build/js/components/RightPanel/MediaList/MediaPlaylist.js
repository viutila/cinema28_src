import React from 'react';
import moment from 'moment';
import $ from "jquery";
import Bootstrap from "bootstrap";
import ScrollArea from 'react-scrollbar';
import ReactTooltip from 'react-tooltip';
import * as XMLParser from 'xml2js';

import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import * as CommonActions from "js/actions/CommonActions";
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import CustomScrollBar from 'js/components/Common/CustomScrollBar';
import CheckBox from './CheckBox';
import QsirchPanel from './QsirchPanel';
import FilterPanel from './FilterPanel';

import 'css/MediaPlaylist.css';
import './datepicker';
import 'css/datepicker.css';

export default class MediaPlaylist extends React.Component {
    constructor(props) {
        super(props);

        this.getShareDirs = this.getShareDirs.bind(this);
        this.getSubDirs = this.getSubDirs.bind(this);
        this.getMediaDirs = this.getMediaDirs.bind(this);
        this.errorGetMediaDirs = this.errorGetMediaDirs.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getSubDirsTotal = this.getSubDirsTotal.bind(this);
        this.getQpkgCenterXml = this.getQpkgCenterXml.bind(this);
        this.setMediaPlaylist = this.setMediaPlaylist.bind(this);
        

        this.state = {
            isOpenMPL: false,
            curPath: '/',
            shareDirs: {},
            subDirs: {},
            subDirsTotal: {},
            mediaDirs: {},
            selectAll: false,
            
            osBtnImgPath1: 'img/media_playlist/btn_open_station_normal.png',
            osBtnImgPath2: 'img/media_playlist/triangle_w_normal.png',
            ifLocalNas: false,

            //******* Filter Panel ******/
            isFilterPanelOpen: false,
            //******* *******/
            remoteCurItem: null,
            //******* QSirch Panel *******/
            isQsirchPanelOpen: false,

            filterType: filterTypeEnum.ALL,
            patternStr: '',

            isqSirchHintDivOpen: true,
            pcRadio: 'CurrDir',
            isMdfDatePanelOpen: false,
            isEnterMdfDatePanel: false,
            isEnterMdfTag: false,
            modifiedDate: '',
            isSupportQsirch: true,
            isScrollingLoading: true,  //if MainActions.....
            isRemoteScrollingLoading: true, //if Loading remote devices dir...
            isErrorGMD: false,
            isRemoteDevHint: false,
        }

        this.inputElement = [];
        this.shiftIndex = 0;
        this.scrollBottonCount = 1;
        this.checkArray = [];
        this.checkArrayMinus = [];

        this.filterPanelObj = null;
        this.qSirchPanelObj = null;
        this.searchInput = null;

        this.isqSirchHintOpened = false;
        this.currMediaProtocol = '';
    }

    /**
   * Lifecycle Methods
   */

    componentWillMount() {
        MainStore.on('getShareDirsDone', this.getShareDirs);
        MainStore.on('getSubDirsTotalDone', this.getSubDirsTotal);
        MainStore.on('getSubDirsDone', this.getSubDirs);
        MainStore.on('getMediaDirsDone', this.getMediaDirs);
        MainStore.on('errorGetMediaDirs', this.errorGetMediaDirs);
        MainStore.on('getQpkgCenterXmlDone', this.getQpkgCenterXml);
        MainStore.on('toogleMediaPlaylist', this.setMediaPlaylist);
    }

    componentDidMount() {
        //MainActions.getShareDirs();
        MainActions.getMediaDirs(1, 0);
        document.addEventListener('click', this.handleClick, false);
        //MainActions.getQpkgCenterXml();
        MainActions.getQDocRootXml();
        this.setMediaPlaylist();


        $('.datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            //inline: true,
            showOtherMonths: true,
            dayNamesMin: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'],
            monthNames: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12" ],
            firstDay: 1,
            hideIfNoPrevNext: true,
            prevText: "Earlier",
            nextText: "Earlier",
            showMonthAfterYear:true,
            showOn: "both",
            showButtonPanel: false,
            defaultDate: "0",
            buttonText: "",
        }).datepicker("setDate", new Date());

        $.datepicker._gotoToday = function(id) { 
            $(id).datepicker('setDate', new Date()).datepicker('hide').blur(); 
        };
    }

    componentWillUnmount() {
        MainStore.removeListener('getShareDirsDone', this.getShareDirs);
        MainStore.removeListener('getSubDirsTotalDone', this.getSubDirsTotal);
        MainStore.removeListener('getSubDirsDone', this.getSubDirs);
        MainStore.removeListener('getMediaDirsDone', this.getMediaDirs);
        MainStore.removeListener('errorGetMediaDirs', this.errorGetMediaDirs);
        document.removeEventListener('click', this.handleClick, false);
        MainStore.removeListener('getQpkgCenterXmlDone', this.getQpkgCenterXml);
        MainStore.removeListener('toogleMediaPlaylist', this.setMediaPlaylist);
    }

    setMediaPlaylist() {
        this.setState({
            isOpenMPL: MainStore.isShowMediaPlaylist()
        })
    }

    getQpkgCenterXml() {
        let rawQpkgcXml = MainStore.getQpkgCenterXml();
        let rawQdoc = MainStore.getQdocRootXml();

        let xmlDoc1 = XMLParser.parseString(rawQdoc, function (err, result) {
            this.qdocRootXml = result;
        }.bind(this));

        let xmlDoc2 = XMLParser.parseString(rawQpkgcXml, function (err, result) {
            this.qpkgCenterXml = result;
        }.bind(this));

        let modelName = this.qdocRootXml.QDocRoot.model[0].modelName[0];

        let itemArry = this.qpkgCenterXml.plugins.item;
        let qsirchItem = _.find(itemArry, function(o) { 
                            return o.internalName[0] === 'Qsirch'; 
                        });
        let playFormAry = qsirchItem.platform;
        let exclPlatformAry = [];
        for (let i=0; i<playFormAry.length; i++) {
            if (playFormAry[i].platformExcl) {
                exclPlatformAry = exclPlatformAry.concat(playFormAry[i].platformExcl);
            }
        }

        //console.log('modelName', modelName);
        //console.log('exclPlatformAry', exclPlatformAry);
        
        for (let i = 0; i < exclPlatformAry.length; i++) {
            if (exclPlatformAry[i] === modelName) {
                this.setState({
                    isSupportQsirch: false
                });
                console.log('Not Support Qsirch', modelName, exclPlatformAry);
            }
        }

    }

    handleClick(e) {
        /*if (e.target.tagName === 'IMG') {
            if (e.target.currentSrc.indexOf('checkbox') !== -1) {
                if(e.shiftKey) {
                    let parentTarget = e.target.parentElement.parentElement.parentElement;
                    let childCount = parentTarget.childElementCount;
                    for (let i=this.state.shiftIndex; i<childCount; i++) {
                        if (parentTarget.children[i].className !== 'folderDiv') {
                            parentTarget.children[i].click();
                        }
                    }

                }
            }
        }*/
        if (
            !this.state.isEnterMdfDatePanel
            && !document.getElementById("ui-datepicker-div").contains(e.target)
            && e.target.className.indexOf('ui-datepicker-next') < 0
            && e.target.className.indexOf('ui-datepicker-prev') < 0
        ) {
            this.setState({
                isMdfDatePanelOpen: false
            })
        }
    }


    getShareDirs() {
        this.setState({
            shareDirs: MainStore.getShareDirs(),
        });
    }

    getSubDirsTotal() {
        let rst = MainStore.getSubDirsTotal();
        let tmpAry = rst.items;
        let that = this;
        tmpAry.forEach(function(item,i) {
            let filePath = that.state.curPath + item.name;
            item.filePath = filePath;
        })
        this.setState({
            subDirsTotal: rst,
        });
    }

    getSubDirs() {
        this.setState({
            subDirs: MainStore.getSubDirs(),
            isScrollingLoading: false
        });
        /*let rst = MainStore.getSubDirs();
        let totalCnt = +rst.total;

        if (totalCnt > 0 && totalCnt > rst.items.length) {
            MainActions.getSubDirsTotal(this.state.curPath, totalCnt);
        }*/
    }

    getMediaDirs(ifLocal) {
        console.log('getMediaDirs Done in MediaPlaylist ifLocal:', ifLocal);
        if (ifLocal===1) {
            this.setState({
                mediaDirs:MainStore.getMediaDirs(),
                isScrollingLoading: false,
            });
            setTimeout(() => {
                MainActions.getMediaDirs(0,1);
            }, 1);
        } else {
            this.setState({
                isRemoteScrollingLoading: false,
                mediaDirs:MainStore.getMediaDirs(),
            });
        }
    }

    errorGetMediaDirs() {
        this.setState({
            isRemoteScrollingLoading: false,
            isScrollingLoading: false,
            isErrorGMD: true,
        });
    }

    dirOnClick(item) {
        var path = this.state.curPath + item + '/';
        path = path.replace('localNasFolder','')
        //console.log(path);
        this.setState({
            subDirs: {},
            isScrollingLoading: true,
            subDirsTotal: {},
            filterType: filterTypeEnum.ALL
        });
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.onClickAll(false);
        MainActions.getSubDirs(path);
        this.setState({
            curPath: path
        })
        this.inputElement = [];
        this.scrollBottonCount = 1;
        ReactTooltip.hide();
    }

    dirOnClick1(item, pMediaType) {

        if (this.currMediaProtocol !== pMediaType) {
            let inUseDevs = {
                'davfs': true,
                'davfs-fuse': true,
                'ftpfs': true,
                'cifs': true,
                'sshfs': true,
                'nfs': true,
                'afpfs': true,
            };
            let ifRemoteHint = inUseDevs[ pMediaType ] || false;
            if (ifRemoteHint) {
                this.setState({
                    isRemoteDevHint: true
                });
            }
        }

        this.currMediaProtocol = pMediaType;

        if (item.fullpath === '') {
            CommonActions.toggleMsgPopup(
                true, 
                'info',
                lang.getLang('Unable_to_connect_to'),
                'Y', 
                lang.getLang('OK'), 
                lang.getLang('No'),
                function(){
                    CommonActions.toggleMsgPopup(false);

                },
                function(){
                    CommonActions.toggleMsgPopup(false);
                }
            )
        }
        var path1 = item.fullpath + '/';
        //console.log(path);
        this.setState({
            subDirs: {},
            isScrollingLoading: true,
            subDirsTotal: {},
            ifLocalNas: false,
            remoteCurItem: item, 
            filterType: filterTypeEnum.ALL          
        });
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.onClickAll(false);
        MainActions.getSubDirs(path1);
        this.setState({
            curPath: path1
        })
        this.inputElement = [];
        this.scrollBottonCount = 1;
        ReactTooltip.hide();
    }

    dirOnClick2() {
        //var path1 = path + '/';
        //console.log(path);
        this.currMediaProtocol = '';
        this.setState({
            subDirs: {},
            //isScrollingLoading: true,
            subDirsTotal: {},
            ifLocalNas: true,
            filterType: filterTypeEnum.ALL
        });
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.onClickAll(false);
        //MainActions.getSubDirs(path1);
        this.setState({
            curPath: 'localNasFolder'
        })
        this.inputElement = [];
        this.scrollBottonCount = 1;
        ReactTooltip.hide();
    }

    renderDirList() {
        var tmpItemArray = this.state.shareDirs.items;
        if (typeof tmpItemArray == 'undefined' || tmpItemArray.length == 0)
            return null;
        var dirListArray = [];
        tmpItemArray.forEach((item,i)=>{
            dirListArray.push(
                <div className='folderDiv' onClick={this.dirOnClick.bind(this,item)} key={i}>
                    <div style={{float:'left',height:'100%'}}>
                        <img src={fileTypeIcon.folder} style={folderIconStyle} />
                    </div>
                    <div style={{float:'left',height:'100%'}}>
                        <span style={folderSpan} data-tip={item}>{item}</span>
                    </div>
                </div>
            );
        })
        return (
            <div>
                {dirListArray}
            </div>
        );
    }

    handleNasFolder(value,key) {
        //console.log('123456');
        let rst = null;
        let lastIndex = value.fullpath.lastIndexOf('/');
        let folderName = (value.fullpath).substr(lastIndex+1);
        switch(value.class) {
            case 'folder': {
                break;
            }
            case 'external': {
                rst = (
                    <div className='folderDiv' onClick={this.dirOnClick1.bind(this,value,'external')} key={key}>
                        <div style={{float:'left',height:'100%'}}>
                            <img src={deviceTypeIcon.external} style={folderIconStyle} />
                        </div>
                        <div style={{float:'left',height:'100%'}}>
                            <span style={folderSpan} data-tip={folderName}>{folderName}</span>
                        </div>
                    </div>
                )
                break;
            }
            case 'odd': {   //光碟
                rst = (
                    <div className='folderDiv' onClick={this.dirOnClick1.bind(this,value,'odd')} key={key}>
                        <div style={{float:'left',height:'100%'}}>
                            <img src={deviceTypeIcon.odd} style={folderIconStyle} />
                        </div>
                        <div style={{float:'left',height:'100%'}}>
                            <span style={folderSpan} data-tip={folderName}>{folderName}</span>
                        </div>
                    </div>
                )
                break;
            }
            case 'iso': {   //ISO File
                rst = (
                    <div className='folderDiv' onClick={this.dirOnClick1.bind(this,value,'iso')} key={key}>
                        <div style={{float:'left',height:'100%'}}>
                            <img src={deviceTypeIcon.iso} style={folderIconStyle} />
                        </div>
                        <div style={{float:'left',height:'100%'}}>
                            <span style={folderSpan} data-tip={folderName}>{folderName}</span>
                        </div>
                    </div>
                )
                break;
            }
            case 'mtp': {   //Mobile Device
                rst = (
                    <div className='folderDiv' onClick={this.dirOnClick1.bind(this,value,'mtp')} key={key}>
                        <div style={{float:'left',height:'100%'}}>
                            <img src={deviceTypeIcon.mtp} style={folderIconStyle} />
                        </div>
                        <div style={{float:'left',height:'100%'}}>
                            <span style={folderSpan} data-tip={folderName}>{folderName}</span>
                        </div>
                    </div>
                )
                break;
            }
        }
        return rst;
    }

    renderRemoteItem(value, key, imgSrc, pMediaType) {
        return (
            <div className='folderDiv' onClick={this.dirOnClick1.bind(this,value,pMediaType)} key={key}>
                <div style={{float:'left',height:'100%'}}>
                    <img src={imgSrc} style={folderIconStyle} />
                </div>
                <div style={{float:'left',height:'100%'}}>
                    <span style={folderSpan} data-tip={value.display}>{value.display}</span>
                </div>
            </div>
        )
    }

    handleRemoteFolder(value,key) {
        //console.log('123456');
        let rst = null;
        switch(value.protocol) {
            /*case 'googledrive': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIcon.googleDrive);
                break;
            }*/
            /*case 'onedrive': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIcon.oneDrive);
                break;
            }
            case 'dropbox': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIcon.dropbox);
                break;
            }
            case 'amazonclouddrive': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIcon.amazonDrive);
                break;
            }
            case 'yandex': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIcon.yandexDisk);
                break;
            }
            case 'box': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIcon.box);
                break;
            }
            case 'onedriveforbusiness': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIcon.oneDriveBusiness);
                break;
            }
            case 'hidrive': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIcon.hiDrive);
                break;
            }*/
            case 'davfs': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIconNonCloud.davfs,value.protocol);
                break;
            }
            //******* Non cloud devices *******//
            case 'davfs-fuse': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIconNonCloud.davfs,value.protocol);
                break;
            }
            case 'ftpfs': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIconNonCloud.ftpfs,value.protocol);
                break;
            }
            case 'cifs': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIconNonCloud.cifs,value.protocol);
                break;
            }
            case 'sshfs': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIconNonCloud.sshfs,value.protocol);
                break;
            }
            case 'nfs': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIconNonCloud.nfs,value.protocol);
                break;
            }
            case 'afpfs': {
                rst = this.renderRemoteItem(value,key,remoteDeviceTypeIconNonCloud.afpfs,value.protocol);
                break;
            }
            default: {
                break;
            }
        }
        return rst;
    }

    renderMediaDir() {
        let content = this.state.mediaDirs.content;
        if (typeof content == 'undefined' || content.length == 0)
            return null;

        /*let externalDevice = _.filter(content.local, {class: 'external'});
        let oddDevice = _.filter(content.local, {class: 'odd'});
        let isoDevice = _.filter(content.local, {class: 'iso'});
        let mtpDevice = _.filter(content.local, {class: 'mtp'});*/

        //******* Local Devices Array *******/
        let localDeviceArray = [] ;
        let gg = this.handleNasFolder.bind(this);
        _.forEach(content.local, function(value,key) {
            let item = gg(value,key);
            if (item != null) {
                localDeviceArray.push(item)
            }
        });
        //******* Local Nas *******/
        let localNasItem = (
            <div className='folderDiv' onClick={this.dirOnClick2.bind(this)} key='localNasItem'>
                <div style={{float:'left',height:'100%'}}>
                    <img src={deviceTypeIcon.folder} style={folderIconStyle} />
                </div>
                <div style={{float:'left',height:'100%'}}>
                    <span style={folderSpan} data-tip={content.nas_name}>{content.nas_name}</span>
                </div>
            </div>
        );
        //******* Remote Devices Array *******/
        let remoteDeviceArray = [];
        let yy = this.handleRemoteFolder.bind(this);
        /*let tmpAry = content.remote.slice();
        tmpAry.push({
            display:"amazonclouddrive (johnchen@qnap.com)",
            fullpath:"",
            owner_uid:"0",
            protocol:"amazonclouddrive",
            uuid:"201470471f909830dde105a9a2904c78f91f2576"
        })*/
        _.forEach(content.remote, function(value,key) {
            let item = yy(value,key);
            if (item != null) {
                remoteDeviceArray.push(item)
            }
        });


        return (
            <div>
                {localNasItem}
                {localDeviceArray}
                {remoteDeviceArray}
            </div>
        );
    }

    renderLocalNasFolder() {
        let content = this.state.mediaDirs.content;
        if (typeof content == 'undefined' || content.length == 0)
            return null;

        let localNasFolderArray = _.filter(content.local, {class: 'folder'});
        let dirListArray = [];

        localNasFolderArray.forEach(function(item,i){
            let lastIndex = item.fullpath.lastIndexOf('/');
            let folderName = (item.fullpath).substr(lastIndex+1);
            if (this.state.filterType === filterTypeEnum.ALL)
                dirListArray.push(
                    <div className='folderDiv' onClick={this.dirOnClick.bind(this,item.fullpath)} key={i}>
                        <div style={{float:'left',height:'100%'}}>
                            <img src={fileTypeIcon.folder} style={folderIconStyle} />
                        </div>
                        <div style={{float:'left',height:'100%'}}>
                            <span style={folderSpan} data-tip={folderName}>{folderName}</span>
                        </div>
                    </div>
                );
        }.bind(this));
        return dirListArray;
    }

    setCheckArray(flag, item) {
        //event.stopPropagation();
        var tmpAry = this.checkArray;
        let tmpFilePathAry = [];
        tmpAry.forEach((item,i)=>{
            tmpFilePathAry.push(item.filePath);
        })

        if (flag) {
            var index = tmpFilePathAry.indexOf(item.filePath);
            if (index == -1) {
                tmpAry.push(item);
                this.checkArray = tmpAry;
            }
        } else{
            var index = tmpFilePathAry.indexOf(item.filePath);
            if (index > -1) {
                tmpAry.splice(index, 1);
            }
            this.checkArray = tmpAry;
        }
        //console.log(this.state.checkArray);
    }

    itemOnClick(i,e) {
        //event.stopPropagation();
        //console.log(i);
 
        if(e.shiftKey) {
            if ( i>= this.shiftIndex) {
                this.inputElement.forEach(function(item,idx) {
                    if (item[0] <= i && item[0] >= this.shiftIndex) {
                        if (item[1] !== null) {
                            item[1].handleClickTrue();

                            if (this.state.selectAll) {
                                let comp = item[1];
                                let index = this.checkArrayMinus.indexOf(comp.props.filePath);
                                if (index > -1) {
                                    this.checkArrayMinus.splice(index, 1);
                                }
                            }
                        }
                    } else {
                        if (item[1] !== null) {
                            item[1].handleClickFalse();
                            
                            if (this.state.selectAll) {
                                let comp = item[1];
                                let index = this.checkArrayMinus.indexOf(comp.props.filePath);
                                if (index === -1) {
                                    this.checkArrayMinus.push(comp.props.filePath);
                                }
                            }
                        }
                            
                    }
                }.bind(this));
            } else if ( i < this.shiftIndex ) {
                this.inputElement.forEach(function(item,idx) {
                    if (item[0] >= i && item[0] <= this.shiftIndex) {
                        if (item[1] !== null) {
                            item[1].handleClickTrue();
                            if (this.state.selectAll) {
                                let comp = item[1];
                                let index = this.checkArrayMinus.indexOf(comp.props.filePath);
                                if (index > -1) {
                                    this.checkArrayMinus.splice(index, 1);
                                }
                            }
                        }
                    } else {
                        if (item[1] !== null) {
                            item[1].handleClickFalse();
                            if (this.state.selectAll) {
                                let comp = item[1];
                                let index = this.checkArrayMinus.indexOf(comp.props.filePath);
                                if (index === -1) {
                                    this.checkArrayMinus.push(comp.props.filePath);
                                }
                            }
                        }
                    }
                }.bind(this));
            }
                 
        } else {
            let comp = null;
            this.inputElement.forEach(function(item,idx) {
                if (item[0] === i)
                    comp = item[1];
            })
            //console.log(comp);
            comp.handleClick();
            this.shiftIndex = i;
            if (this.state.selectAll) {
                if (!comp.state.checked) {
                    var index = this.checkArrayMinus.indexOf(comp.props.filePath);
                    if (index > -1) {
                        this.checkArrayMinus.splice(index, 1);
                    }
                    
                } else {
                    this.checkArrayMinus.push(comp.props.filePath);
                }
                //console.log(comp,this.inputElement);
            }
        }
        this.forceUpdate();
    }

    handleInputElement(ele,idx) {
        if (ele !== null) {
            this.inputElement.push([idx,ele]);
        }
    }

    renderSubList() {
        var tmpItemArray = this.state.subDirs.items;
        if (typeof tmpItemArray == 'undefined')
        {
            return null;
        } else if (tmpItemArray.length == 0)
        {
            return (
                <div style={{width:'100%',height:'100%',textAlign:'center',paddingTop:'100px'}}>
                    <img src='img/media_playlist/v3_icon/empty_pic.svg' />
                    <br />
                    <p style={{fontSize:'15px',color:'rgba(255,255,255,0.3)',padding:'15px'}}>{lang.getLang('Msg28')}</p>
                </div>
            );
        }
        this.inputElement = [];
        var dirListArray = [];
        var that = this;
        tmpItemArray.forEach((item,i)=>{
            var tmp;
            var filePath = that.state.curPath + item.name;
            var fileObj = item;
            fileObj.filePath = filePath;
            switch(item.type) {
                case "":
                    item.dir == "1" ?
                        tmp = ( <div className='folderDiv' key={i} onClick={that.dirOnClick.bind(that,item.name)}>
                                    <div style={{float:'left',height:'100%'}}>
                                        <img src={fileTypeIcon.folder} style={folderIconStyle} />
                                    </div>
                                    <div style={{float:'left',height:'100%'}}>
                                        <span style={folderSpan} data-tip={item.name}>{item.name}</span>
                                    </div>
                                </div> )
                        :
                        tmp = null
                    break;
                case "audio":
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        ref={(input) => this.handleInputElement(input,i)}
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                    />
                                    <img src={fileTypeIcon.audio} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;
                case "photo":
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        ref={(input) => this.handleInputElement(input,i)}
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                    />
                                    <img src={fileTypeIcon.image} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;
                case "video":
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        ref={(input) => this.handleInputElement(input,i)}
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                    />
                                    <img src={fileTypeIcon.video} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;

            }
            switch (this.state.filterType) {
                case filterTypeEnum.ALL:{
                    dirListArray.push(tmp);
                    break;
                }
                case filterTypeEnum.AUDIO:{
                    if (item.type === 'audio') {
                        dirListArray.push(tmp);
                    }
                    break;
                }
                case filterTypeEnum.VIDEO:{
                    if (item.type === 'video') {
                        dirListArray.push(tmp);
                    }
                    break;
                }
                case filterTypeEnum.PHOTO:{
                    if (item.type === 'photo') {
                        dirListArray.push(tmp);
                    }
                    break;
                }

            }
            //dirListArray.push(tmp);
        })
        if (dirListArray.length === 0) {
            return (
                <div style={{width:'100%',height:'100%',textAlign:'center',paddingTop:'100px'}}>
                    <img src='img/media_playlist/v3_icon/empty_pic.svg' />
                    <br />
                    <p style={{fontSize:'15px',color:'rgba(255,255,255,0.3)',padding:'15px'}}>
                        {lang.getLang('Msg37')}
                    </p>
                </div>
            );
        }
        return (
            <div>
                {dirListArray}
            </div>
        );
    }

    dirLinkOnClick(path) {
        console.log(path);
        this.setState({
            subDirs: {},
            isScrollingLoading: true,
            subDirsTotal: {},
            filterType: filterTypeEnum.ALL
        });
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.onClickAll(false);
        MainActions.getSubDirs(path);
        this.setState({
            curPath: path
        })
        this.inputElement = [];
        this.scrollBottonCount = 1;
    }

    renderDirLinkPath() {
        var tmpAry = this.state.curPath.split("/");
        var rstAry = [];
        var linkItem = '/';
        var tmpLen = tmpAry.length;
        let nasName = this.state.mediaDirs.content == null ? '' : this.state.mediaDirs.content.nas_name;

        //******* For Local Nas Folder *******/
        if (tmpAry[0] === 'localNasFolder') {
            rstAry.push(<span style={{margin:'0 6px 0 6px'}} key='span01'>></span>);
            rstAry.push(
                <span 
                    style={{...folderPathSpan, maxWidth:'100px'}} 
                    key='localNasFolder999' 
                    onClick={this.dirOnClick2.bind(this)}
                    //data-tip={nasName}
                >
                    {nasName}
                </span>
            );
            return rstAry;
        }
        //******* For Remote devices Folder *******/
        if (tmpAry[1] === 'mnt') {
            rstAry.push(<span style={{margin:'0 6px 0 6px'}} key='span02'>></span>);
            rstAry.push(
                <span 
                    style={{...folderPathSpan,cursor:'pointer'}} 
                    key={202} 
                    onClick={this.dirOnClick1.bind(this, this.state.remoteCurItem, this.state.remoteCurItem.protocol)} 
                    //data-tip={this.state.remoteCurItem.display} 
                >{this.state.remoteCurItem.display}
                </span>
            );
            tmpAry.forEach((item,i)=>{
                if (item) {
                    linkItem = linkItem + item + '/';
                    if (i >5) {
                        rstAry.push(<span style={{margin:'0 6px 0 6px'}} key={i+1}>></span>);
                        rstAry.push(
                            <span 
                                style={folderPathSpan} 
                                key={i+999} 
                                onClick={this.dirLinkOnClick.bind(this,linkItem)}
                                //data-tip={item}
                            >
                            {item}
                            </span>
                        );
                    }
                }
            })
            return rstAry;
        }

        //******* Add 本機NAS資料夾 in the beginning of the path *******/
        if (this.state.ifLocalNas) {
            rstAry.push(<span style={{margin:'0 6px 0 6px'}} key='span03'>></span>);
            rstAry.push(
                <span 
                    style={{...folderPathSpan, maxWidth:'95px'}} 
                    key='localNasFolder999' 
                    onClick={this.dirOnClick2.bind(this)}
                    //data-tip={nasName}
                >
                {nasName}
                </span>
            );
        }
        //******* Add 本機NAS資料夾 in the beginning of the path End *******/
        
        if (this.state.curPath.length > 30) {
            rstAry.push(<span style={{margin:'0 6px 0 6px'}} key='span04'>></span>);
            rstAry.push(<span style={{...folderPathSpan,cursor:'default'}} key={202} >...</span>);
            tmpAry.forEach((item,i)=>{
                if (item) {
                    linkItem = linkItem + item + '/';
                    if (i >= tmpLen-3) {
                        rstAry.push(<span style={{margin:'0 6px 0 6px'}} key={i+22}>></span>);
                        rstAry.push(
                            <span 
                                style={folderPathSpan} 
                                key={i+999} 
                                onClick={this.dirLinkOnClick.bind(this,linkItem)}
                                //data-tip={item}
                            >
                            {item}
                            </span>
                        );
                    }
                }
            })
        }
        else {
            tmpAry.forEach((item,i)=>{
                if (item) {
                    linkItem = linkItem + item + '/';
                    if (item != 'share') {
                        rstAry.push(<span style={{margin:'0 6px 0 6px'}} key={i+33}>></span>);
                        rstAry.push(
                            <span 
                                style={folderPathSpan} 
                                key={i+999} 
                                onClick={this.dirLinkOnClick.bind(this,linkItem)}
                                //data-tip={item}
                            >
                            {item}
                            </span>
                        );
                    }
                }
            })
        }
        //console.log(rstAry);
        return rstAry;
    }

    getDirLinkPath() {
        var tmpAry = this.state.curPath.split("/");
        var rstAry = [];
        var linkItem = '/';
        var tmpLen = tmpAry.length;
        let nasName = this.state.mediaDirs.content == null ? '' : this.state.mediaDirs.content.nas_name;

        let dirFullPath = '';

        //******* For Local Nas Folder *******/
        if (tmpAry[0] === 'localNasFolder') {
            dirFullPath = dirFullPath  + nasName + '/';
            return dirFullPath;
        }
        //******* For Remote devices Folder *******/
        if (tmpAry[1] === 'mnt') {
            dirFullPath = dirFullPath  + this.state.remoteCurItem.display + '/';
            tmpAry.forEach((item,i)=>{
                if (item) {
                    linkItem = linkItem + item + '/';
                    if (i >5) {
                        dirFullPath = dirFullPath  + item + '/';
                    }
                }
            })
            return dirFullPath;
        }

        //******* Add 本機NAS資料夾 in the beginning of the path *******/
        if (this.state.ifLocalNas) {
            dirFullPath = dirFullPath  + nasName + '/';
        }
        //******* Add 本機NAS資料夾 in the beginning of the path End *******/
        
        tmpAry.forEach((item,i)=>{
            if (item) {
                if (item != 'share') {
                    dirFullPath = dirFullPath  + item + '/';
                }
            }
        });
        return dirFullPath;
    }

    renderGoHomeIcon() {
        return this.state.curPath === '/' || this.state.isFilterPanelOpen || this.state.isQsirchPanelOpen
            ? null
            : (
                <img draggable="false" 
                    src='img/media_playlist/v3_icon/device_home.svg' 
                    style={{marginLeft:'10px',cursor:'pointer'}} 
                    onClick={this.goHomeDir.bind(this)} 
                />
            );
    }

    goHomeDir() {
        this.onClickAll(false);
        this.setState({
            curPath: '/',
            ifLocalNas: false,
            subDirs: {},
            subDirsTotal: {},
            filterType: filterTypeEnum.ALL,
            //isScrollingLoading: true,
            //mediaDirs: {},
        })
        this.checkArray = [];
        this.checkArrayMinus = [];

        //MainActions.getMediaDirs();
    }

    getBackIconSrc() {
        if (this.state.curPath == '/')
            return 'img/media_playlist/back_disable.svg';
        else
            return 'img/media_playlist/back.svg';
    }

    renderBackIcon() {
        if (this.state.curPath == '/')
            return null;
        else {
            if (this.state.isFilterPanelOpen) {
                return (
                    <img src='img/media_playlist/v3_icon/device_back.svg' 
                        style={{marginLeft:'10px',cursor:'pointer',marginTop:'1px'}} 
                        onClick={this.closeFilterPanel.bind(this)} 
                        data-tip={lang.getLang('Back')} 
                    />
                );
            } else if (this.state.isQsirchPanelOpen) {
                return (
                    <img src='img/media_playlist/v3_icon/device_back.svg' 
                        style={{marginLeft:'10px',cursor:'pointer',marginTop:'1px'}} 
                        onClick={this.closeQsirchPanel.bind(this)} 
                        data-tip={lang.getLang('Back')} 
                    />
                );
            } else {
                return (
                    <img src='img/media_playlist/v3_icon/device_return.svg' 
                        style={{marginLeft:'10px',cursor:'pointer',marginTop:'1px'}} 
                        onClick={this.backOnClick.bind(this)} 
                        data-tip={lang.getLang('Back')} 
                    />
                );
            }
        }
            
    }

    backOnClick() {
        ReactTooltip.hide();
        if (this.state.curPath == '/')
        {
            return false;
        }
        else
        {
            let tmpAry = this.state.curPath.split("/");
            _.remove(tmpAry, function(o) {
                return o == '';
            });
            let rstStr = '/';
            let tmpLen = tmpAry.length;
            tmpAry.forEach((item,i)=>{
                if (item && i!=tmpLen-1) {
                    rstStr = rstStr + item + '/';
                }
            })

            if (this.state.ifLocalNas && rstStr === "/share/") {
                this.setState({
                    curPath: 'localNasFolder',
                    subDirs: {},
                    //isScrollingLoading: true,
                    subDirsTotal: {},
                    filterType: filterTypeEnum.ALL
                });
                this.onClickAll(false);
                return false;
            }

            if (rstStr === '/localNasFolder/' 
                || rstStr === "/share/"
                || (tmpAry[0]==='mnt' && tmpLen===5)
                || rstStr === "/")
            {
                this.goHomeDir();
                return false;
            }

            this.setState({
                subDirs: {},
                isScrollingLoading: true,
                subDirsTotal: {},
                filterType: filterTypeEnum.ALL
            });
            this.onClickAll(false);
            MainActions.getSubDirs(rstStr);
            this.setState({
                curPath: rstStr
            })
            //console.log(rstStr);
        }
    }

    onClickAll(v) {
        //if (Object.getOwnPropertyNames(this.state.subDirsTotal).length === 0) {
        if (Object.getOwnPropertyNames(this.state.subDirs).length === 0)
            return false;

        let realFilesCnt = this.calcRealFileNumber();
        if (!realFilesCnt)
            return false;

        this.setState({
            selectAll: v
        })

        if (!v) {
            this.checkArray = [];
            this.checkArrayMinus = [];
        }
    }

    //******* Drag and Drop Func *******//
    //******* Drag and Drop Func *******//
    drag(dragItemObj,e) {

        //console.log(this);
        /*var img = document.createElement("img");
        img.src = "http://kryogenix.org/images/hackergotchi-simpler.png";
        e.dataTransfer.setDragImage(img, 0, 0);*/
        var crt = document.createElement("div");  // Create with DOM
        crt.id = "ghostDiv01";
        crt.style.cssText = styleGhostDiv;

        var curCheckArray = [];
        /*if (this.state.selectAll) {
            let totalItems = this.state.subDirsTotal.items;
            let curFilterType = this.state.filterType;
            totalItems.forEach(function(item,i){
                if (+item.dir === 0 && this.checkArrayMinus.indexOf(item.filePath) < 0) {
                    if (curFilterType === filterTypeEnum.ALL || item.type === curFilterType){
                        curCheckArray.push(item);
                    }
                }
            }.bind(this))
        } else {*/
            this.checkArray.forEach(function(item,i){
                curCheckArray.push(item);
            })
            let tmpFilePathAry = [];
            curCheckArray.forEach((item,i)=>{
                tmpFilePathAry.push(item.filePath);
            })
            var index = tmpFilePathAry.indexOf(dragItemObj.filePath);
            if (index == -1) {
                curCheckArray.push(dragItemObj);
            }
        //}
        

        var itemNum = curCheckArray.length
        var text = itemNum > 1 
            ? itemNum.toString() + " Items"
            : itemNum.toString() + " Item";
        
        var newText = document.createTextNode(text);
        crt.appendChild(newText);
        document.body.appendChild(crt);

        var obj = {
            items: curCheckArray,
            currMediaProtocol: this.currMediaProtocol,
        };
        var j = JSON.stringify(obj);

        e.dataTransfer.effectAllowed = "copyMove";
        
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        var isEdge = !isIE && !!window.StyleMedia;
        if (isIE || isEdge) {
            e.dataTransfer.setData("text", j);
        } else {
            e.dataTransfer.setDragImage(crt, -15, -10);
            e.dataTransfer.setData("obj", j);
        }
        

        ReactTooltip.hide();
    }

    dragEnd() {
        document.body.removeChild(document.getElementById("ghostDiv01"));
    }

    drop(e) {
        e.preventDefault();
        var data = e.dataTransfer.getData("text");
        e.target.appendChild(document.getElementById(data));
    }

    allowDrop(e) {
        e.preventDefault();
    }
    //******* Drag and Drop Func *******//
    //******* Drag and Drop Func *******//

    checkStationDep(stationName) {
		var obj = MainStore.getCheckDep();
        if (obj==null) {return false;}
		var itemsAry = obj.items;
        var rst = false;

		itemsAry.forEach(function(item,i){
            if (item.name == stationName) {
                if ( +item.enabled == 1 && +item.installed == 1 ) {
                    rst = true;
                }
            }
		})

        return rst;
	}
    /*
    openStationOutter(v) {
        var obj = MainStore.getCheckDep();
        var itemsAry = obj.items;
        var availableFlag = false;

        switch(v) {
            case "File Station":{
                var url = MainActions.getCgiOrigin() + '/filestation/';
                window.open(url);
                break;
            }
            case "Music Station":{
                itemsAry.forEach(function(item,i){
                if (item.name == "MusicStation"){
                    if (item.enabled == "1" && item.installed == "1")
                    availableFlag = true;
                    return false;
                    }
                })
                if (availableFlag) {
                    var url = MainActions.getCgiOrigin() + '/musicstation/';
                    window.open(url);
                } else {

                }
                break;
            }
            case "Video Station":{
                itemsAry.forEach(function(item,i){
                if (item.name == "VideoStation"){
                    if (item.enabled == "1" && item.installed == "1")
                    availableFlag = true;
                    return false;
                    }
                })
                if (availableFlag) {
                    var url = MainActions.getCgiOrigin() + '/video/';
                    window.open(url);
                } else {

                }
                break;
            }
            case "Photo Station":{
                itemsAry.forEach(function(item,i){
                if (item.name == "PhotoStation"){
                    if (item.enabled == "1" && item.installed == "1")
                    availableFlag = true;
                    return false;
                    }
                })
                if (availableFlag) {
                    var url = MainActions.getCgiOrigin() + '/photo/';
                    window.open(url);
                } else {
                    
                }
                break;
            }
            case "OceanKTV": {
                itemsAry.forEach(function(item,i){
                if (item.name == "OceanKTVConsole"){
                    if (item.enabled == "1" && item.installed == "1")
                    availableFlag = true;
                    return false;
                    }
                })
                if (availableFlag) {
                    var url = MainActions.getCgiOrigin() + '/apps/OceanKTVConsole/';
                    window.open(url);
                } else {

                }
                break;
            }
        }
    }
*/
    openStationInner(v) {
        var obj = MainStore.getCheckDep();
        var itemsAry = obj.items;
        var availableFlag = false;

        switch(v) {
            case "File Station":{
                window.qMessageClient.fn.openApp({appId:'fileExplorer',config:{path:'/test'}});
                break;
            }
            case "Music Station":{
                itemsAry.forEach(function(item,i){
                if (item.name == "MusicStation"){
                    if (item.enabled == "1" && item.installed == "1")
                        availableFlag = true;
                        return false;
                    }
                })
                if (availableFlag) {
                    window.qMessageClient.fn.openApp({appId:'musicStation',config:{path:'/test'}});
                } else {
                    window.qMessageClient.fn.openApp({
                        appId:'qpkg',
                        config:{
                        config:{
                            install : 'musicStation',
                            all : true,
                            runMore:true
                        }
                    }});
                }
                break;
            }
            case "Video Station":{
                itemsAry.forEach(function(item,i){
                if (item.name == "VideoStation"){
                    if (item.enabled == "1" && item.installed == "1")
                        availableFlag = true;
                        return false;
                    }
                })
                if (availableFlag) {
                    window.qMessageClient.fn.openApp({appId:'VideoStationPro',config:{path:'/test'}});
                } else {
                    window.qMessageClient.fn.openApp({
                        appId:'qpkg',
                        config:{
                        config:{
                            install : 'VideoStationPro',
                            all : true,
                            runMore:true
                        }
                    }});
                }
                break;
            }
            case "Photo Station":{
                itemsAry.forEach(function(item,i){
                if (item.name == "PhotoStation"){
                    if (item.enabled == "1" && item.installed == "1")
                        availableFlag = true;
                        return false;
                    }
                })
                if (availableFlag) {
                    window.qMessageClient.fn.openApp({appId:'photoStation',config:{path:'/test'}});
                } else {
                    window.qMessageClient.fn.openApp({
                        appId:'qpkg',
                        config:{
                        config:{
                            install : 'photoStation',
                            all : true,
                            runMore:true
                        }
                    }});
                }
                break;
            }
            case "OceanKTV": {
                itemsAry.forEach(function(item,i){
                if (item.name == "OceanKTVConsole"){
                    if (item.enabled == "1" && item.installed == "1")
                        availableFlag = true;
                        return false;
                    }
                })
                if (availableFlag) {
                    var url = MainActions.getCgiOrigin() + '/apps/OceanKTVConsole/';
                    window.open(url);
                } else {
                    window.qMessageClient.fn.openApp({
                        appId:'qpkg',
                        config:{
                        config:{
                            install : 'OceanKTVConsole',
                            all : true,
                            runMore:true
                        }
                    }});
                }
                break;
            }
            case "Qsirch": {
                itemsAry.forEach(function(item,i){
                if (item.name == "Qsirch"){
                    if (item.enabled == "1" && item.installed == "1")
                        availableFlag = true;
                        return false;
                    }
                })
                if (availableFlag) {
                    window.qMessageClient.fn.openApp({appId:'Qsirch',config:{path:'/test'}});
                } else {
                    window.qMessageClient.fn.openApp({
                        appId:'qpkg',
                        config:{
                        config:{
                            install : 'Qsirch',
                            all : true,
                            runMore:true
                        }
                    }});
                }
                break;
            }
        }
    }

    openStationPopup(v) {
        var isInWindow = (window.parent == window) ? true : false;
        let str = lang.getLang('Msg29');
        str = str.replace("$1", v);
        let res = str.split('App Center');
        let link = isInWindow ? "App Center" : (<a style={{cursor:'pointer'}} onClick={this.openStationInner.bind(this,v)}>App Center</a>);
        let fres = ( <div>
                    <div style={{marginTop:'40px'}}>{res[0]}{link}{res[1]}</div>
                 </div> 
        );
        
		CommonActions.toggleMsgPopup(
			true, 
			'info',
			fres,
			'Y', 
			lang.getLang('OK'), 
			lang.getLang('No'),
			function(){
				CommonActions.toggleMsgPopup(false);

			},
			function(){
				CommonActions.toggleMsgPopup(false);
			},
    	);
    }

    openStation(v) {
        if(window.parent == window){
            this.openStationOutter(v);
        } else {
            this.openStationInner(v);
        }
    }

    osBtnMouseOver() {
        this.setState({
            osBtnImgPath1: 'img/media_playlist/btn_open_station_hover.png',
            osBtnImgPath2: 'img/media_playlist/triangle_w_hover.png',
        });
    }

    osBtnMouseOut() {
        this.setState({
            osBtnImgPath1: 'img/media_playlist/btn_open_station_normal.png',
            osBtnImgPath2: 'img/media_playlist/triangle_w_normal.png',
        });
    }

    osBtnMouseDown() {
        this.setState({
            osBtnImgPath1: 'img/media_playlist/btn_open_station_active.png',
            osBtnImgPath2: 'img/media_playlist/triangle_w_active.png',
        });
    }

    osBtnMouseUp() {
        this.setState({
            osBtnImgPath1: 'img/media_playlist/btn_open_station_hover.png',
            osBtnImgPath2: 'img/media_playlist/triangle_w_hover.png',
        });
    }

    /*renderStationMenu() {
        const divMore = {
            position: 'relative',
            border: '0',
            float: 'right',
        };
        const btnMore = {
            position: 'relative',
            border: '0',
        };
        const menuTitleImage = {marginTop:'-4px', marginRight:'14px', width:'24px', height:'24px'};
        const aStyle = {lineHeight:'28px',padding:'0 22px',cursor:'pointer'};
        if(window.parent == window){
            
        }

        var musicStation = this.checkStationDep("MusicStation");
        var photoStation = this.checkStationDep("PhotoStation");
        var videoStation = this.checkStationDep("VideoStation");
        var oceanKTV = this.checkStationDep("OceanKTVConsole");

        return (
            <div style={divMore}>
                <div style={btnMore} 
                     id="btn_OpenStation" 
                     role="button" 
                     data-toggle="dropdown" 
                     onMouseOver={this.osBtnMouseOver.bind(this)} 
                     onMouseOut={this.osBtnMouseOut.bind(this)} 
                     onMouseDown={this.osBtnMouseDown.bind(this)} 
                     onMouseUp={this.osBtnMouseUp.bind(this)} 
                >
                    <img src={this.state.osBtnImgPath1} />
                    <img src={this.state.osBtnImgPath2} style={{margin:'0 10px 0 5px'}} />
                </div>
                
                <ul class="dropdown-menu multi-level dropdown-menu-frameset" role="menu" aria-labelledby="dropdownMenu">
                    <li>
                        <a style={aStyle} onClick={this.openStation.bind(this,"File Station")} >
                            <img src='img/station_icon/media_list/appicon_file_station.png' style={menuTitleImage} />File Station
                        </a>
                    </li>

                    { photoStation ? 
                        <li>
                            <a style={aStyle} onClick={this.openStation.bind(this,"Photo Station")}  >
                                <img src='img/station_icon/media_list/appicon_photo_station.png' style={menuTitleImage} />Photo Station
                            </a>
                        </li>
                        :
                        <li class="disabled">
                            <a style={aStyle} onClick={this.openStationPopup.bind(this,"Photo Station")} >
                                <img src='img/station_icon/media_list/appicon_photo_station_disable.png' style={menuTitleImage} />Photo Station
                            </a>
                        </li>
                    }

                    { videoStation ?
                        <li>
                            <a style={aStyle} onClick={this.openStation.bind(this,"Video Station")}  >
                                <img src='img/station_icon/media_list/appicon_video_station.png' style={menuTitleImage} />Video Station
                            </a>
                        </li>
                        :
                        <li class="disabled">
                            <a style={aStyle} onClick={this.openStationPopup.bind(this,"Video Station")} >
                                <img src='img/station_icon/media_list/appicon_video_station_disable.png' style={menuTitleImage} />Video Station
                            </a>
                        </li>
                    }

                    { musicStation ?
                        <li>
                            <a style={aStyle} onClick={this.openStation.bind(this,"Music Station")}  >
                                <img src='img/station_icon/media_list/appicon_music_station.png' style={menuTitleImage} />Music Station
                            </a>
                        </li>
                        :
                        <li class="disabled">
                            <a style={aStyle} onClick={this.openStationPopup.bind(this,"Music Station")} >
                                <img src='img/station_icon/media_list/appicon_music_station_disable.png' style={menuTitleImage} />Music Station
                            </a>
                        </li>
                    }

                    { oceanKTV ?
                        <li>
                            <a style={aStyle} onClick={this.openStation.bind(this,"OceanKTV")}  >
                                <img src='img/station_icon/media_list/appicon_ktv_station.png' style={menuTitleImage} />OceanKTV
                            </a>
                        </li>
                        :
                        <li class="disabled">
                            <a style={aStyle} onClick={this.openStationPopup.bind(this,"OceanKTV")} >
                                <img src='img/station_icon/media_list/appicon_ktv_station_disable.png' style={menuTitleImage} />OceanKTV
                            </a>
                        </li>
                    }
                    
                </ul>
            </div>
        );
    }*/

    getSearchIcon() {
        if (this.state.curPath === '/')
            return null;

        let imgSrc = '';
        if (this.state.ifLocalNas) {
            imgSrc = 'img/media_playlist/qsirch.svg';
        } else {
            imgSrc = this.state.isFilterPanelOpen
            ?'img/media_playlist/fliter_1.svg'
            :'img/media_playlist/fliter_0.svg';
        }

        return (<img src={imgSrc} style={{cursor:'pointer',marginRight:'15px'}} />)
    }

    getSearchClick() {
        /*let filterOnClick= this.setFilterPanelOpen.bind(this);
        let func = this.state.ifLocalNas
        ?   null
        :   filterOnClick;*/

        if (this.state.ifLocalNas) {
            //MainActions.showBrowsePathPanel();
            //console.log('showBrowsePathPanel');
            let ifQsirchInatall = this.checkStationDep("Qsirch");
            if (ifQsirchInatall) {
                this.setQsirchPanelOpen();
            } else {
                this.openStationPopup("Qsirch");
            }

            
        } else {
            this.setFilterPanelOpen();
        }
    }

    setFilterPanelOpen() {
        this.setState({
            isFilterPanelOpen: !this.state.isFilterPanelOpen
        })
    }
    
    setQsirchPanelOpen() {
        this.setState({
            isQsirchPanelOpen: !this.state.isQsirchPanelOpen
        })
    }

    getDisableMask() {
        return (this.state.isFilterPanelOpen || this.state.isQsirchPanelOpen)
        ? (
            <div 
                style={{
                    width:'calc(100% - 38px)',
                    height:'100%',
                    position:'absolute',
                    top:'0',
                    right:'0',
                    backgroundColor:'transparent'
                }}
            />
        ) : null;
    }

    renderQsirchPanel() {
        let ifCurDir = this.state.pcRadio === 'CurrDir' ? true: false;
        return (
            <QsirchPanel
                isOpen={this.state.isQsirchPanelOpen}
                curPath={this.state.curPath}
                closeFunc={this.setQsirchPanelOpen.bind(this)}
                patternStr = {this.state.patternStr}
                filterType = {this.state.filterType}
                modifiedDate = {this.state.modifiedDate}
                ifCurDir = {ifCurDir}
                ref = {(instance)=>{this.qSirchPanelObj = instance;}}
                currMediaProtocol = {this.currMediaProtocol}
            />
        )
    }

    renderFilterPanel() {
        return (
            <FilterPanel
                isOpen={this.state.isFilterPanelOpen}
                curPath={this.state.curPath}
                closeFunc={this.setFilterPanelOpen.bind(this)}
                patternStr = {this.state.patternStr}
                filterType = {this.state.filterType}
                ref = {(instance)=>{this.filterPanelObj = instance;}}
                currMediaProtocol = {this.currMediaProtocol}
            />
        )
    }

    handleScroll(e) {

        if (e.target.scrollTop + e.target.clientHeight === e.target.scrollHeight) {
            
            let path = this.state.curPath;
            path = path.replace('localNasFolder','');

            let tmpAry = this.state.subDirs.items;
            if (tmpAry === undefined || tmpAry === null)
                return false;
            
            if (+this.state.subDirs.total > this.state.subDirs.items.length) {
                console.log('Medialist Scroll to Bottom!!! - Get more data');
                this.scrollBottonCount++;
                let cnt = this.scrollBottonCount * 100;
                MainActions.getSubDirs(path,cnt);
                this.setState({
                    isScrollingLoading: true
                });
            }
            
        }
    }

    calcRealFileNumber() {
        //let tmpAry = this.state.subDirsTotal.items;
        let tmpAry = this.state.subDirs.items;
        if (tmpAry === undefined || tmpAry === null) {
            return '';
        }
        let cnt = 0;
        let curFilterType = this.state.filterType;
        tmpAry.forEach(function(item,idx){
            if (+item.dir === 0) {
                if (curFilterType === filterTypeEnum.ALL || item.type === curFilterType)
                    cnt++;
            }
        })
        return cnt;
    }

    calcAllRealFileNumber() {
        //let tmpAry = this.state.subDirsTotal.items;
        let tmpAry = this.state.subDirs.items;
        if (tmpAry === undefined || tmpAry === null) {
            return '';
        }
        let cnt = 0;
        let curFilterType = this.state.filterType;
        tmpAry.forEach(function(item,idx){
            if (+item.dir === 0) {
                //if (curFilterType === filterTypeEnum.ALL || item.type === curFilterType)
                    cnt++;
            }
        })
        return cnt;
    }

    renderBottomCountPanel() {
        let dStyle = {
            height:'30px',
            backgroundColor:'rgba(0,0,0,0.2)',
            display:'flex',
            alignItems:'center',
            justifyContent:'flex-end',
            msFlexAlign: 'center',
            msFlexPack: 'end',
            animation: 'fadeIn 0.3s',
            borderBottomLeftRadius: '6px'
        }
        if (Object.getOwnPropertyNames(this.state.subDirs).length === 0) {
            return null;
        } else {
            let totalCountReal = this.calcRealFileNumber();
            let selectedCount = this.state.selectAll ? totalCountReal : this.checkArray.length;
            if (this.state.selectAll) {
                let minusLength = this.checkArrayMinus.length;
                selectedCount = totalCountReal - minusLength;
            } else {
                selectedCount = this.checkArray.length;
            }
            return !totalCountReal && !selectedCount
            ? null 
            : (
                <div style={{...dStyle}}>
                    <span style={{fontSize:'13px',color:'#FFF',marginRight:'10px'}}>
                        {lang.getLang('Selected')}: {selectedCount} , {lang.getLang('Total')}: {totalCountReal}
                    </span>
                </div>
            );


        }
    }

    renderSelectAllButton() {
        let selectAllBtnRender = null;
        if (this.state.curPath !== '/') {
            selectAllBtnRender = this.state.selectAll
            ? <button className='unselectAllBtn' onClick={this.onClickAll.bind(this,false)}>{lang.getLang('Cancel select all')}</button>
            : <button className='selectAllBtn' onClick={this.onClickAll.bind(this,true)}>{lang.getLang('Select all')}</button>;
        }
        return selectAllBtnRender;
    }

    clickFilterBtn(type) {
        let subDirsTmp = this.state.subDirs;
        //let subDirsTotalTmp = this.state.subDirsTotal;
        this.setState({
            filterType: type,
            subDirs: {},
            //isScrollingLoading: true,
            //subDirsTotal: {},
        },()=>{
            this.setState({
                subDirs: subDirsTmp,
                //subDirsTotal: subDirsTotalTmp,
            })
        });
        this.onClickAll(false);
    }

    renderFileTypeFilterPanel() {
        //let totalCountReal = this.calcAllRealFileNumber();
        let dStyle = {
            width:'100%',
            height:'36px',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            msFlexAlign: 'center',
            msFlexPack: 'center',
            position:'absolute',
            bottom:'4px',
            animation: 'fadeIn 0.3s',
            lineHeight:'23px'
        }
        if (this.state.curPath === '/')
            return null;

        let selectStyle = {backgroundColor:'#4C5465'};
        let allSelectStyle = this.state.filterType === filterTypeEnum.ALL ? selectStyle : null;
        let audioSelectStyle = this.state.filterType === filterTypeEnum.AUDIO ? selectStyle : null;
        let videoSelectStyle = this.state.filterType === filterTypeEnum.VIDEO ? selectStyle : null;
        let photoSelectStyle = this.state.filterType === filterTypeEnum.PHOTO ? selectStyle : null;


        let borderStyle = {borderRight:'1px solid #4C5465'};
        return (
            <div style={{...dStyle}}>
                <div 
                    style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        msFlexAlign: 'center',
                        msFlexPack: 'center',
                        height:'25px',
                        border:'1px solid #4C5465',
                        borderRadius:'3px'
                    }}
                >
                    <button className='fileTypeFilterBtn' style={{...borderStyle,...allSelectStyle}} onClick={this.clickFilterBtn.bind(this,'all')}>{lang.getLang('All')}</button>
                    <button className='fileTypeFilterBtn' style={{...borderStyle,...photoSelectStyle}} onClick={this.clickFilterBtn.bind(this,'photo')}>{lang.getLang('Photo')}</button>
                    <button className='fileTypeFilterBtn' style={{...borderStyle,...videoSelectStyle}} onClick={this.clickFilterBtn.bind(this,'video')}>{lang.getLang('Video')}</button>
                    <button className='fileTypeFilterBtn' style={{...audioSelectStyle}} onClick={this.clickFilterBtn.bind(this,'audio')}>{lang.getLang('Music')}</button>
                </div>
            </div>
        )
    }

    renderRootTextDiv() {
        return this.state.curPath==='/' 
        ? (
            <div style={{fontSize:'12px',color:'#FFF',position:'absolute',bottom:'0'}}>
                <div style={{margin:'0 38px 20px',cursor:'default'}}>
                    {lang.getLang('MediaListMsg01')}
                </div>
                
                <img
                    src="img/media_playlist/v3_icon/device_info.svg"
                    alt=""
                    data-tip={lang.getLang('MediaListMsg06')}
                    style={{
                        position:'absolute',
                        bottom:'10px',
                        right:'10px',
                        cursor:'pointer',
                        width: '28px',
                        height: '28px',
                    }}
                />
            </div>
        )
        : null;
    }

    patternStrChange(event) {
        this.setState({
            patternStr: event.target.value
        })
    }

    _handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            console.log('do validate');
            let showType = this.getSearchShowType();
            switch (showType) {
                case 'ROOT': {
                    break;
                }
                case 'FILTER': {
                    this.filterClick();
                    break;
                }
                case 'QSIRCH': {
                    this.qSirchClick();
                    break;
                }
            }
            this.searchInput.blur();
        }
    }

    radioClickFunc(v) {
        this.setState({
            pcRadio: v
        })
    }

    clickMdfDatePanel() {
        this.setState({
            isMdfDatePanelOpen: !this.state.isMdfDatePanelOpen,
            isEnterMdfDatePanel: true
        },()=>{
            setTimeout(function() {
                this.setState({
                    isEnterMdfDatePanel: false
                });
            }.bind(this), 10);
        });
    }

    closeMdfDatePanel() {
        this.setState({
            isMdfDatePanelOpen: false,
            isEnterMdfDatePanel: false,
        })
    }




























    getModifiedDate() {
        let rst = '';
        let modifiedDateEnumText = {
            none: lang.getLang('Select a date range'),
            today: lang.getLang('Today'),
            yesterday: lang.getLang('Yesterday'),
            thisWeek: lang.getLang('This week'),
            thisMonth: lang.getLang('This month'),
            thisYear: lang.getLang('This year'),
            lastWeek: lang.getLang('Last week'),
            lastMonth: lang.getLang('Last month'),
            lastYear: lang.getLang('Last year'),
            customize: lang.getLang('Set a date range')
        }
        
        for(var key in modifiedDateEnum) {
            if(modifiedDateEnum[key] === this.state.modifiedDate) {
                // do stuff with key
                rst = modifiedDateEnumText[key];
            }
        }

        return rst;
    }

    setDate(dateStr) {
        this.setState({
            modifiedDate: dateStr
        })
    }

    renderDateItem(keyValue,displayStr,setStr) {
        let ddLiA = {
            width:'100%',
            //lineHeight:'28px',
            cursor:'pointer',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            msFlexAlign: 'center',
            msFlexPack: 'center',
            //marginTop:'5px',
            fontSize: '12px',
            padding: '6px 20px'
        }
        return (
            <li key={keyValue}>
                <a style={ddLiA} onClick={this.setDate.bind(this,setStr)}>
                    {displayStr}
                </a>
            </li>
        )
    }

    renderDatePanel() {
        let dateListAry = [];
        dateListAry.push(this.renderDateItem(1,lang.getLang('None'),''));
        dateListAry.push(this.renderDateItem(2,lang.getLang('Today'),modifiedDateEnum.today));
        dateListAry.push(this.renderDateItem(3,lang.getLang('Yesterday'),modifiedDateEnum.yesterday));
        dateListAry.push(this.renderDateItem(4,lang.getLang('This week'),modifiedDateEnum.thisWeek));
        dateListAry.push(this.renderDateItem(5,lang.getLang('This month'),modifiedDateEnum.thisMonth));
        dateListAry.push(this.renderDateItem(6,lang.getLang('This year'),modifiedDateEnum.thisYear));
        dateListAry.push(this.renderDateItem(7,lang.getLang('Last week'),modifiedDateEnum.lastWeek));
        dateListAry.push(this.renderDateItem(8,lang.getLang('Last month'),modifiedDateEnum.lastMonth));
        dateListAry.push(this.renderDateItem(9,lang.getLang('Last year'),modifiedDateEnum.lastYear));
        dateListAry.push(this.renderDateItem(10,lang.getLang('Set a date range'),modifiedDateEnum.customize));
        return(
            <div class="btn-group dropdown" style={{width:'100%',padding:'8px 10px 0'}}>
                <div className='divSelectSizeIcon' style={{width:'100%'}} role="button" data-toggle="dropdown">
                    <span style={{fontSize:'12px',color:'#4C4C4C'}}>{this.getModifiedDate()}</span>
                    <img src='img/media_playlist/v3_icon/calendar/device_dropdown.svg' style={{position:'absolute',top:'0',right:'0'}}/>
                </div>
                <ul class="dropdown-menu dropdown-menu-qdate" 
                    style={{
                        top:'35px',
                        width:'266px',
                        height:'120px',
                        overflowX:'hidden',
                        padding:'0',
                        borderRadius:'3px'
                    }} 
                    role="menu" 
                    aria-labelledby="dropdownMenu">
                        {dateListAry}
                </ul>
            </div>
        )
    }

    renderDatePickerPanel() {
        let displayStyle = 'none';
        if (this.state.modifiedDate === modifiedDateEnum.customize)
        {
            displayStyle = 'flex';
        }

        let d1Style = {
            display: 'flex',
            border: '1px solid #7f7f7f',
            borderRadius: '3px'
        };
        let iStyle = {
            height:'25px',
            width: '94px',
            fontSize:'12px',
            padding:'0 10px',
            border:'0',
            borderRadius: '3px',
            color: '#4C4C4C'
        };
            
        return (
            <div 
                style={{
                    display: displayStyle,
                    alignItems:'center',
                    justifyContent:'center',
                    marginTop:'10px',
                    msFlexAlign: 'center',
                    msFlexPack: 'center',
                }}
            >
                <div style={d1Style}>
                    <input id='start_date' type="text" className="datepicker" style={iStyle} />
                </div>
                <div style={{color:'#7F7F7F',width:'18px',textAlign:'center',cursor:'default'}}>-</div>
                <div style={d1Style}>
                    <input id='end_date' type="text" className="datepicker" style={iStyle} />
                </div>
            </div>
        );
    }

    getSearchShowType() {
        let showType = 'ROOT';
        let ifQsirchInatall = this.checkStationDep("Qsirch");
        if (this.state.curPath !== '/') {
            if ((this.state.ifLocalNas && !ifQsirchInatall) || !this.state.ifLocalNas) {
                showType = 'FILTER';
            } else if (this.state.ifLocalNas && ifQsirchInatall) {
                showType = 'QSIRCH';
            }
        }
        return showType;
    }

    enterMdfTagHandle(v) {
        this.setState({
            isEnterMdfTag: v
        });
    }

    clickRemoveMdfTag() {
        this.setDate(modifiedDateEnum.none);
        this.enterMdfTagHandle(false);
    }

    renderMdfTag() {
        if (this.state.modifiedDate) {
            let text = '';
            let modifiedDateEnumText = {
                none: lang.getLang('Select a date range'),
                today: lang.getLang('Today'),
                yesterday: lang.getLang('Yesterday'),
                thisWeek: lang.getLang('This week'),
                thisMonth: lang.getLang('This month'),
                thisYear: lang.getLang('This year'),
                lastWeek: lang.getLang('Last week'),
                lastMonth: lang.getLang('Last month'),
                lastYear: lang.getLang('Last year'),
                customize: lang.getLang('Set a date range')
            }
            
            for(var key in modifiedDateEnum) {
                if(modifiedDateEnum[key] === this.state.modifiedDate) {
                    text = modifiedDateEnumText[key];
                }
            }

            let v = this.state.isEnterMdfTag ? 'visible' : 'hidden';
            let o = this.state.isEnterMdfTag ? '1' : '0';

            let v1 = this.state.isEnterMdfTag ? 'hidden' : 'visible';
            let o1 = this.state.isEnterMdfTag ? '0' : '1';
            
            let removeDiv = (
                <div 
                    style={{
                        backgroundColor:'#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        msFlexAlign: 'center',
                        msFlexPack: 'center',
                        cursor: 'pointer',
                        position: 'absolute',
                        top:'0',
                        left:'0',
                        width: '100%',
                        transition: 'all 0.2s ease',
                        borderRadius: '3px',
                        opacity: o,
                        visibility: v,
                    }}
                    onClick = {this.clickRemoveMdfTag.bind(this)}
                >
                    <img src="img/media_playlist/v3_icon/calendar/device_tag_close.svg" />
                </div>
            );

            let pStyle = {
                fontSize:'10px',
                color:'#4C4C4C',
                margin:'0 5px',
                textOverflow:'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                lineHeight: '18px',
                width: '30px'
            }

            return (
                <div style={{
                    backgroundColor:'#FFF',
                    //boxShadow:'0 1.5px 2px 0 #e4e4e5',
                    boxShadow: 'rgba(0,0,0,0.1) 0px 1px 1px 1px',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    msFlexAlign: 'center',
                    msFlexPack: 'center',
                    margin: '0 2px 0 10px',
                    cursor: 'pointer',
                    position: 'relative',
                }}
                onMouseEnter = {this.enterMdfTagHandle.bind(this,true)}
                onMouseLeave = {this.enterMdfTagHandle.bind(this,false)}
                >
                    <div style={{opacity: o1,visibility: v1,display:'flex',alignItems:'center',msFlexAlign: 'center'}}>
                        <img src="img/media_playlist/v3_icon/calendar/device_tag_calendar.svg" />
                        <p style={pStyle}>{text}</p>
                    </div>
                    {removeDiv}
                </div>
            )
        }
        return null;
    }

    renderSearchRstText() {
        let flag = this.state.isQsirchPanelOpen || this.state.isFilterPanelOpen;
        let v = flag ? 'visible' : 'hidden';
        let o = flag ? '1' : '0';
        let s1 = {
            position:'absolute',
            bottom: this.state.isQsirchPanelOpen ? '135px' : '100px',
            color:'#FFF',
            fontSize:'15px',
            marginLeft: '20px',
            visibility: v,
            opacity: o,
            transition: 'opacity 0.2s ease',
            cursor: 'default'
        }

        return (
            <div style={s1}>
                {lang.getLang('Search results')}
            </div>
        )

    }

    renderSearchInputDiv() {
        let showType = this.getSearchShowType();

        let searchDivStyle = {
            position:'relative',
            height:'30px',
            backgroundColor:'#FFF',
            borderRadius:'3px',
            margin:'0 17px',
            display:'flex',
            alignItems:'center',
            msFlexAlign: 'center',
            //boxShadow: '0 1.5px 2px 0 #e4e4e5'
        };

        let searchInputPhStr = lang.getLang('MediaListMsg02');
        let rst = null;
        switch (showType) {
            case 'ROOT': {
                rst = null;
                break;
            }
            case 'FILTER': {
                rst = (
                    <div style={{position: 'absolute',width: '100%', bottom: '40px'}}>
                        <div style={searchDivStyle}>
                            <input 
                                type="text" 
                                className='searchInputField' 
                                placeholder={searchInputPhStr} 
                                style={{width:'calc(100% - 30px)',height: '100%',borderRadius: '3px',border: '0',paddingLeft:'10px'}}
                                onChange={this.patternStrChange.bind(this)} 
                                value={this.state.patternStr}
                                onKeyPress={this._handleKeyPress.bind(this)}
                                ref={(obj)=>{this.searchInput = obj}}
                            />
                            <div 
                                style={{
                                    position:'absolute',
                                    height:'100%',
                                    right:'0',
                                    top: '0',
                                    display:'flex',
                                    alignItems:'center',
                                    msFlexAlign: 'center',
                                }}
                            >
                                <img src="img/media_playlist/v3_icon/device_zoom.svg" style={{cursor:'pointer'}} alt="" onClick={this.filterClick.bind(this)}/>
                            </div>
                        </div>
                    </div>
                );
                break;
            }
            case 'QSIRCH': {
                let radioStyle = {
                    display: 'inline-block',
                    height:'100%',
                    cursor:'pointer',
                    textOverflow:'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '120px',
                };
                let mdfTag = this.renderMdfTag();
                let inputWidth = 'calc(100% - 53px)';
                if (mdfTag) {
                    inputWidth = 'calc(100% - 120px)';
                }
                rst = (
                    <div style={{position: 'absolute',width: '100%', bottom: '40px'}}>
                    
                        <div style={searchDivStyle}>
                            {mdfTag}
                            <input 
                                type="text" 
                                className='searchInputField' 
                                placeholder={searchInputPhStr} 
                                style={{width: inputWidth,height: '100%',borderRadius: '3px',border: '0',paddingLeft:'10px'}}
                                onChange={this.patternStrChange.bind(this)} 
                                value={this.state.patternStr}
                                onKeyPress={this._handleKeyPress.bind(this)}
                                ref={(obj)=>{this.searchInput = obj}}
                            />
                            <div style={{position:'absolute',height:'100%',top:'0',right:'0',display:'flex',alignItems:'center',msFlexAlign: 'center'}}>
                                <img src="img/media_playlist/v3_icon/calendar/device_dropdown.svg" style={{cursor:'pointer'}} alt="" onClick={this.clickMdfDatePanel.bind(this)}/>
                                <img src="img/media_playlist/v3_icon/device_zoom.svg" style={{cursor:'pointer'}} alt="" onClick={this.qSirchClick.bind(this)}/>
                            </div>
                            
                        </div>
        
                        <div style={{height:'36px',fontSize:'12px',color:'#FFF',margin:'5px 17px 0',display:'flex',alignItems:'center',msFlexAlign: 'center'}}>
                            <div style={radioStyle} onClick={this.radioClickFunc.bind(this,'CurrDir')} data-tip={lang.getLang('This folder')}>
                                <RadioButton name="CurrDir" 
                                    clickFunc={this.radioClickFunc.bind(this)} 
                                    currentName={this.state.pcRadio} 
                                    key={Math.random()}
                                />
                                {lang.getLang('This folder')}
                            </div>
                            <div style={{...radioStyle,maxWidth:'180px'}} onClick={this.radioClickFunc.bind(this,'LocalNas')} data-tip={lang.getLang('NAS local folders')}>
                                <RadioButton name="LocalNas" 
                                    clickFunc={this.radioClickFunc.bind(this)} 
                                    currentName={this.state.pcRadio} 
                                    key={Math.random()}
                                />
                                {lang.getLang('NAS local folders')}
                            </div>
                        </div>
        
                    </div>
                );
                break;
            }
        }
        return rst;
    }

    closeqSirchHintDiv() {
        this.setState({
            isqSirchHintDivOpen: false
        });
        this.isqSirchHintOpened = true;
    }

    calcHeight() {
        let rst = '';
        let ifQsirchInatall = this.checkStationDep("Qsirch");
        if (this.state.curPath==='/') {
            //topPanelBgSrc = fileCabinetImgSrc.root;
            rst = '190px';
        } else {
            if (this.state.ifLocalNas) {
                if (ifQsirchInatall) {
                    //topPanelBgSrc = fileCabinetImgSrc.qSirch;
                    rst = '231px';
                } else {
                    //topPanelBgSrc = fileCabinetImgSrc.fileStation;
                    rst = '195px';
                }
            } else {
                //topPanelBgSrc = fileCabinetImgSrc.fileStation;
                rst = '195px';
            }
        }
        return rst;
    }

    closeErrorGetMediaDirsHintDiv() {
        this.setState({
            isErrorGMD: false
        });
    }

    renderErrorGetMediaDirsHintDiv() {
        let hintDivStyle = {
            position:'absolute',
            top: '0',
            width: 'calc(100% - 20px)',
            margin:'10px 10px 0',
            padding: '20px',
            backgroundColor:'rgba(3, 115, 221,0.85)',
            borderRadius:'3px',
            color:'#FFF',
            fontSize:'12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            visibility: this.state.isErrorGMD ? 'visible' : 'hidden',
            opacity: this.state.isErrorGMD ? '1' : '0'
        };
        let hintDiv = (
            <div id='errGMDhintDiv' style={hintDivStyle} onClick={this.closeErrorGetMediaDirsHintDiv.bind(this)}>
                <img
                    src="img/media_playlist/device_close.svg"
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '28px',
                        height: '28px'
                    }}
                />
                {lang.getLang('Msg10')}
            </div>
        );
        return hintDiv;
    }

    closeRemoteDevHintDiv() {
        this.setState({
            isRemoteDevHint: false
        });
    }

    renderRemoteDevHintDiv() {
        let hintDivStyle = {
            position:'absolute',
            top: '0',
            width: 'calc(100% - 20px)',
            margin:'10px 10px 0',
            padding: '20px',
            backgroundColor:'rgba(3, 115, 221,0.85)',
            borderRadius:'3px',
            color:'#FFF',
            fontSize:'12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            visibility: this.state.isRemoteDevHint ? 'visible' : 'hidden',
            opacity: this.state.isRemoteDevHint ? '1' : '0'
        };
        let hintDiv = (
            <div id='errGMDhintDiv' style={hintDivStyle} onClick={this.closeRemoteDevHintDiv.bind(this)}>
                <img
                    src="img/media_playlist/device_close.svg"
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '28px',
                        height: '28px'
                    }}
                />
                {lang.getLang('EGMsg03')}
            </div>
        );
        return hintDiv;
    }

    render195ImagePanel() {
        let ifQsirchInatall = this.checkStationDep("Qsirch");
        let topPanelBgSrc = '';
        let ifShowQSirchHint = false;
        let qHintText = '';

        if (this.state.ifLocalNas) {
            if (ifQsirchInatall) {
                ifShowQSirchHint = false;
            } else {
                /*qHintText = this.state.isSupportQsirch 
                    ? '啟用 Qsirch酷先生 套件，開啟智慧搜尋功能。'
                    : '本Nas不支援 Qsirch酷先生 套件。';*/
                qHintText = lang.getLang('MediaListMsg04');
                ifShowQSirchHint = !this.isqSirchHintOpened ? true : false;
            }
        }
        
        if (this.state.curPath==='/') {
            topPanelBgSrc = fileCabinetImgSrc.root;
        } else {
            if (this.state.isQsirchPanelOpen || this.state.isFilterPanelOpen) {
                topPanelBgSrc = fileCabinetImgSrc.result;
            } else {
                if (this.state.ifLocalNas) {
                    if (ifQsirchInatall) {
                        topPanelBgSrc = fileCabinetImgSrc.qSirch;
                    } else {
                        topPanelBgSrc = fileCabinetImgSrc.fileStation;
                    }
                } else {
                    topPanelBgSrc = fileCabinetImgSrc.fileStation;
                }
            }
            
        }
        let qSirchHintDivStyle = {
            position:'absolute',
            top: '0',
            width: 'calc(100% - 20px)',
            margin:'10px 10px 0',
            padding: '25px 10px 13px 10px',
            backgroundColor:'rgba(3, 115, 221,0.85)',
            borderRadius:'3px',
            color:'#FFF',
            fontSize:'12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            visibility: ifShowQSirchHint && this.state.isqSirchHintDivOpen ? 'visible' : 'hidden',
            opacity: ifShowQSirchHint && this.state.isqSirchHintDivOpen ? '1' : '0'
        };
        let qSirchHintDiv = (
            <div style={qSirchHintDivStyle} onClick={this.closeqSirchHintDiv.bind(this)}>
                <img
                    src="img/media_playlist/device_close.svg"
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '28px',
                        height: '28px'
                    }}
                />
                {qHintText}
            </div>
        );

        let clHeight = this.calcHeight();
        return (
            <div style={{
                position:'relative',
                backgroundImage:'url(' + topPanelBgSrc + ')',
                height: clHeight,
                width:'100%',
                overflow:'hidden',
                borderTopLeftRadius:'6px',
                transition: 'background-image 0.3s ease',
            }}>
                {/******* Back, Home, Path, Search Icon *******/}
                <div 
                    style={{
                        display:'flex',
                        alignItems:'center',
                        msFlexAlign: 'center',
                        position:'relative',
                        backgroundColor:'transparent',
                        height:'28px',
                        width:'100%',
                        marginTop:'10px',
                        overflow:'hidden'
                    }}
                >

                    <div style={{height:'100%'}}>
                        {this.renderGoHomeIcon()}
                        {this.renderBackIcon()}
                    </div>

                    <div 
                        style={{
                            width:'230px',
                            height:'100%',
                            display:'flex',
                            alignItems:'center',
                            msFlexAlign:'center',
                            color:'#FFF'
                        }}
                        data-tip={this.getDirLinkPath()}
                    >
                        {this.renderDirLinkPath()}
                    </div>


                    {this.getDisableMask()}
                </div>
                {/******* Back, Home, Path, Search Icon *******/}

                <div 
                    style={{height:'100%',display:'none'}} 
                    onClick={this.getSearchClick.bind(this)}
                >
                    {this.getSearchIcon()}
                </div>
                
                {/****** Root Text Div *******/}
                {this.renderRootTextDiv()}
                {/****** Root Text Div *******/}

                {this.renderSearchRstText()}

                {this.renderSearchInputDiv()}

                {/******* File type filter panel *******/}
                {this.renderFileTypeFilterPanel()}
                {/******* File type filter panel *******/}

                {qSirchHintDiv}

                {this.renderErrorGetMediaDirsHintDiv()}
                {this.renderRemoteDevHintDiv()}
            </div>
        )
    }

    filterClick() {
        if (this.filterPanelObj !== null) {
            this.filterPanelObj.pClickSearch();
        }
        this.setState({
            isFilterPanelOpen: true
        })
    }

    qSirchClick() {
        if (this.qSirchPanelObj !== null) {
            this.qSirchPanelObj.pClickSearch();
        }
        this.setState({
            isQsirchPanelOpen: true
        })
    }

    closeFilterPanel() {
        this.setState({
            isFilterPanelOpen: false,
            patternStr: '',
            filterType: filterTypeEnum.ALL
        })
    }

    closeQsirchPanel() {
        this.setState({
            isQsirchPanelOpen: false,
            patternStr: '',
            modifiedDate: '',
            pcRadio: 'CurrDir',
            filterType: filterTypeEnum.ALL
        })
    }

    renderScrollingLoading() {
        let v = this.state.isScrollingLoading ? 'visible' : 'hidden';
        let o = this.state.isScrollingLoading ? '1' : '0';
        let dStyle = {
            position: 'absolute',
            top: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            msFlexAlign: 'start',
            msFlexPack: 'center',
            paddingBottom: '30px',
            transition: 'all 0.2s ease',
            visibility: v,
            opacity: o
        };
        return (
            <div style={dStyle}>
                <img src="img/media_playlist/v3_icon/dropdown_loading.svg" alt="" className='scrollLoadingIcon'/>
            </div>
        );
    }

    renderRemoteScrollingLoading() {
        let ifShow = this.state.curPath === '/' && this.state.isRemoteScrollingLoading;
        let v = ifShow ? 'visible' : 'hidden';
        let o = ifShow ? '1' : '0';
        let dStyle = {
            position: 'absolute',
            top: '80px',
            width: '100%',
            height: 'calc(100% - 80px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            msFlexAlign: 'start',
            msFlexPack: 'center',
            paddingBottom: '30px',
            transition: 'all 0.2s ease',
            visibility: v,
            opacity: o
        };
        return (
            <div style={dStyle}>
                <img src="img/media_playlist/v3_icon/dropdown_loading.svg" alt="" className='scrollLoadingIcon'/>
            </div>
        );
    }

    renderDefaultDirectoryPanel() {
        let selectAllBtnRender = this.renderSelectAllButton();
        let resultList = null;
        switch(this.state.curPath) {
            case 'localNasFolder': {
                resultList = this.renderLocalNasFolder();
                break;
            }
            case '/': {
                resultList = this.renderMediaDir();
                break;
            }
            default: {
                resultList = this.renderSubList();
            }
        }

        let clHeight = this.calcHeight();
        
        return (
            <div id='div_defaultPanel' style={{height:'calc(100% - ' + clHeight + ')',position:'relative'}}>
                {/* Name and Select All Button */}
                <div style={{backgroundColor:'#1F2635',height:'30px',width:'100%',lineHeight:'30px',borderBottom:'1px solid #283040'}}>
                    {selectAllBtnRender}
                    <span style={{marginLeft:'10px',fontSize:'14px',color:'#FFF',cursor:'defult'}}>{lang.getLang('Name')}</span>
                </div>

                <CustomScrollBar style={{height:'calc(100% - 60px)',backgroundColor:'#1F2635'}} onScroll={this.handleScroll.bind(this)}>
                    { resultList }
                </CustomScrollBar>
                {this.renderScrollingLoading()}
                {this.renderRemoteScrollingLoading()}
                {this.renderBottomCountPanel()}
            </div>
        )
    }

    enterMdfHandle(v) {
        this.setState({
            isEnterMdfDatePanel: v
        })
    }

    getMdfSearchBtnStyle() {
        return this.state.modifiedDate 
            ? 'searchButtonQ' 
            : 'searchButtonQDis';
    }

    renderMdfSearchBtn() {
        /*return this.state.modifiedDate
            ? (
                <div style={{width:'100%',textAlign:'right'}}>
                    <button className={this.getMdfSearchBtnStyle()} onClick={this.qSirchClick.bind(this)} >{lang.getLang('Search')}</button>
                </div>
            ) : (
                <div style={{width:'100%',textAlign:'right'}}>
                    <button className={this.getMdfSearchBtnStyle()}>{lang.getLang('Search')}</button>
                </div>
            );*/
        return (
            <div style={{width:'100%',textAlign:'right'}}>
                <button className='searchButtonQ' onClick={this.closeMdfDatePanel.bind(this)} >{lang.getLang('Close')}</button>
            </div>
        )
    }

    renderMdfDatePanel() {
        let v = this.state.isMdfDatePanelOpen ? 'visible' : 'hidden';
        let o = this.state.isMdfDatePanelOpen ? '1' : '0';
        return (
            <div style={{
                    position:'absolute',
                    top:'155px',
                    width:'calc(100% - 34px)',
                    backgroundColor:'#FFF',
                    fontSize:'12px',
                    borderRadius:'3px',
                    display:'flex',
                    alignItems:'center',
                    msFlexAlign: 'center',
                    flexDirection:'column',
                    msFlexDirection:'column',
                    margin:'0 auto',
                    right: '0',
                    left: '0',
                    visibility: v,
                    opacity: o,
                    transition: 'all 0.3s ease',
                    zIndex: '9',
                    boxShadow: 'rgba(0, 0, 0, 0.176) 0px 6px 12px',
                }}
                onMouseEnter={this.enterMdfHandle.bind(this,true)} 
                onMouseLeave={this.enterMdfHandle.bind(this,false)}
            >
                <div style={{padding:'10px 0 0 10px',width:'100%'}}>{lang.getLang('Modified date')}</div>
                {this.renderDatePanel()}
                {this.renderDatePickerPanel()}
                {this.renderMdfSearchBtn()}
            </div>
        );
    }

    render() {
        
        let dStyle = this.state.isOpenMPL
        ? {
            width: '320px',
            height: 'calc(100% - 100px)',
            visibility: 'visible',
            opacity: '1'
        }
        : {
            width: '0',
            height: 'initial',
            visibility: 'hidden',
            opacity: '0'
        };
        
        return(
            <div id="divMediaPlaylist" style={{...divMediaPlaylist,...dStyle}}>
                {this.render195ImagePanel()}
                {this.renderFilterPanel()}
                {this.renderQsirchPanel()}
                {this.renderDefaultDirectoryPanel()}
                {this.renderMdfDatePanel()}
            </div>
        )
    }
}

const modifiedDateEnum = {
    none: '',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This+Week',
    thisMonth: 'This+Month',
    thisYear: 'This+Year',
    lastWeek: 'Last+Week',
    lastMonth: 'Last+Month',
    lastYear: 'Last+Year',
    customize: 'Customize'
}

const filterTypeEnum = {
    ALL: 'all',
    AUDIO: 'audio',
    VIDEO: 'video',
    PHOTO: 'photo'
}


const fileTypeIcon = {
    audio: 'img/media_playlist/v3_icon/file_type/device_music.svg',
    video: 'img/media_playlist/v3_icon/file_type/device_video.svg',
    image: 'img/media_playlist/v3_icon/file_type/device_photo.svg',
    folder: 'img/media_playlist/v3_icon/file_type/device_folder.svg',
};

const deviceTypeIcon = {
    folder: 'img/media_playlist/v3_icon/device_nas.svg',
    external: 'img/media_playlist/v3_icon/device_usb.svg',
    odd: 'img/media_playlist/v3_icon/device_cd.svg',
    iso: 'img/media_playlist/v3_icon/device_iso.svg',
    mtp: 'img/media_playlist/v3_icon/device_mobile.svg',
}

const remoteDeviceTypeIcon = {
    googleDrive: 'img/media_playlist/google_drive.svg',
    amazonDrive: 'img/media_playlist/amazon_drive.svg',
    dropbox: 'img/media_playlist/dropbox.svg',
    hiDrive: 'img/media_playlist/hidrive.svg',
    oneDrive : 'img/media_playlist/onedrive .svg',
    oneDriveBusiness: 'img/media_playlist/onedrive_business.svg',
    yandexDisk: 'img/media_playlist/yandex_disk.svg',
    box: 'img/media_playlist/box.svg',
    davfs: ''
}

const remoteDeviceTypeIconNonCloud = {
    davfsFuse:'img/media_playlist/v3_icon/device_ftp.svg',
    ftpfs: 'img/media_playlist/v3_icon/device_ftp.svg',
    cifs: 'img/media_playlist/v3_icon/device_samba.svg',
    sshfs: 'img/media_playlist/v3_icon/device_ftp.svg',
    nfs: 'img/media_playlist/v3_icon/device_ftp.svg',
    afpfs: 'img/media_playlist/v3_icon/device_ftp.svg',
    davfs: 'img/media_playlist/v3_icon/device_ftp.svg',
}

const fileCabinetImgSrc = {
    root: 'img/media_playlist/v3_icon/file_cabinet/file_cabinet_pic1.svg',
    fileStation: 'img/media_playlist/v3_icon/file_cabinet/file_cabinet_pic2.svg',
    qSirch: 'img/media_playlist/v3_icon/file_cabinet/file_cabinet_pic3.svg',
    result: 'img/media_playlist/v3_icon/file_cabinet/file_cabinet_pic4.svg',
}

const divMediaPlaylist = {
  position: 'absolute',
  right: '0',
  backgroundColor: '#1F2635',
  boxShadow: '0 0 10px rgba(255,255,255,0.2)',
  borderBottomLeftRadius: '6px',
  borderTopLeftRadius: '6px',
  transition: 'all 0.7s ease'
};

const folderIconStyle = {
    marginLeft: '10px',
    width: '28px',
    height: '28px',
}

const fileIconStyle = {
    margin: '0 5px',
    width: '28px',
    height: '28px',
}

const checkBoxImgStyle = {
    marginLeft: '10px'
}

const folderSpan = {
    marginLeft:'10px',
    fontSize:'14px',
    overflow:'hidden',
    whiteSpace:'nowrap',
    textOverflow:'ellipsis',
    width:'255px',
    display:'inline-block',
    color: '#FFF',
}
const isIETmp = /*@cc_on!@*/false || !!document.documentMode;
const folderPathSpan = {
    fontSize: '14px',
    cursor: 'pointer',
    maxWidth: isIETmp ? '40px' : '70px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    overflow: 'hidden',
}

const styleGhostDiv = [
    'height: 45px',
    'background-color: rgba(255,255,255,0.25)',
    'border: 1.5px solid #FFFFFF',
    'border-radius: 6px',
    'color: white',
    'opacity: 1',
    'padding: 0 15px',
    'font-size: 16px',
    'font-weight: bold',
    'overflow-wrap: break-word',
    'position: absolute',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    '-ms-flex-align: center',
    '-ms-flex-pack: center'
].join(';');


class RadioButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgSrc: this.props.name === this.props.currentName
                ? "img/media_playlist/v3_icon/device_radio_bt_1.svg"
                : "img/media_playlist/v3_icon/device_radio_bt_0.svg"
        }
    }
    handleClick() {
        this.props.clickFunc(this.props.name);
    }
    render() {
        return(
            <img style={{marginTop:'-2px'}} src={this.state.imgSrc} onClick={this.handleClick.bind(this)} />
        );
    }
}