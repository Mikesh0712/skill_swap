import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('https://skillswap-backend-akav.onrender.com/auth/signup', {
      name: 'Test Name',
      username: 'testuserabc' + Math.floor(Math.random() * 1000),
      email: 'testabc' + Math.floor(Math.random() * 1000) + '@test.com',
      phone: '1234567890',
      password: 'TestPassword@123'
    });
    console.log("SUCCESS:", res.status, res.data);
    console.log("COOKIES:", res.headers['set-cookie']);
  } catch (err) {
    console.error("ERROR STATUS:", err.response ? err.response.status : err.message);
    if (err.response) console.error("ERROR DATA:", err.response.data);
  }
}

test();
