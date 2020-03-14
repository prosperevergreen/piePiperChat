import * as actionTypes from '../actions';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import axios from '../../../Axios';

let currentUser;

export const chatInit = () => { 
    return (dispatch, getState) => {
        const {userId} = getState().auth;
        // user = userId;
        const chatManager = new ChatManager({
            instanceLocator: 'v1:us1:4241b760-b2b9-4497-b8de-f31bc77db200',
            userId: userId,
            tokenProvider: new TokenProvider({
                url: 'https://us1.pusherplatform.io/services/chatkit_token_provider/v1/4241b760-b2b9-4497-b8de-f31bc77db200/token'
            })
        });    
        chatManager
        .connect({
            onAddedToRoom: room => {
                getRooms();
                getMessages(room);
            }
        })
        .then(user => {
            currentUser = user;
            dispatch(subscribeToRooms(currentUser))
            dispatch(chatInitSuccess(currentUser));
            dispatch(getRooms());
        })
        .catch(err => console.log(err));
    }
}
const getRooms = () => {
    return dispatch => {
        const contacts = currentUser.rooms.map(room => {
            let obj = {};
            let name = !room.isPrivate ? room.name :
                        room.name.split('and')
                            .filter(name => name !== currentUser.id).join('');
            !name.length ? obj.name = currentUser.id : obj.name = name;
            obj.id = room.id;
            return {...room, ...obj};
        });
        dispatch({type: 'ON_ROOMS_FETCHED', contacts})
    }
}
const chatInitSuccess = currentUser => {
    return {
        type: actionTypes.CHAT_INIT_SUCCESS,
        currentUser
    }
}
const onNewMessage = (message, belongsToCurrentRoom) => {
    return {
        type: actionTypes.ON_NEW_MESSAGE,
        message,
        belongsToCurrentRoom
    }
}

const subscriptionSuccessful = rooms => {
    return {
        type: actionTypes.SUBSCRIPTIONSUCCESSFUL,
        rooms
    }
}
const subscribeToRooms = user => {
    return (dispatch, getState) => {
        const contacts = user.rooms;
        // dispatch(subscriptionSuccessful(contacts))
        dispatch(getRooms());
        contacts.map(con => {
            return  user.subscribeToRoom({
                 roomId: con.id,
                 hooks: {
                   onMessage: message => {
                     let belongsToCurrentRoom = false;
                     const { currentRoom } = getState().chat;
                    if (currentRoom && currentRoom.id === message.roomId){
                        belongsToCurrentRoom = true;
                    } 
                    dispatch(onNewMessage(message, belongsToCurrentRoom));
                   }
                 },
                 messageLimit: 0
               })
         })
    }
}

const fetchMessagesSuccess = (messages, room) => {
    return {
        type: actionTypes.FETCH_MESSAGES_SUCCESS,
        messages,
        room
    }
}
export const getMessages = room => {
    return dispatch => {
        currentUser.fetchMessages({
            roomId: room['id'],
            //initialId: 42,
            direction: 'older',
            limit: 100,
          })
            .then(messages => {
              dispatch(fetchMessagesSuccess(messages, room));
            })
            .catch(err => {
              console.log(`Error fetching messages: ${err}`);
            })
    }
   
}
export const sendMessage = data => {
    return dispatch => {
        currentUser.sendMessage(data);
    }
}
const createGroupSuccess = () => {
    return {
        type: actionTypes.CREATE_GROUP_SUCCESS
    }
}
const createGroupFailed = err => {
    return {
        type: actionTypes.CREATE_GROUP_FAILED,
        err
    }
}
export const createNewGroup = data => {
    return dispatch => {
        currentUser.createRoom({
            name: data.name,
            private: false,
            addUserIds: data.participants,
            customData: { foo: 42 },
          }).then(room => {
            console.log(`Created room called ${room.name}`);
            dispatch(createGroupSuccess());
            dispatch(subscribeToRooms());
          })
          .catch(err => {
            console.log(`Error creating room ${err}`);
            dispatch(createGroupFailed(err));
          })
    }
}
const startNewChatSuccess = () => {
    return {
        type: actionTypes.START_NEW_CHAT_SUCCESS
    }
}
const startNewChatFailed = err => {
    return {
        type: actionTypes.START_NEW_CHAT_FAILED,
        err
    }
}
export const startNewChat = data => {
    return dispatch => {
        let token = localStorage.getItem('token');
        axios.get(`/search/${data.chatParticipant}`, {headers: {'x-auth-token': token}})
            .then(res => {
                currentUser.createRoom({
                name: `${currentUser.id}and${data.chatParticipant}`,
                private: true,
                addUserIds: [data.chatParticipant],
                customData: {displayImage: res.data.avatar}     
            })
                .then(res => {
                    console.log(res);
                    dispatch(startNewChatSuccess());
                    dispatch(subscribeToRooms(currentUser));
                })
                .catch(err => {
                    console.log(err);
                    dispatch(startNewChatFailed(err));
                });
            })
            .catch(err => console.log(err));
    }
}
export const joinRoom = roomId => {
    return dispatch => {    
        currentUser.joinRoom({ roomId })
            .then(room => {
                console.log(`Joined room with ID: ${room.id}`)
            })
            .catch(err => {
                console.log(`Error joining room ${roomId}: ${err}`)
            })
    }
}

export const deleteChat = roomId => {
    return dispatch => {
        console.log(typeof roomId)
        currentUser.leaveRoom({ roomId: roomId })
        .then(() => {
          console.log(`Deleted room with ID: ${roomId}`);
          //dispatch(subscribeToRooms());
        //   dispatch(chatInitSuccess());
        })
        .catch(err => {
          console.log(`Error deleted room ${roomId}: ${err}`)
        });
    }
}