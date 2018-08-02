import _ from 'lodash';
import EventEmitter from 'events';
import dispatcher from '../dispatcher';
import * as MainActions from '../actions/MainActions';

class PlaylistStore extends EventEmitter {
  constructor() {
    super();
    this.playlistData = {
      updateTime: null,
      showList: false,
      devId: null,
      playlist: null,
      stopLoading: false,
      playPauseLoading: false,
      titleStr: '',
      devSubType: '',
      devName: ''
    };
  }

  isShown() {
    return this.playlistData.showList;
  }

  getPlaylist() {
    // console.log(this.playlistData.playlist);
    return this.playlistData.playlist;
  }

  getInuseApps() {
    return this.playlistData.showList ? this.playlistData.playlist.inuse_apps : 'Loading';
  }

  getDevId() {
    return this.playlistData.devId;
  }

  getTitleStr() {
    return this.playlistData.titleStr;
  }

  getDevName() {
    return this.playlistData.devName;
  }

  getStopLoading() {
    return this.playlistData.stopLoading;
  }

  getDevSubType() {
    return this.playlistData.devSubType;
  }

  setStopLoading(v) {
    this.playlistData.stopLoading = v;
    this.emit('btnStatusChanged');
  }

  getPlayPauseLoading() {
    return this.playlistData.playPauseLoading;
  }

  setPlayPauseLoading(v) {
    this.playlistData.playPauseLoading = v;
    this.emit('btnStatusChanged');
  }

  setDevId(id) {
    if (this.playlistData.devId !== id) {
      this.playlistData.devId = id;
    }
  }

  showPlaylist(data, titleStr, devSubType, devName) {
    if (this.playlistData.showList !== true) {
      this.playlistData.showList = true;
      this.playlistData.playlist = data;
      this.playlistData.playlist.unMuteVolume = this.playlistData.playlist.volume;
      this.playlistData.titleStr = titleStr;
      this.playlistData.devSubType = devSubType;
      this.playlistData.devName = devName;
      this.emit('showPlaylist');
      this.emit('togglePlaylist');
    }
  }

  hidePlaylist() {
    if (this.playlistData.showList !== false) {
      this.playlistData.showList = false;
      this.emit('togglePlaylist');
    }
  }

  loadPlaylist(data) {
    this.playlistData.playlist = _.assign(this.playlistData.playlist, data);
    this.emit('updatePlaylist');
  }

  setPlaylistCurtTime(time) {
    if (this.playlistData.playlist.curr_time !== time) {
      this.playlistData.playlist.curr_time = time;
      this.emit('updatePlaylist');
    }
  }

  getCurtTrack() {
    return this.playlistData.playlist.curr_track;
  }

  getDir(track) {
    return this.playlistData.playlist.items[track - 1].thumb_dir;
  }

  getFilename(track) {
    return this.playlistData.playlist.items[track - 1].file_name;
  }

  getCurtTitle() {
    return this.playlistData.playlist.items[this.playlistData.playlist.curr_track - 1].title;
  }

  getTotalTime(track) {
    return this.playlistData.playlist.items[track - 1].total_time;
  }

  getCurtDir() {
    return this.playlistData.playlist.items[this.playlistData.playlist.curr_track - 1].thumb_dir;
  }

  getCurtFilename() {
    return this.playlistData.playlist.items[this.playlistData.playlist.curr_track - 1].file_name;
  }

  getCurtTotalTime() {
    return this.playlistData.playlist.items[this.playlistData.playlist.curr_track - 1].total_time;
  }

  setPlayMode(mode) {
    if (this.playlistData.playlist.play_mode !== mode) {
      this.playlistData.playlist.play_mode = mode;
      this.emit('updatePlaylist');
    }
  }

  playNext() {
    const currTrack = (
      +this.playlistData.playlist.curr_track %
      +this.playlistData.playlist.total_track
    ) + 1;
    this.playlistData.playlist.curr_track = currTrack;
    this.playlistData.playlist.title = this.playlistData.playlist.items[currTrack - 1].title;
    this.playlistData.playlist.file = this.playlistData.playlist.items[currTrack - 1].file;
    this.playlistData.playlist.curr_time = '00:00:00';
    this.emit('updatePlaylist');
  }

  playPrev() {
    const currTrack = (
      +this.playlistData.playlist.curr_track +
      +this.playlistData.playlist.total_track - 2
    ) % +this.playlistData.playlist.total_track + 1;
    this.playlistData.playlist.curr_track = currTrack;
    this.playlistData.playlist.title = this.playlistData.playlist.items[currTrack - 1].title;
    this.playlistData.playlist.file = this.playlistData.playlist.items[currTrack - 1].file;
    this.playlistData.playlist.curr_time = '00:00:00';
    this.emit('updatePlaylist');
  }

