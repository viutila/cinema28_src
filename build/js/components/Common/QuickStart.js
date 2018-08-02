import React from "react";
import Draggable from 'react-draggable';
import * as MainActions from "../../actions/MainActions";
import * as CommonActions from "../../actions/CommonActions";
import { lang } from '../MultiLanguage/MultiLanguage';

export default class QuickStart extends React.Component {
	constructor(props) {
		super(props);
		this.state={
			page: 1,
			totalPage: 4,
		}
		this.gifSrc = [
			'img/quickstart/quickstart_1.png',
			'img/quickstart/quickstart_3.png',
			'img/quickstart/quickstart_4.png',
			'img/quickstart/quickstart_2.png',
		];

		this.titleText = [
			lang.getLang('QuickStartMsg01'),
			lang.getLang('QuickStartMsg03'),
			lang.getLang('QuickStartMsg05'),
			lang.getLang('QuickStartMsg12'),
			lang.getLang('QuickStartMsg15')
		];

		this.contentText = [
			[lang.getLang('QuickStartMsg02'),"\u00a0","\u00a0","\u00a0"],
			[lang.getLang('QuickStartMsg04'),"\u00a0","\u00a0","\u00a0"],
			[lang.getLang('QuickStartMsg06'),"\u00a0","\u00a0","\u00a0"],
			[lang.getLang('QuickStartMsg13'),lang.getLang('QuickStartMsg14'),"\u00a0"],
			[lang.getLang('QuickStartMsg16'),lang.getLang('QuickStartMsg17'),'\u00a0','\u00a0']
		];

	}

	quickStartCloseClick() {
		MainActions.hideQuickStart();
	}

	nextOnClick() {
		this.state.page < this.state.totalPage ?
			(
			this.setState({
				page: this.state.page + 1
			})
		)
		:
		null;
	}

	previousOnClick() {
		this.state.page>1 ?
		(
			this.setState({
				page: this.state.page - 1
			})
		)
		:
		null;
	}
	finishOnClick() {
		var self = this;
		
		var p01 = lang.getLang('QuickStartMsg09');


		var msg = lang.getLang('QuickStartMsg10');
        var res = msg.split("$1");
		var res0 = (<span style={{color:'#195a87',fontSize:'12px'}}>{res[0]}</span>);
		var res1 = (<span style={{color:'#195a87',fontSize:'12px'}}>{res[1]}</span>);



        var moreIcon = (<img src='img/mainpage/slice/more_normal.png' />);
        var fres = ( <div>
						{p01}
						<div style={{marginTop:'40px'}}>{res0}{moreIcon}{res1}</div>
					</div> );
		CommonActions.toggleMsgPopup(
			true, 
			'info',
			fres,
			'Both', 
			lang.getLang('Yes'), 
			lang.getLang('No'),
			function(){
				CommonActions.toggleMsgPopup(false);
				self.quickStartCloseClick();
				MainActions.setUserData("QS",1);
			},
			function(){
				CommonActions.toggleMsgPopup(false);
				self.quickStartCloseClick();
				MainActions.setUserData("QS",0);
			},
    	);
	}

	render() {
		var progressPt = (this.state.page / this.state.totalPage)*100 + "%";
		return (
				<div id="mask" style={divMask} >
					<Draggable bounds="body" cancel="#Link" cancel="#divClose">
						<div style={divQuickStart}>
							{/* Head */}
							<div style={{width: '100%',height: '58px',lineHeight:'58px',borderBottom: '1px solid #b0b0b0',cursor: 'move'}}>
								<span style={{position: 'relative',left:'35px',fontSize:'20px',color: '#000000',float:'left'}}>
									{this.titleText[this.state.page-1]}
								</span>
								<div id="divClose" class="btnClose" onClick={this.finishOnClick.bind(this)} />
							</div>

							{/* Head2 Sub Text */}
							<div style={{width: '100%',maxHeight: '67px',textAlign:'left',margin:'20px 0 20px 0',padding:'0 35px',fontSize:'14px',color:'#2f2f2f'}}>
								{this.contentText[this.state.page-1].map((text,i)=>{
									return <p style={{margin:'0'}} key={i}>{text}</p>
								})}
							</div>
							{/* Main */}
							<div style={{width: '100%',height: '350px'}}>
								<img style={{maxWidth:'100%',maxHeight:'100%'}} src={this.gifSrc[this.state.page-1]} />
							</div>
							{/* Footer - Previous Next Button */}
							<div style={{width: '100%',height:'50px',padding:'10px 35px'}}>
								{this.state.page === this.state.totalPage ? null : <button className='stdButton' style={{float:'left'}} key={1} onClick={this.quickStartCloseClick.bind(this)}>{lang.getLang('Skip')}</button>}
								{this.state.page === this.state.totalPage ? null : <button className='stdButton' style={{float:'right',marginLeft:'8px'}} key={2} onClick={this.nextOnClick.bind(this)}>{lang.getLang('NextPage')}</button>}
								{this.state.page === this.state.totalPage ? <button className='stdButton' style={{float:'right',marginLeft:'8px'}} key={4} onClick={this.finishOnClick.bind(this)}>{lang.getLang('Finish')}</button> : null}
								{this.state.page === 1 ? null : <button className='stdButton' style={{float:'right'}} key={3} onClick={this.previousOnClick.bind(this)}>{lang.getLang('PreviousPage')}</button>}
							</div>
							{/* Progress Bar */}
							<div style={{height:'8px',width:'100%',marginTop:'6px',backgroundColor:'#d9d9d9'}}>
								<div style={{backgroundColor:'#369eff',height:'100%',width: progressPt}}>
								</div>
							</div>
						</div>
					</Draggable>
				</div>
		)
	}
}

const divMask = {
	width: '100%',
	height: '100%',
	position: 'absolute',
	top: '0px',
	left: '0px',
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	textAlign: 'center',
	zIndex: '10000001',
	display: 'flex',
    alignItems: 'center',
	justifyContent: 'center',
	msFlexAlign: 'center',
	msFlexPack: 'center',
};

const divQuickStart = {
    zIndex: '9014',
    width: '900px',
    opacity: '1',    
	backgroundColor: '#FAFAFA',
	boxShadow: '0 2px 4px 1px rgba(0,0,0,0.75)',
	border: '1px solid #b0b0b0',
	display: 'inline-block',
	cursor: 'default'
}