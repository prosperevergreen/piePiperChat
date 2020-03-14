import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classes from './OptionsDropbar.module.css';
import * as chatActionCreators from '../../../store/actions/actionIndex';

class OptionsDropbar extends Component {

    state = {
        options: this.props.options || []
    }
    componentDidMount () {
        document.addEventListener('click', this.hideOptions);
        window.onresize = this.props.hideOptions;
    }
    hideOptions = event => {
        if (this.optionsRef && !this.optionsRef.contains(event.target)){
            this.props.hideOptions();
        }
    }
    componentWillUnmount(){
        document.removeEventListener('click', this.hideOptions);
    }
    optionClicked = (event, option) => {
        switch(option.name){
            case 'Archive chat':
                alert('Archive chat');
                break;
            case 'Mute': 
                alert('Mute');
                break;
            case 'Exit group':
                this.props.deleteChat(this.props.roomId)
                break;
            case 'Delete chat':
                this.props.deleteChat(this.props.roomId);
                break;
            case 'Log out':
                this.props.history.push('/logout');
                break;
            case 'Profile':
                this.props.showProfile();
                this.props.hideOptions();
                break;
            default:
                break;
        }
    }
    render(){
        let options = null;
        if (this.props.show){
            options = (
                <ul ref={ ul => this.optionsRef = ul} className={classes.OptionsDropbar} style={{top: this.props.position.y  + 'px',
                left: this.props.position.x - 155 + 'px'
                }}>
                    {this.state.options.map((option, i) => {
                        return <li key={option.name} onClick={ e => this.optionClicked(e, option)} >{option.name}</li>
                    })}
                </ul>
            )
        }
        return options;
    }
}
const mapDispatchToProps = dispatch => {
    return {
        deleteChat: roomId => dispatch(chatActionCreators.deleteChat(roomId))
    }
}
export default withRouter(connect(null, mapDispatchToProps)(OptionsDropbar));