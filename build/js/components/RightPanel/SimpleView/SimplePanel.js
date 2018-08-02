const $ = require('jquery');

import React from 'react';
import MainStore from 'js/stores/MainStore';
import * as MainActions from 'js/actions/MainActions';
import DeviceItem from "./DeviceItem";

import MediaPlaylist from '../MediaList/MediaPlaylist';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import CustomScrollBar from 'js/components/Common/CustomScrollBar';
import Slider from 'react-slick';
import ReactTooltip from 'react-tooltip';
import 'css/slick/slick.css';
import 'css/slick/slick-theme.css';

export default class SimplePanel extends React.Component {

  /**
   * Constructor
   */

  constructor(props) {
    super(props);
    this.setMediaPlaylist = this.setMediaPlaylist.bind(this);
    this.resizeWindow = this.resizeWindow.bind(this);

    this.state = {
      deviceByType: this.props.deviceByType,
      type: this.props.type,
      style_divTypePanel: divTypePanelNoMPL,
      firstTimeIn: true,
      ifAnalog: true,
      renderNum: 8
    };

    this.imgSrc = [
        'img/nodevice_detect/image_no_device_01.svg',
        'img/nodevice_detect/image_no_device_02.svg',
        'img/nodevice_detect/image_no_device_03.svg'
    ];
  }


  /**
   * Lifecycle Methods
   */

  componentWillMount() {
    MainStore.on('toogleMediaPlaylist', this.setMediaPlaylist);
    window.addEventListener('resize',this.resizeWindow);
  }

  componentDidMount() {
    this.setMediaPlaylist();
    this.resizeWindow();
  }

  componentWillUnmount() {
    MainStore.removeListener('toogleMediaPlaylist', this.setMediaPlaylist);
    window.removeEventListener('resize',this.resizeWindow);
  }

