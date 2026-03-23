const axios = require('axios');
async function test() {
  try {
     await axios.post('http://localhost:8080/api/users/register', {email: 'test@123.com', password: 'password', role: 'ROLE_USER'});
  } catch (e) {}
  
  try {
    const res = await axios.post('http://localhost:8080/api/users/login', {email: 'test@123.com', password: 'password'});
    const token = res.data.token;

    const flights = await axios.get('http://localhost:8080/api/flights');
    const flightId = flights.data[0].id;

    console.log('Attempting to book flight:', flightId);
    
    const bookRes = await axios.post('http://localhost:8080/api/bookings', {
      flightId, seatNumber: '1A', flightClass: 'ECONOMY', paymentMethod: 'ONLINE'
    }, { headers: { Authorization: 'Bearer ' + token }});
    console.log("Book Success:", bookRes.data);

    console.log('Attempting to cancel booking:', bookRes.data.id);
    const cancelRes = await axios.put(`http://localhost:8080/api/bookings/${bookRes.data.id}/cancel`, {}, { headers: { Authorization: 'Bearer ' + token }});
    console.log("Cancel Success:", cancelRes.status);
    
  } catch (e) {
    console.log("Error:", e.response ? e.response.status : e.message, e.response ? JSON.stringify(e.response.data) : '');
  }
}
test();
