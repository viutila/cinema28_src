import React from 'react';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import * as CommonActions from "js/actions/CommonActions";

import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import Bootstrap from "bootstrap";
import 'css/MediaPlaylist.css';

import CustomScrollBar from 'js/components/Common/CustomScrollBar';
import ScrollArea from 'react-scrollbar';

import CheckBox from './CheckBox';

export default class FilterPanel extends React.Component {
    constructor(props) {
        super(props);

        this.getFilterSubDirs = this.getFilterSubDirs.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getFilterSubDirsTotal = this.getFilterSubDirsTotal.bind(this);

        this.state = {
            selectAll: false,
            filterSubDirsTotal: {},

            isFilterTypePanelOpen: false,
            typeCheckArray: [],
            patternStr: '',
            filterSubDirs: {},
            isShowResult: false,
            curPath: this.props.curPath,
            filterType: filterTypeEnum.ALL,
            isSearching: false,
            isScrollingLoading: false,
        }
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.inputElement = [];
        this.shiftIndex = 0;
        this.scrollBottonCount = 1;
        this.currMediaProtocol = '';
    }

    componentWillMount() {
        MainStore.on('getFilterSubDirsDone', this.getFilterSubDirs);
        MainStore.on('getFilterSubDirsTotalDone', this.getFilterSubDirsTotal);
        document.addEventListener('click', this.handleClick, false);
    }

    componentWillUnmount() {
        MainStore.removeListener('getFilterSubDirsDone', this.getFilterSubDirs);
        MainStore.removeListener('getFilterSubDirsTotalDone', this.getFilterSubDirsTotal);
        document.removeEventListener('click', this.handleClick, false);
    }

    componentWillReceiveProps(nextProps) {
        let prevFilterType = this.state.filterType;
        this.currMediaProtocol = nextProps.currMediaProtocol;
        this.setState({
            isOpen: nextProps.isOpen,
            curPath: nextProps.curPath,
            patternStr: nextProps.patternStr,
            filterType: nextProps.filterType
        },()=>{
            if (!this.state.isOpen) {
                this.clearResult();
            }
            if (this.state.filterType !== prevFilterType) {
                let rstTmp = this.state.filterSubDirs;
                this.setState({
                    filterSubDirs: {}
                },()=>{
                    this.setState({
                        filterSubDirs: rstTmp
                    })
                })
                this.onClickAll(false);
            }
        });
    }

    getFilterSubDirsTotal() {
        let rst = MainStore.getFilterSubDirsTotal();
        let tmpAry = rst.items;
        let that = this;
        tmpAry.forEach(function(item,i) {
            let filePath = that.state.curPath + item.name;
            item.filePath = filePath;
        })
        this.setState({
            filterSubDirsTotal: rst
        },()=>{console.log('getFilterSubDirsTotalDone',this.state.filterSubDirsTotal)});
    }

    getFilterSubDirs() {
        this.setState({
            filterSubDirs: MainStore.getFilterSubDirs(),
            isShowResult: true,
            isSearching: false,
            isScrollingLoading: false
        });
        /*let rst = MainStore.getFilterSubDirs();
        let totalCnt = +rst.total;
        if (totalCnt > 0) {
            this.filterSearchTotal(totalCnt);
        }*/
    }