  componentDidUpdate(prevProps, prevState) {
    ReactTooltip.rebuild();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      deviceByType: nextProps.deviceByType,
      type: nextProps.type
    },()=>{
      let deviceItemAry = this.renderDeviceItem();
      let deviceNum = deviceItemAry.length;
      if ( deviceNum === 0) {
        setTimeout(function() {
          MainActions.setType('Overview');
          MainActions.setFilter('all');
        }, 1);
      }
    })
  }

  /**
   * Click Handlers and Event Handlers
   */

  resizeWindow(){
    let num = 4;
    let windowWidth = $(window).width();
    let mplWidth = MainStore.isShowMediaPlaylist() === true
    ? 320
    : 0;
    windowWidth = windowWidth - mplWidth;
    if(windowWidth >= 1520){
      num = 4;
    }else if(windowWidth < 1520 && windowWidth >= 1260){
      num = 3;
    }else if(windowWidth < 1260 && windowWidth >= 1000){
      num = 2;
    }else{
      num = 1;
    }
    this.setState({
      renderNum:num,
    })
  }

  setMediaPlaylist() {
    if (MainStore.isShowMediaPlaylist() === true) {
      this.setState({
        style_divTypePanel: divTypePanel,
      },()=>{
        this.resizeWindow();
      });
    } else {
      setTimeout(function() {
        this.setState({
          style_divTypePanel: divTypePanelNoMPL,
        },()=>{
          this.resizeWindow();
        });
      }.bind(this), 100);
    }
  }

  /**
   * Optional Render Methods
   */

  renderDeviceItem() {
    let r = [];
    let viewType = this.state.type;
    let deviceByType = this.state.deviceByType;
    switch(viewType) {
      case 'Overview': {
        _.forEach(deviceByType, (types) => {
          _.forEach(types, (dev) => {
            r.push(<DeviceItem key={dev.id} deviceInfo={dev} />);
          });
        });
        break;
      }
      case 'HDMI': {
        for (let i = 0; i < deviceByType.hdmiDevs.length; i++) {
          r.push(<DeviceItem key={deviceByType.hdmiDevs[i].id} deviceInfo={deviceByType.hdmiDevs[i]} />);
        }
        break;
      }
      case 'HDPlayer': {
        for (let i = 0; i < deviceByType.hdPlayerDevs.length; i++) {
          r.push(<DeviceItem key={deviceByType.hdPlayerDevs[i].id} deviceInfo={deviceByType.hdPlayerDevs[i]}/>);
        }
        break;
      }
      case 'ANALOG': {
        for (let i = 0; i < deviceByType.analogDevs.length; i++) {
          r.push(<DeviceItem key={deviceByType.analogDevs[i].id} deviceInfo={deviceByType.analogDevs[i]} />);
        }
        break;
      }
      case 'USB': {
        if (deviceByType.usbDevs.length > 0)
        {
          for (let i = 0; i < deviceByType.usbDevs.length; i++) {
            r.push(<DeviceItem key={deviceByType.usbDevs[i].id} deviceInfo={deviceByType.usbDevs[i]} />);
          }
        }/* else {
          r.push( this.renderNoDeviceUSB() );
        }*/
        break;
      }
      case 'Bluetooth': {
        if (deviceByType.bluetoothDevs.length > 0) {
          for (let i = 0; i < deviceByType.bluetoothDevs.length; i++) {
            r.push(<DeviceItem key={deviceByType.bluetoothDevs[i].id} deviceInfo={deviceByType.bluetoothDevs[i]} />);
          }
        }/* else {
          r.push( this.renderNoDeviceBluetooth() );
        }*/
        break;
      }
      case 'network': {
        if (deviceByType.networkDevs.length > 0) {
          for (let i = 0; i < deviceByType.networkDevs.length; i++) {
            r.push(<DeviceItem key={deviceByType.networkDevs[i].id} deviceInfo={deviceByType.networkDevs[i]} />);
          }
        }/* else {
          r.push( this.renderNoDeviceNetwork() );
        }*/
        break;
      }
    }
    return r;
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

  /*renderNoDeviceUSB() {
    return (
      <div key="renderNoDeviceUSB" style={divNoDevice}>
        <img draggable="false" style={imgNoDevice} src={this.imgSrc[0]} />
        <p style={{fontSize:'18px',fontWeight:'700',margin:'15px 0 0 0',color: '#2f2f2f'}}>{lang.getLang('YourUSBdevices')}</p>
        <p style={{fontSize:'15px',fontWeight:'normal',color: '#2f2f2f',margin:'15px 0 0 0'}}>{lang.getLang('Msg03')}</p>
      </div>
    )
  }

  renderNoDeviceBluetooth() {
    var isInWindow = (window.parent == window) ? true : false;
    var str = lang.getLang('Msg06');
    var res = str.split("Music Station");
    var url = MainActions.getCgiOrigin() + '/musicstation/';
    var link = isInWindow ? "Music Station" : (<a style={{cursor:'pointer'}} onClick={this.openMusicStation.bind(this)}>Music Station</a>);

    return (
      <div key="renderNoDeviceBluetooth" style={divNoDevice}>
        <img draggable="false" style={imgNoDevice} src={this.imgSrc[1]} />
        <p style={{fontSize:'18px',fontWeight:'700',margin:'15px 0 0 0',color: '#2f2f2f'}}>{lang.getLang('Msg04')}</p>
        <p style={{fontSize:'15px',fontWeight:'normal',color: '#2f2f2f',margin:'15px 0 0 0'}}>{lang.getLang('Msg05')}</p>
        <p style={{fontSize:'15px',fontWeight:'normal',color: '#2f2f2f',margin:'15px 0 0 0'}}>{res[0]}{link}{res[1]}</p>
      </div>
    )
  }

  renderNoDeviceNetwork() {
    return (
      <div key="renderNoDeviceNetwork" style={divNoDevice}>
        <img draggable="false" style={imgNoDevice} src={this.imgSrc[2]} />
        <p style={{fontSize:'18px',fontWeight:'700',margin:'15px 0 0 0',color: '#2f2f2f'}}>{lang.getLang('Msg07')}</p>
        <p style={{fontSize:'15px',fontWeight:'normal',color: '#2f2f2f',margin:'15px 0 0 0'}}>{lang.getLang('Msg08')}</p>
      </div>
    )
  }*/

  pagingDeviceItem(deviceItemAry) {
    let itemNum = this.state.renderNum;
    let a=[];
    let deviceNum = deviceItemAry.length;
    let rst = deviceItemAry.map(
      (item,index)=>{
        a.push(item);
        if (a.length == itemNum) {
          let rst = a;
          a = [];
          return <div key={index}>{rst}</div>
        }

        if (index+1 == deviceNum) {
          return <div key={index}>{a}</div>
        }
      }
    );
    rst = rst.filter((val)=>{
      if (val != void 0) return true;
    });
    return rst;
  }

  renderEmptyStatus() {
    return null;
    /*return (
    <div key='empty' className='emptyIcon'>
      <div>
        <img src='img/media_playlist/empty_status.png' style={{margin:'auto auto 20px auto'}}/>
        <span>No more Device.</span>
      </div>
    </div>
    ) */
  }

  /**
   * Render
   */

  render() {
    let deviceItemAry = this.renderDeviceItem();
    let deviceNum = deviceItemAry.length;
    if ( deviceNum === 0) {
      return this.state.firstTimeIn
      ? null
      : this.renderEmptyStatus();
    }
    
    let sliderDiv = this.pagingDeviceItem(deviceItemAry);

    let sbStyle = this.state.style_divTypePanel == divTypePanelNoMPL ? 
                    {width:'calc( 100% - 160px)', height:'100%', position:'absolute', left: '80px'} : 
                    {width:'calc( 100% - 465px)', height:'100%', float: 'left', position:'absolute',left: '80px'};

    var settings = {
      dots: true,
      infinite: false,
      speed: 100,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: false,
      swipe: false,
      adaptiveHeight: false,
      nextArrow: <CarouselArrowRight />,
      prevArrow: <CarouselArrowLeft />,
      className: 'slideClass',
      initialSlide: 0,
      useCSS: true,
      //centerMode: true,
      //fade: true,
    };
    
    return (
      <div style={divDevicePanel}>
        {/*this.renderNoDevice()*/}
        <div style={sbStyle} className="devicePanel_sv">
          <Slider {...settings}>
            {sliderDiv}
          </Slider>
        </div>
      </div>
    );
  }
}

