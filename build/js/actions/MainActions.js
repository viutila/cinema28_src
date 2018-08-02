import dispatcher from '../dispatcher';
import * as api from "./api";
//import {Promise} from 'es6-promise';
import "babel-polyfill";
import axios from 'axios';

const cgiBinStr = '/cgi-bin/cinema28/mdDevices.cgi?';

export function getCgiOrigin() {
  let cgiOrigin;

  if (!window.location.origin) {
    cgiOrigin = window.location.protocol + "//" 
      + window.location.hostname 
      + (window.location.port ? ':' + window.location.port : '');
  }
  else {
    cgiOrigin = window.location.origin;
  }
  return cgiOrigin;
}

export function setFilter(value) {
  dispatcher.dispatch({
    type: 'SET_FILTER',
    value,
  });
}

export function showFilter() {
  dispatcher.dispatch({
    type: 'SHOW_FILTER',
  });
}

export function hideFilter() {
  dispatcher.dispatch({
    type: 'HIDE_FILTER',
  });
}

export function setMode(value) {
  dispatcher.dispatch({
    type: 'SET_MODE',
    value,
  });
}

export function showMode() {
  dispatcher.dispatch({
    type: 'SHOW_MODE',
  });
}

export function hideMode() {
  dispatcher.dispatch({
    type: 'HIDE_MODE',
  });
}

export function showMediaPlaylist() {
  dispatcher.dispatch({
    type: 'SHOW_MEDIAPLAYLIST',
  });
}

export function hideMediaPlaylist() {
  dispatcher.dispatch({
    type: 'HIDE_MEDIAPLAYLIST',
  });
}

export function setType(value) {
  dispatcher.dispatch({
    type: 'SET_TYPE',
    value,
  });
}

export function getDevices() {
  if (getSid()==null)
  {
    console.log("SID_NULL_RELOAD getDevices 1");
    dispatcher.dispatch({
      type: 'SID_NULL_RELOAD',
    });
  }

  const promise = getDevicePromise();

  promise.then((data) => {
      dispatcher.dispatch({
        type: 'SET_DEVICES',
        data,
      });
    },(reason) => {
      console.log('SET_DEVICES_TIMEOUT',reason);
      dispatcher.dispatch({
        type: 'SET_DEVICES_TIMEOUT',
        reason,
      });
    }
  )
}

export function getDevices2() {
  if (getSid()==null)
  {
    console.log("SID_NULL_RELOAD getDevices 1");
    dispatcher.dispatch({
      type: 'SID_NULL_RELOAD',
    });
  }

  getDevicePromise2();

  /*promise.then((data) => {
      dispatcher.dispatch({
        type: 'SET_DEVICES',
        data,
      });
    },(reason) => {
      console.log('SET_DEVICES_TIMEOUT',reason);
      dispatcher.dispatch({
        type: 'SET_DEVICES_TIMEOUT',
        reason,
      });
    }
  )*/
}

function getDevicePromise2() {
  const getDeviceTimeout = 2000;
  const promise = new Promise((resolve,reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'sid=' + getSid() + '&rnd=' + Math.random();
    var instance = axios.create();
    axios.get(apiUrl,{timeout: 120000})
    .then(function (response) {
      let data = response.data;
      if (+data.ret_code == 0) {
        resolve(data);
      } else if (+data.ret_code == -22) {
        console.log("SID_NULL_RELOAD getDevices -22");
        dispatcher.dispatch({
          type: 'SID_NULL_RELOAD',
        });
      } else if (+data.ret_code == -62) {
        let error = 'Msg: ' + data.msg + ', ret_code: ' + data.ret_code;
        reject(error);
      } else if (+data.ret_code == -26) {
        let error = 'Msg: ' + data.msg + ', ret_code: ' + data.ret_code;
        reject(error);
      } else {
        resolve(data);
        console.log("else data = ", data);
      }
    })
    .catch(function (error) {
      reject(error);
      //console.log(error);
    });
  }).then((data) => {
      setTimeout(function() {
        getDevicePromise2();
      }, getDeviceTimeout);
      //console.log('SET_DEVICES done',data);
      dispatcher.dispatch({
        type: 'SET_DEVICES',
        data,
      });

      dispatcher.dispatch({
        type: 'CINEMA28_STOP',
        v: false,
      });
      
    },(reason) => {
      setTimeout(function() {
        getDevicePromise2();
      }, getDeviceTimeout);
      console.log('%c getDevicePromise2 Catch Error \n' + reason, 'color: red; font-weight: bold;');
      if (reason.response.status === 404) {
        dispatcher.dispatch({
          type: 'CINEMA28_STOP',
          v: true,
          reason,
        });
      }
      dispatcher.dispatch({
        type: 'SET_DEVICES_TIMEOUT',
        reason,
      });
      
    }
  );
  //return promise;
}

