import _ from 'lodash';
import EventEmitter from 'events';
import dispatcher from '../dispatcher';
import * as MainActions from '../actions/MainActions';

class MainStore extends EventEmitter {
  constructor() {
    super();
    this.mainData = {
      showFilter: false,
      filter: 'all',
      showMode: false,
      mode: 'thumbnail',
      type: 'Overview',
      devices: null,
      deviceByType: {
        hdmiDevs: [],
        analogDevs: [],
        usbDevs: [],
        bluetoothDevs: [],
        networkDevs: [],
        hdPlayerDevs: [],
      },
      devicesNumByStreamingStatus: {
        all: 0,
        onair: 0,
        idle: 0,
      },
      deviceUnmuteVolume: [],
      showAbout: false,
      showHelp: false,
      showQuickStart: false,
      devInfo: null,
      devName_PortLocation: null,
      portLocationPos_x: null,
      portLocationPos_y: null,
      showMediaPlaylist: false,
      showLoadingMask: false,
      showDeviceWizard: false,
      showCinema28Disable: false,

      addPlayDevId: null,

      buildVersion: null,

      checkDep: null,
      ifPlSvg: false,
      playlist: [],
      iconIndexes:{},
    };

    this.dataMPL = {
      shareDirs: null,
      subDirs: null,
      subDirsTotal: null,
      mediaDirs: null,
      filterSubDirs: null,
      filterSubDirsTotal: null,
      listDirs: null,
      path: '',
    }

    this.qSirchPath = [];
    this.qSirchRstPath = [];
    this.qSirchSearchData = null;
    this.qSirchSearchTotalData = null;
    this.btDevices = [];
    this.btDevicesMd = [];

    this.qcXml = null;
    this.qDocRootXml = null;
  }

  getAll() {
    return this.mainData;
  }

  getDeviceByType() {
    // console.log(this.mainData.deviceByType);
    return this.mainData.deviceByType;
  }

  getDeviceByTypeNum() {

    //******* number of hdPlayerDevs is counted in hdmiDevs *******// 
    var rst = this.mainData.deviceByType.hdmiDevs.length + 
              this.mainData.deviceByType.analogDevs.length + 
              this.mainData.deviceByType.usbDevs.length + 
              this.mainData.deviceByType.bluetoothDevs.length + 
              this.mainData.deviceByType.networkDevs.length;
              
    return rst;
  }

  getType() {
    return this.mainData.type;
  }

  setType(v) {
    if ((v === 'Overview' ||
      v === 'HDMI' ||
      v === 'HDPlayer' ||
      v === 'ANALOG' ||
      v === 'USB' ||
      v === 'Bluetooth' ||
      v === 'network'
    ) &&
      this.mainData.type !== v) {
      this.mainData.type = v;
      this.emit('chageType');
    }
  }

  isShowFilter() {
    return this.mainData.showFilter;
  }

  setFilter(v) {
    if ((v === 'all' || v === 'onair' || v === 'idle') && this.mainData.filter !== v) {
      this.mainData.filter = v;
      this.emit('changeFilter');
      this.setAll();
    }
  }

  getFilter() {
    return this.mainData.filter;
  }

  hideFilter() {
    if (this.mainData.showFilter !== false) {
      this.mainData.showFilter = false;
      this.emit('toogleFilter');
    }
  }

  showFilter() {
    if (this.mainData.showFilter !== true) {
      this.mainData.showFilter = true;
      this.emit('toogleFilter');
    }
  }

  isShowMode() {
    return this.mainData.showMode;
  }

  isShowMediaPlaylist() {
    return this.mainData.showMediaPlaylist;
  }

  setMode(v) {
    if ((v === 'thumbnail' || v === 'list' || v === 'simple') && this.mainData.mode !== v) {
      this.mainData.mode = v;
      this.emit('changeMode');
      this.emit('jizz');
      this.setAll();
    }
  }

  getMode() {
    return this.mainData.mode;
  }

  hideMode() {
    if (this.mainData.showMode !== false) {
      this.mainData.showMode = false;
      this.emit('toogleMode');
    }
  }

