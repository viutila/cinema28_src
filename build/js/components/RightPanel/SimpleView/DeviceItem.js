import $ from 'jquery';
import React from 'react';
import Bootstrap from "bootstrap";
import RcSlider from 'rc-slider';
import { Line, Circle } from 'rc-progress';

import * as api from 'js/actions/api';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import * as CommonActions from "js/actions/CommonActions";
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import LoginStore from "js/stores/LoginStore";
import MoreMenuDevice from '../MoreMenuDevice';
import DeviceItemThumbnail from "../ThumbnailView/DeviceItem";
import CustomScrollBar01 from 'js/components/Common/CustomScrollBar01';

//import 'css/rc-slider.css';
import 'css/DeviceItem.css';

export default class DeviceItem extends DeviceItemThumbnail {

  /**
   * Constructor
   */

  constructor(props) {
    super(props);

    this.addPlayDone = this.addPlayDone.bind(this);
    this.getPlaylistDone = this.getPlaylistDone.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateIconIndex = this.updateIconIndex.bind(this);
    this.onSwitchPlaySend = this.onSwitchPlaySend.bind(this);

    this.state = {
      deviceInfo: this.props.deviceInfo,
      stopLoading: false,
      playPauseLoading: false,
      volume: this.props.deviceInfo.volume,
      play_state123: this.props.deviceInfo.play_state,
      playlist: null,
      getPlaylistFlag: false,  //if getting playlist Now
      hoverItemTrack: 0,
      listItemsAry: null,
      progressTime: 0,
      isOpenedFlag: true,
      isVolBarOpen: false,
      isOpenList: false,
      playMode: this.props.deviceInfo.play_mode,
      iconIndex: null,
      updateFlag: true,
      isDragEnter: false,
      isMouseOver: false,
    };

    this.stationUrl = {
      fileStation: MainActions.getCgiOrigin() + '/filestation/',
      musicStation: MainActions.getCgiOrigin() + '/musicstation/',
      videoStation: MainActions.getCgiOrigin() + '/video/',
      OceanKTV: MainActions.getCgiOrigin() + '/apps/OceanKTVConsole/',
    };

    this.dragTarget = null;
    this.uuid = this.generateUUID();
    this.scrollBottomCount = 1;

    this.stopFlag = false;
    this.playFlag = false;
    this.pauseFlag = false;
    this.recPropCnt = 0;

    this.hoverTimer = null;
    this.divPlaylist = null;

    this.isVolBarEnter = false;
    this.isDbClick = false;
    this.delTrackFlag = false;
    this.delCurTrackFlag = false;
  }

  /**
   * Lifecycle Methods
   */

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

  /**
   * Click Handlers and Event Handlers
   */

  handleClick(e) {
    if (e.target.id !== "volBtnProgress") {
      if (!this.isVolBarEnter && this.state.isVolBarOpen) {
        this.setState({
          isVolBarOpen: false
        });
      }
    }

    if (this.divPlaylist) {
      if (
        !this.divPlaylist.contains(e.target) 
        && e.target.className !== 'trackPlaylist'
        && e.target.className !== "deleteItemBtnDev"
      ) {
        this.setState({
          isOpenList: false
        });
      }
    }
  }

  /**
   * Getter Methods for Render
   */

  ifPlayListClick(e) {
    if(e.target.offsetTop > 267) {
      $(e.target).parent().parent().siblings('.div_Playlist_sv').addClass('top');
      $(e.target).parent().parent().siblings('.div_Playlist_sv').find('.arrow_box').addClass('top');
    }else{
      $(e.target).parent().parent().siblings('.div_Playlist_sv').removeClass('top');
      $(e.target).parent().parent().siblings('.div_Playlist_sv').find('.arrow_box').removeClass('top');
    }
    this.setState({
      isOpenList: !this.state.isOpenList,
    });
    if (!this.state.isOpenList) {
      const obj = this.scrollBarObj.refs.scrollbars;
      let clHeight = obj.getClientHeight();
      let sTop = this.getScrollTop(clHeight, 0);
      //console.log('clHeight:',clHeight,'sTop:',sTop);
      obj.scrollTop(sTop);
    }
  }

  renderNameDOM() {
    return <p className="devNameTextStyleSimple" style={{marginLeft:'10px'}} data-tip={this.getName()}>{this.getName()}</p>;
  }

  renderNameDOM01() {
    return <p className="devNameTextStyleSimple" data-tip={this.getName()} style={{maxWidth:'230px'}}>{this.getName()}</p>;
  }

  renderDeviceIcon(){
    const streamingStatus = this.getStreamingStatus();
    if (this.state.updateIconIndex === null) {
      return (<img draggable="false" src='' style={{width:'60px',height:'60px',border:'0'}} />)
    }
    if(streamingStatus === 'STREAM'){
      return (<img draggable="false" src={deviceIcon[this.state.iconIndex]} style={{width:'60px',height:'60px'}} />)
    }else{
      return (<img draggable="false" src={deviceIcon_d[this.state.iconIndex]} style={{width:'60px',height:'60px'}} />)
    }
  }