export function showPlaylist(devId, titleStr, devSubType, devName) {
  dispatcher.dispatch({
    type: 'SET_DEVID',
    devId,
  });

  toogleLoadingMask(true);

  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=listplay&dev_id=' + devId + 
      '&page=1&count=100&parse=1&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'SHOW_PLAYLIST',
      data,
      titleStr,
      devSubType,
      devName
    });
    toogleLoadingMask(false);
    /* console.log('start loading playlist thumbs');
    var thumbList = [],
        items = PlaylistStore.getPlaylist().items;

    for (let i = 0; i < items.length; i++) {
        thumbList.push(window.location.origin +
            '/cgi-bin/filemanager/utilRequest.cgi?func=get_thumb&path=' +
            encodeURIComponent(items[i].thumb_dir.replace('/share/CACHEDEV1_DATA/', '')) +
            '&name=' + encodeURIComponent(items[i].file_name) +
            '&size=80&sid=' + api.getCookie("NAS_SID"));
    }

    dispatcher.dispatch({
        type: "SET_THUMBS",
        thumbList
    });*/
  });
}

export function hidePlaylist() {
  window.setTimeout(
    () => {
      dispatcher.dispatch({
        type: 'HIDE_PLAYLIST',
      });
    }
  )
}

export function updatePlaylist(devId) {
  const promise = new Promise((resolve) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=listplay&dev_id=' + devId + 
      '&page=1&count=100&parse=1&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code === 0 || +data.ret_code === -200 || +data.ret_code === -1) {
          resolve(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'LOAD_PLAYLIST',
      data,
    });
  });
}

export function setPlayMode(devId, mode) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=setplaymode&dev_id=' + devId + 
      '&mode=' + mode + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    /*dispatcher.dispatch({
      type: 'SET_PLAYMODE',
      mode,
    });*/
  });
}

export function playNext(devId) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=playnext&dev_id=' + devId + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'PLAY_NEXT',
      devId,
    });
  });
}

export function playPrev(devId) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=playprev&dev_id=' + devId + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'PLAY_PREV',
      devId,
    });
  });
}

export function stopDevice(devId) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=stop&dev_id=' + devId + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

function getDevicePromise() {
  const promise = new Promise((resolve,reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr + + 'sid=' + getSid();
    var instance = axios.create();
    axios.get(apiUrl,{timeout: 20000})
    .then(function (response) {
      let data = response.data;
      if (+data.ret_code == 0) {
        resolve(data);
      } else if (+data.ret_code == -22) {
        console.log("SID_NULL_RELOAD getDevices -22");
        dispatcher.dispatch({
          type: 'SID_NULL_RELOAD',
        });
      } else {
        resolve(data);
        console.log("else +data.ret_code=",+data.ret_code);
      }
    })
    .catch(function (error) {
      reject(error);
      console.log(error);
    });
  });
  return promise;
}

export function resumeDevice(devId) {
  const promise1 = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=resume&dev_id=' + devId + 
      '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
          /*dispatcher.dispatch({
            type: 'SET_PLAY_PAUSE_BTN_LOADING',
            value: false,
          });*/
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  /*const promise2 = getDevicePromise();

  dispatcher.dispatch({
    type: 'SET_PLAY_PAUSE_BTN_LOADING',
    value: true,
  });

  promise1.then((data)=>{
    console.log(data);
    return promise2;
  }).then((data)=>{
    console.log(data);
    dispatcher.dispatch({
      type: 'SET_DEVICES',
      data,
    });
    dispatcher.dispatch({
      type: 'RESUME_PLAYER',
      devId,
      isPlaylist,
    });
  });*/
}