  showMode() {
    if (this.mainData.showMode !== true) {
      this.mainData.showMode = true;
      this.emit('toogleMode');
    }
  }

  hideMediaPlaylist() {
    if (this.mainData.showMediaPlaylist !== false) {
      this.mainData.showMediaPlaylist = false;
      this.emit('toogleMediaPlaylist');
    }
  }

  showMediaPlaylist() {
    if (this.mainData.showMediaPlaylist !== true) {
      this.mainData.showMediaPlaylist = true;
      this.emit('toogleMediaPlaylist');
    }
  }

  getDevicesNumByStreamingStatus() {
    return this.mainData.devicesNumByStreamingStatus;
  }

  setDevices(data) {
    this.mainData.devices = _.sortBy(data.devices, 'name');
    this.setAll();
  }

  setDevicesTimeout() {
    this.emit('updateDevice');
  }

  getAllDevices() {
    return this.mainData.devices;
  }

  getIfDeviceType(type) {
    var devAry = this.mainData.devices;
    var flag = false;
    if (devAry !== null && devAry !== undefined) {
      devAry.forEach(function(dev) {
      if (dev.type == type) {
          flag = true
        }
      })
    }
    
    return flag;
  }

  getIfHdStationLogin() {
    if (this.mainData.checkDep!==null) {
      let itemsAry = this.mainData.checkDep.items;
      let hdStationItem={};
      itemsAry.forEach(function(item,i){
          if (item.name == "HD_Station"){
              hdStationItem = item;
          }
      });
      return +hdStationItem.login===1;
    } else {
      return false;
    }
  }

  setAll() {
    const type = this.mainData.type;

    this.mainData.devicesByStreamingStatus = {
      all: _.filter(this.mainData.devices, o => {return /^.*$/.test(o.inuse_apps) && o.connected!=='No'}),
      onair: _.filter(this.mainData.devices, o => {return /^.+$/.test(o.inuse_apps) && o.connected!=='No'}),
      idle: _.filter(this.mainData.devices, o => {return /^$/.test(o.inuse_apps) && o.connected!=='No'}),
    };

    const getDevsByTypeAndStatus = function getDevsByTypeAndStatus(status, inputType) {
      /*return _.filter(
        this.mainData.devicesByStreamingStatus[status],
        o => (inputType === 'Overview' ? true : o.inputType === inputType).length);*/
        var devArray = this.mainData.devicesByStreamingStatus[status];
        var HDPlayerDevNum = 0;
        devArray.forEach(function(dev) {
          if (dev.type == "HDPLAYER" && !this.getIfHdStationLogin()) {
            HDPlayerDevNum++;
          }
        }.bind(this))
        return this.mainData.devicesByStreamingStatus[status].length - HDPlayerDevNum;
    }.bind(this);

    this.mainData.devicesNumByStreamingStatus = {
      all: (function () { return getDevsByTypeAndStatus('all', type); } ()),
      onair: (function () { return getDevsByTypeAndStatus('onair', type); } ()),
      idle: (function () { return getDevsByTypeAndStatus('idle', type); } ()),
    };
    this.emit('updateDevicesNumByStreamingStatus');

    this.mainData.deviceByType = {
      hdmiDevs: _.filter(
        this.mainData.devicesByStreamingStatus[this.mainData.filter],
        { type: 'HDMI' }
      ),
      analogDevs: _.filter(
        this.mainData.devicesByStreamingStatus[this.mainData.filter],
        { type: 'ANALOG' }
      ),
      usbDevs: _.filter(
        this.mainData.devicesByStreamingStatus[this.mainData.filter],
        { type: 'USB' }
      ),
      bluetoothDevs: _.filter(
        this.mainData.devicesByStreamingStatus[this.mainData.filter],
        { type: 'Bluetooth' }
      ),
      networkDevs: _.filter(
        this.mainData.devicesByStreamingStatus[this.mainData.filter],
        { type: 'network' }
      ),
      hdPlayerDevs: _.filter(
        this.mainData.devicesByStreamingStatus[this.mainData.filter],
        { type: 'HDPLAYER' }
      ),
    };

    let dlnaDevices = _.filter(this.mainData.deviceByType.networkDevs, {subtype:"DLNA"});
    let airPlayDevices = _.filter(this.mainData.deviceByType.networkDevs, {subtype:"AirPlay"});
    let chromecastDevices = _.filter(this.mainData.deviceByType.networkDevs, {subtype:"Chromecast"});
    this.mainData.deviceByType.networkDevs = dlnaDevices.concat(airPlayDevices, chromecastDevices);

    //console.log(this.mainData.deviceByType.networkDevs);
    this.emit('updateDevice');

    if (this.mainData.devices.length == 0) {
      this.emit('detectDevices',0);
    } else {
      this.emit('detectDevices',1);
    }

    let tmpBtDevices = _.filter(this.mainData.devices, { type: 'Bluetooth' });
    if (tmpBtDevices.length > 0) {
      if (this.btDevices.length === 0) {
        this.btDevices = tmpBtDevices;
      }
      this.btDevicesMd = tmpBtDevices;
      this.emit('getDetectBtDevicesMd');
    }
  }