    itemOnClick(i,e) {
        //event.stopPropagation();
        console.log(i);
 
        if(e.shiftKey) {
            if ( i>= this.shiftIndex) {
                this.inputElement.forEach(function(item,idx) {
                    if (item[0] <= i && item[0] >= this.shiftIndex) {
                        if (item[1] !== null)
                            item[1].handleClickTrue();
                    } else {
                        if (item[1] !== null)
                            item[1].handleClickFalse();
                    }
                }.bind(this));
            } else if ( i < this.shiftIndex ) {
                this.inputElement.forEach(function(item,idx) {
                    if (item[0] >= i && item[0] <= this.shiftIndex) {
                        if (item[1] !== null)
                            item[1].handleClickTrue();
                    } else {
                        if (item[1] !== null)
                            item[1].handleClickFalse();
                    }
                }.bind(this));
            }
                 
        } else {
            let comp = null;
            this.inputElement.forEach(function(item,idx) {
                if (item[0] === i)
                    comp = item[1];
            })
            console.log(comp);
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
            }
        }
        this.forceUpdate();
    }

    handleInputElement(ele,idx) {
        if (ele !== null) {
            this.inputElement.push([idx,ele]);
        }
    }

    filterItemOnClick(e) {
        e.currentTarget.children[0].click();
    }

    pClickSearch() {    /******* For Parent to call *******/
        this.clearResult();
        this.filterSearch();
        this.setState({
            isSearching: true
        });
    }

    filterSearch() {
        let filterTypeArray = this.state.typeCheckArray;
        let patternStr = this.state.patternStr === '' ? '*' : '*' + this.state.patternStr + '*';
        //let filterStr = filterTypeArray.length > 0 ? filterTypeArray.toString() : 'audio,photo,video';
        let filterStr = 'audio,photo,video';
        let path = this.state.curPath;
        let cnt = this.scrollBottonCount * 100;
        MainActions.getFilterSubDirs(path, filterStr, patternStr, cnt);
    }

    filterSearchTotal(totalCnt) {
        let filterTypeArray = this.state.typeCheckArray;
        let patternStr = this.state.patternStr === '' ? '*' : '*' + this.state.patternStr + '*';
        let filterStr = 'audio,photo,video';

        let path = this.state.curPath;

        MainActions.getFilterSubDirsTotal(path, filterStr, patternStr, totalCnt);
    }

    patternStrChange(event) {
        this.setState({
            patternStr: event.target.value
        })
    }

    handleClick(e) {
        /*if (e.target.id !== "div_filterTypePanel" && 
            e.target.id !== 'div_fileType' && 
            e.target.id !=='btnSelectFilter' &&
            !document.getElementById("div_filterTypePanel").contains(e.target) &&
            !document.getElementById("div_fileType").contains(e.target)) {
            this.setState({
                isFilterTypePanelOpen: false
            });
        }*/
    }
    
    onClickAll(v) {
        /*if (Object.getOwnPropertyNames(this.state.filterSubDirsTotal).length === 0) {
            return false;
        }*/
        if (Object.getOwnPropertyNames(this.state.filterSubDirs).length === 0)
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

    calcRealFileNumber() {
        //let tmpAry = this.state.filterSubDirsTotal.items;
        let tmpAry = this.state.filterSubDirs.items;
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

    closeResult() {
        this.setState({
            isShowResult: false,
            selectAll: false,
        })
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.shiftIndex = 0;
        this.scrollBottonCount = 1;
    }

    clearResult() {
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.shiftIndex = 0;
        this.scrollBottonCount = 1;
        this.setState({
            selectAll: false,
            filterSubDirsTotal: {},
            filterSubDirs: {},
        });
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
            let totalItems = this.state.filterSubDirsTotal.items;
            totalItems.forEach(function(item,i){
                if (+item.dir === 0 && this.checkArrayMinus.indexOf(item.filePath) < 0) {
                    curCheckArray.push(item);
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
        e.dataTransfer.setDragImage(crt, -15, -10);
        e.dataTransfer.setData("obj", j );
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

    handleScroll(e) {

        if (e.target.scrollTop + e.target.clientHeight === e.target.scrollHeight) {
            if (+this.state.filterSubDirs.total > this.state.filterSubDirs.items.length) {
                console.log('Filter Panel Scroll to Bottom!!! - Get more data');
                this.scrollBottonCount++;
                this.filterSearch();
                this.setState({
                    isScrollingLoading: true
                });
            }
        }
    }


    renderFilterResult01() {
        var tmpItemArray = this.state.filterSubDirs.items;
        let dStyle = {
            position:'absolute',
            width:'100%',
            height:'100%',
            zIndex:'2',
            backgroundColor:'#1F2635',
            textAlign: 'center',
            paddingTop: '100px'

        };

        if (typeof tmpItemArray == 'undefined')
            return null;

        let dirCnt = _.filter(tmpItemArray,(o)=>{return o.dir === '1'}).length;

        if (tmpItemArray.length === 0 || tmpItemArray.length === dirCnt) {
            return (
                <div style={dStyle}>
                    <img src='img/media_playlist/v3_icon/empty_pic.svg' />
                    <p style={{fontSize:'15px',color:'rgba(255,255,255,0.3)',padding:'15px'}}>
                        {lang.getLang('Msg37')}
                    </p>
                </div>
            );
        }

        this.inputElement = [];
            
        var dirListArray = [];
        var that = this;
        let totalCountReal = this.calcRealFileNumber();//+this.state.filterSubDirs.total;
        let minus = 0;
        tmpItemArray.forEach((item,i)=>{
            var tmp;
            var filePath = that.state.curPath + item.name;
            var fileObj = item;
            fileObj.filePath = filePath;
            switch(item.type) {
                case "":
                    /*item.dir == "1" ?
                        tmp = ( <div className='folderDiv' key={i} onClick={that.dirOnClick.bind(that,item.name)}>
                                    <div style={{float:'left',height:'100%'}}><img src={fileTypeIcon.folder} style={fileIconStyle} /></div>
                                    <div style={{float:'left',height:'100%'}}>
                                        <span style={folderSpan} data-tip={item.name}>{item.name}</span>
                                    </div>
                                    <img src='img/media_playlist/folder_arrow.png' style={{position:'relative',float:'right'}} />
                                </div> )
                        :*/
                        tmp = null;
                        minus++;
                    break;
                case "audio":

                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i-minus)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                        ref={(input) => this.handleInputElement(input,i-minus)}
                                    />
                                    <img src={fileTypeIcon.audio} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;
                case "photo":

                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i-minus)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                        ref={(input) => this.handleInputElement(input,i-minus)}
                                    />
                                    <img src={fileTypeIcon.image} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;
                case "video":

                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i-minus)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                        ref={(input) => this.handleInputElement(input,i-minus)}
                                    />
                                    <img src={fileTypeIcon.video} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;

            }
            //dirListArray.push(tmp);
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
        })

        if (dirListArray.length === 0) {
            return (
                <div style={dStyle}>
                    <img src='img/media_playlist/v3_icon/empty_pic.svg' />
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
        if (Object.getOwnPropertyNames(this.state.filterSubDirs).length === 0) {
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
            return (
                <div style={{...dStyle}}>
                    <span style={{fontSize:'13px',color:'#FFF',marginRight:'10px'}}>
                        {lang.getLang('Selected')}: {selectedCount} , {lang.getLang('Total')}: {totalCountReal}
                    </span>
                </div>
            );
        }
    }

    renderSelectAllButton() {
        let selectAllBtnRender = this.state.selectAll
            ? <button className='unselectAllBtn' onClick={this.onClickAll.bind(this,false)}>{lang.getLang('Cancel select all')}</button>
            : <button className='selectAllBtn' onClick={this.onClickAll.bind(this,true)}>{lang.getLang('Select all')}</button>;
        return selectAllBtnRender;
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
        }
        return (
            <div style={dStyle}>
                <img src="img/media_playlist/v3_icon/dropdown_loading.svg" alt="" className='scrollLoadingIcon' />
            </div>
        )
    }

    renderSearchingLoading() {
        let v = this.state.isSearching ? 'visible' : 'hidden';
        let o = this.state.isSearching ? '1' : '0';
        let imgClassName = this.state.isSearching ? 'searchLoadingIcon' : '';
        let dStyle = {
            position:'absolute',
            top:'0',
            width:'100%',
            height:'100%',
            textAlign:'center',
            paddingTop:'100px',
            transition: 'all 0.2s ease',
            visibility: v,
            opacity: o
        };
        return (
            <div style={dStyle}>
                <img src="img/media_playlist/v3_icon/search_pic.svg" alt="" className={imgClassName}/>
                <p style={{fontSize:'15px',color:'#FFF',padding:'15px'}}>
                    {lang.getLang('Searching')}
                </p>
            </div>
        )
    }

    renderFilterResult02() {
        let selectAllBtnRender = this.renderSelectAllButton();
        let resultList = this.renderFilterResult01();
        let filterPanelStyle = {
            height:'calc(100% - 195px)',
            width:'100%',
            backgroundColor:'#1F2635',
            display: this.state.isOpen ? 'block' : 'none',
            position:'absolute',
            zIndex:'2'
        };
        return (
            <div id='div_filterPanel' style={filterPanelStyle}>
                {/* Name and Select All Button */}
                <div style={{backgroundColor:'#1F2635',height:'30px',width:'100%',lineHeight:'30px',borderBottom:'1px solid #283040'}}>
                    {selectAllBtnRender}
                    <span style={{marginLeft:'10px',fontSize:'14px',color:'#FFF'}}>{lang.getLang('Name')}</span>
                </div>

                <CustomScrollBar style={{height:'calc(100% - 60px)',backgroundColor:'#1F2635'}} onScroll={this.handleScroll.bind(this)}>
                    { resultList }
                </CustomScrollBar>
                {this.renderSearchingLoading()}
                {this.renderScrollingLoading()}
                {this.renderBottomCountPanel()}
            </div>
        )
    }

    render() {
        return this.renderFilterResult02();
    }
}

const filterTypeEnum = {
    ALL: 'all',
    AUDIO: 'audio',
    VIDEO: 'video',
    PHOTO: 'photo'
}

const filterResultHint = {
    width:'100%',
    height:'30px',
    backgroundColor:'#00A0E9',
    position:'absolute',
    top:'-30px',
    display:'flex',
    alignItems:'center',
    msFlexAlign: 'center',
}

const filterTypeItem = {
    margin:'15px 0 0 15px',
    cursor:'pointer',
    display:'inline-block'
}

const filterTypeSpan = {
    fontSize:'12px',
    color:'#000000',
    marginLeft:'10px',
}

const divFilterPanel = {
    position:'absolute',
    width:'100%',
    height:'calc( 100% - 65px)',
    backgroundColor:'#ffffff',
    zIndex:'2',
}

const fileTypeIcon = {
    audio: 'img/media_playlist/v3_icon/file_type/device_music.svg',
    video: 'img/media_playlist/v3_icon/file_type/device_video.svg',
    image: 'img/media_playlist/v3_icon/file_type/device_photo.svg',
    folder: 'img/media_playlist/v3_icon/file_type/device_folder.svg',
};

const fileIconStyle = {
    margin: '0 5px',
    width: '28px',
    height: '28px',
}

const checkBoxImgStyle = {
    marginLeft: '10px',
    width: '28px',
    height: '28px',
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