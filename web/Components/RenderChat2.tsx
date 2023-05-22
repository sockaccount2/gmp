"use client";

import { useFriend } from "@/hooks/useFriends";
import { useUser } from "@/hooks/useUser";
import { chatSocket, socket, userSocket } from "@/lib/socket";
import { ChatConversationType, ChatMessageType, IUser } from "@/types/users";
import { UserState } from "@/types/users";
import { Popover, PopoverContent, PopoverTrigger } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

var timer: NodeJS.Timeout;
export const RenderChatMesages = (props: {
  conversation: ChatConversationType;
  isFriend?: boolean;
}) => {
  const { user } = useUser();
  const friend = useFriend();

  useEffect(() => {
    if (user) {
      const friendId = props.conversation.users.find((i) => i.id != user.id);
      if (friendId) {
        friend.setFriendId(friendId.id);
        setAllChat(props.conversation);
      }
    }
  }, [user.id]);
  const [currentChat, setCurrentChat] = useState<string>("");
  const documentRef = useRef<HTMLFormElement>(null);
  const [allChat, setAllChat] = useState<ChatConversationType>(
    props.conversation
  );
  console.log(props.conversation);
  const [receiverState, setReceiverState] = useState<UserState>(
    UserState.online
  );
  useEffect(() => {
    chatSocket.auth = {
      user: user,
      roomId: props.conversation.id,
    };
    chatSocket.connect();

    chatSocket.emit("join_room", chatSocket.auth.roomId);
    chatSocket.on("user_joined", (data) => {
      console.log(data);
    });
    chatSocket.on("state_change", (data) => {
      setReceiverState(data.state);
    });
    chatSocket.on("receive_message", (data: ChatMessageType, callback) => {
      if (callback) {
        callback(null, {
          received: true,
        });
      }
      setAllChat((prev) => {
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              created: new Date().toISOString(),
              userId: data.userId,
              id: data.id,
              message: data.message,
            },
          ],
        };
      });
    });
    return () => {
      if (chatSocket) {
        chatSocket.disconnect();
      }
    };
  }, [socket]);

  const isFriend = useMemo(() => {
    return !!props.isFriend;
  }, [props.isFriend]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleNewMessage = (e: HTMLFormElement) => {
    e.preventDefault();
    if (currentChat.length < 1) return;
    chatSocket.emit("send_message", {
      message: currentChat,
      userId: user.id,
    });
    setCurrentChat("");

    chatSocket.emit("state_change", UserState.online);
  };
  const handleChange = (e: string) => {
    setCurrentChat(e);
    chatSocket.emit("state_change", UserState.typing);
  };

  useEffect(() => {
    let es = currentChat;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      if (es == currentChat) {
        chatSocket.emit("state_change", UserState.online);
      }
    }, 1000);
  }, [currentChat]);

  const handleAddFriend = () => {
    friend.sendFriendRequest(friend.id);
  };

  return (
    <div>
      <div className="sticky top-0 flex justify-between bg-red-300">
        <div className="flex gap-2">
          <p>{friend.friend?.username}</p>
          {!isFriend && <button onClick={handleAddFriend}>add friend</button>}
          <div></div>
          {receiverState.toString() !== "[Object Object]" && (
            <div>{receiverState.toString()}</div>
          )}
        </div>

        <Popover>
          <PopoverTrigger>
            <div>Invite to game</div>
          </PopoverTrigger>
          <PopoverContent className="flex gap-2">
            <div
              onClick={() => {
                friend.sendInvite("connect Four");
              }}
            >
              connect4
            </div>
            <div
              onClick={() => {
                friend.sendInvite("Tic Tac Toe");
              }}
            >
              tic tac toe
            </div>
            <div
              onClick={() => {
                friend.sendInvite("Rock Paper Scissors");
              }}
            >
              rock paper scissors
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2 px-6 text-white">
        {allChat.messages &&
          allChat?.messages.map((message, i) => {
            if (message.userId === user.id) {
              return (
                <div key={i + message.created} className="flex justify-end">
                  <div className=" bg-blue-700 flex items-center p-1 rounded-full right-0 w-fit space-x-2">
                    <div className="flex text-sm text-gray-400/50">
                      <p>{new Date(message.created).getHours()} : </p>
                      <p>{new Date(message.created).getMinutes()}</p>
                    </div>
                    <p>{message.message}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={i + message.created} className="flex justify-start">
                  <div className=" bg-blue-700 flex items-center p-1 rounded-full right-0 w-fit space-x-2">
                    <div className="flex text-sm text-gray-400/50">
                      <p>{new Date(message.created).getHours()} : </p>
                      <p>{new Date(message.created).getMinutes()}</p>
                    </div>
                    <p>{message.message}</p>
                  </div>
                </div>
              );
              // }
            }
          })}
      </div>
      <div className="px-6">
        <form ref={documentRef} onSubmit={handleNewMessage}>
          <input
            className="w-full mt-2"
            value={currentChat}
            onChange={(e) => {
              handleChange(e.target.value);
            }}
            ref={inputRef}
            type="text"
          />
        </form>
      </div>
    </div>
  );
};
