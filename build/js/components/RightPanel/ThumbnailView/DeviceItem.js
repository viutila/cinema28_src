import $ from 'jquery';
import RcSlider from 'rc-slider';
import React from 'react';
import Bootstrap from "bootstrap";
import Sortable from 'react-sortablejs';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';

import MainStore from 'js/stores/MainStore';
import * as api from 'js/actions/api';
import * as MainActions from 'js/actions/MainActions';
import * as CommonActions from "js/actions/CommonActions";
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import LoginStore from "js/stores/LoginStore";
import CustomScrollBar01 from 'js/components/Common/CustomScrollBar01';
import MoreMenuDevice from '../MoreMenuDevice';
import ListItem from './ListItem';
//import uniqueId from 'lodash/uniqueId';
//import 'css/rc-slider.css';
import 'css/DeviceItem.css';


export default class DeviceItem extends React.Component {

  /**
   * Constructor
   */

  constructor(props) {
    super(props);

    this.addPlayDone = this.addPlayDone.bind(this);
    this.getPlaylistDone = this.getPlaylistDone.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.checkIfChangeCurrTrack = this.checkIfChangeCurrTrack.bind(this);
    this.updateIconIndex = this.updateIconIndex.bind(this);
    this.onSwitchPlaySend = this.onSwitchPlaySend.bind(this);

    this.state = {
      deviceInfo: this.props.deviceInfo,
      volume: this.props.deviceInfo.volume,
      lastVolume: this.props.deviceInfo.volume,
      playlist: null,
      getPlaylistFlag: false,  //if getting playlist Now
      hoverItemTrack: 0,
      listItemsAry: null,
      progressTime: 0,
      isOpenedFlag: true,
      isVolBarOpen: false,
      playMode: this.props.deviceInfo.play_mode,
      iconIndex: null,
      isDragEnter: false,
      isMouseOver: false,
      flipState: false,
      btProcessStatus: '',
    };

    this.stationUrl = {
      fileStation: MainActions.getCgiOrigin() + '/filestation/',
      musicStation: MainActions.getCgiOrigin() + '/musicstation/',
      videoStation: MainActions.getCgiOrigin() + '/video/',
      OceanKTV: MainActions.getCgiOrigin() + '/apps/OceanKTVConsole/',
    }

    this.dragTarget = null;

    this.thumbWidth = null;
    this.curr_time = 0;
    this.curr_track = null;
    this.scrollBottomCount = 2;
    this.uuid = this.generateUUID();
    
    this.tempPlaylist = null;
    
    this.reorderItem = {};
    
    this.delTrackVerifyCnt = 0;
    this.afterDelTrackNum = 0;

    this.delPlFlag = false;
    this.delTrackFlag = false;
    this.delCurTrackFlag = false;
    this.isDropflag = false;
    this.isReorder = false;
    this.stopFlag = false;
    this.playFlag = false;
    this.pauseFlag = false;
    this.isVolChange = false;
    this.ifClickNext = false;
    this.isDbClick = false;
    this.isSwitchPlaySending = false;

    this.recPropsCnt = 0;
    this.getPlCnt = 0;
    

    this.isAppendToEnd = {flag: false,expTrackCnt: 0};
    this.btConnRecCnt = 0;

    
    this.hoverTimer = null;
    this.updateFlag = true;
    this.changePgTimeFlag = true;

    this.isClickRepeat = false;
    this.isClickShuffle = false;
    this.isRepeatShuffleBusy = false;

    this.isVolBarEnter = false;
  }

  /**
   * Lifecycle Methods
   */

  componentWillReceiveProps(nextProps) {
    let tmpNextDevInfo = _.cloneDeep(nextProps.deviceInfo);

    /*if (nextProps.deviceInfo.id === 'PCH_HDMI-0_3') {
      console.log(nextProps.deviceInfo.play_state);
    }*/

    /*if (nextProps.deviceInfo.id === 'PCH_HDMI-1_7') {
      console.log('%c nextProps: ' + 
        nextProps.deviceInfo.play_state +
        ' this.stopFlag: ' +
        this.stopFlag,
        'color: green; font-weight: bold;');
    }*/

    if (nextProps.deviceInfo.working_state !== undefined) {
      console.log('working_state !== undefined',nextProps.deviceInfo);
      return false;
    }

    /*if (this.state.deviceInfo.type === 'Bluetooth') {
      if (this.state.btProcessStatus === 'CONNECTING') {
        if (nextProps.deviceInfo.connected === 'Yes') {
          this.setState({
            btProcessStatus: ''
          })
          this.btConnRecCnt = 0;

          let notyMsg = lang.getLang('btPanelMsg12');
          notyMsg = notyMsg.replace('$name',this.state.deviceInfo.name);
          setTimeout(()=>{
              MainActions.pushNotification(notyMsg); 
          });
        } else {
          this.btConnRecCnt++;
        } 

        if (this.btConnRecCnt>2) {
          this.setState({
            btProcessStatus: ''
          })
          this.btConnRecCnt = 0;

          let notyMsg = lang.getLang('btPanelMsg13');
          notyMsg = notyMsg.replace('$name',this.state.deviceInfo.name);
          setTimeout(()=>{
              MainActions.pushNotification(notyMsg); 
          });
        }
      }
    }*/

    if (this.isDropflag) {
      this.recPropsCnt++;
      let devType = this.state.deviceInfo.type;
      let tolerantCnt = (devType === 'HDPLAYER' || devType === 'HDMI')
        ? 25
        : 10;

      //console.log('tolerantCnt:',tolerantCnt,'; Device Type:',devType);

      if (this.recPropsCnt < tolerantCnt) {
        if (nextProps.deviceInfo.list_title !== this.state.deviceInfo.list_title) {
          this.isDropflag = 1;
        } else if (this.isDropflag === 1 && nextProps.deviceInfo.play_state === 'PLAY') {
          this.isDropflag = false;
          this.updateFlag = true;
          this.recPropsCnt = 0;

          let notyMsg = lang.getLang('NotificationMsg03');
          notyMsg = notyMsg.replace('%device',this.getName() + ' ');
          setTimeout(()=>{
            MainActions.pushNotification(notyMsg);
          });
        }
      } else {
        this.recPropsCnt = 0;
        this.isDropflag = false;
        this.updateFlag = true;

        setTimeout(()=>{
          MainActions.pushNotification(lang.getLang('Msg10'));
        });
        console.log(
          '%c this.isDropflag recPropsCnt >= ' + tolerantCnt + ' timeout! ',
          'color: green; font-weight: bold;'
        );
      }
    }

    if (this.isAppendToEnd.flag) {
      this.recPropsCnt++;
      if (this.recPropsCnt < 10) {
        if (+nextProps.deviceInfo.total_track === this.isAppendToEnd.expTrackCnt) {
          this.isAppendToEnd.flag = false;
          this.isAppendToEnd.expTrackCnt = 0;
          this.renderListItemAry();
          this.recPropsCnt = 0;
        }
      } else {
        this.isAppendToEnd.flag = false;
        this.isAppendToEnd.expTrackCnt = 0;
        this.renderListItemAry();
        this.recPropsCnt = 0;

        setTimeout(()=>{
          MainActions.pushNotification(lang.getLang('Msg10'));
        });
        console.log(
          '%c this.isAppendToEnd.flag recPropsCnt >= 10 timeout! ',
          'color: green; font-weight: bold;'
        );
      }
            
    }

    if (this.isSwitchPlaySending) {
      switch (this.isSwitchPlaySending.procState) {
        case 0: {
          if (nextProps.deviceInfo.list_title != this.state.deviceInfo.list_title) {
            //this.isSwitchPlaySending = false;
            this.isSwitchPlaySending.procState = 1;
            this.setState({
              getPlaylistFlag: true,
            },()=>{
              setTimeout(()=>{
                this.getPlaylist()
              }, 10);
            });
          }
          break;
        }
        case 1: {
          if (nextProps.deviceInfo.play_state === 'PLAY') {
            this.isSwitchPlaySending = false;
          }
          break;
        }
      }
        
      /*} else {
        if (nextProps.deviceInfo.list_title === this.isSwitchPlaySending.fromListTitle) {
          this.isSwitchPlaySending = false;
          this.setState({
            getPlaylistFlag: true,
          },()=>{
            setTimeout(()=>{
              this.getPlaylist()
            }, 10);
          });
        }
      }*/
    }

    if (this.stopFlag) {
      this.recPropsCnt++;
      if (this.recPropsCnt < 10) {
        if (nextProps.deviceInfo.play_state !== 'STOP') {
          tmpNextDevInfo.play_state = 'STOP';
        } else {
          this.resetBtnStatus();
          this.renderListItemAry();
          console.log('this.stopFlag = false;',this.state.deviceInfo.id);
        }
      } else {
        this.resetBtnStatus();
        this.renderListItemAry();
        setTimeout(()=>{
          MainActions.pushNotification(lang.getLang('Msg10'));
        });
        console.log(
          '%c this.stopFlag recPropsCnt >= 10 timeout! ',
          'color: green; font-weight: bold;'
        );
      }
    }

    if (this.playFlag) {
      this.recPropsCnt++;
      if (this.recPropsCnt < 10) {
        if (nextProps.deviceInfo.play_state !== 'PLAY') {
          tmpNextDevInfo.play_state = 'PLAY';
        } else {
          this.resetBtnStatus();
          this.renderListItemAry();
        }
      } else {
        this.resetBtnStatus();
        this.renderListItemAry();
        setTimeout(()=>{
          MainActions.pushNotification(lang.getLang('Msg10'));
        });
        console.log(
          '%c this.playFlag recPropsCnt >= 10 timeout! ',
          'color: green; font-weight: bold;'
        );
      }
    }

    if (this.pauseFlag) {
      this.recPropsCnt++;
      if (this.recPropsCnt < 10) {
        if (nextProps.deviceInfo.play_state !== 'PAUSE') {
          tmpNextDevInfo.play_state = 'PAUSE';
        } else {
          this.resetBtnStatus();
          this.renderListItemAry();
        }
      } else {
        this.resetBtnStatus();
        this.renderListItemAry();
        setTimeout(()=>{
          MainActions.pushNotification(lang.getLang('Msg10'));
        });
        console.log(
          '%c this.pauseFlag recPropsCnt >= 10 timeout! ',
          'color: green; font-weight: bold;'
        );
      }
    }

    if (this.ifClickNext) {
      this.recPropsCnt++;
      if (this.recPropsCnt < 10) {
        if (+nextProps.deviceInfo.curr_track !== +this.state.deviceInfo.curr_track) {
          this.ifClickNext = false;
          this.recPropsCnt = 0;

          let notyMsg = lang.getLang('NotificationMsg06');
          notyMsg = notyMsg.replace('%device',this.getName() + ' ');
          notyMsg = notyMsg.replace('%content',' ' + nextProps.deviceInfo.title);
          setTimeout(() => {
            MainActions.pushNotification(notyMsg);
          });
        }
      } else {
        this.ifClickNext = false;
        this.recPropsCnt = 0;
        setTimeout(()=>{
          MainActions.pushNotification(lang.getLang('Msg10'));
        });
        console.log(
          '%c this.ifClickNext recPropsCnt >= 10 timeout! ',
          'color: green; font-weight: bold;'
        );
      }
      
    }

    if (this.isClickRepeat || this.isClickShuffle) {
      if (nextProps.deviceInfo.play_mode === this.state.playMode) {
        this.isClickRepeat = false;
        this.isClickShuffle = false;
        console.log('Play Mode Change',nextProps.deviceInfo.play_mode);
      }
    } else {
      this.setState({
        playMode: nextProps.deviceInfo.play_mode
      })
    }

    if (this.isVolChange) {
      if (+nextProps.deviceInfo.volume === this.state.volume) {
        this.isVolChange = false;
      }
    } else {
      this.setState({
        volume: nextProps.deviceInfo.volume
      });
    }

    let ifChangePlayState = this.state.deviceInfo.play_state === nextProps.deviceInfo.play_state ? false : true;

    /*if (this.state.deviceInfo.id === "PCH_HDMI-0_3") {
      console.log('this.state222',this.state.deviceInfo.play_state);
      console.log('nextProps222',nextProps.deviceInfo.play_state);
      console.log(ifChangePlayState);
    }*/
    

    this.setState({
      deviceInfo: tmpNextDevInfo,
    },()=>{
      if (ifChangePlayState) {
        this.renderListItemAry();
      }
      if (!this.delPlFlag) {
        this.checkIfChangeCurrTrack();
      }
    });


    if (
      nextProps.deviceInfo.list_title === ''
      || (nextProps.deviceInfo.file === '' && nextProps.deviceInfo.file_name === '')
      || nextProps.deviceInfo.list_title === '(unknown)'
    ) {
      if (this.state.getPlaylistFlag) {
        this.setState({
          getPlaylistFlag: false,
        });
      }
      this.delPlFlag = false;
      let dev_id = this.state.deviceInfo.id;
      MainStore.delPlaylistByDevId(dev_id);
    } else {
      if (!this.state.getPlaylistFlag) {
        let dev_id = this.state.deviceInfo.id;
        let tmpPl = MainStore.getPlaylistByDevId(dev_id);
        if (tmpPl === undefined || tmpPl === null) {
          this.setState({
            getPlaylistFlag: true,
            //playlist: MainStore.getPlaylistByDevId(dev_id)
          },()=>{
            setTimeout(()=>{
              this.getPlaylist()
            }, 10);
          })
        } else {
          this.isDropflag = false;
          this.setState({
            getPlaylistFlag: true,
            playlist: tmpPl
          })
        }
      } else if (+this.state.deviceInfo.total_track <= 20) {
        if (this.state.playlist !== null) {
          if (this.state.playlist.items.length < +this.state.deviceInfo.total_track) {
            this.getPlaylist();
          }
        } 
      }
    }

  }

  componentWillMount() {
    MainActions.getDeviceIcon(this.state.deviceInfo.id);
    MainStore.on('addPlayDone', this.addPlayDone);
    MainStore.on('getPlaylistDone', this.getPlaylistDone);
    MainStore.on('iconUpdated', this.updateIconIndex);
    MainStore.on('switchPlaySend', this.onSwitchPlaySend);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick, false);
    this.intervalTimer = setInterval(this.playerTimer.bind(this), 1000);

