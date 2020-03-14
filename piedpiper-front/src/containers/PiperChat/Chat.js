import React from 'react';
import classes from './Chat.module.css';


const chat = props => {
    var attachedClasses;
    var sender;
    if (props.byCurrentUser){
        attachedClasses = [classes.ByCurrentUser];
        sender = "Me";
    }else{
        attachedClasses = [classes.Chat];
        sender = props.sender;
    }
    return (
        // <div className={classes.Wrapper} style={{position: 'relative'}}>
            <div className={attachedClasses.join('')}>
                <li>
                    <span className={classes.Sender}>{sender}:</span>
                    <br />
                    <span className={classes.Text}>{props.text}</span>
                </li>        
            </div>
        // </div>
    )
}

export default chat;