  setVol(volume) {
    if (this.playlistData.showList) {
      if (this.playlistData.playlist.volume !== volume) {
        this.playlistData.playlist.volume = volume;
        // this.playlistData.playlist.unmuteVolume = volume;
        this.emit('updatePlaylist');
      }
    }
  }

  setMute() {
    if (this.playlistData.showList) {
      if (this.playlistData.playlist.volume !== 0) {
        this.playlistData.playlist.unmuteVolume = this.playlistData.playlist.volume;
        this.playlistData.playlist.volume = 0;
        this.emit('updatePlaylist');
      }
    }
  }

  getUnmuteVol() {
    return this.playlistData.playlist.unmuteVolume ? this.playlistData.playlist.unmuteVolume : 0;
  }

  stopPlayer() {
    if (this.playlistData.showList) {
      this.playlistData.playlist.play_state = 'STOP';
      this.playlistData.playlist.curr_track = '1';
      this.playlistData.playlist.curr_time = '00:00:00';
      this.emit('updatePlaylist');
    }
  }

  playPlayer() {
    if (this.playlistData.showList) {
      this.playlistData.playlist.play_state = 'PLAY';
      this.playlistData.playlist.curr_track = '1';
      this.emit('updatePlaylist');
    }
  }

  pausePlayer() {
    if (this.playlistData.showList) {
      this.playlistData.playlist.play_state = 'PAUSE';
      this.emit('updatePlaylist');
    }
  }

  resumePlayer() {
    if (this.playlistData.showList) {
      this.playlistData.playlist.play_state = 'PLAY';
      this.emit('updatePlaylist');
    }
  }

  delTrack() {
    console.log('del track');
    //MainActions.updatePlaylist(this.playlistData.devId);
  }

  doNothing() {
    return null;
  }

  reorderPlayingList() {
    this.emit('reorderPlayingList');
  }

  seekTimeDone() {
    this.emit("seekTimeDone");
  }

  playDeviceTrackDone() {
    this.emit('playDeviceTrackDone');
  }

  handleActions(action) {
    switch (action.type) {
      case 'SET_DEVID': {
        this.setDevId(action.devId);
        break;
      }
      case 'SHOW_PLAYLIST': {
        this.showPlaylist(action.data, action.titleStr, action.devSubType, action.devName);
        break;
      }
      case 'HIDE_PLAYLIST': {
        this.hidePlaylist();
        break;
      }
      case 'LOAD_PLAYLIST': {
        this.loadPlaylist(action.data);
        break;
      }
      case 'SET_PLAYLIST_CURT_TIME': {
        this.setPlaylistCurtTime(action.time);
        break;
      }
      case 'SET_PLAYMODE': {
        this.setPlayMode(action.mode);
        break;
      }
      case 'PLAY_NEXT': {
        this.playNext();
        break;
      }
      case 'PLAY_PREV': {
        this.playPrev();
        break;
      }
      case 'SET_VOLUME': {
        this.setVol(action.volume);
        break;
      }
      case 'SET_DEV_VOLUME': {
        this.setVol(action.volume);
        break;
      }
      case 'SET_MUTE': {
        this.setMute();
        break;
      }
      case 'STOP_PLAYER': {
        this.stopPlayer(action.devId);
        break;
      }
      case 'PLAY_PLAYER': {
        this.playPlayer(action.devId);
        break;
      }
      case 'PAUSE_PLAYER': {
        this.pausePlayer(action.devId);
        break;
      }
      case 'RESUME_PLAYER': {
        this.resumePlayer(action.devId);
        break;
      }
      case 'DEL_TRACK': {
        this.delTrack(action.uId);
        break;
      }
      case 'SET_STOP_BTN_LOADING': {
        this.setStopLoading(action.value);
        break;
      }
      case 'SET_PLAY_PAUSE_BTN_LOADING': {
        this.setPlayPauseLoading(action.value);
        break;
      }
      case 'REORDER_PLAYINGLIST': {
        this.reorderPlayingList();
        break;
      }
      case 'SEEK_TIME': {
        this.seekTimeDone();
        break;
      }
      case 'PLAY_DEVICE_TRACK_DONE': {
        this.playDeviceTrackDone();
        break;
      }
      default: {
        this.doNothing(action);
        break;
      }
    }
  }
}

/*const playlistStore = new PlaylistStore;
dispatcher.register(playlistStore.handleActions.bind(playlistStore));
export default playlistStore;*/