    let dev_id = this.state.deviceInfo.id;
    let tmpPl = MainStore.getPlaylistByDevId(dev_id);
    if (tmpPl === undefined || tmpPl === null) {

    } else {
      let itemsLength = tmpPl.items.length;
      this.scrollBottomCount = Math.ceil(itemsLength/10);
      this.setState({
        //getPlaylistFlag: true,
        playlist: tmpPl
      })
    }
  }

  componentWillUnmount() {
    MainStore.removeListener('addPlayDone', this.addPlayDone);
    MainStore.removeListener('getPlaylistDone', this.getPlaylistDone);
    MainStore.removeListener('iconUpdated', this.updateIconIndex);
    MainStore.removeListener('switchPlaySend', this.onSwitchPlaySend);

    document.removeEventListener('click', this.handleClick, false);
    clearInterval(this.intervalTimer);

    if (this.hoverTimer !== null) {
      clearTimeout(this.hoverTimer);
    }
  }

  componentDidUpdate(prevProps, prevState) {
  }

  resetBtnStatus() {
    this.stopFlag = false;
    this.playFlag = false;
    this.pauseFlag = false;
    this.recPropsCnt = 0;
  }

  checkPlaylistDone() {
    let tmpPl = this.state.playlist;
    if (this.delTrackFlag) {
      if (
        +tmpPl.total_track === this.afterDelTrackNum
        && +this.state.deviceInfo.total_track === this.afterDelTrackNum
      ) {
        if (this.delCurTrackFlag) {
          this.delCurTrackFlag = false;
          this.updateFlag = true;
        }
        this.delTrackFlag = false;
        this.delTrackVerifyCnt = 0;
        this.renderListItemAry();
      } else {
        setTimeout(()=>{
          this.getPlaylist();
        },1000);
        this.delTrackVerifyCnt++;
        if (this.delTrackVerifyCnt > 10) {
          if (this.delCurTrackFlag) {
            this.delCurTrackFlag = false;
            this.updateFlag = true;
          }
          this.delTrackFlag = false;
          this.delTrackVerifyCnt = 0;
          this.renderListItemAry();
          console.log('this.delTrackVerifyCnt>10 break!');
        }
        return false;
      }
    }

    if (this.isReorder) {
      console.log('isReorder===',this.isReorder);
      console.log(this.reorderItem);
      if (this.reorderItem.id === null) { //***** cross playlist */
        if (tmpPl.items[this.reorderItem.newIndex].file === this.reorderItem.path) {
          this.isReorder = false;
          this.renderListItemAry();
        } else {
          setTimeout(()=>{
            this.getPlaylist();
          },1500);
        }
      } else {  //***** the same playlist  */
        try {
          if (this.getPlCnt < 10) {
            if (tmpPl.items[this.reorderItem.newIndex].id === this.reorderItem.id 
              && this.reorderItem.expCurrTrack === this.getCurrentTrack()) {
              this.isReorder = false;
              this.renderListItemAry();
            } else {
              this.getPlCnt++;
              setTimeout(()=>{
                this.getPlaylist();
              },1500);
            }
          } else {
            this.isReorder = false;
            this.renderListItemAry();
            this.getPlCnt = 0;
            console.log(
              '%c getPlCnt >= 10 timeout! ',
              'color: green; font-weight: bold;'
            );
          }
          
        } catch(e) {
          console.log('%c get Playlist catch error \n' + e, 'color: #DD4132; font-weight: bold;');
          setTimeout(()=>{
            this.getPlaylist();
          },1500);
        }
        
      }
      
    } else {
      this.renderListItemAry();
    }
  
    this.checkIfChangeCurrTrack();
  }

  getPlaylistDone(res_DevId, uuid) {
    let dev_id = this.state.deviceInfo.id;
    if (res_DevId === dev_id && uuid === this.uuid) {
      if (!this.delPlFlag) {
        let tmpPl = MainStore.getPlaylistByDevId(dev_id);
        if (tmpPl === undefined || tmpPl === null) {
          setTimeout(()=>{
            this.getPlaylist();
          },3000);
        } else if (
          tmpPl.items.length===0 
          && tmpPl.msg!=="no permission to get other user's playlist"
        ) {
          setTimeout(()=>{
            this.getPlaylist();
          },3000);
        } else {
          this.setState({
            playlist: MainStore.getPlaylistByDevId(dev_id)
          },()=>{this.checkPlaylistDone()});
          
        }
      }
    }
  }

  dbClickFunc(flag) {
    this.isDbClick = flag;
  }

  generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  };

  /**
   * Click Handlers and Event Handlers
   */

  getPlayState() {
    let rst;
    if (this.isDropflag) {
      rst = 'PLAY';
    } else {
      rst = this.state.deviceInfo.play_state;
    }
    return rst;
  }

  intToTime(timeInt) {
    let ms = timeInt * 1000;
    let rst = moment.utc(ms).format("HH:mm:ss");
    return rst;
  }

  onSwitchPlaySend(toDevId, fromListTitle) {
    if (toDevId === this.state.deviceInfo.id) {
      this.isSwitchPlaySending = {
        flag: true,
        procState: 0,
        fromListTitle: fromListTitle
      }
      this.handleFlipClick(false);
      this.forceUpdate();
    }
  }

  updateIconIndex(dev_id){
    if (dev_id === this.state.deviceInfo.id) {
      let rst = MainStore.getDeviceIcon(this.state.deviceInfo.id);
      //console.log('updateIconIndex',rst);
      if (rst.trim() === '') {
        let type = this.state.deviceInfo.type;
        let iconObj = {
          HDMI: '7',
          HDPLAYER: '0',
          ANALOG: '7',
          USB: '7',
          Bluetooth: '7',
          network: '0',
        };
        let iconNetwork = {
          DLNA: '8',
          Chromecast: '4',
          AirPlay: '6'
        };
        let rstIdx = '0';
        if (type == 'network'){
            rstIdx = this.state.deviceInfo.subtype in iconNetwork
              ? iconNetwork[this.state.deviceInfo.subtype]
              : '0';
        } else {
            rstIdx = this.state.deviceInfo.type in iconObj ? iconObj[this.state.deviceInfo.type] : '0';
        }
        MainActions.setDeviceIcon(this.state.deviceInfo.id, rstIdx);
        this.setState({
          iconIndex: rstIdx
        });
      } else {
        this.setState({
          iconIndex: MainStore.getDeviceIcon(this.state.deviceInfo.id)
        });
      }
    }
  }

  handleClick(e) {
    if (e.target.id !== "volBtnProgress") {
      if (!this.isVolBarEnter && this.state.isVolBarOpen) {
        this.setState({
          isVolBarOpen: false
        });
      }
    }
  }

  getPlaylist() {
    //if (this.state.deviceInfo.list_title !== '')
    if (this.state.getPlaylistFlag) {
      let currTrack = this.getCurrentTrack();
      //let trackCnt = Math.round(currTrack/10+1);
      while (this.scrollBottomCount*10 < currTrack + 10) {
        this.scrollBottomCount++;
      }
      this.scrollBottomCount = this.scrollBottomCount<2 ? 2 : this.scrollBottomCount;
      let cnt = this.scrollBottomCount * 10;
      MainActions.getPlaylist(this.state.deviceInfo.id, this.uuid, cnt);
    }
  }

  getCurtTimeInt() {
    let sCurrTime = this.timeToInt(this.getDeviceInfoCurrTime());
    if ( sCurrTime < this.curr_time ) {
      console.log("sCurrTime < this.curr_time!!!!!!!!!!!!getCurtTimeInt()");
      return this.curr_time;
    }
    return this.timeToInt(this.getDeviceInfoCurrTime());
  }

  getDeviceInfoCurrTime() {
    return this.state.deviceInfo.curr_time === ''
      ? '00:00:00'
      : this.state.deviceInfo.curr_time;
  }

  getCurtTime() {
    return this.intToTime(this.state.progressTime);
  }

  getCurrentTrack() {
    let rst = this.state.deviceInfo.curr_track;
    return rst !== '' && +rst !== 0
      ? +rst
      : 1;
  }

  playerTimer() {
    /*if (!this.delPlFlag) {
      this.checkIfChangeCurrTrack();
    }*/
    try {
      if (this.state.playlist == null || this.getPlayState() !== 'PLAY') {
        if (this.getPlayState() === 'STOP') {
          this.clearProgressTime();
        }
        return;
      }

      if (this.state.deviceInfo.file_type === 'photo') {
        this.clearProgressTime();
        return;
      }

      //console.log('deviceInfo.curr_time: ',this.state.deviceInfo.curr_time);

      let pgsTime = this.state.progressTime;
      if (!this.changePgTimeFlag) {
        if (Math.abs(this.timeToInt(this.getDeviceInfoCurrTime()) - pgsTime) <= 10) {
          this.changePgTimeFlag = true;
        }
      }

      if (this.updateFlag && this.changePgTimeFlag) {
        
        if (pgsTime === 0) {
          let nowTime = 0;//this.timeToInt(this.getDeviceInfoCurrTime());
          if (this.timeToInt(this.getDeviceInfoCurrTime()) > 5) {
            nowTime = this.timeToInt(this.getDeviceInfoCurrTime());
          }
          const nextTime = nowTime < this.getCurtTotalTimeInt() ? nowTime + 1 : nowTime;
          this.setState({
            progressTime: nextTime
          })
        } else if ( pgsTime > 0 && pgsTime < this.getCurtTotalTimeInt() ) {
          let adjTime = 0;
          if (
            this.timeToInt(this.getDeviceInfoCurrTime()) >= pgsTime + 10
            || this.timeToInt(this.getDeviceInfoCurrTime()) <= pgsTime - 10
          ) {
            adjTime = this.timeToInt(this.getDeviceInfoCurrTime());
          } else {
            adjTime = pgsTime + 1;
          }
          
          this.setState({
            progressTime: adjTime
          })
        } else if (pgsTime === this.getCurtTotalTimeInt()) {
          //console.log('this.state.progressTime === this.getCurtTotalTimeInt()');
        }
        //console.log(this.state.progressTime);
      }
    } catch(err) {
      this.clearProgressTime();
      console.log(err);
    }
  }

  checkIfChangeCurrTrack() {
    if (this.state.playlist == null) {
      return false;
    }

    if (this.isReorder) {
      return false;
    }

    if (this.curr_track !== this.getCurrentTrack()) {
      if (this.getCurrentTrack()==="(OceanKTV)") {
        return false;
      }
      this.curr_track = this.getCurrentTrack();
      this.clearProgressTime();
      this.renderListItemAry();
      this.thumbWidth = null;
      /*if (
        this.curr_track > this.scrollBottomCount*10-3 && 
        this.scrollBottomCount*10 < +this.state.deviceInfo.total_track
      ) {
        this.scrollBottomCount++;
        console.log('Exceed current playlist count! -> getPlaylist()',this.scrollBottomCount);
        this.getPlaylist();
      }*/
      //console.log('Change curr_track!!!');
    } else if (
      +this.state.deviceInfo.total_track === 1 || 
      this.state.deviceInfo.play_mode === 'REPEAT_ONE' ||
      this.state.deviceInfo.play_mode === 'SHUFFLE_REPEAT_ONE') 
    {
      let totalTime = this.getCurtTotalTimeInt();
      if (this.state.progressTime === totalTime && this.timeToInt(this.getDeviceInfoCurrTime()) < 7) {
        this.clearProgressTime();
        this.renderListItemAry();
        //console.log('Change curr_track!!! total_track = 1');
      }
    }
  }

  clearProgressTime() {
    this.setState({
      progressTime: 0
    });
  }

  renderListItemAry() {
    let r = this.renderList2();
    this.setState({
      listItemsAry: r
    })
  }

  addPlayDone(dev_id) {
    if (this.state.deviceInfo.id == dev_id)
    {
      console.log("addPlayDone dev_id = ",dev_id);
      this.getPlaylist();
    }
  }

  onVolChange(v) {
    this.setState({
      volume: +v,
      lastVolume: +v,
    });
  }

  afterVolChange(v) {
      //const apiUrl = `${MainActions.getCgiOrigin()}/cgi-bin/cinema28/mdDevices.cgi?act=setvol&dev_id=${this.state.deviceInfo.id}&vol=${v}&sid=${MainActions.getSid()}`;
      const apiUrl = 
        MainActions.getCgiOrigin() 
        + '/cgi-bin/cinema28/mdDevices.cgi?act=setvol&dev_id=' 
        + this.state.deviceInfo.id + '&vol=' + v + '&sid=' 
        + MainActions.getSid();
      this.serverRequest = $.get(apiUrl, function (result) {
          if (result.ret_code === '0') {
          }
      }.bind(this));
      this.isVolChange = true;
  }

  onClickMute() {
    this.setState({
      isVolBarOpen: true
    })
  }

  playDevice() {
    const devId = this.state.deviceInfo.id;
    MainActions.playDevice(devId);
    let notyMsg = lang.getLang('NotificationMsg03');
    notyMsg = notyMsg.replace('%device',this.getName() + ' ');
    MainActions.pushNotification(notyMsg);
  }

  stopDevice() {
    const devId = this.state.deviceInfo.id;
    MainActions.stopDevice(devId);
    this.stopFlag = true;

    let notyMsg = lang.getLang('NotificationMsg05');
    notyMsg = notyMsg.replace('%device',this.getName() + ' ');
    MainActions.pushNotification(notyMsg);
    this.forceUpdate();
  }

  playOrResume() {
    const devId = this.state.deviceInfo.id;
    const playState = this.getPlayState();
    if (playState === 'PLAY') {
      // pause
      MainActions.pauseDevice(devId);
      this.pauseFlag = true;
      let notyMsg = lang.getLang('NotificationMsg04');
      notyMsg = notyMsg.replace('%device',this.getName() + ' ');
      MainActions.pushNotification(notyMsg);
    } else if (playState === 'STOP') {
      // play
      let playTrack = 1;
      //if (+this.state.deviceInfo.curr_track !== +this.state.deviceInfo.total_track) {
      playTrack = +this.state.deviceInfo.curr_track;
      //}
      MainActions.playDeviceTrack(devId, playTrack);
      this.playFlag = true;
      let notyMsg = lang.getLang('NotificationMsg03');
      notyMsg = notyMsg.replace('%device',this.getName() + ' ');
      MainActions.pushNotification(notyMsg);
    } else if (playState === 'PAUSE') {
      // resume
      MainActions.resumeDevice(devId);
      this.playFlag = true;
      let notyMsg = lang.getLang('NotificationMsg03');
      notyMsg = notyMsg.replace('%device',this.getName() + ' ');
      MainActions.pushNotification(notyMsg);
    }
    this.forceUpdate();
  }

  /**
   * Getter Methods for Render
   */

  getName() {
    let r = '';
    let nickname = this.state.deviceInfo.nickname;
    let name = this.state.deviceInfo.name;
    if (nickname.trim() !== '') {
      r = this.state.deviceInfo.nickname
    } else {
      r = this.state.deviceInfo.name;
    }
    return r;
  }

  getNameHandle(obj) {
    let r = '';
    let nickname = obj.nickname;
    let name = obj.name;
    if (nickname.trim() !== '') {
      r = obj.nickname
    } else {
      r = obj.name;
    }
    return r;
  }

  getThumb() {
    const thumbDir = this.state.deviceInfo.thumb_dir;
    const fileName = this.state.deviceInfo.file_name;
    let rst;
    if (!Boolean(fileName) 
      || fileName == '(no permission)'
      || !Boolean(thumbDir)
      || thumbDir == '(no permission)'
    ) {
      rst = '';
    } else {
      rst = MainActions.getCgiOrigin() +
            '/cgi-bin/filemanager/utilRequest.cgi?func=get_thumb&path=' +
            encodeURIComponent(thumbDir) +
            '&name=' + encodeURIComponent(fileName) +
            '&size=320&sid=' + MainActions.getSid();
    }
    return rst;
  }

  getNormalIcon() {
    const iconObj = {
      HDMI: 'img/device_icon/slice/hdmi_audio.svg',
      HDPLAYER: 'img/device_icon/slice/hdmi_player.svg',
      ANALOG: 'img/device_icon/slice/analog.svg',
      USB: 'img/device_icon/slice/usb.svg',
      Bluetooth: 'img/device_icon/slice/bluetooth.svg',
      network: 'img/device_icon/slice/dlna.svg',
    };
    const iconNetwork = {
      DLNA: 'img/device_icon/slice/dlna.svg',
      Chromecast: 'img/device_icon/slice/chromecast.svg',
      AirPlay: 'img/device_icon/slice/airplay.svg'
    };
    if (this.state.deviceInfo.type == 'network'){
        return this.state.deviceInfo.subtype in iconNetwork ? iconNetwork[this.state.deviceInfo.subtype] : '';
    } else {
        return this.state.deviceInfo.type in iconObj ? iconObj[this.state.deviceInfo.type] : '';
    }
  }

  getVolumeBtnStyle() {
    let r;
    /*if (this.getPlayState() === 'STOP') {
      if (+this.state.volume === 0) {
        r = "muteBtnDis";
      } else {
        r = "volBtnDis";
      }
    } else {*/
      if (this.state.deviceInfo.subtype == "Chromecast" || this.state.deviceInfo.subtype == "AirPlay") {
        if (+this.state.volume === 0) {
          r = "muteBtnDis";
        } else {
          r = "volBtnDis";
        }
      } else {
        if (+this.state.volume === 0) {
          r = "muteBtn";
        } else {
          r = "volBtn";
        }
      }
    //}
    return r;
  }

  getPlayPauseToolTip() {
    let r;
    if (this.getPlayState() === 'PLAY') {
      r = lang.getLang('Pause');
    } else {
      r = lang.getLang('Play');
    }
    return r;
  }

  ifProcessing() {
    return (
      this.delPlFlag || 
      this.stopFlag || 
      this.ifClickNext || 
      this.isDropflag || 
      this.isDbClick || 
      this.isReorder || 
      this.delTrackFlag ||
      this.isAppendToEnd.flag ||
      this.state.deviceInfo.working_total
    );
  }

  ifProcessingNP() {
    return (
      this.delPlFlag || 
      this.pauseFlag || 
      this.playFlag || 
      this.stopFlag || 
      this.delTrackFlag || 
      this.isReorder || 
      this.isDbClick ||
      this.isAppendToEnd.flag ||
      this.state.deviceInfo.working_total
    );
  }

  ifHandlingAction() {
    let rst = 
      this.delPlFlag ||
      this.delTrackFlag ||
      this.isDropflag ||
      this.isReorder ||
      this.stopFlag ||
      this.playFlag ||
      this.pauseFlag ||
      //this.isVolChange ||
      this.ifClickNext !== false ||
      this.isAppendToEnd.flag ||
      this.state.deviceInfo.working_total || 
      this.isDbClick;
    //console.log(rst);
    return rst;
  }

  ifHandlingActionNP() {
    return (
      this.delPlFlag || 
      this.pauseFlag || 
      this.playFlag || 
      this.stopFlag || 
      this.ifClickNext
    )
  }

  ifShowDotLoading() {
    let rst = this.state.deviceInfo.working_total || 
              this.delTrackFlag || 
              this.isAppendToEnd.flag || 
              this.isReorder || this.isDropflag || this.isDbClick;
    return rst;
  }

  ifDisableProgressHandle() {
    let rst = this.state.deviceInfo.working_total || 
              this.delTrackFlag || 
              this.isAppendToEnd.flag || 
              this.isReorder || this.isDropflag || this.isDbClick ||
              this.stopFlag || this.pauseFlag || this.playFlag ||
              !this.state.deviceInfo.total_time
              this.ifClickNext;
    return rst;
  }

  getPlayPause() {
    let r;
    let playState = this.getPlayState();
    let ifProcessingFlag = this.ifProcessing();
    switch (playState) {
      case 'PLAY': {
        if (this.pauseFlag) {
          r = 'pauseLoaidngBtn';
        } else if (this.playFlag) {
          r = 'playLoadingBtn';
        } else {
          r = 'pauseBtn';
        }
        if (ifProcessingFlag) {
          r = 'pauseBtnDis';
        }
        break;
      }
      case 'PAUSE': {
        if (this.playFlag) {
          r = 'playLoadingBtn';
        } else if (this.pauseFlag) {
          r = 'pauseLoaidngBtn';
        } else {
          r = 'playBtn';
        }
        if (ifProcessingFlag) {
          r = 'playBtnDis';
        }
        break;
      }
      case 'STOP': {
        if (this.playFlag) {
          r = 'playLoadingBtn';
        } else {
          r = 'playBtn';
        }
        if (ifProcessingFlag) {
          r = 'playBtnDis';
        }
        break;
      }
      case '': {
        r = 'playBtnDis';
        break;
      }
      default: {
        r = 'playBtnDis';
        break;
      }
    }
    return r;
  }

  getIfPlayPauseLoading() {
    return ( this.pauseFlag || this.playFlag );
  }

  getStopStyle() {
    let r;
    if (this.getPlayState() === 'PLAY' || this.getPlayState() === 'PAUSE') {
      if (this.stopFlag) {
        r = 'stopLoadingBtn';
      } else {
        r = 'stopBtn';
      }
    } else {
      r = 'stopBtnDis';
    }
    if (
      this.delPlFlag
      || this.pauseFlag
      || this.playFlag
      || this.ifClickNext
      || this.isDropflag
      || this.isDbClick
      || this.isReorder
      || this.delTrackFlag
      || this.isAppendToEnd.flag
      || this.state.deviceInfo.working_total
    ) {
        r = 'stopBtnDis';
    }
    return r;
  }

  getIfStopLoading() {
    /*let r = false;
    if (this.getPlayState() === 'PLAY' || this.getPlayState() === 'PAUSE') {
      r = this.stopFlag ? true : false;
    }*/
    let r = this.stopFlag;
    return r;
  }

  getPlayNextStyle() {
    let r;
    if (this.ifClickNext === 'NEXT') {
      r = 'nextBtnLoadingFlash';
    } else if (this.ifClickNext === 'PREVIOUS') {
      r = 'nextBtnDis';
    } else {
      r = 'nextBtn';
    }
    if (this.ifProcessingNP()) {
      r = 'nextBtnDis';
    }
    return r;
  }

  getPlayPreviousStyle() {
    let r;
    if (this.ifClickNext === 'PREVIOUS') {
      r = 'previousBtnLoadingFlash';
    } else if (this.ifClickNext === 'NEXT') {
      r = 'previousBtnDis';
    } else {
      r = 'previousBtn';
    }
    if (this.ifProcessingNP()) {
      r = 'previousBtnDis';
    }
    return r;
  }

  /**
   * Optional Render Methods
   */

  renderNameDOM() {
    return <p className="devNameTextStyle" data-tip={this.getName()}>{this.getName()}</p>;
  }

  toggleCover(func1,func2) {  // Append or cover check pop up dialogue
		var self = this;
    var msg = lang.getLang('Msg32');
		CommonActions.toggleMsgPopupCover(
			true, 
			'info',
			msg,
			'Y', 
			lang.getLang('OK'),
			'No',
			function(){
				CommonActions.toggleMsgPopupCover(false);
				func1();
			},
      function(){
				CommonActions.toggleMsgPopupCover(false);
				func2();
			}
    );
  }
  
  handleHDMIAudioNoConnected(tmpArrayPar, tmpItemsPar) {
    var devUser = this.state.deviceInfo.play_owner;
    var curUser = LoginStore.getUserName();
    var playState = this.getPlayState();
    var devId = this.state.deviceInfo.id;
    let listTitle = this.state.deviceInfo.list_title;
    let inUseStates = {
        PLAY: true,
        PAUSE: true,
    };
    let ifPlaying = inUseStates[ playState ] || false;
    let tmpArray = tmpArrayPar;
    let tmpItems = tmpItemsPar;

    let playApp = this.state.deviceInfo.play_app;
    const playAppCinema28 = 'Cinema28';

    let str = lang.getLang('MsgA1');
    let msg = str.replace('%device_name', this.getName());

    this.toggleYesNoDialog(
      ()=>{
        if (!ifPlaying && devUser != curUser) {
          //******* Device stop and different user ********/
          MainActions.addPlayItems(devId, tmpArray, '', playAppCinema28, 1);
          this.handleFlipClick(false);
          console.log("MainActions.addPlay reset:1");
        } else {
          MainActions.addPlayItems(devId, tmpArray, listTitle, playApp, 1);
          console.log("MainActions.addPlay");
        }
        let notyMsg = lang.getLang('NotificationMsg01');
        notyMsg = notyMsg.replace('%number',' ' + tmpArray.length + ' ');
        notyMsg = notyMsg.replace('%device',' ' + this.getName() +' ');
        MainActions.pushNotification(notyMsg);
        this.initFakeStream(tmpItems);
      },
      ()=>{ return; },
      msg
    );
  }

  handleDropHdPlayer(tmpArrayPar, tmpItemsPar, pMsg) {
    const devId = this.state.deviceInfo.id;
    let tmpArray = tmpArrayPar;
    let tmpItems = tmpItemsPar;
    const playAppCinema28 = 'Cinema28';
    let msg = pMsg;

    this.toggleYesNoDialog(
      ()=>{
        MainActions.addPlayItems(devId, tmpArray, '', playAppCinema28, 1);
        console.log("MainActions.addPlay reset:1");
        let notyMsg = lang.getLang('NotificationMsg01');
        notyMsg = notyMsg.replace('%number',' ' + tmpArray.length + ' ');
        notyMsg = notyMsg.replace('%device',' ' + this.getName() +' ');
        MainActions.pushNotification(notyMsg);
        this.initFakeStream(tmpItems);
        this.handleFlipClick(false);
      },
      ()=>{ return; },
      msg
    );
  }

  handleDropHdPlayerHDMIAudioInUse(tmpArrayPar, tmpItemsPar, pMsg, pHDMIAudioDev) {
    const devId = this.state.deviceInfo.id;
    let tmpArray = tmpArrayPar;
    let tmpItems = tmpItemsPar;
    const playAppCinema28 = 'Cinema28';
    let msg = pMsg;

    this.toggleYesNoDialog(
      ()=>{
        console.log('handleDropHdPlayerHDMIAudioInUse', pHDMIAudioDev.id);
        MainActions.stopDevice(pHDMIAudioDev.id);
        MainActions.addPlayItems(devId, tmpArray, '', playAppCinema28, 1);
        console.log("MainActions.addPlay reset:1");
        let notyMsg = lang.getLang('NotificationMsg01');
        notyMsg = notyMsg.replace('%number',' ' + tmpArray.length + ' ');
        notyMsg = notyMsg.replace('%device',' ' + this.getName() +' ');
        MainActions.pushNotification(notyMsg);
        this.initFakeStream(tmpItems);
        this.handleFlipClick(false);
      },
      ()=>{ return; },
      msg
    );
  }

  toggleYesNoDialog(func1,func2,pMsg) {
    let msg = pMsg;
		CommonActions.toggleMsgPopup(
			true, 
			'info',
      msg,
			'Both', 
			lang.getLang('Yes'), 
			lang.getLang('No'),
			function(){
				CommonActions.toggleMsgPopup(false);
				func1();
			},
      function(){
				CommonActions.toggleMsgPopup(false);
				func2();
			}
    );
  }

  toggleOkPopMsg(pMsg) {
    let msg = pMsg;
    CommonActions.toggleMsgPopup(
        true, 
        'info',
        msg,
        'Y', 
        lang.getLang('OK'),
        'No',
        function(){
          CommonActions.toggleMsgPopup(false);
          //func1();
        },
        function(){
          CommonActions.toggleMsgPopup(false);
        }
    );
  }
  

  //******* Drag and Drop Func *******//
  //******* Drag and Drop Func *******//
  drop(e) {
    this.setState({
      isDragEnter: false
    });
    var obj;
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    var isSafari = false;

    var ua = navigator.userAgent.toLowerCase(); 
    if (ua.indexOf('safari') != -1) { 
      if (ua.indexOf('chrome') > -1) {
        // Chrome
      } else {
        isSafari = true;
      }
    }
    
    try {
      if (isIE || isEdge) {
        obj = JSON.parse(e.dataTransfer.getData("text"));
      } else if (isSafari) {
        if (e.dataTransfer.types[1] !== "obj") {
          this.dragTarget = null;
          return;
        }
        obj = JSON.parse(e.dataTransfer.getData("obj"));
      } else {
        if (e.dataTransfer.types[0] !== "obj") {
          this.dragTarget = null;
          return;
        }
        obj = JSON.parse(e.dataTransfer.getData("obj"));
      }
    } catch(err) {
        console.log('drop(e) catch Error:',err);
        this.dragTarget = null;
        return;
    }
    e.preventDefault();
    this.dragTarget = null;
    const devId = this.state.deviceInfo.id;
    let listTitle = this.state.deviceInfo.list_title;

    console.log("obj from Media List ======================\n",obj);
    console.log('Drop device ID:',devId);

    /******* For No Support Media Protocol for Specific Devices - Enhancement #14658 *******/
    switch (obj.currMediaProtocol) {
      case 'mtp':{  // Mobile Device
        if (this.state.deviceInfo.type === 'HDPLAYER') {
          let str = lang.getLang('EGMsg02');
          let msg = str.replace('%Device_name%', this.getName());
          this.toggleOkPopMsg(msg);
          return;
        }
      }
      case 'davfs':
      case 'davfs-fuse':
      case 'ftpfs':
      case 'cifs':{
        let deviceTypeGG = this.state.deviceInfo.type;
        if (deviceTypeGG === 'HDPLAYER' || deviceTypeGG === 'Bluetooth') {
          let str = lang.getLang('EGMsg02');
          let msg = str.replace('%Device_name%', this.getName());
          this.toggleOkPopMsg(msg);
          return;
        }
      }
      default: {
        break;
      }
    }
    /******* For No Support Media Protocol for Specific Devices - Enhancement #14658 *******/

    var tmpArray = [];
    let tmpItems = [];

    switch (this.state.deviceInfo.type) {
      case "HDMI":{
        obj.items.forEach(function(element) {
          if (element.type == "audio" || element.type == "video") {
            tmpArray.push(element.filePath);
            tmpItems.push(element);
          }
        }, this);
        break;
      }
      case "ANALOG":{
        obj.items.forEach(function(element) {
          if (element.type == "audio" || element.type == "video") {
            tmpArray.push(element.filePath);
            tmpItems.push(element);
          }
        }, this);
        break;
      }
      case "USB":{
        obj.items.forEach(function(element) {
          if (element.type == "audio" || element.type == "video") {
            tmpArray.push(element.filePath);
            tmpItems.push(element);
          }
        }, this);
        break;
      }
      case "network":{
        obj.items.forEach(function(element) {
          if (element.type == "audio" || element.type == "video" || element.type == "photo") {
            tmpArray.push(element.filePath);
            tmpItems.push(element);
          }
        }, this);
        break;
      }
      case "HDPLAYER":{
        obj.items.forEach(function(element) {
          if (element.type == "audio" || element.type == "video" || element.type == "photo") {
            tmpArray.push(element.filePath);
            tmpItems.push(element);
          }
        }, this);
        break;
      }
      case "Bluetooth":{  /** Bluetooth devices: audio files only */
        obj.items.forEach(function(element) {
          if (element.type == "audio") {
            tmpArray.push(element.filePath);
            tmpItems.push(element);
          }
        }, this);
        break;
      }
    }


    var devUser = this.state.deviceInfo.play_owner;
    var curUser = LoginStore.getUserName();

    var playState = this.getPlayState();
    let inUseStates = {
        PLAY: true,
        PAUSE: true,
    };
    let ifPlaying = inUseStates[ playState ] || false;
    let totalTrack = +this.state.deviceInfo.total_track;

    if (tmpArray.length > 500) {  //***** Limit the amount of droping items to 500 */
      tmpArray.splice(500);
      console.log('%c Number of drag items is more than 500!', 'color: green; font-weight: bold;');
    }

    let playApp = this.state.deviceInfo.play_app;
    let inUseApps = this.state.deviceInfo.inuse_apps;
    const playAppCinema28 = 'Cinema28';

    if (tmpArray.length >= 1) {
      if (this.state.deviceInfo.type === 'HDPLAYER') {
        let devName = this.state.deviceInfo.name;
        let devNumStr = devName.slice(devName.length - 1);
        let devByType = MainStore.getDeviceByType();
        let hdmiDevsObj = devByType.hdmiDevs;
        let hdPlayerDevsObj = devByType.hdPlayerDevs;


        if (devName.indexOf('HD Player HDMI-A') > -1) { //For X73
          switch (devName) {
            case "HD Player HDMI-A-0":
              devNumStr = "HDMI 0";
              break;
            case "HD Player HDMI-A-1":
              devNumStr = "HDMI 1";
              break;
            case "HD Player HDMI-A-2":
              devNumStr = "HDMI 2";
              break;
          }
        }

        let corHdmiAudioDevAry = _.filter(
          hdmiDevsObj,
          o => { return o.name.indexOf(devNumStr) >= 0 }
        );

        let otherHdPlayerDevAry = _.filter(
          hdPlayerDevsObj,
          o => { return o.name !== devName }
        );

        if (corHdmiAudioDevAry.length > 0) {  // OceanKTV is using corresponded HDMI audio
          let corHdmiAudioDev = corHdmiAudioDevAry[0];
          if (corHdmiAudioDev.inuse_apps === 'OceanKTV') {
            let str = lang.getLang('MsgA5');
            str = str.replace('%device_name_1', this.getName());
            str = str.replace('%device_name_2', this.getNameHandle(corHdmiAudioDev));
            let msg = str;
            // let msg = '此時 OceanKTV 正在使用中,是否要中斷並改執行 HD Player?';
            this.handleDropHdPlayer(tmpArray, tmpItems, msg);
            console.log('corHdmiAudioDev:',corHdmiAudioDev);
            return;
          } else if (corHdmiAudioDev.inuse_apps.indexOf('HD Player') >= 0) {
            console.log('Corresponded HDMI Audio is used by HD Player - Continue');
          } else if (corHdmiAudioDev.inuse_apps.indexOf('HD Station') >= 0) {
            let str = lang.getLang('MsgA5');
            str = str.replace('%device_name_1', this.getName());
            str = str.replace('%device_name_2', this.getNameHandle(corHdmiAudioDev));
            let msg = str;
            //let msg = '此時 HD Station 應用程式正在使用中,是否要中斷並改執行 HD Player?';
            this.handleDropHdPlayer(tmpArray, tmpItems, msg);
            console.log('corHdmiAudioDev:',corHdmiAudioDev);
            return;
          } else if (corHdmiAudioDev.inuse_apps !== '') {
            let str = lang.getLang('MsgA2');
            str = str.replace('%device_name', this.getNameHandle(corHdmiAudioDev));
            let msg = str;
            //let msg = '此時 HDMI Audio 正在使用中,是否要中斷並改執行 HD Player?';
            this.handleDropHdPlayerHDMIAudioInUse(tmpArray, tmpItems, msg, corHdmiAudioDev);
            console.log('corHdmiAudioDev:',corHdmiAudioDev);
            return;
          }
        } else if (otherHdPlayerDevAry.length > 0) { // Other HD Player devices is in use
          let inUseDevAry = _.filter(
            otherHdPlayerDevAry,
            o => { return o.inuse_apps !== '' }
          );
          if (inUseDevAry.length > 0) {
            let inUseDev = inUseDevAry[0];
            let user = inUseDev.play_owner;
            let name = this.getNameHandle(inUseDev)
            let str = lang.getLang('MsgA2');
            let msg = str.replace('%device_name', name);
            // '此串流將會取代正在由' + user + '使用中的' + name + '，您確定要繼續播放嗎?';
            this.handleDropHdPlayer(tmpArray, tmpItems, msg);
            return;
          }
        }
      }

      if ( devUser === curUser && totalTrack > 0) {
        if (inUseApps === playAppCinema28 || playApp === playAppCinema28) {
          this.toggleCover(
            ()=>{
              MainActions.addPlayItems(devId, tmpArray, '', playAppCinema28, 1);
              console.log("MainActions.addPlay - toggleCover 1");
  
              let notyMsg = lang.getLang('NotificationMsg01');
              notyMsg = notyMsg.replace('%number',' ' + tmpArray.length + ' ');
              notyMsg = notyMsg.replace('%device',' ' + this.getName() +' ');
              MainActions.pushNotification(notyMsg);
  
              this.isDropflag = true;
              this.updateFlag = false;
              this.clearProgressTime();
              this.setState({
                playlist: null
              });
              this.handleFlipClick(false);
            },
            ()=>{
              MainActions.addPlayItems(devId, tmpArray, listTitle, playApp, 0);
              console.log("MainActions.addPlay - toggleCover 0");
  
              let notyMsg = lang.getLang('NotificationMsg01');
              notyMsg = notyMsg.replace('%number',' ' + tmpArray.length + ' ');
              notyMsg = notyMsg.replace('%device',' ' + this.getName() +' ');
              MainActions.pushNotification(notyMsg);
  
              this.isAppendToEnd.flag = true;
              this.isAppendToEnd.expTrackCnt = tmpArray.length + totalTrack;
            }
          );
        } else {
          let str = lang.getLang('MsgA2');
          let msg = str.replace('%device_name', this.getName());

          this.toggleYesNoDialog(
            ()=>{
              MainActions.addPlayItems(devId, tmpArray, '', playAppCinema28, 1);
              console.log("MainActions.addPlay - Other QR apps is using 1");
  
              let notyMsg = lang.getLang('NotificationMsg01');
              notyMsg = notyMsg.replace('%number',' ' + tmpArray.length + ' ');
              notyMsg = notyMsg.replace('%device',' ' + this.getName() +' ');
              MainActions.pushNotification(notyMsg);
  
              this.isDropflag = true;
              this.updateFlag = false;
              this.clearProgressTime();
              this.setState({
                playlist: null
              });
              this.handleFlipClick(false);
            },
            ()=>{ return; },
            msg
          )
        }
        
      } else if ( !devUser || devUser == curUser || !ifPlaying ) {
        if (this.state.deviceInfo.type === 'HDMI' && this.state.deviceInfo.connected === '') {
          this.handleHDMIAudioNoConnected(tmpArray,tmpItems);
          return false;
        } else {
          if (!ifPlaying && !devUser) { //******* Device no stream *******/
            MainActions.addPlayItems(devId, tmpArray, listTitle, playApp, 1);
            console.log("MainActions.addPlay");
          } else if (!ifPlaying && devUser != curUser) {
            //******* Device stop and different user ********/
            MainActions.addPlayItems(devId, tmpArray, '', playAppCinema28, 1);
            console.log("MainActions.addPlay reset:1");
            this.isDropflag = true;
            this.updateFlag = false;
            this.clearProgressTime();
            this.setState({
              playlist: null
            });
            this.handleFlipClick(false);
          } else {
            MainActions.addPlayItems(devId, tmpArray, listTitle, playApp, 1);
            console.log("MainActions.addPlay");
          }
          
          let notyMsg = lang.getLang('NotificationMsg01');
          notyMsg = notyMsg.replace('%number',' ' + tmpArray.length + ' ');
          notyMsg = notyMsg.replace('%device',' ' + this.getName() +' ');
          MainActions.pushNotification(notyMsg);
        }

      } else {
        let msg = lang.getLang('Msg19');
        let devUser = this.state.deviceInfo.play_owner;
        let resMsg = msg.replace("%user",devUser);
        this.toggleYesNoDialog(
          ()=>{
            MainActions.addPlayItems(devId, tmpArray, '', playAppCinema28, 1);
            console.log("MainActions.addPlay - toggleDiffUser");

            let notyMsg = lang.getLang('NotificationMsg01');
            notyMsg = notyMsg.replace('%number',' ' + tmpArray.length + ' ');
            notyMsg = notyMsg.replace('%device',' ' + this.getName() +' ');

            MainActions.pushNotification(notyMsg);
            this.isDropflag = true;
            this.updateFlag = false;
            this.clearProgressTime();
            this.setState({
              playlist: null
            });
            this.handleFlipClick(false);
          },
          ()=>{return;},
          resMsg
        );
      }
      
    } else {
      console.log("<<<<<<<<<<<< 1",obj, tmpArray);
      if (obj.items.length >= 1) {
        var msg = lang.getLang('Msg35');
        this.toggleOkPopMsg(msg);
        return false;
      }
    }

    this.initFakeStream(tmpItems);
    
    ReactTooltip.hide();
  }

  initFakeStream(tmpItemsPar) {
    let tmpItems = tmpItemsPar;
    const streamingStatus = this.getStreamingStatus();
    if (streamingStatus === 'NOSTREAM') {
      if (tmpItems.length >0) {
        let itemAry = [];
        tmpItems.forEach(function(item,i) {
          if (i < 10) {
            let obj01 = {
              file: item.filePath,
              file_name: item.name,
              id: i+1,
              thumb_dir: '',
              title: this.getTempTitle(item.name),
              total_time: '00:00:00',
              track: i+1,
              type: item.type,
            }
            itemAry.push(obj01);
          }
        }.bind(this));

        let tmpPlaylist = {
          curr_time: '00:00:00',
          curr_track: "1",
          file: tmpItems[0].filePath,
          id: this.state.deviceInfo.id,
          inuse_apps: 'File Station',
          items: itemAry,
          list_title: '',
          msg: '',
          page: '1',
          play_app: 'File Station',
          play_mode: 'NORMAL',
          play_owner: '',
          play_state: 'PLAY',
          ret_code: '0',
          title: this.getTempTitle(tmpItems[0].name),
          total_track: tmpItems.length,
          volume: 100,
          working_listtitle:"",
          working_mode:"",
          working_state:"",
          working_total:"",
        }
        this.tempPlaylist = tmpPlaylist;
        this.setState({
          playlist: tmpPlaylist
        },()=>{
          this.getPlaylist();
          this.renderListItemAry();
        })
        this.isDropflag = true;
      }
    }
  }
  getTempThumbDir(str) {
    let str01 = str.replace('/share','');
    let idxRest = str01.lastIndexOf('/');
    let str02 = str01.substr(0,idxRest);
    return str02;
  }
  getTempTitle(str) {
    let idx = str.lastIndexOf('.');
    let rstStr = str.substr(0,idx);
    return rstStr;
  }

  allowDrop(e) {
    e.preventDefault();
  }

  dragLeave(event) {
    event = event.originalEvent || event;
    var currentElement = document.elementFromPoint(event.pageX, event.pageY);
    try { 
        if (!this.dragTarget.contains(currentElement)) {
          //this.dragTarget.style.backgroundColor = "";
          //this.dragTarget.style.border = "";
          //this.dragTarget.className = 'deviceItem_tv';
          this.dragTarget = null;
          this.setState({
            isDragEnter: false
          });
        }
    } catch(err) {
        //console.log(err);
    }
    
  }

  dragEnter(e) {
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    var obj;
    var isSafari = false;
    
    var ua = navigator.userAgent.toLowerCase(); 
    if (ua.indexOf('safari') != -1) { 
      if (ua.indexOf('chrome') > -1) {
        // Chrome
      } else {
        isSafari = true;
      }
    }

    try {
      if (isIE || isEdge) {
      } else if (isSafari) {
        if (e.dataTransfer.types[1] !== "obj") {
          return;
        }
      } else {
        if (e.dataTransfer.types[0] !== "obj") {
          return;
        }
      }
      
    } catch(err) {
        console.log('drop(e) catch Error:',err);
        this.dragTarget = null;
        return;
    }
    
    if (isIE) {
      if (this.dragTarget == null && e.currentTarget.attributes[2].nodeValue === 'true') {
        this.dragTarget = e.currentTarget;
        this.setState({
          isDragEnter: true
        });
      }
    } else {
      if (this.dragTarget == null && e.currentTarget.dataset.dropflag == "true") {
        this.dragTarget = e.currentTarget;
        this.setState({
          isDragEnter: true
        });
      }
    }
  }
  //******* Drag and Drop Func *******//
  //******* Drag and Drop Func *******//

  itemMouseOver() {
    this.setState({
      isMouseOver: true
    })
    if (this.hoverTimer !== null) {
      clearTimeout(this.hoverTimer);
    }
  }

  itemMouseOut() {
    this.hoverTimer = setTimeout(()=>{
      this.setState({
        isMouseOver: false
      });
    },2000);
  }

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
      case "Photo Station": {
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
    }
  }

  getLinkApplication() {
      let linkApplication;
      let isInWindow = (window.parent == window) ? true : false;
      /*
      let playState = this.getPlayState();
      let inUseStates = {
        PLAY: true,
        PAUSE: true,
        '(OceanKTV)': true,
        STOP: true,
      };
      let ifPlaying = inUseStates[ playState ] || false;
      if (!ifPlaying) {
        return '';
      }
      */
      let playApp = this.state.deviceInfo.play_app;
      switch (playApp) {
          case "File Station":{
              if (isInWindow) {
                linkApplication = playApp;
              } else {
                linkApplication = (
                  <a
                    style={{cursor:'pointer'}}
                    onClick={this.openStationInner.bind(this,"File Station")}
                    target="_blank"
                  >
                    {playApp}
                  </a>
                );
              }
              break;
          }
          case "Music Station":{
              if (isInWindow) {
                linkApplication = playApp;
              } else {
                linkApplication = (
                  <a
                    style={{cursor:'pointer'}}
                    onClick={this.openStationInner.bind(this,"Music Station")}
                    target="_blank"
                  >
                    {playApp}
                  </a>
                );
              }
              break;
          }
          case "Video Station":{
              if (isInWindow) {
                linkApplication = playApp;
              } else {
                linkApplication = (
                  <a 
                    style={{cursor:'pointer'}} 
                    onClick={this.openStationInner.bind(this,"Video Station")} 
                    target="_blank"
                  >
                    {playApp}
                  </a>
                );
              }
              break;
          }
          case "Photo Station":{
              if (isInWindow) {
                linkApplication = playApp;
              } else {
                linkApplication = (
                  <a
                    style={{cursor:'pointer'}}
                    onClick={this.openStationInner.bind(this,"Photo Station")}
                    target="_blank"
                  >
                    {playApp}
                  </a>
                );
              }
              break;
          }
          case "OceanKTV": {
              if (isInWindow) {
                linkApplication = playApp;
              } else {
                linkApplication = (
                  <a
                    style={{cursor:'pointer'}}
                    onClick={this.openStationInner.bind(this,"OceanKTV")}
                    target="_blank"
                  >
                    {playApp}
                  </a>
                );
              }
              break;
          }
          default: {
              linkApplication = playApp;
              break;
          }
      }

      return linkApplication;
  }

  getPermissionStatus() {
    const fileName = this.state.deviceInfo.file;
    let status = fileName === "(no permission)";
    return status;
  }

  tooglePermissionInfo() {
    let msg = lang.getLang('Msg33');
    this.toggleOkPopMsg(msg);
  }

  getMeta(url,callback){
    $("<img/>",{
      load : function(){    
        var rst = Math.round( (this.width * 140 / this.height - 140) / 2 );
        //console.log("width:",this.width,"height:",this.height,"rst:",rst);
        if (this.width - this.height > 0) {
          rst = { maxHeight:'130px', minHeight:'130px' };
        } else {
          rst = { maxWidth:'130px', minWidth:'130px' };
        }
        callback(rst);
      },
      src  : url
    });
  }

  setThumbWidth(width) {
    this.thumbWidth = width;
  }

  getDir(track) {
    var rst;
    try { 
        rst = this.state.playlist.items[track - 1].thumb_dir;
    } catch(err) {
        console.log(err);
        rst = "";
    }
    return rst;
  }

  getFilename(track) {
    return this.state.playlist.items[track - 1].file_name;
  }

  getThumbPlaylist(track) {
    const thumbDir = this.getDir(track);
    const fileName = this.getFilename(track);
    let rstFlag = (
      fileName === null
      || fileName == "(no permission)"
      || thumbDir == null
      || thumbDir == "(no permission)"
    );
    return rstFlag ?
        'img/mainpage/slice/thumbnail_default_onair.png'
      :
        MainActions.getCgiOrigin() +
        '/cgi-bin/filemanager/utilRequest.cgi?func=get_thumb&path=' +
        encodeURIComponent(thumbDir.replace('/share/CACHEDEV1_DATA/', '')) +
        '&name=' + encodeURIComponent(fileName) +
        '&size=80&sid=' + MainActions.getSid();
  }

  getTotalTime(track, totalTime) {
    return track !==
      +this.state.hoverItemTrack ?
      <p className='mediaTimeText' >{totalTime}</p> :
      null;
    //return null;
  }

  delTrack(id, track) {
        let dev_id = this.state.deviceInfo.id;
        //const uId = _.find(this.state.playlist.items, { track: track.toString() }).id;
        //const uId = this.props.itemInfo.id;
        let listTitle = this.state.deviceInfo.list_title;
        let playApp = this.state.deviceInfo.play_app;
        MainActions.delTrack(dev_id, id, listTitle, playApp, track);
        //  If Delete Current Track
        let ifDelCurrTrack = false;
        if (this.state.playlist.items.length >= +this.state.deviceInfo.curr_track-1) {
          ifDelCurrTrack = this.state.playlist.items[+this.state.deviceInfo.curr_track-1].id === id
          ? true
          : false;
        }
        //  If Delete Current Track
        let removeItem = _.remove(this.state.playlist.items, function(item){
          return item.id === id;
        })
        
        //this.afterDelTrackNum = this.state.playlist.items.length;
        this.afterDelTrackNum = +this.state.deviceInfo.total_track - 1;
        this.renderListItemAry();
        if (this.afterDelTrackNum === 0) {
          this.delPlFlag = true;
          this.isDropflag = false;
          this.setState({
            playlist: null,
            isOpenedFlag: true,
          });
          this.clearProgressTime();
          this.handleFlipClick(false);
          ReactTooltip.hide();
        } else if (ifDelCurrTrack) {
          this.delCurTrackFlag = true;
          this.delTrackFlag = true;
          this.isAppendToEnd.flag = true;
          this.isAppendToEnd.expTrackCnt = this.afterDelTrackNum;

          this.getPlaylist();
          this.clearProgressTime();
          this.updateFlag = false;
          /*setTimeout(()=>{
            this.updateFlag = true;
            this.renderListItemAry();
          },6000);*/
        } else {
          this.delTrackFlag = true;
          this.isAppendToEnd.flag = true;
          this.isAppendToEnd.expTrackCnt = this.afterDelTrackNum;
          this.getPlaylist();
        }
        ReactTooltip.hide();
  }

  renderList2() {
    let r = [];
    let r1;
    let track;
    let totalTime;
    let file;
    if (this.state.playlist == null) {
      //this.clickClosePlaylist();
      return null;
    }

    /*let currTotalTrack = this.state.playlist.working_total === ''
      ? +this.state.playlist.total_track
      : +this.state.playlist.working_total;*/
    let currTotalTrack = this.state.playlist.items.length;
    let playState = this.getPlayState();

    for (let i = 0; i < currTotalTrack; i++) {
      try {
        track = +this.state.playlist.items[i].track;
        totalTime = this.state.playlist.items[i].total_time;
        file = this.state.playlist.items[i].file;
      } catch(err) {
        console.log(err);
        break;
      }
      
      /*if (this.state.playlist.items[i].title === "") { // Empty title often happened
        console.log(this.state.playlist);
      }*/

      let ifCurrTrack = (
        //this.state.deviceInfo.file === file &&
        +this.state.deviceInfo.curr_track === track &&
        playState === 'PLAY'
      );
      r.push(
        <ListItem
          devId={this.state.playlist.id}
          itemInfo={this.state.playlist.items[i]}
          delTrackFunc={this.delTrack.bind(this)}
          dbClickFunc={this.dbClickFunc.bind(this)}
          key={this.state.playlist.items[i].id}
          currTrack={ifCurrTrack}
        />
      );
    }
    return r;
  }

  swapArrayElements(arr, indexA, indexB) {
    var temp = arr[indexA];
    arr.splice(indexA, 1);
    arr.splice(indexB, 0, temp);
    //arr[indexA] = arr[indexB];
    //arr[indexB] = temp;
  };

  sortableOnChange(order, sortable, evt) {
    console.log(order,sortable,evt);
    
    if (evt.from === evt.to) {
      let oldIndex = evt.oldIndex + 1;
      let newIndex = evt.newIndex + 1;
      console.log('oldIndex:',oldIndex,'  newIndex:',newIndex);
      let listTitle = this.state.deviceInfo.list_title;
      let playApp = this.state.deviceInfo.play_app;
      MainActions.reorderPlayingList(this.state.playlist.id, oldIndex, newIndex, listTitle, playApp);
      
      let tmpAry = this.state.listItemsAry.slice();
      this.isReorder = true;

      let currTrack = this.getCurrentTrack();
      let expCurrTrack1 = 0;
      if (oldIndex < currTrack && newIndex >= currTrack) {
        expCurrTrack1 = currTrack - 1;
      } else if (oldIndex > currTrack && newIndex <= currTrack) {
        expCurrTrack1 = currTrack + 1;
      } else if (oldIndex === currTrack) {
        expCurrTrack1 = newIndex;
      } else {
        expCurrTrack1 = currTrack;
      }
      this.reorderItem = {
        id: tmpAry[evt.oldIndex].props.itemInfo.id,
        newIndex: evt.newIndex,
        expCurrTrack: expCurrTrack1
      }
      this.swapArrayElements(tmpAry,evt.oldIndex,evt.newIndex);
      this.setState({
        listItemsAry: tmpAry
      });
      setTimeout(()=>{
        this.getPlaylist();
      },3000);
    } else {
      let child = evt.clone.childNodes[0];
      if (child.dataset.devid === this.state.deviceInfo.id) {
        console.log('self',child.dataset.devid);
      } else {
        console.log('drop to other devices',child.dataset.devid,this.state.deviceInfo.id);
        let devId = this.state.deviceInfo.id;
        let listTitle = this.state.deviceInfo.list_title;
        let path = child.dataset.path;
        let track = evt.newIndex + 1;

        let totalTrack = +this.state.deviceInfo.total_track;
        this.isReorder = true;
        this.isAppendToEnd.flag = true;
        this.isAppendToEnd.expTrackCnt = totalTrack + 1;
        
        this.reorderItem = {
          id: null,
          path: child.dataset.path,
          newIndex: evt.newIndex
        }
        let tmpItemInfo = {
          file: child.dataset.path,
          file_name: child.dataset.filename,
          id: '5487123',
          thumb_dir: child.dataset.thumbdir,
          title: child.dataset.title,
          total_time: child.dataset.ttime,
          track: '123',
          type: ''
        }
        let newItem = <ListItem 
                        devId={this.state.playlist.id} 
                        itemInfo={tmpItemInfo} 
                        key='5878965412'
                        currTrack={false} />;
        let tmpAry = this.state.listItemsAry.slice();
        tmpAry.splice(evt.newIndex, 0, newItem);
        this.setState({
          listItemsAry: tmpAry
        });
        MainActions.addToTrack(devId, listTitle, path, track);
        setTimeout(()=>{
          this.getPlaylist();
        },3000);
      }
      /*if (child.parentNode) {
        child.parentNode.removeChild(child);
        let r = this.renderList2();
        this.setState({
          listItemsAry: r,
          //playlist: null
        });
      }*/
      //this.forceUpdate();
    }
    this.setState({
      isDragEnter: false
    });
    ReactTooltip.hide();
  }

  handleScroll(e) {
      let tmpTarget = e.target;
      if (tmpTarget.scrollHeight - (tmpTarget.scrollTop + tmpTarget.clientHeight) <= 10) {
        if (
          this.scrollBottomCount*10 < +this.state.deviceInfo.total_track
          && this.scrollBottomCount*10 <= this.state.playlist.items.length
        ) {
          this.scrollBottomCount++;
          this.getPlaylist();
          console.log('Scroll to Bottom!!!');
        } else {
          console.log('Scroll to Bottom!!! No getPlaylist',this.scrollBottomCount);
        }
        
      }
  }

  renderListDetail() {
    //const itemsAry = ['Apple', 'Banana', 'Cherry', 'Guava', 'Peach', 'Strawberry'];
    const items = this.state.listItemsAry === null
      ? null 
      : this.state.listItemsAry.map((val, key) => (<div key={key} data-id={key}>{val}</div>));
    let reorderMask = this.ifHandlingAction()
      ? (
        <div 
          style={{
            width:'100%',
            height:'100%',
            position:'absolute',
            top:'0',
            zIndex:'2',
            backgroundColor:'rgba(0,0,0,0)'
          }}
        >
        </div>
      ) : null;
    return (
            <div style={{position:'relative'}}>
              <Sortable
                options={{
                  group: {name: 'shared', pull: true, put: true},
                  animation: 80,
                  scroll: true,
                  //scrollSensitivity: 500,
                }} 
                onChange={this.sortableOnChange.bind(this)}
                /*onEnd= {this.sortableOnEnd.bind(this)}*/
                /*onClone={(evt)=>{
                  console.log(evt);
                }}*/
              >
                {items}
              </Sortable>
              {reorderMask}
            </div>
        );
  }

  renderListSimple() {
    let r = [];
    let r1;
    let track;
    let totalTime;
    if (this.state.playlist == null) {
      //this.clickClosePlaylist();
      return null;
    }

    /*let currTotalTrack = this.state.playlist.working_total === ''
      ? +this.state.playlist.total_track
      : +this.state.playlist.working_total;*/
    let currTotalTrack = this.state.playlist.items.length;

    for (let i = 0; i < currTotalTrack; i++) {
      try {
        track = +this.state.playlist.items[i].track;
        totalTime = this.state.playlist.items[i].total_time;
      } catch(err) {
        console.log(err);
        break;
      }
      
      /*if (this.state.playlist.items[i].title === "") { // Empty title often happened
        console.log(this.state.playlist);
      }*/

      /*if (this.state.playlist.items[track]) {
        //let trackJ = +this.state.playlist.items[j].track;
        r.push(track === +this.state.playlist.curr_track 
          ? 
            this.renderListSimpleItem(true,this.state.playlist.items[track])
          :
            this.renderListSimpleItem(false,this.state.playlist.items[track])
        );
      }*/

      if (track === this.getCurrentTrack() ) {
        for (let j = track-4; j <= track+2; j++) {
          if (this.state.playlist.items[j]) {
            let trackJ = +this.state.playlist.items[j].track;
            r.push(trackJ === this.getCurrentTrack() 
              ? 
                this.renderListSimpleItem(true,this.state.playlist.items[j])
              :
                this.renderListSimpleItem(false,this.state.playlist.items[j])
            );
          }
        }
      }
      
    }
    return (
      <div
        style={{height:'calc(100% - 270px)',color:'#ffffff',paddingTop:'10px'}}
        onClick={this.angleUpClick.bind(this)}
      >
        {r}
      </div>
    );
  }

  renderListSimpleItem(ifCurrTrack,item) {
    let itemColor = ifCurrTrack ? '#29E1FA' : '#FFFFFF';
    let title = item.title
    let totalTime = item.total_time;
    let totalTimeRst = totalTime.substring(0,2) === '00' ? totalTime.substring(3) : totalTime;
    let keyValue = title + item.id;
    let rst = ifCurrTrack && this.getPlayState() !== 'STOP'
    ? (
      <div key={keyValue} className='listItemSimple'>
        <p className='pStyle' style={{color: itemColor,textOverflow: 'initial'}} data-tip={title}>
          <span>{title}</span>
        </p>
        <p style={{position:'absolute',right:'20px',color:'#989898',fontSize:'12px',margin:'0'}}>{totalTimeRst}</p>
      </div>
      )
    : (
      <div key={keyValue} className='listItemSimple'>
        <p className='pStyle' style={{color: itemColor}} data-tip={title}>{title}</p>
        <p style={{position:'absolute',right:'20px',color:'#989898',fontSize:'12px',margin:'0'}}>{totalTimeRst}</p>
      </div>
      );
    return rst;
  }

  getRepeatBtnStyle() {
    /*const playMode = this.state.playlist.working_mode === '' 
      ? this.state.playlist.play_mode 
      : this.state.playlist.working_mode;*/
    let playMode = this.state.playMode === '' ? this.state.deviceInfo.play_mode : this.state.playMode;
    const styleObj = {
      NORMAL: 'repeatOffBtn',
      REPEAT: 'repeatOnBtn',
      REPEAT_ONE: 'repeatOneBtn',
      SHUFFLE: 'repeatOffBtn',
      SHUFFLE_REPEAT: 'repeatOnBtn',
      SHUFFLE_REPEAT_ONE: 'repeatOneBtn',
    };
    return playMode in styleObj ? styleObj[playMode] : 'repeatOffBtn';
  }

  getShuffleBtnStyle() {
    let playMode = this.state.playMode === '' ? this.state.deviceInfo.play_mode : this.state.playMode;
    const styleObj = {
      NORMAL: 'shuffleOffBtn',
      REPEAT: 'shuffleOffBtn',
      REPEAT_ONE: 'shuffleOffBtn',
      SHUFFLE: 'shuffleOnBtn',
      SHUFFLE_REPEAT: 'shuffleOnBtn',
      SHUFFLE_REPEAT_ONE: 'shuffleOnBtn',
    };
    return playMode in styleObj ? styleObj[playMode] : 'shuffleOffBtn';
  }

  clickRepeat() {
    //const playMode = this.state.playlist.play_mode;
    if (this.isRepeatShuffleBusy) {
      return;
    }
    let playMode = this.state.playMode === "" 
      ? this.state.deviceInfo.play_mode 
      : this.state.playMode;
      
    let styleObj;
    styleObj =
    {
      NORMAL: 'REPEAT',
      REPEAT: 'REPEAT_ONE',
      REPEAT_ONE: 'NORMAL',
      SHUFFLE: 'SHUFFLE_REPEAT',
      SHUFFLE_REPEAT: 'SHUFFLE_REPEAT_ONE',
      SHUFFLE_REPEAT_ONE: 'SHUFFLE',
    };
    let dev_id = this.state.deviceInfo.id;
    const nextMode = playMode in styleObj ? styleObj[playMode] : playMode;
    MainActions.setPlayMode(dev_id, nextMode);
    this.setState({
      playMode: nextMode
    });
    this.isClickRepeat = true;
    this.isRepeatShuffleBusy = true;
    setTimeout(() => {
      this.isRepeatShuffleBusy = false;
    }, 1000);
  }

  clickShuffle() {
    if (this.isRepeatShuffleBusy) {
      return;
    }
    let playMode = this.state.playMode === "" 
      ? this.state.deviceInfo.play_mode 
      : this.state.playMode;
    let dev_id = this.state.deviceInfo.id;
    const styleObj = {
      NORMAL: 'SHUFFLE',
      REPEAT: 'SHUFFLE_REPEAT',
      REPEAT_ONE: 'SHUFFLE_REPEAT_ONE',
      SHUFFLE: 'NORMAL',
      SHUFFLE_REPEAT: 'REPEAT',
      SHUFFLE_REPEAT_ONE: 'REPEAT_ONE',
    };
    const nextMode = playMode in styleObj ? styleObj[playMode] : playMode;
    MainActions.setPlayMode(dev_id, nextMode);
    this.setState({
      playMode: nextMode
    });
    this.isClickShuffle = true;
    this.isRepeatShuffleBusy = true;
    setTimeout(() => {
      this.isRepeatShuffleBusy = false;
    }, 1000);
  }

  renderShuffleButton() {
    let rst;
    rst = (
      <button
        key="shuffleBtn"
        className={this.getShuffleBtnStyle()}
        style={{cursor:'pointer'}}
        onClick={this.clickShuffle.bind(this)}
        data-tip={lang.getLang('Shuffle')}
      />
    );
    return rst;
  }

  timeToInt(timeStr) {
    const timeAry = timeStr.split(':');
    return +timeAry[0] * 60 * 60 + +timeAry[1] * 60 + +timeAry[2];
  }

  clickNext() {
    if (this.ifHandlingActionNP()) {
      return false;
    }
    let dev_id = this.state.deviceInfo.id;
    this.trackBeforeClick = +this.state.deviceInfo.curr_track;
    MainActions.playNext(dev_id);
    this.ifClickNext = 'NEXT';
    this.forceUpdate();
  }

  clickPrev() {
    if (this.ifHandlingActionNP()) {
      return false;
    }
    let dev_id = this.state.deviceInfo.id;
    this.trackBeforeClick = +this.state.deviceInfo.curr_track;
    MainActions.playPrev(dev_id);
    this.ifClickNext = 'PREVIOUS';
    this.forceUpdate();
  }

  getCurtTotalTimeInt() {
    let rst;
    /*if (this.state.playlist === null || this.state.playlist === undefined)
      return 0;*/
    
    /*if (this.state.playlist.items[this.getCurrentTrack() - 1] == null)
      return 0;*/
    if (this.state.deviceInfo == null)
        return 0;

    if (!this.state.deviceInfo.total_time)
      return 0;
      
    try { 
        //rst = this.timeToInt(this.state.playlist.items[this.getCurrentTrack() - 1].total_time);
        rst = this.timeToInt(this.state.deviceInfo.total_time);
    } catch(err) {
        console.log(err);
        rst = 0;
    }
    
    if(rst)
      return rst;
    else
      return 0;
  }

  getCurtTotalTime() {
    let rst;
    /*if (this.state.playlist.items[this.getCurrentTrack() - 1] == null)
      return 0;*/
    if (!this.state.deviceInfo.total_time)
      return 0;
      
    try { 
        //rst = this.state.playlist.items[this.getCurrentTrack() - 1].total_time;
        rst = this.state.deviceInfo.total_time;
    } catch(err) {
        console.log(err);
        rst = 0;
    }
    
    if(rst)
      return rst;
    else
      return 0;
    //return this.state.playlist.items[this.state.playlist.curr_track - 1].total_time;
  }

  getCurrPlayType() {
    let rst;
    /*if (this.state.playlist.items[this.getCurrentTrack() - 1] == null)
      return 0;*/
    if (this.state.deviceInfo == null)
      return 0
      
    try { 
        //rst = this.state.playlist.items[this.getCurrentTrack() - 1].type;
        rst = this.state.deviceInfo.file_type;
    } catch(err) {
        console.log(err);
        rst = 0;
    }
    
    if(rst)
      return rst;
    else
      return 0;
  }

  deletePlayListClick() {
    let curDevId = this.state.deviceInfo.id;
    let listTitle = this.state.deviceInfo.list_title;
    let playApp = this.state.deviceInfo.play_app;
    MainActions.deletePlayList(curDevId,listTitle,playApp);

    this.delPlFlag = true;
    this.isDropflag = false;
    this.delTrackFlag = false;
    this.scrollBottomCount = 2;

    this.setState({
      playlist: null,
      isOpenedFlag: true,
    });
    this.clearProgressTime();
    this.handleFlipClick(false);
    ReactTooltip.hide();
  }

  angleUpClick() {
    //console.log('Click angle-up!!!!!!!!!!!!!!!');
    this.setState({
      isOpenedFlag: !this.state.isOpenedFlag
    })
  }

  muteClick() {
    if (+this.state.volume === 0) {
      this.setState({
        volume: this.state.lastVolume
      })
      this.afterVolChange(this.state.lastVolume);
    } else {
      this.setState({
        lastVolume: this.state.volume,
        volume: 0
      })
      this.afterVolChange(0);
    }
  }

  enterVolBarHandle(v) {
    this.isVolBarEnter = v;
  }

  renderVolumeSlider() {
    let speakerIconSrc = '';
    if (+this.state.volume === 0) {
      speakerIconSrc = 'img/control_btn/mute_1.svg';
    } else {
      speakerIconSrc = 'img/control_btn/voice_1_max.svg';
    }
    let adjStyle = this.state.flipState ? {bottom: '100px'} : {top: '-40px'};
    let dStyle = {
      position:'absolute',
      ...adjStyle,
      width:'180px',
      height:'36px',
      ...style.flexCenter,
      left:'73px'
    };
    return (
      <div
        style={dStyle}
        onMouseEnter={this.enterVolBarHandle.bind(this,true)}
        onMouseLeave={this.enterVolBarHandle.bind(this,false)}
      >
        <div
          className='arrow_box_volBtn'
          style={{
            ...style.flexCenter,
            width:'100%',
            height:'100%'
          }}
        >
          <img draggable="false" src={speakerIconSrc} onClick={this.muteClick.bind(this)} />
          <div style={{width:'130px',marginLeft:'5px'}}>
            <RcSlider 
              value={+this.state.volume} 
              min={0} 
              max={100} 
              //vertical={true} 
              onChange={this.onVolChange.bind(this) } 
              onAfterChange={this.afterVolChange.bind(this) } 
            />
          </div>
        </div>
      </div>
    )
  }

  renderClearPlaylistButton() {
    return this.isDropflag
    ? null
    : (
      <button
        key="clearPlaylistBtn"
        data-tip={lang.getLang('Clear playlist')}
        onClick={this.deletePlayListClick.bind(this)}
        className='clearPlaylistBtn'
      >
      </button>
    );
  }

  onProgressChange(v) {
    if (this.getPlayState() === 'PLAY' || this.getPlayState() === 'PAUSE') {
      if (this.state.progressTime != +v) {
        this.setState({
          progressTime: +v,
        });
      }
    }
  }

  afterProgressChange(v) {
    if (this.getPlayState() === 'PLAY' || this.getPlayState() === 'PAUSE') {
      let timeStr = this.intToTime(v);
      let curDevId = this.state.deviceInfo.id;
      console.log("afterProgressChange",v,timeStr);
      MainActions.seekTime(curDevId, timeStr);
    }
    /*setTimeout(()=>{
      this.updateFlag = true;
    },6000);*/
    
  }

  beforeProgressChange(v) {
    //this.updateFlag = false;
    this.changePgTimeFlag = false;
  }

  getCurtTimeStr() {
    let curtTimeStr = this.getCurtTime();
    curtTimeStr = curtTimeStr.substring(0,2) === '00' ? curtTimeStr.substring(3) : curtTimeStr;
    return curtTimeStr;
  }

  getTotalTimeStr() {
    let totalTimeStr = this.getCurtTotalTime();
    if (totalTimeStr===0)
      return '';
    totalTimeStr = totalTimeStr.substring(0,2) === '00' ? totalTimeStr.substring(3) : totalTimeStr;
    return totalTimeStr;
  }

  getItemTitle() {
    var playState = this.getPlayState();
    let inUseStates = {
      PLAY: true,
      PAUSE: true,
    };
    let ifPlaying = inUseStates[ playState ] || false;
    let rst = ifPlaying
      ? this.state.deviceInfo.title
      : '';
    return rst;
  }

  renderDeviceIcon(){
    const streamingStatus = this.getStreamingStatus();
    if (this.state.updateIconIndex === null) {
      return (<img draggable="false" src='' style={{...style.deviceIconImg, border:'0'}} />)
    }
    if(streamingStatus === 'STREAM'){
      return (<img draggable="false" src={deviceIcon[this.state.iconIndex]} style={style.deviceIconImg} />)
    }else{
      return (<img draggable="false" src={deviceIcon_d[this.state.iconIndex]} style={style.deviceIconImg} />)
    }
  }

  handleFlipClick(v) {  // true: Back; false: Front;
    if (this.flipContainer !== null && this.flipContainer !== undefined) {
      var isIE = /*@cc_on!@*/false || !!document.documentMode;
      var isEdge = !isIE && !!window.StyleMedia;

      if (isIE || isEdge) { // Special thanks to IE and Edge
        if (this.flipContainer.className === "flip-container flipIE flip") {
          if (!v) {
            this.flipContainer.classList.toggle('flipIE');
            this.flipContainer.classList.toggle('flip');
          }
        } else {
          if (v) {
            this.flipContainer.classList.toggle('flipIE');
            this.flipContainer.classList.toggle('flip');
          }
        }
      } else {  // Other mighty browsers
        if (this.flipContainer.className === "flip-container flip") {
          if (!v) {
            this.flipContainer.classList.toggle('flip');
          }
        } else {
          if (v) {
            this.flipContainer.classList.toggle('flip');
          }
        }
      }

      
      this.setState({
        flipState: v
      });
      if (v) {
        const obj = this.scrollBarObj.refs.scrollbars;
        let clHeight = obj.getClientHeight();
        let sTop = this.getScrollTop(clHeight, 1);
        //console.log('clHeight:',clHeight,'sTop:',sTop);
        obj.scrollTop(sTop);
      }
    }
  }

  getScrollTop(clHeight, pDif) {
    let currTrack = this.getCurrentTrack();
    let sTop = 0;
    if (currTrack>6) {
      let diffPar = Math.floor(clHeight/100) + pDif;
      sTop = currTrack > 0 ? (currTrack-diffPar)*49 : 0;
    }
    return sTop;
  }

  renderVtBarAry() {
    let ary = [];
    const num = 30;
    for (let i=0; i<num; i++) {
      let delayStr = i * 0.25 + 's';
      ary.push(<div class="vt-bar" style={{animationDelay: delayStr}}></div>)
    }
    return ary;
  }

  renderSendingAniCircle() {
    let d1Style = {
      position:'relative',
      width: '140px',
      height: '140px',
      overflow:'hidden',
      ...style.flexCenter,
      backgroundColor:'#171F34',
      borderRadius:'50%',
      boxShadow:'0 0 20px #FFF'
    };

    let d2Style = {
      position:'absolute',
      left: '10px',
      top: '10px',
      width: '120px',
      height:'120px',
      backgroundColor:'#0E1421',
      borderRadius:'50%'
    };
    
    let dStyle = {
      position:'absolute',
      left: '0',
      top: '0',
      fontSize:'16px',
      color:'#FFF',
      width:'100%',
      height:'100%',
      ...style.flexCenter,
    };
    return (
      <div style={d1Style}>
        <div style={d2Style}></div>
        <div style={style.anim7}></div>
        <div style={dStyle}>{lang.getLang('Sending')}</div>
      </div>
    )
  }

  renderWaveAnimation() {
    let playState = this.getPlayState();
    let animationDisplay = playState === 'PLAY' && this.state.playlist !== null  ? 'flex' : 'none';
    return (
      <div 
        style={{
          position:'absolute',
          width:'100%',
          height:'138px',
          top:'30px',
          zIndex:'-1',
          display:animationDisplay,
          justifyContent:'center',
          alignItems:'center',
          msFlexAlign: 'center',
          msFlexPack: 'center',
          opacity: '0.5'
        }}
      >
        <div class="vt-bar" style={{animationDelay:'0s',height: '6%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.25s',height: '7%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.5s',height: '8%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.75s',height: '9%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.5s',height: '10%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.75s',height: '11%'}}></div>
        <div class="vt-bar" style={{animationDelay:'1s',height: '12%'}}></div>
        <div class="vt-bar" style={{animationDelay:'1.25s',height: '13%'}}></div>
        <div class="vt-bar" style={{animationDelay:'1.5s',height: '14%'}}></div>
        <div class="vt-bar" style={{animationDelay:'1.75s',height: '15%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2s',height: '16%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.25s',height: '17%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.5s',height: '18%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3s',height: '19%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.5s',height: '20%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.7s',height: '20%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.5s',height: '19%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.75s',height: '18%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.5s',height: '17%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.25s',height: '16%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.5s',height: '15%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4s',height: '14%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.75s',height: '13%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.5s',height: '12%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.25s',height: '11%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3s',height: '10%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.75s',height: '9%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.5s',height: '8%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.25s',height: '7%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2s',height: '6%'}}></div>
      </div>
    )
  }

  renderTrackInfo(flag) { //*** Front: true; Back: false */
    let divClassName = flag ? 'trackInfoDiv' : '';
    let trackInfo = this.delPlFlag || this.isDropflag
    if (this.delPlFlag || this.isDropflag) {
      trackInfo = (
        <div className={divClassName} style={{textAlign: 'center',color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>
          <p style={{margin:'0 0 0 0'}}>-- / --</p>
        </div>
      );
    } else {
      let pStyle = this.state.playlist === null
        ? {textAlign: 'center', color:'rgba(255,255,255,0.4)', fontSize:'12px', margin:'0 0 0 0'}
        : {margin:'0 0 0 0', cursor:'pointer', fontSize:'12px'};
      let pClickFunc = this.state.playlist === null
        ? null
        : this.handleFlipClick.bind(this,flag);
      trackInfo = (
        <div className={divClassName} style={style.flexCenter}>
          {
            this.ifShowDotLoading()
            ? (
              <div style={{...style.flexCenter,marginRight:'10px'}}>
                <div class="object object_three" style={{marginRight:'5px'}}></div>
                <div class="object object_two" style={{marginRight:'5px'}}></div>
                <div class="object object_one"></div>
              </div>
            ) : null
          }

          <p
            className='trackInfoP'
            style={pStyle}
            onClick={pClickFunc}
            data-tip={lang.getLang('Current Playlist')}
          >
            {this.state.deviceInfo.curr_track} / {this.state.deviceInfo.total_track}
          </p>

          {
            this.ifShowDotLoading()
            ? (
              <div style={{...style.flexCenter,marginLeft:'10px'}}>
                <div class="object object_one" style={{marginRight:'5px'}}></div>
                <div class="object object_two" style={{marginRight:'5px'}}></div>
                <div class="object object_three"></div>
              </div>
            ) : null
          }
        </div>
      );
    }
    return trackInfo;
  }

  imgOnError(e) {
    let playType = this.getCurrPlayType();
    let fileType = {
        audio: 'img/file_type_icons/utilRequest-music.png',
        video: 'img/file_type_icons/utilRequest-video.png',
        photo: 'img/file_type_icons/utilRequest-photo.png',
    };
    let dThumbSrc = fileType[playType];
    e.target.src = dThumbSrc;
}

  renderCoverImage() {
    let coverImage;
    let playState_audio = this.getPlayState() === 'PLAY' ? 'running' : 'paused';
    let playAnimationClass = '';
    let imageBorderRadius = '';
    let videoDivDisplay = 'none';
    let thumbUrl = this.getThumb();
    let playState = this.getPlayState();
    this.getMeta(thumbUrl,this.setThumbWidth.bind(this));

    if (this.state.playlist != null ) {
      let playType = this.getCurrPlayType();
      let fileType = {
        audio: 'div_video_animation01',
        video: '',
        photo: '',
      };
      playAnimationClass = fileType[ playType ] || '';
      this.thumbWidth = playAnimationClass === fileType.audio ? {width:'130px',height:'130px'} : this.thumbWidth;
      imageBorderRadius = playAnimationClass === fileType.audio ? '50%' : '0';
      videoDivDisplay = playType === 'video' && this.getPlayState() === 'PLAY' && !this.isDropflag ? 'block' : 'none';
      //imageBorderRadius = '50%';
    } else {
      thumbUrl = 'img/control_btn/status_icon/nodata.svg';
      playAnimationClass = '';
      this.getMeta(thumbUrl,this.setThumbWidth.bind(this));
    }
    playAnimationClass = this.isDropflag ? 'div_video_animation01' : playAnimationClass;
    imageBorderRadius = this.isDropflag ? '50%' : imageBorderRadius;

    if (this.state.playlist === null || playState === 'STOP') {
      if (this.delPlFlag || this.isDropflag) {
        coverImage = this.renderSendingAniCircle();
      } else {
        coverImage = (
          <div
            style={{
              width: '140px',
              height: '140px',
              overflow:'hidden',
              ...style.flexCenter,
            }}
          >
            <img draggable="false" src='img/control_btn/status_icon/nodata.svg' style={{height: '90px'}} />
          </div>
        );
      }
    } else if (this.isDropflag) {
      coverImage = this.renderSendingAniCircle();
    } else {
      let playType = this.getCurrPlayType();
      let boxShadowStyle = {};
      let imgObj = null;
      if (playType === 'audio') {
        imgObj = (
          <div
            className={playAnimationClass}
            style={{
              position:'relative',
              width: '140px',
              height: '140px',
              overflow:'hidden',
              ...style.flexCenter,
              animationPlayState:playState_audio,
              ...boxShadowStyle
            }}
          >
            { this.thumbWidth === null || thumbUrl === '' 
              ? (
                <img
                  draggable="false"
                  src='img/file_type_icons/utilRequest-music.png'
                  style={{
                    width:'130px',
                    height:'130px',
                    borderRadius: imageBorderRadius,
                    border: 0,
                    boxShadow: 'rgba(0,0,0,0.8) 0 0 10px'
                  }}
                />
              ) : (
                <img
                  draggable="false"
                  src={ thumbUrl }
                  style={{
                    width:'130px',
                    height:'130px',
                    borderRadius: imageBorderRadius,
                    border: 0,
                    boxShadow: 'rgba(0,0,0,0.8) 0 0 10px'
                  }}
                  onError={this.imgOnError.bind(this)}
                />
              )
            }
            <div className='shineDiv' style={{display: videoDivDisplay}}></div>
          </div>
        )
      } else {
        boxShadowStyle = {boxShadow: 'rgba(0,0,0,0.8) 0 0 10px'};
        let imgVideo = null;
        if (thumbUrl === '') {
          if (playType === 'video') {
            imgVideo = (
              <img
                draggable="false"
                src='img/file_type_icons/utilRequest-video.png'
                style={{width:'130px',height:'130px',border: 0}}
              />
            );
          } else if (playType === 'photo') {
            imgVideo = (
              <img
                draggable="false"
                src='img/file_type_icons/utilRequest-photo.png'
                style={{width:'130px',height:'130px',border: 0}}
              />
            );
          }
          
        } else {
          if (this.thumbWidth === null) {
            imgVideo = (
              <img
                draggable="false"
                src={ thumbUrl }
                style={{maxHeight:'130px',minHeight:'130px', border: 0}}
                onError={this.imgOnError.bind(this)}
              />
            )
          } else {
            imgVideo = (
              <img
                draggable="false"
                src={ thumbUrl }
                style={{...this.thumbWidth, height: 'auto', width: 'auto', border: 0}}
                onError={this.imgOnError.bind(this)}
              />
            )
          }
        }
        imgObj = (
          <div 
            style={{
              position: 'relative',
              width: '130px',
              height: '130px',
              margin: '5px',
              overflow: 'hidden',
              ...style.flexCenter,
              ...boxShadowStyle
            }}
          >
            {imgVideo}
            <div className='shineDiv' style={{display: videoDivDisplay}}></div>
          </div>
        );
      }
      coverImage = imgObj;
    }

    return coverImage;
  }

  renderStopBtnDiv() {
    let stopLoadingDisplay = this.getIfStopLoading() ? 'block' : 'none';
    let rst;
    if (this.isDropflag) {
      rst = (
        <button
          key="stopBtn"
          className='stopBtnDis'
          style={{marginRight:'15px'}}
          data-tip={lang.getLang('Stop')}
        />
      );
    } else {
      rst = (
        <div style={{position:'relative'}}>
          <button
            key="stopBtn"
            className={this.getStopStyle()}
            style={{marginRight:'15px'}}
            onClick={this.stopDevice.bind(this)}
            data-tip={lang.getLang('Stop')}
          />
          <div style={{...style.animBtn,display:stopLoadingDisplay}}></div>
        </div>
      )
    }
    return rst;
  }
  renderPlayPauseBtnDiv() {
    let playPauseLoadingDisplay = this.getIfPlayPauseLoading() ? 'block' : 'none';
    let rst;
    if (this.isDropflag) {
      rst = (
        <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} /> 
      );
    } else {
      rst = (
        <div style={{position:'relative'}}>
          <button
            key="playBtn"
            className={this.getPlayPause()}
            onClick={this.playOrResume.bind(this) }
            data-tip={this.getPlayPauseToolTip()}
          />
          <div style={{...style.animBtn,display:playPauseLoadingDisplay}}></div>
        </div>
      );
    }
    
    return rst;
  }

  renderStream() {
    var volumeSlider;
    var volumeBtn;
    let permissionStatus = this.getPermissionStatus();
    let noPermissionInfo = permissionStatus
      ? this.renderNotiImg()
      : null;

    if (this.state.deviceInfo.subtype == "Chromecast" || this.state.deviceInfo.subtype == "AirPlay") {
      volumeSlider = null;
      volumeBtn = (<button key="volBtn" className={this.getVolumeBtnStyle() } data-tip={lang.getLang('Msg26')} />)
    } else {
      volumeSlider = this.state.isVolBarOpen 
        ? this.renderVolumeSlider()
        : null;
      volumeBtn = (
        <button 
          id="volBtnProgress" 
          key="volBtn" 
          className={this.getVolumeBtnStyle()} 
          onClick={this.onClickMute.bind(this)} 
          data-tip={lang.getLang('Volume')} 
        />
      );
    }
    let vStyleDeviceItem2 = this.state.isOpenedFlag
      ? style.divDeviceItem2
      : {...style.divDeviceItem2,height:'calc(100% - 45px)'}
    
    let trackInfo = this.renderTrackInfo(true);
    let trackInfoBack = this.renderTrackInfo(false);
    
    let previousBtn;
    let nextBtn;
    let controlBtnPanel;
    let progressSlider;

    
    controlBtnPanel = (
      <div style={style.flexCenter}>
        {this.renderStopBtnDiv()}
        {this.renderPlayPauseBtnDiv()}
      </div>
    );
    
    if (this.isDropflag) {
      previousBtn = <img draggable="false" src='img/control_btn/previous_3.svg' />;
      nextBtn = <img draggable="false" src='img/control_btn/next_3.svg' />;
      
      volumeBtn = <button key="volBtn" className='volBtnDis' data-tip={lang.getLang('Volume')} />;
      volumeSlider = null;
      progressSlider = null;
      //thumbUrl = 'img/control_btn/status_icon/cd_stop.svg';
      //this.getMeta(thumbUrl,this.setThumbWidth.bind(this));
    } else {
      const streamingStatus = this.getStreamingStatus();
      if (streamingStatus === 'STOP') {
        previousBtn = <img draggable="false" src='img/control_btn/previous_3.svg' />;
        nextBtn = <img draggable="false" src='img/control_btn/next_3.svg' />;
      } else {
        previousBtn = 
          <button
            className={this.getPlayPreviousStyle()}
            onClick={this.clickPrev.bind(this)}
            data-tip={lang.getLang('Previous')}
          />;
        nextBtn = 
          <button
            className={this.getPlayNextStyle()}
            onClick={this.clickNext.bind(this)}
            data-tip={lang.getLang('Next')}
          />;
      }
      
      if (this.state.playlist === null) {
        progressSlider = null;
      } else {
        const streamingStatus = this.getStreamingStatus();
        let ifDisable = this.ifDisableProgressHandle() ? true : false;
        let maxValue = this.state.deviceInfo.file_type === 'photo'
          ? 10
          : this.getCurtTotalTimeInt();
        if (streamingStatus === 'STOP' && maxValue === 0) {
          maxValue = 1;
        }
        
        progressSlider = (
          <div 
            style={{
              paddingTop:'12px',
              ...style.flexCenter,
            }}
          >
            <p className="progressTimeText">{this.getCurtTimeStr()}</p>
            <div style={style.divProgressSlide}>
              <RcSlider
                value={this.state.progressTime}
                min={0}
                max={maxValue}
                onChange={this.onProgressChange.bind(this)}
                onAfterChange={this.afterProgressChange.bind(this)}
                onBeforeChange={this.beforeProgressChange.bind(this)}
                disabled={ifDisable}
              />
            </div>
            <p className="progressTimeText">{this.getTotalTimeStr()}</p>
          </div>
        );
      }
    }

    let controlBtnPanelBack = (
      <div 
        style={{...style.flexCenter, height:'65px'}}
      >
        {previousBtn}
        <div 
          style={{
            margin:'0 37px',
            height:'100%',
            ...style.flexCenter,
          }}
        >
          {this.renderStopBtnDiv()}
          {this.renderPlayPauseBtnDiv()}
        </div>
        {nextBtn}
      </div>
    );

    let dragStyle = this.state.isDragEnter
      ? style.dragEnterStyle
      : {};

    let playListBtn = null;
    if (permissionStatus) {
      playListBtn = null;
    } else {
      playListBtn = this.state.playlist === null
        ? (
          <button
            key='playListBtn'
            style={{position:'absolute', top:'10px',right:'10px'}}
            className="playListBtnDis"
            data-tip={lang.getLang('Current Playlist')}
          />
        ) : (
          <button
            key='playListBtn'
            onClick={this.handleFlipClick.bind(this,true)}
            style={{position:'absolute', top:'10px',right:'10px'}}
            className="playListBtn"
            data-tip={lang.getLang('Current Playlist')}
          />
        );
    }
    let hoverStyle = {
      true: {visibility:'visible',opacity:'1'},
      false: {visibility:'hidden',opacity:'0'},
    };
    let topPanelHover = (
      <div
        className='opacityTrans'
        style={{position:'absolute',width:'100%',...hoverStyle[this.state.isMouseOver]}}
      >
        <div style={{paddingBottom:'30px',height:'168px'}}>
          <div>
            <div
              style={{
                position:'relative',
                height:'44px',
                ...style.flexCenterA,
              }}
            >
              <img
                draggable="false"
                src={this.getNormalIcon() }
                className="devIconStyle"
                style={{margin:'0 10px 0 20px'}}
              />
              { this.renderNameDOM() }
              { playListBtn }
              { noPermissionInfo }
            </div>
          </div>

          <div>
            <div style={{display:'inline-block', width: '100%'}}>
              {this.renderDeviceIcon()}
              <div style={{display:'inline-block',verticalAlign:'middle'}}>
                <p className="mediaInfoTextStyle">{lang.getLang('User:')} {this.state.deviceInfo.play_owner}</p>
                <p className="mediaInfoTextStyle">{lang.getLang('Application:')} {this.getLinkApplication()}</p>   
              </div>
            </div>
            {controlBtnPanel}
          </div>
        </div>
      </div>
    );
    let playState = this.getPlayState();
    let vtBarAry = this.renderVtBarAry();
    let cln01 = this.state.playlist === null || permissionStatus
      ? "playListBtnDis"
      : "playListBtn";
    let topPanel = (
      <div style={{position:'absolute',width:'100%'}}>
        <div 
          className='opacityTrans' 
          style={{
            position: 'relative',
            ...style.flexCenter,
            flexDirection:'column',
            msFlexDirection:'column',
            height:'168px',
            ...hoverStyle[!this.state.isMouseOver]
          }}
        >
          <img
            draggable="false"
            src={this.getNormalIcon() }
            className="devIconStyle"
            style={{width:'40px',height:'40px'}}
          />
          { this.renderNameDOM() }
          <button
            key='playListBtn'
            style={{position:'absolute', top:'10px',right:'10px'}}
            className={cln01}
            data-tip={lang.getLang('Current Playlist')}
          />
        </div>
        {this.renderWaveAnimation()}
      </div>
    );

    let coverImage = this.renderCoverImage();
    let itemTitle;
    if (this.state.playlist === null || playState === 'STOP') {
      previousBtn = <img draggable="false" src='img/control_btn/previous_3.svg' />;
      nextBtn = <img draggable="false" src='img/control_btn/next_3.svg' />;
      itemTitle = (
        <p className="mediaInfoTextStyle" style={{height:'17px',maxWidth:'240px',display:'inline-block'}}></p>
      );
    } else if (this.isDropflag) {
      itemTitle = (
        <p className="mediaInfoTextStyle" style={{height:'17px',maxWidth:'240px',display:'inline-block'}}></p>
      );
    } else {
      itemTitle = (
        <p
          className="mediaInfoTextStyle"
          style={{height:'17px',maxWidth:'240px',display:'inline-block'}}
          data-tip={this.getItemTitle()}
        >
          {this.getItemTitle()}
        </p>
      );
    }

    let bottomPanel = (
      <div style={vStyleDeviceItem2}>
        {trackInfo}
        <div className='itemTitleDiv'>
          {itemTitle}
        </div>

        <div className='thumbDiv' style={style.flexCenter}>
          <div style={{marginRight:'15px'}}>
            {previousBtn}
          </div>

          {coverImage}

          <div style={{marginLeft:'15px'}}>
            {nextBtn}
          </div>
        </div>

        <div
          className='belowControBtnDiv'
          style={{...style.flexCenter,position:'relative'}}
        >
          { volumeBtn }
          { volumeSlider }
          <button
            key="repeatBtn"
            className={this.getRepeatBtnStyle()}
            onClick={this.clickRepeat.bind(this)}
            data-tip={lang.getLang('Repeat')}
          />
          { this.renderShuffleButton() }
          <img
            src='img/control_btn/more_0.svg'
            style={{width:'22px',height:'22px',marginLeft:'20px',visibility:'hidden'}}
          />
        </div>

        {/*Time Progress Bar */}
        {progressSlider}
        {/*Time Progress Bar */}
      </div>
    );

    let bottomPanelBack = (
      <div>
        <div style={{...style.flexCenter, paddingTop:'18px'}}>
          { volumeBtn }
          { volumeSlider }
          <button
            key="repeatBtn"
            className={this.getRepeatBtnStyle()}
            onClick={this.clickRepeat.bind(this)}
            data-tip={lang.getLang('Repeat')}
          />
          { this.renderShuffleButton() }
          <img
            src='img/control_btn/more_0.svg'
            style={{width:'22px',height:'22px',marginLeft:'20px',visibility:'hidden'}}
          />
        </div>
        {/*Time Progress Bar */}
        {progressSlider}
      </div>
    )

    let mmStyle = style.mmStyleFront;
    let mmStyleClassName;
    let way = null;
    //if (this.flipContainer !== null && this.flipContainer !== undefined) {
      if (this.state.flipState) {
        mmStyle = style.mmStyleBack;
        way = 1;
        mmStyleClassName = '';
      } else {
        mmStyle = style.mmStyleFront;
        way = 0;
        mmStyleClassName = 'mmStyleFrontTop';
      }
    //}
    
    let hoverStyleDi = this.state.isMouseOver ? style.deviceItemHoverStyle : style.deviceItemNoHoverStyle;

    return (
      <div
        style={{...style.divDeviceItem, ...dragStyle, ...hoverStyleDi}}
        onDragEnter={this.dragEnter.bind(this)}
        onDrop={this.drop.bind(this)}
        onDragOver={this.allowDrop}
        onDragLeave={this.dragLeave.bind(this)}
        data-dropflag={true}
        className="deviceItem_tv"
        onMouseEnter={this.itemMouseOver.bind(this)}
        onMouseLeave={this.itemMouseOut.bind(this)}
      >
        <div style={mmStyle} className={mmStyleClassName}>
          <MoreMenuDevice deviceInfo={this.state.deviceInfo} way={way} type='Thumb' />
        </div>
        
        <div class="flip-container" ref={(ele) => { this.flipContainer = ele; }}>
          <div class="flipper">
            {/******* FRONT *******/}
            <div class="front">
              <div style={{height:'168px'}}>
                {topPanel}
                {topPanelHover}
              </div>
              {bottomPanel}
            </div>
            {/******* BACK *******/}
            <div class="back">
              <div
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(26,30,48,0.15) 100%)',
                  ...style.flexCenterA,
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px'
                }}
              >
                <img
                  draggable="false"
                  src={this.getNormalIcon() }
                  className="devIconStyle"
                  style={{margin:'0 10px 0 20px'}}
                />
                { this.renderNameDOM() }
                <div style={{marginLeft:'auto',...style.flexCenterA}}>
                  { this.renderClearPlaylistButton() }
                  <button
                    key='coverBtn'
                    onClick={this.handleFlipClick.bind(this,false)}
                    style={{margin:'0 10px 0 7px'}}
                    className="coverBtn"
                    data-tip={lang.getLang('Back')}
                  />
                </div>
              </div>
              {controlBtnPanelBack}
              {trackInfoBack}
              <CustomScrollBar01
                style={{
                  height:'calc( 100% - 240px)', /* 44 + 65 + 114 + 17 */
                  display: 'block'
                }}
                className='detailList'
                onScroll={this.handleScroll.bind(this)}
                ref={(obj)=>{this.scrollBarObj=obj}}
              >
                { this.renderListDetail() }
              </CustomScrollBar01>
              { bottomPanelBack }
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderTopPanelNoStream() {
    let hoverStyle = {
      true: {visibility:'visible',opacity:'1'},
      false: {visibility:'hidden',opacity:'0'},
    };
    return (
      <div
        className='opacityTrans'
        style={{position:'absolute',width:'100%',...hoverStyle[!this.state.isMouseOver]}}
      >
        <div
          style={{
            position: 'relative',
            ...style.flexCenter,
            flexDirection:'column',
            msFlexDirection:'column',
            height:'168px'
          }}
        >
          <img
            draggable="false"
            src={ this.getNormalIcon() }
            className="devIconStyle"
            style={{width:'40px',height:'40px'}}
          />
          { this.renderNameDOM() }
        </div>
      </div>
    );
  }

  renderNoStream1() {
    var linkApplication = this.getLinkApplication();
    let noPermissionInfo = this.getPermissionStatus() ? this.renderNotiImg() : null;

    let dragStyle = this.state.isDragEnter
      ? style.dragEnterStyle
      : {};
    
    let controlBtnPanel = (
      <div style={style.flexCenterJ}>
        <button key="stopBtn" className='stopBtnDis' style={{marginRight:'15px'}} data-tip={lang.getLang('Stop')} />
        <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} /> 
      </div>
    );

    let hoverStyle = {
      true: {visibility:'visible',opacity:'1'},
      false: {visibility:'hidden',opacity:'0'},
    };

    let topPanelHover = (
      <div className='opacityTrans' style={{position:'absolute',width:'100%',...hoverStyle[this.state.isMouseOver]}}>
        <div style={{paddingBottom:'30px',height:'168px'}}>
          <div>
            <div
              style={{
                height:'44px',
                ...style.flexCenterA,
                position:'relative'
              }}
            >
              <img
                draggable="false"
                src={ this.getNormalIcon() }
                className="devIconStyle"
                style={{margin:'0 10px 0 20px'}}
              />
              { this.renderNameDOM() }
              { noPermissionInfo }
            </div>
          </div>

          <div>
            <div style={{display:'inline-block', width: '100%'}}>
              {this.renderDeviceIcon()}
              <div style={{display:'inline-block',verticalAlign:'middle'}}>
                <p
                  className="mediaInfoTextStyle"
                  style={{color:'rgba(255,255,255,0.4)'}}
                >
                  {lang.getLang('User:')} {this.state.deviceInfo.play_owner}
                </p>
                <p
                  className="mediaInfoTextStyle"
                  style={{color:'rgba(255,255,255,0.4)'}}
                >
                  {lang.getLang('Application:')} {this.getLinkApplication()}
                </p>   
              </div>
            </div>
            {controlBtnPanel}
          </div>
        </div>
      </div>
    );

    let topPanel = this.renderTopPanelNoStream();

    let hoverStyleDi = this.state.isMouseOver ? style.deviceItemHoverStyle : style.deviceItemNoHoverStyle;

    return (
      <div 
        style={{...style.divDeviceItem, ...dragStyle,...hoverStyleDi}}
        onDragEnter={this.dragEnter.bind(this)} 
        onDrop={this.drop.bind(this)} 
        onDragOver={this.allowDrop} 
        onDragLeave={this.dragLeave.bind(this)} 
        data-dropflag={true} 
        className="deviceItem_tv"
        onMouseEnter={this.itemMouseOver.bind(this)}
        onMouseLeave={this.itemMouseOut.bind(this)}
      >

        <div style={{height:'168px'}}>
          {topPanel}
          {topPanelHover}
        </div>

        {this.renderNullPanelBelow()}

      </div>
    );
  }

  renderNullPanelBelow() {

    let trackInfo = (
      <div className='trackInfoDiv' style={{textAlign: 'center',color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>
        <p style={{margin:'0 0 0 0',color:'rgba(0,0,0,0)'}}>-- / --</p>
      </div>
    );

    return (
      <div style={style.divDeviceItem2}>
        {trackInfo}
          <div className='itemTitleDiv'>
            <p className="mediaInfoTextStyle" style={{height:'17px',display:'inline-block'}}></p>
          </div>

          <div className='thumbDiv' style={style.flexCenter}>
            <div 
              style={{
                width: '140px',
                height: '140px',
                overflow:'hidden',
                ...style.flexCenter,
              }}
            >
              <img draggable="false" src='img/control_btn/status_icon/nodata.svg' style={{height: '90px'}} />
            </div>
          </div>

          <div 
            className='belowControBtnDiv' 
            style={style.flexCenter}
          >
            <div style={{position:'relative'}}>
              <button key="volBtn" className='volBtnDis' data-tip={lang.getLang('Volume')} />
              <button 
                key="repeatBtn"
                className='repeatOffBtn'
                style={{cursor:'default'}}
                data-tip={lang.getLang('Repeat')}
              />
              <button key="shuffleBtn" className='shuffleOffBtn' data-tip={lang.getLang('Shuffle')} />
            </div>
            <MoreMenuDevice deviceInfo={this.state.deviceInfo} status='NOSTREAM' type='Thumb' />
          </div>
          <div className='thumbDiv' style={style.flexCenter}>
            <p style={style.ddFilesP}>
              {lang.getLang('DDFilesHere')}
            </p>
          </div>
      </div>
    )
  }

  renderSwitchPlayPanelBelow() {
    
        let trackInfo = (
          <div className='trackInfoDiv' style={{textAlign: 'center',color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>
            <p style={{margin:'0 0 0 0',color:'rgba(0,0,0,0)'}}>-- / --</p>
          </div>
        );
    
        return (
          <div style={style.divDeviceItem2}>
            {trackInfo}
              <div className='itemTitleDiv'>
                <p className="mediaInfoTextStyle" style={{height:'17px',display:'inline-block'}}></p>
              </div>
    
              <div className='thumbDiv' style={style.flexCenter}>
                <div style={{marginRight:'15px'}}>
                  <img draggable="false" src='img/control_btn/previous_3.svg' />
                </div>
    
                {this.renderSendingAniCircle()}
    
                <div style={{marginLeft:'15px'}}>
                  <img draggable="false" src='img/control_btn/next_3.svg' />
                </div>
              </div>
    
              <div 
                className='belowControBtnDiv'
                style={style.flexCenter}
              >
                <div style={{position:'relative'}}>
                  <button key="volBtn" className='volBtnDis' data-tip={lang.getLang('Volume')} />
                  <button
                    key="repeatBtn"
                    className='repeatOffBtn'
                    style={{cursor:'default'}}
                    data-tip={lang.getLang('Repeat')}
                  />
                  <button key="shuffleBtn" className='shuffleOffBtn' data-tip={lang.getLang('Shuffle')} />
                </div>
                <MoreMenuDevice deviceInfo={this.state.deviceInfo} status='NOSTREAM' type='Thumb' />
              </div>
          </div>
        )
      }

  renderSwitchPlaySending() {
    var linkApplication = this.getLinkApplication();
    let noPermissionInfo = this.getPermissionStatus() ? this.renderNotiImg() : null;

    let dragStyle = this.state.isDragEnter
      ? style.dragEnterStyle
      : {};
    
    let controlBtnPanel = (
      <div style={style.flexCenterJ}>
        <button key="stopBtn" className='stopBtnDis' style={{marginRight:'15px'}} data-tip={lang.getLang('Stop')} />
        <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} /> 
      </div>
    );

    let hoverStyle = {
      true: {visibility:'visible',opacity:'1'},
      false: {visibility:'hidden',opacity:'0'},
    };

    let topPanelHover = (
      <div className='opacityTrans' style={{position:'absolute',width:'100%',...hoverStyle[this.state.isMouseOver]}}>
        <div style={{paddingBottom:'30px',height:'168px'}}>
          <div>
            <div 
              style={{
                height:'44px',
                ...style.flexCenterA,
                position:'relative'
              }}
            >
              <img
                draggable="false"
                src={ this.getNormalIcon() }
                className="devIconStyle"
                style={{margin:'0 10px 0 20px'}}
              />
              { this.renderNameDOM() }
              { noPermissionInfo }
            </div>
          </div>

          <div>
            <div style={{display:'inline-block', width: '100%'}}>
              {this.renderDeviceIcon()}
              <div style={{display:'inline-block',verticalAlign:'middle'}}>
                <p className="mediaInfoTextStyle" style={{color:'rgba(255,255,255,0.4)'}}>
                  {lang.getLang('User:')} {this.state.deviceInfo.play_owner}
                </p>
                <p className="mediaInfoTextStyle" style={{color:'rgba(255,255,255,0.4)'}}>
                  {lang.getLang('Application:')} {this.getLinkApplication()}
                </p>   
              </div>
            </div>
            {controlBtnPanel}
          </div>
        </div>
      </div>
    );

    let topPanel = this.renderTopPanelNoStream();

    let hoverStyleDi = this.state.isMouseOver ? style.deviceItemHoverStyle : style.deviceItemNoHoverStyle;

    return (
      <div 
        style={{...style.divDeviceItem, ...dragStyle,...hoverStyleDi}}
        onDragEnter={this.dragEnter.bind(this)} 
        onDrop={this.drop.bind(this)} 
        onDragOver={this.allowDrop} 
        onDragLeave={this.dragLeave.bind(this)} 
        data-dropflag={true} 
        className="deviceItem_tv"
        onMouseEnter={this.itemMouseOver.bind(this)}
        onMouseLeave={this.itemMouseOut.bind(this)}
      >

        <div style={{height:'168px'}}>
          {topPanel}
          {topPanelHover}
        </div>

        {this.renderSwitchPlayPanelBelow()}

      </div>
    );
  }

  renderMusicStationInUse() {
    var isInWindow = (window.parent == window) ? true : false;
    var str = lang.getLang('Msg14');
    var res = str.split("Music Station");
    var link = isInWindow
    ? "Music Station"
    : (<a style={{cursor:'pointer'}} onClick={this.openMusicStation.bind(this)}>Music Station</a>);

    let noPermissionInfo = this.getPermissionStatus() ? this.renderNotiImg() : null;

    let dragStyle = this.state.isDragEnter
      ? style.dragEnterStyle
      : {};

    return (
      <div 
        style={{...style.divDeviceItem, ...dragStyle}}
        onDragEnter={this.dragEnter.bind(this)} 
        onDrop={this.drop.bind(this)} 
        onDragOver={this.allowDrop} 
        onDragLeave={this.dragLeave.bind(this)} 
        data-dropflag={true} 
        className="deviceItem_tv"
      >
        <div style={{height:'45px'}}>
          <div 
            style={{
              padding:'7px 0 8px 20px',
              ...style.flexCenterA,
              position:'relative'
            }}
          >
            <img draggable="false" src={this.getNormalIcon() } className="devIconStyle" />
            { this.renderNameDOM() }
            { noPermissionInfo }
          </div>
        </div>
        
        <div style={{height:'125px'}}>
              <div style={{display:'inline-block', width: '100%'}}>
                {this.renderDeviceIcon()}
                <p className="mediaInfoTextStyle">{lang.getLang('User:')} {this.state.deviceInfo.play_owner}</p>
                <p className="mediaInfoTextStyle">{lang.getLang('Application:')} {this.getLinkApplication()}</p>   
              </div>
              
              <div style={{marginTop:'10px', textAlign: 'center'}}>
                <button
                  key="stopBtn"
                  className='stopBtnDis'
                  style={{marginRight:'20px'}}
                  data-tip={lang.getLang('Stop')}
                />
                <button key="playBtn" className='playBtnDis'  data-tip={lang.getLang('Play')} />
              </div>

              <div style={{marginTop: '20px',textAlign: 'center',color:'#ffffff',fontSize:'12px'}}>
                <p>{this.state.deviceInfo.curr_track} / {this.state.deviceInfo.total_track}</p>
              </div>
          </div>
            
          <div style={style.divDeviceItem2}>
                <div style={{padding:'20px 20px 0 20px', textAlign:'center',height:'43px'}}>
                  <p className="mediaInfoTextStyle" style={{height:'17px',display:'inline-block'}}></p>
                </div>

                <div style={style.flexCenter}>
                  <div 
                    style={{
                      width: '140px',
                      height: '120px',
                      overflow:'hidden',
                      ...style.flexCenter,
                    }}
                  >
                    <img draggable="false" src='img/control_btn/device_occupy.svg' style={{height: '120px'}} />
                  </div>
                </div>

                <div style={{marginTop:'8px', display: 'flex', flexDirection:'column',msFlexDirection:'column'}}>
                  <p style={{color:'#FFFFFF',margin:'auto',width:'280px',textAlign:'center',fontSize:'14px'}}>
                    {lang.getLang('Msg13')}
                  </p>
                  <p style={{color:'#FFFFFF',margin:'auto',width:'280px',textAlign:'center',fontSize:'14px'}}>
                    {res[0]}{link}{res[1]}
                  </p>
                </div>

                <div style={{marginTop:'18px',...style.flexCenter}}>
                  <div style={{position:'relative'}}>
                    <button key="volBtn" className='volBtnDis' data-tip={lang.getLang('Volume')} />
                    <button
                      key="repeatBtn"
                      className='repeatOffBtn'
                      style={{cursor:'default'}}
                      data-tip={lang.getLang('Repeat')}
                    />
                    <button key="shuffleBtn" className='shuffleOffBtn' data-tip={lang.getLang('Shuffle')} />
                  </div>
                  <MoreMenuDevice deviceInfo={this.state.deviceInfo} status='NOSTREAM' type='Thumb' />
                </div>
          </div>
        
      </div>
    );
  }

  openMusicStation() {
    var obj = MainStore.getCheckDep();
		var itemsAry = obj.items;
		var availableFlag = false;
		itemsAry.forEach(function(item,i){
			if (item.name == "MusicStation") {
				if (item.enabled == "1" && item.installed == "1") {
          availableFlag = true;
        }
			}
		});
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
  }

  renderOtherUser1(v) {

    let hintDiv = null;
    let controlBtnPanel = null;
    let ddFileDiv = null;

    let d1OnDragEnter = null;
    let d1OnDrop = null;
    let d1OnDragOver = null;
    let d1OnDragLeave = null;
    let d1DataDropflag = false;
    switch(v) {
      case 'OTHERUSER': {
        let str = lang.getLang('Msg23');
        let res = str.split("%user");
        hintDiv = (
          <div style={{marginTop:'8px', ...style.flexCenter}}>
            <p style={{color:'#FFF',margin:'0 20px',textAlign:'center',fontSize:'14px'}}>
              {res[0]}{this.state.deviceInfo.play_owner}{res[1]}
            </p>
          </div>
        );
        controlBtnPanel = (
          <div style={style.flexCenter}>
            {this.renderStopBtnDiv()}
            {this.renderPlayPauseBtnDiv()}
          </div>
        );
        ddFileDiv = ( 
          <div className='thumbDiv' style={style.flexCenter}>
            <p style={style.ddFilesP}>
              {lang.getLang('DDFilesHere')}
            </p>
          </div>
        );
        d1OnDragEnter = this.dragEnter.bind(this);
        d1OnDrop = this.drop.bind(this);
        d1OnDragOver = this.allowDrop;
        d1OnDragLeave = this.dragLeave.bind(this);
        d1DataDropflag = true;
        break;
      }
      case 'OCEANKTV': {
        var isInWindow = (window.parent == window) ? true : false;
        var str = lang.getLang('Msg12');
        var res = str.split("OceanKTV");
        var url = MainActions.getCgiOrigin() + '/apps/OceanKTVConsole/';
        var link = isInWindow ? "OceanKTV" : (<a style={{cursor:'pointer'}} href={url} target="_blank">OceanKTV</a>);
        hintDiv = (
          <div style={{marginTop:'8px', ...style.flexCenter, flexDirection:'column',msFlexDirection:'column'}}>
            <p style={{color:'#FFFFFF',margin:'auto',width:'280px',textAlign:'center',fontSize:'14px'}}>
              {lang.getLang('Msg11')}
            </p>
            <p style={{color:'#FFFFFF',margin:'auto',width:'280px',textAlign:'center',fontSize:'14px'}}>
              {res[0]}{link}{res[1]}
            </p>
          </div>
        );
        controlBtnPanel = (
          <div style={style.flexCenterJ}>
            <button
              key="stopBtn"
              className='stopBtnDis'
              style={{marginRight:'15px'}}
              data-tip={lang.getLang('Stop')}
            />
            <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} />
          </div>
        );
        break;
      }
      case 'HDMI_OCCUPIED_BY_HDPLAYER': {
        var isInWindow = (window.parent == window) ? true : false;
        let str = lang.getLang('MsgA3');
        str = str.replace(/%app_name/g, this.state.deviceInfo.inuse_apps);
        str = str.replace('%device_name', this.getName());
        hintDiv = (
          <div style={{marginTop:'8px', ...style.flexCenter, flexDirection:'column',msFlexDirection:'column'}}>
            <p style={{color:'#FFFFFF',margin:'auto',width:'280px',textAlign:'center',fontSize:'14px'}}>
              { str }
            </p>
          </div>
        );
        controlBtnPanel = (
          <div style={style.flexCenterJ}>
            <button
              key="stopBtn"
              className='stopBtnDis'
              style={{marginRight:'15px'}}
              data-tip={lang.getLang('Stop')}
            />
            <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} />
          </div>
        );
        break;
      }
      case 'HDMI_OCCUPIED_BY_HDSTATION': {
        var isInWindow = (window.parent == window) ? true : false;
        hintDiv = (
          <div style={{marginTop:'8px', ...style.flexCenter, flexDirection:'column',msFlexDirection:'column'}}>
            <p style={{color:'#FFFFFF',margin:'auto',width:'280px',textAlign:'center',fontSize:'14px'}}>
              { lang.getLang('MsgA4') }
            </p>
          </div>
        );
        controlBtnPanel = (
          <div style={style.flexCenterJ}>
            <button
              key="stopBtn"
              className='stopBtnDis'
              style={{marginRight:'15px'}}
              data-tip={lang.getLang('Stop')}
            />
            <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} />
          </div>
        );
        break;
      }
    }

    let noPermissionInfo = this.getPermissionStatus() ? this.renderNotiImg() : null;

    let dragStyle = this.state.isDragEnter
    ? style.dragEnterStyle
    : {};

    let hoverStyle = {
      true: {visibility:'visible',opacity:'1'},
      false: {visibility:'hidden',opacity:'0'},
    };

    let topPanelHover = (
      <div className='opacityTrans' style={{position:'absolute',width:'100%',...hoverStyle[this.state.isMouseOver]}}>
        <div style={{paddingBottom:'30px',height:'168px'}}>
          <div>
            <div 
              style={{
                height:'44px',
                ...style.flexCenterA,
                position:'relative'
              }}
            >
              <img
                draggable="false"
                src={ this.getNormalIcon() }
                className="devIconStyle"
                style={{margin:'0 10px 0 20px'}}
              />
              { this.renderNameDOM() }
              { noPermissionInfo }
            </div>
          </div>

          <div>
            <div style={{display:'inline-block', width: '100%'}}>
              {this.renderDeviceIcon()}
              <div style={{display:'inline-block',verticalAlign:'middle'}}>
                <p className="mediaInfoTextStyle" style={{color:'rgba(255,255,255,0.4)'}}>
                  {lang.getLang('User:')} {this.state.deviceInfo.play_owner}
                </p>
                <p className="mediaInfoTextStyle" style={{color:'rgba(255,255,255,0.4)'}}>
                  {lang.getLang('Application:')} {this.getLinkApplication()}
                </p>   
              </div>
            </div>
            {controlBtnPanel}
          </div>
        </div>
      </div>
    );

    let topPanel = this.renderTopPanelNoStream();

    let hoverStyleDi = this.state.isMouseOver ? style.deviceItemHoverStyle : style.deviceItemNoHoverStyle;

    let trackInfo = (
      <div className='trackInfoDiv' style={{textAlign: 'center',color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>
        <p style={{margin:'0 0 0 0',color:'rgba(0,0,0,0)'}}>-- / --</p>
      </div>
    );

    return (
      <div
        style={{...style.divDeviceItem, ...dragStyle,...hoverStyleDi}}
        onDragEnter={d1OnDragEnter}
        onDrop={d1OnDrop}
        onDragOver={d1OnDragOver}
        onDragLeave={d1OnDragLeave}
        data-dropflag={d1DataDropflag}
        className="deviceItem_tv"
        onMouseEnter={this.itemMouseOver.bind(this)}
        onMouseLeave={this.itemMouseOut.bind(this)}
      >
        <div style={{height:'168px'}}>
          {topPanel}
          {topPanelHover}
        </div>

        <div style={style.divDeviceItem2}>
          { trackInfo }
          <div className='itemTitleDiv'>
            <p className="mediaInfoTextStyle" style={{height:'17px',display:'inline-block'}}></p>
          </div>

          <div className='thumbDiv' style={style.flexCenter}>
            <div 
              style={{
                width: '140px',
                height: '140px',
                overflow: 'hidden',
                ...style.flexCenter,
              }}
            >
              <img draggable="false" src='img/control_btn/device_occupy.svg' />
            </div>
          </div>

          {hintDiv}

          <div className='belowControBtnDiv' style={style.flexCenter}>
            <div style={{position:'relative'}}>
              <button key="volBtn" className='volBtnDis' data-tip={lang.getLang('Volume')} />
              <button
                key="repeatBtn"
                className='repeatOffBtn'
                style={{cursor:'default'}}
                data-tip={lang.getLang('Repeat')}
              />
              <button key="shuffleBtn" className='shuffleOffBtn' data-tip={lang.getLang('Shuffle')} />
            </div>
            <MoreMenuDevice deviceInfo={this.state.deviceInfo} status='NOSTREAM' type='Thumb' />
          </div>
          {ddFileDiv}
        </div>
      </div>
    );
  }

  clickBtConnect() {
    const devId = this.state.deviceInfo.id;
    const adapterId= this.state.deviceInfo.adapter_id;
    MainActions.doBtConnect(devId, adapterId);
    this.setState({
      btProcessStatus: 'CONNECTING'
    });
  }

  clickBtRemove() {
    const devId = this.state.deviceInfo.id;
    const adapterId= this.state.deviceInfo.adapter_id;
    MainActions.doBtRemove(devId, adapterId);
    this.setState({
      btProcessStatus: 'REMOVING'
    });
  }

  renderNotiImg() {
    return (
      <img
        draggable="false"
        src='img/msg/noti.svg'
        style={{
          cursor:'pointer',
          position: 'absolute',
          top: '15px',
          right: '15px',
          width: '20px',
          height: '20px',
        }}
        onClick={this.tooglePermissionInfo.bind(this)}
      />
    );
  }

  getStreamingStatus() {
    let devInfo = this.state.deviceInfo;
    const devUser = devInfo.play_owner;
    const curUser = LoginStore.getUserName();
    const playState = this.getPlayState();
    let r;

    if (
      curUser != 'admin'
      && curUser != devUser
      && devUser != ''
    ) {
      if (devInfo.inuse_apps === 'OceanKTV') {
        r = 'OCEANKTV';
      } else {
        r = 'OTHERUSER';
      }
    } else if ( devInfo.type === 'HDMI' && devInfo.inuse_apps.indexOf('OceanKTV') >= 0 ) {
      r = 'OCEANKTV';
    } else if ( devInfo.type === 'HDMI' && devInfo.inuse_apps.indexOf('HD Player') >= 0 ) {
      r = 'HDMI_OCCUPIED_BY_HDPLAYER';
    } else if ( devInfo.type === 'HDMI' && devInfo.inuse_apps.indexOf('HD Station') >= 0 ) {
      r = 'HDMI_OCCUPIED_BY_HDSTATION';
    } else if (devInfo.inuse_apps === '' && playState === '') {
      r = 'NOSTREAM';
    } else if ( devInfo.inuse_apps === '' && playState === 'STOP') {
      r = (devInfo.total_track === '0') ? 'NOSTREAM' : 'STOP';
    } else if (devInfo.inuse_apps !== '' && playState === '' && devInfo.type === 'HDMI') {
      // HDMI occupied by HD Player
      r = 'NOSTREAM';
    } else if (devInfo.inuse_apps === 'OceanKTV') {
      r = 'OCEANKTV';
    } else if (playState === 'STOP') {
      r = 'STOP';
    } else {
      r = 'STREAM';
    }
    r = this.isDropflag ? 'STREAM' : r;
    r = this.isSwitchPlaySending ? 'SWITCHPLAYSENDING' : r;
    return r;
  }

  /**
   * Render
   */

  render() {
    const streamingStatus = this.getStreamingStatus();
    switch (streamingStatus) {
      case 'OTHERUSER': {
        return this.renderOtherUser1('OTHERUSER');
      }
      case 'OCEANKTV': {
        return this.renderOtherUser1('OCEANKTV');
      }
      case 'NOSTREAM': {
        return this.renderNoStream1();
      }
      case 'STOP': {
        return this.renderStream();
      }
      case 'STREAM': {
        return this.renderStream();
      }
      case 'SWITCHPLAYSENDING': {
        return this.renderSwitchPlaySending();
      }
      case 'HDMI_OCCUPIED_BY_HDPLAYER': {
        return this.renderOtherUser1('HDMI_OCCUPIED_BY_HDPLAYER');
      }
      case 'HDMI_OCCUPIED_BY_HDSTATION': {
        return this.renderOtherUser1('HDMI_OCCUPIED_BY_HDSTATION');
      }
      default: {
        return null;
      }
    }
  }
}



const style = {
  divDeviceItem :{
    float:'left',
    width:'calc(100% - 10px)',
    margin: '20px 10px',
    height: 'calc(100% - 40px)',
    maxWidth: '320px',
    minWidth: '260px',
    background: 'linear-gradient(to bottom, rgba(26,29,45,0.9) 0%, rgba(22,24,35,0) 100%)',
    position:'relative',
    borderRadius: '6px',
    minHeight: '430px',
  },
  deviceItemHoverStyle:{
    boxShadow:'0 0 20px 0 rgba(255,255,255,0.4)',
    transition: 'box-shadow 1s ease',
  },
  deviceItemNoHoverStyle:{
    transition: 'box-shadow 1s ease',
  },
  divDeviceItem2 :{
    height:'calc(100% - 170px)',
    //backgroundColor:'rgba(0,0,0,0.2)'
  },
  divProgressSlide: {
    width:'132px',
    margin:'0 8px'
  },
  dragEnterStyle : {
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  deviceIconImg: {
    width:'70px',
    height:'60px',
    margin: '0px 10px 0px 15px',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  mmStyleFront: {
    position: 'absolute',
    margin: '0',
    left: '194px',
    //top: '487px',
    zIndex: '999'
  },

  mmStyleBack: {
    position: 'absolute',
    margin: '0',
    left: '194px',
    bottom: '74px',
    zIndex: '999'
  },

  anim7: {
    width: '130px',
    height: '130px',
    /*borderTop: '3px solid #171F34',*/
    borderRight: '3px solid #FFF',
    animation: 'spin 1.3s linear infinite',
    borderRadius: '100%'
  },

  animBtn: {
    width: '35px',
    height: '35px',
    borderTop: '2px solid #FFF',
    /*borderRight: '2px solid #FFF',*/
    animation: 'spin 0.8s linear infinite',
    borderRadius: '100%',
    position:'absolute',
    top:'0',
    left:'0',
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    msFlexAlign: 'center',
    msFlexPack: 'center',
  },
  flexCenterA: {
    display: 'flex',
    alignItems: 'center',
    msFlexAlign: 'center'
  },
  flexCenterJ: {
    display: 'flex',
    justifyContent: 'center',
    msFlexPack: 'center',
  },
  ddFilesP:{
    color: '#FFFFFF',
    margin: '0',
    padding: '0 20px',
    fontSize: '14px',
    textAlign: 'center',
  }
}

const deviceIcon = [
  'img/custom_device_icon/pc_l.svg',
  'img/custom_device_icon/tv_l.svg',
  'img/custom_device_icon/device_l.svg',
  'img/custom_device_icon/joystick_l.svg',
  'img/custom_device_icon/chromecast_l.svg',
  'img/custom_device_icon/notebook_l.svg',
  'img/custom_device_icon/appletv_l.svg',
  'img/custom_device_icon/speaker_1_l.svg',
  'img/custom_device_icon/afu_l.svg',
  'img/custom_device_icon/speaker_bluetooth_l.svg'
];
const deviceIcon_d = [
  'img/custom_device_icon/pc_d.svg',
  'img/custom_device_icon/tv_d.svg',
  'img/custom_device_icon/device_d.svg',
  'img/custom_device_icon/joystick_d.svg',
  'img/custom_device_icon/chromecast_d.svg',
  'img/custom_device_icon/notebook_d.svg',
  'img/custom_device_icon/appletv_d.svg',
  'img/custom_device_icon/speaker_1_d.svg',
  'img/custom_device_icon/afu_d.svg',
  'img/custom_device_icon/speaker_bluetooth_d.svg'
];