class CarouselArrowRight extends React.Component {

  render() {
    let style = {
      ...this.props.style,
      //display: 'block',
    };

    let arrowBtn = this.props.currentSlide + 1 === this.props.slideCount
      ? (<button key="arrowRightBtnDis" className="arrowRightBtnDis" />)
      : (<button key="arrowRightBtn" className="arrowRightBtn" onClick={this.props.onClick} />);

    return (
      <div className={this.props.className}
            onClick={this.props.onClick}
            style={style}>
        {arrowBtn}
      </div>
    );
  }
}

class CarouselArrowLeft extends React.Component {

  render() {
    let style = {
      ...this.props.style,
      //display: 'block',
    };

    let arrowBtn = this.props.currentSlide === 0
      ? (<button key="arrowLeftBtn" style={{position:'absolute',right:'10px'}} className="arrowLeftBtnDis" onClick={this.props.onClick} />)
      : (<button key="arrowLeftBtn" style={{position:'absolute',right:'10px'}} className="arrowLeftBtn" onClick={this.props.onClick} />);

    return (
      <div className={this.props.className}
            onClick={this.props.onClick}
            style={style}>
        {arrowBtn}
      </div>
    );
  }
}

const divDevicePanel = {
  position: 'relative',
  width: '100%',
  //padding: '0 80px 10px 80px',
  height: 'calc(100% - 15px)',
  display: 'table',
  minWidth:'680px',
  //background: 'linear-gradient(to bottom, #015574, #2d363b)'
};

const divTypePanel = {
  //float: 'left',
  //width: 'calc( 100% - 320px )',
  //height: '100%',
  //overflowY: 'auto',
  //position: 'absolute',
  padding: '0 10px 0 0'
};

const divTypePanelNoMPL = {
  //width: 'calc( 100% - 10px)',
  //height: '100%',
  //overflowY: 'auto',
  //position: 'absolute',
  padding: '0 10px 0 0'
};

const divNoDevice = {
  //margin:'0 50px',
  textAlign:'center',
  //paddingTop:'8%',
  width:'100%',
  height:'100%',
};

const imgNoDevice = {
  maxWidth:'700px',
  //marginTop:'20px',
  display:'block',
  margin:'auto'
}