export function pauseDevice(devId) {
  const promise1 = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=pause&dev_id=' + devId + 
      '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
          /*dispatcher.dispatch({
            type: 'SET_PLAY_PAUSE_BTN_LOADING',
            value: false,
          });*/
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  /*const promise2 = getDevicePromise();

  dispatcher.dispatch({
    type: 'SET_PLAY_PAUSE_BTN_LOADING',
    value: true,
  })

  promise1.then((data)=>{
    console.log(data);
    return promise2;
  }).then((data)=>{
    console.log(data);
    dispatcher.dispatch({
      type: 'SET_DEVICES',
      data,
    });
    dispatcher.dispatch({
      type: 'PAUSE_PLAYER',
      devId,
      isPlaylist,
    });
  });*/
}

export function playDevice(devId) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=play&dev_id=' + devId + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
          /*dispatcher.dispatch({
            type: 'SET_PLAY_PAUSE_BTN_LOADING',
            value: false,
          });*/
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  /*dispatcher.dispatch({
    type: 'SET_PLAY_PAUSE_BTN_LOADING',
    value: true,
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'PLAY_PLAYER',
      devId,
      isPlaylist,
    });
  });*/
}

export function playDeviceTrack(devId, track) {
  const promise1 = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=play&dev_id=' + devId + 
      '&track=' + track + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  /*const promise2 = getDevicePromise();

  promise1.then((data)=>{
    console.log(data);
    return promise2;
  }).then((data)=>{
    console.log(data);
    dispatcher.dispatch({
      type: 'SET_DEVICES',
      data,
    });
    dispatcher.dispatch({
      type: 'PLAY_DEVICE_TRACK_DONE',
    });
  });*/
}

export function delTrack(devId, uId, listTitle, playApp, track) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=delplay&dev_id=' + devId + 
      '&uid=' + uId + 
      '&list_title=' + listTitle +
      '&play_app=' + playApp +
      '&track=' + track +
      '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'DEL_TRACK',
      uId,
    });
  });
}

export function setPlaylistCurtTime(time) {
  dispatcher.dispatch({
    type: 'SET_PLAYLIST_CURT_TIME',
    time,
  });
}

export function setVol(volume) {
  dispatcher.dispatch({
    type: 'SET_VOLUME',
    volume,
  });
}

export function setDevVol(devId, volume) {
  dispatcher.dispatch({
    type: 'SET_DEV_VOLUME',
    devId,
    volume,
  });
}

export function setMute(devId) {
  const promise = new Promise((resolve) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=setvol&dev_id=' + devId + 
      '&vol=0&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'SET_MUTE',
      devId,
    });
  });
}

export function setUnMute(devId,vol) {
  const promise = new Promise((resolve) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=setvol&dev_id=' + devId + 
      '&vol=' + vol + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  let volume = vol;
  promise.then(() => {
    dispatcher.dispatch({
      type: 'SET_VOLUME',
      volume,
    });
  });
}

export function getSid() {
  let sid;
  if (api.getCookie("NAS_SID")){
    sid = api.getCookie("NAS_SID");
  /*} else if(sessionStorage.getItem('NAS_SID')) {
    sid = sessionStorage.getItem('NAS_SID');*/
  } else{
    sid = api.getCookie("CINEMA_SID");
  }
  return sid;
  //return 'cinema28bdsid';
}

export function getCookie(v) {
    return api.getCookie(v);
}

export function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function delCookie(cname) {
  document.cookie = cname+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export function showAbout() {
  dispatcher.dispatch({
    type: 'SHOW_ABOUT',
  });
}

export function hideAbout() {
  dispatcher.dispatch({
    type: 'HIDE_ABOUT',
  });
}

export function showHelp() {
  dispatcher.dispatch({
    type: 'SHOW_HELP',
  });
}

export function hideHelp() {
  dispatcher.dispatch({
    type: 'HIDE_HELP',
  });
}

export function toggleDeviceWizard(v) {
  dispatcher.dispatch({
    type: 'TOGGLE_DEVICE_WIZARD',
    v
  });
}


export function showQuickStart() {
  dispatcher.dispatch({
    type: 'SHOW_QUICKSTART',
  });
}

export function showSchool() {
  dispatcher.dispatch({
    type: 'SHOW_SCHOOL',
  });
}

export function hideQuickStart() {
  dispatcher.dispatch({
    type: 'HIDE_QUICKSTART',
  });
}

export function toogleMPLTutorial() {
  dispatcher.dispatch({
    type: 'TOOGLE_MPL_TUTORIAL',
  });
}

export function refreshPage() {
    dispatcher.dispatch({
        type: "REFRESH_PAGE",
    })
}

export function toogleDeviceInfo(devInfo) {
  dispatcher.dispatch({
    type: 'TOOGLE_DEVICEINFO',
    devInfo
  });
}

export function tooglePortLocation(devName,x,y) {
  dispatcher.dispatch({
    type: 'TOOGLE_PORTLOCATION',
    devName,
    x,
    y
  });
}

export function renameDevNickName(devId, newName) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=rename&dev_id=' + devId + 
      '&name=' + newName + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'RENAME_NICKNAME',
      devId,
    });
  });
}

