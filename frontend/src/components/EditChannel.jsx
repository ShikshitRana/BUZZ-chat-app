import React, { useState, useEffect } from "react";
import { useChatContext } from "stream-chat-react";

import { UserList } from "./";
import { CloseCreateChannel } from "../assets";
import logo from "../assets/delete.png";

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

const EditChannel = ({ setIsEditing }) => {
  const { client, channel } = useChatContext();
  const [channelName, setChannelName] = useState(channel?.data?.name);
  const [owner, setOwner] = useState(false);

  const [removeUsers, setRemoveUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [members, setMembers] = useState([]);
  //console.log(client.user.id);
  const [eror, setError] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const isadmin = await channel.queryMembers({ user_id: client.user.id });
        if (isadmin.members[0].role === "owner") {
          setOwner(true);
        }

        const response = await channel.queryMembers({});

        let prevMembers = response.members.map((user) => {
          return user.user;
        });

        // prevMembers = prevMembers.filter((user) => user.id !== client.user.id);

        setMembers((prevUsers) => [...prevUsers, ...prevMembers]);
      } catch (error) {
        console.log(error);
        setError(true);
      }
    };

    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateChannel = async (event) => {
    event.preventDefault();

    if (channelName === "") {
      setError(true);
      return;
    }

    const nameChanged = channelName !== (channel.data.name || channel.data.id);

    if (nameChanged) {
      await channel.update(
        { name: channelName },
        { text: `Channel name changed to ${channelName}` }
      );
    }
    // Adding Users
    const newselectedUsers = selectedUsers.map((user) => {
      return user.id;
    });

    if (newselectedUsers.length) {
      await channel.addMembers(newselectedUsers);
    }

    // Removing Users

    const newremoveUsers = removeUsers.map((user) => {
      return user.id;
    });

    if (newremoveUsers.length) {
      await channel.removeMembers(newremoveUsers);
    }

    setChannelName(null);
    setIsEditing(false);
    setSelectedUsers([]);
    setRemoveUsers([]);
    setMembers([]);
  };

  const deleteHandler = async () => {
    const destroy = await channel.delete();
    console.log(destroy);
    window.location.reload();
  };

  return (
    <div className="edit-channel__container">
      <div className="edit-channel__header">
        <p>Edit Channel</p>
        <div className="edit-channel__header-right">
          {owner && (
            <img src={logo} alt="delete" className="edit-channel__header-delete" onClick={deleteHandler} />
          )}
          <CloseCreateChannel setIsEditing={setIsEditing} />
        </div>
      </div>
      <ChannelNameInput
        channelName={channelName}
        eror={eror}
        setChannelName={setChannelName}
      />

      {members.length !== 0 &&
        (owner ? (
          <UserList
            setSelectedUsers={setSelectedUsers}
            setRemoveUsers={setRemoveUsers}
            members={members}
          />
        ) : (
          <UserList
            setSelectedUsers={() => {}}
            setRemoveUsers={() => {}}
            members={members}
          />
        ))}

      {owner ? (
        <div className="edit-channel__button-wrapper" onClick={updateChannel}>
          <p>Save Changes</p>
        </div>
      ) : (
        <div className="edit-channel__button-wrapper">
          <p>Only admin can make changes</p>
        </div>
      )}
    </div>
  );
};

export default EditChannel;
