import {useState, useEffect} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import {getMessages, getDataChat, getChats} from "../../services/chatService";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import SendIcon from '@mui/icons-material/Send';
import ScrollToBottom from "react-scroll-to-bottom";
import {sendMessage} from "../../services/chatService";
import StyledBadgeOffline from "./little/statusOffline";
import StyledBadgeOnline from "./little/statusOnline";
import socket from "../../config/socket";
import AddReactionIcon from '@mui/icons-material/AddReaction';
import "../../App.css"
import {Button, IconButton} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import moment from "moment/moment";
import {ThemeProvider} from "@mui/material/styles";
import {darkTheme} from "../layout/Theme";

export default function ShowChat() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [listMessage, setListMessage] = useState([]);
    const [dataChat, setDataChat] = useState()
    const [showIcon, setShowIcon] = useState(false)
    const [message, setMessage] = useState("");
    const {userData} = useSelector((state) => state.auth?.user);

    const params = useParams();

    useEffect(() => {
        getDataChat(params)
            .then((res) => {
                setDataChat(res.data.data)
            })
            .catch((err) => {
                navigate("/")
            })
        getMessages(params).then((res) => {
            setListMessage(res.data.data);
        }).catch((err) => {
            setListMessage([])
        });
    }, [params]);
    const handelShowIcon = () => {
        setShowIcon(!showIcon);
    };

    socket.on("operationHandling", () => {
        getDataChat(params)
            .then((res) => {
                setDataChat(res.data.data)
            })
            .catch((err) => {
                navigate("/")
            })
    })

    const handleEmojiClick = (emoji) => {
        let msg = message;
        msg += emoji.emoji;
        setMessage(msg);
    }

    const handleSendMessage = () => {
        if (message !== "") {
            sendMessage(params, message).then((res) => {
                let receivers = [];
                dataChat.member.forEach((user) => {
                    if (userData.id !== user.id) {
                        receivers.push(user.id)
                    }
                })
                let messageSend = res.data.data
                if (res.data.message === "new message") {
                    socket.emit("sendMessage", messageSend, receivers)
                } else {
                    if (dataChat.isGroup) {
                        socket.emit("sendMessage", messageSend, receivers)
                    } else {
                        socket.emit("newChat", dataChat, receivers, userData)
                    }
                }
                setListMessage([...listMessage, messageSend]);
            })
            setMessage("")
        }
    }

    socket.on("newMessage", (newMessage) => {
        if (params.id === newMessage.room) {
            setListMessage([...listMessage, newMessage])
        } else {
            getChats(dispatch)
        }
    })

    return (
        <div className="grid grid-cols-1 h-full">
            <div className="h-20" style={{ backgroundColor: "#000000" }}>
                <ThemeProvider theme={darkTheme}>
                <ListItem>
                    <ListItemAvatar>
                        {dataChat?.online? (
                            <StyledBadgeOnline
                                overlap="circular"
                                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                                variant="dot"
                            >
                                <Avatar alt="avatar" src={dataChat?.avatar[0]}/>
                            </StyledBadgeOnline>
                        ) : (
                            <StyledBadgeOffline
                                overlap="circular"
                                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                                variant="dot"
                            >
                                <Avatar alt="avatar" src={dataChat?.avatar[0]}/>
                            </StyledBadgeOffline>
                        )}
                    </ListItemAvatar>
                    {dataChat?.isGroup? (
                        <ListItemText primary={<b><h1 style={{color: "white"}}>{dataChat?.name}</h1></b>}
                        />
                    ): (
                        <ListItemText primary={<b><h1 style={{color: "white"}}>{dataChat?.name}</h1></b>}
                        secondary={dataChat?.online? "Online" : moment(dataChat?.lastActivity).fromNow()}
                    />
                    )}

                    <IconButton aria-label="upload picture" component="label">
                        <PhoneIcon style={{height: "30px", width: "30px"}}/>
                    </IconButton>
                    <IconButton aria-label="upload picture" component="label">
                        <VideocamIcon style={{height: "30px", width: "30px"}}/>
                    </IconButton>
                </ListItem>
                </ThemeProvider>
            </div>
            <div className= "h-[calc(100vh_-_80px)]">
                <ScrollToBottom className="scrollToBottom">
                    {listMessage.map((message, index) => (
                        userData?.id !== message.userSend?.id ? (
                            <div className="flex items-end gap-2 max-w-xs pb-2.5 ml-2.5"
                                 key={index}>
                                <img
                                    draggable="false"
                                    className="w-8 h-8 rounded-full object-cover mb-1.5"
                                    src={message.userSend.avatar}
                                    alt="avatar"
                                />
                                <span
                                    className="px-4 py-3 text-sm bg-gray-200 rounded-3xl max-w-xs overflow-hidden">
                   {message.content}
                  </span>
                            </div>
                        ) : (
                            <div className="flex gap-2 pb-2.5 justify-end mr-2.5 mb-4"
                                 key={index}>
                   <span className="px-4 pt-3 pb-3 text-sm bg-gray-200 rounded-3xl max-w-xs overflow-hidden">
                     {message.content}
                   </span>
                                {/*<img*/}
                                {/*    draggable="false"*/}
                                {/*    className="w-8 h-8 rounded-full object-cover mt-1.5"*/}
                                {/*    src={message.userSend.avatar}*/}
                                {/*    alt="avatar"*/}
                                {/*/>*/}
                            </div>
                        )
                    ))}
                </ScrollToBottom>
                <div className="rounded-3xl border-solid border-2 mt-3"
                     style={{height: 45, backgroundColor: "#1c1a1a", borderColor: "yellow"}}>
                    {/*<div>*/}
                    {/*    {showIcon&&*/}
                    {/*        <Picker emojiStyle={"facebook"} onEmojiClick={( emoji) => handleEmojiClick( emoji)} />*/}
                    {/*    }*/}
                    {/*</div>*/}
                    <AddReactionIcon onClick={handelShowIcon} className="ml-3 mr-2.5" style={{height: 30, width: 30, color: "yellow"}} />
                    <input className="h-8 w-5/6 mr-2 focus:outline-none"
                           style={{marginTop: "5px"}}
                           value={message}
                           onChange={(e) => setMessage(e.target.value)}
                           onKeyUp={(e) => {
                               if (e.keyCode === 13) {
                                   e.preventDefault();
                                   handleSendMessage();
                               }
                           }}/>
                    <Button variant="contained" style={{marginBottom: 5, marginLeft: 6, backgroundColor: "yellow", color: "blue"}} endIcon={<SendIcon/>} onClick={handleSendMessage}/>
                </div>
            </div>
        </div>
    )
}