export function reorderPlayingList(devId, oldTrack, newTrack, listTitle, playApp) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=reorder&dev_id=' + devId + 
      '&old=' + oldTrack + '&new=' + newTrack + 
      '&list_title=' + listTitle +
      '&play_app='+ playApp +
      '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'REORDER_PLAYINGLIST',
      devId,
    });
  });
}

export function switchPlaySend(devId, newDevId, fromListTitle) {
  dispatcher.dispatch({
    type: 'SWITCH_PLAY_SEND',
    devId,
    newDevId,
    fromListTitle
  });
}

export function switchPlay(devId, newDevId, fromListTitle) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=switchplay&dev_id=' + devId + 
      '&new_dev=' + newDevId + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'SWITCH_PLAY',
      devId,
      newDevId,
      fromListTitle
    });
  });
}

export function deletePlayList(devId,listTitle,playApp) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=delplaylist&dev_id=' + devId +
      '&list_title=' + listTitle + '&play_app=' + playApp +
      '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    /*dispatcher.dispatch({
      type: 'DELETE_PLAY_LIST',
      devId,
    });*/
    console.log('deletePlayList done!',devId);
  });
}

export function getShareDirs() {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=getsharedirs&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_SHARE_DIRS',
      data,
    });
  });
}

export function getSubDirs(path,countNum) {
  let countNumS = 100;
  if (countNum) {
    countNumS = countNum;
  }
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=readdir&dir=' +
      encodeURIComponent(path) +
      '&page=1&count=' +
      countNumS + 
      '&reverse=0&filters=audio,photo,video&sid=' + getSid() +
      '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_SUB_DIRS',
      data,
    });
  });
}

export function getSubDirsTotal(path,countNum) {
  let countNumS = 100;
  if (countNum) {
    countNumS = countNum;
  }
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=readdir&dir=' + 
      encodeURIComponent(path) + 
      '&page=1&count=' + 
      countNumS + 
      '&reverse=0&filters=audio,photo,video&sid=' + getSid() +
      '&rnd=' + Math.random();;
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_SUB_DIRS_TOTAL',
      data,
    });
  });
}

export function getFilterSubDirs(path,filterStr,patternStr,countNum) {
  let countNumS = 100;
  if (countNum) {
    countNumS = countNum;
  }
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=readdir&dir=' + 
      encodeURIComponent(path) + 
      '&page=1&count=' + 
      countNumS + 
      '&reverse=0&filters=' + 
      filterStr + 
      '&pattern=' + 
      patternStr + 
      '&sid=' + getSid() +
      '&rnd=' + Math.random();;
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_FILTER_SUB_DIRS',
      data,
    });
  });
}

export function getFilterSubDirsTotal(path,filterStr,patternStr,cnt) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=readdir&dir=' + 
      encodeURIComponent(path) + 
      '&page=1&count=' + 
      cnt + 
      '&reverse=0&filters=' + 
      filterStr + 
      '&pattern='+ 
      patternStr + 
      '&sid=' + getSid() +
      '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_FILTER_SUB_DIRS_TOTAL',
      data,
    });
  });
}

export function getMediaDirs(pLocal, pRemote) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr + 'act=getmediadirs'
      +'&local=' + pLocal + '&remote=' + pRemote
      + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        reject(error);
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_MEDIA_DIRS',
      data,
      pLocal
    });
  },(reason) => {
    console.log('%c getMediaDirs Catch Error \n' + reason, 'color: red; font-weight: bold;');
    dispatcher.dispatch({
      type: 'ERROR_GET_MEDIA_DIRS',
      reason,
    });
    
  });
}

export function addPlay(devId,filePath) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=addplay&dev_id=' + devId + 
      '&content=' + filePath + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'ADD_PLAY',
      data,
    });
  });
}