  setDeviceByType(devId, action) {
    let r;
    _.forEach(this.mainData.deviceByType, (types) => {
      _.forEach(types, (dev) => {
        if (dev.id === devId) {
          r = action(dev);
        }
      });
    });
    return r;
  }

  getDeviceByDevId(devId) {
    let r;
    _.forEach(this.mainData.deviceByType, (types) => {
      _.forEach(types, (dev) => {
        if (dev.id === devId) {
          r = dev;
        }
      });
    });
    return r;
  }

  setDevVol(devId, volume) {
    function action(dev) {
      dev.volume = volume;
    }
    this.setDeviceByType(devId, action);
    this.emit('updateDevice');
  }

  setMute(devId) {
    var tmpData = this.mainData.deviceUnmuteVolume;
    var curVolume = this.getDeviceByDevId(devId).volume;
    tmpData[devId] = +curVolume;
    function action(dev) {
      if (+dev.volume !== 0) {
        dev.unmuteVolume = +dev.volume;
        dev.volume = 0;
      }
    }
    this.setDeviceByType(devId, action);
    this.emit('updateDevice');
  }

  getUnmuteVol(devId) {
    function action(dev) {
      return dev.unmuteVolume;
    }
    //const unmuteVolume = this.setDeviceByType(devId, action);
    var tmpData = this.mainData.deviceUnmuteVolume;
    //var curVolume = this.getDeviceByDevId(devId).volume;
    const unmuteVolume = tmpData[devId];
    return unmuteVolume;
  }

  stopPlayer(devId) {
    function action(dev) {
      dev.inuse_apps = '';
      dev.curr_time = '00:00:00';
      dev.play_state = 'STOP';
      dev.title = '';
    }
    this.setDeviceByType(devId, action);
    this.emit('updateDevice');
  }

  playPlayer(devId, isPlaylist) {
    function action(dev) {
      /*dev.inuse_apps = PlaylistStore.getInuseApps();
      dev.play_state = 'PLAY';
      if (isPlaylist) {
        dev.title = PlaylistStore.getCurtTitle();
        dev.thumb_dir = PlaylistStore.getCurtDir();
        dev.file_name = PlaylistStore.getCurtFilename();
      } else {
        dev.title = 'Loading';
        dev.thumb_dir = null;
        dev.file_name = null;
      }*/
    }
    this.setDeviceByType(devId, action);
    this.emit('updateDevice');
  }

  pausePlayer(devId) {
    function action(dev) {
      dev.play_state = 'PAUSE';
    }
    this.setDeviceByType(devId, action);
    this.emit('updateDevice');
  }

  resumePlayer(devId) {
    function action(dev) {
      dev.play_state = 'PLAY';
    }
    this.setDeviceByType(devId, action);
    this.emit('updateDevice');
  }

  playPrev(devId) {
    function action(dev) {
      /*dev.title = PlaylistStore.getCurtTitle();
      dev.thumb_dir = PlaylistStore.getCurtDir();
      dev.file_name = PlaylistStore.getCurtFilename();*/
    }
    this.setDeviceByType(devId, action);
    this.emit('updateDevice');
  }

