import React from 'react';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import * as CommonActions from "js/actions/CommonActions";

import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import Bootstrap from "bootstrap";
import 'css/QsirchPanel.css';

import CustomScrollBar from 'js/components/Common/CustomScrollBar';
import ScrollArea from 'react-scrollbar';

import CheckBox from './CheckBox';
import FontAwesome from 'react-fontawesome';
//import BrowsePathPanel from './BrowsePathPanel';
import 'rc-calendar/assets/index.css';
import Calendar from 'rc-calendar';
import DatePicker from 'rc-calendar/lib/Picker';
import moment from 'moment';
import $ from "jquery";
import './datepicker';
import 'css/datepicker.css';

export default class QsirchPanel extends React.Component {
    constructor(props) {
        super(props);
        this.getQsirchRstPath = this.getQsirchRstPath.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getQsirchDone = this.getQsirchDone.bind(this);
        this.getQsirchTotalDone = this.getQsirchTotalDone.bind(this);

        this.state= {
            isOpen: this.props.isOpen,
            patternStr: '',
            qSirchRstPath: [],
            typeCheckArray: [],
            isQsirchTypePanelOpen: false,
            sizeIcon: '>',
            fileSize: '',
            sizeUnit: 'KB',
            modifiedDate: '',
            startValue: null,
            endValue: null,
            key1: Math.random(),
            isShowResult: false,
            qSirchSearchData: null,
            qSirchSearchTotalData: null,
            selectAll: false,
            curPath: this.props.curPath,
            filterType: filterTypeEnum.ALL,
            ifCurDir: false,
            isSearching: false,
            isScrollingLoading: false,
        }

        this.modifiedDate = {
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
        this.inputElement = [];
        this.shiftIndex = 0;
        this.scrollBottonCount = 1;
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.currMediaProtocol = '';
    }

    componentWillMount() {
        MainStore.on('selectQsirchPathDone', this.getQsirchRstPath);
        MainStore.on('getQsirchDone', this.getQsirchDone);
        MainStore.on('getQsirchTotalDone', this.getQsirchTotalDone);
        document.addEventListener('click', this.handleClick, false);
    }

    componentWillUnmount() {
        MainStore.removeListener('selectQsirchPathDone', this.getQsirchRstPath);;
        MainStore.removeListener('getQsirchDone', this.getQsirchDone);
        MainStore.removeListener('getQsirchTotalDone', this.getQsirchTotalDone);
        document.removeEventListener('click', this.handleClick, false);
    }

    componentWillReceiveProps(nextProps) {
        let prevFilterType = this.state.filterType;
        this.currMediaProtocol = nextProps.currMediaProtocol;
        this.setState({
            isOpen: nextProps.isOpen,
            curPath: nextProps.curPath,
            patternStr: nextProps.patternStr,
            filterType: nextProps.filterType,
            modifiedDate: nextProps.modifiedDate,
            ifCurDir: nextProps.ifCurDir
        },()=>{
            if (!this.state.isOpen) {
                this.clearResult();
            }
            if (this.state.filterType !== prevFilterType) {
                let rstTmp = this.state.qSirchSearchData;
                this.setState({
                    qSirchSearchData: null
                },()=>{
                    this.setState({
                        qSirchSearchData: rstTmp
                    })
                })
                this.onClickAll(false);
            }
        });
    }

    componentDidMount() {

        /*$('.datepicker').datepicker({
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
        };*/

    }

    getQsirchRstPath() {
        this.setState({
            qSirchRstPath: MainStore.getQsirchRstPath()
        })
    }
    getQsirchDone() {
        this.setState({
            isShowResult: true,
            qSirchSearchData: MainStore.getQsirchSearchData(),
            isSearching: false,
            isScrollingLoading: false
        });
        /*let rst = MainStore.getQsirchSearchData();
        let totalCnt = rst.total;
        if (totalCnt > 0) {
            this.doSearchTotal(totalCnt);
        }*/
    }

    getQsirchTotalDone() {
        let rst = MainStore.getQsirchSearchTotalData();
        let tmpAry = rst.items;
        tmpAry.forEach(function(item,i) {
            let filePath = '/share/' + item.path + '/' + item.name + '.' + item.extension;
            let fileObj = item;
            fileObj.filePath = filePath;
            switch(item.category[0]) {
                case "":
                        tmp = null;
                    break;
                case "Music":
                    fileObj.type = 'audio';
                    break;
                case "Images":
                    fileObj.type = 'photo';
                    break;
                case "Videos":
                    fileObj.type = 'video';
                    break;
            }
        })
        
        this.setState({
            qSirchSearchTotalData: rst
        })
    }

    patternStrChange(event) {
        this.setState({
            patternStr: event.target.value
        })
    }

    openBrowsePathPanel() {
        MainActions.showBrowsePathPanel();
    }

    removePath(path) {
        let pathAry = this.state.qSirchRstPath;
        let idx = pathAry.indexOf(path);
        if (idx > -1) {
        //this.qSirchPath.splice(path,1);
        }
        _.remove(pathAry, function(n) {
            return n === path;
        })
        console.log('remove PATH!!',pathAry);
    }

    handleClick(e) {
        
        
        if (e.target.id !== "div_qsirchTypePanel" && 
            e.target.id !== 'div_fileType' && 
            e.target.id !=='btnSelectFilter'
            /*!document.getElementById("div_qsirchTypePanel").contains(e.target) &&
            !document.getElementById("div_fileTypeQsirch").contains(e.target)*/
            ) {
            this.setState({
                isQsirchTypePanelOpen: false
            });
        }
    }

    filterItemOnClick(e) {
        e.currentTarget.children[0].click();
    }

    setFilterTypeCheckArray(flag, path) {
        var tmpAry = this.state.typeCheckArray;
        if (flag) {
            var index = tmpAry.indexOf(path);
            if (index == -1) {
                tmpAry.push(path);
                this.setState({typeCheckArray: tmpAry});
            }
        } else{
            var index = tmpAry.indexOf(path);
            if (index > -1) {
                tmpAry.splice(index, 1);
            }
            this.setState({typeCheckArray: tmpAry});
        }
        //console.log(this.state.checkArray);
    }

    getFilterTypeText() {
        let filterTypeArray = this.state.typeCheckArray;
        let arrayLength = filterTypeArray.length;
        if (arrayLength > 0) {
            let text = filterTypeArray.toString();
            return text;
        } else {
            return null;
        }
    }

    filterSearch() {
        let filterTypeArray = this.state.typeCheckArray;
        let patternStr = this.state.patternStr === '' ? '*' : '*' + this.state.patternStr + '*';
        let filterStr = filterTypeArray.length > 0 ? filterTypeArray.toString() : 'audio,photo,video';

        //let path = this.state.curPath;

        //MainActions.getFilterSubDirs(path, filterStr, patternStr);
    }

    isQsirchTypePanelOpen() {
        this.setState({
            isQsirchTypePanelOpen: !this.state.isQsirchTypePanelOpen
        })
    }

    renderFileTypePanel() {
        let typeDisplayStyle = this.state.isQsirchTypePanelOpen ? 'block' : 'none';
        let rstAry = [];
        rstAry.push(
            <div id='div_fileTypeQsirch' className='fileTypeDiv' onClick={this.isQsirchTypePanelOpen.bind(this)} key='897'>
                <span style={{...filterTypeSpan, marginLeft:'15px'}}>{this.getFilterTypeText()}</span>
                <img id='btnSelectFilter' src='img/arrow/arrowdown_0.svg' style={{position:'absolute',top:'8px',right:'8px'}} />
            </div>
        );
        rstAry.push(
            <div id='div_qsirchTypePanel' style={{...qsirchTypePanel,display:typeDisplayStyle}} key={this.state.key1}>
                <div>
                    <div style={filterTypeItem} onClick={this.filterItemOnClick.bind(this)}>
                        <CheckBox checked={false} clickFunc={this.setFilterTypeCheckArray.bind(this)} fileObj='Images' imgStyle={{}} />
                        <span style={filterTypeSpan}>照片</span>
                    </div>
                </div>
                <div>
                    <div style={filterTypeItem} onClick={this.filterItemOnClick.bind(this)}>
                        <CheckBox checked={false} clickFunc={this.setFilterTypeCheckArray.bind(this)} fileObj='Music' imgStyle={{}} />
                        <span style={filterTypeSpan}>音樂</span>
                    </div>
                </div>
                <div>
                    <div style={filterTypeItem} onClick={this.filterItemOnClick.bind(this)}>
                        <CheckBox checked={false} clickFunc={this.setFilterTypeCheckArray.bind(this)} fileObj='Videos' imgStyle={{}} />
                        <span style={filterTypeSpan}>影片</span>
                    </div>
                </div>
            </div>
        )
        return rstAry;
    }

    getSizeIcon() {
        let rst;
        if (this.state.sizeIcon === '>') {
            rst = 'chevron-right';
        } else if (this.state.sizeIcon === '<') {
            rst = 'chevron-left';
        }
        return <FontAwesome name={rst} style={{fontSize:'16px',color:'#000000'}} />
    }

    setSizeIcon(icon) {
        this.setState({
            sizeIcon: icon
        })
    }

    getSizeUnit() {
        return this.state.sizeUnit;
    }

    setSizeUnit(unit) {
        this.setState({
            sizeUnit: unit,
        })
    }

    renderSizeIconPanel() {
        let iconListAry = [];
        let unitListAry = [];

        iconListAry.push(
            <li key={123}>
                <a style={ddLiA} onClick={this.setSizeIcon.bind(this,'>')}>
                    <FontAwesome name='chevron-right' style={{fontSize:'16px',color:'#000000'}} />
                </a>
            </li>);
        iconListAry.push(
            <li key={456}>
                <a style={{...ddLiA,marginBottom:'10px'}} onClick={this.setSizeIcon.bind(this,'<')}>
                    <FontAwesome name='chevron-left' style={{fontSize:'16px',color:'#000000'}} />
                </a>
            </li>);

        unitListAry.push(
            <li key={9}>
                <a style={ddLiA} onClick={this.setSizeUnit.bind(this,'KB')}><span>KB</span></a>
            </li>);
        unitListAry.push(
            <li key={8}>
                <a style={ddLiA} onClick={this.setSizeUnit.bind(this,'MB')}><span>MB</span></a>
            </li>);
        unitListAry.push(
            <li key={7}>
                <a style={{...ddLiA,marginBottom:'10px'}} onClick={this.setSizeUnit.bind(this,'GB')}><span>GB</span></a>
            </li>);

        return (
            <div style={{width:'100%',padding:'8px 0 0 10px'}}>
                <div class="btn-group dropdown">
                    <div className='divSelectSizeIcon' role="button" data-toggle="dropdown">
                        {this.getSizeIcon()}
                        <img src='img/arrow/arrowdown_0.svg' style={{marginLeft:'3px'}}/>
                    </div>
                    <ul class="dropdown-menu" 
                        style={{top:'21px',minWidth:'60px',padding:'0'}} 
                        role="menu" 
                        aria-labelledby="dropdownMenu">
                            {iconListAry}
                    </ul>
                </div>

                <input 
                    id="input_fileSize" 
                    style={{height:'24px',fontSize:'13px',padding:'0 10px'}} 
                    onChange={this.fileSizeChange.bind(this)} value={this.state.fileSize} 
                    type="text" 
                    autoComplete="off" 
                    placeholder="" 
                />

                <div class="btn-group dropdown">
                    <div className='divSelectSizeIcon' role="button" data-toggle="dropdown">
                        <span style={{fontSize:'13px',fontWeight:'bold'}}>{this.getSizeUnit()}</span>
                        <img src='img/arrow/arrowdown_0.svg' style={{marginLeft:'3px'}}/>
                    </div>
                    <ul class="dropdown-menu" 
                        style={{top:'21px',minWidth:'60px',padding:'0'}} 
                        role="menu" 
                        aria-labelledby="dropdownMenu">
                            {unitListAry}
                    </ul>
                </div>
            </div>
        );
        
    }

    fileSizeChange(event) {
        this.setState({
            fileSize: event.target.value
        })
    }

    getModifiedDate() {
        return this.state.modifiedDate;
    }

    setDate(dateStr) {
        this.setState({
            modifiedDate: dateStr
        })
    }

    renderDateItem(keyValue,displayStr,setStr) {
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
        dateListAry.push(this.renderDateItem(1,'----- 無 -----',''));
        dateListAry.push(this.renderDateItem(2,'今天',this.modifiedDate.today));
        dateListAry.push(this.renderDateItem(3,'昨天',this.modifiedDate.yesterday));
        dateListAry.push(this.renderDateItem(4,'本週',this.modifiedDate.thisWeek));
        dateListAry.push(this.renderDateItem(5,'本月',this.modifiedDate.thisMonth));
        dateListAry.push(this.renderDateItem(6,'今年',this.modifiedDate.thisYear));
        dateListAry.push(this.renderDateItem(7,'上週',this.modifiedDate.lastWeek));
        dateListAry.push(this.renderDateItem(8,'上個月',this.modifiedDate.lastMonth));
        dateListAry.push(this.renderDateItem(9,'去年',this.modifiedDate.lastYear));
        dateListAry.push(this.renderDateItem(10,'自訂日期',this.modifiedDate.customize));
        return(
            <div class="btn-group dropdown" style={{width:'100%',padding:'8px 10px 0'}}>
                <div className='divSelectSizeIcon' style={{width:'100%'}} role="button" data-toggle="dropdown">
                    <span style={{fontSize:'13px',fontWeight:'bold'}}>{this.getModifiedDate()}</span>
                    <img src='img/arrow/arrowdown_0.svg' style={{position:'absolute',right:'18px'}}/>
                </div>
                <ul class="dropdown-menu" 
                    style={{top:'30px',minWidth:'300px',height:'120px',overflowX:'hidden',padding:'0'}} 
                    role="menu" 
                    aria-labelledby="dropdownMenu">
                        {dateListAry}
                </ul>
            </div>
        )
    }

    onChange(field, value) {
        console.log('onChange', field, value && value.format('YYYY-MM-DD'));
        this.setState({
            [field]: value,
        });
    }

    disabledEndDate(endValue) {
        if (!endValue) {
        return false;
        }
        const startValue = this.state.startValue;
        if (!startValue) {
        return false;
        }
        return false ? endValue.isBefore(startValue) :
        endValue.diff(startValue, 'days') <= 0;
    }

    disabledStartDate(startValue) {
        if (!startValue) {
        return false;
        }
        const endValue = this.state.endValue;
        if (!endValue) {
        return false;
        }
        return false ? endValue.isBefore(startValue) :
        endValue.diff(startValue, 'days') <= 0;
    }

    getFormat(time) {
        return time ? format : 'YYYY-MM-DD';
    }

    renderDatePickerPanel() {
        let displayStyle = 'none';
        if (this.state.modifiedDate === this.modifiedDate.customize)
        {
            displayStyle = 'block';
        }
            
        return (
            <div style={{display: displayStyle,textAlign:'center'}}>
                <input id='start_date' type="text" className="datepicker" style={{height:'24px',width: '110px',fontSize:'13px',padding:'0 10px'}} />
                <span style={{position:'absolute',left:'147px',top:'313px'}}>-</span>
                <input id='end_date' type="text" className="datepicker" style={{height:'24px',width: '110px',fontSize:'13px',padding:'0 10px'}} />
            </div>
        );
    }

    clearCondition() {
        this.setState({
            patternStr: '',
            qSirchRstPath: [],
            typeCheckArray: [],
            fileSize: '',
            sizeUnit: 'KB',
            modifiedDate: '',
            key1: Math.random(),
        });
        MainActions.refreshBPP();
    }

    searchPath() {
        let rst = '';
        if (this.state.curPath === 'localNasFolder') {
            
        } else {
            if (this.state.ifCurDir) {
                let curPath = this.state.curPath;
                rst = curPath.replace('/share','');
                rst = '(path:' + '"'+ rst +'") ';
            } else {

            }
        }
        return rst;
    }

    doSearch() {
        //***** File Type *****/
        /*let filterTypeArray = this.state.typeCheckArray;
        
        let fileTypeStr = '';
        if (filterTypeArray.length>0) {
            let tmpAry = [];
            filterTypeArray.forEach(function(item,idx) {
                tmpAry.push('category:' + '"'+ item +'"');
            })
            fileTypeStr = tmpAry.toString();
            fileTypeStr = fileTypeStr.replace(/,/g, ' OR ');
            fileTypeStr = '(' + fileTypeStr + ') ';
        } else {*/
        let fileTypeStr = '(category:"Images" OR category:Videos OR category:Music) ';
        //}
        
        //console.log(fileTypeStr);

        //***** Modified Date *****/
        let modifiedDateR = ''
        if (this.state.modifiedDate === this.modifiedDate.customize) {
            let startDate = document.getElementById('start_date').value;
            let endDate = document.getElementById('end_date').value;
            modifiedDateR = 'modified:"' + startDate + '..' + endDate + '"';
        } else if (this.state.modifiedDate === this.modifiedDate.none) {

        } else {
            modifiedDateR = 'modified:"' + this.state.modifiedDate + '" ';
        }
        //console.log('modifiedDateR',modifiedDateR);

        //***** Size *****/
        let sizeStr = ''
        /*if (this.state.fileSize !== '') {
            sizeStr = 'size:"' + this.state.sizeIcon + this.state.fileSize + this.state.sizeUnit + '" ';
        }*/

        /*console.log('sizeStr',sizeStr);*/

        //***** Path *****/
        /*let pathAry = this.state.qSirchRstPath;
        let pathStr = '';
        if (pathAry.length>0) {
            let tmpAry = [];
            pathAry.forEach(function(item,idx) {
                tmpAry.push('path:' + '"'+ item +'"');
            })
            pathStr = tmpAry.toString();
            pathStr = pathStr.replace(/,/g, ' OR ');
            pathStr = '(' + pathStr + ') ';
        }*/

        let pathStr = this.searchPath();
        //console.log('pathStr',pathStr);


        let curTimeStamp = + new Date();
        let cnt = this.scrollBottonCount * 100;
        let str = 'q=' + 
            fileTypeStr + modifiedDateR + sizeStr + pathStr +
            this.state.patternStr +
            '&offset=0&limit=' + 
            cnt + 
            '&highlight=content&image=thumb&highlight_limit=100&ts=' + 
            curTimeStamp;

        console.log('QSirch Search condition Str',str);
        MainActions.qSirchSearch(str);
    }

    doSearchTotal(totalCnt) {
        //***** File Type *****/
        let filterTypeArray = this.state.typeCheckArray;
        
        let fileTypeStr = '';
        if (filterTypeArray.length>0) {
            let tmpAry = [];
            filterTypeArray.forEach(function(item,idx) {
                tmpAry.push('category:' + '"'+ item +'"');
            })
            fileTypeStr = tmpAry.toString();
            fileTypeStr = fileTypeStr.replace(/,/g, ' OR ');
            fileTypeStr = '(' + fileTypeStr + ') ';
        } else {
            fileTypeStr = '(category:"Images" OR category:Videos OR category:Music) ';
        }
        
        console.log(fileTypeStr);

        //***** Modified Date *****/
        let modifiedDateR = ''
        if (this.state.modifiedDate === this.modifiedDate.customize) {
            let startDate = document.getElementById('start_date').value;
            let endDate = document.getElementById('end_date').value;
            modifiedDateR = 'modified:"' + startDate + '..' + endDate + '"';
        } else if (this.state.modifiedDate === this.modifiedDate.none) {

        } else {
            modifiedDateR = 'modified:"' + this.state.modifiedDate + '" ';
        }
        console.log('modifiedDateR',modifiedDateR);

        //***** Size *****/
        let sizeStr = ''
        if (this.state.fileSize !== '') {
            sizeStr = 'size:"' + this.state.sizeIcon + this.state.fileSize + this.state.sizeUnit + '" ';
        }

        console.log('sizeStr',sizeStr);

        //***** Path *****/
        let pathAry = this.state.qSirchRstPath;
        let pathStr = '';
        if (pathAry.length>0) {
            let tmpAry = [];
            pathAry.forEach(function(item,idx) {
                tmpAry.push('path:' + '"'+ item +'"');
            })
            pathStr = tmpAry.toString();
            pathStr = pathStr.replace(/,/g, ' OR ');
            pathStr = '(' + pathStr + ') ';
        }
        console.log('pathStr',pathStr);


        let curTimeStamp = + new Date();
        //let cnt = this.scrollBottonCount * 100;
        let str = 'q=' + 
            fileTypeStr + modifiedDateR + sizeStr + pathStr +
            this.state.patternStr +
            //'&offset=0&limit=' + totalCnt + 
            '&highlight=content&image=thumb&highlight_limit=100&ts=' + 
            curTimeStamp;

        console.log('rst Str',str);
        MainActions.qSirchSearchTotal(str, totalCnt);
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
    }

    handleInputElement(ele,idx) {
        if (ele !== null) {
            this.inputElement.push([idx,ele]);
        }
    }

    onClickAll(v) {
        /*if (this.state.qSirchSearchTotalData === null) {
            return false;
        }*/
        if (this.state.qSirchSearchData === null) {
            return false;
        }
        if (this.state.qSirchSearchData.total <= 0) {
            return false;
        }

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
            let totalItems = this.state.qSirchSearchTotalData.items;
            totalItems.forEach(function(item,i){
                curCheckArray.push(item);
            })
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
        
        let totalCount = this.state.qSirchSearchData.total;
        //var itemNum = this.state.selectAll ? totalCount : curCheckArray.length;
        let itemNum = curCheckArray.length;
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
                //this.setState({checkArray: tmpAry});
                this.checkArray = tmpAry;
            }
        } else{
            var index = tmpFilePathAry.indexOf(item.filePath);
            if (index > -1) {
                tmpAry.splice(index, 1);
            }
            //this.setState({checkArray: tmpAry});
            this.checkArray = tmpAry;
        }
        //console.log(this.state.checkArray);
    }

    clearResult() {
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.shiftIndex = 0;
        this.scrollBottonCount = 1;
        this.setState({
            selectAll: false,
            qSirchSearchTotalData: {},
            qSirchSearchData: null,
        });
    }

    closeResult() {
        this.setState({
            isShowResult: false,
            selectAll: false,
            qSirchSearchTotalData: null
        })
        this.checkArray = [];
        this.checkArrayMinus = [];
        this.shiftIndex = 0;
        this.scrollBottonCount = 1;
    }

    handleScroll(e) {
        if (this.state.qSirchSearchData === null)
            return false;

        if (e.target.scrollTop + e.target.clientHeight === e.target.scrollHeight) {
            if (this.state.qSirchSearchData.items.length < this.state.qSirchSearchData.total) {
                console.log('Qsirch Scroll to Bottom!!! - Get more data');
                this.scrollBottonCount++;
                this.doSearch();
                this.setState({
                    isScrollingLoading: true
                });
            }
        }
    }

    renderQsirchResult() {
        var tmpItemArray = this.state.qSirchSearchData.items;
        if (typeof tmpItemArray == 'undefined')
        {
            return null;
        } else if (tmpItemArray.length == 0)
        {
            let dStyle = {
                position:'absolute',
                width:'100%',
                height:'100%',
                zIndex:'2',
                backgroundColor:'#1F2635',
                textAlign: 'center',
                paddingTop: '100px'

            }
            var tmp = (
                <div style={dStyle}>
                    <img src='img/media_playlist/v3_icon/empty_pic.svg' />
                    <p style={{fontSize:'15px',color:'rgba(255,255,255,0.3)',padding:'15px'}}>
                        {lang.getLang('Msg37')}
                    </p>
                </div>
            );
            return tmp;
        }

        this.inputElement = [];
            
        var dirListArray = [];
        var that = this;
        tmpItemArray.forEach((item,i)=>{
            var tmp;
            var filePath = '/share/' + item.path + '/' + item.name + '.' + item.extension;
            var fileObj = item;
            fileObj.filePath = filePath;
            switch(item.category[0]) {
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
                    break;
                case "Music":
                    fileObj.type = 'audio';
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                        ref={(input) => this.handleInputElement(input,i)}
                                    />
                                    <img src={fileTypeIcon.audio} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;
                case "Images":
                    fileObj.type = 'photo';
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false} 
                                        checkAll={this.state.selectAll} 
                                        filePath={filePath} 
                                        fileObj={fileObj} 
                                        clickFunc={this.setCheckArray.bind(this)} 
                                        imgStyle={checkBoxImgStyle} 
                                        ref={(input) => this.handleInputElement(input,i)}
                                    />
                                    <img src={fileTypeIcon.image} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;
                case "Videos":
                    fileObj.type = 'video';
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                        ref={(input) => this.handleInputElement(input,i)}
                                    />
                                    <img src={fileTypeIcon.video} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;

            }
            dirListArray.push(tmp);
        })
        let totalCount = this.state.qSirchSearchData.total;
        let selectedCount = this.state.selectAll ? totalCount : this.checkArray.length;
        let selectAllBtnRender = this.state.selectAll
        ? <button style={unselectAllBtn} onClick={this.onClickAll.bind(this,false)}>取消全選</button>
        : <button style={selectAllBtn} onClick={this.onClickAll.bind(this,true)}>全選</button>;
        return (
            <div style={{position:'absolute',top:'0',left:'0',right:'0',bottom:'0',zIndex:'2'}}>
                <div style={filterResultHint}>

                    <span style={{color:'#FFFFFF',fontSize:'14px',marginLeft:'10px'}}>共{totalCount}項符合搜尋條件</span>
                    <button key="deleteItemBtn" className="deleteItemBtn" style={{margin:'0 10px 0 auto'}} onClick={this.closeResult.bind(this)} data-tip={lang.getLang('close')} />

                </div>
                <div style={{backgroundColor:'#ebebeb',height:'30px',width:'100%',lineHeight:'30px',borderBottom:'1px solid #aeaeae'}}>
                    {selectAllBtnRender}
                    <span style={{marginLeft:'10px',fontSize:'13px'}}>{lang.getLang('Name')}</span>
                </div>
                <CustomScrollBar style={{height:'calc( 100% - 55px)',backgroundColor:'#FFFFFF'}} onScroll={this.handleScroll.bind(this)}>
                    <div>
                        {dirListArray}
                    </div>
                </CustomScrollBar>
                <div 
                    style={{
                        height:'25px',
                        backgroundColor:'#F0B353',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'flex-end',
                        msFlexAlign: 'center',
                        msFlexPack: 'end',
                    }}
                >
                    <span style={{fontSize:'13px',color:'#000000',marginRight:'10px'}}>已選擇: {selectedCount} , 總共: {totalCount}</span>
                </div>
            </div>
        );
    }

    pClickSearch() {
        this.clearResult();
        this.doSearch();
        this.setState({
            isSearching: true
        });
    }

    calcRealFileNumber() {
        let tmpAry = this.state.qSirchSearchData.items;
        if (tmpAry === undefined || tmpAry === null) {
            return '';
        }
        let cnt = 0;
        let curFilterType = this.state.filterType;
        for(var key in filterTypeEnum) {
            if(filterTypeEnum[key] === curFilterType) {
                // do stuff with key
                curFilterType = qSirchFileTypeEnum[key];
            }
        }
        tmpAry.forEach(function(item,idx){
            //if (+item.dir === 0) {
            if (item.category[0]) {
                if (curFilterType === qSirchFileTypeEnum.ALL || item.category[0] === curFilterType)
                    cnt++;
            }
        })
        return cnt;
    }

    renderBottomCountPanel() {
        if (this.state.qSirchSearchData === null)
            return null;
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
        if (Object.getOwnPropertyNames(this.state.qSirchSearchData.items).length === 0) {
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
                    <span
                        style={{
                            fontSize:'13px',
                            color:'#FFF',
                            marginRight:'10px'
                        }}
                    >
                    {lang.getLang('Selected')}: {selectedCount} , {lang.getLang('Total')}: {totalCountReal}
                    </span>
                </div>
            );
        }
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
        );
    }

    renderQsirchResult01() {
        if (this.state.qSirchSearchData === null)
            return null;

        var tmpItemArray = this.state.qSirchSearchData.items;
        let dStyle = {
            position:'absolute',
            width:'100%',
            height:'100%',
            zIndex:'2',
            backgroundColor:'#1F2635',
            textAlign: 'center',
            paddingTop: '100px',
            animation: 'fadeIn 0.3s',
        };
        if (typeof tmpItemArray == 'undefined') {
            return null;
        } else if (tmpItemArray.length == 0) {
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
        tmpItemArray.forEach((item,i)=>{
            var tmp;
            var filePath = '/share/' + item.path + '/' + item.name + '.' + item.extension;
            var fileObj = item;
            fileObj.filePath = filePath;
            switch(item.category[0]) {
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
                    break;
                case qSirchFileTypeEnum.AUDIO:
                    fileObj.type = 'audio';
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                        ref={(input) => this.handleInputElement(input,i)}
                                    />
                                    <img src={fileTypeIcon.audio} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;
                case qSirchFileTypeEnum.PHOTO:
                    fileObj.type = 'photo';
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                        ref={(input) => this.handleInputElement(input,i)}
                                    />
                                    <img src={fileTypeIcon.image} style={fileIconStyle} />
                                </div>
                                <span className='mediaFileSpan' data-tip={item.name}>{item.name}</span>
                            </div> );
                    break;
                case qSirchFileTypeEnum.VIDEO:
                    fileObj.type = 'video';
                    tmp = ( <div draggable="true" onDragStart={this.drag.bind(this,fileObj)} onDragEnd={this.dragEnd.bind(this)} 
                                className='mediaFileDiv' key={i} onClick={this.itemOnClick.bind(this,i)}>
                                <div style={{position:'relative',float:'left'}}>
                                    <CheckBox
                                        checked={false}
                                        checkAll={this.state.selectAll}
                                        filePath={filePath}
                                        fileObj={fileObj}
                                        clickFunc={this.setCheckArray.bind(this)}
                                        imgStyle={checkBoxImgStyle}
                                        ref={(input) => this.handleInputElement(input,i)}
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
            alignItems: 'flex-start',
            justifyContent: 'center',
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

    renderResult02() {
        let resultList = this.renderQsirchResult01();
        let selectAllBtnRender = this.renderSelectAllButton();

        let filterPanelStyle = {
            height:'calc(100% - 231px)',
            width:'100%',
            backgroundColor:'#1F2635',
            display: this.state.isOpen ? 'block' : 'none',
            position:'absolute',
            zIndex:'2'
        };

        return (
            <div id='div_qSirchPanel' style={filterPanelStyle}>
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
        return this.renderResult02();
        //return this.renderResultOriginal();
    }

    /*renderResultOriginal() {
        let displayStyle = this.state.isOpen ? 'block' : 'none';

        let isShowResult = this.state.isShowResult
        ? this.renderQsirchResult()
        : null;
        
        let pathArrayList = this.state.qSirchRstPath 
            ? this.state.qSirchRstPath.map(function(i) {
                return <li key={i} style={{lineHeight:'11px'}}>
                            <span style={pathSpan} data-tip={i}>{i}</span>
                            <button key={i}
                                    //onClick={this.clickRepeat.bind(this)}
                                    data-tip={lang.getLang('Remove')} 
                                    onClick={this.removePath.bind(this,i)} 
                                    className='removePathBtn'
                            />
                        </li> 
            }.bind(this))
            : null;
        return(
            <div style={{...divFilterPanel,display: displayStyle}}>

                {isShowResult}

                <div style={{height:'100%',overflowX:'hidden'}}>

                    <span style={{fontSize:'14px',color:'#000000',display:'block',margin:'15px 0 0 10px'}}>
                        Qsirch 搜尋
                    </span>

                    <span style={{fontSize:'13px',color:'#000000',display:'block',margin:'20px 0 0 10px'}}>
                        關鍵字:
                    </span>
                    <div style={{width:'100%',padding:'8px 10px 0'}}>
                        <input 
                            id="input_patternStr" 
                            style={{width:'100%',height:'24px',fontSize:'13px',padding:'0 10px'}} 
                            onChange={this.patternStrChange.bind(this)} value={this.state.patternStr} 
                            type="text" 
                            autoComplete="off" 
                            placeholder="" 
                        />
                    </div>

                    <span style={{fontSize:'13px',color:'#000000',display:'block',margin:'15px 0 0 10px'}}>
                        資料夾位置:
                    </span>
                    <button className='stdButtonQ' style={{margin:'8px 0 0 10px'}} onClick={this.openBrowsePathPanel.bind(this)}>瀏覽</button>
                    <ul>
                        {pathArrayList}
                    </ul>

                    <span style={{fontSize:'13px',color:'#000000',display:'block',margin:'15px 0 0 10px'}}>
                        類型:
                    </span>

                    {this.renderFileTypePanel()}

                    <span style={{fontSize:'13px',color:'#000000',display:'block',margin:'15px 0 0 10px'}}>
                        修改日期:
                    </span>

                    {this.renderDatePanel()}
                    {this.renderDatePickerPanel()}
                    
                    <span style={{fontSize:'13px',color:'#000000',display:'block',margin:'15px 0 0 10px'}}>
                        檔案大小:
                    </span>

                    {this.renderSizeIconPanel()}

                </div>

                <div style={{position:'absolute',bottom:'10px',right:'10px'}}>
                    <button className='stdButtonQ' style={{margin:'8px 0 0 10px'}} onClick={this.doSearch.bind(this)} >搜尋</button>
                    <button className='stdButtonQ' style={{margin:'8px 0 0 10px'}} onClick={this.clearCondition.bind(this)}>清除</button>
                    <button className='stdButtonQ' style={{margin:'8px 0 0 10px'}} onClick={this.props.closeFunc.bind(this)}>關閉</button>
                </div>
            </div>
        )
    }*/
}

/*const now = moment();

const Picker = React.createClass({
  getDefaultProps() {
    return {
      showTime: false,
      disabled: false,
    };
  },
  render() {
    const props = this.props;
    const calendar = (<Calendar
      //locale={cn ? zhCN : enUS}
      defaultValue={now}
      timePicker={null}
      disabledDate={props.disabledDate}
    />);
    return (<DatePicker
      animation="slide-up"
      disabled={props.disabled}
      calendar={calendar}
      value={props.value}
      onChange={props.onChange}
    >
      {
        ({ value }) => {
          return (
            <span>
                <input
                  placeholder="请选择日期"
                  style={{ width: 250 }}
                  disabled={props.disabled}
                  readOnly
                  value={value && value.format('YYYY-MM-DD') || ''}
                />
                </span>
          );
        }
      }
    </DatePicker>);
  },
});*/

const filterTypeEnum = {
    ALL: 'all',
    AUDIO: 'audio',
    VIDEO: 'video',
    PHOTO: 'photo'
}

const qSirchFileTypeEnum = {
    ALL: 'all',
    AUDIO: 'Music',
    VIDEO: 'Videos',
    PHOTO: 'Images'
}

const divFilterPanel = {
    position:'absolute',
    width:'100%',
    height:'calc( 100% - 231px)',
    backgroundColor:'#ffffff',
    zIndex:'2',
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

const qsirchTypePanel = {
    border:'1px solid #000000',
    margin:'0 10px',
    paddingBottom:'15px',
    left:'0',
    right:'0',
    position:'absolute',
    backgroundColor:'#FFFFFF',
    zIndex:'2',
}

const ddLiA= {
    width: '100%',
    //lineHeight:'28px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    msFlexAlign: 'center',
    msFlexPack: 'center',
    marginTop: '5px',
}

const fileTypeIcon = {
    audio: 'img/media_playlist/v3_icon/file_type/device_music.svg',
    video: 'img/media_playlist/v3_icon/file_type/device_video.svg',
    image: 'img/media_playlist/v3_icon/file_type/device_photo.svg',
    folder: 'img/media_playlist/v3_icon/file_type/device_folder.svg',
};

const deviceTypeIcon = {
    folder: '',
    external: '',
    odd: '',
    iso: '',
    mtp: '',
}

const fileIconStyle = {
    width: '28px',
    height: '28px',
    marginLeft: '10px'
}

const checkBoxImgStyle = {
    marginLeft: '10px'
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

const pathSpan = {
    fontSize:'13px',
    display:'inline-block',
    whiteSpace:'nowrap',
    textOverflow:'ellipsis',
    overflow:'hidden',
    maxWidth:'220px'
}

const selectAllBtn = {
    fontSize:'13px',
    border:'rgba(0,0,0,0)',
    backgroundColor:'rgb(42, 139, 171)',
    color:'#FFFFFF',borderRadius:'15px',
    lineHeight:'22px',
    padding:'0 15px',
    float: 'right',
    margin: '3px 15px 0 0',
}

const unselectAllBtn = {
    fontSize:'13px',
    border:'rgba(0,0,0,0)',
    backgroundColor:'#FF0000',
    color:'#FFFFFF',borderRadius:'15px',
    lineHeight:'22px',
    padding:'0 15px',
    float: 'right',
    margin: '3px 15px 0 0',
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