export function toogleLoadingMask(v) {
  dispatcher.dispatch({
    type: 'TOOGLE_LOADINGMASK',
    v
  });
}

export function setUserData(key,value) {

  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=setuserdata&key=' + key + 
      '&value=' + value + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    console.log("SET_USERDATA");
    dispatcher.dispatch({
      type: 'SET_USERDATA',
      data,
    });
  });
}

export function getUserData(key) {

  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=getuserdata&key=' + key + 
      '&sid=' + getSid() + '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_USERDATA',
      data,
    });
  });
}

export function addPlayItems(devId, filePathAry, listTitle, playApp, reset) {
  let sid = getSid();
  let resetFlag = reset ? reset.toString() : "0";
  const promise1 = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + '/cgi-bin/cinema28/mdDevices.cgi';

    let tmpData = {
      "action": "addplayitems",
      "sid": sid,
      "dev_id": devId,
      "autoplay": "1",
      "reset": resetFlag,
      "content": filePathAry,
      "list_title": listTitle,
      "play_app": playApp
    };

    axios.post(apiUrl, tmpData,{timeout: 300000})
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise1.then((data)=>{
    dispatcher.dispatch({
      type: 'ADD_PLAY',
      data: devId,
    });
    console.log('ADD_PLAY DONE');
  }, (reason)=>{
    console.log(reason);
    dispatcher.dispatch({
      type: 'ADD_PLAY',
      data: devId,
    });
    //reject(new Error('error occur!'));
    throw new Error('addplayitems rejected!') // 用throw語句
  })

  /*const promise2 = getDevicePromise();

  promise1.then((data)=>{
    console.log(data);
    return promise2;
  }, (reason)=>{
    console.log(reason);
    dispatcher.dispatch({
      type: 'ADD_PLAY',
      data: devId,
    });
    //reject(new Error('error occur!'));
    throw new Error('addplayitems rejected!') // 用throw語句
  }).then((data)=>{
    console.log(data);
    dispatcher.dispatch({
      type: 'SET_DEVICES',
      data,
    });
    dispatcher.dispatch({
      type: 'ADD_PLAY',
      data: devId,
    });
  },(reason)=>{
    console.log(reason);
  });*/
}

export function getBuildVersion() {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=getver&sid=' + getSid() + 
      '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_BUILD_VERSION',
      data,
    });
  });
}

export function getCheckDep() {
  if (getSid()==null)
    return false;
  
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr + 'act=checkdep&sid=' + getSid() + 
      '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_CHECK_DEP',
      data,
    });
  });
}

export function changeLang() {
  dispatcher.dispatch({
    type: 'CHANGE_LANG',
  });
}

export function getPortLocationSvg() {
  const apiUrl = getCgiOrigin() + '/apps/Cinema28/img/device_panel/devices.svg';

  axios
    .head(apiUrl)
    .then(function (response) {
      let flag = true;
      dispatcher.dispatch({
        type: 'GET_PL_SVG',
        flag,
      });
    })
    .catch(function (error) {
      console.log(error);
      let flag = false;
      dispatcher.dispatch({
        type: 'GET_PL_SVG',
        flag,
      });
    });
}

export function seekTime(devId,timeStr) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=seektime&dev_id=' + devId + 
      '&time=' + timeStr + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(() => {
    dispatcher.dispatch({
      type: 'SEEK_TIME',
      devId,
    });
  });
}

export function getPlaylist(devId,uuid,cnt) {

  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=listplay&dev_id=' + 
      devId + 
      '&page=1&count=' + 
      cnt + 
      '&parse=1&sid=' + getSid() 
      + '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        //if (+data.ret_code == 0) {
          resolve(data);
        /*} else {
          reject(data);
        }*/
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(function(data) {
    let uuid = this;
    dispatcher.dispatch({
      type: 'GET_PLAYLIST',
      data,
      uuid,
    });
    //toogleLoadingMask(false);
  }.bind(uuid));
}

export function showBrowsePathPanel() {
  dispatcher.dispatch({
    type: 'SHOW_BROWSE_PATH_PANEL',
  });
}