  playNext(devId) {
    function action(dev) {
      /*dev.title = PlaylistStore.getCurtTitle();
      dev.thumb_dir = PlaylistStore.getCurtDir();
      dev.file_name = PlaylistStore.getCurtFilename();*/
    }
    this.setDeviceByType(devId, action);
    this.emit('updateDevice');
  }

  hideAbout() {
    if (this.mainData.showAbout !== false) {
      this.mainData.showAbout = false;
      this.emit('toogleAbout');
    }
  }

  showAbout() {
    if (this.mainData.showAbout !== true) {
      this.mainData.showAbout = true;
      this.emit('toogleAbout');
    }
  }

  showBrowsePathPanel() {
    this.emit('showBrowsePathPanel');
  }

  hideHelp() {
    if (this.mainData.showHelp !== false) {
      this.mainData.showHelp = false;
      this.emit('toggleHelp');
    }
  }

  showHelp() {
    if (this.mainData.showHelp !== true) {
      this.mainData.showHelp = true;
      this.emit('toggleHelp');
    }
  }

  hideQuickStart() {
    //if (this.mainData.showQuickStart !== false) {
      //this.mainData.showQuickStart = false;
      this.emit('toogleQuickStart');
    //}
  }

  showQuickStart() {
    //if (this.mainData.showQuickStart !== true) {
      //this.mainData.showQuickStart = true;
      this.emit('toogleQuickStart');
    //}
  }

  showSchool() {
    this.emit('toogleSchool');
  }

  toogleMPLTutorial() {
    this.emit('toogleMPLTutorial');
  }

  // ******* RefreshPage *******/
  refreshPage() {
    let oriDeviceData = this.mainData.deviceByType;
    this.mainData.deviceByType = {
      hdmiDevs: [],
      analogDevs: [],
      usbDevs: [],
      bluetoothDevs: [],
      networkDevs: [],
      hdPlayerDevs: []
    };
    //console.log(oriDeviceData);
    this.emit("refreshPage");
    
    setTimeout( ()=>{
      this.mainData.deviceByType = oriDeviceData;
      this.emit('updateDevice');
    },350);
    

  }

  // ******* Toogle DeviceInfo PopUp ******* //
  toogleDeviceInfo(devInfo) {
    this.mainData.devInfo = devInfo;
    this.emit("toogleDeviceInfo");
  }
  getDevInfo() {
    return this.mainData.devInfo;
  }

  // ******* Toogle Port Location ******* //
  tooglePortLocation(devName,x,y) {
    this.mainData.devName_PortLocation = devName;
    this.mainData.portLocationPos_x = x;
    this.mainData.portLocationPos_y = y;
    this.emit("tooglePortLocation");
  }

  toogleLoadMask(v) {
    this.mainData.showLoadingMask = v;
    this.emit("toogleLoadingMask");
  }
  getShowLoadingMask() {
    return this.mainData.showLoadingMask;
  }
  getPLDevName() {
    var obj = {
                name: this.mainData.devName_PortLocation,
                x: this.mainData.portLocationPos_x,
                y: this.mainData.portLocationPos_y
              }
    return obj;
  }


  renameNickName() {
    //MainActions.getDevices();
    this.toogleDeviceInfo(this.mainData.devInfo);
    setTimeout(()=>{
      MainActions.getDeviceIcon(this.mainData.devInfo.id);
    })
    console.log("rename nickname!");
  }

  setShareDirs(data) {
    this.dataMPL.shareDirs = data;
    this.emit("getShareDirsDone");
  }

  getShareDirs() {
    return this.dataMPL.shareDirs;
  }

  setSubDirs(data) {
    this.dataMPL.subDirs = data;
    this.emit("getSubDirsDone");
  }

  setSubDirsTotal(data) {
    this.dataMPL.subDirsTotal = data;
    this.emit("getSubDirsTotalDone");
  }

  getSubDirsTotal() {
    return this.dataMPL.subDirsTotal;
  }

  setFilterSubDirs(data) {
    this.dataMPL.filterSubDirs = data;
    this.emit("getFilterSubDirsDone");
  }

  setFilterSubDirsTotal(data) {
    this.dataMPL.filterSubDirsTotal = data;
    this.emit("getFilterSubDirsTotalDone");
  }

