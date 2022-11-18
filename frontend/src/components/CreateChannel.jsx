import React, { useState } from "react";
import { useChatContext } from "stream-chat-react";

import { UserList } from "./";
import { CloseCreateChannel } from "../assets";

const ChannelNameInput = ({ channelName = "", eror, setChannelName }) => {
  const handleChange = (event) => {
    event.preventDefault();

    setChannelName(event.target.value);
  };

  return (
    <div className="channel-name-input__wrapper">
      <p>Name</p>
      <input
        value={channelName}
        onChange={handleChange}
        placeholder="channel-name"
      />
      {eror && (
        <h6 className="channel-name-input__errormsg">
          please enter a valid channel name
        </h6>
      )}
      <p>Add Members</p>
    </div>
  );
};

const CreateChannel = ({ createType, setIsCreating }) => {
  const { client, setActiveChannel } = useChatContext();
  const [selectedUsers, setSelectedUsers] = useState([client.user || ""]);
  const [channelName, setChannelName] = useState("");
  const [eror, setError] = useState(false);

  const setAddUsers = () => {};

  const createChannel = async (e) => {
    e.preventDefault();
    if (channelName === "" && createType==='team') {
      setError(true);
      return;
    }
    try {
      const newselectedUsers = selectedUsers.map((user) => {
        return user.id;
      });

      const newChannel = await client.channel(createType, channelName, {
        name: channelName,
        members: newselectedUsers,
      });

      await newChannel.watch();

      setChannelName("");
      setIsCreating(false);
      setSelectedUsers([client]);
      setActiveChannel(newChannel);
    } catch (error) {}
  };

  return (
    <div className="create-channel__container">
      <div className="create-channel__header">
        <p>
          {createType === "team"
            ? "Create a New Channel"
            : "Send a Direct Message"}
        </p>
        <CloseCreateChannel setIsCreating={setIsCreating} />
      </div>
      {createType === "team" && (
        <ChannelNameInput
          channelName={channelName}
          eror={eror}
          setChannelName={setChannelName}
        />
      )}
      <UserList
        setSelectedUsers={setSelectedUsers}
        setAddUsers={setAddUsers}
        members={[client.user]}
      />
      <div className="create-channel__button-wrapper" onClick={createChannel}>
        <p>
          {createType === "team" ? "Create Channel" : "Create Message Group"}
        </p>
      </div>
    </div>
  );
};

export default CreateChannel;
