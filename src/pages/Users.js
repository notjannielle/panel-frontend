import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_ADMIN_SERVER}/api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <ul>
        {users.map(user => (
          <li key={user._id} className="mb-2 p-2 border rounded">
            <p>Name: {user.fullName}</p>
            <p>Phone: {user.phoneNumber}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