  getSubDirs() {
    return this.dataMPL.subDirs;
  }

  getFilterSubDirs() {
    return this.dataMPL.filterSubDirs;
  }

  getFilterSubDirsTotal() {
    return this.dataMPL.filterSubDirsTotal;
  }

  setMediaDirs(data, ifLocal) {
    if (ifLocal===1) {
      this.dataMPL.mediaDirs = data;
      this.emit("getMediaDirsDone", 1);
    } else {
      this.dataMPL.mediaDirs.content.remote = data.content.remote;
      this.emit("getMediaDirsDone", 0);
    }
  }
  errorGetMediaDirs() {
    this.emit("errorGetMediaDirs", 1);
  }

  setListDirs(data,path) {
    this.dataMPL.path = path;
    this.dataMPL.listDirs = data;
    this.emit("getListDirsDone");
  }

  getMediaDirs() {
    return this.dataMPL.mediaDirs;
  }

  getListDirs() {
    return this.dataMPL.listDirs;
  }
  getListDirsPath() {
    return this.dataMPL.path;
  }

  addPlayDone(dev_id) {
    this.mainData.addPlayDevId = dev_id
    this.emit("addPlayDone",dev_id);
  }

  getBuildVersionDone(data) {
    this.mainData.buildVersion = data;
    this.emit("getBuildVersionDone");
  }

  getBuildVersion() {
    return this.mainData.buildVersion;
  }

  getCheckDepDone(data) {
    this.mainData.checkDep = data;
    this.emit("getCheckDepDone");
  }

  getCheckDep() {
    return this.mainData.checkDep
  }

  changeLangDone() {
    this.emit("changeLangDone");
  }

  setUserDataDone(data) {
    console.log(data);
  }

  getUserDataDone(data) {
    if (data.value == "1") {
      this.mainData.showQuickStart = true;
    } else if (data.value == "0") {
      this.mainData.showQuickStart = false;
    } else {
      this.mainData.showQuickStart = true;
    }
    this.emit("getUserDataDone");
    //console.log("getUserDataDone",data);
  }

  getShowQuickStart() {
    return this.mainData.showQuickStart;
  }

  getPlSvgDone(flag) {
    this.mainData.ifPlSvg = flag;
  }

  getPlSvg() {
    return this.mainData.ifPlSvg;
  }

  getPlaylistDone(data, uuid) {
    let msg = data.msg;
    if (msg.indexOf('no playlist title now') > -1) {
      console.log(msg);
      this.emit('getPlaylistDone',data.id, uuid);
      return false;
    }
    let playlistAry = this.mainData.playlist;
    let playlistLength = playlistAry.length;
    if (playlistLength > 0) {
      for (let i=0;i<playlistLength;i++) {
        if (playlistAry[i].id == data.id) {
          playlistAry[i] = data;
          break;
        } else if (i+1 == playlistLength) {
          playlistAry.push(data);
          break;
        }
      }
    } else {
      playlistAry.push(data);
    }
    this.emit('getPlaylistDone',data.id, uuid);
    //console.log(playlistAry);
  }

  getPlaylistByDevId(dev_id) {
    let rst;
    let playlistAry = this.mainData.playlist;
    let playlistLength = playlistAry.length;
    for (let i=0;i<playlistLength;i++) {
      if (playlistAry[i].id == dev_id) {
        rst = playlistAry[i];
      }
    }
    return rst;
  }

  delPlaylistByDevId(dev_id) {
    let rst;
    let playlistAry = this.mainData.playlist;
    let playlistLength = playlistAry.length;
    //console.log('delPlaylistByDevId1',this.mainData.playlist);
    try {
      for (let i=0;i<playlistLength;i++) {
        if (playlistAry[i].id == dev_id) {
          playlistAry.splice(i,1);
        }
      }
    } catch(err) {
      console.log('playlistAry.splice(i,1); Error!');
    }
    
    //console.log('delPlaylistByDevId2',this.mainData.playlist);
    return rst;
  }

