const token = localStorage.getItem('auth-token');
console.log('Token:', token);

if (token) {
  fetch('http://localhost:3000/it/api/teams', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(r => r.json())
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e));
}
