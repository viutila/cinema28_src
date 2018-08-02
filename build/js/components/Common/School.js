import React from "react";
import Draggable from 'react-draggable';
import * as MainActions from "js/actions/MainActions";
import * as CommonActions from "js/actions/CommonActions";
import Slider from 'react-slick';
import 'css/slick/slick.css';
import 'css/slick/slick-theme.css';

import { lang } from '../MultiLanguage/MultiLanguage';

export default class School extends React.Component {
	constructor(props) {
		super(props);
		this.state={
            divHeight:'0px',
            curIdx: null,
		}
	}

    componentDidMount() {
        this.setState({
            divHeight:'126px',
        })
    }

	closeClick() {
        this.setState({
            divHeight:'0px',
        },()=>{
            setTimeout(()=>{
                MainActions.showSchool();
            },1000);
            
        })
	}

    closeExpand() {
        switch (this.state.divHeight) {
            case '40px': {
                this.setState({
                    divHeight:'126px',
                    curIdx: null,
                })
                break;
            }
            case '126px': {
                this.setState({
                    divHeight:'40px'
                })
                break;
            }
        }
        
    }

    itemClick(idx) {
        this.setState({
            curIdx: idx,
        });
        this.closeExpand();
    }

    getItemTitleArray() {
        let itemTitle = [
            lang.getLang('LTItem01'),
            lang.getLang('LTItem02'),
            lang.getLang('LTItem03'),
            lang.getLang('LTItem04'),
            lang.getLang('LTItem05'),
            lang.getLang('LTItem06'),
            lang.getLang('LTItem07'),
        ];
        return itemTitle;
    }

    renderItems() {
        let itemTitle = this.getItemTitleArray();
        let itemDivAry = [];
        let that = this;
        itemTitle.forEach(function(title,idx) {
            itemDivAry.push(
                <div key ={idx}>
                    <div style={itemDiv}>
                        <div>
                            <img src='img/school/book_close.svg' />
                        </div>
                        <div style={{marginLeft:'12px'}}>
                            <span style={itemSpan} onClick={that.itemClick.bind(that,idx)}>{title}</span>
                        </div>
                    </div>
                </div>
            )
        });
        return itemDivAry;
    }

    renderBookOpen() {
        let itemTitle = this.getItemTitleArray();
        return this.state.curIdx !== null
        ?
            (
                <div style={{display: 'flex',alignItems: 'center',msFlexAlign: 'center'}}>
                    <div style={{borderLeft:'1px solid #5b5b5b',height:'20px',width:'1px',margin:'20px 20px 0 20px'}} />
                    <div style={{display:'flex'}}>
                        <img src='img/school/book_open.svg' />
                        <span style={{fontSize:'16px',color:'#2f2f2f',marginLeft:'10px'}}>{itemTitle[this.state.curIdx]}</span>
                    </div>
                </div>
            )
        : null;
    }