export function getListDirs(path) {
  let path1 = path === undefined ? '' : path
  let pathStr = path === undefined 
    ? '?auth_token=' + getSid() 
    : '?path='+ path + '&auth_token=' + getSid();

  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + '/qsirch/v1/api/list-dirs' + pathStr;
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        resolve(data);
        /*if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }*/
      })
      .catch(function (error) {
        console.log('%c Unable to getListDirs for qSirch API \n' + error, 'color: LimeGreen; font-weight: bold;');
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_LIST_DIRS',
      data,
      path1
    });
  });
}

export function addQSirchPath(path) {
  dispatcher.dispatch({
    type: 'ADD_QSIRCH_PATH',
    path
  });
}

export function removeQSirchPath(path) {
  dispatcher.dispatch({
    type: 'REMOVE_QSIRCH_PATH',
    path
  });
}

export function selectQSirchPathDone() {
  dispatcher.dispatch({
    type: 'SELECT_QSIRCH_PATH_DONE',
  });
}

export function refreshBPP() {
    dispatcher.dispatch({
        type: "REFRESH_BPP",
    })
}

export function qSirchSearch(paraStr) {
  
  let pathStr = paraStr + '&auth_token=' + getSid();

  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + '/qsirch/v1/api/search?' + pathStr;
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        resolve(data);
        /*if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }*/
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_QSIRCH_DONE',
      data,
    });
  });
}


export function qSirchSearchTotal(paraStr, totalCnt) {
  
  /*let pathStr = paraStr + 
  '&offset=0&limit=' + totalCnt + 
  '&auth_token=' + getSid();*/

  qSirchSearchTotalPromise(paraStr, 0, totalCnt);
  
}

function qSirchSearchTotalPromise(str, offset, totalCnt) {

  

  var totalData = null;

  function f(offset, totalCnt) {

    let limit = totalCnt>1000 
    ? 1000
    :totalCnt;

    console.log('123');

    const promise = new Promise((resolve, reject) => {
    
      let pathStr = str + 
        '&offset=' + offset + '&limit=' + limit + 
        '&auth_token=' + getSid();
      const apiUrl = getCgiOrigin() + '/qsirch/v1/api/search?' + pathStr;
      axios.get(apiUrl)
        .then(function (response) {
          let data = response.data;
          resolve(data);
        })
        .catch(function (error) {
          reject(error);
        });
        
    }).then((data) => {
      
      if (totalData === null) {
        totalData = data;
      } else {
        totalData.items = [...totalData.items, ...data.items];
      }
      let restCnt = totalCnt-limit;
      if (restCnt > 0) {
        f(offset+1000, restCnt);
        //qSirchSearchTotalPromise(str, limit, restCnt);
        console.log('restCnt: ',restCnt);
      } else {
        dispatcher.dispatch({
          type: 'GET_QSIRCH_TOTAL_DONE',
          data: totalData,
        });
      }
    }).catch((error) => {
      console.log('GET_QSIRCH_TOTAL_ERROR',error);
    });
    
  }

  f(offset, totalCnt);
  
}

/* 20170510 Charlie - edit device icon */
export function applyDeviceInfo(devId, newName, iconIndex) {
  const promise1 = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=rename&dev_id=' + devId + 
      '&name=' + newName + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function(response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  });
  const promise2 = new Promise((resolve, reject) => {
    let devIdH = devId.replace(/:/g, "-");
    var apiUrl = getCgiOrigin() + cgiBinStr + 'act=setuserdata&key=' + devIdH + 
      '&value=' + iconIndex + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function(response) {
        let data = response.data;
        if (data.ret_code == '0') resolve(data);
      })
      .catch(function(error) {
        console.log(error);
        reject(error);
      });
  });

  Promise.all([promise1, promise2]).then(function(vals) {
    dispatcher.dispatch({
      type: 'RENAME_NICKNAME',
      devId,
    });
  });
}

export function getDeviceIcon(devId) {
  var pro = getDeviceIconPromise(devId);
  pro.then(function(values){
    var obj = {};
    obj = values;
    dispatcher.dispatch({
      type:'UPDATE_DEVICE_ICON',
      payload: obj
    });
  });
}
/* 20170510 Charlie - edit device icon */

