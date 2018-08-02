import React from 'react';
import ReactDOM from 'react-dom';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import * as CommonActions from "js/actions/CommonActions";

import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import Bootstrap from "bootstrap";
import 'css/MediaPlaylist.css';

import CustomScrollBar from 'js/components/Common/CustomScrollBar';
import ScrollArea from 'react-scrollbar';

import CheckBox from './CheckBox';
import FontAwesome from 'react-fontawesome';
import _ from 'lodash';

export default class BrowsePathPanel extends React.Component {
    constructor(props) {
        super(props);

        this.getListDirs = this.getListDirs.bind(this);
        this.getQsirchPath = this.getQsirchPath.bind(this);

        this.state = {
            listDirs: {},
            qSirchPath: [],
            isOpen: this.props.isOpen,
        }
    }

    componentWillMount() {
        MainStore.on('getListDirsDone', this.getListDirs);
        MainStore.on('addQsirchPathDone', this.getQsirchPath);
        
    }

    componentDidMount() {
        //MainActions.getShareDirs();
        MainActions.getListDirs();
    }

    componentWillUnmount() {
        MainStore.removeListener('getListDirsDone', this.getListDirs);;
        MainStore.removeListener('addQsirchPathDone', this.getQsirchPath);;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isOpen: nextProps.isOpen
        })
    }

    handleListDirs(dirItems,path) {
        let pathArray = path.split('/');
        pathArray = pathArray.filter(Boolean);
        let pathArrayLength = pathArray.length;

        for (let i=0; i<pathArrayLength; i++) {
            dirItems.forEach(function(element,idx) {
                if (element.name === pathArray[i] && i !== pathArrayLength - 1) {
                    let pathArray2 = pathArray.slice(1);
                    pathArray2 = pathArray2.join('/');
                    element.items = this.handleListDirs(element.items,pathArray2);
                } else if (element.name === pathArray[i] && i === pathArrayLength - 1) {
                    let responseData = MainStore.getListDirs();
                    element.items = responseData.items;
                }
            }, this);
        }

        return dirItems;
    }

    getQsirchPath() {
        this.setState({
            qSirchPath: MainStore.getQsirchPath()
        },()=>{
            console.log('this.state.qSirchPath',this.state.qSirchPath);
        });




        let qSirchPathArray = MainStore.getQsirchPath();
        let pathAry = qSirchPathArray.slice();
        let removePath = [];
        pathAry.forEach(function(path,idx) {
            pathAry.forEach(function(path1,idx1) {
                if (path !== path1 && path1.indexOf(path)>=0) {
                    
                    let pathSp = path.split('/');
                    pathSp = pathSp.filter(Boolean);

                    let pathSp1 = path1.split('/');
                    pathSp1 = pathSp1.filter(Boolean);

                    if (pathSp.length !== pathSp1.length) {
                        let idx2 = removePath.indexOf(path1);
                        if (idx2 == -1) {
                            removePath.push(path1);
                        }
                    }
                    //console.log('Slice',path1);
                    
                }
            })
        })
        console.log('removePath',removePath);

        removePath.forEach(function(path,idx) {
            _.remove(pathAry, function(n) {
                return n === path;
            })
        })
        console.log('qSirchPathArray',qSirchPathArray);
        console.log('pathAry',pathAry);
        this.rstPathArray = pathAry;
    }

    getListDirs() {
        let dirItems = this.state.listDirs.items;
        let returnPath = MainStore.getListDirsPath();
        if (dirItems === undefined) {
            this.setState({
                listDirs: MainStore.getListDirs(),
            });
        } else {
            let rstDirItems = this.handleListDirs(dirItems,returnPath);
            console.log(rstDirItems);

            let listDirs = this.state.listDirs;
            listDirs.items = dirItems;
            this.setState({
                listDirs: listDirs,
            });
        }
        
    }

    renderRootDirs() {
        let dirItems = this.state.listDirs.items;
        if (dirItems === undefined) {
            return null;
        }
        let rstArray = [];

        dirItems.forEach(function(element,idx) {
            rstArray.push(
                <DirItem element={element} rootPath='' checked={0} display='block' key={idx} />
            )
        }, this);

        return rstArray;
    }

    closeClick() {
        MainActions.showBrowsePathPanel();
    }

    finishClick() {
        MainActions.selectQSirchPathDone();
        this.closeClick();
    }

    render() {

        let pathArrayList = this.rstPathArray ? this.rstPathArray.map(function(i) { return <li key={i}>{i}</li> }) : null;
        let displayStyle = this.state.isOpen ? 'flex' : 'none';
        return (
            <div id='QsirchRootDiv' style={{...style.divMask,display:displayStyle}}>
                


                <div style={style.divStyle2}>
                    <div style={style.divStyle5}>
                        <p style={{fontSize:'16px',fontWeight:'bold'}}>選擇資料夾</p>
                        <p style={{fontSize:'13px'}}>若系統管理員將某資料夾從搜尋範圍排除，您將無法選取該資料夾。</p>
                        <div id="divClose" class="btnClose" onClick={this.closeClick.bind(this)} />
                    </div>
                    <div style={style.divStyle3}>
                        {this.renderRootDirs()}
                    </div>

                    <div style={style.divStyle4}>
                        <div style={{float:'right',paddingTop:'20px'}}>
                            <button className='stdButton' style={{marginRight:'20px'}} onClick={this.finishClick.bind(this)}>新增</button>
                            <button className='stdButton' style={{marginRight:'20px'}} onClick={this.closeClick.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                
                {/*<div style={{position:'absolute'}}>
                    <ul>{pathArrayList}</ul>
                </div>*/}

            </div>
        )
    }
}


