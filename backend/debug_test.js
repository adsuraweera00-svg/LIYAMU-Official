import axios from 'axios';

const test = async () => {
  try {
    // 1. Login to get token
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'reader@demo.com',
      password: 'reader123'
    });
    const token = login.data.token;
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    console.log('Login Success. Token acquired.');

    // 2. Try Reading Progress (using the ID from the subagent's fail)
    const bookId = '69ccd31bbbfe905200b57c8a'; 
    try {
      console.log('Testing Reading Progress...');
      const res = await axios.put(`http://localhost:5000/api/users/reading-progress/${bookId}`, {}, auth);
      console.log('Reading Progress Result:', res.data);
    } catch (err) {
      console.error('Reading Progress Failed:', err.response?.data || err.message);
    }

    // 3. Try Follow
    const authorId = '69ccd182a7f88d4cd825042d';
    try {
      console.log('Testing Follow...');
      const res = await axios.post(`http://localhost:5000/api/users/follow/${authorId}`, {}, auth);
      console.log('Follow Result:', res.data);
    } catch (err) {
      console.error('Follow Failed:', err.response?.data || err.message);
    }

  } catch (err) {
    console.error('Test Script Error:', err.response?.data || err.message);
  }
};

test();
