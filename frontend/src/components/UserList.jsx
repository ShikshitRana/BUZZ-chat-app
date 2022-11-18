import React, { useEffect, useState } from "react";
import { Avatar, useChatContext } from "stream-chat-react";

import { InviteIcon } from "../assets";

const ListContainer = ({ children }) => {
  return (
    <div className="user-list__container">
      <div className="user-list__header">
        <p>User</p>
        <p>Invite</p>
      </div>
      {children}
    </div>
  );
};

const UserItem = ({ user, setSelectedUsers }) => {
  const [selected, setSelected] = useState(false);

  const handleSelect = () => {
    if (selected) {
      setSelectedUsers((prevUsers) =>
        prevUsers.filter((prevUser) => prevUser !== user)
      );
    } else {
      setSelectedUsers((prevUsers) => [...prevUsers, user]);
    }

    setSelected((prevSelected) => !prevSelected);
  };

  return (
    <div className="user-item__wrapper" onClick={handleSelect}>
      <div className="user-item__name-wrapper">
        <Avatar image={user.image} name={user.fullName || user.id} size={32} />
        <p className="user-item__name">{user.fullName || user.id}</p>
      </div>
      {selected ? <InviteIcon /> : <div className="user-item__invite-empty" />}
    </div>
  );
};

const UserSelectedItem = ({ user, setRemoveUsers }) => {
  const [selected, setSelected] = useState(true);

  const handleSelect = () => {
    if (selected) {
      console.log("removed");

      setRemoveUsers((prevUsers) => {
        console.log(prevUsers);
        return [...prevUsers, user];
      });
    } else {
      console.log("added");

      setRemoveUsers((prevUsers) => {
        console.log(prevUsers);
        return prevUsers.filter((prevUser) => prevUser !== user);
      });
    }

    setSelected((prevSelected) => !prevSelected);
  };

  return (
    <div className="user-item__wrapper" onClick={handleSelect}>
      <div className="user-item__name-wrapper">
        <Avatar image={user.image} name={user.fullName || user.id} size={32} />
        <p className="user-item__name">{user.fullName || user.id}</p>
      </div>
      {selected ? <InviteIcon /> : <div className="user-item__invite-empty" />}
    </div>
  );
};

const UserList = ({ members, setSelectedUsers, setRemoveUsers }) => {
  const { client } = useChatContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listEmpty, setListEmpty] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      if (loading) return;

      setLoading(true);

      try {
        const newselectedUsers = members.map((user) => {
          return user.id;
        });
        newselectedUsers.push("hiiii");
        let response = await client.queryUsers({
          id: { $nin: newselectedUsers },
        });

        response = response.users.filter((user) => user.id !== client.user.id);

        if (response) {
          //console.log(response.users);
          setUsers(response);
        } else {
          setListEmpty(true);
        }
      } catch (error) {
        console.log(error);
        setError(true);
      }
      setLoading(false);
    };

    if (client) getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <ListContainer>
        <div className="user-list__message">
          Error loading, please refresh and try again.
        </div>
      </ListContainer>
    );
  }

  if (listEmpty) {
    return (
      <ListContainer>
        <div className="user-list__message">No users found.</div>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      {loading ? (
        <div className="user-list__message">Loading previous users...</div>
      ) : (
        ((members = members.filter((user) => user.id !== client.user.id)),
        members?.map((user, i) => (
          <UserSelectedItem
            index={i}
            key={user.id}
            user={user}
            setRemoveUsers={setRemoveUsers}
          />
        )))
      )}

      {loading ? (
        <div className="user-list__message">Loading users...</div>
      ) : (
        users?.map((user, i) => (
          <UserItem
            index={i}
            key={user.id}
            user={user}
            setSelectedUsers={setSelectedUsers}
          />
        ))
      )}
    </ListContainer>
  );
};

export default UserList;