class DirItem extends React.Component {

    constructor(props) {
        super(props);
        //console.log('this.props.rootPath',this.props.rootPath);
        this.state = {
            display: this.props.display,
            childDisplay: 'block',
            ifChildQuery: false,
            iconName: 'caret-right',
            //checked: this.props.element.checked !== undefined ? this.props.element.checked : false,
            checked: this.props.checked,
            checkedChildFlag: this.props.checked,
            fullPath: this.props.rootPath + '/' + this.props.element.name,
            element: this.props.element
        }
    }

    componentDidMount() {
        if (this.state.checked === 1) {
            setTimeout(()=>{
                MainActions.addQSirchPath(this.state.fullPath);
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            display: nextProps.display,
            element: nextProps.element,
        });
        if (nextProps.checked !== this.props.checked) {
            if (nextProps.checked === 2) {
                /*this.setState({
                    //checked: nextProps.checked===1 ? true : false,
                    //checkedChildFlag: nextProps.checked,
                });*/
            } else {
                
                this.setState({
                    checked: nextProps.checked,
                    checkedChildFlag: nextProps.checked,
                });
                this.handleQsirchPath(nextProps.checked);
            }
            
        }
    }

    handleClickCaretRight(path,e) {
        if (!this.state.ifChildQuery) {
            console.log(e,path,'handleClickCaretRight -- MainActions.getListDirs');
            MainActions.getListDirs(path);
            this.setState({
                ifChildQuery:true,
                iconName: 'caret-down',
            });
        } else {
            if (this.state.childDisplay === 'block') {
                this.setState({
                    childDisplay: 'none',
                    iconName: 'caret-right',
                });
            } else {
                this.setState({
                    childDisplay: 'block',
                    iconName: 'caret-down',
                });
            }
        }
    }

    checkSideNode(targetDom,changeState) {
        let sideCount = targetDom.parentElement.parentElement.childElementCount;
        let checkAry = [];
        for (let i = 4; i < sideCount; i++) {
            if (targetDom.parentElement.parentElement.children[i].children[2] === targetDom) {
                if (changeState === 0 || changeState === 2) {
                    checkAry.push(false);
                } else if (changeState === 1) {
                    checkAry.push(true);
                }
            } else if (targetDom.parentElement.parentElement.children[i].children[2].className !== 'fa fa-check-square-o') {
                checkAry.push(false);
            } else {
                checkAry.push(true);
            }
        }

        let firstFlag = checkAry[0];
        let rst = null;
        checkAry.forEach(function(value,idx) {
            if (value!==firstFlag) {
                rst = 2;
            }
        })

        if (rst === null) {
            rst = firstFlag ? 1 : 0;
        }
        console.log('rst',rst);
        return rst;
        /*if (this.props.callbackFunc) {
            this.props.callbackFunc(rst);
        }*/
    }

    callbackParent(allCheckFlag) {
        let checkTarget = ReactDOM.findDOMNode(this.refs.checkTarget);
        console.log(checkTarget);
        let rst = this.checkSideNode(checkTarget,allCheckFlag);
        this.setState({checked:allCheckFlag, checkedChildFlag:allCheckFlag});

        this.handleQsirchPath(allCheckFlag);
        if (allCheckFlag === 2) {
            rst = 2;
        }
        if (this.props.callbackFunc) {
            this.props.callbackFunc(rst);
        }
    }

    handleQsirchPath(checkFlag) {
        if (checkFlag===1) {
            console.log("addQSirchPath",this.state.fullPath);
            MainActions.addQSirchPath(this.state.fullPath);
        } else {
            console.log("removeQSirchPath",this.state.fullPath);
            MainActions.removeQSirchPath(this.state.fullPath);
        }
    }

    handleCheckClick(e,type,arg,arg1) {
        
        /*e.target.parentElement.parentElement.childNodes[2].click();
        let curClassName = e.target.className;
        switch (curClassName) {
            case 'fa fa-square-o': {
                e.target.className = 'fa fa-check-square-o';
                break;
            }
            case 'fa fa-check-square-o': {
                e.target.className = 'fa fa-square-o';
                break;
            }
            case 'fa fa-square-o': {
                e.target.className = 'fa fa-check-square-o';
                break;
            }

        }*/

        let changeState;
        switch(this.state.checked) {
            case 0: {
                changeState = 1;
                break;
            }
            case 1: {
                changeState = 0;
                break;
            }
            case 2: {
                changeState = 1;
                break;
            }
        }
        this.handleQsirchPath(changeState);
        
        this.setState({
            checked: changeState,
            checkedChildFlag: changeState,
        })

        let sideCount = e.target.parentElement.parentElement.childElementCount;
        let allCheckFlag = true;
        let checkAry = [];
        for (let i = 4; i < sideCount; i++) {
            if (e.target.parentElement.parentElement.children[i].children[2] === e.target) {
                if (changeState === 0 || changeState === 2) {
                    allCheckFlag = false;
                    checkAry.push(false);
                } else if (changeState === 1) {
                    checkAry.push(true);
                }
            } else if (e.target.parentElement.parentElement.children[i].children[2].className !== 'fa fa-check-square-o') {
                allCheckFlag = false;
                checkAry.push(false);
            } else {
                checkAry.push(true);
            }
        }

        let firstFlag = checkAry[0];
        let rst = null;
        checkAry.forEach(function(value,idx) {
            if (value!==firstFlag) {
                rst = 2;
            }
        })

        if (rst === null) {
            rst = firstFlag ? 1 : 0;
        }
        console.log('rst',rst);
        if (this.props.callbackFunc) {
            this.props.callbackFunc(rst);
        }
    }

    renderSubDirs(items,rootPath) {
        let rstArray = [];
        items.forEach(function(element,idx) {
            rstArray.push(
                <DirItem 
                    element={element} 
                    rootPath={rootPath} 
                    checked={this.state.checkedChildFlag} 
                    display={this.state.childDisplay} 
                    callbackFunc={this.callbackParent.bind(this)}
                    key={idx} 
                />
            )
        },this);
        return rstArray;
    }

    render() {
        let subDirs = null;
        if (this.props.element.items !== undefined) {
            if (this.props.element.items.length>0) {
                subDirs = this.renderSubDirs(this.props.element.items, this.state.fullPath);
            }
        }
        let checkName;
        if (this.state.checked === 0) {
            checkName = 'square-o';
        } else if (this.state.checked === 1) {
            checkName = 'check-square-o';
        } else if (this.state.checked === 2) {
            checkName = 'square';
        }
        return (
            <div style={{marginLeft:'15px',display: this.state.display}}>
                <FontAwesome 
                    name={this.state.iconName} 
                    style={style.iconCaretRight} 
                    onClick={this.handleClickCaretRight.bind(this, this.state.fullPath + '/')} 
                />
                <FontAwesome name='folder' style={style.iconFolder} />
                <FontAwesome 
                    name={checkName} 
                    style={style.iconSquare} 
                    onClick={this.handleCheckClick.bind(this)} 
                    ref='checkTarget'
                />
                <span>{this.props.element.name}</span>
                {subDirs}
            </div>
        )
    }
}

const style = {
    iconFolder: {
        fontSize:'16px',
        color:'#6d6d6d',
        marginRight:'3px',
    },
    iconCaretRight: {
        fontSize:'16px',
        color:'#6d6d6d',
        marginRight:'3px',
        cursor:'pointer',
        width:'10px'
    },
    iconSquare: {
        fontSize:'16px',
        color:'#6d6d6d',
        marginRight:'5px',
        width:'16px'
    },
    divMask: {
        width:'100%',
        height:'100%',
        position:'absolute',
        top:'0',
        backgroundColor:'rgba(0,0,0,0.1)',
        //padding:'20px',
        overflowX: 'hidden',
        zIndex: '2',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        msFlexAlign: 'center',
        msFlexPack: 'center',
    },
    divStyle2: {
        width:'500px',
        height:'500px',
        position:'absolute',
        //top:'0',
        backgroundColor:'#FFFFFF',
        //padding:'20px',
        overflowX: 'hidden',
    },
    divStyle3: {
        borderTop: '1px solid rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(0,0,0,0.2)',
        height:'350px',
        width:'100%',
        padding: '10px 0 0 20px',
        overflow:'auto',
    },
    divStyle4: {
        height:'72px',
        width:'100%',
        //padding: '10px 0'
    },
    divStyle5: {
        //height:'72px',
        width:'100%',
        padding: '10px 0 0 20px'
    },
}