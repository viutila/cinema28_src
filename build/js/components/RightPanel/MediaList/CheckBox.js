import React from 'react';

export default class CheckBox extends React.Component {
    constructor(props) {
        super(props);

        switch (this.props.checked)
        {
            case true:
                this.state = {
                    checked: this.props.checked,
                }
                break;
            case false:
                this.state = {
                    checked: this.props.checked,
                }
                break;
        }

        if (this.props.checkAll) {
            this.state = {
                checked: true,
            }
            this.props.clickFunc(true, this.props.fileObj);
        }
        
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.checkAll != nextProps.checkAll){
            this.setState({
                checked: !nextProps.checkAll
            },()=>{this.handleClick();});
        }

        if (this.props.checked != nextProps.checked){
            this.setState({
                checked: !nextProps.checked
            },()=>{this.handleClick();});
        }
    }
    handleClick() {
        switch (this.state.checked)
        {
            case true:
                this.setState({
                    checked: false,
                });
                break;
            case false:
                this.setState({
                    checked: true,
                });
                break;
        }
        var flag = this.state.checked;
        if (this.props.clickFunc != null)
            this.props.clickFunc(!flag, this.props.fileObj);

        if (this.props.clickFunc2 != null)
            this.props.clickFunc2(this.props.index,!flag);
    }

    handleClickTrue() {

        this.setState({
            checked: true,
        });

        var flag = false;
        if (this.props.clickFunc != null)
            this.props.clickFunc(!flag, this.props.fileObj);

        if (this.props.clickFunc2 != null)
            this.props.clickFunc2(this.props.index,!flag);
    }
    handleClickFalse() {

        this.setState({
            checked: false,
        });

        var flag = true;
        if (this.props.clickFunc != null)
            this.props.clickFunc(!flag, this.props.fileObj);

        if (this.props.clickFunc2 != null)
            this.props.clickFunc2(this.props.index,!flag);
    }

    render() {
        let imgSrc = this.state.checked
            ? 'img/media_playlist/v3_icon/device_file_1.svg'
            : 'img/media_playlist/v3_icon/device_file_0.svg';
        return(
            <img
                src={imgSrc}
                onClick={this.handleClick.bind(this)}
                style={{...this.props.imgStyle,width:'28px',height:'28px'}}
            />
        );
    }
}