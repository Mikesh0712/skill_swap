const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://skillswap-backend-akav.onrender.com/auth/signup', {
      name: 'Test Name',
      username: 'test_user_xyz',
      email: 'test_xyz@test.com',
      phone: '1234567890',
      password: 'TestPassword@123'
    });
    console.log("SUCCESS:", res.status, res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.status : err.message);
    if (err.response) console.error(err.response.data);
  }
}

test();
