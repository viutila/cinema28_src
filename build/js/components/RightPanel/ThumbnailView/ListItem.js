import React from 'react';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import * as MainActions from 'js/actions/MainActions';
import ReactTooltip from 'react-tooltip';

export default class ListItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            devId: this.props.devId,
            itemInfo: this.props.itemInfo,
            onHoverState: false,
            isDbClick: false,
        }
        
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currTrack) {
            this.setState({isDbClick: false});
            this.props.dbClickFunc(false);
        }
        if (this.props.currTrack === !nextProps.currTrack) {
            this.forceUpdate();
        }
    }

    getTotalTime() {
        let totalTime = this.props.itemInfo.total_time;
        totalTime = totalTime.substring(0,2) === '00' ? totalTime.substring(3) : totalTime;
        return !this.state.onHoverState ?
        <p className='mediaTimeText' >{totalTime}</p> :
        null;
        //return null;
    }

    onHoverListItem() {
        this.setState({
            onHoverState: true
        },()=>{ReactTooltip.rebuild();});
        
    }

    onLeaveListItem() {
        this.setState({
        onHoverState: false
        })
    }

    getDelBtn() {
        return this.state.onHoverState
        ?
        <div style={{display:'inline-block',width:'49px',textAlign:'center',margin:'0 10px'}}>
            <button key="deleteItemBtnDev" className="deleteItemBtnDev" onClick={this.clickDelTrack.bind(this)} data-tip={lang.getLang('Remove')} />
        </div>
        : null;

    }

    clickDelTrack() {
        //let dev_id = this.props.devId;
        //const uId = _.find(this.state.playlist.items, { track: track.toString() }).id;
        //const uId = this.props.itemInfo.id;
        //MainActions.delTrack(dev_id, uId);
        const uId = this.props.itemInfo.id;
        const track = this.props.itemInfo.track;
        this.props.delTrackFunc(uId, track);
        ReactTooltip.hide();
    }

    getThumbPlaylist() {
        const thumbDir = this.props.itemInfo.thumb_dir;
        const fileName = this.props.itemInfo.file_name;
        let fileType = {
            audio: 'img/file_type_icons/utilRequest-music.png',
            video: 'img/file_type_icons/utilRequest-video.png',
            photo: 'img/file_type_icons/utilRequest-photo.png',
        };
        let dThumbSrc = fileType[this.props.itemInfo.type];
        return (!Boolean(fileName) || fileName == "(no permission)" || !Boolean(thumbDir) || thumbDir == "(no permission)") 
            ? dThumbSrc
            :
            MainActions.getCgiOrigin() +
            '/cgi-bin/filemanager/utilRequest.cgi?func=get_thumb&path=' +
            encodeURIComponent(thumbDir.replace('/share/CACHEDEV1_DATA/', '')) +
            '&name=' + encodeURIComponent(fileName) +
            '&size=80&sid=' + MainActions.getSid();
    }

    onDBClickHandler(item) {
        console.log("DB Click",item);
        let trackNum = +item.track;
        MainActions.playDeviceTrack(this.props.devId, trackNum);
        //this.setLoadingMask(true);
        this.setState({
            isDbClick: true
        });
        this.props.dbClickFunc(true);
    }

    renderDbClickLoading() {
        return this.state.isDbClick
        ? (
            <div className='dbClickAniDiv' style={{position:'absolute',top:'0',zIndex:'-1'}}></div>
        ) : null;
    }

    imgOnError(e) {
        let fileType = {
            audio: 'img/file_type_icons/utilRequest-music.png',
            video: 'img/file_type_icons/utilRequest-video.png',
            photo: 'img/file_type_icons/utilRequest-photo.png',
        };
        let dThumbSrc = fileType[this.props.itemInfo.type];
        e.target.src = dThumbSrc;
    }

    render() {
        return (
            <div
                className='listItem' 
                key={this.props.itemInfo.id}
                onMouseEnter={this.onHoverListItem.bind(this)}
                onMouseLeave={this.onLeaveListItem.bind(this)}
                onDoubleClick={this.onDBClickHandler.bind(this,this.props.itemInfo)}
                style={{margin:'5px 0'}}
                data-devid = {this.props.devId} 
                data-path = {this.props.itemInfo.file}
                data-title = {this.props.itemInfo.title}
                data-ttime = {this.props.itemInfo.total_time}
                data-thumbdir = {this.props.itemInfo.thumb_dir}
                data-filename = {this.props.itemInfo.file_name}
            >
                    <img src={this.getThumbPlaylist()} className='thumbIcon' onError={this.imgOnError.bind(this)} />
                    <p 
                        className={this.props.currTrack ? 'curtMediaTitleText' : 'mediaTitleText'}
                        data-tip={this.props.itemInfo.title} 
                    >
                    {/* this.props.itemInfo.track + '. ' + this.props.itemInfo.title */}
                    <span>{this.props.itemInfo.title}</span>
                    </p>
                    {this.getTotalTime()}
                    {this.getDelBtn()}
                    {this.renderDbClickLoading()}
            </div>
        )
    }
}

const style = {
    delBtn: {
        position: 'relative',
        //display: 'inline-block',
        //top: '14px',
        //right: '0px',
        left:'40px',
        width: '20px',
        height: '20px',
        border: 'none',
        background: 'url(img/playlist/playlist_delete.png) top left / cover no-repeat',
        //zIndex: '999999999'
    },
}