    renderContent() {
        if (this.state.curIdx === null) {
            return null;
        } else {
            let imgPath = this.state.curIdx === null
            ? null
            : 'img/school/school_0' + (this.state.curIdx+1) + '.png';

            let stringAry = [];
            let contentString = [
                [lang.getLang('LTMsg01'),lang.getLang('LTMsg02'),lang.getLang('LTMsg03')],
                [lang.getLang('Msg04'),lang.getLang('Msg05'),lang.getLang('Msg06')],
                [lang.getLang('YourUSBdevices'),lang.getLang('Msg03')],
                [lang.getLang('Msg07'),lang.getLang('Msg08')],
                [lang.getLang('LTMsg04'),lang.getLang('LTMsg13'),lang.getLang('LTMsg05')],
                [lang.getLang('LTMsg06'),lang.getLang('LTMsg14'),lang.getLang('LTMsg15'),lang.getLang('LTMsg07')],
                [
                    lang.getLang('LTMsg08'),
                    lang.getLang('LTMsg09'),
                    lang.getLang('LTMsg10'),
                    lang.getLang('LTMsg11'),
                    lang.getLang('LTMsg12')
                ],
            ]
            contentString[this.state.curIdx].forEach(function(str,idx) {
                stringAry.push(
                    <p key={idx} style={{fontSize:'16px',color:'#FFFFFF',marginBottom:'14px'}}>{str}</p>
                )
            });
            let textAlignStyle = 'center';
            if (this.state.curIdx === 1 || this.state.curIdx === 4 || this.state.curIdx === 6) {
                textAlignStyle = 'left';
            }
            return (
                <div style={contentDivStyle}>
                    <div style={{position:'absolute',top:'15%',bottom:'0',textAlign:'center'}}>
                        <img src={imgPath} />
                        <div style={{display:'flex',justifyContent:'center',msFlexPack:'center',marginTop:'14px'}}>
                            <div style={{maxWidth:'1000px',textAlign: textAlignStyle}}>
                                {stringAry}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
    


	render() {
        let settingsDefault = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 6,
            slidesToScroll: 1,
            swipeToSlide: false,
            swipe: false,
            adaptiveHeight: false,
            nextArrow: <CarouselArrowRight />,
            prevArrow: <CarouselArrowLeft />,
            className: 'slideClass',
            initialSlide: 0,
            //useCSS: true,
        }
        let settings = {
            ...settingsDefault,
            responsive: [ 
                { breakpoint: 850, settings: { slidesToShow: 2, slidesToScroll: 1 } },
                { breakpoint: 1100, settings: { slidesToShow: 3, slidesToScroll: 1 } },
                { breakpoint: 1350, settings: { slidesToShow: 4, slidesToScroll: 1 } },
                { breakpoint: 1650, settings: { slidesToShow: 5, slidesToScroll: 1 } },
            ],
            //fade: true,
        };

        let bigTitleStyle = {};
        let bigTitleOnClick = null;
        if (this.state.divHeight === '40px') {
            bigTitleStyle = {
                cursor: 'pointer'
            }
            bigTitleOnClick = this.closeExpand.bind(this);
        }

        
		return (
            <div>
                <div id="mask_gg" style={{...divMask, height: this.state.divHeight,overflow:'hidden',zIndex:'2'}} >
                    <div style={{height:'40px',width:'100%',display: 'flex',alignItems: 'center',msFlexAlign: 'center'}}>
                        <div style={{...bigTitleStyle,display:'flex',alignItems:'center',msFlexAlign: 'center'}} onClick={bigTitleOnClick}>
                            <img src='img/school/hat_big.svg' style={{marginLeft:'35px'}} />
                            <span style={{fontSize:'16px',color:'#5b5b5b',marginLeft:'10px'}}>Cinema28 {lang.getLang('Little Tutor')}</span>
                        </div>
                        

                        {this.renderBookOpen()}

                        <button className='stdButton' style={closeBtn} onClick={this.closeClick.bind(this)}>
                            <img src='img/sys/btn_close.png' />
                            <span style={{marginLeft:'5px',fontSize:'14px',color:'#2f2f2f'}}></span>關閉
                        </button>
                    </div>
                    
                    <div style={{padding:'20px 45px 0'}}>
                        <Slider {...settings}>
                            {this.renderItems()}
                        </Slider>
                    </div>
                    
				</div>
                {this.renderContent()}
            </div>
				
		)
	}
}

const divMask = {
	width: '100%',
	height: '40px',
	position: 'absolute',
	top: '54px',
	left: '0px',
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
    background: 'linear-gradient(to bottom, #ffffff, #b9e8ff)',
    outline:'1px solid #b0b0b0',
    transitionTimingFunction: 'ease',
    transition: 'height 1s',
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

const closeBtn = {
    position:'absolute',
    right:'20px',
    borderRadius:'8px',
    backgroundColor:'rgba(0,0,0,0)',
}

const itemSpan = {
    fontSize:'14px',
    color:'#2f2f2f',
    cursor: 'pointer',
}

const itemDiv = {
    width: '250px',
    display:'flex',
    alignItems: 'flex-start',
    msFlexAlign: 'start',
}

const contentDivStyle = {
    position:'absolute',
    top:'94px',
    width:'100%',
    height:'calc(100% - 94px)',
    backgroundColor: 'rgba(0,0,0,0.75)',
    display:'flex',
    justifyContent:'center',
    msFlexPack: 'center',
    zIndex: '2',
}


class CarouselArrowRight extends React.Component {

  render() {
    let style = {
      ...this.props.style,
      width: 'auto',
      height: 'auto',
      top:'10px',
      //display: 'block',
    };

    let cname = this.props.className;

    let arrowBtn = cname.indexOf('slick-disabled') === -1
    ? (<button key="arrowRightSchoolBtn" className="arrowRightSchoolBtn" onClick={this.props.onClick} />)
    : (<button key="arrowRightSchoolBtn" className="arrowRightSchoolBtnDis" onClick={this.props.onClick} />);

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
      width: 'auto',
      height: 'auto',
      top:'10px',
      //display: 'block',
    };

    let arrowBtn = this.props.currentSlide === 0
      ? (<button key="arrowLeftSchoolBtn" style={{}} className="arrowLeftSchoolBtnDis" onClick={this.props.onClick} />)
      : (<button key="arrowLeftSchoolBtn" style={{}} className="arrowLeftSchoolBtn" onClick={this.props.onClick} />);

    return (
      <div className={this.props.className}
            onClick={this.props.onClick}
            style={style}>
        {arrowBtn}
      </div>
    );
  }
}