  addQsirchPath(path) {
    let idx = this.qSirchPath.indexOf(path);
    if (idx == -1) {
      this.qSirchPath.push(path);
    }
    this.handleQsirchPathRst();
    this.emit("addQsirchPathDone");
  }

  getQsirchDone(data) {
    this.qSirchSearchData = data;
    this.emit("getQsirchDone");
  }

  getQsirchTotalDone(data) {
    this.qSirchSearchTotalData = data;
    this.emit("getQsirchTotalDone");
  }

  getQsirchSearchData() {
    return this.qSirchSearchData;
  }

  getQsirchSearchTotalData() {
    return this.qSirchSearchTotalData;
  }

  removeQsirchPath(path) {
    let idx = this.qSirchPath.indexOf(path);
    if (idx > -1) {
      //this.qSirchPath.splice(path,1);
    }
    _.remove(this.qSirchPath, function(n) {
      return n === path;
    })
    this.handleQsirchPathRst();
    this.emit("addQsirchPathDone");
  }

  getQsirchPath() {
    return this.qSirchPath;
  }

  handleQsirchPathRst() {

    let qSirchPathArray = this.getQsirchPath();
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
    this.qSirchRstPath = pathAry;
    
  }

  getQsirchRstPath() {
    return this.qSirchRstPath;
  }

  selectQsirchPathDone() {
    this.handleQsirchPathRst();
    this.emit("selectQsirchPathDone")
  }

  refreshBPP() {
    this.emit("refreshBPP");
  }

  setDeviceIcon(data){
    this.mainData.iconIndexes[data.devId] = data.value;
    this.emit('iconUpdated', data.devId);
  }

  getDeviceIcon(id){
    return this.mainData.iconIndexes[id];
  }

  addToTrackDone() {

  }

  pushNotification(msg) {
    this.emit('pushNotification',msg);
  }

  getBtScanDone(data) {
    this.btDevices = data.devices;
    this.emit('getBtScanDone');
  }

  getBtScanFail() {
    this.emit('getBtScanFail');
  }

  getBtDevices() {
    return this.btDevices;
  }

  getBtDevicesMd() {
    return this.btDevicesMd;
  }

  getBtAdapterScanDone(data) {
    if (data.adapters.length > 0) {
      this.emit('getBtAdapterScanDone',true);
    } else {
      this.emit('getBtAdapterScanDone',false);
    }
  }
  doBtPairDone(data, devId) {
    //this.btDevices = data.devices;

    let respDevices = data.devices;
    respDevices.forEach(function(ele1) {
      if (ele1.id === devId) {
        this.btDevices.forEach(function(ele2,index,theArray) {
          if (ele2.id === devId) {
            theArray[index] = ele1;
          }
        })
      }
    }.bind(this))

    this.emit('doBtPairDone', devId);
  }
  doBtRemove(data, devId) {
    let respDevices = data.devices;

    let removeIdx = -1;
    this.btDevices.forEach(function(ele2,index,theArray) {
      if (ele2.id === devId) {
        removeIdx = index;
      }
    })

    if (removeIdx > -1)
      this.btDevices.splice(removeIdx, 1);

    this.emit('doBtRemoveDone', devId);
  }
  doBtConnect(data, devId) {
    let respDevices = data.devices;
    respDevices.forEach(function(ele1) {
      if (ele1.id === devId) {
        this.btDevices.forEach(function(ele2,index,theArray) {
          if (ele2.id === devId) {
            theArray[index] = ele1;
          }
        })
      }
    }.bind(this))
    
    this.emit('doBtConnectDone', devId);
  }

  switchPlaySend(fromDevId, toDevId, fromListTitle) {
    console.log('switchPlaySend:', fromDevId, toDevId, fromListTitle);
    this.emit('switchPlaySend' ,toDevId, fromListTitle);
  }

  getQpkgCenterXmlDone(data) {
    this.qcXml = data;
    //console.log(data);
    this.emit('getQpkgCenterXmlDone');
  }
  getQpkgCenterXml() {
    return this.qcXml;
  }

  getQdocRootXmlDone(data) {
    this.qDocRootXml = data;
  }
  getQdocRootXml(data) {
    return this.qDocRootXml;
  }

  getShowDeviceWizard() {
    return this.mainData.showDeviceWizard;
  }

