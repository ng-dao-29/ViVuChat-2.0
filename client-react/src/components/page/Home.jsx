import {useEffect} from "react";
import {Grid} from "@mui/material";
import {styled} from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import ListChat from "../Chat/ListChat";
import ChatStart from "../Chat/chatStart";
import {useDispatch, useSelector} from "react-redux";
import socket from "../../config/socket";
import {addChat} from "../../redux/chatSlice";
import {getChats, readMessage} from "../../services/chatService";
import {useParams} from "react-router-dom";

const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    height: theme.spacing(98),
}));

export default function Home({children}) {
    const dispatch = useDispatch()
    const {userData} = useSelector((state) => state.auth.user);
    const params = useParams();

    useEffect(() => {
        socket.on("newChat", (newChat) => {
            if (!params.id) {
                getChats(dispatch)
            }
        })
        socket.on("newMessage", (newMessage) => {
            if (!params.id) {
                getChats(dispatch)
            }
        })
    }, [])

    useEffect(() => {
        if (userData) {
            socket.emit("setUpUser", userData.id);
        }
    }, [userData])

    return (
        <div
            className="h-screen bg-[url('https://img2.thuthuat123.com/uploads/2019/11/19/anh-background-bau-troi-dem_122621961.jpg')]">
            <Grid container spacing={0.1} className=" rounded-lg h-full">
                <Grid item xs={3} sx={{backgroundColor: "rgba(30,28,28,0.93)", p: 0}}>
                    <ListChat/>
                </Grid>
                <Grid item xs={9} >
                    <Grid className="bg-[rgba(30,28,28,0.93)] h-full" sx={{backgroundColor: "rgba(30,28,28,0.68)"}}>
                        {children ? children : <ChatStart/>}
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}