export function setDeviceIcon(devId, iconIndex) {
  const promise2 = new Promise((resolve, reject) => {
    let devIdH = devId.replace(/:/g, "-");
    var apiUrl = getCgiOrigin() + cgiBinStr +
      'act=setuserdata&key=' + devIdH + 
      '&value=' + iconIndex + '&sid=' + getSid();
    axios.get(apiUrl)
      .then(function(response) {
        let data = response.data;
        if (data.ret_code == '0') resolve(data);
      })
      .catch(function(error) {
        console.log(error);
        reject(error);
      });
  });
  promise2.then(function(data) {
    var obj = {
      devId: this,
      value: data,
    };
    dispatcher.dispatch({
      type: 'UPDATE_DEVICE_ICON',
      payload: obj
    });
  }.bind(devId,iconIndex));
}

export function addToTrack(devId, listTitle, content, track) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=addtotrack&' + 
      'dev_id=' + devId + 
      '&list_title=' + listTitle + 
      '&track=' + track + 
      '&sid=' + getSid() +
      '&content=' + encodeURIComponent(content);
      
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'ADD_TO_TRACK_DONE',
      data,
    });
  });
}

function getDeviceIconPromise(devId){
  var result = {
    devId
  };
  return new Promise((resolve, reject) => {
    let devIdH = devId.replace(/:/g, "-");
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=getuserdata&key=' + devIdH + 
      '&sid=' + getSid() + '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function(response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          /*if(data.value != ''){
            result.value = data.value;
          } else{
            result.value = '0';
          }*/
          result.value = data.value;
          resolve(result);
        } else {
          reject(data);
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  });
}

export function pushNotification(msg) {
  dispatcher.dispatch({
    type: 'PUSH_NOTIFICATION',
    payload: msg,
  });
}

export function getBtScan() {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=btscan&sid=' + getSid() + 
      '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then(
    (data) => {
      dispatcher.dispatch({
        type: 'GET_BT_SCAN',
        data,
      });
    },(reason) => {
      console.log('%c getBtScan Catch Error \n' + reason, 'color: red; font-weight: bold;');
      dispatcher.dispatch({
        type: 'GET_BT_SCAN_FAIL',
        reason,
      });
    }
  );
}

export function getBtAdapterScan() {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=btadapter&sid=' + getSid() + 
      '&rnd=' + Math.random();
    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_BT_ADAPTER_SCAN',
      data,
    });
  });
}

export function doBtPair(devId,adapterId) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=btpair&adapter_id=' + adapterId + 
      '&dev_id=' + devId + '&sid=' + getSid() + '&rnd=' + Math.random();

    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        resolve(data);
        /*if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }*/
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'DO_BT_PAIR',
      data,
      devId
    });
  });
}

export function doBtRemove(devId,adapterId) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=btremove&adapter_id=' + adapterId + 
      '&dev_id=' + devId + '&sid=' + getSid() + '&rnd=' + Math.random();

    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        resolve(data);
        /*if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }*/
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'DO_BT_REMOVE',
      data,
      devId
    });
  });
}

export function doBtConnect(devId,adapterId) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr +
      'act=btconn&adapter_id=' + adapterId + 
      '&dev_id=' + devId + '&sid=' + getSid() + '&rnd=' + Math.random();

    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        resolve(data);
        /*if (+data.ret_code == 0) {
          resolve(data);
        } else {
          reject(data);
        }*/
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'DO_BT_CONNECT',
      data,
      devId
    });
  });
}

export function getQDocRootXml() {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + 
      '/cgi-bin/authLogin.cgi?count=' + Math.floor((Math.random() * 100000) + 1);

    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        resolve(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    getQpkgCenterXml();
    dispatcher.dispatch({
      type: 'GET_QDOC_ROOT_XML',
      data,
    });
  });
}

export function getQpkgCenterXml() {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + '/RSS/rssdoc/qpkgcenter_eng.xml' + '?rnd=' + Math.random();;

    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        resolve(data);
      })
      .catch(function (error) {
        console.log('%c getQpkgCenterXml Catch Error \n', 'color: red; font-weight: bold;');
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'GET_QPKG_CENTER_XML',
      data,
    });
  });
}

export function loginHds(userName,password) {
  const promise = new Promise((resolve, reject) => {
    const apiUrl = getCgiOrigin() + cgiBinStr + 'act=loginhds' + 
    '&uname=' + userName + '&pwd=' + password + '&sid=' + getSid() + '&rnd=' + Math.random();

    axios.get(apiUrl)
      .then(function (response) {
        let data = response.data;
        resolve(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  promise.then((data) => {
    dispatcher.dispatch({
      type: 'LOGIN_HDS_DONE',
      data,
    });
  });
}