  toggleDeviceWizard(v) {
    this.mainData.showDeviceWizard = v;
    this.emit('toggleDeviceWizardDone');
  }

  toggleCinema28Stop(v) {
    if (this.mainData.showCinema28Disable !== v) {
      this.mainData.showCinema28Disable = v;
      this.emit('cinema28Disable');
      if (v) {
        this.refreshPage();
      }
    }
  }

  getShowCinema28Disable() {
    return this.mainData.showCinema28Disable;
  }

  loginHDSDone(data) {
    this.emit('loginHDSDone',data);
    console.log('loginHDSDone!!!!!!!!!!!!!!!!!!!!',data);
  }

  handleActions(action) {
    switch (action.type) {
      case 'SET_FILTER': {
        this.setFilter(action.value);
        break;
      }
      case 'SHOW_FILTER': {
        this.showFilter();
        break;
      }
      case 'HIDE_FILTER': {
        this.hideFilter();
        break;
      }
      case 'SET_MODE': {
        this.setMode(action.value);
        break;
      }
      case 'SHOW_MODE': {
        this.showMode();
        break;
      }
      case 'HIDE_MODE': {
        this.hideMode();
        break;
      }
      case 'SET_TYPE': {
        this.setType(action.value);
        break;
      }
      case 'SET_DEVICES': {
        this.setDevices(action.data);
        break;
      }
      case 'SET_DEVICES_TIMEOUT': {
        this.setDevicesTimeout();
        break;
      }
      case 'SET_DEV_VOLUME': {
        this.setDevVol(action.devId, action.volume);
        break;
      }
      case 'SET_MUTE': {
        this.setMute(action.devId);
        break;
      }
      case 'STOP_PLAYER': {
        this.stopPlayer(action.devId, action.isPlaylist);
        break;
      }
      case 'PLAY_PLAYER': {
        this.playPlayer(action.devId, action.isPlaylist);
        break;
      }
      case 'PAUSE_PLAYER': {
        this.pausePlayer(action.devId, action.isPlaylist);
        break;
      }
      case 'RESUME_PLAYER': {
        this.resumePlayer(action.devId, action.isPlaylist);
        break;
      }
      case 'PLAY_NEXT': {
        this.playNext(action.devId);
        break;
      }
      case 'PLAY_PREV': {
        this.playPrev(action.devId);
        break;
      }
      case 'SHOW_ABOUT': {
        this.showAbout();
        break;
      }
      case 'SHOW_BROWSE_PATH_PANEL': {
        this.showBrowsePathPanel();
        break;
      }
      case 'HIDE_ABOUT': {
        this.hideAbout();
        break;
      }
      case 'SHOW_HELP': {
        this.showHelp();
        break;
      }
      case 'HIDE_HELP': {
        this.hideHelp();
        break;
      }
      case 'SHOW_QUICKSTART': {
        this.showQuickStart();
        break;
      }
      case 'SHOW_SCHOOL': {
        this.showSchool();
        break;
      }
      case 'HIDE_QUICKSTART': {
        this.hideQuickStart();
        break;
      }
      case 'TOOGLE_MPL_TUTORIAL': {
        this.toogleMPLTutorial();
        break;
      }
      case "REFRESH_PAGE" :{
        this.refreshPage();
        break;
      }
      case "TOOGLE_DEVICEINFO": {
        this.toogleDeviceInfo(action.devInfo);
        break;
      }
      case "TOOGLE_PORTLOCATION": {
        this.tooglePortLocation(action.devName, action.x, action.y);
        break;
      }
      case "RENAME_NICKNAME": {
        this.renameNickName();
        break;
      }
      case "SHOW_MEDIAPLAYLIST": {
        this.showMediaPlaylist();
        break;
      }
      case "HIDE_MEDIAPLAYLIST": {
        this.hideMediaPlaylist();
        break;
      }
      case "GET_SHARE_DIRS": {
        this.setShareDirs(action.data);
        break;
      }
      case "GET_SUB_DIRS": {
        this.setSubDirs(action.data);
        break;
      }
      case "GET_SUB_DIRS_TOTAL": {
        this.setSubDirsTotal(action.data);
        break;
      }
      case "GET_FILTER_SUB_DIRS": {
        this.setFilterSubDirs(action.data);
        break;
      }
      case "GET_FILTER_SUB_DIRS_TOTAL": {
        this.setFilterSubDirsTotal(action.data);
        break;
      }
      case "GET_MEDIA_DIRS": {
        this.setMediaDirs(action.data, action.pLocal);
        break;
      }
      case "ERROR_GET_MEDIA_DIRS": {
        this.errorGetMediaDirs();
        break;
      }
      case "GET_LIST_DIRS": {
        this.setListDirs(action.data, action.path1);
        break;
      }
      case "ADD_PLAY": {
        this.addPlayDone(action.data);
        break;
      }
      case "TOOGLE_LOADINGMASK": {
        this.toogleLoadMask(action.v);
        break;
      }
      case "GET_BUILD_VERSION": {
        this.getBuildVersionDone(action.data);
        break;
      }
      case "GET_CHECK_DEP": {
        this.getCheckDepDone(action.data);
        break;
      }
      case "CHANGE_LANG": {
        this.changeLangDone();
        break;
      }
      case "SET_USERDATA": {
        this.setUserDataDone(action.data);
        break;
      }
      case "GET_USERDATA": {
        this.getUserDataDone(action.data);
        break;
      }
      case "GET_PL_SVG": {
        this.getPlSvgDone(action.flag);
        break;
      }
      case "GET_PLAYLIST": {
        this.getPlaylistDone(action.data, action.uuid);
        break;
      }
      case "ADD_QSIRCH_PATH": {
        this.addQsirchPath(action.path);
        break;
      }
      case "REMOVE_QSIRCH_PATH": {
        this.removeQsirchPath(action.path);
        break;
      }
      case "SELECT_QSIRCH_PATH_DONE": {
        this.selectQsirchPathDone();
        break;
      }
      case "REFRESH_BPP": {
        this.refreshBPP();
        break;
      }
      case "GET_QSIRCH_DONE": {
        this.getQsirchDone(action.data);
        break;
      }
      case "GET_QSIRCH_TOTAL_DONE": {
        this.getQsirchTotalDone(action.data);
        break;
      }
      case 'UPDATE_DEVICE_ICON':{
        this.setDeviceIcon(action.payload);
        break;
      }
      case 'ADD_TO_TRACK_DONE':{
        this.addToTrackDone();
        break;
      }
      case 'PUSH_NOTIFICATION': {
        this.pushNotification(action.payload);
        break;
      }
      case 'GET_BT_SCAN':{
        this.getBtScanDone(action.data);
        break;
      }
      case 'GET_BT_SCAN_FAIL': {
        this.getBtScanFail();
        break;
      }
      case 'GET_BT_ADAPTER_SCAN':{
        this.getBtAdapterScanDone(action.data);
        break;
      }
      case 'DO_BT_PAIR':{
        this.doBtPairDone(action.data, action.devId);
        break;
      }
      case 'DO_BT_REMOVE':{
        this.doBtRemove(action.data, action.devId);
        break;
      }
      case 'DO_BT_CONNECT':{
        this.doBtConnect(action.data, action.devId);
        break;
      }
      case 'SWITCH_PLAY_SEND':{
        this.switchPlaySend(action.devId, action.newDevId, action.fromListTitle);
        break;
      }
      case 'GET_QPKG_CENTER_XML': {
        this.getQpkgCenterXmlDone(action.data);
        break;
      }
      case 'GET_QDOC_ROOT_XML': {
        this.getQdocRootXmlDone(action.data);
        break;
      }
      case 'TOGGLE_DEVICE_WIZARD': {
        this.toggleDeviceWizard(action.v);
        break;
      }
      case 'CINEMA28_STOP': {
        this.toggleCinema28Stop(action.v);
        break;
      }
      case 'LOGIN_HDS_DONE': {
        this.loginHDSDone(action.data);
        break;
      }
    }
  }
}

const mainStore = new MainStore;
dispatcher.register(mainStore.handleActions.bind(mainStore));
// window.dispatcher = dispatcher;
export default mainStore;
