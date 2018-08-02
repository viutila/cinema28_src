import React from 'react';
import { lang } from 'js/components/MultiLanguage/MultiLanguage';
import * as MainActions from 'js/actions/MainActions';

export default class ListItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        devId: this.props.devId,
        itemInfo: this.props.itemInfo,
        onHoverState: false,
        }
        
    }

    getTotalTime() {
        let totalTime = this.props.itemInfo.total_time;
        totalTime = totalTime.substring(0,2) === '00' ? totalTime.substring(3) : totalTime;
        return (
            <p className='mediaTimeText1' >{totalTime}</p>
        );
    }

    onHoverListItem() {
        this.setState({
        onHoverState: true
        })
    }

    onLeaveListItem() {
        this.setState({
        onHoverState: false
        })
    }

    getDelBtn() {
        return this.state.onHoverState
        ?
        <span style={{marginRight:'15px',float: 'right',lineHeight:'44px'}}>
            <button key="deleteItemBtn" className="deleteItemBtn" onClick={this.clickDelTrack.bind(this)} data-tip={lang.getLang('Remove')} />
        </span>
        : null;

    }

    clickDelTrack(track) {
        let dev_id = this.props.devId;
        //const uId = _.find(this.state.playlist.items, { track: track.toString() }).id;
        const uId = this.props.itemInfo.id;
        MainActions.delTrack(dev_id, uId);
    }

    getThumbPlaylist() {
        const thumbDir = this.props.itemInfo.thumb_dir;
        const fileName = this.props.itemInfo.file_name;
        return (fileName === null || fileName == "(no permission)" || thumbDir == null || thumbDir == "(no permission)") ?
            'img/mainpage/slice/thumbnail_default_onair.png'
            :
            MainActions.getCgiOrigin() +
            '/cgi-bin/filemanager/utilRequest.cgi?func=get_thumb&path=' +
            encodeURIComponent(thumbDir.replace('/share/CACHEDEV1_DATA/', '')) +
            '&name=' + encodeURIComponent(fileName) +
            '&size=80&sid=' + MainActions.getSid();
    }

    render() {
        return (
            <div
                className='listItem' 
                key={this.props.itemInfo.id}
                onMouseEnter={this.onHoverListItem.bind(this)}
                onMouseLeave={this.onLeaveListItem.bind(this)}
                //onDoubleClick={this.onDBClickHandler.bind(this,this.state.playlist.items[i])}
                style={{margin:'5px 0'}}
            >
                    <img src={this.getThumbPlaylist()} className='thumbIcon' />
                    <p className={this.props.currTrack ? 'curtMediaTitleText1' : 'mediaTitleText1'}
                    data-tip={this.props.itemInfo.title} 
                    >
                        <span>{this.props.itemInfo.title}</span>
                    </p>
                    {this.getTotalTime()}
                    {/*this.getDelBtn()*/}
                    
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