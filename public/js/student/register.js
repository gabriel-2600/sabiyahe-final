const formRegister = document.getElementById('form-register');

formRegister.addEventListener('submit', (event) => {
    event.preventDefault();

    const firstnameRegister = document.getElementById('firstname-register').value;
    const lastnameRegister = document.getElementById('lastname-register').value;
    const emailRegister = document.getElementById('email-register').value;
    const usernameRegister = document.getElementById('username-register').value;
    const passwordRegister = document.getElementById('password-register').value;

    const register = {
        fullname: `${firstnameRegister} ${lastnameRegister}`,
        email: emailRegister,
        username: usernameRegister,
        password: passwordRegister,
    };

    // Register logic here
    fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(register),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res =>  res.json())
        .then(data => {
            const errorRegister = document.getElementById('error-register');
            const successRegister = document.getElementById('success-register');

            if (data.status === 'error') {
                successRegister.style.display = 'none';
                errorRegister.style.display = 'block';
                errorRegister.innerText = data.error;
            } else {
                errorRegister.style.display = 'none';
                successRegister.style.display = 'block';
                successRegister.innerText = data.success;
            }
        });
});