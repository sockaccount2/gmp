/// <reference types="react" />
import { ChildrenType } from "@/types";
import { IFriend as Friend } from "../../shared/src/types/users";
import { GameNames } from "../../shared/src/types/game";
export type FriendsContext = {
    friends: Friend[];
    addFriend: (friend: Friend) => void;
    getFriends: (userId: string) => Promise<Friend[]>;
    getFriend: (id: string) => Promise<Friend | undefined>;
    updateFriend: (id: string, friend: Friend) => void;
    removeFriend: (id: string) => void;
};
export declare const FriendsContext: import("react").Context<FriendsContext | null>;
export declare const FriendsProvider: ({ children }: {
    children: ChildrenType;
}) => JSX.Element;
export declare const useFriends: () => FriendsContext | null;
export declare const useFriend: (id?: string) => {
    setFriendId: import("react").Dispatch<import("react").SetStateAction<string | null | undefined>>;
    id: string | null | undefined;
    friend: Friend | null;
    sendFriendRequest: (userId: string) => void;
    sendInvite: (gameName: GameNames) => void;
};
//# sourceMappingURL=useFriends.d.ts.map