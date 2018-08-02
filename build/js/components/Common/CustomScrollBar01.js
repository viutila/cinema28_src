import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

export default class CustomScrollBar01 extends React.Component {

    constructor(props) {
        super(props);
    }


    renderThumbV({ style, ...props }) {
        //const { top } = this.state;
        const thumbStyle = {
            //backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: '1',
            cursor: 'pointer',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.15)',
        };
        return (
            <div
                id = 'csb01ThumbV'
                style={{ ...style, ...thumbStyle }}
                {...props}/>
        );
    }

    renderThumbH({ style, ...props }) {
        //const { top } = this.state;
        const thumbStyle = {
            //backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: '0',
            cursor: 'pointer',
            borderRadius: '6px',
            backgroundColor: 'transparent',
        };
        return (
            <div
                id = 'csb01ThumbH'
                style={{ ...style, ...thumbStyle }}
                {...props}/>
        );
    }

    renderTrackVertical({ style, ...props }) {
        const trackStyle = {
            position: 'absolute',
            width: '6px',
            right: '0px',
            bottom: '0px',
            top: '0px',
            borderRadius: '0',
            backgroundColor: 'transparent',
            marginRight: '4px'
        }
        return (
            <div
                style={{ ...style, ...trackStyle }}
                {...props}/>
        );
    }

    renderTrackHorizontal({ style, ...props }) {
        const trackStyle = {
            position: 'absolute',
            height: '6px',
            right: '2px',
            bottom: '2px',
            left: '2px',
            borderRadius: '0',
            backgroundColor: 'transparent',
        }
        return (
            <div
                style={{ ...style, ...trackStyle }}
                {...props}/>
        );
    }

    render() {
        return(
            <Scrollbars {...this.props} 
                        ref="scrollbars"
                        renderThumbVertical={this.renderThumbV}
                        renderTrackVertical={this.renderTrackVertical}
                        renderThumbHorizontal={this.renderThumbH}
                        renderTrackHorizontal={this.renderTrackHorizontal} />
        )
    }
}