  renderVolumeSlider() {
    let speakerIconSrc = '';
    if (+this.state.volume === 0) {
      speakerIconSrc = 'img/control_btn/mute_1.svg';
    } else {
      speakerIconSrc = 'img/control_btn/voice_1_max.svg';
    }
    //let adjStyle = this.state.flipState ? {bottom: '100px'} : {top: '450px'};
    let dStyle = {
      position:'absolute',
      width:'180px',
      height:'36px',
      top:'-40px',
      left:'-12px',
      ...style.flexCenter
    };
    return (
      <div 
        style={dStyle}
        onMouseEnter={this.enterVolBarHandle.bind(this,true)} 
        onMouseLeave={this.enterVolBarHandle.bind(this,false)} 
      >
        <div className='arrow_box_volBtn' style={{...style.flexCenter,width:'100%',height:'100%'}}>
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

  renderWaveAni() {
    let playState = this.getPlayState();
    let animationDisplay = playState === 'PLAY' && this.state.playlist !== null  ? 'flex' : 'none';
    return (
      <div 
        style={{
          position: 'absolute',
          width: '180px',
          height: '72px',
          bottom: '26px',
          left: '0',
          right: '0',
          margin: '0 auto',
          zIndex: '-1',
          display: animationDisplay,
          alignItems: 'center',
          justifyContent: 'center',
          msFlexAlign: 'center',
          msFlexPack: 'center',
          opacity: '0.5'
        }}
      >
        <div class="vt-bar" style={{animationDelay:'0s',height: '4%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.0625s',height: '5%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.125s',height: '6%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.25s',height: '7%'}}></div>
        <div class="vt-bar" style={{animationDelay:'0.5s',height: '8%'}}></div>
        <div class="vt-bar" style={{animationDelay:'1.75s',height: '11%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3s',height: '13%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.75s',height: '15%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.5s',height: '17%'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.75s',height: '19%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3s',height: '21%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.5s'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.25s'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.75s'}}></div>
        <div class="vt-bar" style={{animationDelay:'4s'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.25s'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.5s'}}></div>
        <div class="vt-bar" style={{animationDelay:'4s'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.5s'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.75s'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.25s'}}></div>
        <div class="vt-bar" style={{animationDelay:'3s'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.5s'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.25s'}}></div>
        <div class="vt-bar" style={{animationDelay:'2s'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.25s'}}></div>
        <div class="vt-bar" style={{animationDelay:'2.5s'}}></div>
        <div class="vt-bar" style={{animationDelay:'3s'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.25s',height: '21%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.5s',height: '19%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4s',height: '17%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.5s',height: '15%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.75s',height: '13%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4s',height: '11%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4.25s',height: '8%'}}></div>
        <div class="vt-bar" style={{animationDelay:'4s',height: '7%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.75s',height: '6%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.5s',height: '5%'}}></div>
        <div class="vt-bar" style={{animationDelay:'3.25s',height: '4%'}}></div>
      </div>
    );
  }

  renderNotiImg() {
    return (
      <img
        draggable="false"
        src='img/msg/noti.svg'
        style={{
          cursor:'pointer',
          position: 'absolute',
          top: '45px',
          right: '45px',
          width: '20px',
          height: '20px',
        }}
        onClick={this.tooglePermissionInfo.bind(this)}
      />
    );
  }

  getReorderMask() {
    let reorderMask = this.ifHandlingAction()
    ? (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '0',
          zIndex: '2',
          backgroundColor: 'rgba(0,0,0,0)'
        }}
      />
    ) : null;
    return reorderMask;
  }

  renderStream() {
    var linkApplication = this.getLinkApplication();
    var volumeSlider;
    var volumeBtn;
    let noPermissionInfo = this.getPermissionStatus() ? this.renderNotiImg() : null;
    
    if (this.state.deviceInfo.subtype == "Chromecast" || this.state.deviceInfo.subtype == "AirPlay") {
      volumeSlider = null;
      volumeBtn = (<button key="volBtn" className={this.getVolumeBtnStyle() } data-tip={lang.getLang('Msg26')} />)
    } else {
      volumeSlider = this.state.isVolBarOpen 
        ? this.renderVolumeSlider()
        : null;
      volumeBtn = (<button id="volBtnProgress" key="volBtn" className={this.getVolumeBtnStyle() } onClick={this.onClickMute.bind(this) } data-tip={lang.getLang('Volume')} />)
    }

    let playListDisplay = {
      visibility: this.state.isOpenList ? 'visible' : 'hidden',
      opacity: this.state.isOpenList ? '1' : '0'
    }
    let timePercet = 0;
    let controlBtn1, controlBtn2, innerCircleDisplay;
    let playPauseLoadingDisplay = this.getIfPlayPauseLoading() ? 'block' : 'none';
    let stopLoadingDisplay = this.getIfStopLoading() ? 'block' : 'none';
    
    if (this.state.playlist !== null) {
      //timePercet = Math.round(this.state.progressTime / this.getCurtTotalTimeInt() * 100);
      timePercet = this.state.progressTime / this.getCurtTotalTimeInt() * 100;
      controlBtn1 = (
        <div style={{...style.flexCenter}}>
          <div style={{position:'relative'}}>
            <button key="stopBtn" className={this.getStopStyle()} style={{marginRight:'25px'}} onClick={this.stopDevice.bind(this)} data-tip={lang.getLang('Stop')} />
            <div style={{...style.animBtn,display:stopLoadingDisplay}}></div>
          </div>
          <div style={{position:'relative'}}>
            <button key="playBtn" className={this.getPlayPause()} onClick={this.playOrResume.bind(this) } data-tip={this.getPlayPauseToolTip()} />
            <div style={{...style.animBtn,display:playPauseLoadingDisplay}}></div>
          </div>
        </div>
      );
      controlBtn2 = (
        <div style={{marginTop:'12px',...style.flexCenter}}>
          <div style={{position:'relative'}}>
            { volumeBtn }
            { volumeSlider }
            <button key="repeatBtn" className={this.getRepeatBtnStyle()} onClick={this.clickRepeat.bind(this)} data-tip={lang.getLang('Repeat')} />
            <button key="shuffleBtn" className={this.getShuffleBtnStyle()} style={{cursor:'pointer'}} onClick={this.clickShuffle.bind(this)} data-tip={lang.getLang('Shuffle')} />
          </div>
          <MoreMenuDevice deviceInfo={this.state.deviceInfo} type='Simple' />
        </div>
      );
      innerCircleDisplay = 'block';
    } else {
      const streamingStatus = this.getStreamingStatus();
      if (streamingStatus === 'NOSTREAM') {
        controlBtn1 = (
          <div style={{textAlign: 'center'}}>
            <button key="stopBtn" className='stopBtnDis' style={{marginRight:'25px'}} data-tip={lang.getLang('Stop')} />
            <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} />
          </div>
        );
      } else {
        controlBtn1 = (
          <div style={{textAlign: 'center'}}>
            <button key="stopBtn" className={this.getStopStyle()} style={{marginRight:'25px'}} data-tip={lang.getLang('Stop')} />
            <button key="playBtn" className={this.getPlayPause()} data-tip={this.getPlayPauseToolTip()} />
          </div>
        );
      }
      controlBtn2 = (
        <div style={{marginTop:'8px',...style.flexCenter}}>
          <div style={{position:'relative'}}>
            <button key="volBtn" className='volBtnDis' data-tip={lang.getLang('Volume')} />
            <button key="repeatBtn" className='repeatOffBtn' style={{cursor:'default'}} data-tip={lang.getLang('Repeat')} />
            <button key="shuffleBtn" className='shuffleOffBtn' data-tip={lang.getLang('Shuffle')} />
          </div>
          <MoreMenuDevice deviceInfo={this.state.deviceInfo} status='NOSTREAM' type='Simple' />
        </div>
      );
      innerCircleDisplay = 'none';
    }
    //console.log(timePercet);
    let trackNumTotal, trackNumTotalHover;
    if (this.state.deviceInfo.curr_track === '' || this.state.deviceInfo.curr_track === '0') {
      trackNumTotal = (
        <span style={{margin:'0',fontSize:'14px',cursor:'default',color:'rgba(255,255,255,0.4)'}}>-- / --</span>
      );
      trackNumTotalHover = this.isDropflag ? (<span style={{margin:'0'}}>Updating</span>) : null;
    } else {
      if (this.state.listItemsAry !== null) {
        trackNumTotal = (
          <span style={{margin:'0',cursor:'pointer'}}
                onClick={this.ifPlayListClick.bind(this)}
                className='trackPlaylist'
          >
            {this.state.deviceInfo.curr_track} / {this.state.deviceInfo.total_track}
          </span>
        );
        trackNumTotalHover = trackNumTotal;
      } else {
        trackNumTotal = (
          <span style={{margin:'0',fontSize:'14px',cursor:'default',color:'rgba(255,255,255,0.4)'}}>
            {this.state.deviceInfo.curr_track} / {this.state.deviceInfo.total_track}
          </span>
        );
        trackNumTotalHover = trackNumTotal;
      }
    }

    let dragStyle = this.state.isDragEnter
      ? style.dragEnterStyle
      : {};

    let hoverStyle = {
      true: {visibility:'visible',opacity:'1'},
      false: {visibility:'hidden',opacity:'0'},
    };
    let playState = this.getPlayState();
    let mTop01 = playState === 'PLAY' && this.state.playlist !== null ? '-40px' : '0px';
    let ifPulseAni = this.ifShowDotLoading() ? 'circlePulseAni' : '';
    let hoverStyleDi = this.state.isMouseOver ? style.deviceItemHoverStyle : style.deviceItemNoHoverStyle;
    let reorderMask = this.getReorderMask();

    return (
      <div 
        style={{...style.divDeviceItem, ...dragStyle}}
        onDragEnter={this.dragEnter.bind(this)} 
        onDrop={this.drop.bind(this)} 
        onDragOver={this.allowDrop} 
        onDragLeave={this.dragLeave.bind(this)} 
        data-dropflag={true} 
        className="deviceItem_sv"
        onMouseEnter={this.itemMouseOver.bind(this)}
        onMouseLeave={this.itemMouseOut.bind(this)}
      >
        <div className='opacityTrans' style={{...hoverStyle[!this.state.isMouseOver]}}>
          <div style={{...style.flexCenter, flexDirection:'column',msFlexDirection:'column',marginTop:mTop01}}>
              <img draggable="false" src={this.getNormalIcon() } className="devIconStyle" style={{width:'60px',height:'60px'}} />
              <div style={{marginTop:'10px'}}>
                { this.renderNameDOM01() }
              </div>
              <div style={{marginTop: '10px',...style.flexCenter,color:'#ffffff',fontSize:'14px'}}>
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
                { trackNumTotalHover }
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
              { this.renderWaveAni() }
          </div>
        </div>

        <div className='opacityTrans' style={{...style.hoverDivStyle,...hoverStyle[this.state.isMouseOver]}}>
          { noPermissionInfo }
          <div style={{...style.flexCenter,marginTop:'15px'}}>
              <img draggable="false" src={this.getNormalIcon() } className="devIconStyle" />
              { this.renderNameDOM() }
          </div>
            {/*<button key="btnPlaylist" className="btnPlaylistOn" onClick={this.onClickPlaylist.bind(this)} data-tip={lang.getLang('Current Playlist')} />*/}
            
            {/*<hr className="hrStyle" />*/}
          <div style={{...style.flexCenter,position:'relative'}}>
            { this.renderDeviceIcon() }
          </div>

          <div style={{height:'125px'}}>
            {controlBtn1}
            <div style={{marginTop: '9px',color:'#ffffff',fontSize:'14px',...style.flexCenter}}>
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
              
              {trackNumTotal}

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
            {controlBtn2}
          </div>
        </div>

        {
          this.state.playlist == null 
          ?
            null
          :
            (
              <div id='div_Playlist' className='div_Playlist_sv' style={playListDisplay} ref={(ele)=>{this.divPlaylist = ele;}}>
                <div className='arrow_box'>
                  <CustomScrollBar01
                    style={{height:'300px'}}
                    onScroll={this.handleScroll.bind(this)}
                    ref={(obj)=>{this.scrollBarObj=obj}}
                  >
                    <div>
                      {this.state.listItemsAry}
                    </div>
                  </CustomScrollBar01>
                </div>
                {reorderMask}
              </div>
            )
        }
        <div style={{position:'absolute',left:'0',right:'0',top:'0',zIndex:'-1'}}>
          {
            this.state.playlist == null 
            ?
              null
            :
              <CCircle01 timePercet={timePercet}/>
          }
          
        </div>
        <div className={ifPulseAni} style={{position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',backgroundColor:'rgba(1,3,12,0.35)',borderRadius: '50%',zIndex:'-2',...hoverStyleDi}} />
        <div style={{position:'absolute',left:'20px',right:'20px',top:'20px',bottom:'20px',backgroundColor:'rgba(0,0,0,0.35)',borderRadius: '50%',zIndex:'-2',display:innerCircleDisplay}} />
      </div>
    );
  }
  renderSwitchPlaySending() {
    var linkApplication = this.getLinkApplication();
    var volumeBtn;
    let noPermissionInfo = this.getPermissionStatus() ? this.renderNotiImg() : null;
    
    if (this.state.deviceInfo.subtype == "Chromecast" || this.state.deviceInfo.subtype == "AirPlay") {
      volumeBtn = (<button key="volBtn" className={this.getVolumeBtnStyle() } data-tip={lang.getLang('Msg26')} />)
    } else {
      volumeBtn = (<button id="volBtnProgress" key="volBtn" className={this.getVolumeBtnStyle() } onClick={this.onClickMute.bind(this) } data-tip={lang.getLang('Volume')} />)
    }

    let timePercet = 0;
    let controlBtn1, controlBtn2, innerCircleDisplay;
    let playPauseLoadingDisplay = this.getIfPlayPauseLoading() ? 'block' : 'none';
    let stopLoadingDisplay = this.getIfStopLoading() ? 'block' : 'none';
    
    controlBtn1 = (
      <div style={{textAlign: 'center'}}>
        <button key="stopBtn" className='stopBtnDis' style={{marginRight:'25px'}} data-tip={lang.getLang('Stop')} />
        <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} />
      </div>
    );
    controlBtn2 = (
      <div style={{marginTop:'8px',...style.flexCenter}}>
        <div style={{position:'relative'}}>
          <button key="volBtn" className='volBtnDis' data-tip={lang.getLang('Volume')} />
          <button key="repeatBtn" className='repeatOffBtn' style={{cursor:'default'}} data-tip={lang.getLang('Repeat')} />
          <button key="shuffleBtn" className='shuffleOffBtn' data-tip={lang.getLang('Shuffle')} />
        </div>
        <MoreMenuDevice deviceInfo={this.state.deviceInfo} status='NOSTREAM' type='Simple' />
      </div>
    );
    innerCircleDisplay = 'none';

    //console.log(timePercet);
    let trackNumTotal, trackNumTotalHover;
    if (this.state.deviceInfo.curr_track === '') {
      trackNumTotal = (
        <span style={{margin:'0',fontSize:'14px',cursor:'default',color:'rgba(255,255,255,0.4)'}}>-- / --</span>
      );
      trackNumTotalHover = this.isDropflag ? (<span style={{margin:'0'}}>Updating</span>) : null;
    } else {
      if (this.state.listItemsAry !== null) {
        trackNumTotal = (
          <span style={{margin:'0',cursor:'pointer'}}
                onClick={this.ifPlayListClick.bind(this)}
                className='trackPlaylist'
          >
            {this.state.deviceInfo.curr_track} / {this.state.deviceInfo.total_track}
          </span>
        );
        trackNumTotalHover = trackNumTotal;
      } else {
        trackNumTotal = (
          <span style={{margin:'0',fontSize:'14px',cursor:'default',color:'rgba(255,255,255,0.4)'}}>
            {this.state.deviceInfo.curr_track} / {this.state.deviceInfo.total_track}
          </span>
        );
        trackNumTotalHover = trackNumTotal;
      }
    }

    let dragStyle = this.state.isDragEnter
      ? style.dragEnterStyle
      : {};

    let hoverStyle = {
      true: {visibility:'visible',opacity:'1'},
      false: {visibility:'hidden',opacity:'0'},
    };
    let mTop01 = '0px';
    let ifPulseAni = 'circlePulseAni';
    let hoverStyleDi = this.state.isMouseOver ? style.deviceItemHoverStyle : style.deviceItemNoHoverStyle;

    return (
      <div 
        style={{...style.divDeviceItem, ...dragStyle}}
        onDragEnter={this.dragEnter.bind(this)} 
        onDrop={this.drop.bind(this)} 
        onDragOver={this.allowDrop} 
        onDragLeave={this.dragLeave.bind(this)} 
        data-dropflag={true} 
        className="deviceItem_sv"
        onMouseEnter={this.itemMouseOver.bind(this)}
        onMouseLeave={this.itemMouseOut.bind(this)}
      >
        <div className='opacityTrans' style={{...hoverStyle[!this.state.isMouseOver]}}>
          <div style={{...style.flexCenter, flexDirection:'column',msFlexDirection:'column',marginTop:mTop01}}>
              <img draggable="false" src={this.getNormalIcon() } className="devIconStyle" style={{width:'60px',height:'60px'}} />
              <div style={{marginTop:'10px'}}>
                { this.renderNameDOM01() }
              </div>
              <div style={{marginTop: '10px',...style.flexCenter,color:'#ffffff',fontSize:'14px'}}>

                <div style={{...style.flexCenter,marginRight:'10px'}}>
                  <div class="object object_three" style={{marginRight:'5px'}}></div>
                  <div class="object object_two" style={{marginRight:'5px'}}></div>
                  <div class="object object_one"></div>
                </div>

                { trackNumTotalHover }

                <div style={{...style.flexCenter,marginLeft:'10px'}}>
                  <div class="object object_one" style={{marginRight:'5px'}}></div>
                  <div class="object object_two" style={{marginRight:'5px'}}></div>
                  <div class="object object_three"></div>
                </div>

              </div>
              { this.renderWaveAni() }
          </div>
        </div>

        <div className='opacityTrans' style={{...style.hoverDivStyle,...hoverStyle[this.state.isMouseOver]}}>
          { noPermissionInfo }
          <div style={{...style.flexCenter,marginTop:'15px'}}>
              <img draggable="false" src={this.getNormalIcon() } className="devIconStyle" />
              { this.renderNameDOM() }
          </div>

          <div style={{...style.flexCenter,position:'relative'}}>
            { this.renderDeviceIcon() }
          </div>

          <div style={{height:'125px'}}>
            {controlBtn1}
            <div style={{marginTop: '9px',color:'#ffffff',fontSize:'14px',...style.flexCenter}}>

              <div style={{...style.flexCenter,marginRight:'10px'}}>
                <div class="object object_three" style={{marginRight:'5px'}}></div>
                <div class="object object_two" style={{marginRight:'5px'}}></div>
                <div class="object object_one"></div>
              </div>
              
              {trackNumTotal}

              <div style={{...style.flexCenter,marginLeft:'10px'}}>
                <div class="object object_one" style={{marginRight:'5px'}}></div>
                <div class="object object_two" style={{marginRight:'5px'}}></div>
                <div class="object object_three"></div>
              </div>

            </div>
            {controlBtn2}
          </div>
        </div>
        <div className={ifPulseAni} style={{position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',backgroundColor:'rgba(1,3,12,0.35)',borderRadius: '50%',zIndex:'-2',...hoverStyleDi}} />
        <div style={{position:'absolute',left:'20px',right:'20px',top:'20px',bottom:'20px',backgroundColor:'rgba(0,0,0,0.35)',borderRadius: '50%',zIndex:'-2',display:innerCircleDisplay}} />
      </div>
    );
  }

  /*getPlaylistDone(res_DevId, uuid) {

    let dev_id = this.state.deviceInfo.id;
    if (res_DevId === dev_id && uuid === this.uuid) {
      if (!this.delPlFlag) {
        let tmpPl = MainStore.getPlaylistByDevId(dev_id);
        if (tmpPl === undefined || tmpPl === null) {
          setTimeout(()=>{
            this.getPlaylist();
          },3000);
        } else if (tmpPl.items.length===0) {
          setTimeout(()=>{
            this.getPlaylist();
          },3000);
        } else {
          this.setState({
            playlist: MainStore.getPlaylistByDevId(dev_id)
          });
          this.isDropflag = false;
        }
        this.renderListItemAry();
        this.checkIfChangeCurrTrack();
      }
    }
  }*/

  /*changeState() {
    const colorMap = ['#3FC7FA', '#85D262', '#FE8C6A'];
    const value = parseInt(Math.random() * 100, 10);
    this.setState({
      percent: value,
      color: colorMap[parseInt(Math.random() * 3, 10)],
    });
  }
  renderCircle() {
    return (
      <div style={{width:'260px',float:'left'}}>
        <button onClick={this.changeState.bind(this)}>Change percent</button>
        <Circle percent={this.state.percent}/>
      </div>
    )
  }*/

  renderOtherUser1(v) {
    let hintDiv = null;
    let controlBtn1, controlBtn2;
    let timePercet = 0;
    let innerCircleDisplay;
    let playPauseLoadingDisplay = this.getIfPlayPauseLoading() ? 'block' : 'none';
    let stopLoadingDisplay = this.getIfStopLoading() ? 'block' : 'none';

    let d1OnDragEnter = null;
    let d1OnDrop = null;
    let d1OnDragOver = null;
    let d1OnDragLeave = null;
    let d1DataDropflag = false;

    switch(v) {
      case 'OTHERUSER': {
        let str = lang.getLang('Msg23');
        let res = str.split("%user");
        const devUser = this.state.deviceInfo.play_owner;
    
        hintDiv = (
          <div style={{marginTop:'8px', ...style.flexCenter}}>
            <p style={{color:'#FFFFFF',margin:'0',width:'150px',textAlign:'center',fontSize:'13px'}}>{res[0]}{devUser}{res[1]}</p>
          </div>
        );
        controlBtn1 = (
          <div style={{...style.flexCenter}}>
            <div style={{position:'relative'}}>
              <button key="stopBtn" className={this.getStopStyle()} style={{marginRight:'25px'}} onClick={this.stopDevice.bind(this)} data-tip={lang.getLang('Stop')} />
              <div style={{...style.animBtn,display:stopLoadingDisplay}}></div>
            </div>
            <div style={{position:'relative'}}>
              <button key="playBtn" className={this.getPlayPause()} onClick={this.playOrResume.bind(this) } data-tip={this.getPlayPauseToolTip()} />
              <div style={{...style.animBtn,display:playPauseLoadingDisplay}}></div>
            </div>
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
          <div
            style={{
              marginTop:'8px',
              display: 'flex',
              flexDirection:'column',
              msFlexDirection:'column',
              alignItems: 'center',
              justifyContent: 'center',
              msFlexAlign: 'center',
              msFlexPack: 'center',
            }}
          >
            <p style={{color:'#FFFFFF',margin:'auto',width:'250px',textAlign:'center',fontSize:'13px'}}>
              {lang.getLang('Msg11')}
            </p>
            <p style={{color:'#FFFFFF',margin:'auto',width:'250px',textAlign:'center',fontSize:'13px'}}>
              {res[0]}{link}{res[1]}
            </p>
          </div>
        );
        controlBtn1 = (
          <div style={{...style.flexCenter}}>
            <button key="stopBtn" className='stopBtnDis' style={{marginRight:'25px'}} data-tip={lang.getLang('Stop')} />
            <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} />
          </div>
        );
        break;
      }
      case 'HDMI_OCCUPIED_BY_HDPLAYER': {
        let str = lang.getLang('MsgA3');
        str = str.replace(/%app_name/g, this.state.deviceInfo.inuse_apps);
        str = str.replace('%device_name', this.getName());

        hintDiv = (
          <div
            style={{
              marginTop:'8px',
              display: 'flex',
              flexDirection:'column',
              msFlexDirection:'column',
              alignItems: 'center',
              justifyContent: 'center',
              msFlexAlign: 'center',
              msFlexPack: 'center',
            }}
          >
            <p style={{color:'#FFFFFF',margin:'auto',width:'250px',textAlign:'center',fontSize:'13px'}}>
              { str }
            </p>
          </div>
        );
        controlBtn1 = (
          <div style={{...style.flexCenter}}>
            <button key="stopBtn" className='stopBtnDis' style={{marginRight:'25px'}} data-tip={lang.getLang('Stop')} />
            <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} />
          </div>
        );
        break;
      }
      case 'HDMI_OCCUPIED_BY_HDSTATION': {
        hintDiv = (
          <div
            style={{
              marginTop:'8px',
              display: 'flex',
              flexDirection:'column',
              msFlexDirection:'column',
              alignItems: 'center',
              justifyContent: 'center',
              msFlexAlign: 'center',
              msFlexPack: 'center',
            }}
          >
            <p style={{color:'#FFFFFF',margin:'auto',width:'250px',textAlign:'center',fontSize:'13px'}}>
              { lang.getLang('MsgA4') }
            </p>
          </div>
        );
        controlBtn1 = (
          <div style={{...style.flexCenter}}>
            <button key="stopBtn" className='stopBtnDis' style={{marginRight:'25px'}} data-tip={lang.getLang('Stop')} />
            <button key="playBtn" className='playBtnDis' data-tip={this.getPlayPauseToolTip()} />
          </div>
        );
        break;
      }
    }
    
    var linkApplication = this.getLinkApplication();
    var volumeBtn;
    let noPermissionInfo = this.getPermissionStatus() ? this.renderNotiImg() : null;
    
    if (this.state.deviceInfo.subtype == "Chromecast" || this.state.deviceInfo.subtype == "AirPlay") {
      volumeBtn = (<button key="volBtn" className={this.getVolumeBtnStyle() } data-tip={lang.getLang('Msg26')} />)
    } else {
      volumeBtn = (<button id="volBtnProgress" key="volBtn" className={this.getVolumeBtnStyle() } onClick={this.onClickMute.bind(this) } data-tip={lang.getLang('Volume')} />)
    }

    let playListDisplay = {
      visibility: this.state.isOpenList ? 'visible' : 'hidden',
      opacity: this.state.isOpenList ? '1' : '0'
    }

    controlBtn2 = (
      <div style={{marginTop:'8px',...style.flexCenter}}>
        <div style={{position:'relative'}}>
          <button key="volBtn" className='volBtnDis' data-tip={lang.getLang('Volume')} />
          <button key="repeatBtn" className='repeatOffBtn' style={{cursor:'default'}} data-tip={lang.getLang('Repeat')} />
          <button key="shuffleBtn" className='shuffleOffBtn' data-tip={lang.getLang('Shuffle')} />
        </div>
        <MoreMenuDevice deviceInfo={this.state.deviceInfo} status='NOSTREAM' type='Simple' />
      </div>
    );
    innerCircleDisplay = 'none';
    let trackNumTotal, trackNumTotalHover;

    trackNumTotal = (
      <span style={{margin:'0',fontSize:'14px',cursor:'default',color:'rgba(255,255,255,0.4)'}}>-- / --</span>
    );
    trackNumTotalHover = this.isDropflag ? (<span style={{margin:'0'}}>Updating</span>) : null;

    let dragStyle = this.state.isDragEnter
      ? style.dragEnterStyle
      : {};

    let hoverStyle = {
      true: {visibility:'visible',opacity:'1'},
      false: {visibility:'hidden',opacity:'0'},
    };
    let playState = this.getPlayState();
    let mTop01 = playState === 'PLAY' && this.state.playlist !== null ? '-40px' : '0px';
    let ifPulseAni = this.ifShowDotLoading() ? 'circlePulseAni' : '';
    let hoverStyleDi = this.state.isMouseOver ? style.deviceItemHoverStyle : style.deviceItemNoHoverStyle;

    let reorderMask = this.getReorderMask();

    return (
      <div 
        style={{...style.divDeviceItem, ...dragStyle}}
        onDragEnter={d1OnDragEnter} 
        onDrop={d1OnDrop} 
        onDragOver={d1OnDragOver} 
        onDragLeave={d1OnDragLeave} 
        data-dropflag={d1DataDropflag} 
        className="deviceItem_sv"
        onMouseEnter={this.itemMouseOver.bind(this)}
        onMouseLeave={this.itemMouseOut.bind(this)}
      >
        <div className='opacityTrans' style={{...hoverStyle[!this.state.isMouseOver]}}>
          <div style={{...style.flexCenter, flexDirection:'column',msFlexDirection:'column',marginTop:mTop01}}>
            
            <div 
              className='thumbDiv' 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                msFlexAlign: 'center',
                msFlexPack: 'center',
              }}
            >
              <img draggable="false" src='img/control_btn/device_occupy.svg' />
            </div>
            {hintDiv}
            <div style={{marginTop: '10px',...style.flexCenter,color:'#ffffff',fontSize:'14px'}}>
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
              { trackNumTotalHover }
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
            {/* this.renderWaveAni() */}
          </div>

        </div>

        <div className='opacityTrans' style={{...style.hoverDivStyle,...hoverStyle[this.state.isMouseOver]}}>
          { noPermissionInfo }
          <div style={{...style.flexCenter,marginTop:'15px'}}>
              <img draggable="false" src={this.getNormalIcon() } className="devIconStyle" />
              { this.renderNameDOM() }
          </div>

          <div style={{...style.flexCenter,position:'relative'}}>
            { this.renderDeviceIcon() }
          </div>

          <div style={{height:'125px'}}>
            {controlBtn1}
            <div style={{marginTop: '9px',color:'#ffffff',fontSize:'14px',...style.flexCenter}}>
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
              
              {trackNumTotal}

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
            {controlBtn2}
          </div>
        </div>

        {
          this.state.playlist == null 
          ?
            null
          :
            (
              <div id='div_Playlist' className='div_Playlist_sv' style={playListDisplay} ref={(ele)=>{this.divPlaylist = ele;}}>
                <div className='arrow_box'>
                  <CustomScrollBar01
                    style={{height:'300px'}}
                    onScroll={this.handleScroll.bind(this)}
                    ref={(obj)=>{this.scrollBarObj=obj}}
                  >
                    <div>
                      {this.state.listItemsAry}
                    </div>
                  </CustomScrollBar01>
                </div>
                {reorderMask}
              </div>
            )
        }
        <div style={{position:'absolute',left:'0',right:'0',top:'0',zIndex:'-1'}}>
          {
            this.state.playlist == null 
            ?
              null
            :
              <CCircle01 timePercet={timePercet}/>
          }
          
        </div>
        <div className={ifPulseAni} style={{position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',backgroundColor:'rgba(1,3,12,0.35)',borderRadius: '50%',zIndex:'-2',...hoverStyleDi}} />
        <div style={{position:'absolute',left:'20px',right:'20px',top:'20px',bottom:'20px',backgroundColor:'rgba(0,0,0,0.35)',borderRadius: '50%',zIndex:'-2',display:innerCircleDisplay}} />
      </div>
    );
  }

  /**
   * Render
   */

  render() {
    const streamingStatus = this.getStreamingStatus();

    switch (streamingStatus) {
      case 'NOSTREAM': {
        return this.renderStream();
      }
      case 'STOP': {
        return this.renderStream();
      }
      case 'STREAM': {
        return this.renderStream();
      }
      case 'MUSICSTATION': {
        return this.renderStream();
      }
      case 'SWITCHPLAYSENDING': {
        return this.renderSwitchPlaySending();
      }
      case 'OTHERUSER': {
        return this.renderOtherUser1('OTHERUSER');
      }
      case 'OCEANKTV': {
        return this.renderOtherUser1('OCEANKTV');
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

/*class CCircle extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let timePercet = this.props.timePercet;
    return timePercet===0 || !timePercet
    ?
    null
    :
    (
      <Circle
        percent={timePercet}
        strokeLinecap="square"
        strokeColor="#29E1FA"
        trailColor="rgba(0,0,0,0)"
      />
    );
  }
}*/

class CCircle01 extends React.Component {
  constructor(props) {
    super(props);
    this.ctx = null;
  }

  init() {
    var ctxPP = this.ctx.getContext("2d");
    var gradient = ctxPP.createLinearGradient(70,70,140,280);
    gradient.addColorStop("0","#171F34");
    gradient.addColorStop("0.5","#8D4DE8");
    gradient.addColorStop("1.0","#FF2366");

    ctxPP.beginPath();
    ctxPP.strokeStyle = '#99CC33';
    ctxPP.strokeStyle=gradient;
    ctxPP.lineCap = 'square';
    ctxPP.closePath();
    ctxPP.fill();
    ctxPP.lineWidth = 5;
  }

  draw(current) {
    var ctxPP = this.ctx.getContext("2d");
    var circ = Math.PI * 2;
    var quart = Math.PI / 2;
    
    ctxPP.clearRect(0, 0, rectWidth, rectWidth);
    var imd = ctxPP.getImageData(0, 0, rectWidth, rectWidth);
    ctxPP.putImageData(imd, 0, 0);
    ctxPP.beginPath();
    ctxPP.arc(rectWidth/2, rectWidth/2, 130, -(quart), ((circ) * current) - quart, false);
    ctxPP.stroke();
  }

  animate() {
    
  }

  render() {
    let timePercet = this.props.timePercet;
    let displayStatus = timePercet===0 || !timePercet ? 'none' : 'block';
    if (this.ctx !== null) {
      this.init();
      this.draw(timePercet/100);
    }
    return (
      <canvas ref={(ele)=>{this.ctx = ele}} width={rectWidth} height={rectWidth} style={{display:displayStatus}}></canvas>
    )
    
  }
}

const rectWidth = 280;

const style = {
  divDeviceItem :{
    position: 'relative',
    minWidth:rectWidth + 'px',
    height: rectWidth + 'px',
    float:'left',
    margin: '0 25px',
    top: '20%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    msFlexAlign: 'center',
    msFlexPack: 'center',
  },
  oceakKTVp1: {
    color:'#FFFFFF',
    margin:'0',
    textAlign:'center',
    fontSize:'14px',
    textOverflow:'ellipsis',
    overflow:'hidden',
    whiteSpace:'nowrap',
  },
  dragEnterStyle: {
    borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  hoverDivStyle: {
    position: 'absolute',
    top: '0',
    bottom:'0',
    left:'0',
    right:'0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'column',
    msFlexDirection:'column',
    msFlexAlign: 'center',
    msFlexPack: 'center',
  },
  deviceItemHoverStyle:{
    boxShadow:'0 0 50px 0 rgba(255,255,255,0.5)',
    transition: 'box-shadow 1s ease',
  },
  deviceItemNoHoverStyle:{
    transition: 'box-shadow 1s ease',
  },
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